import { chromium } from 'playwright';

async function verifyFinal() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });

  const logs = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));

  await page.goto('https://ap-andrea.vercel.app/', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.getByText('Tonet').click();
  await new Promise((r) => setTimeout(r, 2000));

  await page.goto('https://ap-andrea.vercel.app/map', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 4000));

  const errs = logs.filter((l) => l.includes('[error]') || l.includes('load error'));
  console.log('Errors count:', errs.length);
  if (errs.length > 0) {
    console.log(errs.join('\n'));
  }

  const isMapContainerPopulated = await page.evaluate(() => {
    const mapDiv = document.querySelector('div[style*="position: absolute"]');
    return Boolean(mapDiv && mapDiv.children.length > 0);
  });
  console.log('¿Google Maps instanciado y dibujado en pantalla?:', isMapContainerPopulated);

  await browser.close();
}

verifyFinal().catch(console.error);
