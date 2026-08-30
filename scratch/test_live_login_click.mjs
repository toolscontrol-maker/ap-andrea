import { chromium } from 'playwright';

async function testLiveLoginClick() {
  console.log('Testing live login on https://ap-andrea.vercel.app ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const logs = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[error] ${err.message}`));
  page.on('dialog', async (dialog) => {
    console.log('Browser Dialog/Alert:', dialog.message());
    await dialog.accept();
  });

  await page.goto('https://ap-andrea.vercel.app/', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));

  // Type email
  console.log('Typing email...');
  const emailInput = page.getByPlaceholder('Correo (ej. hwrtseo@gmail.com)');
  await emailInput.fill('hwrtseo@gmail.com');

  // Type password
  console.log('Typing password...');
  const passwordInput = page.getByPlaceholder('Contraseña privada');
  await passwordInput.fill('611171571');

  // Click Submit
  console.log('Clicking "Entrar a Nuestro Espacio"...');
  await page.getByText('Entrar a Nuestro Espacio').click();
  await new Promise((r) => setTimeout(r, 3000));

  console.log('Current URL after click:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body Text includes DÍAS JUNTOS?:', bodyText.includes('DÍAS') || bodyText.includes('JUNTOS'));
  console.log('Logs:\n', logs.join('\n'));

  await page.screenshot({ path: 'scratch/live_login_after_click.png' });
  await browser.close();
}

testLiveLoginClick().catch(console.error);
