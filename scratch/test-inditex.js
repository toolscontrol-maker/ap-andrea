async function testInditexCDN() {
  const prodCode = '46185106'; // from l46185106
  const colorId = '700';
  
  // Format 1: static.zarahome.net/8/photos/4/6/1/8/5/1/0/6/700/46185106700_1_1_1.jpg
  // Format 2: https://static.zarahome.net/assets/public/...
  // Format 3: https://static.zara.net/photos/...
  // Format 4: https://static.zarahome.net/8/photos/.../46185106700-e1.jpg
  
  const possibleUrls = [
    `https://static.zarahome.net/8/photos/4/6/1/8/5/1/0/6/${colorId}/${prodCode}${colorId}_1_1_1.jpg?ts=1700000000000`,
    `https://static.zarahome.net/8/photos/4/6/1/8/5/1/0/6/${colorId}/${prodCode}${colorId}_2_1_1.jpg?ts=1700000000000`,
    `https://static.zarahome.net/8/photos/4/6/1/8/5/1/0/6/${colorId}/${prodCode}${colorId}_6_1_1.jpg?ts=1700000000000`,
    `https://static.zarahome.net/8/photos/4/6/1/8/5/1/0/6/${colorId}/${prodCode}${colorId}_1_1_1.jpg`,
    `https://static.zarahome.net/8/photos/4/6/1/8/5/1/0/6/${colorId}/${prodCode}${colorId}_2_1_1.jpg`,
    `https://static.zarahome.net/8/photos/4/6/1/8/5/1/0/6/${colorId}/${prodCode}${colorId}_3_1_1.jpg`,
    `https://static.zarahome.net/8/photos/4/6/1/8/5/1/0/6/${colorId}/${prodCode}${colorId}_4_1_1.jpg`,
  ];

  for (const u of possibleUrls) {
    try {
      const res = await fetch(u, { method: 'HEAD' });
      console.log(u, '-> Status:', res.status, res.headers.get('content-type'));
    } catch (e) {
      console.log(u, '-> Error:', e.message);
    }
  }
}

testInditexCDN();
