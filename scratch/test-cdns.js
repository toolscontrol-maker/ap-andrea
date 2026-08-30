async function findWorkingImageUrls() {
  console.log('Searching accessible CDN images for Zara & Sephora...');

  // 1. Sephora P1000215184 (Kayali Yum Marshmallow)
  // Sephora Demandware / Scene7 / Cloudinary / Weserv proxy
  const sephoraCandidates = [
    'https://www.sephora.es/on/demandware.static/-/Sites-masterCatalog_Sephora/default/dw8a623719/images/hi-res/SKU/SKU_6/P1000215184_main.jpg',
    'https://media.sephora.eu/catalog/product/P1000215184_main.jpg',
    'https://images.weserv.nl/?url=https://www.sephora.es/dw/image/v2/BCZJ_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/default/images/hi-res/P1000215184_main.jpg',
    'https://images.weserv.nl/?url=https://www.sephora.com/productimages/sku/s1000215184-main-zoom.jpg',
    'https://images.weserv.nl/?url=https://www.sephora.com/productimages/product/P1000215184-main-zoom.jpg',
  ];

  for (const u of sephoraCandidates) {
    try {
      const r = await fetch(u);
      console.log('Sephora candidate:', u, '->', r.status, r.headers.get('content-type'));
    } catch (e) {
      console.log('Sephora candidate err:', e.message);
    }
  }

  // 2. Zara 09598100 (Jersey 100% Lana Cremallera)
  const zaraCandidates = [
    'https://static.zara.net/photos///2024/I/0/1/p/0959/810/401/2/w/750/0959810401_1_1_1.jpg',
    'https://static.zara.net/photos///2024/I/0/1/p/0959/810/401/2/w/750/0959810401_2_1_1.jpg',
    'https://static.zara.net/photos///2024/I/0/1/p/0959/810/401/2/w/750/0959810401_6_1_1.jpg',
    'https://static.zara.net/photos///2024/V/0/1/p/0959/810/401/2/w/750/0959810401_1_1_1.jpg',
    'https://static.zara.net/photos///2025/I/0/1/p/0959/810/401/2/w/750/0959810401_1_1_1.jpg',
    'https://static.zara.net/photos///2025/V/0/1/p/0959/810/401/2/w/750/0959810401_1_1_1.jpg',
    'https://static.zara.net/photos///2026/I/0/1/p/0959/810/401/2/w/750/0959810401_1_1_1.jpg',
  ];

  for (const u of zaraCandidates) {
    try {
      const r = await fetch(u);
      console.log('Zara candidate:', u, '->', r.status, r.headers.get('content-type'));
    } catch (e) {
      console.log('Zara candidate err:', e.message);
    }
  }
}

findWorkingImageUrls();
