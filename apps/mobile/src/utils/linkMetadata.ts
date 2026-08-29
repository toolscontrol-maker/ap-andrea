import { WishlistItemType } from '@andrea/types';

export interface ExtractedLinkMetadata {
  title?: string;
  brand?: string;
  type?: WishlistItemType;
  imageUrl?: string;
  estimatedPrice?: number;
  description?: string;
  domain?: string;
}

const KNOWN_DOMAINS: Record<
  string,
  {
    brand: string;
    type: WishlistItemType;
    defaultImageFallback?: string;
  }
> = {
  'sezane.com': {
    brand: 'Sézane',
    type: 'fashion',
    defaultImageFallback: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop',
  },
  'zara.com': {
    brand: 'Zara',
    type: 'fashion',
    defaultImageFallback: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop',
  },
  'massimodutti.com': {
    brand: 'Massimo Dutti',
    type: 'fashion',
    defaultImageFallback: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop',
  },
  'mango.com': {
    brand: 'Mango',
    type: 'fashion',
    defaultImageFallback: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop',
  },
  'nike.com': {
    brand: 'Nike',
    type: 'fashion',
    defaultImageFallback: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
  },
  'adidas.es': {
    brand: 'Adidas',
    type: 'fashion',
    defaultImageFallback: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop',
  },
  'veja-store.com': {
    brand: 'Veja',
    type: 'fashion',
    defaultImageFallback: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop',
  },
  'apple.com': {
    brand: 'Apple',
    type: 'other',
    defaultImageFallback: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop',
  },
  'amazon.es': {
    brand: 'Amazon',
    type: 'other',
    defaultImageFallback: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop',
  },
  'amazon.com': {
    brand: 'Amazon',
    type: 'other',
    defaultImageFallback: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop',
  },
  'booking.com': {
    brand: 'Booking',
    type: 'trip',
    defaultImageFallback: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
  },
  'airbnb.es': {
    brand: 'Airbnb',
    type: 'trip',
    defaultImageFallback: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
  },
  'airbnb.com': {
    brand: 'Airbnb',
    type: 'trip',
    defaultImageFallback: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
  },
  'tripadvisor.es': {
    brand: 'TripAdvisor',
    type: 'restaurant',
    defaultImageFallback: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
  },
  'thefork.es': {
    brand: 'TheFork',
    type: 'restaurant',
    defaultImageFallback: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop',
  },
  'ikea.com': {
    brand: 'IKEA',
    type: 'home',
    defaultImageFallback: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop',
  },
  'zarahome.com': {
    brand: 'Zara Home',
    type: 'home',
    defaultImageFallback: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&auto=format&fit=crop',
  },
  'sephora.es': {
    brand: 'Sephora',
    type: 'beauty',
    defaultImageFallback: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop',
  },
  'cultbeauty.com': {
    brand: 'Cult Beauty',
    type: 'beauty',
    defaultImageFallback: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop',
  },
};

/**
 * Clean slug into human readable title words
 */
function cleanSlugToTitle(slug: string): string {
  if (!slug) return '';
  // Remove file extensions (.html, .htm, .php)
  let cleaned = slug.replace(/\.[a-zA-Z0-9]+$/, '');
  // Remove query params or trailing IDs
  cleaned = cleaned.replace(/[-_]p\d+.*$/, '');
  cleaned = cleaned.replace(/[-_]id\d+.*$/, '');
  // Replace dashes and underscores with spaces
  cleaned = cleaned.replace(/[-_+]/g, ' ');
  // Filter out short code noise
  const words = cleaned
    .split(' ')
    .filter((w) => w.length > 1 && !/^\d+$/.test(w))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  return words.slice(0, 6).join(' ');
}

/**
 * Guess category from words in URL or title
 */
function inferTypeFromText(text: string): WishlistItemType {
  const lower = text.toLowerCase();
  if (
    lower.includes('vestido') ||
    lower.includes('bolso') ||
    lower.includes('zapat') ||
    lower.includes('pantalon') ||
    lower.includes('chaqueta') ||
    lower.includes('falda') ||
    lower.includes('jersey') ||
    lower.includes('camisa') ||
    lower.includes('moda') ||
    lower.includes('dress') ||
    lower.includes('shoes') ||
    lower.includes('bag') ||
    lower.includes('jacket')
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
    lower.includes('menu')
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
    lower.includes('flight')
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
    lower.includes('skincare')
  ) {
    return 'beauty';
  }
  if (
    lower.includes('concierto') ||
    lower.includes('teatro') ||
    lower.includes('masaje') ||
    lower.includes('spa') ||
    lower.includes('experiencia') ||
    lower.includes('taller')
  ) {
    return 'experience';
  }
  return 'fashion';
}

/**
 * Intelligent Smart Link Metadata Extractor
 */
export async function extractLinkMetadata(rawUrl: string): Promise<ExtractedLinkMetadata | null> {
  if (!rawUrl || !rawUrl.trim()) return null;

  let urlString = rawUrl.trim();
  if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    urlString = 'https://' + urlString;
  }

  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();

    // Check for known domain
    const knownConfig = Object.entries(KNOWN_DOMAINS).find(([domain]) =>
      hostname.includes(domain)
    );

    const domainName = knownConfig ? knownConfig[1].brand : hostname;
    let inferredType: WishlistItemType = knownConfig ? knownConfig[1].type : 'fashion';

    // Extract slug from URL path segments
    const pathSegments = parsed.pathname
      .split('/')
      .filter((s) => s && s.length > 2 && !['es', 'en', 'fr', 'product', 'p', 'item', 'c'].includes(s.toLowerCase()));

    const lastMeaningfulSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
    const generatedTitle = cleanSlugToTitle(lastMeaningfulSegment);

    const title = generatedTitle
      ? `${generatedTitle}${domainName ? ` · ${domainName}` : ''}`
      : `${domainName} Deseo`;

    inferredType = inferTypeFromText(urlString + ' ' + title);

    const imageUrl = knownConfig ? knownConfig[1].defaultImageFallback : undefined;

    return {
      title,
      brand: domainName,
      type: inferredType,
      domain: hostname,
      imageUrl,
      description: `Visto en ${domainName}`,
    };
  } catch (err) {
    console.warn('[extractLinkMetadata] Invalid URL format:', err);
    return null;
  }
}
