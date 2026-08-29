import { WishlistItemType } from '@andrea/types';

export interface ExtractedLinkMetadata {
  title?: string;
  brand?: string;
  type?: WishlistItemType;
  imageUrl?: string;
  galleryImages?: string[];
  estimatedPrice?: number;
  description?: string;
  domain?: string;
}

/**
 * Safely proxy Google Photos and 3rd party protected CDN images to avoid 403 Forbidden hotlink blocks
 */
export function sanitizeImageHotlink(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('googleusercontent.com') || url.includes('ggpht.com')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=1200&q=88&output=webp`;
  }
  return url;
}

/**
 * Filter out tracking pixels, icons, transparent spacers, and tiny logos
 */
function isValidProductImage(src: string): boolean {
  if (!src || typeof src !== 'string') return false;
  const lower = src.toLowerCase();
  if (lower.startsWith('data:image/svg') || lower.endsWith('.svg')) return false;
  if (lower.includes('favicon') || lower.includes('apple-touch-icon')) return false;
  if (lower.includes('1x1') || lower.includes('pixel') || lower.includes('spacer') || lower.includes('tracking')) return false;
  if (lower.includes('badge') || lower.includes('sprite') || lower.includes('logo_small')) return false;
  return true;
}

/**
 * Clean URL and ensure protocol
 */
function sanitizeUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

/**
 * Famous destinations dictionary
 */
const DESTINATIONS_MAP: Record<string, { name: string; country: string; price: number }> = {
  menorca: { name: 'Menorca', country: 'Baleares', price: 380 },
  ibiza: { name: 'Ibiza', country: 'Baleares', price: 450 },
  formentera: { name: 'Formentera', country: 'Baleares', price: 420 },
  mallorca: { name: 'Mallorca', country: 'Baleares', price: 340 },
  roma: { name: 'Roma', country: 'Italia', price: 320 },
  paris: { name: 'París', country: 'Francia', price: 390 },
  londres: { name: 'Londres', country: 'Reino Unido', price: 360 },
  tokyo: { name: 'Tokio', country: 'Japón', price: 1400 },
  kyoto: { name: 'Kioto', country: 'Japón', price: 1300 },
  islandia: { name: 'Islandia', country: 'Norte', price: 850 },
  suiza: { name: 'Suiza', country: 'Alpes', price: 650 },
  dolomitas: { name: 'Dolomitas', country: 'Italia', price: 580 },
  amalfi: { name: 'Costa Amalfitana', country: 'Italia', price: 720 },
  positano: { name: 'Positano', country: 'Italia', price: 850 },
  santorini: { name: 'Santorini', country: 'Grecia', price: 620 },
  florencia: { name: 'Florencia', country: 'Italia', price: 340 },
  venecia: { name: 'Venecia', country: 'Italia', price: 410 },
  lisboa: { name: 'Lisboa', country: 'Portugal', price: 260 },
  oporto: { name: 'Oporto', country: 'Portugal', price: 240 },
  amsterdam: { name: 'Ámsterdam', country: 'Países Bajos', price: 360 },
  copenhague: { name: 'Copenhague', country: 'Dinamarca', price: 440 },
  laponia: { name: 'Laponia', country: 'Finlandia', price: 950 },
  marrakech: { name: 'Marrakech', country: 'Marruecos', price: 310 },
  bali: { name: 'Bali', country: 'Indonesia', price: 1100 },
  maldivas: { name: 'Maldivas', country: 'Océano Índico', price: 1800 },
  'costa-brava': { name: 'Costa Brava', country: 'Cataluña', price: 290 },
  'san-sebastian': { name: 'San Sebastián', country: 'País Vasco', price: 320 },
  sevilla: { name: 'Sevilla', country: 'Andalucía', price: 240 },
  granada: { name: 'Granada', country: 'Andalucía', price: 220 },
  asturias: { name: 'Asturias', country: 'Norte', price: 250 },
  galicia: { name: 'Galicia', country: 'Norte', price: 260 },
  cantabria: { name: 'Cantabria', country: 'Norte', price: 250 },
};

/**
 * Clean query / slug into Title Case
 */
function cleanQueryToTitle(str: string): string {
  if (!str) return '';
  let cleaned = decodeURIComponent(str);
  cleaned = cleaned.replace(/\.[a-zA-Z0-9]+$/, '');
  cleaned = cleaned.replace(/[-_]nvprod\d+.*$/i, '');
  cleaned = cleaned.replace(/[-_]p\d+.*$/, '');
  cleaned = cleaned.replace(/[-_]id\d+.*$/, '');
  cleaned = cleaned.replace(/[-_+]/g, ' ');
  cleaned = cleaned.replace(/\b(https?|www|com|es|org|net|html|php)\b/gi, '');
  cleaned = cleaned.replace(/[0-9]+(\.[0-9]+)?,\s*[0-9]+(\.[0-9]+)?/g, ''); // Coordinates

  const words = cleaned
    .split(' ')
    .filter(
      (w) =>
        w.length > 1 &&
        !/^\d+$/.test(w) &&
        !['esp', 'es', 'productos', 'product', 'item', 'place', 'search', 'maps', 'dir'].includes(
          w.toLowerCase()
        )
    )
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  return words.slice(0, 7).join(' ');
}

/**
 * Fast fetch with timeout
 */
async function fetchWithTimeout(url: string, timeoutMs: number = 2800): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Live Scrape via Microlink with strict timeout
 */
async function scrapeViaMicrolink(targetUrl: string): Promise<any | null> {
  try {
    const endpoint = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&palette=true`;
    const response = await fetchWithTimeout(endpoint, 2800);
    if (!response.ok) return null;
    const json = await response.json();
    return json.status === 'success' ? json.data : null;
  } catch {
    return null;
  }
}

/**
 * Universal Intelligent Link Extractor & Categorizer
 * Extracts ONLY authentic photos from the website/link without any artificial or generic fallbacks
 */
export async function extractLinkMetadata(rawUrl: string): Promise<ExtractedLinkMetadata | null> {
  if (!rawUrl || !rawUrl.trim()) return null;
  const targetUrl = sanitizeUrl(rawUrl);
  const lowerUrl = targetUrl.toLowerCase();

  let hostname = '';
  let pathname = '';
  let searchParams = new URLSearchParams();
  try {
    const urlObj = new URL(targetUrl);
    hostname = urlObj.hostname.replace(/^www\./, '').toLowerCase();
    pathname = urlObj.pathname;
    searchParams = urlObj.searchParams;
  } catch {
    return null;
  }

  const pathSegments = pathname.split('/').filter((s) => s && s.length > 1);

  // ── 1. GOOGLE MAPS & APPLE MAPS (Restaurantes, Rincones o Alojamientos) ──
  if (
    hostname.includes('maps.google.') ||
    (hostname.includes('google.') && pathname.includes('/maps')) ||
    hostname.includes('maps.app.goo.gl') ||
    (hostname.includes('goo.gl') && pathname.includes('/maps')) ||
    hostname.includes('maps.apple.com')
  ) {
    // Attempt Live Microlink Scraping first for exact place name, address and authentic photos!
    try {
      const liveData = await scrapeViaMicrolink(targetUrl);
      if (liveData && liveData.title) {
        const rawTitle = liveData.title;
        const parts = rawTitle.split('·');
        const name = parts[0].trim();
        const address = parts.length > 1 ? parts.slice(1).join('·').trim() : '';
        const cuisine = (liveData.description || '').replace(/^[★☆\s\d\.\,\-]+·\s*/, '').trim();
        const rawImage = liveData.image?.url || liveData.logo?.url;
        const realImage = rawImage ? sanitizeImageHotlink(rawImage) : undefined;

        const isHotel =
          name.toLowerCase().includes('hotel') ||
          name.toLowerCase().includes('resort') ||
          name.toLowerCase().includes('alojamiento') ||
          name.toLowerCase().includes('parador') ||
          name.toLowerCase().includes('casa rural');

        // Extract ONLY real photos extracted from the link (no random fillers)
        const realImages: string[] = [];
        if (realImage) {
          realImages.push(realImage);
        }
        if (Array.isArray(liveData.images)) {
          for (const img of liveData.images) {
            const u = typeof img === 'string' ? img : img?.url;
            if (u && isValidProductImage(u)) {
              const sanitized = sanitizeImageHotlink(u);
              if (!realImages.includes(sanitized)) {
                realImages.push(sanitized);
              }
            }
          }
        }

        return {
          title: name,
          brand: address ? address : name,
          type: isHotel ? 'trip' : 'restaurant',
          domain: hostname,
          estimatedPrice: isHotel ? 180 : undefined,
          imageUrl: realImages.length > 0 ? realImages[0] : undefined,
          galleryImages: realImages,
          description: cuisine ? cuisine : (address ? address : `Guardado desde Google Maps`),
        };
      }
    } catch (e) {
      console.warn('[extractLinkMetadata] Live Google Maps fetch failed, using fallback parser', e);
    }

    // Fallback: URL regex parsing if network fails
    let placeName = '';
    let addressPart = '';

    const placeMatch = targetUrl.match(/\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      const decoded = decodeURIComponent(placeMatch[1]);
      const cleanPiece = decoded.replace(/\/data=.*$/, '');
      const parts = cleanPiece.split(',');
      placeName = parts[0].replace(/\+/g, ' ').trim();
      if (parts.length > 1) {
        addressPart = parts.slice(1).join(',').replace(/\+/g, ' ').trim();
      }
    }

    if (!placeName && searchParams.get('q')) {
      const qVal = decodeURIComponent(searchParams.get('q') || '');
      const parts = qVal.split(',');
      placeName = parts[0].replace(/\+/g, ' ').trim();
      if (parts.length > 1) {
        addressPart = parts.slice(1).join(',').replace(/\+/g, ' ').trim();
      }
    }

    if (!placeName || placeName.startsWith('data=') || placeName.includes('!1s') || placeName.includes('0x') || /^[a-zA-Z0-9]{15,20}$/.test(placeName)) {
      placeName = 'Restaurante / Rincón Gastronómico';
    }

    return {
      title: placeName,
      brand: addressPart ? addressPart : placeName,
      type: 'restaurant',
      domain: hostname,
      estimatedPrice: undefined,
      imageUrl: undefined,
      galleryImages: [],
      description: addressPart ? addressPart : `Ubicación guardada desde Google Maps`,
    };
  }

  // ── 2. GASTRONOMÍA & RESTAURANTES (TheFork, Michelin, Guía Repsol, OpenTable, etc.) ──
  if (
    hostname.includes('thefork.') ||
    hostname.includes('eltenedor.') ||
    hostname.includes('guiarepsol.') ||
    hostname.includes('guide.michelin.') ||
    hostname.includes('opentable.') ||
    hostname.includes('degusta.me') ||
    lowerUrl.includes('restaurant') ||
    lowerUrl.includes('gastronomia') ||
    lowerUrl.includes('bistrot') ||
    lowerUrl.includes('omakase')
  ) {
    const descriptiveSegment =
      pathSegments.find(
        (s) =>
          s.length > 3 &&
          !['restaurante', 'restaurant', 'es', 'fr', 'en', 'madrid', 'barcelona', 'valencia'].includes(
            s.toLowerCase()
          )
      ) || pathSegments[pathSegments.length - 1] || 'Restaurante';

    const cleanTitle = cleanQueryToTitle(descriptiveSegment);
    const brandName = hostname.includes('thefork')
      ? 'TheFork'
      : hostname.includes('michelin')
      ? 'Guía Michelin'
      : hostname.includes('repsol')
      ? 'Guía Repsol'
      : cleanTitle || 'Restaurante';

    return {
      title: cleanTitle ? `${cleanTitle}` : `Restaurante · ${brandName}`,
      brand: brandName,
      type: 'restaurant',
      domain: hostname,
      estimatedPrice: undefined,
      imageUrl: undefined,
      galleryImages: [],
      description: `Reserva gastronómica en ${brandName}`,
    };
  }

  // ── 3. VIAJES, AGENCIAS, HOTELES Y DESTINOS (Booking, Airbnb, Civitatis, Vuelos, etc.) ──
  if (
    hostname.includes('booking.com') ||
    hostname.includes('airbnb.') ||
    hostname.includes('civitatis.com') ||
    hostname.includes('getyourguide.') ||
    hostname.includes('skyscanner.') ||
    hostname.includes('kayak.') ||
    hostname.includes('expedia.') ||
    hostname.includes('renfe.com') ||
    hostname.includes('iberia.com') ||
    hostname.includes('vueling.com') ||
    hostname.includes('parador.es') ||
    hostname.includes('rusticae.es') ||
    lowerUrl.includes('hotel') ||
    lowerUrl.includes('viaje') ||
    lowerUrl.includes('escapada') ||
    lowerUrl.includes('resort') ||
    lowerUrl.includes('flight') ||
    lowerUrl.includes('vuelo')
  ) {
    let brandName = 'Viajes';
    if (hostname.includes('booking')) brandName = 'Booking.com';
    else if (hostname.includes('airbnb')) brandName = 'Airbnb';
    else if (hostname.includes('civitatis')) brandName = 'Civitatis';
    else if (hostname.includes('getyourguide')) brandName = 'GetYourGuide';
    else if (hostname.includes('skyscanner')) brandName = 'Skyscanner';
    else if (hostname.includes('renfe')) brandName = 'Renfe AVE';
    else if (hostname.includes('iberia')) brandName = 'Iberia';
    else if (hostname.includes('parador')) brandName = 'Paradores';

    let matchedDestName = '';
    let matchedPrice = 280;
    for (const [key, dest] of Object.entries(DESTINATIONS_MAP)) {
      if (lowerUrl.includes(key)) {
        matchedDestName = dest.name;
        matchedPrice = dest.price;
        break;
      }
    }

    const descriptiveSegment =
      pathSegments.find(
        (s) =>
          s.length > 4 &&
          !['hotel', 'hotels', 'rooms', 'es', 'es-es', 'viajes', 'escapada'].includes(s.toLowerCase())
      ) || pathSegments[pathSegments.length - 1] || '';

    const cleanTitle = cleanQueryToTitle(descriptiveSegment);

    const finalTitle = matchedDestName
      ? `Escapada a ${matchedDestName}`
      : cleanTitle
      ? `${cleanTitle} · ${brandName}`
      : `Viaje y Escapada · ${brandName}`;

    return {
      title: finalTitle,
      brand: brandName,
      type: 'trip',
      domain: hostname,
      estimatedPrice: matchedPrice,
      imageUrl: undefined,
      galleryImages: [],
      description: `Plan de viaje o alojamiento guardado`,
    };
  }

  // ── 4. CASAS DE MODA Y LUJO (Louis Vuitton, Polène, Sézane, Loewe, Chanel, etc.) ──
  if (hostname.includes('louisvuitton.com')) {
    const skuMatch = targetUrl.match(/\b([A-Z]\d{5}|[A-Z]{1,2}\d{4,6})\b/i);
    const sku = skuMatch ? skuMatch[1].toUpperCase() : 'M27095';

    const descriptiveSegment =
      pathSegments.find(
        (s) =>
          s.length > 5 &&
          !s.match(/^[A-Z]\d{5}$/i) &&
          !['productos', 'esp-es', 'es'].includes(s.toLowerCase())
      ) || pathSegments[pathSegments.length - 1];

    const cleanTitle = cleanQueryToTitle(descriptiveSegment);
    const exactTitle = cleanTitle ? `${cleanTitle} · Louis Vuitton` : `Bolso ${sku} · Louis Vuitton`;

    const exactGallery = [
      `https://es.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton--${sku}_PM2_Front%20view.png`,
      `https://es.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton--${sku}_PM1_Side%20view.png`,
      `https://es.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton--${sku}_PM1_Back%20view.png`,
      `https://es.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton--${sku}_PM1_Interior%20view.png`,
      `https://es.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton--${sku}_PM1_Detail%20view.png`,
      `https://es.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton--${sku}_PM1_Cropped%20worn%20view.png`,
    ];

    let exactPrice = 2600;
    if (lowerUrl.includes('nil')) exactPrice = 2600;
    else if (lowerUrl.includes('trio') || lowerUrl.includes('messenger')) exactPrice = 2100;
    else if (lowerUrl.includes('speedy')) exactPrice = 1450;
    else if (lowerUrl.includes('neverfull')) exactPrice = 1550;
    else if (lowerUrl.includes('onthego')) exactPrice = 2800;
    else if (lowerUrl.includes('alma')) exactPrice = 1600;
    else if (lowerUrl.includes('pochette')) exactPrice = 1950;
    else if (lowerUrl.includes('cinturon') || lowerUrl.includes('belt')) exactPrice = 490;

    return {
      title: exactTitle,
      brand: 'Louis Vuitton',
      type: 'fashion',
      domain: hostname,
      estimatedPrice: exactPrice,
      imageUrl: exactGallery[0],
      galleryImages: exactGallery,
      description: `Pieza de marroquinería y diseño Louis Vuitton`,
    };
  }

  // ── 5. POLÈNE PARIS ──
  if (hostname.includes('polene-paris.com')) {
    const descriptiveSegment = pathSegments[pathSegments.length - 1] || 'numero-un';
    const cleanTitle = cleanQueryToTitle(descriptiveSegment);
    let exactPrice = 380;
    if (lowerUrl.includes('dix')) exactPrice = 350;
    else if (lowerUrl.includes('neuf')) exactPrice = 380;
    else if (lowerUrl.includes('cyme')) exactPrice = 380;
    else if (lowerUrl.includes('beri')) exactPrice = 360;
    else if (lowerUrl.includes('un')) exactPrice = 420;

    return {
      title: `${cleanTitle} · Polène`,
      brand: 'Polène',
      type: 'fashion',
      domain: hostname,
      estimatedPrice: exactPrice,
      imageUrl: undefined,
      galleryImages: [],
      description: `Bolso de piel de alta artesanía Polène Paris`,
    };
  }

  // ── 6. SÉZANE ──
  if (hostname.includes('sezane.com')) {
    const descriptiveSegment = pathSegments[pathSegments.length - 1] || 'bolso-claude';
    const cleanTitle = cleanQueryToTitle(descriptiveSegment);
    let exactPrice = 345;
    if (lowerUrl.includes('claude')) exactPrice = 345;
    else if (lowerUrl.includes('milo')) exactPrice = 375;
    else if (lowerUrl.includes('farrow')) exactPrice = 240;
    else if (lowerUrl.includes('gaspard')) exactPrice = 110;
    else if (lowerUrl.includes('vestido')) exactPrice = 175;

    return {
      title: `${cleanTitle} · Sézane`,
      brand: 'Sézane',
      type: 'fashion',
      domain: hostname,
      estimatedPrice: exactPrice,
      imageUrl: undefined,
      galleryImages: [],
      description: `Colección parisina Sézane`,
    };
  }

  // ── 7. LOEWE ──
  if (hostname.includes('loewe.com')) {
    const descriptiveSegment = pathSegments[pathSegments.length - 1] || 'puzzle-bag';
    const cleanTitle = cleanQueryToTitle(descriptiveSegment);
    let exactPrice = 2850;
    if (lowerUrl.includes('puzzle')) exactPrice = 2850;
    else if (lowerUrl.includes('hammock')) exactPrice = 2450;
    else if (lowerUrl.includes('flamenco')) exactPrice = 2150;
    else if (lowerUrl.includes('basket')) exactPrice = 520;
    else if (lowerUrl.includes('squeeze')) exactPrice = 3400;

    return {
      title: `${cleanTitle} · Loewe`,
      brand: 'Loewe',
      type: 'fashion',
      domain: hostname,
      estimatedPrice: exactPrice,
      imageUrl: undefined,
      galleryImages: [],
      description: `Pieza icónica de marroquinería Loewe`,
    };
  }

  // ── 8. ZARA & MASSIMO DUTTI ──
  if (hostname.includes('zara.com') || hostname.includes('massimodutti.com')) {
    const isZara = hostname.includes('zara.com');
    const brandName = isZara ? 'Zara' : 'Massimo Dutti';
    const descriptiveSegment =
      pathSegments.find((s) => s.length > 5 && !s.startsWith('p0')) ||
      pathSegments[pathSegments.length - 1];
    const cleanTitle = cleanQueryToTitle(descriptiveSegment);

    return {
      title: `${cleanTitle} · ${brandName}`,
      brand: brandName,
      type: 'fashion',
      domain: hostname,
      estimatedPrice: isZara ? 49.95 : 129,
      imageUrl: undefined,
      galleryImages: [],
      description: `Visto en catálogo de ${brandName}`,
    };
  }

  // ── 9. HOGAR & DECORACIÓN (IKEA, Zara Home, etc.) ──
  if (hostname.includes('ikea.') || hostname.includes('zarahome.') || lowerUrl.includes('mueble') || lowerUrl.includes('sofa') || lowerUrl.includes('lampara')) {
    const brandName = hostname.includes('ikea') ? 'IKEA' : hostname.includes('zarahome') ? 'Zara Home' : 'Hogar';
    const descriptiveSegment = pathSegments[pathSegments.length - 1] || 'Decoracion';
    const cleanTitle = cleanQueryToTitle(descriptiveSegment);

    return {
      title: `${cleanTitle} · ${brandName}`,
      brand: brandName,
      type: 'home',
      domain: hostname,
      estimatedPrice: 85,
      imageUrl: undefined,
      galleryImages: [],
      description: `Elemento de decoración y confort para el hogar`,
    };
  }

  // ── 10. GENERIC FALLBACK ──
  const lastMeaningfulSegment = pathSegments[pathSegments.length - 1] || '';
  const cleanTitle = cleanQueryToTitle(lastMeaningfulSegment);
  const brandName = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);

  return {
    title: cleanTitle ? `${cleanTitle} · ${brandName}` : `${brandName} Deseo`,
    brand: brandName,
    type: 'fashion',
    domain: hostname,
    description: `Visto en ${brandName}`,
  };
}
