const path = require('path');
const fs = require('fs');

async function run() {
  const { generateProductImage } = await import('../server/services/huggingFaceService.js');
  
  const lehenga = {
    id: 'WF-05',
    name: 'Designer Crimson Maroon Bridal Flared Lehenga Choli',
    category: "Women's Fashion",
    subcategory: 'Lehenga Choli',
    colors: ['Maroon', 'Red'],
    description: 'Designer crimson maroon bridal flared lehenga with heavy zardozi embroidery and blouse piece'
  };

  console.log('Generating realistic front image...');
  const front = await generateProductImage({ product: lehenga, angle: 'front' });
  console.log('Generating realistic back image...');
  const back = await generateProductImage({ product: lehenga, angle: 'back' });
  console.log('Generating realistic side image...');
  const side = await generateProductImage({ product: lehenga, angle: 'side' });
  console.log('Generating realistic detail image...');
  const detail = await generateProductImage({ product: lehenga, angle: 'detail' });

  console.log('RESULTS:', {
    front: front.imageUrl,
    back: back.imageUrl,
    side: side.imageUrl,
    detail: detail.imageUrl
  });

  // Update canonicalCatalog.js with these new realistic images for WF-05
  const catalogPath = path.join(__dirname, '../src/data/canonicalCatalog.js');
  let content = fs.readFileSync(catalogPath, 'utf8');

  // Replace WF-05 images
  const targetPattern = /"id":\s*"WF-05"[\s\S]*?"image":\s*"[^"]*"[\s\S]*?"images":\s*\{[\s\S]*?\}/;
  const match = content.match(targetPattern);
  if (match) {
    const updated = match[0].replace(
      /"image":\s*"[^"]*"/,
      `"image": "${front.imageUrl}"`
    ).replace(
      /"images":\s*\{[\s\S]*?\}/,
      `"images": {\n      "front": "${front.imageUrl}",\n      "back": "${back.imageUrl}",\n      "side": "${side.imageUrl}",\n      "detail": "${detail.imageUrl}"\n    }`
    );
    content = content.replace(match[0], updated);
    fs.writeFileSync(catalogPath, content, 'utf8');
    console.log('Successfully updated canonicalCatalog.js for WF-05!');
  } else {
    console.log('Could not match WF-05 block in catalog');
  }
}

run().catch(console.error);
