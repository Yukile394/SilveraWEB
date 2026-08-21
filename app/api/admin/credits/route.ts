import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth/session';

const schema = z.object({
  user_id: z.string().uuid(),
  amount: z.number().int().refine((n) => n !== 0),
  description: z.string().min(1),
});

// Sadece role: 'admin' olan kullanıcılar erişebilir. Her işlem audit_logs'a düşer.
export async function POST(req: NextRequest) {
  const token = req.cookies.get('silvera_session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });

  const { user_id, amount, description } = parsed.data;
  const db = createAdminClient();

  if (amount > 0) {
    await db.rpc('add_credits', {
      p_user_id: user_id, p_amount: amount, p_type: 'admin_adjustment',
      p_reference_id: null, p_description: description,
    });
  } else {
    const { error } = await db.rpc('spend_credits', {
      p_user_id: user_id, p_amount: Math.abs(amount),
      p_reference_id: null, p_description: description,
    });
    if (error) return NextResponse.json({ error: 'Yetersiz bakiye' }, { status: 400 });
  }

  await db.from('audit_logs').insert({
    actor_type: 'admin', actor_id: session.sub, action: 'admin_credit_adjustment',
    target_type: 'user', target_id: user_id, metadata: { amount, description },
  });

  return NextResponse.json({ success: true });
}
