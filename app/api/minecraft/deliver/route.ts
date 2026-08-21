import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { sendMinecraftCommand } from '@/minecraft/deliverCommand';

// Bu endpoint bir cron job (Vercel Cron veya GitHub Actions scheduled
// workflow) tarafından düzenli aralıklarla çağrılmalı, örn. her 1 dakikada.
// Basit bir secret ile korunuyor; gerçek kurulumda CRON_SECRET eklenmeli.
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.MINECRAFT_API_SECRET}`) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const db = createAdminClient();

  const { data: pending } = await db
    .from('deliveries')
    .select('*, users(minecraft_nick)')
    .in('status', ['pending', 'failed'])
    .lt('attempts', 5)
    .limit(20);

  const results = [];

  for (const delivery of pending ?? []) {
    await db.from('deliveries').update({ status: 'processing' }).eq('id', delivery.id);

    const command = delivery.command.replace('{PLAYER}', delivery.users.minecraft_nick);
    const result = await sendMinecraftCommand(command);

    if (result.ok) {
      await db.from('deliveries').update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        attempts: delivery.attempts + 1,
      }).eq('id', delivery.id);

      await db.from('audit_logs').insert({
        actor_type: 'system', action: 'vip_delivered',
        target_type: 'delivery', target_id: delivery.id,
      });
    } else {
      await db.from('deliveries').update({
        status: 'failed',
        attempts: delivery.attempts + 1,
        last_error: result.error,
      }).eq('id', delivery.id);
    }

    results.push({ id: delivery.id, ok: result.ok });
  }

  return NextResponse.json({ processed: results.length, results });
}
