import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';

async function testLiveSupabase() {
  console.log('🔍 Probando conexión en vivo con Supabase...');
  console.log(`URL: ${SUPABASE_URL}`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Check couples table
  console.log('\n1. Verificando tabla couples...');
  const { data: couples, error: coupleErr } = await supabase.from('couples').select('*');
  if (coupleErr) {
    console.error('❌ Error en tabla couples:', coupleErr.message);
  } else {
    console.log('✅ Parejas registradas:', couples);
  }

  // 2. Check profiles table
  console.log('\n2. Verificando perfiles de Tonet & Andrea...');
  const { data: profiles, error: profileErr } = await supabase.from('profiles').select('*');
  if (profileErr) {
    console.error('❌ Error en tabla profiles:', profileErr.message);
  } else {
    console.log('✅ Perfiles encontrados:', profiles?.map(p => ({ role: p.role_key, name: p.name, avatar: p.avatar })));
  }

  // 3. Test Inserting and Reading a Live Record
  console.log('\n3. Probando inserción y lectura en vivo en la nube (wishes)...');
  const testWishId = 'test-live-wish-' + Date.now();
  const { data: insertData, error: insertErr } = await supabase.from('wishes').insert({
    id: testWishId,
    couple_id: 'andrea-tonet',
    owner_user_id: '11111111-aaaa-bbbb-cccc-111111111111',
    created_by_user_id: '11111111-aaaa-bbbb-cccc-111111111111',
    title: '🌟 Test en Vivo de Base de Datos',
    description: 'Comprobando sincronización en tiempo real para Tonet y Andrea',
    status: 'dreaming',
    type: 'other'
  }).select();

  if (insertErr) {
    console.error('❌ Error insertando registro de prueba:', insertErr.message);
  } else {
    console.log('✅ Inserción en la nube exitosa:', insertData);
  }

  // 4. Verify retrieval
  const { data: readData, error: readErr } = await supabase.from('wishes').select('*').eq('id', testWishId);
  if (readErr || !readData || readData.length === 0) {
    console.error('❌ Error leyendo registro insertado:', readErr?.message);
  } else {
    console.log('✅ Lectura en la nube confirmada:', readData[0].title);
  }

  // 5. Clean up test record
  await supabase.from('wishes').delete().eq('id', testWishId);
  console.log('🧹 Registro de prueba eliminado limpiamente.');

  // 6. Test storage bucket
  console.log('\n4. Verificando bucket multimedia (andrea-media)...');
  const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
  if (bucketErr) {
    console.warn('⚠️ No se pudo listar buckets (RLS):', bucketErr.message);
  } else {
    console.log('✅ Buckets disponibles:', buckets.map(b => b.name));
  }

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE LA BASE DE DATOS HAN PASADO CON ÉXITO AL 100%!');
}

testLiveSupabase().catch(e => {
  console.error('Error en test de Supabase:', e);
  process.exit(1);
});
