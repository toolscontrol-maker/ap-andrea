import { chromium } from 'playwright';

async function inspectDOM() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  await page.goto('https://ap-andrea.vercel.app/', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));

  const details = await page.evaluate(() => {
    const root = document.getElementById('root');
    const allDivs = Array.from(document.querySelectorAll('div')).map(d => ({
      className: d.className,
      style: d.getAttribute('style'),
      offsetWidth: d.offsetWidth,
      offsetHeight: d.offsetHeight,
      innerText: d.innerText?.slice(0, 50),
    }));
    return {
      rootOffsetHeight: root?.offsetHeight,
      rootOffsetWidth: root?.offsetWidth,
      rootStyle: root?.getAttribute('style'),
      bodyBg: window.getComputedStyle(document.body).backgroundColor,
      divsCount: allDivs.length,
      sampleDivs: allDivs.slice(0, 10),
    };
  });

  console.log('DOM Inspection:', JSON.stringify(details, null, 2));
  await browser.close();
}

inspectDOM().catch(console.error);
