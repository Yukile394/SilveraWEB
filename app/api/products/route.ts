import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');

  let query = supabase.from('products').select('*').eq('is_active', true);
  if (category) query = query.eq('category', category);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Ürünler alınamadı' }, { status: 500 });

  return NextResponse.json({ products: data });
}
