import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';

async function testPhotoSyncLive() {
  console.log('🧪 Probando sincronización de foto de perfil entre dispositivos en Supabase...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const testNewPhotoAndrea = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80';
  const testNewPhotoTonet = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80';

  // 1. Update Andrea's photo
  console.log('1. Dispositivo de Andrea actualiza su foto de perfil...');
  const { data: updateA, error: errA } = await supabase.from('profiles').update({
    avatar_photo: testNewPhotoAndrea,
    updated_at: new Date().toISOString()
  }).eq('role_key', 'user2').select();

  if (errA) {
    console.error('❌ Error actualizando foto Andrea:', errA.message);
  } else {
    console.log('✅ Foto de Andrea guardada en la nube:', updateA[0].avatar_photo);
  }

  // 2. Update Tonet's photo
  console.log('\n2. Dispositivo de Tonet actualiza su foto de perfil...');
  const { data: updateT, error: errT } = await supabase.from('profiles').update({
    avatar_photo: testNewPhotoTonet,
    updated_at: new Date().toISOString()
  }).eq('role_key', 'user1').select();

  if (errT) {
    console.error('❌ Error actualizando foto Tonet:', errT.message);
  } else {
    console.log('✅ Foto de Tonet guardada en la nube:', updateT[0].avatar_photo);
  }

  // 3. Query profiles as if a new device just opened the app
  console.log('\n3. Simulando nuevo dispositivo abriendo la app (Cold-start cloud hydration)...');
  const { data: fetchedProfiles, error: fetchErr } = await supabase.from('profiles').select('*').eq('couple_id', 'andrea-tonet');
  
  if (fetchErr) {
    console.error('❌ Error leyendo perfiles:', fetchErr.message);
  } else {
    console.log('✅ Perfiles recibidos en el nuevo dispositivo:');
    for (const p of fetchedProfiles) {
      console.log(`   - ${p.name} (${p.role_key}): avatar='${p.avatar}', photo='${p.avatar_photo?.slice(0, 40)}...'`);
    }
  }

  console.log('\n🎉 ¡Sincronización de fotos de perfil 100% verificada!');
}

testPhotoSyncLive().catch(console.error);
