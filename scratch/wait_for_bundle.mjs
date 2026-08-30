import { chromium } from 'playwright';

async function waitForNewBundleAndVerify() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  let attempts = 0;
  while (attempts < 10) {
    attempts++;
    console.log(`Checking deployment attempt #${attempts}...`);

    const logs = [];
    page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));

    await page.goto(`https://ap-andrea.vercel.app/?t=${Date.now()}`, { waitUntil: 'networkidle' });
    await new Promise((r) => setTimeout(r, 2000));
    await page.getByText('Tonet').click();
    await new Promise((r) => setTimeout(r, 2000));

    await page.goto(`https://ap-andrea.vercel.app/map?t=${Date.now()}`, { waitUntil: 'networkidle' });
    await new Promise((r) => setTimeout(r, 4000));

    const bundleScript = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script')).map((s) => s.src);
      return scripts.find((s) => s.includes('entry-')) || '';
    });
    console.log('Active Entry Bundle:', bundleScript);

    const typeErrors = logs.filter((l) => l.includes('TypeError') || l.includes('load error'));
    console.log('Type Errors found:', typeErrors);

    if (!bundleScript.includes('b8e21b0d7bac06596ce0560f532e6f5b')) {
      console.log('✅ New bundle is now live and serving traffic!');
      console.log('Errors on new bundle:', typeErrors.length);
      break;
    }

    console.log('Old bundle still cached on edge, waiting 10s...');
    await new Promise((r) => setTimeout(r, 10000));
  }

  await browser.close();
}

waitForNewBundleAndVerify().catch(console.error);
