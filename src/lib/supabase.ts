import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or use the provided defaults
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://lpkngiowboplfhpoymga.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_gusFzXyj5UlEmjLfVK2Qyg_tEeMiswq';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anonymous Key is missing. Please configure them in your environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
