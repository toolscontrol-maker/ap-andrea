import { chromium } from 'playwright';
import path from 'path';

async function testWishesScroll() {
  console.log('🧪 Probando scroll vertical en la página de Deseos (/wishes) en Vercel...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, // iPhone 12 Pro mobile view
    deviceScaleFactor: 3,
    hasTouch: true,
  });

  await page.goto('https://ap-andrea.vercel.app/', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));

  // Quick Login
  await page.getByText('Tonet').click();
  await new Promise((r) => setTimeout(r, 2000));

  // Click Wishes Tab
  console.log('Navigating to Wishes tab...');
  await page.getByText('Deseos').click();
  await new Promise((r) => setTimeout(r, 2000));

  console.log('URL on wishes:', page.url());

  // Scroll down smoothly
  console.log('Simulating mouse wheel scroll down...');
  await page.mouse.wheel(0, 1000);
  await new Promise((r) => setTimeout(r, 1000));

  const artifactDir = 'C:\\\\Users\\\\angel chisvert\\\\.gemini\\\\antigravity\\\\brain\\\\75dbe799-91cb-4964-aafc-d0ede4fbc378';
  const outPath = path.join(artifactDir, 'wishes_scrolled_live.png');
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot to:', outPath);

  await browser.close();
}

testWishesScroll().catch(console.error);
