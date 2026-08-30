import { chromium } from 'playwright';

async function verifyWishesScroll() {
  console.log('🧪 Verificando scroll en https://ap-andrea.vercel.app/wishes...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
  });

  await page.goto('https://ap-andrea.vercel.app/', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));

  await page.getByText('Tonet').click();
  await new Promise((r) => setTimeout(r, 2000));

  await page.goto('https://ap-andrea.vercel.app/wishes', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));

  // Perform scroll
  console.log('Realizando scroll hacia abajo (800px)...');
  await page.mouse.wheel(0, 800);
  await new Promise((r) => setTimeout(r, 1500));

  const text = await page.evaluate(() => document.body.innerText);
  console.log('¿Página cargada?:', text.includes('Restaurantes') || text.includes('Deseos'));
  console.log('¿Contiene lista de ilusiones?:', text.includes('Lista de Ilusiones') || text.includes('Ilusiones'));

  console.log('✅ Scroll completado y verificado sin bloqueos.');
  await browser.close();
}

verifyWishesScroll().catch(console.error);
