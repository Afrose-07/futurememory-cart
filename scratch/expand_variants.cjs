const fs = require('fs');

let content = fs.readFileSync('src/data/realProducts.js', 'utf8');
const arrayStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
let products = eval(arrayStr);

const colors = [
  { name: 'Black', code: 'BLK', hex: '111111', text: 'ffffff' },
  { name: 'White', code: 'WHT', hex: 'f8fafc', text: '0f172a' },
  { name: 'Navy Blue', code: 'NVY', hex: '1e3a8a', text: 'ffffff' },
  { name: 'Sky Blue', code: 'SKY', hex: 'bae6fd', text: '0f172a' },
  { name: 'Olive Green', code: 'OLV', hex: '3f6212', text: 'ffffff' },
  { name: 'Maroon', code: 'MRN', hex: '831843', text: 'ffffff' }
];

let newProducts = [];

products.forEach(p => {
  const isClothing = ['Ethnic', 'Formal', 'Dresses', 'Clothing', 'Casual', 'Denim', 'Bottoms', 'Hoodies', 'Jackets', 'Shirts', 'T-Shirts'].includes(p.tag || p.category) || p.category === 'Clothing' || p.category === "Men's Clothing" || p.category === "Women's Clothing" || p.gender === 'Men' || p.gender === 'Women' || p.gender === 'Kids';

  if (isClothing) {
    colors.forEach((c, idx) => {
      let variant = JSON.parse(JSON.stringify(p));
      variant.id = `${p.id}-${c.code}`;
      variant.color = { name: c.name, value: `#${c.hex}` };
      
      const nameEnc = encodeURIComponent(p.name);
      // For the first color variant (Black), we keep the Unsplash image for the front
      // to maintain a beautiful homepage, but colored placeholders for the rest so it's accurate.
      
      let frontUrl = `https://placehold.co/600x800/${c.hex}/${c.text}?text=${nameEnc}+%5BFront%5D`;
      if (idx === 0) {
        frontUrl = p.images.front; // Unsplash
      }
      
      variant.images = {
        front: frontUrl,
        back: `https://placehold.co/600x800/${c.hex}/${c.text}?text=${nameEnc}+%5BBack%5D`,
        side: `https://placehold.co/600x800/${c.hex}/${c.text}?text=${nameEnc}+%5BSide%5D`,
        design: `https://placehold.co/600x800/${c.hex}/${c.text}?text=${nameEnc}+%5BDesign%5D`
      };
      
      variant.stock = Math.floor(Math.random() * 50) + 10;
      newProducts.push(variant);
    });
  } else {
    p.color = { name: 'Default', value: '#cccccc' };
    newProducts.push(p);
  }
});

fs.writeFileSync('src/data/realProducts.js', 'export const realProducts = ' + JSON.stringify(newProducts, null, 2) + ';\n');
console.log('Expanded products to ' + newProducts.length);
