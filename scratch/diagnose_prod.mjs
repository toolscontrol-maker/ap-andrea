import { chromium } from 'playwright';

async function diagnoseProd() {
  console.log('🔍 Diagnosticando https://ap-andrea.vercel.app ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    } else {
      console.log('ℹ️ Console Log:', msg.text());
    }
  });

  page.on('pageerror', (err) => {
    errors.push(err.message);
    console.log('💥 Page Error:', err.message, err.stack);
  });

  try {
    const response = await page.goto('https://ap-andrea.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 15000,
    });
    console.log('Status code:', response?.status());
  } catch (e) {
    console.log('Navigation timeout/error:', e.message);
  }

  await new Promise((r) => setTimeout(r, 2000));
  const html = await page.content();
  console.log('HTML length:', html.length);
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Body Text length:', text.length, 'Content preview:', text.slice(0, 200));

  await browser.close();
}

diagnoseProd().catch(console.error);
