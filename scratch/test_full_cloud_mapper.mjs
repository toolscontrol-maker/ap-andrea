import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const COUPLE_ID = 'andrea-tonet';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function mapProfileFromDb(row) {
  return {
    id: row.id,
    name: row.name || (row.role_key === 'user1' ? 'Tonet' : 'Andrea'),
    avatar: row.avatar || (row.name ? row.name[0].toUpperCase() : (row.role_key === 'user1' ? 'T' : 'A')),
    avatarPhoto: row.avatar_photo || row.avatarPhoto || undefined,
    roleDescription: row.role_description || row.roleDescription || '',
  };
}

async function runTest() {
  const [
    { data: profilesData },
    { data: wishesData },
    { data: placesData },
    { data: mapPlacesData },
    { data: eventsData },
  ] = await Promise.all([
    client.from('profiles').select('*').eq('couple_id', COUPLE_ID),
    client.from('wishes').select('*').eq('couple_id', COUPLE_ID),
    client.from('saved_places').select('*').eq('couple_id', COUPLE_ID),
    client.from('map_places').select('*').eq('couple_id', COUPLE_ID),
    client.from('couple_events').select('*').eq('couple_id', COUPLE_ID),
  ]);

  let user1 = null;
  let user2 = null;

  if (profilesData && profilesData.length > 0) {
    for (const p of profilesData) {
      const mapped = mapProfileFromDb(p);
      if (p.role_key === 'user1' || p.name?.toLowerCase().includes('tonet')) {
        user1 = mapped;
      } else if (p.role_key === 'user2' || p.name?.toLowerCase().includes('andrea')) {
        user2 = mapped;
      }
    }
  }

  console.log('User1 mapped:', user1);
  console.log('User2 mapped:', user2);
  console.log('Wishes mapped count:', wishesData?.length);
  console.log('Saved places mapped count:', placesData?.length);
  console.log('Map places mapped count:', mapPlacesData?.length);
}

runTest();
