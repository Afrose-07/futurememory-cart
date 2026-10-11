import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import { getMongoStatus } from '../config/db.mongo.js';
import { generateProductImage, batchGenerateProductImages, SUPPORTED_MODELS } from '../services/huggingFaceService.js';
import { isSupabaseConfigured, updateProductInSupabase } from '../config/supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// In-memory catalog store as fallback when MongoDB is not running
let memoryProducts = [
  {
    id: 'prod_seed_1',
    sku: 'SKU-7721',
    name: 'Classic Chronograph Royal Blue Watch',
    currentPrice: 3499,
    originalPrice: 4999,
    discount: '30% OFF',
    occasionId: 'anniversary',
    occasionName: 'Anniversary & Tech',
    category: 'Watches',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500',
    rating: 4.9,
    reviewsCount: 38,
    inStock: true,
    description: 'Stainless steel sapphire glass chronograph water resistant to 50m.'
  },
  {
    id: 'prod_seed_2',
    sku: 'SKU-8832',
    name: 'Active Noise Cancelling Wireless Headphones',
    currentPrice: 4999,
    originalPrice: 7999,
    discount: '37% OFF',
    occasionId: 'birthday',
    occasionName: 'Birthday & Audio',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    rating: 4.8,
    reviewsCount: 92,
    inStock: true,
    description: '40mm drivers with 35hr battery life and dual mic for crystal clear calls.'
  },
  {
    id: 'prod_seed_3',
    sku: 'SKU-9941',
    name: 'Handcrafted Heritage Silk Saree with Gold Border',
    currentPrice: 6499,
    originalPrice: 8999,
    discount: '28% OFF',
    occasionId: 'wedding',
    occasionName: 'Wedding & Celebrations',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500',
    rating: 4.95,
    reviewsCount: 45,
    inStock: true,
    description: 'Pure Kanchipuram weave silk with zari border for weddings and traditional functions.'
  }
];

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { search, occasion, category } = req.query;

    if (getMongoStatus()) {
      let query = {};
      if (occasion && occasion !== 'all') {
        query.occasionId = occasion;
      }
      if (category && category !== 'all') {
        query.category = category;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { occasionName: { $regex: search, $options: 'i' } }
        ];
      }

      const products = await Product.find(query).sort({ createdAt: -1 });
      if (products.length > 0) {
        return res.json({ success: true, count: products.length, products });
      }
    }

    // In-memory fallback
    let filtered = [...memoryProducts];
    if (occasion && occasion !== 'all') {
      filtered = filtered.filter(p => p.occasionId === occasion);
    }
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        (p.occasionName && p.occasionName.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, count: filtered.length, products: filtered });
  } catch (err) {
    console.error('Fetch products error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// POST /api/products (Admin creates new product)
router.post('/', async (req, res) => {
  try {
    const { name, currentPrice, originalPrice, occasionId, occasionName, category, image, description } = req.body;

    if (!name || !currentPrice) {
      return res.status(400).json({ success: false, message: 'Name and current price are required' });
    }

    const priceNum = parseInt(currentPrice, 10);
    const origPriceNum = parseInt(originalPrice, 10) || Math.round(priceNum * 1.2);
    const skuCode = 'SKU-' + Math.floor(1000 + Math.random() * 9000);

    const productPayload = {
      sku: skuCode,
      name,
      currentPrice: priceNum,
      originalPrice: origPriceNum,
      discount: '15% OFF',
      occasionId: occasionId || 'general',
      occasionName: occasionName || 'Curated Gifts',
      category: category || 'General',
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      rating: 4.8,
      reviewsCount: 1,
      inStock: true,
      description: description || 'Verified authentic premium item.'
    };

    if (getMongoStatus()) {
      const newProd = new Product(productPayload);
      await newProd.save();
      return res.status(201).json({ success: true, product: newProd });
    }

    // In-memory fallback
    const memoryItem = { id: 'prod_' + Date.now(), ...productPayload };
    memoryProducts.unshift(memoryItem);
    return res.status(201).json({ success: true, product: memoryItem });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

// PUT /api/products/:id (Update product details, price, or stock)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getMongoStatus()) {
      const updated = await Product.findByIdAndUpdate(id, updates, { new: true });
      if (updated) {
        return res.json({ success: true, product: updated });
      }
    }

    // In-memory fallback
    memoryProducts = memoryProducts.map(p => {
      if (p.id === id || p.sku === id) {
        return { ...p, ...updates };
      }
      return p;
    });

    const found = memoryProducts.find(p => p.id === id || p.sku === id);
    return res.json({ success: true, product: found });
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (getMongoStatus()) {
      await Product.findByIdAndDelete(id);
    }

    memoryProducts = memoryProducts.filter(p => p.id !== id && p.sku !== id);
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// ==========================================
// Hugging Face AI Image Generation Endpoints
// ==========================================

// GET /api/products/ai-status
router.get('/ai-status', (req, res) => {
  const hfConfigured = Boolean(process.env.HF_TOKEN);
  const supabaseConfigured = isSupabaseConfigured();

  res.json({
    success: true,
    huggingFace: {
      configured: hfConfigured,
      models: SUPPORTED_MODELS,
      defaultModel: SUPPORTED_MODELS.FLUX_SCHNELL
    },
    storage: {
      supabaseConfigured,
      localPersistentConfigured: true,
      directory: '/generated-products'
    }
  });
});

// POST /api/products/generate-image
router.post('/generate-image', async (req, res) => {
  try {
    const { product, angle, model, customPrompt } = req.body;

    if (!product || !product.id) {
      return res.status(400).json({ success: false, message: 'Missing product or product.id' });
    }

    const result = await generateProductImage({
      product,
      angle: angle || 'front',
      model: model || SUPPORTED_MODELS.FLUX_SCHNELL,
      customPrompt
    });

    return res.json(result);
  } catch (err) {
    console.error('AI Generation Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products/batch-generate-images
router.post('/batch-generate-images', async (req, res) => {
  try {
    const { products, angle, model } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Products array is required' });
    }

    // Safety limit per batch request
    const batchList = products.slice(0, 10);
    const results = await batchGenerateProductImages(batchList, {
      angle: angle || 'front',
      model: model || SUPPORTED_MODELS.FLUX_SCHNELL
    });

    return res.json({
      success: true,
      total: results.length,
      successfulCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length,
      results
    });
  } catch (err) {
    console.error('Batch Generation Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products/apply-image
router.post('/apply-image', async (req, res) => {
  try {
    const { productId, imageUrl, angle = 'front' } = req.body;

    if (!productId || !imageUrl) {
      return res.status(400).json({ success: false, message: 'productId and imageUrl are required' });
    }

    const catalogPath = path.join(__dirname, '..', '..', 'src', 'data', 'canonicalCatalog.js');
    if (fs.existsSync(catalogPath)) {
      const content = fs.readFileSync(catalogPath, 'utf8');
      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = content.slice(jsonStart, jsonEnd + 1);
        const catalog = JSON.parse(jsonStr);
        const target = catalog.find(p => p.id === productId);
        if (target) {
          target.image = imageUrl;
          if (!target.images) target.images = {};
          target.images[angle] = imageUrl;
          target.imageStatus = 'AI_GENERATED';
          target.imageMetadata = {
            source: 'HuggingFace AI',
            appliedAt: new Date().toISOString()
          };

          const banner = `// Canonical Store Catalog - 10 Core Categories from Master Blueprint\n// 100% Unique, Verified, High-Resolution Studio Imagery with Zero Duplicates\n// Powered by Image Enrichment Engine with Hugging Face AI Integration\n\n`;
          fs.writeFileSync(catalogPath, `${banner}export const canonicalCatalog = ${JSON.stringify(catalog, null, 2)};\n`, 'utf8');
          console.log(`[Catalog] Successfully applied AI image to product ${productId} in canonicalCatalog.js`);
        }
      }
    }

    // Update in-memory fallback store as well
    memoryProducts = memoryProducts.map(p => {
      if (p.id === productId || p.sku === productId) {
        return { ...p, image: imageUrl };
      }
      return p;
    });

    // Update Supabase DB if configured
    if (isSupabaseConfigured()) {
      await updateProductInSupabase(productId, {
        image: imageUrl,
        images: { [angle]: imageUrl },
        updated_at: new Date().toISOString()
      });
    }

    return res.json({
      success: true,
      message: `Successfully applied image to ${productId}`,
      productId,
      imageUrl
    });
  } catch (err) {
    console.error('Apply Image Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
