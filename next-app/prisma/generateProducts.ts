import { PrismaClient, SizeType } from '@prisma/client';

const prisma = new PrismaClient();

const styles = ['Casual', 'Formal', 'Designer', 'Vintage', 'Modern', 'Classic', 'Urban', 'Sporty', 'Premium', 'Essential'];
const fits = ['Slim Fit', 'Regular Fit', 'Oversized', 'Relaxed Fit', 'Tailored', 'Loose Fit', 'Athletic Fit', 'Straight Cut', 'Skinny Fit', 'Comfort Fit'];
const patterns = ['Solid', 'Striped', 'Checked', 'Printed', 'Floral', 'Geometric', 'Polka Dot', 'Abstract', 'Textured', 'Colorblock'];
const fabrics = ['Cotton', 'Linen', 'Silk', 'Denim', 'Wool', 'Polyester', 'Velvet', 'Chiffon', 'Georgette', 'Leather'];

function generateUniqueProducts(baseName: string, subcategoryId: string, categoryId: string, count: number) {
  const products = [];
  let index = 0;

  for (const style of styles) {
    for (const fit of fits) {
      for (const pattern of patterns) {
        for (const fabric of fabrics) {
          if (products.length >= count) return products;
          
          const uniqueNameEn = `${style} ${pattern} ${fabric} ${baseName} - ${fit}`;
          const uniqueNameTa = `${style} ${pattern} ${fabric} ${baseName} - ${fit} (Tamil)`;
          const uniqueNameHi = `${style} ${pattern} ${fabric} ${baseName} - ${fit} (Hindi)`;
          
          const sku = `SKU-${categoryId.substring(0,3).toUpperCase()}-${baseName.substring(0,3).toUpperCase()}-${index.toString().padStart(4, '0')}`;
          
          products.push({
            slug: sku.toLowerCase(),
            sku,
            categoryId,
            subcategoryId,
            price: Math.floor(Math.random() * 2000) + 500,
            mrp: Math.floor(Math.random() * 3000) + 2500,
            nameEn: uniqueNameEn,
            nameTa: uniqueNameTa,
            nameHi: uniqueNameHi,
            descEn: `A beautiful ${uniqueNameEn} perfect for any occasion.`,
            descTa: `எந்தவொரு நிகழ்விற்கும் ஏற்ற அழகான ${uniqueNameEn}.`,
            descHi: `किसी भी अवसर के लिए एकदम सही एक सुंदर ${uniqueNameEn}.`,
            fabricEn: fabric,
            fabricTa: fabric,
            fabricHi: fabric,
            rating: (Math.random() * 2 + 3).toFixed(1),
            reviewsCount: Math.floor(Math.random() * 500),
          });
          index++;
        }
      }
    }
  }
  return products;
}

async function main() {
  console.log('Generating 100+ UNIQUE products per Subcategory...');

  const categories = await prisma.category.findMany({ include: { subcategories: true } });

  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      console.log(`Generating products for ${sub.nameEn}...`);
      
      // Generate exactly 105 unique products per subcategory (105 > 100)
      const newProducts = generateUniqueProducts(sub.nameEn, sub.id, cat.id, 105);
      
      for (const productData of newProducts) {
        await prisma.product.upsert({
          where: { sku: productData.sku },
          update: {},
          create: {
            ...productData,
            rating: parseFloat(productData.rating as string),
          }
        });
      }
    }
  }

  console.log('✅ Successfully seeded 100+ UNIQUE products for every subcategory!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
