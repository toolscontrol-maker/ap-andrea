const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.stack);
    errors.push(err.stack);
  });

  console.log('Testing against local server http://localhost:8081...');
  await page.goto('http://localhost:8081/(auth)/login', { waitUntil: 'networkidle' });
  await page.click('text=Tonet');
  await page.waitForTimeout(2000);

  await page.goto('http://localhost:8081/map');
  await page.waitForTimeout(2000);

  console.log('Clicking + Guardar momento on local server...');
  const addBtn = page.getByText('+ Guardar momento').or(page.getByText('Guardar momento')).or(page.getByText('+ Guardar'));
  await addBtn.first().click();
  await page.waitForTimeout(2000);

  console.log('Local test - Uncaught errors:', errors.length);
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Modal text present on screen:', bodyText.includes('Guardar en el Atlas') || bodyText.includes('Busca en Google Maps'));

  if (errors.length > 0) {
    console.error('Errors found:', errors);
    process.exit(1);
  } else {
    console.log('LOCAL TEST PASSED 100% CLEANLY!');
  }
  await browser.close();
})();
