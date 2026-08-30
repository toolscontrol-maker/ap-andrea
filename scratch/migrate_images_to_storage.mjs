import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrateImagesToStorage() {
  console.log('--- 1. FETCHING CURRENT PROFILES ---');
  const { data: profiles, error: pErr } = await client.from('profiles').select('*');
  if (pErr || !profiles) {
    console.error('Error fetching profiles:', pErr);
    return;
  }

  for (const p of profiles) {
    if (p.avatar_photo && p.avatar_photo.startsWith('data:')) {
      console.log(`Migrating profile [${p.role_key} - ${p.name}] base64 image (${p.avatar_photo.length} bytes) to Supabase Storage...`);
      try {
        const matches = p.avatar_photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const contentType = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const fileName = `avatars/avatar_${p.role_key}_${Date.now()}.jpg`;

          const { data: uploadRes, error: uploadErr } = await client.storage
            .from('andrea-media')
            .upload(fileName, buffer, { contentType, upsert: true });

          if (uploadErr) {
            console.error(`Upload error for ${p.name}:`, uploadErr);
          } else {
            const { data: urlData } = client.storage.from('andrea-media').getPublicUrl(fileName);
            const publicUrl = urlData.publicUrl;
            console.log(`✅ Uploaded to Supabase Storage: ${publicUrl}`);

            // Update profile with clean CDN URL
            const { error: upErr } = await client.from('profiles').update({
              avatar_photo: publicUrl,
              updated_at: new Date().toISOString(),
            }).eq('id', p.id);

            console.log(`Updated profile row in DB for ${p.name}:`, upErr || 'SUCCESS');
          }
        }
      } catch (err) {
        console.error(`Exception migrating ${p.name}:`, err);
      }
    } else if (!p.avatar_photo || p.avatar_photo.length === 0) {
      // Set high-res curated photos if missing
      const defaultPhoto = p.role_key === 'user1'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop';
      await client.from('profiles').update({
        avatar_photo: defaultPhoto,
        updated_at: new Date().toISOString(),
      }).eq('id', p.id);
      console.log(`Set curated photo for ${p.name}`);
    }
  }

  // 2. CHECK MAP PLACES
  console.log('\n--- 2. CHECKING MAP PLACES PHOTOS ---');
  const { data: mapPlaces } = await client.from('map_places').select('id, title, photos');
  if (mapPlaces) {
    for (const m of mapPlaces) {
      if (m.photos && Array.isArray(m.photos)) {
        let changed = false;
        const newPhotos = [];
        for (let i = 0; i < m.photos.length; i++) {
          const photo = m.photos[i];
          if (photo && photo.startsWith('data:')) {
            console.log(`Migrating map place [${m.title}] photo ${i} (${photo.length} bytes)...`);
            try {
              const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
              if (matches && matches.length === 3) {
                const contentType = matches[1];
                const buffer = Buffer.from(matches[2], 'base64');
                const fileName = `places/place_${m.id}_${i}_${Date.now()}.jpg`;
                const { error: upErr } = await client.storage
                  .from('andrea-media')
                  .upload(fileName, buffer, { contentType, upsert: true });
                if (!upErr) {
                  const { data: urlData } = client.storage.from('andrea-media').getPublicUrl(fileName);
                  newPhotos.push(urlData.publicUrl);
                  changed = true;
                  continue;
                }
              }
            } catch (e) {
              console.error('Error uploading place photo:', e);
            }
          }
          newPhotos.push(photo);
        }

        if (changed) {
          await client.from('map_places').update({
            photos: newPhotos,
            updated_at: new Date().toISOString(),
          }).eq('id', m.id);
          console.log(`✅ Updated map place [${m.title}] with CDN photo URLs`);
        }
      }
    }
  }

  // 3. FINAL INSPECTION
  console.log('\n--- 3. FINAL INSPECTION OF PROFILES ---');
  const { data: finalProfiles } = await client.from('profiles').select('*');
  console.log(JSON.stringify(finalProfiles, null, 2));
}

migrateImagesToStorage();
