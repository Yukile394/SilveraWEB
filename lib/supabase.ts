import { createClient } from '@supabase/supabase-js';

// Tarayıcı / genel kullanım için (kısıtlı yetki - anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
);

// SADECE backend/API route'larda kullanılmalı (tam yetki - service role key)
// Bu client'ı ASLA frontend/tarayıcı koduna import etme.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
    { auth: { persistSession: false } }
  );
}
