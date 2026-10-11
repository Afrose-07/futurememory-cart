const cat = require('../src/data/canonicalCatalog.js');
const list = Array.isArray(cat) ? cat : cat.default || cat.canonicalCatalog;

console.log('--- Total Products:', list.length);

const byCat = {};
list.forEach(p => {
  byCat[p.category] = (byCat[p.category] || 0) + 1;
});
console.log('Categories count:', byCat);

const womenMismatches = list.filter(p => p.category === "Women's Fashion" && p.gender !== 'Women');
const menMismatches = list.filter(p => p.category === "Men's Fashion" && p.gender !== 'Men');
console.log("Women's Fashion gender mismatches:", womenMismatches.length);
console.log("Men's Fashion gender mismatches:", menMismatches.length);

// Check Kids
const kids = list.filter(p => p.category === "Kids' Fashion");
console.log("Kids Fashion items:", kids.length);

// Check Gifts
const gifts = list.filter(p => p.category.includes('Gift'));
console.log("Gift items:", gifts.map(g => `${g.id}: ${g.name} (${g.subcategory})`));

// Check multi-angle keys
const multiAngleCheck = list.filter(p => {
  if (p.category.includes('Fashion')) {
    return !p.images || !p.images.front;
  }
  return false;
});
console.log('Fashion products missing images.front:', multiAngleCheck.length);
