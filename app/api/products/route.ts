import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');

  try {
    let query = supabase.from('products').select('*').eq('is_active', true);
    if (category) query = query.eq('category', category);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ error: 'Ürünler alınamadı', detail: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data ?? [] });
  } catch (err) {
    // Supabase env değişkenleri eksik/yanlışsa buraya düşer.
    return NextResponse.json(
      { error: 'Veritabanına bağlanılamadı. Vercel ortam değişkenlerini kontrol et.', detail: (err as Error).message },
      { status: 500 }
    );
  }
}
