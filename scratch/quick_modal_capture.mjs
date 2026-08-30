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
  console.log('🚀 Quick Modal Capture...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();
  page.on('dialog', d => d.accept());

  await page.goto('http://127.0.0.1:8081', { waitUntil: 'commit' });
  await page.waitForTimeout(3000);

  // 1. Dynamic Island expanded
  try {
    const pill = page.locator('text=En sintonía, text=Sorpresa preparada').first();
    if (await pill.isVisible()) {
      await pill.click({ force: true });
      await page.waitForTimeout(500);
      await capture(page, '02_nido_dynamic_island_expanded', 'Dynamic Island expanded state');
      await page.locator('text=✕').first().click({ force: true });
      await page.waitForTimeout(300);
    }
  } catch (e) {}

  // 2. Go to Wishes Tab
  await page.locator('text=Deseos').first().click({ force: true });
  await page.waitForTimeout(1000);

  // 2.1 Add Wish Modal
  try {
    const addWish = page.locator('text=+ Guardar deseo').first();
    if (await addWish.isVisible()) {
      await addWish.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '11_deseos_add_wish_modal_empty', 'Add wish modal with zero-friction category selector');

      const urlInput = page.locator('input[placeholder*="enlace"], input[placeholder*="Pega"]').first();
      if (await urlInput.isVisible()) {
        await urlInput.fill('https://www.sezane.com/es/product/bolso-claude/caramelo');
        await page.waitForTimeout(1200);
        await capture(page, '12_deseos_add_wish_url_autofilled', 'Autofill metadata loaded');
      }

      await page.locator('text=✕, text=Cancelar').first().click({ force: true });
      await page.waitForTimeout(400);
    }
  } catch (e) {}

  // 2.2 Fulfill Wish Modal
  try {
    const fulfill = page.locator('text=Se hizo realidad').first();
    if (await fulfill.isVisible()) {
      await fulfill.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '14_deseos_fulfill_modal', 'Fulfill wish conversion modal');
      await page.locator('text=✕, text=Cerrar').first().click({ force: true });
      await page.waitForTimeout(400);
    }
  } catch (e) {}

  // 3. Go to Calendar Tab
  await page.locator('text=Calendario').first().click({ force: true });
  await page.waitForTimeout(1000);

  // 3.1 Universal Create Modal
  try {
    const addPlan = page.locator('text=+ Añadir cita / plan, text=+ Plan').first();
    if (await addPlan.isVisible()) {
      await addPlan.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '19_calendario_universal_create_modal', 'Universal Create Plan sheet');
      await page.locator('text=✕, text=Cancelar').first().click({ force: true });
      await page.waitForTimeout(400);
    }
  } catch (e) {}

  // 4. Go to Map Tab
  await page.locator('text=Mapa').first().click({ force: true });
  await page.waitForTimeout(3000);

  // 4.1 Click Map Pin
  try {
    const pin = page.locator('.andrea-pin-marker-wrapper').first();
    if (await pin.isVisible()) {
      await pin.click({ force: true });
      await page.waitForTimeout(800);
      await capture(page, '24_mapa_pin_selected_bottom_sheet', 'MapBottomSheet open');
      await page.locator('text=✕').first().click({ force: true });
      await page.waitForTimeout(400);
    }
  } catch (e) {}

  // 5. Profile & Settings Modal Sheet
  await page.mouse.click(390 - 35, 25);
  await page.waitForTimeout(800);

  // 5.1 Edit Photo Modal
  try {
    const editPhoto = page.locator('text=Editar Foto y Nombre, text=MI PERFIL').first();
    if (await editPhoto.isVisible()) {
      await editPhoto.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '28_cuenta_edit_photo_modal', 'Edit Portrait Sub-Modal');
      await page.locator('text=✕').first().click({ force: true });
      await page.waitForTimeout(400);
    }
  } catch (e) {}

  console.log('✅ Modals capture finished!');
  await browser.close();
}

run();
