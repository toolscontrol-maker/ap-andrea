import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const client = createClient(
  'https://qxnsksrdqmrsjsqxyxtq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bnNrc3JkcW1yc2pzcXh5eHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTI3NTcsImV4cCI6MjEwMzY2ODc1N30.8m5344vd4KAJixsz0H3xrY3iFdpou8AJRswtLXacdh8'
);

async function testPhotoUploadLive() {
  console.log('--- TESTING PHOTO UPLOAD IN BROWSER ---');
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

  // Go to Account
  await page.goto('https://ap-andrea.vercel.app/(tabs)/account');
  await page.waitForTimeout(2000);

  // Click on Avatar or Edit Profile
  const avatarBtn = await page.$('text=T, text=Tonet');
  if (avatarBtn) {
    console.log('Opening profile modal...');
    await avatarBtn.click();
    await page.waitForTimeout(1500);

    // Click on photo preset or upload
    const presetImages = await page.$$('img');
    console.log('Found images in modal:', presetImages.length);

    // Click Guardar Foto / Guardar
    const saveBtn = await page.$('text=Guardar Foto, text=Guardar');
    if (saveBtn) {
      console.log('Clicking Guardar Foto...');
      await saveBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  await browser.close();

  // Check profiles in Supabase
  const { data } = await client.from('profiles').select('*').eq('couple_id', 'andrea-tonet');
  console.log('--- PROFILES IN SUPABASE AFTER TEST ---');
  console.log(data);
}

testPhotoUploadLive().catch(console.error);
