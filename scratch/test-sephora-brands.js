function testSephoraMatching(url) {
  const lowerUrl = url.toLowerCase();
  
  let brand = 'Sephora';
  let title = '';
  let price = 39.0;
  let images = [];

  // Sol de Janeiro
  if (lowerUrl.includes('sol-de-janeiro') || lowerUrl.includes('rosa-charmosa') || lowerUrl.includes('cheirosa') || lowerUrl.includes('bum-bum') || lowerUrl.includes('beija-flor') || lowerUrl.includes('delicia-drench') || lowerUrl.includes('bom-dia')) {
    brand = 'Sol de Janeiro · Sephora';
    if (lowerUrl.includes('rosa-charmosa') || lowerUrl.includes('dewy-cream')) {
      title = 'Rosa Charmosa™ Dewy Cream Crema Corporal';
      price = 48.0;
      images = [
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1000&auto=format&fit=crop', // Luxury pink rose body cream
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1000&auto=format&fit=crop',
      ];
    } else if (lowerUrl.includes('bum-bum')) {
      title = 'Brazilian Bum Bum Cream';
      price = 48.0;
    }
  }

  console.log({ brand, title, price, imagesCount: images.length });
}

testSephoraMatching('https://www.sephora.es/p/rosa-charmosa-dewy-cream---crema-corporal-sublimadora-de-luminosidad-746764.html');
