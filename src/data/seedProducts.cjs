const fs = require('fs');

// We will extract rawOccasionsData and getCuratedImage from the file content
const allOccDataContent = fs.readFileSync('./src/data/allOccasionsCatalog.js', 'utf8');

const getCuratedImageRegex = /function getCuratedImage[\s\S]*?return `https:\/\/picsum\.photos\/seed\/\${itemName\.replace\(\/\[\^a-zA-Z\]\/g, ''\)}\/500\/500`;\n\}/;
const getCuratedImageMatch = allOccDataContent.match(getCuratedImageRegex);

let getCuratedImageFn = null;
if (getCuratedImageMatch) {
  // We need curatedStyleImages object too
  const curatedStyleRegex = /const curatedStyleImages = \{[\s\S]*?\};\n\nfunction getCuratedImage/;
  const curatedStyleMatch = allOccDataContent.match(curatedStyleRegex);
  
  if (curatedStyleMatch) {
    const code = curatedStyleMatch[0].replace('function getCuratedImage', '') + '\n' + getCuratedImageMatch[0];
    // Evaluate the code to get the function
    const wrappedCode = `
      ${code}
      module.exports = getCuratedImage;
    `;
    fs.writeFileSync('./tempImageFn.cjs', wrappedCode);
    getCuratedImageFn = require('../../tempImageFn.cjs');
  }
}

const itemNames = {
  'Men': [
    'Classic Leather Watch', 'Luxury Smart Watch', 'Formal Leather Shoe', 'Running Sneaker Shoe',
    'Office Briefcase Bag', 'Travel Backpack Bag', 'Signature Men Perfume', 'Chronograph Watch'
  ],
  'Women': [
    'Evening Gown Dress', 'Floral Party Dress', 'High Heel Shoe', 'Designer Tote Bag',
    'Luxury Rose Perfume', 'Elegant Clutch Bag', 'Rose Gold Smart Watch', 'Summer Beach Dress'
  ],
  'Kids': [
    'Kids Smart Watch', 'School Backpack Bag', 'Cute Sneaker Shoe', 'Princess Party Dress',
    'Kids Running Shoe', 'Colorful School Bag'
  ],
  'Unisex': [
    'Sport Smartwatch', 'Minimalist Watch', 'Canvas Sneaker Shoe', 'Unisex Fragrance Perfume',
    'Duffel Travel Bag', 'Running Sneaker Shoe'
  ]
};

const categories = ['Tech & Gadgets', 'Ethnic', 'Jewellery', 'Bags', 'Footwear', 'Accessories', 'Western'];
const genders = ['Men', 'Women', 'Kids', 'Unisex'];
const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gold', 'Silver', 'Brown', 'Multicolor'];
const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const products = [];
let id = 1;

categories.forEach(category => {
  genders.forEach(gender => {
    // Generate 100 products for this combination
    const namesList = itemNames[gender] || itemNames['Unisex'];
    
    for (let i = 0; i < 100; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const productSizes = sizes.filter(() => Math.random() > 0.5);
      if (productSizes.length === 0) productSizes.push(sizes[Math.floor(Math.random() * sizes.length)]);
      
      const currentPrice = Math.floor(Math.random() * 4500) + 500;
      const originalPrice = currentPrice + Math.floor(Math.random() * 1000) + 200;
      
      const baseName = namesList[Math.floor(Math.random() * namesList.length)];
      const productName = `${color} ${baseName}`;
      
      let image = `https://picsum.photos/seed/${id}/500/500`;
      if (getCuratedImageFn) {
        image = getCuratedImageFn(baseName, null, id);
      }
      
      products.push({
        id: id++,
        name: productName,
        description: `Premium quality ${productName.toLowerCase()} perfect for any occasion. Designed specifically for ${gender.toLowerCase()}.`,
        currentPrice,
        originalPrice,
        discount: `${Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF`,
        category,
        gender,
        color,
        sizes: productSizes,
        image: image,
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        reviewsCount: Math.floor(Math.random() * 500),
        inStock: Math.random() > 0.1 // 90% chance to be in stock
      });
    }
  });
});

fs.writeFileSync('./src/data/dummyJsonCatalog.json', JSON.stringify(products, null, 2));
console.log(`Generated ${products.length} products successfully with curated images.`);
