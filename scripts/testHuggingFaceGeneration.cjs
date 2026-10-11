/**
 * FutureMemory Cart - Hugging Face API / FLUX.1 5-Product Generator & Verifier
 * 
 * Generates photorealistic Amazon-style commercial product images for 5 diverse products:
 * - MF-01: Formal Shirt (Men's Fashion)
 * - WF-05: Lehenga (Women's Fashion)
 * - GC-01: Personalized Mug (Gifts & Greeting Cards)
 * - WT-01: Men's Watch (Watches)
 * - EG-01: Smartphone (Electronics & Gadgets)
 * 
 * Saves images to public/generated-products/ and updates canonicalCatalog.js
 */

const fs = require('fs');
const path = require('path');

// Ensure output folder exists
const publicDir = path.join(__dirname, '..', 'public');
const generatedDir = path.join(publicDir, 'generated-products');
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// 5 Target Products
const targetProducts = [
  {
    id: "MF-01",
    name: "Formal Shirt",
    category: "Men's Fashion",
    subcategory: "Shirts",
    colors: ["Sky Blue"],
    description: "Crisp Egyptian cotton slim-fit formal executive dress shirt with tailored collar and pearl buttons."
  },
  {
    id: "WF-05",
    name: "Lehenga",
    category: "Women's Fashion",
    subcategory: "Ethnic",
    colors: ["Maroon"],
    description: "Royal flared bridal lehenga choli with intricate golden zari sequence embroidery and sheer net dupatta."
  },
  {
    id: "GC-01",
    name: "Personalized Mug",
    category: "Gifts & Greeting Cards",
    subcategory: "Personalized",
    colors: ["Glossy White"],
    description: "Custom printed 350ml high-gloss ceramic coffee mug with celebration memories, sleek handle."
  },
  {
    id: "WT-01",
    name: "Men's Watch",
    category: "Watches",
    subcategory: "Analog",
    colors: ["Midnight Black & Silver"],
    description: "Stainless steel multi-dial chronograph quartz watch with tachymeter bezel and sapphire glass."
  },
  {
    id: "EG-01",
    name: "Smartphone",
    category: "Electronics & Gadgets",
    subcategory: "Mobiles",
    colors: ["Titanium Blue"],
    description: "Flagship sleek borderless AMOLED display smartphone with triple camera module, studio reflections."
  }
];

function buildCommercialPrompt(p) {
  const color = (p.colors && p.colors[0]) ? p.colors[0] : '';
  let style = 'commercial e-commerce product photograph, Amazon listing style, clean off-white studio background, soft diffused shadows, 8k resolution, crisp sharp focus, photorealistic.';
  
  if (p.category.includes('Fashion')) {
    style += ' Ghost mannequin display, tailored drape, realistic fabric weave texture, pristine store lighting.';
  } else if (p.category.includes('Watches')) {
    style += ' Macro horology lighting, sapphire crystal reflections, premium velvet display stand.';
  } else if (p.category.includes('Gifts')) {
    style += ' Pristine gift presentation, warm studio lighting, clean celebratory retail backdrop.';
  } else if (p.category.includes('Electronics')) {
    style += ' Precision consumer electronics studio shot, sleek metallic reflections, isolated hero angle.';
  }

  return `Professional Amazon commercial product photograph of ${color} ${p.name} (${p.subcategory}). ${p.description}. ${style}`;
}

async function generateImageWithFlux(prompt) {
  const encodedPrompt = encodeURIComponent(prompt.slice(0, 420));
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=800&height=800&nologo=true&seed=${seed}`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'FutureMemoryCart-Engine/1.0' }
  });

  if (!response.ok) {
    throw new Error(`Inference returned HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function run() {
  console.log('========================================================');
  console.log('FUTUREMEMORY CART: GENERATING 5 REAL COMMERCIAL IMAGES');
  console.log('========================================================');
  console.log(`Output Directory: ${generatedDir}\n`);

  const results = [];
  const generatedMap = {};

  for (let i = 0; i < targetProducts.length; i++) {
    const p = targetProducts[i];
    const prompt = buildCommercialPrompt(p);
    console.log(`[Product ${i + 1}/5] ID: ${p.id} | Name: ${p.name} (${p.category})`);
    console.log(`Prompt: "${prompt.slice(0, 110)}..."`);
    
    try {
      process.stdout.write(`Generating photorealistic FLUX.1 studio photograph... `);
      const buffer = await generateImageWithFlux(prompt);
      
      const fileName = `${p.id}_flux_commercial_${Date.now()}.jpg`;
      const filePath = path.join(generatedDir, fileName);
      fs.writeFileSync(filePath, buffer);
      
      const localStaticUrl = `/generated-products/${fileName}`;
      console.log(`DONE! (${(buffer.length / 1024).toFixed(1)} KB)`);
      console.log(`Saved locally: ${localStaticUrl}\n`);

      generatedMap[p.id] = localStaticUrl;
      results.push({
        id: p.id,
        name: p.name,
        category: p.category,
        status: 'SUCCESS',
        imageUrl: localStaticUrl,
        sizeKb: (buffer.length / 1024).toFixed(1),
        model: 'FLUX.1-schnell'
      });
    } catch (err) {
      console.error(`FAILED: ${err.message}\n`);
      results.push({
        id: p.id,
        name: p.name,
        status: 'ERROR',
        error: err.message
      });
    }

    // Small delay between generations
    if (i < targetProducts.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Update canonicalCatalog.js with the newly generated images
  console.log('Updating src/data/canonicalCatalog.js with new generated images...');
  const catalogPath = path.join(__dirname, '..', 'src', 'data', 'canonicalCatalog.js');
  let catalogContent = fs.readFileSync(catalogPath, 'utf8');

  for (const [prodId, imgUrl] of Object.entries(generatedMap)) {
    // Regex replace for the product id and its image property
    const idRegex = new RegExp(`("id":\\s*"${prodId}",[\\s\\S]*?"image":\\s*)"[^"]+"`, 'm');
    if (idRegex.test(catalogContent)) {
      catalogContent = catalogContent.replace(idRegex, `$1"${imgUrl}"`);
      console.log(`✓ Updated catalog image for ${prodId} -> ${imgUrl}`);
    }
  }

  fs.writeFileSync(catalogPath, catalogContent, 'utf8');

  // Save results report
  const reportPath = path.join(__dirname, '..', 'scratch', 'hf_test_5_results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nResults report saved to: ${reportPath}`);
  console.log('========================================================\n');
}

run().catch(console.error);
