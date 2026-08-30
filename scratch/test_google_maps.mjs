import { chromium } from 'playwright';

async function testGoogleMaps() {
  console.log('🧪 Verificando Google Maps en https://ap-andrea.vercel.app/map...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
  });

  const logs = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[error] ${err.message}`));

  await page.goto('https://ap-andrea.vercel.app/', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));

  // Login
  await page.getByText('Tonet').click();
  await new Promise((r) => setTimeout(r, 2000));

  // Go to Map tab
  await page.goto('https://ap-andrea.vercel.app/map', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 4000));

  console.log('Current Map URL:', page.url());

  const hasGoogle = await page.evaluate(() => {
    return Boolean(
      window.google &&
      window.google.maps &&
      document.querySelector('div[style*="position: absolute"]')
    );
  });
  console.log('¿Google Maps SDK cargado e instanciado en el DOM?:', hasGoogle);

  const errors = logs.filter((l) => l.startsWith('[error]'));
  console.log('Errores de consola detectados:', errors);

  await browser.close();
}

testGoogleMaps().catch(console.error);
