async function testZaraHome() {
  const url = 'https://www.zarahome.com/es/espejo-redondo-ratan-l46185106?ct=true&categoryId=1089523&pelement=507776420&colorId=700';

  // 1. Microlink
  try {
    const res = await fetch('https://api.microlink.io?url=' + encodeURIComponent(url));
    const json = await res.json();
    console.log('--- MICROLINK ---');
    console.log('Title:', json.data?.title);
    console.log('Image:', json.data?.image?.url);
    console.log('Description:', json.data?.description);
    console.log('Price:', json.data?.price);
  } catch (e) {
    console.error('Microlink error:', e.message);
  }

  // 2. Direct Fetch with User-Agent & HTML regex for Inditex static images
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9',
      }
    });
    const html = await res.text();
    console.log('--- DIRECT HTML LENGTH ---', html.length);
    
    // Look for static.zarahome.net or static.zara.net or static.inditex.com images
    const imgMatches = html.match(/https:\/\/[^"'\s\)]+\.(?:jpg|jpeg|png|webp)/gi) || [];
    const inditexImages = imgMatches.filter(u => u.includes('zarahome.net') || u.includes('inditex') || u.includes('itx'));
    console.log('Found inditex images count:', inditexImages.length);
    console.log('Sample images:', [...new Set(inditexImages)].slice(0, 8));

    // Look for price in json-ld or meta
    const priceMatch = html.match(/"price":\s*"?([0-9\.]+)"?/i);
    console.log('Price match:', priceMatch ? priceMatch[1] : null);
  } catch (e) {
    console.error('Direct fetch error:', e.message);
  }
}

testZaraHome();
