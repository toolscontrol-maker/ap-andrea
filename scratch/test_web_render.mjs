import { chromium } from 'playwright';

async function testWebRender() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  page.on('console', (msg) => console.log('Browser log:', msg.text()));
  page.on('pageerror', (err) => console.log('Browser error:', err.message));

  console.log('1. Loading http://localhost:8081 ...');
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 2000));

  const url = page.url();
  console.log('Current URL:', url);
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Body text length:', text.length);
  console.log('Body snippet:', text.slice(0, 300));

  await page.screenshot({ path: 'scratch/screenshot_desktop.png' });
  console.log('Saved screenshot to scratch/screenshot_desktop.png');

  await browser.close();
}

testWebRender().catch(console.error);
