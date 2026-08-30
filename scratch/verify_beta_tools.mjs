import { chromium } from 'playwright';

const LOCAL_URL = 'http://localhost:8081';

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true });
  const page = await context.newPage();

  page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', (err) => console.error('BROWSER ERROR:', err.message));

  console.log('=== 1. Verificando MapScreen UI Redesign ===');
  await page.goto(`${LOCAL_URL}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Aceptar aviso de privacidad beta si aparece
  const hasNotice = await page.evaluate(() => document.body.innerText.includes('Transparencia & Privacidad Beta'));
  if (hasNotice) {
    const btn = page.locator('text=Entendido y Aceptar').first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(800);
    }
  }

  // Click en la pestaña Atlas del Floating Glass Tab Bar
  const atlasTab = page.locator('text=Atlas').first();
  if (await atlasTab.isVisible()) {
    await atlasTab.click();
    await page.waitForTimeout(1500);
  }

  // Header
  const titleVisible = await page.evaluate(() => document.body.innerText.includes('Nuestra historia'));
  console.log('¿Título central "Nuestra historia" visible?:', titleVisible);

  const momentsVisible = await page.evaluate(() => document.body.innerText.includes('momentos en vuestro mapa'));
  console.log('¿Subtítulo de momentos visible?:', momentsVisible);

  // Filtros
  const todoFilter = await page.evaluate(() => document.body.innerText.includes('Todo'));
  const recuerdosFilter = await page.evaluate(() => document.body.innerText.includes('Recuerdos'));
  const lugaresFilter = await page.evaluate(() => document.body.innerText.includes('Lugares'));
  console.log('¿Filtros horizontales Todo/Recuerdos/Lugares visibles?:', todoFilter && recuerdosFilter && lugaresFilter);

  // CTA Creación
  const ctaVisible = await page.evaluate(() => document.body.innerText.includes('Guardar momento'));
  console.log('¿Pill CTA "+ Guardar momento" visible?:', ctaVisible);

  // Atlas Overview Card
  const atlasCardVisible = await page.evaluate(() => document.body.innerText.includes('✦ Vuestro atlas'));
  console.log('¿Card flotante "✦ Vuestro atlas" visible?:', atlasCardVisible);

  // Probar apertura del menú de atlas
  await page.locator('text=Nuestra historia').first().click();
  await page.waitForTimeout(600);
  const atlasMenuVisible = await page.evaluate(() => document.body.innerText.includes('Vistas del Atlas'));
  console.log('¿Modal "Vistas del Atlas" se abre al pulsar cabecera?:', atlasMenuVisible);

  await browser.close();
  console.log('✅ Verificación de MapScreen UI finalizada exitosamente.');
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
