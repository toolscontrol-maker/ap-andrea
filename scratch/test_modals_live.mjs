import { chromium } from 'playwright';

async function testModalsLive() {
  console.log('--- TESTING GALLERY AND DETAIL MODALS IN BROWSER ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[BROWSER CONSOLE ERROR]', msg.text());
  });
  page.on('pageerror', err => {
    console.log('[PAGE CRASH EXCEPTION]', err.stack || err.message);
    errors.push(err.message);
  });

  await page.goto('https://ap-andrea.vercel.app/(tabs)/map?v=' + Date.now());
  await page.waitForTimeout(2000);

  const tonetBtn = await page.$('text=Tonet');
  if (tonetBtn) {
    await tonetBtn.click();
    await page.waitForTimeout(2000);
    await page.goto('https://ap-andrea.vercel.app/(tabs)/map');
    await page.waitForTimeout(2500);
  }

  // Trigger click on a map marker or bottom sheet if open
  console.log('Screen content after load...');
  const textContent = await page.evaluate(() => document.body.innerText);
  console.log('Body length:', textContent.length);

  await browser.close();
  console.log('Total fatal errors:', errors.length);
}

testModalsLive().catch(console.error);
