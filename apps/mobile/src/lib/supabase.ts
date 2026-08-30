import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { SecureStorage } from './storage';

const RAW_URL = 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://qxnsksrdqmrsjsqxyxtq.supabase.co';

const SUPABASE_URL = (RAW_URL.includes('vryzszsfdvhkyquuclcw') || !RAW_URL.includes('qxnsksrdqmrsjsqxyxtq'))
  ? 'https://qxnsksrdqmrsjsqxyxtq.supabase.co'
  : RAW_URL;

const RAW_KEY = 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bnNrc3JkcW1yc2pzcXh5eHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTI3NTcsImV4cCI6MjEwMzY2ODc1N30.8m5344vd4KAJixsz0H3xrY3iFdpou8AJRswtLXacdh8';

const SUPABASE_ANON_KEY = RAW_KEY.startsWith('eyJ') 
  ? RAW_KEY 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bnNrc3JkcW1yc2pzcXh5eHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTI3NTcsImV4cCI6MjEwMzY2ODc1N30.8m5344vd4KAJixsz0H3xrY3iFdpou8AJRswtLXacdh8';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('xyzcompany') &&
    SUPABASE_ANON_KEY !== 'public-anon-key'
  );
};

if (!isSupabaseConfigured() && __DEV__) {
  console.warn(
    '[Supabase] Las credenciales no están configuradas en .env. Andrea App continuará funcionando en modo LocalStorage seguro (Offline-First).'
  );
}

const storageAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return SecureStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    SecureStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    SecureStorage.removeItem(key);
  },
};

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);
