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

  console.log('3. Clicking on a place in the filter list to trigger BottomSheet...');
  // Click on 'Comer' filter
  await page.click('text=Comer');
  await page.waitForTimeout(1000);

  // Now click on a place
  console.log('4. Testing adding and editing without errors...');
  const addBtn = page.getByText('+ Guardar momento').or(page.getByText('Guardar momento')).or(page.getByText('+ Guardar'));
  await addBtn.first().click();
  await page.waitForTimeout(1500);

  // Type in search box
  await page.fill('input[placeholder*=" Honest Greens\]', 'Latte & Farina');
 await page.waitForTimeout(1500);
 console.log('Search completed. Modal open.');

 // Click manual pin
 const manualPin = page.getByText('Colocar pin manualmente');
 if (await manualPin.count() > 0) {
 await manualPin.first().click();
 await page.waitForTimeout(1500);
 console.log('Confirm pin step visible.');
 
 // Click Continue to details
 const continueBtn = page.getByText('Continuar a Detalles');
 await continueBtn.first().click();
 await page.waitForTimeout(1500);
 console.log('Details step rendered successfully!');
 }

 console.log('TOTAL ERRORS IN COMPLETE FLOW:', errors.length);
 await browser.close();
})();
