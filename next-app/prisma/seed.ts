import { PrismaClient, SizeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB Seed: Categories & Subcategories...');
  
  const catalog = [
    {
      slug: 'men',
      type: SizeType.CLOTHING,
      en: 'Men', ta: 'ஆண்கள்', hi: 'पुरुष',
      subcategories: [
        { slug: 'men-t-shirts', en: 'T-Shirts', ta: 'டி-ஷர்ட்கள்', hi: 'टी-शर्ट' },
        { slug: 'men-shirts', en: 'Shirts', ta: 'சட்டைகள்', hi: 'शर्ट' },
        { slug: 'men-polo', en: 'Polo', ta: 'போலோ', hi: 'पोलो' },
        { slug: 'men-oversized', en: 'Oversized', ta: 'பெரிய அளவிலான', hi: 'ओवरसाइज्ड' },
        { slug: 'men-hoodies', en: 'Hoodies', ta: 'ஹூடிகள்', hi: 'हुडीज़' },
        { slug: 'men-jeans', en: 'Jeans', ta: 'ஜீன்ஸ்', hi: 'जींस' },
        { slug: 'men-trousers', en: 'Trousers', ta: 'கால்சட்டைகள்', hi: 'पतलून' },
        { slug: 'men-shorts', en: 'Shorts', ta: 'அரைக்கால் சட்டைகள்', hi: 'शॉर्ट्स' },
        { slug: 'men-jackets', en: 'Jackets', ta: 'ஜாக்கெட்டுகள்', hi: 'जैकेट' },
        { slug: 'men-ethnic', en: 'Ethnic Wear', ta: 'பாரம்பரிய உடைகள்', hi: 'एथनिक वियर' },
      ]
    },
    {
      slug: 'women',
      type: SizeType.CLOTHING,
      en: 'Women', ta: 'பெண்கள்', hi: 'महिलाएं',
      subcategories: [
        { slug: 'women-churidar', en: 'Churidar', ta: 'சுடிதார்', hi: 'चूड़ीदार' },
        { slug: 'women-anarkali', en: 'Anarkali', ta: 'அனார்கலி', hi: 'अनारकली' },
        { slug: 'women-kurti', en: 'Kurti', ta: 'குர்தி', hi: 'कुर्ती' },
        { slug: 'women-kurta', en: 'Kurta', ta: 'குர்தா', hi: 'कुर्ता' },
        { slug: 'women-saree', en: 'Saree', ta: 'புடவை', hi: 'साड़ी' },
        { slug: 'women-salwar', en: 'Salwar', ta: 'சல்வார்', hi: 'सलवार' },
        { slug: 'women-palazzo', en: 'Palazzo', ta: 'பலாஸ்ஸோ', hi: 'पलाज़ो' },
        { slug: 'women-western-dress', en: 'Western Dress', ta: 'மேற்கத்திய ஆடை', hi: 'वेस्टर्न ड्रेस' },
        { slug: 'women-top', en: 'Top', ta: 'டாப்', hi: 'टॉप' },
        { slug: 'women-jeans', en: 'Jeans', ta: 'ஜீன்ஸ்', hi: 'जींस' },
        { slug: 'women-skirt', en: 'Skirt', ta: 'பாவாடை', hi: 'स्कर्ट' },
        { slug: 'women-gown', en: 'Gown', ta: 'கவுன்', hi: 'गाउन' },
      ]
    },
    {
      slug: 'kids',
      type: SizeType.KIDS,
      en: 'Kids', ta: 'குழந்தைகள்', hi: 'बच्चे',
      subcategories: [
        { slug: 'kids-boys-t-shirts', en: 'Boys T-Shirts', ta: 'சிறுவர் டி-ஷர்ட்கள்', hi: 'लड़कों की टी-शर्ट' },
        { slug: 'kids-boys-shirts', en: 'Boys Shirts', ta: 'சிறுவர் சட்டைகள்', hi: 'लड़कों की शर्ट' },
        { slug: 'kids-boys-jeans', en: 'Boys Jeans', ta: 'சிறுவர் ஜீன்ஸ்', hi: 'लड़कों की जींस' },
        { slug: 'kids-girls-dress', en: 'Girls Dress', ta: 'சிறுமியர் ஆடை', hi: 'लड़कियों की ड्रेस' },
        { slug: 'kids-girls-frock', en: 'Girls Frock', ta: 'சிறுமியர் ஃபிராக்', hi: 'लड़कियों की फ्रॉक' },
        { slug: 'kids-girls-kurti', en: 'Girls Kurti', ta: 'சிறுமியர் குர்தி', hi: 'लड़कियों की कुर्ती' },
        { slug: 'kids-ethnic', en: 'Kids Ethnic', ta: 'குழந்தைகள் பாரம்பரிய ஆடை', hi: 'बच्चों के एथनिक' },
      ]
    },
    {
      slug: 'footwear',
      type: SizeType.FOOTWEAR,
      en: 'Footwear', ta: 'காலணிகள்', hi: 'जूते',
      subcategories: [
        { slug: 'footwear-men-shoes', en: 'Men Shoes', ta: 'ஆண்கள் காலணிகள்', hi: 'पुरुषों के जूते' },
        { slug: 'footwear-women-shoes', en: 'Women Shoes', ta: 'பெண்கள் காலணிகள்', hi: 'महिलाओं के जूते' },
        { slug: 'footwear-sneakers', en: 'Sneakers', ta: 'ஸ்னீக்கர்கள்', hi: 'स्नीकर्स' },
        { slug: 'footwear-sandals', en: 'Sandals', ta: 'சந்தல்கள்', hi: 'सैंडल' },
        { slug: 'footwear-slippers', en: 'Slippers', ta: 'செருப்புகள்', hi: 'चप्पल' },
        { slug: 'footwear-heels', en: 'Heels', ta: 'ஹீல்ஸ்', hi: 'हील्स' },
        { slug: 'footwear-sports-shoes', en: 'Sports Shoes', ta: 'விளையாட்டு காலணிகள்', hi: 'स्पोर्ट्स शूज' },
      ]
    },
    {
      slug: 'accessories',
      type: SizeType.ACCESSORIES,
      en: 'Accessories', ta: 'பாகங்கள்', hi: 'सामान',
      subcategories: [
        { slug: 'acc-bags', en: 'Bags', ta: 'பைகள்', hi: 'बैग' },
        { slug: 'acc-wallets', en: 'Wallets', ta: 'பணப்பைகள்', hi: 'बटुए' },
        { slug: 'acc-belts', en: 'Belts', ta: 'பெல்ட்கள்', hi: 'बेल्ट' },
        { slug: 'acc-watches', en: 'Watches', ta: 'கடிகாரங்கள்', hi: 'घड़ियां' },
        { slug: 'acc-caps', en: 'Caps', ta: 'தொப்பிகள்', hi: 'टोपियां' },
        { slug: 'acc-sunglasses', en: 'Sunglasses', ta: 'கண்ணாடிகள்', hi: 'धूप का चश्मा' },
        { slug: 'acc-jewellery', en: 'Jewellery', ta: 'நகைகள்', hi: 'आभूषण' },
      ]
    }
  ];

  for (const cat of catalog) {
    // 1. Create Category
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        slug: cat.slug,
        sizeType: cat.type,
        nameEn: cat.en,
        nameTa: cat.ta,
        nameHi: cat.hi,
      }
    });

    // 2. Create Subcategories
    for (const sub of cat.subcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: {},
        create: {
          slug: sub.slug,
          categoryId: createdCat.id,
          nameEn: sub.en,
          nameTa: sub.ta,
          nameHi: sub.hi,
        }
      });
    }
  }
  
  console.log('Successfully seeded all Categories and Subcategories with EN/TA/HI translations.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
