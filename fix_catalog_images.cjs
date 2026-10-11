const fs = require('fs');

let fileContent = fs.readFileSync('src/data/realProducts.js', 'utf8');

// Export to module.exports for parsing
let dataCode = fileContent.replace('export const realProducts = ', 'module.exports = ');
fs.writeFileSync('tempData2.cjs', dataCode);

const products = require('./tempData2.cjs');

const colorImageMap = {
    "Black": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500",
    "White": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    "Navy Blue": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500",
    "Blue": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500",
    "Olive Green": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
    "Green": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
    "Maroon": "https://images.unsplash.com/photo-1596755094514-f87e32f6b717?w=500",
    "Red": "https://images.unsplash.com/photo-1596755094514-f87e32f6b717?w=500",
    "Sky Blue": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ce3?w=500",
    "Yellow": "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500",
    "default": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500"
};

products.forEach(p => {
    // If it's a clothing item for men
    if (p.gender === 'Men' && p.category === 'Clothing') {
        const cName = p.color?.name || "default";
        const img = colorImageMap[cName] || colorImageMap.default;
        
        p.images.front = img;
        p.images.back = img;
        p.images.side = img;
        p.images.design = img;
        
        // Remove Edition from Shirts too
        p.name = p.name.replace(/ Edition \d+/g, '');
        p.name = p.name.replace(' - Premium Collection', '');
    }
});

const newExport = 'export const realProducts = ' + JSON.stringify(products, null, 2) + ';';
fs.writeFileSync('src/data/realProducts.js', newExport);
fs.unlinkSync('tempData2.cjs');

// Now remove the thumbnails from ProductDetailsPage.jsx
let pdPage = fs.readFileSync('src/pages/ProductDetailsPage.jsx', 'utf8');

// We want to remove the `<div className="fm-gallery-thumbnails"> ... </div>` block entirely.
// Since it's multi-line, we can use a regex or string replacement.
const thumbnailsRegex = /<div className="fm-gallery-thumbnails">[\s\S]*?<\/div>\s*<\/div>/;
// Wait, the outer div is `<div className="fm-details-gallery">`.
// Let's just do a string replace for the exact block if we can, or just replace the inner div
pdPage = pdPage.replace(
    /<div className="fm-gallery-thumbnails">[\s\S]*?<\/div>/,
    ''
);

fs.writeFileSync('src/pages/ProductDetailsPage.jsx', pdPage);

console.log('Fixed catalog images and removed duplicate thumbnails.');
