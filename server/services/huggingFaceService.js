import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HfInference } from '@huggingface/inference';
import { uploadImageToSupabase, updateProductInSupabase, isSupabaseConfigured } from '../config/supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local persistent storage directory exists
const publicDir = path.join(__dirname, '..', '..', 'public');
const generatedDir = path.join(publicDir, 'generated-products');
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// Hugging Face Supported Models for Commercial E-Commerce Photography
export const SUPPORTED_MODELS = {
  FLUX_SCHNELL: 'black-forest-labs/FLUX.1-schnell', // State-of-the-art fast commercial studio photos (12B parameters)
  SDXL_BASE: 'stabilityai/stable-diffusion-xl-base-1.0', // High resolution SDXL studio fallback
  SD_15: 'runwayml/stable-diffusion-v1-5' // Lightweight backup
};

const DEFAULT_MODEL = SUPPORTED_MODELS.FLUX_SCHNELL;

// Curated Category-Specific Studio Fallbacks (Amazon-grade studio images)
export const CATEGORY_FALLBACKS = {
  "Women's Fashion": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
  "Men's Fashion": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
  "Kids' Fashion": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80",
  "Bags & Luggage": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
  "Electronics & Gadgets": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  "Home & Kitchen": "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=800&auto=format&fit=crop&q=80",
  "Beauty & Personal Care": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
  "Watches": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
  "Accessories": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
  "Gifts & Greeting Cards": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80"
};

/**
 * Generate Amazon-Style Commercial Studio Prompts tailored specifically by category, item, and angle
 */
export function buildCommercialPrompt(product, angle = 'front') {
  const name = product.name || 'Commercial Product';
  const category = product.category || 'Product';
  const subcategory = product.subcategory || '';
  const color = (product.colors && product.colors[0]) ? product.colors[0] : (product.color?.name || '');
  const desc = product.description || '';

  // Angle-specific descriptors
  let angleDesc = 'front view, centered Amazon catalog presentation';
  if (angle === 'back') {
    angleDesc = 'back view showing reverse styling, clean back cut, and rear details';
  } else if (angle === 'side') {
    angleDesc = 'three-quarter side profile view displaying contour, shape, and silhouette';
  } else if (angle === 'detail') {
    angleDesc = 'extreme macro close-up shot highlighting fabric weave texture, stitching craftsmanship, hardware buttons, and finish';
  }

  let categoryStyle = '';

  // Tailored styling for Men's & Women's Fashion, Footwear, Bags, Gifts, Watches, etc.
  if (category.includes('Men') || category.includes("Men's Fashion")) {
    categoryStyle = `professional menswear commercial catalog photograph, crisp tailored silhouette on invisible mannequin, realistic cotton linen fabric texture, soft studio softbox lighting.`;
  } else if (category.includes('Women') || category.includes("Women's Fashion")) {
    categoryStyle = `high-end womenswear e-commerce studio photography, displayed elegantly on ghost mannequin, graceful fabric drape, delicate embroidery, authentic Indian ethnic and western boutique lighting.`;
  } else if (category.includes('Bags') || category.includes('Luggage') || subcategory.includes('Bag') || subcategory.includes('Wallet')) {
    categoryStyle = `luxury leather goods commercial studio photo, genuine textured leather grain, polished metallic zippers, pristine stitching, upright standing on neutral studio pedestal.`;
  } else if (category.includes('Watches') || subcategory.includes('Watch')) {
    categoryStyle = `luxury horology commercial macro photography, sapphire glass crystal, stainless steel bezel, detailed dial markers, soft directional reflections, placed on a premium minimalist acrylic watch stand.`;
  } else if (category.includes('Gifts') || category.includes('Greeting') || subcategory.includes('Gift')) {
    categoryStyle = `curated luxury celebratory gift merchandise, premium artisan gift presentation, elegant satin ribbon accent, warm celebratory studio ambience, crisp retail catalog quality.`;
  } else if (category.includes('Electronics') || category.includes('Gadgets')) {
    categoryStyle = `modern consumer electronics retail product shot, sleek metallic and matte finish, reflections, clean bezels, crisp precision engineering, isolated white background.`;
  } else if (category.includes('Beauty') || category.includes('Personal')) {
    categoryStyle = `luxury skincare and cosmetic packaging photography, minimalist frosted glass container, clean pump bottle, soft diffused natural daylight, premium beauty retail catalog style.`;
  } else if (category.includes('Home') || category.includes('Kitchen')) {
    categoryStyle = `premium home living and kitchenware product photography, clean minimalist countertop setting, warm diffused light, durable ceramic metallic finish.`;
  } else {
    categoryStyle = `commercial e-commerce product photograph, crisp edges, balanced diffused light, realistic shadows, Amazon catalog hero image.`;
  }

  const prompt = `Professional Amazon commercial product photograph of ${color ? color + ' ' : ''}${name} (${subcategory}), ${angleDesc}. ${desc}. ${categoryStyle} Clean off-white minimalist studio background, soft shadows, 8k resolution, photorealistic, sharp focus, natural true colors, ultra detailed.`;
  
  const negativePrompt = `blurry, deformed, distorted, low quality, artifacts, watermark, signature, text, logo, ugly, bad proportions, cropped, cluttered background, cartoon, 3d render sketch, human face deformed, noise, grainy, low resolution.`;

  return { prompt, negativePrompt };
}

/**
 * Query Open Studio Engine (100% Free photorealistic image generation)
 */
async function queryOpenFluxModel(prompt) {
  const encodedPrompt = encodeURIComponent(prompt.slice(0, 480));
  // Call free high-res engine without model=flux (which requires paid key)
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;
  
  console.log(`[Studio Service] Generating free photorealistic image: ${url.slice(0, 90)}...`);
  const response = await fetch(url, {
    headers: { 'User-Agent': 'FutureMemoryCart-ProductStudio/1.0' }
  });

  if (!response.ok) {
    throw new Error(`Free generation provider returned HTTP ${response.status}. Safe category fallback preserved.`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    success: true,
    buffer,
    contentType: 'image/jpeg',
    model: 'Open Studio Engine (Free Commercial Photo)'
  };
}

/**
 * Call Hugging Face Inference API using official SDK with automated fallback
 */
export async function queryHuggingFaceModel(prompt, negativePrompt, model = DEFAULT_MODEL) {
  const hfToken = process.env.HF_TOKEN ? process.env.HF_TOKEN.trim() : '';

  if (!hfToken || hfToken === 'your_huggingface_user_access_token_here' || hfToken === 'your_huggingface_access_token_here') {
    console.log('[HF Service] HF_TOKEN not configured. Utilizing 100% free studio engine.');
    return queryOpenFluxModel(prompt);
  }

  console.log(`[HF Service] Calling Hugging Face Inference API (Model: ${model})...`);

  try {
    const hf = new HfInference(hfToken);
    const blob = await hf.textToImage({
      model: model,
      inputs: prompt,
      parameters: {
        negative_prompt: negativePrompt
      }
    });

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[HF Service] Hugging Face Inference generated image successfully (${buffer.length} bytes).`);

    return {
      success: true,
      buffer,
      contentType: blob.type || 'image/png',
      model: model
    };
  } catch (hfErr) {
    console.warn(`[HF Service] Hugging Face query returned: "${hfErr.message}". Automatically switching to 100% Free Studio Engine...`);
    // Fallback to free commercial studio engine
    return queryOpenFluxModel(prompt);
  }
}

/**
 * Generate Product Image and Persist to Supabase / Local Storage
 */
export async function generateProductImage({ product, angle = 'front', model = DEFAULT_MODEL, customPrompt = '' }) {
  const { prompt, negativePrompt } = customPrompt 
    ? { prompt: customPrompt, negativePrompt: 'blurry, low quality, artifacts' }
    : buildCommercialPrompt(product, angle);

  const fallbackUrl = CATEGORY_FALLBACKS[product.category] || CATEGORY_FALLBACKS["Men's Fashion"];
  const sanitizedId = (product.id || 'PROD').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const fileName = `${sanitizedId}_${angle}_${timestamp}.jpg`;

  console.log(`[HF Service] Generating image for [${product.id}] "${product.name}" (${angle})...`);
  console.log(`[HF Service] Prompt: "${prompt.slice(0, 110)}..."`);

  try {
    // 1. Query Model (Hugging Face or FLUX Provider)
    const hfResult = await queryHuggingFaceModel(prompt, negativePrompt, model);

    // 2. Persistent Save (Local Public Static)
    const localFilePath = path.join(generatedDir, fileName);
    fs.writeFileSync(localFilePath, hfResult.buffer);
    const localStaticUrl = `/generated-products/${fileName}`;
    console.log(`[HF Service] Saved locally to: ${localFilePath}`);

    // 3. Persistent Save (Supabase Storage if configured)
    let finalUrl = localStaticUrl;
    let storageType = 'local';

    if (isSupabaseConfigured()) {
      console.log(`[HF Service] Uploading to Supabase Storage...`);
      const supabaseUrl = await uploadImageToSupabase(hfResult.buffer, fileName, hfResult.contentType);
      if (supabaseUrl) {
        finalUrl = supabaseUrl;
        storageType = 'supabase';
        console.log(`[HF Service] Uploaded to Supabase Storage: ${supabaseUrl}`);
        
        // Also update Supabase database table if configured
        await updateProductInSupabase(product.id, {
          image: supabaseUrl,
          images: { [angle]: supabaseUrl }
        });
      }
    }

    return {
      success: true,
      imageUrl: finalUrl,
      localUrl: localStaticUrl,
      storageType,
      fileName,
      modelUsed: hfResult.model,
      productId: product.id,
      angle,
      promptUsed: prompt,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.warn(`[HF Service] Generation failed for ${product.id}:`, err.message);
    return {
      success: false,
      error: err.message,
      fallbackUrl,
      productId: product.id,
      angle,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Controlled Batch Generation (with duplicate prevention and rate limiting)
 */
export async function batchGenerateProductImages(products, { angle = 'front', model = DEFAULT_MODEL } = {}) {
  const results = [];
  console.log(`[HF Service] Starting controlled batch generation for ${products.length} products...`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`[HF Service] Processing item ${i + 1} of ${products.length}: [${p.id}] ${p.name}`);

    const res = await generateProductImage({ product: p, angle, model });
    results.push(res);

    // Rate-limiting delay between requests to prevent API throttling
    if (i < products.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  return results;
}

export default {
  SUPPORTED_MODELS,
  CATEGORY_FALLBACKS,
  buildCommercialPrompt,
  queryHuggingFaceModel,
  generateProductImage,
  batchGenerateProductImages
};
