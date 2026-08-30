import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bnNrc3JkcW1yc2pzcXh5eHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTI3NTcsImV4cCI6MjEwMzY2ODc1N30.8m5344vd4KAJixsz0H3xrY3iFdpou8AJRswtLXacdh8';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runLiveVerification() {
  console.log('--- 1. VERIFYING SUPABASE STATE BEFORE ---');
  const { data: initialWishes } = await client.from('wishes').select('id, title, couple_id').eq('couple_id', 'andrea-tonet');
  console.log('Wishes in Supabase before:', initialWishes.map(w => w.title));

  console.log('--- 2. OPENING BROWSER ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.text()}`));

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
    await page.waitForTimeout(1000);

    const inputs = await page.$$('input');
    console.log('Found modal inputs count:', inputs.length);

    // Fill title
    if (inputs.length >= 2) {
      await inputs[1].fill('Collar Alhambra Van Cleef');
    } else if (inputs.length === 1) {
      await inputs[0].fill('Collar Alhambra Van Cleef');
    }

    await page.waitForTimeout(500);

    // Save
    const saveBtn = await page.$('text=Guardar deseo, text=Guardar Deseo');
    if (saveBtn) {
      console.log('Submitting wish...');
      await saveBtn.click();
      await page.waitForTimeout(4000);
    }
  }

  await browser.close();

  console.log('--- 3. VERIFYING SUPABASE STATE AFTER ---');
  const { data: afterWishes } = await client.from('wishes').select('id, title, couple_id, created_at').eq('couple_id', 'andrea-tonet').order('created_at', { ascending: false });
  console.log('Wishes in Supabase after:', afterWishes.map(w => w.title));
}

runLiveVerification().catch(console.error);
