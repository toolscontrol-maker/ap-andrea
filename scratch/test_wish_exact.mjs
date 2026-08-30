import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bnNrc3JkcW1yc2pzcXh5eHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTI3NTcsImV4cCI6MjEwMzY2ODc1N30.8m5344vd4KAJixsz0H3xrY3iFdpou8AJRswtLXacdh8';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testWishExact() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));

  await page.goto('https://ap-andrea.vercel.app');
  await page.waitForTimeout(2000);

  // Login
  const tonetBtn = await page.$('text=Tonet');
  if (tonetBtn) {
    await tonetBtn.click();
    await page.waitForTimeout(2500);
  }

  // Go to Wishes
  await page.goto('https://ap-andrea.vercel.app/(tabs)/wishes');
  await page.waitForTimeout(2000);

  // Click + Guardar deseo
  const addBtn = await page.$('text=+ Guardar deseo');
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(1500);

    // Locate the title input specifically:
    // In our component: placeholder="ej. Bolso Claude Piel Caramelo"
    const inputs = await page.$$('input');
    console.log('Total inputs on screen:', inputs.length);
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      console.log(`Input ${i} placeholder:`, placeholder);
      if (placeholder && (placeholder.includes('Bolso') || placeholder.includes('idea') || placeholder.includes('Claude') || placeholder.includes('ej.'))) {
        console.log(`-> Filling input ${i} with title "Collar Alhambra Van Cleef"...`);
        await inputs[i].fill('Collar Alhambra Van Cleef');
      }
    }

    await page.waitForTimeout(1000);

    // Click Guardar deseo
    const allButtons = await page.$$('[role="button"], div[tabindex="0"]');
    for (const b of allButtons) {
      const text = (await b.innerText()).trim();
      if (text === 'Guardar deseo') {
        console.log('-> Clicking button "Guardar deseo"...');
        await b.click();
        await page.waitForTimeout(4000);
        break;
      }
    }
  }

  await browser.close();

  // Verify in Supabase
  const { data } = await client.from('wishes').select('id, title, couple_id, created_at').eq('couple_id', 'andrea-tonet').order('created_at', { ascending: false }).limit(5);
  console.log('--- SUPABASE WISHES FINAL RESULT ---');
  console.log(data);
}

testWishExact().catch(console.error);
