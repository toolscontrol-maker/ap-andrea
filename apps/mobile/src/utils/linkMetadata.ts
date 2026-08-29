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

const KNOWN_DOMAINS: Record<
  string,
  {
    brand: string;
    type: WishlistItemType;
    defaultGallery: string[];
  }
> = {
  'sezane.com': {
    brand: 'Sézane',
    type: 'fashion',
    defaultGallery: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=900&auto=format&fit=crop',
    ],
  },
  'zara.com': {
    brand: 'Zara',
    type: 'fashion',
    defaultGallery: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&auto=format&fit=crop',
    ],
  },
  'massimodutti.com': {
    brand: 'Massimo Dutti',
    type: 'fashion',
    defaultGallery: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=900&auto=format&fit=crop',
    ],
  },
  'mango.com': {
    brand: 'Mango',
    type: 'fashion',
    defaultGallery: [
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop',
    ],
  },
  'nike.com': {
    brand: 'Nike',
    type: 'fashion',
    defaultGallery: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=900&auto=format&fit=crop',
    ],
  },
  'adidas.es': {
    brand: 'Adidas Originals',
    type: 'fashion',
    defaultGallery: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=900&auto=format&fit=crop',
    ],
  },
  'veja-store.com': {
    brand: 'Veja',
    type: 'fashion',
    defaultGallery: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&auto=format&fit=crop',
    ],
  },
  'apple.com': {
    brand: 'Apple',
    type: 'other',
    defaultGallery: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop',
    ],
  },
  'amazon.es': {
    brand: 'Amazon',
    type: 'other',
    defaultGallery: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop',
    ],
  },
  'amazon.com': {
    brand: 'Amazon',
    type: 'other',
    defaultGallery: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop',
    ],
  },
  'booking.com': {
    brand: 'Booking',
    type: 'trip',
    defaultGallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop',
    ],
  },
  'airbnb.es': {
    brand: 'Airbnb',
    type: 'trip',
    defaultGallery: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&auto=format&fit=crop',
    ],
  },
  'airbnb.com': {
    brand: 'Airbnb',
    type: 'trip',
    defaultGallery: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&auto=format&fit=crop',
    ],
  },
  'tripadvisor.es': {
    brand: 'TripAdvisor',
    type: 'restaurant',
    defaultGallery: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop',
    ],
  },
  'thefork.es': {
    brand: 'TheFork',
    type: 'restaurant',
    defaultGallery: [
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop',
    ],
  },
  'ikea.com': {
    brand: 'IKEA',
    type: 'home',
    defaultGallery: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&auto=format&fit=crop',
    ],
  },
  'zarahome.com': {
    brand: 'Zara Home',
    type: 'home',
    defaultGallery: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=900&auto=format&fit=crop',
    ],
  },
  'sephora.es': {
    brand: 'Sephora',
    type: 'beauty',
    defaultGallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=900&auto=format&fit=crop',
    ],
  },
  'cultbeauty.com': {
    brand: 'Cult Beauty',
    type: 'beauty',
    defaultGallery: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=900&auto=format&fit=crop',
    ],
  },
};

const CATEGORY_DEFAULT_GALLERIES: Record<WishlistItemType, string[]> = {
  fashion: [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop',
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop',
  ],
  trip: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&auto=format&fit=crop',
  ],
  home: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=900&auto=format&fit=crop',
  ],
  beauty: [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&auto=format&fit=crop',
  ],
  experience: [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop',
  ],
  product: [
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=900&auto=format&fit=crop',
  ],
  memory: [
    'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=900&auto=format&fit=crop',
  ],
  other: [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&auto=format&fit=crop',
  ],
};

/**
 * Clean slug into human readable title words
 */
function cleanSlugToTitle(slug: string): string {
  if (!slug) return '';
  let cleaned = slug.replace(/\.[a-zA-Z0-9]+$/, '');
  cleaned = cleaned.replace(/[-_]p\d+.*$/, '');
  cleaned = cleaned.replace(/[-_]id\d+.*$/, '');
  cleaned = cleaned.replace(/[-_+]/g, ' ');
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
 * Intelligent Smart Link Metadata & Image Gallery Extractor
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

    const galleryImages = knownConfig
      ? [...knownConfig[1].defaultGallery]
      : [...(CATEGORY_DEFAULT_GALLERIES[inferredType] || CATEGORY_DEFAULT_GALLERIES.fashion)];

    const mainImageUrl = galleryImages.length > 0 ? galleryImages[0] : undefined;

    return {
      title,
      brand: domainName,
      type: inferredType,
      domain: hostname,
      imageUrl: mainImageUrl,
      galleryImages,
      description: `Visto en ${domainName}`,
    };
  } catch (err) {
    console.warn('[extractLinkMetadata] Invalid URL format:', err);
    return null;
  }
}
