async function testUniversal(url) {
  console.log('\n--- TESTING URL:', url);
  try {
    const res = await fetch('https://api.microlink.io?url=' + encodeURIComponent(url));
    const json = await res.json();
    const data = json.data;
    console.log('Title:', data?.title);
    console.log('Publisher/Brand:', data?.publisher);
    console.log('Image:', data?.image?.url);
    console.log('Price:', data?.price);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

async function run() {
  await testUniversal('https://maps.app.goo.gl/nagYCujWHLgLfc6o6');
  await testUniversal('https://es.louisvuitton.com/esp-es/productos/bolso-nil-monogram-other-nvprod6740033v/M27095');
  await testUniversal('https://www.sezane.com/es/product/bolso-claude/ante-camel');
}

run();
