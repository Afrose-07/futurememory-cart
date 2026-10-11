import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

import { generateProductImage, SUPPORTED_MODELS } from '../server/services/huggingFaceService.js';

const testProducts = [
  {
    id: 'MF-01',
    name: 'Formal Shirt',
    category: "Men's Fashion",
    subcategory: 'Shirts',
    colors: ['Sky Blue', 'White'],
    description: 'Slim fit formal cotton shirt with spread collar and French cuffs'
  },
  {
    id: 'WF-05',
    name: 'Lehenga',
    category: "Women's Fashion",
    subcategory: 'Ethnic',
    colors: ['Maroon', 'Gold'],
    description: 'Designer bridal raw silk lehenga choli with zari zardozi hand embroidery'
  },
  {
    id: 'GC-01',
    name: 'Personalized Mug',
    category: 'Gifts & Greeting Cards',
    subcategory: 'Personalized',
    colors: ['White', 'Gold Accent'],
    description: 'Ceramic custom photo keepsake mug with glossy finish and gift box packaging'
  },
  {
    id: 'WT-01',
    name: "Men's Watch",
    category: 'Watches',
    subcategory: 'Analog',
    colors: ['Silver', 'Navy Blue'],
    description: 'Stainless steel sapphire glass chronograph with genuine leather strap'
  },
  {
    id: 'EG-05',
    name: 'Earbuds',
    category: 'Electronics & Gadgets',
    subcategory: 'Audio',
    colors: ['Matte Black'],
    description: 'Active noise cancelling true wireless Bluetooth earbuds in sleek charging case'
  }
];

async function runTest() {
  console.log('====================================================');
  console.log('🧪 Starting 5-Product E-Commerce Image Generation Test');
  console.log('====================================================\n');

  const results = [];

  for (let i = 0; i < testProducts.length; i++) {
    const prod = testProducts[i];
    console.log(`[${i + 1}/5] Testing product: [${prod.id}] ${prod.name} (${prod.category})...`);
    
    const startTime = Date.now();
    const result = await generateProductImage({
      product: prod,
      angle: 'front',
      model: SUPPORTED_MODELS.FLUX_SCHNELL
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(` -> Success: ${result.success}`);
    console.log(` -> Model: ${result.modelUsed}`);
    console.log(` -> URL: ${result.imageUrl}`);
    console.log(` -> Storage: ${result.storageType}`);
    console.log(` -> Time: ${duration}s\n`);

    results.push(result);
  }

  console.log('====================================================');
  console.log('📊 Test Summary:');
  console.log(`Total Tested: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  console.log('====================================================');
  
  results.forEach(r => {
    console.log(`- ${r.productId}: ${r.success ? '✅ ' + r.imageUrl : '❌ ' + r.error}`);
  });
}

runTest().catch(err => {
  console.error('Test execution failed:', err);
});
