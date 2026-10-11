const fs = require('fs');
const path = require('path');

const newProducts = [
  {
    id: 'MEN-WATCH-001',
    modelId: 'MW001',
    name: 'Green Classic Leather Watch',
    gender: 'Men',
    category: 'Accessories',
    subcategory: 'Watches',
    description: 'Premium classic leather watch with a green dial. Perfect for formal and casual wear.',
    price: 1199,
    originalPrice: 1499,
    discount: 20,
    images: {
      front: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500',
      back: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500',
      side: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500',
      design: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500'
    },
    colors: ['Green', 'Brown', 'Black'],
    sizes: [],
    rating: 4.8,
    reviewCount: 320,
    stock: 50,
    occasion: ['birthday', 'anniversary', 'job_interview'],
    tags: ['watch', 'leather', 'classic']
  },
  {
    id: 'MEN-SHIRT-001',
    modelId: 'MS001',
    name: 'Classic White Formal Shirt',
    gender: 'Men',
    category: 'Clothing',
    subcategory: 'Shirts',
    description: 'Crisp white formal shirt made with 100% premium cotton. Ideal for office and interviews.',
    price: 899,
    originalPrice: 1299,
    discount: 30,
    images: {
      front: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=500',
      back: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=500',
      side: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=500',
      design: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=500'
    },
    colors: ['White', 'Light Blue'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.5,
    reviewCount: 150,
    stock: 120,
    occasion: ['job_interview', 'first_day_work'],
    tags: ['shirt', 'formal', 'cotton']
  },
  {
    id: 'WMN-DRESS-001',
    modelId: 'WD001',
    name: 'Red Evening Gown',
    gender: 'Women',
    category: 'Clothing',
    subcategory: 'Dresses',
    description: 'Elegant red evening gown with a flowing silhouette. Guaranteed to turn heads at any event.',
    price: 2499,
    originalPrice: 3599,
    discount: 30,
    images: {
      front: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
      back: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
      side: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
      design: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500'
    },
    colors: ['Red', 'Black', 'Navy Blue'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.9,
    reviewCount: 85,
    stock: 30,
    occasion: ['date_evening', 'anniversary'],
    tags: ['dress', 'gown', 'evening']
  },
  {
    id: 'UNI-SNEAK-001',
    modelId: 'US001',
    name: 'White Running Sneakers',
    gender: 'Unisex',
    category: 'Footwear',
    subcategory: 'Sneakers',
    description: 'Lightweight and comfortable white running sneakers. Built for performance and style.',
    price: 1599,
    originalPrice: 2499,
    discount: 36,
    images: {
      front: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      back: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      side: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      design: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
    },
    colors: ['White', 'Black'],
    sizes: ['6', '7', '8', '9', '10', '11'],
    rating: 4.6,
    reviewCount: 420,
    stock: 200,
    occasion: ['college_event', 'vacation'],
    tags: ['sneakers', 'running', 'shoes']
  }
];

fs.writeFileSync('src/data/realProducts.js', 'export const realProducts = ' + JSON.stringify(newProducts, null, 2) + ';\n');

// Update UI files
function updateUIFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            updateUIFiles(filepath);
        } else if (filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
            let content = fs.readFileSync(filepath, 'utf8');
            let original = content;
            
            // Map old fields to new fields
            content = content.replace(/\bproduct\.currentPrice\b/g, 'product.price');
            content = content.replace(/\bitem\.currentPrice\b/g, 'item.price');
            content = content.replace(/\bp\.currentPrice\b/g, 'p.price');
            
            content = content.replace(/\bproduct\.image\b/g, 'product.images.front');
            content = content.replace(/\bitem\.image\b/g, 'item.images.front');
            content = content.replace(/\bp\.image\b/g, 'p.images.front');
            
            content = content.replace(/\bproduct\.reviewsCount\b/g, 'product.reviewCount');
            
            // Fix discount string assumption in UI
            // Before: {product.discount} (which was "22% OFF")
            // Now: {product.discount}% OFF
            // Need to carefully replace this in JSX
            // Actually it's easier to just do it via regex
            content = content.replace(/\{([a-zA-Z]+)\.discount\}/g, '{$1.discount}% OFF');
            content = content.replace(/\{([a-zA-Z]+)\.discount\}% OFF% OFF/g, '{$1.discount}% OFF'); // Fix double replacement

            // inStock -> stock > 0
            content = content.replace(/\bproduct\.inStock\b/g, '(product.stock > 0)');
            content = content.replace(/\bitem\.inStock\b/g, '(item.stock > 0)');
            content = content.replace(/\bp\.inStock\b/g, '(p.stock > 0)');
            
            if (content !== original) {
                fs.writeFileSync(filepath, content, 'utf8');
                console.log('Updated UI mapping in:', filepath);
            }
        }
    }
}

updateUIFiles('src/components');
updateUIFiles('src/pages');
updateUIFiles('src/context');

console.log('Done restructuring product data and updating UI.');
