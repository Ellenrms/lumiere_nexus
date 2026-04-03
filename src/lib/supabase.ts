import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize only if keys are present to avoid build-time crashes
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. If this is a build environment, ensure they are set in the platform settings.');
}

/**
 * Creates a non-persistent Supabase client.
 * Useful for operations that shouldn't affect the current user session (e.g., admin creating users).
 */
export const createTempClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) return null as any;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
};
