import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkStorage() {
  const { data: buckets, error } = await client.storage.listBuckets();
  console.log('Buckets in qxnsksrdqmrsjsqxyxtq:', buckets, 'Error:', error);

  // If andrea-media doesn't exist, create it or test upload
  const { data: uploadData, error: uploadError } = await client.storage
    .from('andrea-media')
    .upload('test.txt', Buffer.from('hello world'), { upsert: true });
  console.log('Upload test result:', uploadData, 'Error:', uploadError);
}

checkStorage();
