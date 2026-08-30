import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const COUPLE_ID = 'andrea-tonet';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRitualSeeds() {
  const { data, error } = await client.from('ritual_seeds').select('*').limit(1);
  console.log('ritual_seeds select:', data, 'Error:', error);

  const testSeed = {
    id: 'seed-test-' + Date.now(),
    couple_id: COUPLE_ID,
    author_id: '11111111-aaaa-bbbb-cccc-111111111111',
    type: 'gratitude_note',
    title: 'Nota de gratitud',
    body: 'Test seed body',
    photo_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop',
    mood: 'love',
    updated_at: new Date().toISOString(),
  };

  const { data: upsertData, error: upsertErr } = await client.from('ritual_seeds').upsert(testSeed).select();
  console.log('ritual_seeds upsert:', upsertData, 'Error:', upsertErr);

  if (!upsertErr) {
    await client.from('ritual_seeds').delete().eq('id', testSeed.id);
  }
}

checkRitualSeeds();
