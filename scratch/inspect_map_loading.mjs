import { chromium } from 'playwright';

async function inspectMap() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });

  const logs = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));

  await page.goto('https://ap-andrea.vercel.app/', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.getByText('Tonet').click();
  await new Promise((r) => setTimeout(r, 2000));

  await page.goto('https://ap-andrea.vercel.app/map', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 4000));

  console.log('--- CONSOLE LOGS ---');
  console.log(logs.join('\n'));

  const scriptSrcs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map((s) => s.src);
  });
  console.log('--- SCRIPT SRCS ---');
  console.log(scriptSrcs.filter((s) => s.includes('maps.googleapis')));

  const googleState = await page.evaluate(() => {
    return {
      hasWindowGoogle: Boolean(window.google),
      hasMaps: Boolean(window.google && window.google.maps),
    };
  });
  console.log('--- GOOGLE STATE ---', googleState);

  await browser.close();
}

inspectMap().catch(console.error);
