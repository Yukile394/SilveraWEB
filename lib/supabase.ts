import { createClient } from '@supabase/supabase-js';

// Tarayıcı / genel kullanım için (kısıtlı yetki - anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// SADECE backend/API route'larda kullanılmalı (tam yetki - service role key)
// Bu client'ı ASLA frontend/tarayıcı koduna import etme.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
