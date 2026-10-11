const fs = require('fs');

// 1. Remove Meesho references and update images in products data
const dataFiles = ['src/data/allOccasionsCatalog.js', 'src/data/realProducts.js'];

const aestheticImages = {
    "KURT-001-PUR": "https://images.unsplash.com/photo-1583391733958-650fac69e6b1?w=600&q=80", // aesthetic ethnic wear
    "SHIRT-001-DEN": "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80", // aesthetic mens shirt
    "CARE-001-NIV": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80", // aesthetic skincare
    "ELEC-001-JBL": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", // aesthetic headphones
    "MAKE-001-ELLE": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80", // aesthetic makeup
    "SMART-001-OPPO": "https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=600&q=80", // aesthetic phone
    "PERF-001-DEN": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80", // aesthetic perfume
    "BAG-001-ZOUK": "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&q=80", // aesthetic bag
    "SHOE-001-LIB": "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80" // aesthetic shoes
};

for (const file of dataFiles) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Remove 'Meesho' text
        content = content.replace(/Real Meesho feel\./gi, 'Premium quality guaranteed.');
        content = content.replace(/Meesho/gi, 'FutureMemory');
        
        // Update images to aesthetic ones
        // We'll export to a temp file, require it, update, and save back
        let tempContent = content.replace(/export const (allProductsCatalog|products) = /g, 'module.exports = ');
        fs.writeFileSync('tempData6.cjs', tempContent);
        const prods = require('./tempData6.cjs');
        
        prods.forEach(p => {
            if (aestheticImages[p.id]) {
                p.images.front = aestheticImages[p.id];
                p.images.back = aestheticImages[p.id];
                p.images.side = aestheticImages[p.id];
                p.images.design = aestheticImages[p.id];
            }
        });
        
        const newExport = 'export const allProductsCatalog = ' + JSON.stringify(prods, null, 2) + ';\nexport const products = allProductsCatalog;';
        fs.writeFileSync(file, newExport);
        fs.unlinkSync('tempData6.cjs');
    }
}

// 2. Remove Meesho references from HomePage.jsx
if (fs.existsSync('src/pages/HomePage.jsx')) {
    let hpContent = fs.readFileSync('src/pages/HomePage.jsx', 'utf8');
    hpContent = hpContent.replace(/\(Meesho Style\)/gi, '(Premium Style)');
    hpContent = hpContent.replace(/Meesho look/gi, 'Premium look');
    hpContent = hpContent.replace(/Meesho/gi, 'FutureMemory');
    fs.writeFileSync('src/pages/HomePage.jsx', hpContent);
}

console.log('Removed all references to Meesho and updated images to Pinterest aesthetic.');
