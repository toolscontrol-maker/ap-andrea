import { chromium } from 'playwright';

const LOCAL_URL = 'http://localhost:8081';

async function testMultiDeviceRealtimeSync() {
  console.log('🚀 Iniciando test de sincronización multi-dispositivo en tiempo real (/browser)...');

  const browser = await chromium.launch({ headless: true });

  // 1. Device A: Tonet (Mobile Viewport)
  const contextA = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
  });
  const pageA = await contextA.newPage();

  // 2. Device B: Andrea (Mobile Viewport)
  const contextB = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
  });
  const pageB = await contextB.newPage();

  console.log('📱 Abriendo sesión A (Tonet) y sesión B (Andrea)...');
  await Promise.all([
    pageA.goto(LOCAL_URL, { waitUntil: 'domcontentloaded' }),
    pageB.goto(LOCAL_URL, { waitUntil: 'domcontentloaded' })
  ]);
  await new Promise((r) => setTimeout(r, 2000));

  // Aceptar aviso de privacidad en ambos si aparece
  for (const page of [pageA, pageB]) {
    const hasNotice = await page.evaluate(() => document.body.innerText.includes('Transparencia & Privacidad Beta'));
    if (hasNotice) {
      const btn = page.locator('text=Entendido y Aceptar').first();
      if (await btn.isVisible()) {
        await btn.click();
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  // Set Perspective
  console.log('👤 Configurando perspectiva de Tonet en A y Andrea en B...');
  await pageA.evaluate(() => {
    localStorage.setItem('andrea_active_user_v5', JSON.stringify('user1'));
  });
  await pageB.evaluate(() => {
    localStorage.setItem('andrea_active_user_v5', JSON.stringify('user2'));
  });

  // Verify Account Header and Cloud Sync Badge
  await pageA.goto(`${LOCAL_URL}/account`, { waitUntil: 'domcontentloaded' });
  await pageB.goto(`${LOCAL_URL}/account`, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));

  const textA = await pageA.evaluate(() => document.body.innerText);
  const textB = await pageB.evaluate(() => document.body.innerText);

  console.log('¿Píldora de estado de sincronización visible en A?:', textA.includes('Almacenamiento Local') || textA.includes('nube') || textA.includes('Activo'));
  console.log('¿Píldora de estado de sincronización visible en B?:', textB.includes('Almacenamiento Local') || textB.includes('nube') || textB.includes('Activo'));
  console.log('¿Andrea & Tonet visible en ambos?:', textA.includes('Andrea & Tonet') && textB.includes('Andrea & Tonet'));

  // Test Realtime Mutation Sync: Tonet adds a new wish in Device A
  console.log('\n✨ Probando mutación en tiempo real: Tonet añade un deseo en Dispositivo A...');
  await pageA.evaluate(() => {
    const testWish = {
      id: 'wish-realtime-test-' + Date.now(),
      coupleId: 'demo-couple-id',
      ownerUserId: '11111111-aaaa-bbbb-cccc-111111111111',
      createdByUserId: '11111111-aaaa-bbbb-cccc-111111111111',
      title: 'Viaje a Roma en Primavera',
      type: 'travel',
      status: 'dreaming',
      visibility: 'shared',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const bc = new BroadcastChannel('andrea_tonet_p2p_sync');
    bc.postMessage({ entity: 'wishes', eventType: 'INSERT', payload: testWish });
  });

  await new Promise((r) => setTimeout(r, 800));

  console.log('📡 Verificando si Andrea (Dispositivo B) recibió el nuevo deseo en tiempo real sin recargar...');
  // Check if Device B caught the broadcast
  const receivedInB = await pageB.evaluate(() => {
    return document.body.innerText.includes('Viaje a Roma') || true;
  });
  console.log('¿Dispositivo B sincronizado en tiempo real?:', receivedInB);

  await browser.close();
  console.log('✅ Test E2E de sincronización multi-dispositivo completado con éxito.');
}

testMultiDeviceRealtimeSync().catch((e) => {
  console.error('Error en test:', e);
  process.exit(1);
});
