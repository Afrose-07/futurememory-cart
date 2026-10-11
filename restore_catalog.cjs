const fs = require('fs');
const categories = ['Electronics', 'Home & Kitchen', 'Fashion', 'Timepieces', 'Beauty & Personal Care', 'Jewelry'];
const subcategories = ['Smartphones', 'Laptops', 'Audio', 'Appliances', 'Decor', 'Footwear', 'Clothing', 'Watches', 'Fragrances'];

let products = [];
for (let i = 1; i <= 200; i++) {
  let cat = categories[i % categories.length];
  
  let img = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'; // Watch
  if (cat === 'Electronics') img = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80';
  else if (cat === 'Home & Kitchen') img = 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80';
  else if (cat === 'Fashion') img = 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600&q=80';
  else if (cat === 'Beauty & Personal Care') img = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80';
  else if (cat === 'Jewelry') img = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80';

  products.push({
    id: 'MOCK-' + i,
    modelId: 'MDL-' + i,
    name: 'Premium ' + cat + ' Item ' + i,
    gender: i % 2 === 0 ? 'Men' : 'Women',
    category: cat,
    subcategory: subcategories[i % subcategories.length],
    brand: 'Brand ' + (i % 5),
    description: 'This is a premium product designed for everyday use and special occasions. It features high-quality materials and excellent craftsmanship.',
    price: 999 + (i * 100),
    originalPrice: 1999 + (i * 100),
    discount: 15,
    images: {
      front: img,
      back: img,
      side: img,
      design: img
    },
    colors: ['Black', 'White', 'Blue'],
    sizes: ['Standard', 'M', 'L'],
    rating: parseFloat((4 + (i % 10) / 10).toFixed(1)),
    reviewCount: 100 + i * 5,
    stock: 20 + i,
    occasion: ['formal', 'casual', 'anniversary', 'birthday', 'wedding'],
    tags: ['premium', 'gift', 'special'],
    color: { name: 'Black', value: '#000000' },
    stockBySize: { 'Standard': 10, 'M': 5, 'L': 5 }
  });
}

let fileContent = `export const allProductsCatalog = ${JSON.stringify(products, null, 2)};

export const occasionsMetadata = [
  { id: 'anniversary', name: 'Anniversaries', description: 'Gifts for him and her', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'birthday', name: 'Birthdays', description: 'Make their day special', image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84' },
  { id: 'wedding', name: 'Weddings', description: 'Celebrate the union', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'festival', name: 'Festivals', description: 'Joyful celebrations', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'casual', name: 'Casual', description: 'Everyday wear and use', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'housewarming', name: 'Housewarming', description: 'For the new home', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'work', name: 'Work', description: 'Professional essentials', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'party', name: 'Party', description: 'Stand out from the crowd', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' }
];`;

fs.writeFileSync('src/data/allOccasionsCatalog.js', fileContent);
console.log('Successfully reverted catalog to 200 items');
