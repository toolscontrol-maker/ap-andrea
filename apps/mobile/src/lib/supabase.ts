import { createClient } from '@supabase/supabase-js';
import { SecureStorage } from './storage';

// In production, these should come from Constants.expoConfig?.extra or env
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key) => SecureStorage.getItem(key),
      setItem: (key, value) => SecureStorage.setItem(key, value),
      removeItem: (key) => SecureStorage.removeItem(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
