import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUndefinedAuthor() {
  const testRecord = {
    id: 'test-undef-author-' + Date.now(),
    couple_id: 'andrea-tonet',
    author_id: undefined, // undefined!
    title: 'Test Place Undef Author',
    subtitle: 'Valencia',
    city_name: 'Valencia',
    country: 'España',
    country_code: 'ES',
    lat: 39.4699,
    lng: -0.3763,
    date: '2025-01-01',
    story: 'Test story',
    category: 'memory',
    mood_tag: '{}',
    photos: [],
    location_precision: 'exact',
    visibility: 'couple',
    is_milestone: false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client.from('map_places').upsert(testRecord).select();
  if (error) {
    console.error('❌ Error with undefined author:', error);
  } else {
    console.log('✅ Success with undefined author:', data);
  }
}

testUndefinedAuthor().catch(console.error);
