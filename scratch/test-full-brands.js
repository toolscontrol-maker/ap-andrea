function testBrandExtractors() {
  const urls = [
    {
      label: 'Zara Wool Sweater',
      url: 'https://www.zara.com/es/es/jersey-100-lana-cremallera-p09598100.html?v1=588011967&v2=2735932'
    },
    {
      label: 'Sephora Kayali Marshmallow Cream',
      url: 'https://www.sephora.es/p/yum-marshmallow-body-cream---crema-corporal-P1000215184.html'
    },
    {
      label: 'Louis Vuitton Pochette Metis',
      url: 'https://es.louisvuitton.com/esp-es/productos/bolso-pochette-metis-soft-monogram-empreinte-nvprod7890147v/M29783'
    },
    {
      label: 'Zara Home Rattan Mirror',
      url: 'https://www.zarahome.com/es/espejo-redondo-ratan-l46185106?ct=true&categoryId=1089523&pelement=507776420&colorId=700'
    }
  ];

  for (const item of urls) {
    console.log('\n======================================');
    console.log('ITEM:', item.label);
    console.log('URL:', item.url);
  }
}

testBrandExtractors();
