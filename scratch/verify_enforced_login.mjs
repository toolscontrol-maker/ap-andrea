import { chromium } from 'playwright';

const LOCAL_URL = 'http://localhost:8081';

async function verifyLoginEnforcement() {
  console.log('🔒 Verificando deslogueo forzado y redirección a login...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
  });
  const page = await context.newPage();

  // Test 1: Go directly to base URL '/'
  console.log('1. Navegando a "/"...');
  await page.goto(LOCAL_URL, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));
  
  let pageText = await page.evaluate(() => document.body.innerText);
  console.log('¿Muestra pantalla de login ("Bienvenido a Casa") al entrar a "/"?:', pageText.includes('Bienvenido a Casa'));
  console.log('¿Muestra "SHOOTING · 0.3s"?:', pageText.includes('SHOOTING') || pageText.includes('0.3s'));

  // Test 2: Try to bypass directly to '/(tabs)/home' without auth
  console.log('\n2. Intentando saltar directamente a "/(tabs)/home"...');
  await page.goto(`${LOCAL_URL}/(tabs)/home`, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));
  
  pageText = await page.evaluate(() => document.body.innerText);
  console.log('¿Redirige correctamente a login y bloquea acceso a tabs?:', pageText.includes('Bienvenido a Casa'));

  await browser.close();
  console.log('\n✅ Comprobación de seguridad completada con éxito.');
}

verifyLoginEnforcement().catch(console.error);
