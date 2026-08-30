async function testZaraHomePuppeteer() {
  const url = 'https://www.zarahome.com/es/espejo-redondo-ratan-l46185106?ct=true&categoryId=1089523&pelement=507776420&colorId=700';

  // Test google cache or google web search endpoint
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const json = await res.json();
    console.log('AllOrigins contents length:', json.contents?.length);
    const ogImg = json.contents?.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    console.log('AllOrigins og:image:', ogImg ? ogImg[1] : null);
  } catch (e) {
    console.log('AllOrigins error:', e.message);
  }

  // Test proxy 2
  try {
    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    const text = await res.text();
    console.log('CorsProxy length:', text.length);
    const ogImg = text.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    const ogPrice = text.match(/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i);
    console.log('CorsProxy og:image:', ogImg ? ogImg[1] : null);
    console.log('CorsProxy og:price:', ogPrice ? ogPrice[1] : null);
  } catch (e) {
    console.log('CorsProxy error:', e.message);
  }
}

testZaraHomePuppeteer();
