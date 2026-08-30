import { AndreaRepository } from './AndreaRepository';
import { defaultLocalRepository } from './LocalAndreaRepository';
import { SupabaseAndreaRepository } from './SupabaseAndreaRepository';
import { isSupabaseConfigured } from '../lib/supabase';

export * from './AndreaRepository';
export * from './LocalAndreaRepository';
export * from './SupabaseAndreaRepository';

export function getAndreaRepository(coupleId?: string): AndreaRepository {
  const dataSource = process.env.EXPO_PUBLIC_DATA_SOURCE || 'local';

  if (dataSource === 'supabase' && isSupabaseConfigured() && coupleId) {
    return new SupabaseAndreaRepository(coupleId);
  }

  return defaultLocalRepository;
}
