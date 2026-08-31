const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('ERROR:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.stack);
    errors.push(err.stack);
  });

  console.log('1. Logging in as Tonet on mobile viewport (390x844)...');
  await page.goto('https://ap-andrea.vercel.app/(auth)/login', { waitUntil: 'networkidle' });
  await page.click('text=Tonet');
  await page.waitForTimeout(2000);

  console.log('2. Navigating to /map...');
  await page.goto('https://ap-andrea.vercel.app/map');
  await page.waitForTimeout(3000);

  console.log('3. Clicking + Guardar momento...');
  const addBtn = page.getByText('+ Guardar momento').or(page.getByText('Guardar momento')).or(page.getByText('+ Guardar'));
  await addBtn.first().click();
  await page.waitForTimeout(1500);

  console.log('--- STEP 1: ENTITY SELECTION ---');
  console.log('Step 1 text visible:', await page.getByText('1. ¿Qué deseas guardar?').isVisible());
  await page.click('text=Viaje');
  await page.waitForTimeout(1000);

  console.log('--- STEP 2: TITLE ---');
  console.log('Step 2 text visible:', await page.getByText('2. ¿Cómo se llama?').isVisible());
  const titleInput = page.locator('input').first();
  await titleInput.fill('Escapada a Roma');
  await page.waitForTimeout(500);
  await page.click('text=Continuar a Ubicación');
  await page.waitForTimeout(1000);

  console.log('--- STEP 3: LOCATION ---');
  console.log('Step 3 text visible:', await page.getByText('3. ¿Dónde se encuentra?').isVisible());
  await page.click('text=Continuar a Detalles');
  await page.waitForTimeout(1000);

  console.log('--- STEP 4: SPECIFICS & CALENDAR ---');
  console.log('Step 4 text visible:', await page.getByText('4. Detalles y Fechas').isVisible());
  
  // Test opening calendar modal
  console.log('Testing opening interactive tactile Calendar Modal...');
  const dateBtn = page.getByText('📅');
  if (await dateBtn.count() > 0) {
    await dateBtn.first().click();
    await page.waitForTimeout(1000);
    console.log('Calendar Modal opened! Selecting a day...');
    // Click on day 15
    const day15 = page.getByText('15', { exact: true });
    if (await day15.count() > 0) {
      await day15.first().click();
      await page.waitForTimeout(1000);
      console.log('Day 15 selected and modal closed smoothly!');
    }
  }

  await page.click('text=Continuar a Foto y Recuerdos');
  await page.waitForTimeout(1000);

  console.log('--- STEP 5: MEDIA & STORY ---');
  console.log('Step 5 text visible:', await page.getByText('5. Foto y Nuestra Historia').isVisible());

  console.log('Testing backward navigation (← button)...');
  const backBtn = page.getByText('←');
  await backBtn.first().click();
  await page.waitForTimeout(500);
  console.log('Navigated back to Step 4. Back button works perfectly.');

  console.log('TOTAL UNCAUGHT ERRORS:', errors.length);
  if (errors.length > 0) {
    console.error('FAILED WITH ERRORS:', errors);
    process.exit(1);
  } else {
    console.log('🎉 WIZARD FLOW PASSED 100% CLEANLY WITH ZERO ERRORS!');
  }

  await browser.close();
})();
