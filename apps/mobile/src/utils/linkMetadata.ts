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
 * Filter out tracking pixels, icons, transparent spacers, site logos, and bot badges
 */
function isValidProductImage(src?: string): boolean {
  if (!src || typeof src !== 'string') return false;
  const lower = src.toLowerCase();
  if (lower.startsWith('data:image/svg') || lower.endsWith('.svg')) return false;
  if (lower.includes('favicon') || lower.includes('apple-touch-icon')) return false;
  if (lower.includes('1x1') || lower.includes('pixel') || lower.includes('spacer') || lower.includes('tracking')) return false;
  if (lower.includes('badge') || lower.includes('sprite') || lower.includes('logo_small') || lower.includes('akamai-logo')) return false;
  if (lower.includes('placeholder') || lower.includes('blank.gif') || lower.includes('spinner')) return false;
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
 * Clean query / slug into Title Case (strips SKU, references, l46185106, p09598100, P1000215184, nvprod)
 */
function cleanQueryToTitle(str: string): string {
  if (!str) return '';
  let cleaned = decodeURIComponent(str);
  cleaned = cleaned.replace(/\.[a-zA-Z0-9]+$/, '');
  cleaned = cleaned.replace(/[-_]l\d+.*$/i, '');
  cleaned = cleaned.replace(/[-_]nvprod\d+.*$/i, '');
  cleaned = cleaned.replace(/[-_]p\d+.*$/i, '');
  cleaned = cleaned.replace(/[-_]id\d+.*$/i, '');
  cleaned = cleaned.replace(/[-_]c\d+.*$/i, '');
  cleaned = cleaned.replace(/[-_]v\d+.*$/i, '');
  cleaned = cleaned.replace(/\b[lp]\d{6,12}\b/gi, '');
  cleaned = cleaned.replace(/---+/g, ' - ');
  cleaned = cleaned.replace(/[-_+]/g, ' ');
  cleaned = cleaned.replace(/\b(https?|www|com|es|org|net|html|php)\b/gi, '');
  cleaned = cleaned.replace(/[0-9]+(\.[0-9]+)?,\s*[0-9]+(\.[0-9]+)?/g, ''); // Coordinates

  const words = cleaned
    .split(' ')
    .filter(
      (w) =>
        w.length > 1 &&
        !/^\d+$/.test(w) &&
        !['esp', 'es', 'productos', 'product', 'item', 'place', 'search', 'maps', 'dir', 'view', 'cat'].includes(
          w.toLowerCase()
        )
    )
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  return words.slice(0, 8).join(' ');
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
 * Clean raw title from site suffixes (e.g. "ESPEJO REDONDO RATÁN - ESPEJOS - DECORACIÓN | Zara Home España")
 */
function cleanPageTitle(rawTitle: string, brandName: string): string {
  if (!rawTitle) return '';
  let t = rawTitle;
  t = t.replace(new RegExp(`\\s*[\\|\\-\\·]\\s*.*${brandName}.*$`, 'i'), '');
  t = t.replace(/\s*[\|\-\·]\s*(Zara Home|Zara|Massimo Dutti|Sézane|IKEA|Amazon|El Corte Inglés|Sephora|Mango).*$/i, '');
  const parts = t.split(/\s+-\s+/);
  if (parts.length > 1) {
    t = parts[0];
  }
  if (t === t.toUpperCase() && t.length > 3) {
    t = t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  return t.trim();
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
 * Universal Intelligent Link Extractor & Categorizer
 * Features Brand-Specific High-Resolution Lookbooks & Live Metadata Pipeline
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

  // ── 1. GOOGLE MAPS & APPLE MAPS ──
  if (
    hostname.includes('maps.google.') ||
    (hostname.includes('google.') && pathname.includes('/maps')) ||
    hostname.includes('maps.app.goo.gl') ||
    (hostname.includes('goo.gl') && pathname.includes('/maps')) ||
    hostname.includes('maps.apple.com')
  ) {
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

        const realImages: string[] = [];
        if (realImage) realImages.push(realImage);

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

    return {
      title: placeName || 'Restaurante / Rincón Gastronómico',
      brand: addressPart ? addressPart : (placeName || 'Google Maps'),
      type: 'restaurant',
      domain: hostname,
      estimatedPrice: undefined,
      imageUrl: undefined,
      galleryImages: [],
      description: addressPart ? addressPart : `Ubicación guardada desde Google Maps`,
    };
  }

  // ── 2. LOUIS VUITTON (Akamai Scene7 Dynamic Media CDN Multi-angle Views) ──
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
    else if (lowerUrl.includes('pochette') && lowerUrl.includes('metis')) exactPrice = 1950;
    else if (lowerUrl.includes('speedy')) exactPrice = 1450;
    else if (lowerUrl.includes('neverfull')) exactPrice = 1550;
    else if (lowerUrl.includes('onthego')) exactPrice = 2800;
    else if (lowerUrl.includes('alma')) exactPrice = 1600;
    else if (lowerUrl.includes('cinturon') || lowerUrl.includes('belt')) exactPrice = 490;

    return {
      title: exactTitle,
      brand: 'Louis Vuitton',
      type: 'fashion',
      domain: hostname,
      estimatedPrice: exactPrice,
      imageUrl: exactGallery[0],
      galleryImages: exactGallery,
      description: `Pieza icónica de marroquinería Louis Vuitton París`,
    };
  }

  // ── 3. ZARA & MASSIMO DUTTI ──
  if (hostname.includes('zara.com') || hostname.includes('massimodutti.com')) {
    const isZara = hostname.includes('zara.com');
    const brandName = isZara ? 'Zara' : 'Massimo Dutti';
    const descriptiveSegment =
      pathSegments.find((s) => s.length > 5 && !s.startsWith('p0')) ||
      pathSegments[pathSegments.length - 1];
    const cleanTitle = cleanQueryToTitle(descriptiveSegment);

    let price = isZara ? 39.95 : 99.95;
    let images: string[] = [];

    if (lowerUrl.includes('jersey') && lowerUrl.includes('lana')) {
      price = isZara ? 39.95 : 89.95;
      images = [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('jersey') || lowerUrl.includes('punto') || lowerUrl.includes('cardigan')) {
      price = isZara ? 35.95 : 79.95;
      images = [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('vestido') || lowerUrl.includes('dress')) {
      price = isZara ? 49.95 : 129.0;
      images = [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('abrigo') || lowerUrl.includes('trench') || lowerUrl.includes('chaqueta')) {
      price = isZara ? 79.95 : 199.0;
      images = [
        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('bolso') || lowerUrl.includes('bag')) {
      price = isZara ? 29.95 : 149.0;
      images = [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('pantalon') || lowerUrl.includes('jeans')) {
      price = isZara ? 29.95 : 69.95;
      images = [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1000&auto=format&fit=crop',
      ];
    } else {
      images = [];
    }

    return {
      title: `${cleanTitle} · ${brandName}`,
      brand: brandName,
      type: 'fashion',
      domain: hostname,
      estimatedPrice: price,
      imageUrl: images.length > 0 ? images[0] : undefined,
      galleryImages: images,
      description: `Prenda de colección ${brandName}`,
    };
  }

  // ── 4. SEPHORA (Cosmética, Fragancias y Cuidado Corporal) ──
  if (hostname.includes('sephora.')) {
    const descriptiveSegment =
      pathSegments.find((s) => s.length > 5 && !s.startsWith('p-')) ||
      pathSegments[pathSegments.length - 1];
    const cleanTitle = cleanQueryToTitle(descriptiveSegment);

    let brand = 'Sephora';
    let price = 42.99;
    let images: string[] = [];

    if (
      lowerUrl.includes('sol-de-janeiro') ||
      lowerUrl.includes('rosa-charmosa') ||
      lowerUrl.includes('rosa-chamosa') ||
      lowerUrl.includes('cheirosa') ||
      lowerUrl.includes('bum-bum') ||
      lowerUrl.includes('delicia') ||
      lowerUrl.includes('beija-flor')
    ) {
      brand = 'Sol de Janeiro · Sephora';
      price = 48.0;
      images = [
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('kayali') || lowerUrl.includes('marshmallow')) {
      brand = 'KAYALI · Sephora';
      price = 42.99;
      images = [
        'https://images.unsplash.com/photo-1608248597359-25f0a0d4c94d?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('rare-beauty') || lowerUrl.includes('rare')) {
      brand = 'Rare Beauty · Sephora';
      price = 26.99;
      images = [
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('gisou')) {
      brand = 'Gisou · Sephora';
      price = 41.0;
      images = [
        'https://images.unsplash.com/photo-1608248597359-25f0a0d4c94d?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('fenty')) {
      brand = 'Fenty Beauty · Sephora';
      price = 24.99;
      images = [
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('dior')) {
      brand = 'Dior · Sephora';
      price = 44.0;
      images = [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('perfume') || lowerUrl.includes('fragrance') || lowerUrl.includes('eau-de-parfum')) {
      price = 89.0;
      images = [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1000&auto=format&fit=crop',
      ];
    } else {
      // Clean fallback if no specific line match: let user upload exact photo
      images = [];
    }

    return {
      title: `${cleanTitle}`,
      brand: brand,
      type: 'beauty',
      domain: hostname,
      estimatedPrice: price,
      imageUrl: images.length > 0 ? images[0] : undefined,
      galleryImages: images,
      description: `Tratamiento y belleza en ${brand}`,
    };
  }

  // ── 5. ZARA HOME (Hogar & Decoración) ──
  if (hostname.includes('zarahome.')) {
    const descriptiveSegment =
      pathSegments.find((s) => s.length > 5 && !s.startsWith('p0')) ||
      pathSegments[pathSegments.length - 1];
    const cleanTitle = cleanQueryToTitle(descriptiveSegment);

    let price = 59.99;
    let images: string[] = [];

    if (lowerUrl.includes('espejo') && lowerUrl.includes('ratan')) {
      price = 79.99;
      images = [
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('espejo')) {
      price = 89.99;
      images = [
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('lampara')) {
      price = 69.99;
      images = [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('jarron') || lowerUrl.includes('florero')) {
      price = 29.99;
      images = [
        'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('vela') || lowerUrl.includes('aroma') || lowerUrl.includes('difusor')) {
      price = 19.99;
      images = [
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('lino') || lowerUrl.includes('funda') || lowerUrl.includes('sabana')) {
      price = 99.99;
      images = [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('vajilla') || lowerUrl.includes('plato') || lowerUrl.includes('copa')) {
      price = 39.99;
      images = [
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1000&auto=format&fit=crop',
      ];
    } else {
      images = [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&auto=format&fit=crop',
      ];
    }

    return {
      title: `${cleanTitle} · Zara Home`,
      brand: 'Zara Home',
      type: 'home',
      domain: hostname,
      estimatedPrice: price,
      imageUrl: images[0],
      galleryImages: images,
      description: `Elemento de decoración y diseño para el hogar Zara Home`,
    };
  }

  // ── 6. POLÈNE PARIS ──
  if (hostname.includes('polene-paris.com')) {
    const descriptiveSegment = pathSegments[pathSegments.length - 1] || 'numero-un';
    const cleanTitle = cleanQueryToTitle(descriptiveSegment);
    let price = 380;
    if (lowerUrl.includes('dix')) price = 350;
    else if (lowerUrl.includes('neuf')) price = 380;
    else if (lowerUrl.includes('cyme')) price = 380;
    else if (lowerUrl.includes('beri')) price = 360;
    else if (lowerUrl.includes('un')) price = 420;

    const poleneGallery = [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
    ];

    return {
      title: `${cleanTitle} · Polène`,
      brand: 'Polène',
      type: 'fashion',
      domain: hostname,
      estimatedPrice: price,
      imageUrl: poleneGallery[0],
      galleryImages: poleneGallery,
      description: `Bolso de piel de alta artesanía Polène Paris`,
    };
  }

  // ── 7. SÉZANE ──
  if (hostname.includes('sezane.com')) {
    const descriptiveSegment = pathSegments[pathSegments.length - 1] || 'bolso-claude';
    const cleanTitle = cleanQueryToTitle(descriptiveSegment);
    let price = 345;
    if (lowerUrl.includes('claude')) price = 345;
    else if (lowerUrl.includes('milo')) price = 375;
    else if (lowerUrl.includes('farrow')) price = 240;
    else if (lowerUrl.includes('gaspard')) price = 110;
    else if (lowerUrl.includes('vestido')) price = 175;

    const sezaneGallery = [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
    ];

    return {
      title: `${cleanTitle} · Sézane`,
      brand: 'Sézane',
      type: 'fashion',
      domain: hostname,
      estimatedPrice: price,
      imageUrl: sezaneGallery[0],
      galleryImages: sezaneGallery,
      description: `Colección parisina Sézane`,
    };
  }

  // ── 8. LOEWE ──
  if (hostname.includes('loewe.com')) {
    const descriptiveSegment = pathSegments[pathSegments.length - 1] || 'puzzle-bag';
    const cleanTitle = cleanQueryToTitle(descriptiveSegment);
    let price = 2850;
    if (lowerUrl.includes('puzzle')) price = 2850;
    else if (lowerUrl.includes('hammock')) price = 2450;
    else if (lowerUrl.includes('flamenco')) price = 2150;
    else if (lowerUrl.includes('basket')) price = 520;
    else if (lowerUrl.includes('squeeze')) price = 3400;

    const loeweGallery = [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop',
    ];

    return {
      title: `${cleanTitle} · Loewe`,
      brand: 'Loewe',
      type: 'fashion',
      domain: hostname,
      estimatedPrice: price,
      imageUrl: loeweGallery[0],
      galleryImages: loeweGallery,
      description: `Pieza icónica de marroquinería Loewe`,
    };
  }

  // ── 9. VIAJES, BOOKING & AIRBNB ──
  if (
    hostname.includes('booking.com') ||
    hostname.includes('airbnb.') ||
    hostname.includes('civitatis.com') ||
    hostname.includes('parador.es') ||
    lowerUrl.includes('hotel') ||
    lowerUrl.includes('viaje') ||
    lowerUrl.includes('escapada') ||
    lowerUrl.includes('resort')
  ) {
    let brand = 'Viajes';
    if (hostname.includes('booking')) brand = 'Booking.com';
    else if (hostname.includes('airbnb')) brand = 'Airbnb';
    else if (hostname.includes('civitatis')) brand = 'Civitatis';
    else if (hostname.includes('parador')) brand = 'Paradores';

    let matchedDest = '';
    let price = 280;
    for (const [k, d] of Object.entries(DESTINATIONS_MAP)) {
      if (lowerUrl.includes(k)) {
        matchedDest = d.name;
        price = d.price;
        break;
      }
    }

    const descriptiveSegment = pathSegments[pathSegments.length - 1] || 'Escapada';
    const cleanSlug = cleanQueryToTitle(descriptiveSegment);
    const finalTitle = matchedDest ? `Escapada a ${matchedDest}` : `${cleanSlug} · ${brand}`;

    const travelGallery = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1000&auto=format&fit=crop',
    ];

    return {
      title: finalTitle,
      brand: brand,
      type: 'trip',
      domain: hostname,
      estimatedPrice: price,
      imageUrl: travelGallery[0],
      galleryImages: travelGallery,
      description: `Plan de viaje o alojamiento guardado`,
    };
  }

  // ── 10. UNIVERSAL LIVE METADATA SCRAPER FOR ALL OTHER BOUTIQUES & WEBSITES ──
  let liveTitle = '';
  let livePublisher = '';
  let liveDescription = '';
  let livePrice: number | undefined = undefined;
  const realImages: string[] = [];

  let inferredType: WishlistItemType = 'fashion';
  if (lowerUrl.includes('mueble') || lowerUrl.includes('sofa') || lowerUrl.includes('lampara') || lowerUrl.includes('decoracion') || hostname.includes('ikea') || hostname.includes('kavehome') || hostname.includes('westwing')) {
    inferredType = 'home';
  } else if (lowerUrl.includes('perfume') || lowerUrl.includes('crema') || lowerUrl.includes('labial') || hostname.includes('druni') || hostname.includes('douglas')) {
    inferredType = 'beauty';
  } else if (lowerUrl.includes('concierto') || lowerUrl.includes('teatro') || lowerUrl.includes('spa') || hostname.includes('feverup')) {
    inferredType = 'experience';
  }

  const hostPart = hostname.split('.')[0];
  const defaultBrand = hostPart.charAt(0).toUpperCase() + hostPart.slice(1);

  try {
    const liveData = await scrapeViaMicrolink(targetUrl);
    if (liveData) {
      if (liveData.title) {
        const titleLower = liveData.title.toLowerCase();
        if (
          !titleLower.includes('access denied') &&
          !titleLower.includes('forbidden') &&
          !titleLower.includes('security check') &&
          !titleLower.includes('captcha') &&
          !titleLower.includes('blocked')
        ) {
          liveTitle = cleanPageTitle(liveData.title, defaultBrand);
        }
      }
      if (liveData.publisher && !liveData.publisher.toLowerCase().includes('edgesuite')) {
        livePublisher = liveData.publisher;
      }
      if (liveData.description) {
        const descLower = liveData.description.toLowerCase();
        if (
          !descLower.includes('reference #') &&
          !descLower.includes('access denied') &&
          !descLower.includes('edgesuite') &&
          !descLower.includes('cloudflare') &&
          !descLower.includes('permission to access')
        ) {
          liveDescription = liveData.description;
        }
      }
      if (liveData.price && typeof liveData.price === 'number') {
        livePrice = liveData.price;
      }

      const primaryImage = liveData.image?.url || liveData.logo?.url;
      if (primaryImage && isValidProductImage(primaryImage)) {
        realImages.push(sanitizeImageHotlink(primaryImage));
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
    }
  } catch (e) {
    console.warn('[extractLinkMetadata] Live scrape failed, using fallback', e);
  }

  if (!liveTitle) {
    const descriptiveSegment = pathSegments[pathSegments.length - 1] || 'Deseo';
    const cleanSlug = cleanQueryToTitle(descriptiveSegment);
    liveTitle = cleanSlug ? `${cleanSlug}` : `${defaultBrand} Deseo`;
  }

  return {
    title: liveTitle,
    brand: livePublisher || defaultBrand,
    type: inferredType,
    domain: hostname,
    estimatedPrice: livePrice,
    imageUrl: realImages.length > 0 ? realImages[0] : undefined,
    galleryImages: realImages,
    description: liveDescription ? liveDescription.slice(0, 120) : `Visto en ${defaultBrand}`,
  };
}
