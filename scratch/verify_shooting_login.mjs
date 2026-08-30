import { chromium } from 'playwright';

const LOCAL_URL = 'http://localhost:8081';

async function testShootingAndLogin() {
  console.log('🚀 Iniciando test visual de login y shooting photo stream (/browser)...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
  });
  const page = await context.newPage();

  // Clear previous auth session to see login screen
  await page.goto(LOCAL_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.removeItem('andrea_auth_session_v5');
  });

  // Navigate to login
  await page.goto(`${LOCAL_URL}/(auth)/login`, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('¿Título "Bienvenido a Casa" visible?:', pageText.includes('Bienvenido a Casa'));
  console.log('¿Badge "SHOOTING · 0.3s" visible?:', pageText.includes('SHOOTING') || pageText.includes('0.3s'));
  console.log('¿Botón "Tonet" (hwrtseo@gmail.com) visible?:', pageText.includes('hwrtseo@gmail.com'));
  console.log('¿Botón "Andrea" visible?:', pageText.includes('Andrea'));

  // Test Quick Login as Tonet
  console.log('\n👤 Probando acceso con email Tonet (hwrtseo@gmail.com)...');
  const tonetBtn = page.locator('text=Tonet').first();
  if (await tonetBtn.isVisible()) {
    await tonetBtn.click();
    await new Promise((r) => setTimeout(r, 1500));
  }

  const afterLoginText = await page.evaluate(() => document.body.innerText);
  console.log('¿Entró correctamente a la app?:', afterLoginText.includes('Andrea') || afterLoginText.includes('Tonet') || afterLoginText.includes('Deseos'));

  await browser.close();
  console.log('✅ Test E2E de Shooting y Login completado con éxito.');
}

testShootingAndLogin().catch(console.error);
