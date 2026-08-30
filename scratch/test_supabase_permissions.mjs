import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testPermissions() {
  console.log('--- TEST 1: SELECT map_places ---');
  const { data: selectData, error: selectError } = await client.from('map_places').select('*').limit(5);
  if (selectError) {
    console.error('❌ SELECT ERROR:', selectError);
  } else {
    console.log('✅ SELECT SUCCESS. Count:', selectData?.length);
  }

  console.log('\n--- TEST 2: INSERT/UPSERT map_places ---');
  const testRecord = {
    id: 'test-place-permission-' + Date.now(),
    couple_id: 'andrea-tonet',
    author_id: '11111111-aaaa-bbbb-cccc-111111111111',
    title: 'Test Place Permisos',
    subtitle: 'Valencia',
    city_name: 'Valencia',
    country: 'España',
    country_code: 'ES',
    lat: 39.4699,
    lng: -0.3763,
    date: '2025-01-01',
    story: 'Test story',
    category: 'memory',
    mood_tag: 'love',
    photos: [],
    location_precision: 'exact',
    visibility: 'couple',
    is_milestone: false,
    updated_at: new Date().toISOString(),
  };

  const { data: upsertData, error: upsertError } = await client
    .from('map_places')
    .upsert(testRecord)
    .select();

  if (upsertError) {
    console.error('❌ UPSERT ERROR (RLS or Constraint):', upsertError);
  } else {
    console.log('✅ UPSERT SUCCESS:', upsertData);
  }

  console.log('\n--- TEST 3: UPDATE existing place ---');
  if (selectData && selectData.length > 0) {
    const target = selectData[0];
    const { data: updateData, error: updateError } = await client
      .from('map_places')
      .update({ title: target.title + ' [Test Edit]' })
      .eq('id', target.id)
      .select();

    if (updateError) {
      console.error('❌ UPDATE ERROR:', updateError);
    } else {
      console.log('✅ UPDATE SUCCESS:', updateData);
      // Revert title
      await client.from('map_places').update({ title: target.title }).eq('id', target.id);
    }
  }
}

testPermissions().catch(console.error);
