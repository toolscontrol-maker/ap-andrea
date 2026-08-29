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
    lower.includes('home') ||
    lower.includes('cushion')
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
 * 1. Live Headless Extraction via Microlink Scraper Engine
 */
async function scrapeViaMicrolink(targetUrl: string): Promise<ExtractedLinkMetadata | null> {
  const endpoint = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&palette=true`;
  const response = await fetch(endpoint, { method: 'GET' });
  if (!response.ok) return null;

  const json = await response.json();
  if (json.status !== 'success' || !json.data) return null;

  const data = json.data;
  const realImages: string[] = [];

  if (data.image?.url && isValidProductImage(data.image.url)) {
    realImages.push(data.image.url);
  }

  // If microlink found additional images or screenshots
  if (Array.isArray(data.images)) {
    data.images.forEach((img: any) => {
      const u = typeof img === 'string' ? img : img?.url;
      if (u && isValidProductImage(u) && !realImages.includes(u)) {
        realImages.push(u);
      }
    });
  }

  const rawTitle = data.title || '';
  const publisher = data.publisher || '';
  const description = data.description || '';

  return {
    title: rawTitle,
    brand: publisher,
    description: description,
    imageUrl: realImages.length > 0 ? realImages[0] : undefined,
    galleryImages: realImages,
  };
}

/**
 * 2. Live HTML OpenGraph & JSON-LD Extraction via AllOrigins CORS Proxy
 */
async function scrapeViaHtmlProxy(targetUrl: string): Promise<ExtractedLinkMetadata | null> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) return null;

  const result = await response.json();
  const html = result.contents;
  if (!html || typeof html !== 'string') return null;

  const realImages: string[] = [];

  // 1. OpenGraph Images
  const ogMatches = html.matchAll(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/gi);
  for (const m of ogMatches) {
    const img = m[1];
    if (img && isValidProductImage(img) && !realImages.includes(img)) {
      realImages.push(img);
    }
  }

  // 2. Twitter Image
  const twMatches = html.matchAll(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi);
  for (const m of twMatches) {
    const img = m[1];
    if (img && isValidProductImage(img) && !realImages.includes(img)) {
      realImages.push(img);
    }
  }

  // 3. JSON-LD Schema (Product / Offer images)
  const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const script of jsonLdMatches) {
    try {
      const parsed = JSON.parse(script[1]);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item.image) {
          const imgs = Array.isArray(item.image) ? item.image : [item.image];
          imgs.forEach((imgObj: any) => {
            const u = typeof imgObj === 'string' ? imgObj : imgObj?.url;
            if (u && isValidProductImage(u) && !realImages.includes(u)) {
              realImages.push(u);
            }
          });
        }
      }
    } catch {
      // ignore json parse error
    }
  }

  // 4. Extract Title & Description
  let title = '';
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (ogTitleMatch) {
    title = ogTitleMatch[1].trim();
  }

  let description = '';
  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  if (ogDescMatch) {
    description = ogDescMatch[1].trim();
  }

  return {
    title,
    description,
    imageUrl: realImages.length > 0 ? realImages[0] : undefined,
    galleryImages: realImages,
  };
}

/**
 * Universal Intelligent Link & Product Image Scraper
 * Extracts the EXACT product photos and metadata from the live URL
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

  const pathSegments = new URL(targetUrl).pathname
    .split('/')
    .filter((s) => s && s.length > 2 && !['es', 'en', 'fr', 'product', 'p', 'item', 'c'].includes(s.toLowerCase()));
  const lastMeaningfulSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
  const slugTitle = cleanSlugToTitle(lastMeaningfulSegment);

  let brandName = hostname
    .split('.')[0]
    .charAt(0)
    .toUpperCase() + hostname.split('.')[0].slice(1);

  // Attempt Layer 1: Microlink live scraper
  try {
    const liveMeta = await scrapeViaMicrolink(targetUrl);
    if (liveMeta && (liveMeta.imageUrl || (liveMeta.galleryImages && liveMeta.galleryImages.length > 0))) {
      const finalTitle = liveMeta.title || (slugTitle ? `${slugTitle} · ${brandName}` : `${brandName} Deseo`);
      const inferredType = inferTypeFromText(targetUrl + ' ' + finalTitle + ' ' + (liveMeta.description || ''));

      return {
        title: finalTitle,
        brand: liveMeta.brand || brandName,
        type: inferredType,
        imageUrl: liveMeta.imageUrl,
        galleryImages: liveMeta.galleryImages && liveMeta.galleryImages.length > 0 ? liveMeta.galleryImages : (liveMeta.imageUrl ? [liveMeta.imageUrl] : []),
        description: liveMeta.description || `Visto en ${brandName}`,
        domain: hostname,
      };
    }
  } catch (err) {
    console.warn('[extractLinkMetadata] Microlink fetch failed, trying proxy...', err);
  }

  // Attempt Layer 2: AllOrigins live HTML OpenGraph & JSON-LD parser
  try {
    const htmlMeta = await scrapeViaHtmlProxy(targetUrl);
    if (htmlMeta && (htmlMeta.imageUrl || (htmlMeta.galleryImages && htmlMeta.galleryImages.length > 0))) {
      const finalTitle = htmlMeta.title || (slugTitle ? `${slugTitle} · ${brandName}` : `${brandName} Deseo`);
      const inferredType = inferTypeFromText(targetUrl + ' ' + finalTitle + ' ' + (htmlMeta.description || ''));

      return {
        title: finalTitle,
        brand: brandName,
        type: inferredType,
        imageUrl: htmlMeta.imageUrl,
        galleryImages: htmlMeta.galleryImages && htmlMeta.galleryImages.length > 0 ? htmlMeta.galleryImages : (htmlMeta.imageUrl ? [htmlMeta.imageUrl] : []),
        description: htmlMeta.description || `Visto en ${brandName}`,
        domain: hostname,
      };
    }
  } catch (err) {
    console.warn('[extractLinkMetadata] HTML proxy fetch failed...', err);
  }

  // Layer 3: Fallback title & metadata if live scrapers couldn't connect
  const fallbackTitle = slugTitle ? `${slugTitle} · ${brandName}` : `${brandName} Deseo`;
  const inferredType = inferTypeFromText(targetUrl + ' ' + fallbackTitle);

  return {
    title: fallbackTitle,
    brand: brandName,
    type: inferredType,
    domain: hostname,
    description: `Visto en ${brandName}`,
  };
}
