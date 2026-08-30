import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const client = createClient(
  'https://qxnsksrdqmrsjsqxyxtq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bnNrc3JkcW1yc2pzcXh5eHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTI3NTcsImV4cCI6MjEwMzY2ODc1N30.8m5344vd4KAJixsz0H3xrY3iFdpou8AJRswtLXacdh8'
);

async function testDirectAdd() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));

  await page.goto('https://ap-andrea.vercel.app');
  await page.waitForTimeout(2000);

  // Login
  const tonetBtn = await page.$('text=Tonet');
  if (tonetBtn) {
    await tonetBtn.click();
    await page.waitForTimeout(2000);
  }

  // Go to Wishes
  await page.goto('https://ap-andrea.vercel.app/(tabs)/wishes');
  await page.waitForTimeout(2000);

  // Click + Guardar deseo
  await page.click('text=+ Guardar deseo');
  await page.waitForTimeout(1000);

  // Focus title input
  const titleInput = page.locator('input[placeholder*="ej." i]').first();
  await titleInput.fill('Collar Alhambra Van Cleef');
  await page.waitForTimeout(500);

  // Click Guardar deseo
  await page.click('text=Guardar deseo');
  await page.waitForTimeout(3000);

  // Take screenshot of wishes tab
  await page.screenshot({ path: 'scratch/wishes_after_direct_add.png' });

  await browser.close();

  // Query Supabase
  const { data } = await client.from('wishes').select('id, title, couple_id, created_at').eq('couple_id', 'andrea-tonet').order('created_at', { ascending: false });
  console.log('--- SUPABASE WISHES AFTER DIRECT TEST ---');
  console.log(data);
}

testDirectAdd().catch(console.error);
