const { extractLinkMetadata } = require('../apps/mobile/src/utils/linkMetadata');

async function testAll() {
  const cases = [
    'https://www.zara.com/es/es/jersey-100-lana-cremallera-p09598100.html?v1=588011967&v2=2735932',
    'https://www.sephora.es/p/yum-marshmallow-body-cream---crema-corporal-P1000215184.html',
    'https://es.louisvuitton.com/esp-es/productos/bolso-pochette-metis-soft-monogram-empreinte-nvprod7890147v/M29783',
    'https://www.zarahome.com/es/espejo-redondo-ratan-l46185106?ct=true&categoryId=1089523&pelement=507776420&colorId=700',
    'https://maps.app.goo.gl/nagYCujWHLgLfc6o6'
  ];

  for (const c of cases) {
    console.log('\n--- TESTING URL:', c);
    const meta = await extractLinkMetadata(c);
    console.log('Result:', JSON.stringify(meta, null, 2));
  }
}

testAll();
