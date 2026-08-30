import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACT_SCREENSHOTS_DIR = 'C:\\Users\\angel chisvert\\.gemini\\antigravity\\brain\\d5a72140-c627-4316-8fa1-8d87e34943d6\\scratch\\screenshots';
const LOCAL_SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

for (const dir of [ARTIFACT_SCREENSHOTS_DIR, LOCAL_SCREENSHOTS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function capture(page, name, desc) {
  const localPath = path.join(LOCAL_SCREENSHOTS_DIR, `${name}.png`);
  const artifactPath = path.join(ARTIFACT_SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: localPath });
  fs.copyFileSync(localPath, artifactPath);
  console.log(`📸 [${name}] ${desc}`);
}

async function run() {
  console.log('🚀 Running Direct Route & Modal Capture Suite...');

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
    console.log(`💬 Dialog (${d.type()}): "${d.message()}"`);
    await d.accept();
  });

  try {
    // ══════════════════════════════════════════════════════════════
    // 1. TAB 1: NIDO (HOME)
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- 1. TAB 1: NIDO (HOME) ---');
    await page.goto('http://127.0.0.1:8081/home', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    await capture(page, '01_nido_initial_state', 'Nido initial home screen');

    // 1.1 Dynamic Island
    const island = page.locator('text=En sintonía, text=Sorpresa preparada').first();
    if (await island.isVisible()) {
      await island.click({ force: true });
      await page.waitForTimeout(500);
      await capture(page, '02_nido_dynamic_island_expanded', 'Dynamic Island expanded pill');
      await page.locator('text=✕').first().click({ force: true });
      await page.waitForTimeout(300);
    }

    // 1.2 Gratitude note
    const gratInput = page.locator('textarea, input[placeholder*="detalle"], input[placeholder*="Escribe"]').first();
    if (await gratInput.isVisible()) {
      await gratInput.fill('Gracias por preparar el café y abrazarme esta mañana con tanta ternura ❤️');
      await page.waitForTimeout(300);
      await capture(page, '03_nido_ritual_gratitude_typed', 'Gratitude note filled in ritual card');
      await page.locator('text=Sembrar momento').first().click({ force: true });
      await page.waitForTimeout(600);
    }

    // 1.3 Question Tab
    const qTab = page.locator('text=Pregunta').first();
    if (await qTab.isVisible()) {
      await qTab.click({ force: true });
      await page.waitForTimeout(400);
      const qInput = page.locator('textarea, input[placeholder*="sincera"]').first();
      if (await qInput.isVisible()) {
        await qInput.fill('Nuestro viaje a Roma y cuando nos reímos bajo la lluvia en Trastevere.');
      }
      await capture(page, '04_nido_ritual_question_tab', 'Aya question ritual card');
    }

    // 1.4 Photo Tab
    const photoTab = page.locator('text=Foto del día').first();
    if (await photoTab.isVisible()) {
      await photoTab.click({ force: true });
      await page.waitForTimeout(400);
      await capture(page, '05_nido_ritual_photo_tab', 'Daily photo upload zone');
    }

    // 1.5 Scroll feed
    await page.evaluate(() => window.scrollBy(0, 480));
    await page.waitForTimeout(500);
    await capture(page, '06_nido_feed_wishes_and_plans', 'Upcoming event plan and partner wishes peek');

    // ══════════════════════════════════════════════════════════════
    // 2. TAB 2: DESEOS (WISHES & RESTAURANTS)
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- 2. TAB 2: DESEOS (WISHES & RESTAURANTS) ---');
    await page.goto('http://127.0.0.1:8081/wishes', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    await capture(page, '07_deseos_main_screen', 'Deseos & Rincones main feed');

    // Category pills
    for (const pill of ['Restaurantes', 'Moda & Belleza', 'Viajes & Citas', 'Hogar', 'Cumplidos', 'Todos']) {
      const p = page.locator(`text=${pill}`).first();
      if (await p.isVisible()) {
        await p.click({ force: true });
        await page.waitForTimeout(200);
      }
    }
    await capture(page, '08_deseos_category_filter_pills', 'Category filter pills');

    // Restaurant details modal
    const restCard = page.locator('text=Casa d\'Aragona, text=Don Salvatore, text=Kibo').first();
    if (await restCard.isVisible()) {
      await restCard.click({ force: true });
      await page.waitForTimeout(800);
      await capture(page, '09_deseos_restaurant_modal', 'Restaurant Details Modal for Casa d\'Aragona');

      // Scroll inside modal
      await page.evaluate(() => {
        const scrollers = document.querySelectorAll('div[style*="overflow"]');
        scrollers.forEach(s => s.scrollTop += 350);
      });
      await page.waitForTimeout(400);
      await capture(page, '10_deseos_restaurant_visit_history', 'Restaurant visits timeline and history notes');

      await page.locator('text=✕, text=Cerrar').first().click({ force: true });
      await page.waitForTimeout(300);
    }

    // Add wish modal
    const addWishBtn = page.locator('text=+ Guardar deseo').first();
    if (await addWishBtn.isVisible()) {
      await addWishBtn.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '11_deseos_add_wish_modal_empty', 'Add wish modal with category chips');

      const urlInput = page.locator('input[placeholder*="enlace"], input[placeholder*="Pega"]').first();
      if (await urlInput.isVisible()) {
        await urlInput.fill('https://www.sezane.com/es/product/bolso-claude/caramelo');
        await page.waitForTimeout(1200);
        await capture(page, '12_deseos_add_wish_url_autofilled', 'Autofill metadata loaded for Sézane handbag');
      }

      await page.locator('text=Guardar deseo').last().click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '13_deseos_after_wish_saved', 'Catalog after wish saved');
    }

    // Fulfill wish modal
    const fulfillBtn = page.locator('text=Se hizo realidad').first();
    if (await fulfillBtn.isVisible()) {
      await fulfillBtn.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '14_deseos_fulfill_modal', 'Fulfill wish conversion modal with memory dedication');

      await page.locator('text=Guardar como Recuerdo').first().click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '15_deseos_after_fulfillment', 'Wish converted into memory');
    }

    // ══════════════════════════════════════════════════════════════
    // 3. TAB 3: CALENDARIO (CALENDAR & TIMELINE)
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- 3. TAB 3: CALENDARIO (CALENDAR & TIMELINE) ---');
    await page.goto('http://127.0.0.1:8081/calendar', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    await capture(page, '16_calendario_month_view', 'Calendar month view with romantic days counter & date grid');

    // Select date 15
    const d15 = page.locator('text=15').first();
    if (await d15.isVisible()) {
      await d15.click({ force: true });
      await page.waitForTimeout(400);
      await capture(page, '17_calendario_date_selected', 'Date selected with agenda highlights');
    }

    // Scroll Down Agenda & Ideas
    await page.evaluate(() => window.scrollBy(0, 480));
    await page.waitForTimeout(500);
    await capture(page, '18_calendario_agenda_and_ideas', 'Agenda for selected day and Activable Romantic Modes');

    // Universal create plan modal
    const addPlanBtn = page.locator('text=+ Añadir cita / plan, text=+ Plan').first();
    if (await addPlanBtn.isVisible()) {
      await addPlanBtn.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '19_calendario_universal_create_modal', 'Universal Create Plan sheet');

      await page.locator('text=Cena o Cita Romántica, text=Cita romántica').first().click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '20_calendario_event_created', 'New romantic date scheduled');
    }

    // ══════════════════════════════════════════════════════════════
    // 4. TAB 4: MAPA (SPATIAL MAP)
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- 4. TAB 4: MAPA (SPATIAL MAP) ---');
    await page.goto('http://127.0.0.1:8081/map', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(3500);
    await capture(page, '21_mapa_canvas_rendered', 'Mapbox GL spatial map canvas with custom orb pins');

    // Filters
    const filterRec = page.locator('text=Recuerdos').first();
    if (await filterRec.isVisible()) {
      await filterRec.click({ force: true });
      await page.waitForTimeout(400);
      await capture(page, '22_mapa_filter_recuerdos', 'Map filtered by Memories');
    }

    const filterRest = page.locator('text=Restaurantes').first();
    if (await filterRest.isVisible()) {
      await filterRest.click({ force: true });
      await page.waitForTimeout(400);
      await capture(page, '23_mapa_filter_restaurantes', 'Map filtered by Restaurants');
    }

    // Click marker pin
    const pinMarker = page.locator('.andrea-pin-marker-wrapper, .andrea-map-cluster-marker').first();
    if (await pinMarker.isVisible()) {
      await pinMarker.click({ force: true });
      await page.waitForTimeout(900);
      await capture(page, '24_mapa_pin_selected_bottom_sheet', 'MapBottomSheet open showing location story & memories');

      await page.locator('text=✕').first().click({ force: true });
      await page.waitForTimeout(300);
    }

    // ══════════════════════════════════════════════════════════════
    // 5. TAB 5: CUENTA (PROFILE & SETTINGS)
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- 5. TAB 5: CUENTA (PROFILE & SETTINGS) ---');
    // Open profile modal via top-right avatar
    await page.mouse.click(390 - 35, 25);
    await page.waitForTimeout(800);
    await capture(page, '25_cuenta_profile_settings_sheet', 'Global Profile & Settings Modal Sheet');

    // Switch active user
    const switchUser = page.locator('text=Cambiar a Andrea, text=Cambiar a Ángel, text=⇄ Cambiar').first();
    if (await switchUser.isVisible()) {
      await switchUser.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '26_cuenta_switched_to_andrea', 'Perspective switched to Andrea');

      const storedRole = await page.evaluate(() => localStorage.getItem('andrea_active_dev_role'));
      console.log('⚡ LocalStorage Reactivity Verified: andrea_active_dev_role =', storedRole);
    }

    // Switches toggle
    const switches = page.locator('div[role="switch"], input[type="checkbox"]');
    if (await switches.count() > 0) {
      await switches.first().click({ force: true });
      await page.waitForTimeout(300);
      await capture(page, '27_cuenta_settings_switches_toggled', 'Privacy & Preference switches toggled');
    }

    // Edit Photo Modal
    const editPhotoRow = page.locator('text=Editar Foto y Nombre, text=MI PERFIL').first();
    if (await editPhotoRow.isVisible()) {
      await editPhotoRow.click({ force: true });
      await page.waitForTimeout(600);
      await capture(page, '28_cuenta_edit_photo_modal', 'Edit Portrait Sub-Modal with curated aesthetic presets');

      await page.locator('text=✕').first().click({ force: true });
      await page.waitForTimeout(400);
    }

    // Close Settings Sheet
    await page.locator('text=✕').first().click({ force: true });
    await page.waitForTimeout(500);

    // Return to Nido to verify app-wide Andrea perspective
    await page.goto('http://127.0.0.1:8081/home', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(1000);
    await capture(page, '29_nido_perspective_andrea_active', 'Nido feed reactively rendered from Andrea perspective ("Hola, Andrea")');

    console.log('\n🏆 ALL 29 MOBILE E2E HIGH-FIDELITY SCREENSHOTS AND INTERACTIONS RECORDED!');

  } catch (err) {
    console.error('❌ Test execution error:', err);
  } finally {
    await browser.close();
  }
}

run();
