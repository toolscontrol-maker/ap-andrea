async function inspectSephoraHtml() {
  const sUrl = 'https://www.sephora.es/on/demandware.store/Sites-Sephora_ES-Site/es_ES/Product-Variation?pid=P1000215184';
  try {
    const r = await fetch(sUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      }
    });
    const html = await r.text();
    console.log('Sephora HTML length:', html.length);
    console.log('Snippet:', html.slice(0, 500));
    
    // Look for images in html
    const imgs = html.match(/https:\/\/[^"'\s\)]+\.(?:jpg|jpeg|png|webp)/gi) || [];
    console.log('Found images count:', imgs.length);
    console.log('Unique images:', [...new Set(imgs)].slice(0, 10));

    // Look for price
    const price = html.match(/class=["'][^"']*price[^"']*["'][^>]*>([^<]+)</i);
    console.log('Price:', price ? price[1].trim() : null);
  } catch (e) {
    console.log('Err:', e.message);
  }
}

inspectSephoraHtml();
