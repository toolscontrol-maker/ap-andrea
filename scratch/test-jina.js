async function testJina() {
  const url = 'https://www.zarahome.com/es/espejo-redondo-ratan-l46185106?ct=true&categoryId=1089523&pelement=507776420&colorId=700';
  
  // 1. Jina Reader (bypasses Akamai/Cloudflare bot protections and extracts images + pricing)
  try {
    const res = await fetch('https://r.jina.ai/' + url, {
      headers: {
        'Accept': 'text/plain',
      }
    });
    const text = await res.text();
    console.log('--- JINA RESULT ---');
    console.log('Length:', text.length);
    console.log('Snippet:\n', text.slice(0, 800));
    
    // Extract images from markdown ![...](url)
    const imgMatches = [...text.matchAll(/!\[[^\]]*\]\((https:\/\/[^\s\)]+)\)/g)].map(m => m[1]);
    console.log('Extracted images count:', imgMatches.length);
    console.log('Extracted images:', imgMatches.slice(0, 5));
    
    // Extract price
    const priceMatch = text.match(/(\d+[\.,]\d{2})\s*€/i) || text.match(/€\s*(\d+[\.,]\d{2})/i) || text.match(/(\d+)\s*€/i);
    console.log('Extracted price:', priceMatch ? priceMatch[1] : null);
  } catch (e) {
    console.error('Jina error:', e.message);
  }
}

testJina();
