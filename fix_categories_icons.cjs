const fs = require('fs');
let c = fs.readFileSync('src/pages/CategoriesPage.jsx', 'utf8');

const iconsMap = {
  'Tech': '🎧',
  'Ethnic': '🥻',
  'Jewellery': '💍',
  'Bags': '👜',
  'Gourmet': '🍫',
  'Decor': '🏺',
  'Fragrance': '🧴',
  'Formal': '👔',
  'Footwear': '👞',
  'Gift Set': '🎁'
};

for (const [id, icon] of Object.entries(iconsMap)) {
  const reg = new RegExp(`id:\\s*'${id}',([\\s\\S]*?)icon:\\s*'',`, 'g');
  c = c.replace(reg, `id: '${id}',$1icon: '${icon}',`);
}

fs.writeFileSync('src/pages/CategoriesPage.jsx', c, 'utf8');
console.log('Successfully replaced category icons via regex!');
