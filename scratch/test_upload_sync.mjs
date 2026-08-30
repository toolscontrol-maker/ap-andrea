import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const COUPLE_ID = 'andrea-tonet';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create small 1x1 test JPEG base64
const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function testUploadAndSync() {
  console.log('Testing upload of avatar to andrea-media bucket...');
  const base64Data = testBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const filePath = `${COUPLE_ID}/avatar_user1_test_${Date.now()}.jpg`;

  const { data: uploadData, error: uploadErr } = await client.storage
    .from('andrea-media')
    .upload(filePath, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadErr) {
    console.error('❌ Upload Error:', uploadErr);
    return;
  }

  const { data: urlData } = client.storage.from('andrea-media').getPublicUrl(filePath);
  const publicUrl = urlData.publicUrl;
  console.log('✅ Upload Success! Public URL:', publicUrl);

  console.log('Testing update of profile in Supabase profiles table...');
  const { data: profData, error: profErr } = await client
    .from('profiles')
    .upsert({
      id: '11111111-aaaa-bbbb-cccc-111111111111',
      couple_id: COUPLE_ID,
      role_key: 'user1',
      name: 'Tonet',
      avatar: 'T',
      avatar_photo: publicUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (profErr) {
    console.error('❌ Profile update error:', profErr);
  } else {
    console.log('✅ Profile updated in DB successfully!');
  }
}

testUploadAndSync();
