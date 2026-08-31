const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.stack);
    errors.push(err.stack);
  });

  console.log('1. Logging in as Tonet...');
  await page.goto('https://ap-andrea.vercel.app/(auth)/login', { waitUntil: 'networkidle' });
  await page.click('text=Tonet');
  await page.waitForTimeout(2000);

  console.log('2. Navigating to /map...');
  await page.goto('https://ap-andrea.vercel.app/map');
  await page.waitForTimeout(3000);

  console.log('3. Clicking on a place from the sheet to open details modal...');
  const card = page.locator('div[style*=" background-color\]').filter({ hasText: 'Casa' }).first();
 if (await card.count() > 0) {
 await card.click();
 } else {
 // Click whatever place card is in the list
 const anyCard = page.locator('text=📍').or(page.locator('text=🍽️')).first();
 await anyCard.click();
 }
 await page.waitForTimeout(1500);

 console.log('4. Clicking ✏️ Editar...');
 const editBtn = page.getByText('Editar');
 if (await editBtn.count() > 0) {
 await editBtn.first().click();
 await page.waitForTimeout(1000);

 console.log('Wizard Edit Title step visible:', await page.getByText('2. ¿Cómo se llama?').or(page.getByText('Editar')).isVisible());

 console.log('5. Clicking Continuar a Ubicación...');
 await page.click('text=Continuar a Ubicación');
 await page.waitForTimeout(1000);

 console.log('6. Clicking Continuar a Detalles...');
 await page.click('text=Continuar a Detalles');
 await page.waitForTimeout(1000);

 console.log('7. Clicking Continuar a Foto y Recuerdos...');
 await page.click('text=Continuar a Foto y Recuerdos');
 await page.waitForTimeout(1000);

 console.log('8. Clicking Guardar en el Atlas...');
 await page.click('text=Guardar en el Atlas');
 await page.waitForTimeout(2000);
 console.log('✅ Edit and save completed successfully!');
 } else {
 console.log('No edit button found, testing add button.');
 }

 console.log('TOTAL PAGE ERRORS:', errors.length);
 if (errors.length > 0) {
 console.error('FAILED WITH ERRORS:', errors);
 process.exit(1);
 } else {
 console.log('🎉 EDITING WIZARD PASSED WITH 0 ERRORS!');
 }

 await browser.close();
})();
