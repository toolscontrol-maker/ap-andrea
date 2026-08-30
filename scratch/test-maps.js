async function testMapsParser(shortUrl) {
  try {
    const res = await fetch('https://api.microlink.io?url=' + encodeURIComponent(shortUrl));
    const json = await res.json();
    const data = json.data;
    if (!data || !data.title) {
      console.log('No data');
      return;
    }
    const rawTitle = data.title;
    const parts = rawTitle.split('·');
    const name = parts[0].trim();
    const address = parts.length > 1 ? parts.slice(1).join('·').trim() : '';
    const cuisine = (data.description || '').replace(/^[★☆\s\d\.\,\-]+·\s*/, '').trim();
    const realImage = data.image?.url;

    console.log({
      title: name,
      location: address,
      cuisine: cuisine,
      image: realImage,
      type: 'restaurant'
    });
  } catch (err) {
    console.error(err);
  }
}

testMapsParser('https://maps.app.goo.gl/nagYCujWHLgLfc6o6');
