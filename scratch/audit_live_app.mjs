import { chromium } from 'playwright';

async function runAudit() {
  console.log('🚀 STARTING LIVE AUDIT OF https://ap-andrea.vercel.app ...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const networkCalls = [];

  page.on('console', msg => {
    const text = `[BROWSER CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleLogs.push(text);
    console.log(text);
  });

  page.on('pageerror', err => {
    const text = `[PAGE ERROR] ${err.message}`;
    consoleLogs.push(text);
    console.error(text);
  });

  page.on('request', req => {
    if (req.url().includes('supabase') || req.url().includes('api')) {
      const info = `--> [REQUEST] ${req.method()} ${req.url()}`;
      networkCalls.push({ type: 'REQ', method: req.method(), url: req.url(), postData: req.postData() });
      console.log(info);
    }
  });

  page.on('response', async res => {
    if (res.url().includes('supabase') || res.url().includes('api')) {
      let body = '';
      try {
        body = await res.text();
      } catch {}
      const info = `<-- [RESPONSE] ${res.status()} ${res.url()} | Body: ${body.slice(0, 300)}`;
      networkCalls.push({ type: 'RES', status: res.status(), url: res.url(), body });
      console.log(info);
    }
  });

  console.log('1. Navigating to https://ap-andrea.vercel.app ...');
  await page.goto('https://ap-andrea.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Take screenshot of landing
  await page.screenshot({ path: 'scratch/audit_landing.png' });
  console.log('Saved screenshot to scratch/audit_landing.png');

  // Check current URL
  console.log('Current URL:', page.url());

  // Check if we need to login
  const emailInput = await page.$('input[placeholder*="email" i], input[type="email"], input[placeholder*="correo" i]');
  if (emailInput) {
    console.log('Found login email input, typing hwrtseo@gmail.com...');
    await emailInput.fill('hwrtseo@gmail.com');
    await page.waitForTimeout(500);

    const loginBtn = await page.$('text=Entrar, text=Continuar, text=Acceder, [role="button"]');
    if (loginBtn) {
      console.log('Clicking login button...');
      await loginBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  await page.screenshot({ path: 'scratch/audit_after_login.png' });
  console.log('Current URL after login attempt:', page.url());

  // Check localStorage contents
  const localStorageData = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  });
  console.log('LocalStorage Keys in browser:', Object.keys(localStorageData));

  // Navigate to /wishes
  console.log('2. Navigating to /wishes...');
  await page.goto('https://ap-andrea.vercel.app/(tabs)/wishes', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scratch/audit_wishes_tab.png' });

  // Try to find the '+' button or 'Guardar deseo' button
  const addBtn = await page.$('text=Guardar deseo, text=+ Deseo, text=+, [aria-label*="añadir" i], [aria-label*="deseo" i]');
  console.log('Add Wish button found?:', Boolean(addBtn));

  if (addBtn) {
    console.log('Clicking Add Wish button...');
    await addBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scratch/audit_wish_modal.png' });

    // Try filling wish title
    const titleInput = await page.$('input[placeholder*="título" i], input[placeholder*="nombre" i], input[placeholder*="Qué te gustaría" i], input');
    if (titleInput) {
      console.log('Filling title input...');
      await titleInput.fill('Playwright Audit Wish Test');
      await page.waitForTimeout(500);

      // Click save button inside modal
      const saveBtn = await page.$('text=Guardar Deseo, text=Añadir Deseo, text=Guardar');
      if (saveBtn) {
        console.log('Clicking Save Wish button...');
        await saveBtn.click();
        await page.waitForTimeout(3000);
      }
    }
  }

  await page.screenshot({ path: 'scratch/audit_after_save_wish.png' });

  console.log('3. Navigating to /account...');
  await page.goto('https://ap-andrea.vercel.app/(tabs)/account', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scratch/audit_account_tab.png' });

  console.log('--- AUDIT FINISHED ---');
  await browser.close();
}

runAudit().catch(err => {
  console.error('Audit run failed:', err);
});
