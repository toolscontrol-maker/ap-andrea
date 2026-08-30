import { chromium } from 'playwright';

async function testPasswordLogin() {
  console.log('🧪 Probando login con contraseña (611171571)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));

  // Verify elements
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('¿Contiene "Bienvenido a Casa"?:', pageText.includes('Bienvenido a Casa'));
  console.log('¿NO contiene "SHOOTING · 0.3s"?:', !pageText.includes('SHOOTING · 0.3s'));
  console.log('¿NO contiene "Supabase Cloud"?:', !pageText.includes('Supabase Cloud'));

  // Test Tonet Quick Login
  console.log('\n👉 Pulsando botón rápido "Tonet"...');
  await page.getByText('Tonet').click();
  await new Promise((r) => setTimeout(r, 2000));

  const afterLoginUrl = page.url();
  console.log('URL tras login:', afterLoginUrl);
  const afterText = await page.evaluate(() => document.body.innerText);
  console.log('¿Ha entrado al Nido (Home) correctamente?:', afterText.includes('DÍAS') || afterText.includes('JUNTOS') || afterText.includes('Tonet'));

  await page.screenshot({ path: 'scratch/login_success.png' });
  console.log('Captura guardada en scratch/login_success.png');
  await browser.close();
}

testPasswordLogin().catch(console.error);
