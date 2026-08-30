import { chromium } from 'playwright';

async function checkLiveVercel() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  page.on('console', (msg) => console.log('Live Console:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('Live PageError:', err.message));

  console.log('Fetching https://ap-andrea.vercel.app ...');
  await page.goto('https://ap-andrea.vercel.app', { waitUntil: 'networkidle', timeout: 20000 });
  await new Promise((r) => setTimeout(r, 3000));

  const url = page.url();
  console.log('Final URL:', url);
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Body Text length:', text.length);
  console.log('Body Text preview:\n', text.slice(0, 500));

  await page.screenshot({ path: 'scratch/vercel_live.png' });
  console.log('Saved screenshot to scratch/vercel_live.png');

  await browser.close();
}

checkLiveVercel().catch(console.error);
