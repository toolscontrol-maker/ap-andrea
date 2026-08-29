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

interface BrandDefinition {
  brand: string;
  type: WishlistItemType;
  lookbooks: Record<string, string[]>; // e.g. "messenger": [...], "bolso": [...], "default": [...]
}

const LUXURY_BRAND_REGISTRY: Record<string, BrandDefinition> = {
  'louisvuitton.com': {
    brand: 'Louis Vuitton',
    type: 'fashion',
    lookbooks: {
      messenger: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
      ],
      monogram: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop',
      ],
      bolso: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1000&auto=format&fit=crop',
      ],
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'polene-paris.com': {
    brand: 'Polène',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'sezane.com': {
    brand: 'Sézane',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'loewe.com': {
    brand: 'Loewe',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'chanel.com': {
    brand: 'Chanel',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'gucci.com': {
    brand: 'Gucci',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'prada.com': {
    brand: 'Prada',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'dior.com': {
    brand: 'Dior',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'hermes.com': {
    brand: 'Hermès',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'ysl.com': {
    brand: 'Saint Laurent',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'saintlaurent.com': {
    brand: 'Saint Laurent',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'bottegaveneta.com': {
    brand: 'Bottega Veneta',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'celine.com': {
    brand: 'Céline',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'jacquemus.com': {
    brand: 'Jacquemus',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'therow.com': {
    brand: 'The Row',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'toteme-studio.com': {
    brand: 'Toteme',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'khaite.com': {
    brand: 'Khaite',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'zara.com': {
    brand: 'Zara',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'massimodutti.com': {
    brand: 'Massimo Dutti',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'mango.com': {
    brand: 'Mango',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'nike.com': {
    brand: 'Nike',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'adidas.es': {
    brand: 'Adidas Originals',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'veja-store.com': {
    brand: 'Veja',
    type: 'fashion',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'apple.com': {
    brand: 'Apple',
    type: 'other',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'amazon.es': {
    brand: 'Amazon',
    type: 'other',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'amazon.com': {
    brand: 'Amazon',
    type: 'other',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'booking.com': {
    brand: 'Booking',
    type: 'trip',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'airbnb.es': {
    brand: 'Airbnb',
    type: 'trip',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'airbnb.com': {
    brand: 'Airbnb',
    type: 'trip',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'tripadvisor.es': {
    brand: 'TripAdvisor',
    type: 'restaurant',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'ikea.com': {
    brand: 'IKEA',
    type: 'home',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'zarahome.com': {
    brand: 'Zara Home',
    type: 'home',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1000&auto=format&fit=crop',
      ],
    },
  },
  'sephora.es': {
    brand: 'Sephora',
    type: 'beauty',
    lookbooks: {
      default: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1000&auto=format&fit=crop',
      ],
    },
  },
};

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
 * Guess category from words in URL, title or description
 */
function inferTypeFromText(text: string): WishlistItemType {
  const lower = text.toLowerCase();
  if (
    lower.includes('vestido') ||
    lower.includes('bolso') ||
    lower.includes('messenger') ||
    lower.includes('trio') ||
    lower.includes('monogram') ||
    lower.includes('zapat') ||
    lower.includes('pantalon') ||
    lower.includes('chaqueta') ||
    lower.includes('falda') ||
    lower.includes('jersey') ||
    lower.includes('camisa') ||
    lower.includes('moda') ||
    lower.includes('talla') ||
    lower.includes('dress') ||
    lower.includes('shoes') ||
    lower.includes('bag') ||
    lower.includes('jacket') ||
    lower.includes('sneaker') ||
    lower.includes('clothing')
  ) {
    return 'fashion';
  }
  if (
    lower.includes('restaurante') ||
    lower.includes('cena') ||
    lower.includes('comida') ||
    lower.includes('bar') ||
    lower.includes('brunch') ||
    lower.includes('omakase') ||
    lower.includes('sushi') ||
    lower.includes('dining') ||
    lower.includes('menu') ||
    lower.includes('chef')
  ) {
    return 'restaurant';
  }
  if (
    lower.includes('viaje') ||
    lower.includes('hotel') ||
    lower.includes('escapada') ||
    lower.includes('vuelo') ||
    lower.includes('resort') ||
    lower.includes('trip') ||
    lower.includes('travel') ||
    lower.includes('flight') ||
    lower.includes('alojamiento')
  ) {
    return 'trip';
  }
  if (
    lower.includes('casa') ||
    lower.includes('hogar') ||
    lower.includes('lampara') ||
    lower.includes('vela') ||
    lower.includes('sofa') ||
    lower.includes('mueble') ||
    lower.includes('decoracion') ||
    lower.includes('home')
  ) {
    return 'home';
  }
  if (
    lower.includes('perfume') ||
    lower.includes('crema') ||
    lower.includes('maquillaje') ||
    lower.includes('serum') ||
    lower.includes('labial') ||
    lower.includes('beauty') ||
    lower.includes('skincare') ||
    lower.includes('fragrance')
  ) {
    return 'beauty';
  }
  if (
    lower.includes('concierto') ||
    lower.includes('teatro') ||
    lower.includes('masaje') ||
    lower.includes('spa') ||
    lower.includes('experiencia') ||
    lower.includes('taller') ||
    lower.includes('entradas')
  ) {
    return 'experience';
  }
  return 'fashion';
}

/**
 * Clean slug into human readable title words
 */
function cleanSlugToTitle(slug: string): string {
  if (!slug) return '';
  let cleaned = slug.replace(/\.[a-zA-Z0-9]+$/, '');
  // Remove trailing nvprod / product code IDs
  cleaned = cleaned.replace(/[-_]nvprod\d+.*$/i, '');
  cleaned = cleaned.replace(/[-_]p\d+.*$/, '');
  cleaned = cleaned.replace(/[-_]id\d+.*$/, '');
  cleaned = cleaned.replace(/[-_+]/g, ' ');
  const words = cleaned
    .split(' ')
    .filter((w) => w.length > 1 && !/^\d+$/.test(w) && !['esp', 'es', 'productos', 'product', 'item'].includes(w.toLowerCase()))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  return words.slice(0, 7).join(' ');
}

/**
 * Fast fetch with strict timeout to prevent hanging forever
 */
async function fetchWithTimeout(url: string, timeoutMs: number = 2200): Promise<Response> {
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
 * Live Scrape via Microlink with strict 2.2s timeout
 */
async function scrapeViaMicrolink(targetUrl: string): Promise<ExtractedLinkMetadata | null> {
  try {
    const endpoint = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&palette=true`;
    const response = await fetchWithTimeout(endpoint, 2200);
    if (!response.ok) return null;

    const json = await response.json();
    if (json.status !== 'success' || !json.data) return null;

    const data = json.data;
    const realImages: string[] = [];

    if (data.image?.url && isValidProductImage(data.image.url)) {
      realImages.push(data.image.url);
    }

    if (Array.isArray(data.images)) {
      data.images.forEach((img: any) => {
        const u = typeof img === 'string' ? img : img?.url;
        if (u && isValidProductImage(u) && !realImages.includes(u)) {
          realImages.push(u);
        }
      });
    }

    return {
      title: data.title || '',
      brand: data.publisher || '',
      description: data.description || '',
      imageUrl: realImages.length > 0 ? realImages[0] : undefined,
      galleryImages: realImages,
    };
  } catch {
    return null;
  }
}

/**
 * Extract matched gallery from luxury lookbooks based on keywords in URL
 */
function getRegistryGallery(brandDef: BrandDefinition, urlString: string): string[] {
  const lower = urlString.toLowerCase();
  for (const [key, images] of Object.entries(brandDef.lookbooks)) {
    if (key !== 'default' && lower.includes(key)) {
      return images;
    }
  }
  return brandDef.lookbooks.default || [];
}

/**
 * Universal Intelligent Link Extractor: Zero-Lag Instant Extraction + Fast Background Scraping
 */
export async function extractLinkMetadata(rawUrl: string): Promise<ExtractedLinkMetadata | null> {
  if (!rawUrl || !rawUrl.trim()) return null;
  const targetUrl = sanitizeUrl(rawUrl);

  let hostname = '';
  try {
    hostname = new URL(targetUrl).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }

  // 1. Extract slug from URL path segments
  const pathSegments = new URL(targetUrl).pathname
    .split('/')
    .filter((s) => s && s.length > 2 && !['es', 'esp-es', 'en', 'fr', 'product', 'productos', 'p', 'item', 'c'].includes(s.toLowerCase()));
  const lastMeaningfulSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
  const slugTitle = cleanSlugToTitle(lastMeaningfulSegment);

  // Check known brand registry
  const matchedEntry = Object.entries(LUXURY_BRAND_REGISTRY).find(([domain]) =>
    hostname.includes(domain)
  );

  const brandName = matchedEntry
    ? matchedEntry[1].brand
    : hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);

  const baseType: WishlistItemType = matchedEntry
    ? matchedEntry[1].type
    : inferTypeFromText(targetUrl + ' ' + slugTitle);

  const finalTitle = slugTitle ? `${slugTitle} · ${brandName}` : `${brandName} Deseo`;
  const defaultGallery = matchedEntry ? getRegistryGallery(matchedEntry[1], targetUrl) : [];

  // Instant fallback metadata available immediately
  const initialResult: ExtractedLinkMetadata = {
    title: finalTitle,
    brand: brandName,
    type: baseType,
    domain: hostname,
    imageUrl: defaultGallery.length > 0 ? defaultGallery[0] : undefined,
    galleryImages: defaultGallery,
    description: `Visto en ${brandName}`,
  };

  // Attempt fast live scraper (max 2.2s). If it succeeds, enrich with real scraped images!
  try {
    const liveScrape = await scrapeViaMicrolink(targetUrl);
    if (liveScrape && liveScrape.galleryImages && liveScrape.galleryImages.length > 0) {
      return {
        title: liveScrape.title && liveScrape.title.length > 3 ? liveScrape.title : finalTitle,
        brand: liveScrape.brand || brandName,
        type: baseType,
        domain: hostname,
        imageUrl: liveScrape.galleryImages[0],
        galleryImages: liveScrape.galleryImages,
        description: liveScrape.description || `Visto en ${brandName}`,
      };
    }
  } catch {
    // Return instant result if scraper was blocked or timed out
  }

  return initialResult;
}
