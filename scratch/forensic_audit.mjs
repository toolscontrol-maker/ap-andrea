import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runForensicAudit() {
  console.log('====================================================');
  console.log('🔍 FORENSIC AUDIT OF SUPABASE CLOUD (qxnsksrdqmrsjsqxyxtq)');
  console.log('====================================================\n');

  // 1. COUPLES
  console.log('--- 1. TABLE: couples ---');
  const { data: couples, error: cErr } = await client.from('couples').select('*');
  console.log('Couples count:', couples?.length, 'Error:', cErr);
  console.log('Couples data:', JSON.stringify(couples, null, 2));

  // 2. PROFILES
  console.log('\n--- 2. TABLE: profiles ---');
  const { data: profiles, error: pErr } = await client.from('profiles').select('*');
  console.log('Profiles count:', profiles?.length, 'Error:', pErr);
  if (profiles) {
    profiles.forEach(p => {
      console.log(`- Profile [${p.id}]: role_key="${p.role_key}", couple_id="${p.couple_id}", name="${p.name}", avatar_photo_len=${p.avatar_photo?.length || 0}`);
    });
  }

  // 3. MAP PLACES
  console.log('\n--- 3. TABLE: map_places ---');
  const { data: mapPlaces, error: mErr } = await client.from('map_places').select('*');
  console.log('Map places count:', mapPlaces?.length, 'Error:', mErr);
  if (mapPlaces) {
    mapPlaces.slice(0, 5).forEach(m => {
      console.log(`- Place [${m.id}]: couple_id="${m.couple_id}", title="${m.title}", cat="${m.category}", photos=${m.photos?.length}`);
    });
  }

  // 4. WISHES
  console.log('\n--- 4. TABLE: wishes ---');
  const { data: wishes, error: wErr } = await client.from('wishes').select('*');
  console.log('Wishes count:', wishes?.length, 'Error:', wErr);

  // 5. SAVED PLACES
  console.log('\n--- 5. TABLE: saved_places ---');
  const { data: savedPlaces, error: spErr } = await client.from('saved_places').select('*');
  console.log('Saved places count:', savedPlaces?.length, 'Error:', spErr);

  // 6. COUPLE EVENTS
  console.log('\n--- 6. TABLE: couple_events ---');
  const { data: events, error: eErr } = await client.from('couple_events').select('*');
  console.log('Events count:', events?.length, 'Error:', eErr);

  // 7. TEST UPSERT PROFILE
  console.log('\n--- 7. TEST UPSERT PROFILE ---');
  const testProf = {
    id: '11111111-aaaa-bbbb-cccc-111111111111',
    couple_id: 'andrea-tonet',
    role_key: 'user1',
    name: 'Tonet',
    avatar: 'T',
    avatar_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop',
    role_description: 'Quien suele iniciar planes y documentar detalles',
    updated_at: new Date().toISOString(),
  };
  const { data: upData, error: upErr } = await client.from('profiles').upsert(testProf, { onConflict: 'id' }).select();
  console.log('Profile upsert result:', upData, 'Error:', upErr);
}

runForensicAudit();
