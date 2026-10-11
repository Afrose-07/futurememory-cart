import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

// Setup environment and paths
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the massive 500 product catalog from the frontend source
// Note: We are using a regex to parse the file for demonstration since it's a JS file with exports.
// In a real scenario, we'd import it, but we can just use the provided fallback data or raw parser.
// For this script, we'll populate the database with a high volume of diverse products.

const generateSeedData = () => {
  const dummyProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/dummyJsonCatalog.json'), 'utf8'));
  return dummyProducts.map(p => ({
      sku: `SKU-${10000 + p.id}`,
      name: p.name,
      currentPrice: p.currentPrice,
      originalPrice: p.originalPrice,
      discount: p.discount,
      occasionId: 'all',
      occasionName: 'All Occasions',
      category: p.category,
      image: p.image,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      inStock: p.inStock,
      description: p.description
  }));
};

async function seedDatabase() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/futurememory';
  console.log(`Connecting to MongoDB at: ${uri}`);

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to Database');

    console.log('🗑️ Clearing existing products...');
    await Product.deleteMany({});

    console.log('🌱 Seeding 500 premium products into the database...');
    const seedData = generateSeedData();
    await Product.insertMany(seedData);

    console.log('🎉 Successfully seeded 500 products into the database!');
    console.log('You can now fetch these from your API via GET /api/products');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
