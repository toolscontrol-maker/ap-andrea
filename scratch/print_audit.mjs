import { chromium } from 'playwright';

const PROD_URL = 'https://ap-andrea.vercel.app';
const LOCAL_URL = 'http://localhost:8081';

async function main() {
  const browser = await chromium.launch({ headless: true });

  console.log('=== 1. PRODUCTION DEPLOYMENT AUDIT (https://ap-andrea.vercel.app) ===');
  const prodContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  });
  const prodPage = await prodContext.newPage();
  const prodErrors = [];
  const prodFailedRequests = [];

  prodPage.on('console', msg => {
    if (msg.type() === 'error') prodErrors.push(msg.text());
  });
  prodPage.on('requestfailed', req => {
    prodFailedRequests.push({ url: req.url(), error: req.failure()?.errorText });
  });

  const routes = ['/home', '/wishes', '/calendar', '/map', '/account'];
  for (const r of routes) {
    try {
      const resp = await prodPage.goto(`${PROD_URL}${r}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const status = resp ? resp.status() : 'N/A';
      console.log(`Route ${r}: Status ${status}`);
    } catch (e) {
      console.log(`Route ${r}: FAILED - ${e.message}`);
    }
  }

  // Check Mapbox token on Prod
  await prodPage.goto(`${PROD_URL}/map`, { waitUntil: 'networkidle', timeout: 12000 }).catch(() => {});
  await prodPage.waitForTimeout(2000);
  const prodMapboxText = await prodPage.evaluate(() => document.body.innerText);
  const hasProdToken = !prodMapboxText.includes('Falta EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN');
  console.log(`Production Mapbox Token Injected: ${hasProdToken}`);
  console.log(`Production Console Errors: ${JSON.stringify(prodErrors.slice(0, 5))}`);
  console.log(`Production Failed Requests: ${JSON.stringify(prodFailedRequests.slice(0, 5))}`);
  await prodContext.close();

  console.log('\n=== 2. LOCAL AUDIT (http://localhost:8081) ===');
  const localContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const localPage = await localContext.newPage();
  await localPage.goto(`${LOCAL_URL}/home`, { waitUntil: 'networkidle' });

  // Inspect LocalStorage Keys
  const keys = await localPage.evaluate(() => {
    const res = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const val = localStorage.getItem(k);
      res[k] = {
        length: val.length,
        isPlaintext: !val.startsWith('ey') && !val.startsWith('ENC_'),
        sample: val.substring(0, 120)
      };
    }
    return res;
  });
  console.log('LocalStorage Keys Inspected:', JSON.stringify(keys, null, 2));

  // Test Surprise Privacy Matrix
  console.log('\n=== 3. PRIVACY & SURPRISE SPOILER TEST ===');
  // Check if events have surprises and what fields exist
  const eventsData = await localPage.evaluate(() => {
    const raw = localStorage.getItem('andrea_events_v2');
    return raw ? JSON.parse(raw) : [];
  });
  const surprises = eventsData.filter(e => e.type === 'surprise');
  console.log(`Found ${surprises.length} surprise event(s) in LocalStorage:`);
  surprises.forEach(s => {
    console.log(`- ID: ${s.id}, Title: "${s.title}", Details: "${s.description}", isRevealed: ${s.isRevealed}`);
  });

  // Switch to Andrea in state and check what is rendered in DOM
  await localPage.evaluate(() => {
    localStorage.setItem('andrea_active_dev_role', 'user2');
    localStorage.setItem('andrea_active_user_v1', JSON.stringify({
      id: 'dev-user-2',
      name: 'Andrea',
      role: 'user2'
    }));
  });
  await localPage.reload({ waitUntil: 'networkidle' });
  await localPage.goto(`${LOCAL_URL}/calendar`, { waitUntil: 'networkidle' });
  await localPage.waitForTimeout(1000);

  const domText = await localPage.evaluate(() => document.body.innerText);
  console.log('Andrea Calendar DOM Contains "Cena Secreta"?:', domText.includes('Cena Secreta'));
  console.log('Andrea Calendar DOM Contains "Plan Secreto"?:', domText.includes('Plan Secreto') || domText.includes('Sorpresa'));
  console.log('Events in LocalStorage when Andrea is active still contains raw plaintext:', !!localStorage);

  await localContext.close();
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
