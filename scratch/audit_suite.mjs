import { chromium } from 'playwright';
import fs from 'fs';

const PROD_URL = 'https://ap-andrea.vercel.app';
const LOCAL_URL = 'http://localhost:8081';

async function runAudit() {
  const results = {
    environments: {},
    localStorageAudit: {},
    privacyMatrix: {},
    negativeCases: {},
    performance: {},
  };

  const browser = await chromium.launch({ headless: true });

  // ── 1. ENVIRONMENT COMPARISON (LOCAL vs PROD) ──
  for (const [envName, baseUrl] of [['Local', LOCAL_URL], ['Production', PROD_URL]]) {
    console.log(`\n================ Testing ${envName} (${baseUrl}) ================`);
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    });

    const page = await context.newPage();
    const consoleLogs = [];
    const networkErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleLogs.push({ type: msg.type(), text: msg.text() });
      }
    });

    page.on('requestfailed', req => {
      networkErrors.push({ url: req.url(), failure: req.failure()?.errorText });
    });

    page.on('response', resp => {
      if (resp.status() >= 400) {
        networkErrors.push({ url: resp.url(), status: resp.status() });
      }
    });

    const envData = {
      routes: {},
      consoleErrors: consoleLogs,
      networkErrors: networkErrors,
      mapboxLoaded: false,
      mapboxTokenPresent: false,
    };

    // Test direct routes
    const routesToTest = ['/home', '/wishes', '/calendar', '/map', '/account'];
    for (const r of routesToTest) {
      const url = `${baseUrl}${r}`;
      try {
        const start = performance.now();
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const loadTimeMs = Math.round(performance.now() - start);
        const status = resp ? resp.status() : 0;
        const pageTitle = await page.title();
        const rootContentLength = (await page.content()).length;

        envData.routes[r] = {
          status,
          loadTimeMs,
          pageTitle,
          contentLength: rootContentLength,
          ok: status < 400 && rootContentLength > 500,
        };
      } catch (err) {
        envData.routes[r] = { error: err.message, ok: false };
      }
    }

    // Check Mapbox canvas and token
    try {
      await page.goto(`${baseUrl}/map`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      const hasCanvas = await page.evaluate(() => !!document.querySelector('.mapboxgl-canvas, canvas'));
      const hasErrorOverlay = await page.evaluate(() => {
        return document.body.innerText.includes('Falta EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN');
      });
      envData.mapboxLoaded = hasCanvas && !hasErrorOverlay;
      envData.mapboxTokenPresent = !hasErrorOverlay;
    } catch (e) {
      envData.mapboxLoaded = false;
    }

    results.environments[envName] = envData;
    await context.close();
  }

  // ── 2. LOCALSTORAGE INSPECTION & PRIVACY AUDIT (LOCAL) ──
  console.log('\n================ Auditing LocalStorage & Privacy ================');
  const auditContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await auditContext.newPage();
  await page.goto(`${LOCAL_URL}/home`, { waitUntil: 'networkidle' });

  // Read all localStorage keys
  const storageDump = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k);
      try {
        data[k] = { raw: v, parsed: JSON.parse(v), isJson: true };
      } catch (e) {
        data[k] = { raw: v, isJson: false };
      }
    }
    return data;
  });

  results.localStorageAudit = storageDump;

  // ── 3. PRIVACY MATRIX (Ángel vs Andrea Surprise Isolation) ──
  console.log('\n================ Testing Privacy Matrix ================');
  // 1. Switch to Ángel
  await page.evaluate(() => {
    localStorage.setItem('andrea_active_dev_role', 'user1');
    localStorage.setItem('andrea_active_user_v1', JSON.stringify({
      id: 'dev-user-1',
      name: 'Ángel (Tonet)',
      email: 'tonet@andrea.app',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      partnerId: 'dev-user-2',
      role: 'user1'
    }));
  });
  await page.reload({ waitUntil: 'networkidle' });

  // 2. Check surprises in calendar
  await page.goto(`${LOCAL_URL}/calendar`, { waitUntil: 'networkidle' });
  const angelCalendarText = await page.evaluate(() => document.body.innerText);

  // 3. Switch to Andrea
  await page.evaluate(() => {
    localStorage.setItem('andrea_active_dev_role', 'user2');
    localStorage.setItem('andrea_active_user_v1', JSON.stringify({
      id: 'dev-user-2',
      name: 'Andrea',
      email: 'andrea@andrea.app',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      partnerId: 'dev-user-1',
      role: 'user2'
    }));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const andreaCalendarText = await page.evaluate(() => document.body.innerText);
  const andreaStorageDump = await page.evaluate(() => localStorage.getItem('andrea_events_v2'));

  results.privacyMatrix = {
    angelCanSeeSurpriseTitle: angelCalendarText.includes('Sorpresa') || angelCalendarText.includes('Cena'),
    andreaCanSeeSurpriseSpoilersInUI: andreaCalendarText.includes('Cena Secreta') || andreaCalendarText.includes('Anillo'),
    eventsRawInAndreaLocalStorage: andreaStorageDump,
    isDataBlindCryptographic: false, // Plaintext events in storage
  };

  // ── 4. NEGATIVE TEST CASES ──
  console.log('\n================ Testing Negative Cases ================');
  // Negative Case 1: Corrupt JSON in storage
  await page.evaluate(() => {
    localStorage.setItem('andrea_wishes_v1', '{corrupt-json-test:::');
    localStorage.setItem('andrea_places_v4', 'undefined');
  });
  let appCrashedOnCorruptStorage = false;
  try {
    await page.reload({ waitUntil: 'networkidle', timeout: 10000 });
    const content = await page.content();
    appCrashedOnCorruptStorage = content.includes('Application Error') || content.includes('Uncaught SyntaxError');
  } catch (e) {
    appCrashedOnCorruptStorage = true;
  }
  results.negativeCases.corruptStorageHandledGracefully = !appCrashedOnCorruptStorage;

  // Negative Case 2: Submit empty wish
  await page.goto(`${LOCAL_URL}/wishes`, { waitUntil: 'networkidle' });
  const addWishBtn = await page.locator('text=+ Guardar deseo');
  if (await addWishBtn.count() > 0) {
    await addWishBtn.click();
    await page.waitForTimeout(500);
    const saveBtn = await page.locator('text=Guardar deseo').last();
    let dialogTriggered = false;
    page.once('dialog', async dialog => {
      dialogTriggered = true;
      await dialog.accept();
    });
    await saveBtn.click();
    await page.waitForTimeout(500);
    results.negativeCases.emptyWishBlocked = dialogTriggered;
  }

  // ── 5. PERFORMANCE METRICS ──
  console.log('\n================ Measuring Performance ================');
  await page.goto(`${LOCAL_URL}/home`, { waitUntil: 'networkidle' });
  const perfMetrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const domNodes = document.querySelectorAll('*').length;
    return {
      domNodes,
      domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0,
      loadMs: nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0,
    };
  });
  results.performance = perfMetrics;

  await browser.close();

  fs.writeFileSync('scratch/audit_results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('\nAudit completed successfully. Results saved to scratch/audit_results.json');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
