import { chromium } from 'playwright';

async function testWishCreationAccurate() {
  console.log('--- ACCURATE WISH CREATION TEST ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[BROWSER]`, msg.text()));

  // 1. Go to site and login as Tonet
  await page.goto('https://ap-andrea.vercel.app');
  await page.waitForTimeout(1500);

  const tonetBtn = await page.$('text=Tonet');
  if (tonetBtn) {
    console.log('Logging in as Tonet...');
    await tonetBtn.click();
    await page.waitForTimeout(2500);
  }

  // 2. Go to Wishes
  await page.goto('https://ap-andrea.vercel.app/(tabs)/wishes');
  await page.waitForTimeout(2000);

  // Click "+ Guardar deseo"
  const addWishBtn = await page.$('text=+ Guardar deseo');
  if (addWishBtn) {
    console.log('Clicking "+ Guardar deseo"...');
    await addWishBtn.click();
    await page.waitForTimeout(1000);

    // Fill Title specifically
    const titleInput = await page.$('input[placeholder*="Claude" i], input[placeholder*="ej. Bolso" i], input[placeholder*="ej." i]');
    if (titleInput) {
      console.log('Filling wish title input with "Vestido Seda Atelier"...');
      await titleInput.fill('Vestido Seda Atelier');
      await page.waitForTimeout(500);
    }

    // Click "Guardar Deseo" button at the bottom of the modal
    const saveBtn = await page.$('text=Guardar Deseo, text=Añadir Deseo, text=Guardar');
    if (saveBtn) {
      console.log('Clicking "Guardar Deseo" button...');
      await saveBtn.click();
      await page.waitForTimeout(4000);
    }
  }

  await page.screenshot({ path: 'scratch/wish_creation_result.png' });
  console.log('--- TEST FINISHED ---');
  await browser.close();
}

testWishCreationAccurate().catch(console.error);
