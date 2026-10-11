const fs = require('fs');

let content = fs.readFileSync('src/data/realProducts.js', 'utf8');
const arrayStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
let products = eval(arrayStr);

const menImages = [
  '1598032895397-b9472444bf93', '1521572163474-6864f9cf17ab', '1542272604-780c8d52a5ce', 
  '1594938298603-c8148c4dae35', '1556821840-3a63f95609a7', '1551028719-00167b16eac5', 
  '1507679799987-c73779587ccf', '1597983073493-88cd35cf93b0', '1607344645866-009c320c5ab8', 
  '1591195853828-11db59a44f6b', '1617137984095-74e4e5e3613f', '1480455624313-e4070a7d9b9a', 
  '1611312449408-fcece27cdbb1', '1584273141183-f3689fcc4dcb', '1516257984-b1b4d707412e'
];

const womenImages = [
  '1595777457583-95e059d581b8', '1503342217505-b0a15ec3261c', '1583496661160-c5a882a8ec86', 
  '1583391733959-b148fa75f469', '1610030469983-98e550d6193c', '1515886657613-9f3515b0c78f', 
  '1434389670869-bac89498abdb', '1485230833902-601e35bc85fc', '1550614000-4b95d10fe04e', 
  '1525507119028-ed4c629a60a3', '1589465991757-36e1b65e9d97', '1572804013309-59a88b7e92f1'
];

const kidsImages = [
  '1519238263530-99adedd1ba3d', '1514090458227-ef62dc1ef0b0', '1622290204658-00a453f605cb', 
  '1519689680058-324335c77eba', '1503919005314-36ea245ea3d0', '1471286174890-9c1122cd79fc', 
  '1602143491410-b9cc47291ee5', '1600880292203-757bb62b4baf'
];

let mIdx = 0; let wIdx = 0; let kIdx = 0;

products.forEach((p, idx) => {
  let imgId = '';
  if (p.gender === 'Men') {
    imgId = menImages[mIdx % menImages.length]; mIdx++;
  } else if (p.gender === 'Women') {
    imgId = womenImages[wIdx % womenImages.length]; wIdx++;
  } else {
    imgId = kidsImages[kIdx % kidsImages.length]; kIdx++;
  }
  
  const url = `https://images.unsplash.com/photo-${imgId}?w=500`;
  p.images = {
    front: url,
    back: url,
    side: url,
    design: url
  };
});

fs.writeFileSync('src/data/realProducts.js', 'export const realProducts = ' + JSON.stringify(products, null, 2) + ';\n');
console.log('Images deduplicated');
