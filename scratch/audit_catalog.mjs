import fs from 'fs';

const content = fs.readFileSync('src/data/canonicalCatalog.js', 'utf8');
const catalog = JSON.parse(content.slice(content.indexOf('['), content.lastIndexOf(']') + 1));

console.log('Total products:', catalog.length);
catalog.forEach(p => {
  console.log(`[${p.id}] "${p.name}" | Cat: "${p.category}" | Sub: "${p.subcategory}" | Gender: "${p.gender}" | Img: ${p.image}`);
});
