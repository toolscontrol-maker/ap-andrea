async function testBrandAPIs() {
  console.log('Testing Zara & Sephora internal APIs...');

  // Zara URL: https://www.zara.com/es/es/jersey-100-lana-cremallera-p09598100.html?v1=588011967&v2=2735932
  // v1 is product ID: 588011967
  const zaraId = '588011967';
  try {
    const url = `https://www.zara.com/es/es/products-details?productIds=${zaraId}&ajax=true`;
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        'Accept': 'application/json',
      }
    });
    console.log('Zara Ajax Status:', r.status);
    if (r.ok) {
      const json = await r.json();
      console.log('Zara Ajax Response keys:', Object.keys(json));
    }
  } catch (e) {
    console.log('Zara Ajax err:', e.message);
  }

  // Sephora: pid P1000215184
  try {
    const sUrl = 'https://www.sephora.es/on/demandware.store/Sites-Sephora_ES-Site/es_ES/Product-Variation?pid=P1000215184';
    const r = await fetch(sUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        'Accept': 'application/json',
      }
    });
    console.log('Sephora Variation Status:', r.status);
    if (r.ok) {
      const json = await r.json();
      console.log('Sephora Variation keys:', Object.keys(json));
    }
  } catch (e) {
    console.log('Sephora Variation err:', e.message);
  }
}

testBrandAPIs();
