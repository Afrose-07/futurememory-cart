const fs = require('fs');

let content = fs.readFileSync('src/data/realProducts.js', 'utf8');
const arrayStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
let products = eval(arrayStr);

products.forEach((p) => {
  const frontUrl = p.images.front || p.images[0] || 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=500';
  const nameEnc = encodeURIComponent(p.name);
  
  p.images = {
    front: frontUrl,
    back: `https://placehold.co/600x800/f1f5f9/475569?text=${nameEnc}+%5BBack+View%5D`,
    side: `https://placehold.co/600x800/f1f5f9/475569?text=${nameEnc}+%5BSide+View%5D`,
    design: `https://placehold.co/600x800/f1f5f9/475569?text=${nameEnc}+%5BDesign+Details%5D`
  };
});

fs.writeFileSync('src/data/realProducts.js', 'export const realProducts = ' + JSON.stringify(products, null, 2) + ';\n');
console.log('Images updated with 4 angles');
