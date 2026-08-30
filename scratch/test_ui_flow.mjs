import { chromium } from 'playwright';

async function testUI() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[BROWSER CONSOLE]`, msg.text()));

  await page.goto('https://ap-andrea.vercel.app');
  await page.waitForTimeout(1500);

  const tonetBtn = await page.$('text=Tonet');
  if (tonetBtn) {
    console.log('Clicking quick Tonet login...');
    await tonetBtn.click();
    await page.waitForTimeout(2500);
  }

  console.log('After login, URL is:', page.url());

  // Go to Wishes
  await page.goto('https://ap-andrea.vercel.app/(tabs)/wishes');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scratch/wishes_screen.png' });

  // Get all text content on the wishes page
  const pageText = await page.innerText('body');
  console.log('Wishes page text snippet:', pageText.slice(0, 400));

  // Check buttons
  const buttons = await page.$$eval('[role="button"], div[tabindex="0"], button', els => els.map(e => e.innerText?.trim()).filter(Boolean));
  console.log('Interactive buttons on Wishes page:', buttons);

  await browser.close();
}

testUI().catch(err => console.error(err));
