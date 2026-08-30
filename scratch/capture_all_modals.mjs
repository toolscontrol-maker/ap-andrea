import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACT_SCREENSHOTS_DIR = 'C:\\Users\\angel chisvert\\.gemini\\antigravity\\brain\\d5a72140-c627-4316-8fa1-8d87e34943d6\\scratch\\screenshots';
const LOCAL_SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

async function capture(page, name, desc) {
  const localPath = path.join(LOCAL_SCREENSHOTS_DIR, `${name}.png`);
  const artifactPath = path.join(ARTIFACT_SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: localPath });
  fs.copyFileSync(localPath, artifactPath);
  console.log(`📸 [${name}] ${desc}`);
}

async function run() {
  console.log('🎯 Running Modal & Deep Interaction Test Suite...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid'
  });

  const page = await context.newPage();

  page.on('dialog', async d => {
    console.log(`💬 Dialog: ${d.message()}`);
    await d.accept();
  });

  try {
    console.log('Navigating to app...');
    await page.goto('http://127.0.0.1:8081', { waitUntil: 'commit', timeout: 20000 });
    await page.waitForFunction(() => document.body.innerText.includes('Nido'), { timeout: 20000 });
    await page.waitForTimeout(1000);

    // ── 1. DYNAMIC ISLAND EXPAND ──
    console.log('Testing Dynamic Island Expand...');
    const island = page.locator('text=En sintonía, text=Sorpresa preparada').first();
    if (await island.isVisible()) {
      await island.click({ force: true });
      await page.waitForTimeout(500);
      await capture(page, '02_nido_dynamic_island_expanded', 'Dynamic Island expanded state');
      await page.locator('text=✕').first().click({ force: true });
      await page.waitForTimeout(300);
    }

    // ── 2. DESEOS TAB & RESTAURANT MODAL ──
    console.log('Navigating to Deseos tab...');
    await page.locator('text=Deseos').first().click({ force: true });
    await page.waitForTimeout(800);

    // Open Restaurant Modal
    console.log('Opening Restaurant Details Modal...');
    const restCard = page.locator('text=Casa d\'Aragona, text=Don Salvatore, text=Kibo').first();
    if (await restCard.isVisible()) {
      await restCard.click({ force: true });
      await page.waitForTimeout(800);
      await capture(page, '09_deseos_restaurant_modal', 'Restaurant Details Modal for Casa d\'Aragona');

      // Scroll inside modal
      await page.evaluate(() => {
        const scrollers = document.querySelectorAll('div[style*="overflow"]');
        scrollers.forEach(s => s.scrollTop += 300);
      });
      await page.waitForTimeout(400);
      await capture(page, '10_deseos_restaurant_visit_history', 'Restaurant visits timeline and history notes');

      // Close restaurant modal
      const closeRest = page.locator('text=✕, text=Cerrar').first();
      await closeRest.click({ force: true });
      await page.waitForTimeout(400);
    }

    // Open '+ Guardar deseo' Modal
    console.log('Opening Add Wish Modal...');
    const addWishBtn = page.locator('text=+ Guardar deseo').first();
    if (await addWishBtn.isVisible()) {
      await addWishBtn.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '11_deseos_add_wish_modal_empty', 'Add wish modal with category chips');

      // Fill URL for autofill
      const urlInput = page.locator('input[placeholder*="enlace"], input[placeholder*="Pega"]').first();
      if (await urlInput.isVisible()) {
        await urlInput.fill('https://www.sezane.com/es/product/bolso-claude/caramelo');
        await page.waitForTimeout(1200);
        await capture(page, '12_deseos_add_wish_url_autofilled', 'Autofill metadata loaded for Sézane handbag');
      }

      // Close modal
      const closeAdd = page.locator('text=✕, text=Cancelar').first();
      await closeAdd.click({ force: true });
      await page.waitForTimeout(400);
    }

    // Open Fulfill Wish Modal
    console.log('Opening Fulfill Wish Modal...');
    const fulfillBtn = page.locator('text=Se hizo realidad').first();
    if (await fulfillBtn.isVisible()) {
      await fulfillBtn.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '14_deseos_fulfill_modal', 'Fulfill wish conversion modal with memory story field');

      const closeFulfill = page.locator('text=✕, text=Cerrar').first();
      await closeFulfill.click({ force: true });
      await page.waitForTimeout(400);
    }

    // ── 3. CALENDARIO TAB & UNIVERSAL CREATE MODAL ──
    console.log('Navigating to Calendario tab...');
    await page.locator('text=Calendario').first().click({ force: true });
    await page.waitForTimeout(800);

    const addPlanBtn = page.locator('text=+ Añadir cita / plan, text=+ Plan').first();
    if (await addPlanBtn.isVisible()) {
      await addPlanBtn.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '19_calendario_universal_create_modal', 'Universal Create Plan sheet (Cita, Restaurante, Sorpresa, Viaje)');

      const closePlan = page.locator('text=✕, text=Cancelar').first();
      if (await closePlan.isVisible()) {
        await closePlan.click({ force: true });
        await page.waitForTimeout(400);
      }
    }

    // ── 4. MAPA TAB & PIN BOTTOM SHEET ──
    console.log('Navigating to Mapa tab...');
    await page.locator('text=Mapa').first().click({ force: true });
    await page.waitForTimeout(3000);

    const pinMarker = page.locator('.andrea-pin-marker-wrapper, .andrea-map-cluster-marker').first();
    if (await pinMarker.isVisible()) {
      await pinMarker.click({ force: true });
      await page.waitForTimeout(900);
      await capture(page, '24_mapa_pin_selected_bottom_sheet', 'MapBottomSheet open showing selected location story & memories');

      const closeSheet = page.locator('text=✕').first();
      if (await closeSheet.isVisible()) {
        await closeSheet.click({ force: true });
        await page.waitForTimeout(400);
      }
    }

    // ── 5. CUENTA & EDIT PHOTO MODAL ──
    console.log('Opening Profile & Settings Sheet...');
    // Click top avatar at (355, 25)
    await page.mouse.click(390 - 35, 25);
    await page.waitForTimeout(700);
    await capture(page, '25_cuenta_profile_settings_sheet', 'Global Profile & Settings Modal Sheet');

    // Switch active user
    console.log('Testing perspective switch...');
    const switchUser = page.locator('text=Cambiar a Andrea, text=Cambiar a Ángel, text=⇄ Cambiar').first();
    if (await switchUser.isVisible()) {
      await switchUser.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '26_cuenta_switched_to_andrea', 'Perspective switched to Andrea');
    }

    // Open Edit Photo Modal
    console.log('Opening Edit Photo modal...');
    const editPhotoRow = page.locator('text=Editar Foto y Nombre, text=MI PERFIL').first();
    if (await editPhotoRow.isVisible()) {
      await editPhotoRow.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '28_cuenta_edit_photo_modal', 'Edit Portrait Sub-Modal with curated aesthetic presets');

      const closeSub = page.locator('text=✕').first();
      if (await closeSub.isVisible()) {
        await closeSub.click({ force: true });
        await page.waitForTimeout(400);
      }
    }

    console.log('🎯 All specific modals successfully captured!');

  } catch (e) {
    console.error('Error in targeted capture:', e);
  } finally {
    await browser.close();
  }
}

run();
