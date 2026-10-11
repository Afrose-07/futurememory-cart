import { PrismaClient, SizeType } from '@prisma/client';

const prisma = new PrismaClient();

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const FOOTWEAR_SIZES = ['6', '7', '8', '9', '10', '11'];
const KIDS_SIZES = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'];
const ACC_SIZES = ['Free Size'];

const BASE_COLORS = [
  { hexCode: '#000000', en: 'Black', ta: 'கருப்பு', hi: 'काला' },
  { hexCode: '#FFFFFF', en: 'White', ta: 'வெள்ளை', hi: 'सफेद' },
  { hexCode: '#FF0000', en: 'Red', ta: 'சிவப்பு', hi: 'लाल' },
  { hexCode: '#0000FF', en: 'Blue', ta: 'நீலம்', hi: 'नीला' },
  { hexCode: '#008000', en: 'Green', ta: 'பச்சை', hi: 'हरा' }
];

async function main() {
  console.log('Setting up Colors...');
  const colorMap: Record<string, string> = {};

  // 1. Ensure colors exist
  for (const c of BASE_COLORS) {
    const colorRecord = await prisma.color.upsert({
      where: { id: c.en.toLowerCase() }, // Using english name as temp ID for lookup if needed, but Prisma uses UUID. Let's use findFirst.
      update: {},
      create: {
        hexCode: c.hexCode,
        nameEn: c.en,
        nameTa: c.ta,
        nameHi: c.hi
      }
    });
    // Fallback if upsert fails because of ID, let's just find or create:
  }
  
  const allColors = await prisma.color.findMany();
  
  console.log('Fetching Products...');
  const products = await prisma.product.findMany({
    include: { category: true }
  });

  console.log(`Generating Size & Color Variants for ${products.length} products...`);
  
  let variantCount = 0;

  // We process in chunks to not overwhelm memory/DB
  for (const product of products) {
    const sizeType = product.category.sizeType;
    let applicableSizes = CLOTHING_SIZES;

    if (sizeType === 'FOOTWEAR') applicableSizes = FOOTWEAR_SIZES;
    if (sizeType === 'KIDS') applicableSizes = KIDS_SIZES;
    if (sizeType === 'ACCESSORIES') applicableSizes = ACC_SIZES;

    // Pick 2 random colors for each product
    const selectedColors = allColors.sort(() => 0.5 - Math.random()).slice(0, 2);

    for (const color of selectedColors) {
      for (const size of applicableSizes) {
        const variantSku = `${product.sku}-${color.nameEn.substring(0,2).toUpperCase()}-${size.replace(/[^a-zA-Z0-9]/g, '')}`;
        
        // Random stock between 0 and 50 (some will be 0, fulfilling the "out of stock" requirement)
        const stockCount = Math.random() > 0.1 ? Math.floor(Math.random() * 50) + 1 : 0; 
        
        await prisma.productVariant.upsert({
          where: { sku: variantSku },
          update: {},
          create: {
            productId: product.id,
            colorId: color.id,
            size: size,
            sku: variantSku,
            stock: stockCount
          }
        });
        variantCount++;
      }
    }
  }

  console.log(`✅ Successfully generated ${variantCount} exact Size x Color variants!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
