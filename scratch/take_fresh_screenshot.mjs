import { chromium } from 'playwright';

async function takeFreshScreenshot() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto('https://ap-andrea.vercel.app/', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2500));

  await page.screenshot({ path: 'scratch/vercel_new_live.png' });
  console.log('Saved to scratch/vercel_new_live.png');
  await browser.close();
}

takeFreshScreenshot().catch(console.error);
