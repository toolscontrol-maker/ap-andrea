import { chromium } from 'playwright';

async function capturePreview() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
  });

  await page.goto('https://ap-andrea.vercel.app/', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));

  // Quick Login
  await page.getByText('Tonet').click();
  await new Promise((r) => setTimeout(r, 2500));

  const targetPath = 'C:\\\\Users\\\\angel chisvert\\\\.gemini\\\\antigravity\\\\brain\\\\75dbe799-91cb-4964-aafc-d0ede4fbc378\\\\scratch\\\\design_system_preview.png';
  await page.screenshot({ path: targetPath });
  console.log('Saved to:', targetPath);

  await browser.close();
}

capturePreview().catch(console.error);
