const fs = require('fs');

let fileContent = fs.readFileSync('src/data/realProducts.js', 'utf8');

// Export to module.exports for parsing
let dataCode = fileContent.replace('export const realProducts = ', 'module.exports = ');
fs.writeFileSync('tempData3.cjs', dataCode);

const products = require('./tempData3.cjs');

// Pinterest aesthetic style fashion imagery from Unsplash
const colorImageMap = {
    "Black": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
    "White": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    "Navy Blue": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80",
    "Blue": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80",
    "Olive Green": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    "Green": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    "Maroon": "https://images.unsplash.com/photo-1596755094514-f87e32f6b717?w=800&q=80",
    "Red": "https://images.unsplash.com/photo-1596755094514-f87e32f6b717?w=800&q=80",
    "Sky Blue": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ce3?w=800&q=80",
    "Yellow": "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80",
    "default": "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80"
};

products.forEach(p => {
    // For all clothing
    if (p.gender === 'Men' && p.category === 'Clothing') {
        const cName = p.color?.name || "default";
        const img = colorImageMap[cName] || colorImageMap.default;
        
        p.images.front = img;
        p.images.back = img;
        p.images.side = img;
        p.images.design = img;
    }
});

const newExport = 'export const realProducts = ' + JSON.stringify(products, null, 2) + ';';
fs.writeFileSync('src/data/realProducts.js', newExport);
fs.unlinkSync('tempData3.cjs');

console.log('Fixed catalog images with Pinterest aesthetic ones.');
