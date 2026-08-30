import { chromium } from 'playwright';

async function testAuthLoginRoute() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  const logs = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));

  console.log('Navigating directly to https://ap-andrea.vercel.app/(auth)/login ...');
  await page.goto('https://ap-andrea.vercel.app/(auth)/login', { waitUntil: 'networkidle', timeout: 20000 });
  await new Promise((r) => setTimeout(r, 2000));

  console.log('Logs captured:\n', logs.join('\n'));
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Body text length:', text.length);
  console.log('Body text:\n', text);

  await page.screenshot({ path: 'scratch/auth_login_direct.png' });
  await browser.close();
}

testAuthLoginRoute().catch(console.error);
