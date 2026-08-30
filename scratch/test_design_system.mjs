import { chromium } from 'playwright';

async function testDesignSystem() {
  console.log('🧪 Probando Andrea Design System v1 en producción...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone 15 Pro mobile viewport

  const logs = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[error] ${err.message}`));

  await page.goto('https://ap-andrea.vercel.app/', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));

  // Quick Login
  console.log('Logging in as Tonet...');
  await page.getByText('Tonet').click();
  await new Promise((r) => setTimeout(r, 2500));

  console.log('Current URL after login:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body Text contains "Hola, Tonet"?:', bodyText.includes('Hola, Tonet'));
  console.log('Body Text contains "Semilla de Conexión"?:', bodyText.includes('Semilla de Conexión'));

  await page.screenshot({ path: 'scratch/design_system_home.png' });
  console.log('Saved screenshot to scratch/design_system_home.png');

  await browser.close();
}

testDesignSystem().catch(console.error);
