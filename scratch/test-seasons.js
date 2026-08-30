async function testInditexSeasons() {
  const prod = '46185106';
  const col = '700';
  const years = ['2026', '2025', '2024', '2023', '2022'];
  const seasons = ['I', 'V'];
  const formats = ['1_1_1', '2_1_1', '3_1_1', '6_1_1'];

  for (const y of years) {
    for (const s of seasons) {
      for (const f of formats) {
        // Pattern A: static.zarahome.net/8/photos/{y}/{s}/4/6/1/8/5/1/0/6/{col}/{prod}{col}_{f}.jpg
        const u1 = `https://static.zarahome.net/8/photos/${y}/${s}/4/6/1/8/5/1/0/6/${col}/${prod}${col}_${f}.jpg`;
        // Pattern B: static.zarahome.net/photos/${y}/${s}/4/6/1/8/5/1/0/6/${col}/${prod}${col}_${f}.jpg
        const u2 = `https://static.zarahome.net/photos/${y}/${s}/4/6/1/8/5/1/0/6/${col}/${prod}${col}_${f}.jpg`;
        // Pattern C: static.zara.net/photos/${y}/${s}/4/6/1/8/5/1/0/6/${col}/${prod}${col}_${f}.jpg
        const u3 = `https://static.zara.net/photos/${y}/${s}/4/6/1/8/5/1/0/6/${col}/${prod}${col}_${f}.jpg`;
        
        try {
          const r = await fetch(u1, { method: 'HEAD' });
          if (r.status === 200) {
            console.log('FOUND U1:', u1);
            return;
          }
        } catch {}
        try {
          const r = await fetch(u2, { method: 'HEAD' });
          if (r.status === 200) {
            console.log('FOUND U2:', u2);
            return;
          }
        } catch {}
        try {
          const r = await fetch(u3, { method: 'HEAD' });
          if (r.status === 200) {
            console.log('FOUND U3:', u3);
            return;
          }
        } catch {}
      }
    }
  }
  console.log('Done testing seasons');
}

testInditexSeasons();
