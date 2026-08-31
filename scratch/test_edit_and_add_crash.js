const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR STACK:', err.stack);
    errors.push(err.stack);
  });

  console.log('1. Logging in...');
  await page.goto('https://ap-andrea.vercel.app/(auth)/login');
  await page.click('text=Tonet');
  await page.waitForTimeout(2000);

  console.log('2. Going to /map...');
  await page.goto('https://ap-andrea.vercel.app/map');
  await page.waitForTimeout(3000);

  console.log('3. Clicking + Guardar momento...');
  const addBtn = page.getByText('+ Guardar momento').or(page.getByText('Guardar momento')).or(page.getByText('+ Guardar'));
  console.log('Add button count:', await addBtn.count());
  if (await addBtn.count() > 0) {
    await addBtn.first().click();
    await page.waitForTimeout(3000);
    console.log('After clicking add button, errors:', errors.length);
    console.log('Page text after click:', (await page.evaluate(() => document.body.innerText)).substring(0, 200));
    await page.screenshot({ path: 'scratch/after_add_click.png' });
  }

  // Now test editing
  console.log('4. Reloading /map to test editing an existing place...');
  await page.goto('https://ap-andrea.vercel.app/map');
  await page.waitForTimeout(3000);

  // Click on the map container center to select a pin or find button
  // Let's trigger handlePlacePress or click a pin
  await page.evaluate(() => {
    // Check if window or global has places or trigger edit
    const editButtons = Array.from(document.querySelectorAll('div, button')).filter(el => el.innerText && el.innerText.includes('✏️'));
    console.log('Edit buttons found:', editButtons.length);
    if (editButtons.length > 0) editButtons[0].click();
  });
  await page.waitForTimeout(2000);

  console.log('TOTAL UNCAUGHT ERRORS:', errors);
  await browser.close();
})();
