import { chromium } from 'playwright';

async function testFresh() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage({ viewport: { width: 390, height: 844 } });

  const logs = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));

  await page.goto('https://ap-andrea.vercel.app/', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.getByText('Tonet').click();
  await new Promise((r) => setTimeout(r, 2000));

  await page.goto('https://ap-andrea.vercel.app/map', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 4000));

  const typeErrors = logs.filter((l) => l.includes('TypeError') || l.includes('load error'));
  console.log('--- TYPE ERRORS ---', typeErrors);

  const googleReady = await page.evaluate(() => {
    return Boolean(window.google && window.google.maps);
  });
  console.log('--- GOOGLE READY ---', googleReady);

  await browser.close();
}

testFresh().catch(console.error);
