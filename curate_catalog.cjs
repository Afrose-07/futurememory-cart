const fs = require('fs');

let fileContent = fs.readFileSync('src/data/realProducts.js', 'utf8');
let dataCode = fileContent.replace('export const realProducts = ', 'module.exports = ');
fs.writeFileSync('tempData5.cjs', dataCode);

const allProducts = require('./tempData5.cjs');

const uniqueModels = new Map();
const curatedProducts = [];

const colorImageMap = {
    "Black": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    "White": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    "Navy Blue": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80",
    "Olive Green": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    "Maroon": "https://images.unsplash.com/photo-1596755094514-f87e32f6b717?w=800&q=80",
    "Sky Blue": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ce3?w=800&q=80",
    "Blue": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80"
};

const imagesLib = {
    "Men_Shirts": [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80", 
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80", 
        "https://images.unsplash.com/photo-1596755094514-f87e32f6b717?w=600&q=80", 
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ce3?w=600&q=80"  
    ],
    "default": [
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80"
    ]
};

const categoryCount = {};

for (const p of allProducts) {
    if (!uniqueModels.has(p.modelId)) {
        const catKey = p.gender + "_" + p.subcategory;
        categoryCount[catKey] = (categoryCount[catKey] || 0) + 1;
        
        if (categoryCount[catKey] <= 4) {
            uniqueModels.set(p.modelId, { catKey, index: categoryCount[catKey] - 1 });
        }
    }
}

for (const p of allProducts) {
    if (uniqueModels.has(p.modelId)) {
        const info = uniqueModels.get(p.modelId);
        
        const imgOptions = imagesLib[info.catKey] || imagesLib.default;
        let finalImg = imgOptions[info.index % imgOptions.length];

        // If it's a known color, use the mapped image instead so color variants change correctly
        if (p.color && p.color.name && colorImageMap[p.color.name]) {
            finalImg = colorImageMap[p.color.name];
        }
        
        p.images = {
            front: finalImg,
            back: finalImg,
            side: finalImg,
            design: finalImg
        };

        curatedProducts.push(p);
    }
}

const newExport = 'export const realProducts = ' + JSON.stringify(curatedProducts, null, 2) + ';';
fs.writeFileSync('src/data/realProducts.js', newExport);
fs.unlinkSync('tempData5.cjs');
