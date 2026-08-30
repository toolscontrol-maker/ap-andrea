import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function syncAll() {
  console.log('Testing Supabase Cloud Profiles & Map Places Sync...');

  // 1. Check Profiles
  const { data: profiles, error: pErr } = await client.from('profiles').select('*');
  console.log('Current profiles in DB:', profiles, 'Error:', pErr);

  // 2. Ensure Tonet & Andrea have valid records
  const user1 = {
    id: '11111111-aaaa-bbbb-cccc-111111111111',
    couple_id: 'andrea-tonet',
    role_key: 'user1',
    name: 'Tonet',
    avatar: 'T',
    avatar_photo: profiles?.find(p => p.role_key === 'user1')?.avatar_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop',
    role_description: 'Quien suele iniciar planes y documentar detalles',
    updated_at: new Date().toISOString(),
  };

  const user2 = {
    id: '22222222-dddd-eeee-ffff-222222222222',
    couple_id: 'andrea-tonet',
    role_key: 'user2',
    name: 'Andrea',
    avatar: 'A',
    avatar_photo: profiles?.find(p => p.role_key === 'user2')?.avatar_photo || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop',
    role_description: 'Quien da significado y aporta calidez espontánea',
    updated_at: new Date().toISOString(),
  };

  const { error: upsertErr } = await client.from('profiles').upsert([user1, user2], { onConflict: 'id' });
  console.log('Profiles upsert status:', upsertErr ? upsertErr : 'SUCCESS');

  // 3. Check map_places
  const { data: mapPlaces, error: mErr } = await client.from('map_places').select('id, title, category, mood_tag');
  console.log('Map places count in DB:', mapPlaces?.length, 'Error:', mErr);
}

syncAll();
