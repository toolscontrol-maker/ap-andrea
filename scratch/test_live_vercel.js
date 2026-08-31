const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('LIVE CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('LIVE PAGE ERROR:', err.stack);
    errors.push(err.stack);
  });

  console.log('Testing against LIVE VERCEL https://ap-andrea.vercel.app...');
  await page.goto('https://ap-andrea.vercel.app/(auth)/login', { waitUntil: 'networkidle' });
  await page.click('text=Tonet');
  await page.waitForTimeout(2000);

  await page.goto('https://ap-andrea.vercel.app/map');
  await page.waitForTimeout(3000);

  console.log('Clicking + Guardar momento on LIVE Vercel...');
  const addBtn = page.getByText('+ Guardar momento').or(page.getByText('Guardar momento')).or(page.getByText('+ Guardar'));
  await addBtn.first().click();
  await page.waitForTimeout(2500);

  console.log('Live Vercel test - Uncaught errors:', errors.length);
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Live modal text present:', bodyText.includes('Guardar en el Atlas') || bodyText.includes('Busca en Google Maps'));

  if (errors.length > 0) {
    console.error('LIVE VERCEL FAILED WITH ERRORS:', errors);
    process.exit(1);
  } else {
    console.log('✅ LIVE VERCEL PASSED 100% CLEANLY!');
  }
  await browser.close();
})();
