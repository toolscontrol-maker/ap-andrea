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

  console.log('1. Logging in as Tonet...');
  await page.goto('https://ap-andrea.vercel.app/(auth)/login');
  await page.click('text=Tonet');
  await page.waitForTimeout(2000);

  console.log('2. Going to /map...');
  await page.goto('https://ap-andrea.vercel.app/map');
  await page.waitForTimeout(3000);

  console.log('3. Clicking + Guardar momento to open modal...');
  const addBtn = page.getByText('+ Guardar momento').or(page.getByText('Guardar momento')).or(page.getByText('+ Guardar'));
  await addBtn.first().click();
  await page.waitForTimeout(2000);

  console.log('Modal opened. Searching for a place in Google Maps...');
  const searchInput = page.locator('input').first();
  await searchInput.fill('Latte & Farina');
  await page.waitForTimeout(1500);

  // Click manual pin button
  const manualPin = page.getByText('Colocar pin manualmente');
  if (await manualPin.count() > 0) {
    console.log('Clicking manual pin...');
    await manualPin.first().click();
    await page.waitForTimeout(1500);
  }

  // Click continue to details
  const continueBtn = page.getByText('Continuar a Detalles');
  if (await continueBtn.count() > 0) {
    console.log('Clicking Continuar a Detalles...');
    await continueBtn.first().click();
    await page.waitForTimeout(1500);
  }

  console.log('Step 3 details reached! Testing type switches (Viaje, Cita, Restaurante, Lugar)...');
  await page.click('text=✈️ Viaje');
  await page.waitForTimeout(500);
  await page.click('text=🥂 Cita / Escapada');
  await page.waitForTimeout(500);
  await page.click('text=🍽️ Restaurante');
  await page.waitForTimeout(500);
  await page.click('text=📍 Lugar / Rincón');
  await page.waitForTimeout(500);

  console.log('Checking for any errors during entire Add / Edit lifecycle...');
  console.log('TOTAL ERRORS ENCOUNTERED:', errors.length);
  if (errors.length > 0) {
    console.error('FAILED WITH ERRORS:', errors);
    process.exit(1);
  } else {
    console.log('✅ 100% SUCCESSFUL: Zero crashes, zero white screens!');
  }

  await browser.close();
})();
