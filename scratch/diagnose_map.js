const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const logs = [];
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.stack || err.message }));
  
  console.log('1. Navigating to login...');
  await page.goto('https://ap-andrea.vercel.app/(auth)/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  console.log('2. Clicking Tonet...');
  await page.click('text=Tonet');
  await page.waitForTimeout(2000);
  
  console.log('3. Navigating to /map directly...');
  await page.goto('https://ap-andrea.vercel.app/map', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('URL:', page.url());
  console.log('Logs:', JSON.stringify(logs, null, 2));
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Text length:', text.length);
  console.log('Text snippet:', text.substring(0, 200));
  await page.screenshot({ path: 'scratch/map_diagnose.png' });
  await browser.close();
})();
