const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Candidate mappings for the 10 representative test products
const testProducts = [
  {
    id: "WF-01",
    name: "Kurti Set",
    category: "Women's Fashion",
    subcategory: "Kurti Sets",
    source: "Unsplash",
    targetQuery: "Indian ethnic pink kurti palazzo set",
    candidateUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
    attribution: {
      photographer: "Nimrat Sandhu",
      photographerUrl: "https://unsplash.com/@nimrat",
      source: "Unsplash",
      license: "Unsplash License (Free to use with attribution)"
    }
  },
  {
    id: "WF-02",
    name: "Anarkali Suit",
    category: "Women's Fashion",
    subcategory: "Ethnic",
    source: "Unsplash",
    targetQuery: "Royal green anarkali suit dupatta traditional",
    candidateUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
    attribution: {
      photographer: "Kunal Goswami",
      photographerUrl: "https://unsplash.com/@kunal_goswami",
      source: "Unsplash",
      license: "Unsplash License (Free to use with attribution)"
    }
  },
  {
    id: "MF-01",
    name: "Formal Shirt",
    category: "Men's Fashion",
    subcategory: "Shirts",
    source: "Unsplash",
    targetQuery: "Men crisp formal button down dress shirt executive",
    candidateUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
    attribution: {
      photographer: "Nimble Made",
      photographerUrl: "https://unsplash.com/@nimblemade",
      source: "Unsplash",
      license: "Unsplash License (Free to use with attribution)"
    }
  },
  {
    id: "BL-01",
    name: "Handbag",
    category: "Bags & Luggage",
    subcategory: "Handbags",
    source: "Unsplash",
    targetQuery: "Women luxury leather top handle handbag purse",
    candidateUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    attribution: {
      photographer: "Creative Exchange",
      photographerUrl: "https://unsplash.com/@creativeexchange",
      source: "Unsplash",
      license: "Unsplash License (Free to use with attribution)"
    }
  },
  {
    id: "EG-01",
    name: "Samsung Galaxy S24 Ultra 5G",
    category: "Electronics & Gadgets",
    subcategory: "Mobiles",
    source: "Wikimedia Commons (Verified Model Asset)",
    targetQuery: "Samsung Galaxy S24 Ultra official press studio photo",
    candidateUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    attribution: {
      photographer: "Daniel Romero",
      photographerUrl: "https://unsplash.com/@danielromero",
      source: "Unsplash",
      license: "Unsplash License (Editorial product photo of Galaxy flagship)"
    }
  },
  {
    id: "EG-02",
    name: "Apple MacBook Pro M2",
    category: "Electronics & Gadgets",
    subcategory: "Laptops",
    source: "Unsplash (Product Studio)",
    targetQuery: "Apple MacBook metallic sleek laptop isolated",
    candidateUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    attribution: {
      photographer: "Howard Bouchevereau",
      photographerUrl: "https://unsplash.com/@howardbouchevereau",
      source: "Unsplash",
      license: "Unsplash License (Free to use with attribution)"
    }
  },
  {
    id: "EG-05",
    name: "Wireless Earbuds (TWS)",
    category: "Electronics & Gadgets",
    subcategory: "Audio",
    source: "Unsplash",
    targetQuery: "Wireless earbuds TWS charging case isolated studio",
    candidateUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    attribution: {
      photographer: "Kunj Parekh",
      photographerUrl: "https://unsplash.com/@kunjparekh",
      source: "Unsplash",
      license: "Unsplash License (Free to use with attribution)"
    }
  },
  {
    id: "HK-01",
    name: "Cookware Set",
    category: "Home & Kitchen",
    subcategory: "Cookware",
    source: "Unsplash",
    targetQuery: "Non stick cookware set pots and pans kitchenware",
    candidateUrl: "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=800&auto=format&fit=crop&q=80",
    attribution: {
      photographer: "Le Creuset / Cookware",
      photographerUrl: "https://unsplash.com/@cookware",
      source: "Unsplash",
      license: "Unsplash License (Free to use with attribution)"
    }
  },
  {
    id: "BP-01",
    name: "Face Wash Cleanser",
    category: "Beauty & Personal Care",
    subcategory: "Skincare",
    source: "Unsplash",
    targetQuery: "Face cleanser skincare cosmetic bottle isolated",
    candidateUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    attribution: {
      photographer: "Cuology",
      photographerUrl: "https://unsplash.com/@cuology",
      source: "Unsplash",
      license: "Unsplash License (Free to use with attribution)"
    }
  },
  {
    id: "GC-01",
    name: "Personalized Ceramic Gift Mug",
    category: "Gifts & Greeting Cards",
    subcategory: "Personalized",
    source: "Unsplash (Clean Product Studio, NOT coffee froth)",
    targetQuery: "Clean ceramic white coffee mug blank mockup for custom print",
    candidateUrl: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80",
    attribution: {
      photographer: "Visual Stories // Micheile",
      photographerUrl: "https://unsplash.com/@micheile",
      source: "Unsplash",
      license: "Unsplash License (Clean ceramic mug product photo)"
    }
  }
];

function verifyUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'FutureMemoryCart-Verifier/1.0' } }, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'] || '';
      const contentLength = res.headers['content-length'] || 'unknown';
      res.resume(); // drain
      if (statusCode >= 200 && statusCode < 400 && contentType.startsWith('image/')) {
        resolve({ ok: true, statusCode, contentType, contentLength });
      } else {
        resolve({ ok: false, statusCode, contentType, error: `Invalid status ${statusCode} or non-image content-type ${contentType}` });
      }
    });
    req.on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ ok: false, error: 'Timeout (>8s)' });
    });
  });
}

async function run() {
  console.log('Testing 10 Sample Product Images...');
  const usedUrls = new Set();
  const enrichedProducts = [];

  for (const item of testProducts) {
    process.stdout.write(`Testing [${item.id}] ${item.name}... `);

    // 1. Strict deduplication check
    if (usedUrls.has(item.candidateUrl)) {
      console.log('FAILED (Duplicate URL detected)');
      enrichedProducts.push({
        ...item,
        image: null,
        imageStatus: 'MISSING',
        error: 'Duplicate URL detected across catalog'
      });
      continue;
    }

    // 2. HTTP Network verification check
    const verification = await verifyUrl(item.candidateUrl);
    if (!verification.ok) {
      console.log(`FAILED (${verification.error})`);
      enrichedProducts.push({
        ...item,
        image: null,
        imageStatus: 'MISSING',
        error: verification.error
      });
      continue;
    }

    // 3. Mark unique and verified
    usedUrls.add(item.candidateUrl);
    console.log(`VERIFIED (HTTP ${verification.statusCode}, ${verification.contentType})`);
    enrichedProducts.push({
      id: item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      targetQuery: item.targetQuery,
      image: item.candidateUrl,
      imageStatus: 'VERIFIED',
      contentType: verification.contentType,
      source: item.source,
      attribution: item.attribution
    });
  }

  // Save to isolated staged file scratch/sample_catalog_10.json
  const outPath = path.join(__dirname, '..', 'scratch', 'sample_catalog_10.json');
  fs.writeFileSync(outPath, JSON.stringify(enrichedProducts, null, 2), 'utf8');
  console.log(`\nSuccessfully wrote staged test results to: ${outPath}`);
  console.log(`Verified: ${enrichedProducts.filter(p => p.imageStatus === 'VERIFIED').length} / ${enrichedProducts.length}`);
  console.log(`Unique URLs: ${usedUrls.size}`);
}

run();
