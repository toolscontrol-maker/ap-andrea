function parseZaraHomeUrl(url) {
  const lowerUrl = url.toLowerCase();
  
  // 1. Clean Title from URL path
  const match = url.match(/\/([^\/?#]+)(?:\?|#|$)/);
  let slug = match ? match[1] : 'espejo-redondo-ratan';
  // Remove reference codes like -l46185106 or -p12345
  slug = slug.replace(/[-_]l\d+.*$/i, '');
  slug = slug.replace(/[-_]p\d+.*$/i, '');
  slug = slug.replace(/[-_]id\d+.*$/i, '');
  
  const words = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const cleanTitle = words.join(' ') + ' · Zara Home';

  // 2. Identify exact decor item type
  let images = [];
  let estimatedPrice = 49.99;

  if (lowerUrl.includes('espejo') && lowerUrl.includes('ratan')) {
    estimatedPrice = 79.99;
    images = [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&auto=format&fit=crop',
    ];
  } else if (lowerUrl.includes('espejo')) {
    estimatedPrice = 89.99;
    images = [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop',
    ];
  } else if (lowerUrl.includes('lampara')) {
    estimatedPrice = 69.99;
    images = [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop',
    ];
  } else if (lowerUrl.includes('jarron') || lowerUrl.includes('florero')) {
    estimatedPrice = 29.99;
    images = [
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1000&auto=format&fit=crop',
    ];
  } else if (lowerUrl.includes('vela') || lowerUrl.includes('aroma') || lowerUrl.includes('difusor')) {
    estimatedPrice = 19.99;
    images = [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1000&auto=format&fit=crop',
    ];
  } else if (lowerUrl.includes('lino') || lowerUrl.includes('funda') || lowerUrl.includes('sabana') || lowerUrl.includes('edredon')) {
    estimatedPrice = 99.99;
    images = [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&auto=format&fit=crop',
    ];
  } else if (lowerUrl.includes('vajilla') || lowerUrl.includes('plato') || lowerUrl.includes('copa') || lowerUrl.includes('vaso')) {
    estimatedPrice = 39.99;
    images = [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1000&auto=format&fit=crop',
    ];
  } else {
    estimatedPrice = 59.99;
    images = [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&auto=format&fit=crop',
    ];
  }

  return {
    title: cleanTitle,
    brand: 'Zara Home',
    type: 'home',
    estimatedPrice,
    imageUrl: images[0],
    galleryImages: images,
    description: 'Elemento de decoración y diseño para el hogar Zara Home'
  };
}

const test = parseZaraHomeUrl('https://www.zarahome.com/es/espejo-redondo-ratan-l46185106?ct=true&categoryId=1089523&pelement=507776420&colorId=700');
console.log(test);
