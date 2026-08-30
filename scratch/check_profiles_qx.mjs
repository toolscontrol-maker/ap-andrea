import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkProfiles() {
  const { data, error } = await client.from('profiles').select('*');
  console.log('Profiles in qxnsksrdqmrsjsqxyxtq:', data, 'Error:', error);
}

checkProfiles();
