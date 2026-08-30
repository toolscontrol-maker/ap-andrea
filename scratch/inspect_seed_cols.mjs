import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectRitualSeeds() {
  const { data, error } = await client.from('ritual_seeds').insert({
    id: 'seed-inspect-' + Date.now(),
    couple_id: 'andrea-tonet',
    author_id: '11111111-aaaa-bbbb-cccc-111111111111',
    title: 'test',
    body: 'test',
  }).select();

  console.log('Inserted seed columns:', data ? Object.keys(data[0]) : null, 'Error:', error);
}

inspectRitualSeeds();
