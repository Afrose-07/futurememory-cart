const fs = require('fs');

let fileContent = fs.readFileSync('src/data/realProducts.js', 'utf8');

// Strip out " Edition \d"
fileContent = fileContent.replace(/ Edition \d+/g, '');

const menTShirtImages = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500'
];

let dataCode = fileContent.replace('export const realProducts = ', 'module.exports = ');
fs.writeFileSync('tempData.cjs', dataCode);

const products = require('./tempData.cjs');

products.forEach(p => {
    if (p.gender === 'Men' && p.category === 'Clothing') {
        p.name = p.name.replace(' - Premium Collection', '');
        
        if (p.name.includes('Men\'s T-Shirts')) {
            const types = ['Classic Crew Neck', 'Premium Slim Fit', 'Urban Graphic Tee', 'Vintage V-Neck', 'Oversized Streetwear'];
            p.name = types[Math.floor(Math.random() * types.length)];
        }

        if (p.subcategory && p.subcategory.includes('T-Shirt')) {
            p.images.front = menTShirtImages[Math.floor(Math.random() * menTShirtImages.length)];
            p.images.back = menTShirtImages[Math.floor(Math.random() * menTShirtImages.length)];
            p.images.side = menTShirtImages[Math.floor(Math.random() * menTShirtImages.length)];
            p.images.design = menTShirtImages[Math.floor(Math.random() * menTShirtImages.length)];
        }
    }
    
    // Clean up Placehold.co images everywhere
    ['front', 'back', 'side', 'design'].forEach(key => {
        if (p.images && p.images[key] && p.images[key].includes('placehold.co')) {
             p.images[key] = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500'; 
        }
    });
});

const newExport = 'export const realProducts = ' + JSON.stringify(products, null, 2) + ';';
fs.writeFileSync('src/data/realProducts.js', newExport);
fs.unlinkSync('tempData.cjs');

console.log('Fixed products data.');
