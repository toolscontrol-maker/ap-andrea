import { chromium } from 'playwright';

async function testAddWishAndProfile() {
  console.log('--- TESTING ADD WISH AND PROFILE ON LIVE PRODUCTION ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[BROWSER]`, msg.text()));

  // 1. Go to site and login as Tonet
  await page.goto('https://ap-andrea.vercel.app');
  await page.waitForTimeout(1000);
  const tonetBtn = await page.$('text=Tonet');
  if (tonetBtn) {
    await tonetBtn.click();
    await page.waitForTimeout(2000);
  }

  // 2. Go to Wishes
  await page.goto('https://ap-andrea.vercel.app/(tabs)/wishes');
  await page.waitForTimeout(1500);

  // Click "+ Guardar deseo"
  const addWishBtn = await page.$('text=+ Guardar deseo');
  if (addWishBtn) {
    console.log('Clicking "+ Guardar deseo"...');
    await addWishBtn.click();
    await page.waitForTimeout(1000);

    // Fill Title
    const titleInput = await page.$('input[placeholder*="título" i], input[placeholder*="nombre" i], input[placeholder*="Ej." i], input[placeholder*="Vestido" i]');
    if (titleInput) {
      console.log('Typing wish title...');
      await titleInput.fill('Reloj Minimalista de Oro');
    }

    // Save Wish
    const saveBtn = await page.$('text=Guardar Deseo, text=Guardar');
    if (saveBtn) {
      console.log('Clicking "Guardar Deseo"...');
      await saveBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  await page.screenshot({ path: 'scratch/wishes_after_adding.png' });

  // 3. Go to Account
  await page.goto('https://ap-andrea.vercel.app/(tabs)/account');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'scratch/account_tab_live.png' });

  console.log('--- TEST COMPLETED ---');
  await browser.close();
}

testAddWishAndProfile().catch(console.error);
