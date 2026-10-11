const fs = require('fs');
const path = require('path');

const occasionsMetadata = [
  {
    "id": "birthday",
    "name": "Birthdays",
    "description": "Handpicked celebratory gifts for boys, girls, men & women of all ages",
    "image": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80"
  },
  {
    "id": "wedding",
    "name": "Weddings",
    "description": "Royal bride & groom ensembles, couple sets & luxury blessings",
    "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80"
  },
  {
    "id": "anniversary",
    "name": "Anniversaries",
    "description": "Heartwarming milestone romantic tokens for him and her",
    "image": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80"
  },
  {
    "id": "festival",
    "name": "Festivals",
    "description": "Diwali, Pongal, Eid & festive sweets, ethnic fashion & auspicious decor",
    "image": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80"
  },
  {
    "id": "housewarming",
    "name": "Housewarming",
    "description": "Artisan home accents, smart kitchen appliances & cozy living essentials",
    "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80"
  },
  {
    "id": "casual",
    "name": "College & Graduation",
    "description": "Smart everyday fashion, backpacks, campus tech & milestone gifts",
    "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80"
  },
  {
    "id": "travel",
    "name": "Travel & Adventure",
    "description": "Durable luggage, travel organizers, comfort neck pillows & gear",
    "image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80"
  },
  {
    "id": "work",
    "name": "Work & Executive",
    "description": "Sharp professional attire, desktop tech, pens & leather organizers",
    "image": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&q=80"
  }
];

const colorHexMap = {
  'Black': '#111827',
  'White': '#ffffff',
  'Navy Blue': '#1e3a8a',
  'Blue': '#2563eb',
  'Olive Green': '#3f6212',
  'Green': '#15803d',
  'Red': '#dc2626',
  'Maroon': '#881337',
  'Pink': '#ec4899',
  'Brown': '#78350f',
  'Grey': '#64748b',
  'Gold': '#d97706',
  'Silver': '#94a3b8',
  'Rose Gold': '#fb7185',
  'Beige': '#d6d3d1'
};

function createItem(data) {
  const defaultColor = data.colors && data.colors.length > 0 ? data.colors[0] : 'Standard';
  const sizes = data.sizes || ['Standard'];
  const stockBySize = {};
  sizes.forEach(sz => {
    stockBySize[sz] = Math.max(5, Math.floor((data.stock || 25) / sizes.length) + 2);
  });

  return {
    id: data.id,
    modelId: `MDL-${data.id.replace(/-[0-9]+$/, '')}-${data.id.split('-')[1]}`,
    name: data.name,
    gender: data.gender || 'Unisex',
    category: data.category,
    subcategory: data.subcategory,
    brand: data.brand || 'FutureMemory',
    description: data.description,
    price: data.price,
    originalPrice: data.originalPrice || Math.round(data.price * 1.4),
    discount: data.discount || Math.round((1 - data.price / (data.originalPrice || data.price * 1.4)) * 100),
    images: {
      front: data.frontImg,
      back: data.frontImg,
      side: data.frontImg,
      design: data.frontImg
    },
    colorImages: data.colorImages || {},
    colors: data.colors || ['Standard'],
    sizes,
    rating: data.rating || 4.7,
    reviewCount: data.reviewCount || 120,
    stock: data.stock || 25,
    occasion: data.occasion || [],
    tags: data.tags || [],
    color: {
      name: defaultColor,
      value: colorHexMap[defaultColor] || '#475569'
    },
    stockBySize,
    material: data.material || 'Premium Quality Material',
    fit: sizes.length > 1 ? 'Regular Comfortable Fit' : 'Standard Fit',
    care: 'Follow standard care and wash instructions'
  };
}

// ---------------- BIRTHDAY ITEMS (28 ITEMS) ----------------
const birthdayList = [
  // Under 500
  {
    id: 'BDY-01', name: 'Personalized Happy Birthday Ceramic Coffee Mug (350ml)',
    gender: 'Unisex', category: 'Celebration & Gifts', subcategory: 'Mugs', brand: 'MemoryGifts',
    description: 'High gloss ceramic mug with premium birthday print. Microwave & dishwasher safe.',
    price: 249, originalPrice: 499, discount: 50,
    frontImg: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    colorImages: {
      'White': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
      'Black': 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&q=80'
    },
    colors: ['White', 'Black'], sizes: ['Standard (350ml)'],
    occasion: ['birthday'], tags: ['birthday', 'mug', 'gift', 'budget', 'white', 'black']
  },
  {
    id: 'BDY-02', name: 'Artisan Birthday Greeting Box with LED Fairy String Lights',
    gender: 'Unisex', category: 'Celebration & Gifts', subcategory: 'Gift Sets', brand: 'SparkJoy',
    description: 'Festive gift box packed with warm LED fairy lights, handmade note card, and party confetti.',
    price: 299, originalPrice: 599, discount: 50,
    frontImg: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&q=80',
    colors: ['Gold', 'Pink'], occasion: ['birthday'], tags: ['birthday', 'gift box', 'lights']
  },
  {
    id: 'BDY-03', name: 'Cute Cuddly Velvet Plush Teddy Bear (30cm)',
    gender: 'Kids', category: 'Celebration & Gifts', subcategory: 'Plush Toys', brand: 'HuggyPaws',
    description: 'Ultra-soft hypoallergenic plush teddy bear with ribbon bow. Perfect heartwarming birthday gift.',
    price: 399, originalPrice: 799, discount: 50,
    frontImg: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&q=80',
    colorImages: {
      'Brown': 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&q=80',
      'Pink': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80'
    },
    colors: ['Brown', 'Pink'], sizes: ['30cm', '45cm'],
    occasion: ['birthday'], tags: ['birthday', 'teddy', 'toy', 'kids']
  },
  {
    id: 'BDY-04', name: 'Handcrafted Wooden Photo Frame with Warm LED Backlight',
    gender: 'Unisex', category: 'Home & Living', subcategory: 'Photo Frames', brand: 'ArtisanCraft',
    description: 'Natural pine wood frame holding 4x6 photos with ambient warm LED light glow.',
    price: 449, originalPrice: 899, discount: 50,
    frontImg: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
    colors: ['Brown', 'Beige'], sizes: ['4x6 inch'],
    occasion: ['birthday'], tags: ['birthday', 'photo frame', 'memory']
  },
  {
    id: 'BDY-05', name: 'Premium Belgian Chocolate Truffles Gift Box (12 pcs)',
    gender: 'Unisex', category: 'Gourmet & Sweets', subcategory: 'Chocolates', brand: 'ChocoArtisan',
    description: 'Decadent handcrafted dark and milk chocolate truffles coated in crushed hazelnuts and cocoa nibs.',
    price: 499, originalPrice: 899, discount: 44,
    frontImg: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80',
    occasion: ['birthday'], tags: ['birthday', 'chocolate', 'gourmet']
  },
  {
    id: 'BDY-06', name: 'Unisex Stainless Steel Cable Chain Bracelet with Cross Charm',
    gender: 'Unisex', category: 'Jewellery & Accessories', subcategory: 'Bracelets', brand: 'SteelCraft',
    description: 'Anti-tarnish waterproof stainless steel link chain with magnetic lock clasp.',
    price: 349, originalPrice: 699, discount: 50,
    frontImg: 'https://images.unsplash.com/photo-1611591475155-4284ec289e0d?w=600&q=80',
    colors: ['Silver', 'Black'], sizes: ['Standard'],
    occasion: ['birthday'], tags: ['bracelet', 'birthday', 'silver', 'steel']
  },

  // 500 - 1000
  {
    id: 'BDY-07', name: 'Men\'s Pure Cotton Solid Crew Neck Casual T-Shirt',
    gender: 'Men', category: 'Apparel & Fashion', subcategory: 'T-Shirts', brand: 'UrbanThreads',
    description: '100% bio-washed combed cotton t-shirt with ribbed neck and tailored fit. Breathable everyday luxury.',
    price: 599, originalPrice: 1199, discount: 50,
    frontImg: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
    colorImages: {
      'Black': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
      'White': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80',
      'Navy Blue': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
      'Olive Green': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80'
    },
    colors: ['Black', 'White', 'Navy Blue', 'Olive Green'], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    occasion: ['birthday', 'casual'], tags: ['tshirt', 'men', 'cotton', 'birthday', 'black', 'white']
  },
  {
    id: 'BDY-08', name: 'Women\'s Minimalist Rose Gold Butterfly Pendant Necklace',
    gender: 'Women', category: 'Jewellery & Accessories', subcategory: 'Necklaces', brand: 'GivaStyle',
    description: 'Dainty 925 sterling silver chain with AAA cubic zirconia embellished rose gold butterfly charm.',
    price: 699, originalPrice: 1499, discount: 53,
    frontImg: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    colorImages: {
      'Rose Gold': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
      'Silver': 'https://images.unsplash.com/photo-1611591475155-4284ec289e0d?w=600&q=80'
    },
    colors: ['Rose Gold', 'Silver'], sizes: ['Standard (18 inch)'],
    occasion: ['birthday'], tags: ['jewellery', 'necklace', 'women', 'birthday']
  },
  {
    id: 'BDY-09', name: 'Portable Bluetooth 5.3 Mini Speaker with Bass Radiator',
    gender: 'Unisex', category: 'Tech & Electronics', subcategory: 'Audio', brand: 'SoundPulse',
    description: 'Pocket-sized powerhouse with 360-degree sound, 10hr battery life, and IPX5 splash protection.',
    price: 799, originalPrice: 1999, discount: 60,
    frontImg: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80',
    colorImages: {
      'Black': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80',
      'Blue': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80'
    },
    colors: ['Black', 'Blue'], sizes: ['Standard'],
    occasion: ['birthday', 'casual'], tags: ['speaker', 'bluetooth', 'audio', 'birthday']
  },
  {
    id: 'BDY-10', name: 'Vintage Genuine Leather RFID-Protected Slim Bi-fold Wallet',
    gender: 'Men', category: 'Bags & Luggage', subcategory: 'Wallets', brand: 'WildCraftsman',
    description: 'Top-grain distressed hunter leather wallet with 8 card slots and dual currency pockets.',
    price: 899, originalPrice: 1799, discount: 50,
    frontImg: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
    colorImages: {
      'Brown': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
      'Black': 'https://images.unsplash.com/photo-1606503829059-8656910609b5?w=600&q=80'
    },
    colors: ['Brown', 'Black'], sizes: ['Standard'],
    occasion: ['birthday', 'work'], tags: ['wallet', 'leather', 'men', 'birthday']
  },
  {
    id: 'BDY-11', name: 'Organic Lavender & Vanilla Aromatherapy Scented Candle in Amber Glass',
    gender: 'Unisex', category: 'Home & Living', subcategory: 'Home Fragrance', brand: 'AromaBotanics',
    description: '100% natural soy wax candle hand-poured with pure therapeutic grade essential oils. 50-hour clean burn.',
    price: 949, originalPrice: 1599, discount: 41,
    frontImg: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80',
    occasion: ['birthday'], tags: ['candle', 'aromatherapy', 'birthday']
  },

  // 1000 - 2500
  {
    id: 'BDY-12', name: 'Men\'s Classic Regular Fit Button-Down Oxford Cotton Shirt',
    gender: 'Men', category: 'Apparel & Fashion', subcategory: 'Shirts', brand: 'TheOxfordCo',
    description: 'Timeless crisp Oxford weave cotton shirt with curved hem, pearl buttons, and button-down collar.',
    price: 1299, originalPrice: 2499, discount: 48,
    frontImg: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
    colorImages: {
      'Black': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
      'White': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
      'Navy Blue': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
      'Olive Green': 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80'
    },
    colors: ['Black', 'White', 'Navy Blue', 'Olive Green'], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    occasion: ['birthday', 'casual', 'work'], tags: ['shirt', 'men', 'oxford', 'birthday', 'black', 'white', 'blue']
  },
  {
    id: 'BDY-13', name: 'Women\'s French Floral Print Chiffon A-Line Midi Dress',
    gender: 'Women', category: 'Apparel & Fashion', subcategory: 'Dresses', brand: 'FloralMist',
    description: 'Breezy lightweight chiffon dress with sweetheart neckline, smocked waist, and flutter sleeves.',
    price: 1499, originalPrice: 2999, discount: 50,
    frontImg: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80',
    colorImages: {
      'Pink': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80',
      'White': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80',
      'Red': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80'
    },
    colors: ['Pink', 'White', 'Red'], sizes: ['XS', 'S', 'M', 'L', 'XL'],
    occasion: ['birthday', 'casual'], tags: ['dress', 'women', 'floral', 'birthday']
  },
  {
    id: 'BDY-14', name: 'True Wireless Noise-Cancelling Earbuds with Spatial Audio',
    gender: 'Unisex', category: 'Tech & Electronics', subcategory: 'Audio', brand: 'AirSonic',
    description: 'Bluetooth 5.3 earbuds featuring active environmental noise cancellation and 32hr playback.',
    price: 1799, originalPrice: 3999, discount: 55,
    frontImg: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
    colorImages: {
      'White': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
      'Black': 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80'
    },
    colors: ['White', 'Black'], sizes: ['Standard'],
    occasion: ['birthday', 'casual'], tags: ['earbuds', 'wireless', 'tech', 'birthday']
  },
  {
    id: 'BDY-15', name: 'Women\'s Faux Saffiano Leather Structured Crossbody Handbag',
    gender: 'Women', category: 'Bags & Luggage', subcategory: 'Handbags', brand: 'LavieParis',
    description: 'Chic structured silhouette with gold tone hardware, detachable shoulder strap, and multiple pockets.',
    price: 1999, originalPrice: 3799, discount: 47,
    frontImg: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
    colorImages: {
      'Brown': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
      'Black': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'
    },
    colors: ['Brown', 'Black'], sizes: ['Medium'],
    occasion: ['birthday'], tags: ['bag', 'handbag', 'women', 'birthday']
  },
  {
    id: 'BDY-16', name: 'Smart AMOLED Fitness Tracker Watch with Heart Rate & SpO2',
    gender: 'Unisex', category: 'Timepieces', subcategory: 'Smartwatches', brand: 'FitPulse',
    description: '1.43-inch AMOLED always-on display, 110+ sports modes, Bluetooth calling, and 10-day battery life.',
    price: 2299, originalPrice: 4999, discount: 54,
    frontImg: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
    colorImages: {
      'Black': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
      'Silver': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80'
    },
    colors: ['Black', 'Silver'], sizes: ['Standard'],
    occasion: ['birthday', 'casual'], tags: ['smartwatch', 'fitness', 'tech', 'birthday']
  },

  // 2500 - 5000
  {
    id: 'BDY-17', name: 'Titan Neo Splash Water-Resistant Blue Sunray Dial Analog Watch',
    gender: 'Men', category: 'Timepieces', subcategory: 'Watches', brand: 'Titan',
    description: 'Sleek stainless steel mesh strap with deep oceanic blue sunray dial and mineral glass protection.',
    price: 2999, originalPrice: 4495, discount: 33,
    frontImg: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80',
    colorImages: {
      'Blue': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80',
      'Black': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80'
    },
    colors: ['Blue', 'Black'], sizes: ['Standard'],
    occasion: ['birthday', 'work'], tags: ['watch', 'titan', 'men', 'birthday']
  },
  {
    id: 'BDY-18', name: 'Fujifilm Instax Mini Instant Camera with Birthday Film Pack',
    gender: 'Unisex', category: 'Tech & Electronics', subcategory: 'Cameras', brand: 'Fujifilm',
    description: 'Instant credit-card size photo printing camera with selfie mirror, auto exposure, and flash.',
    price: 3499, originalPrice: 5999, discount: 42,
    frontImg: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',
    colorImages: {
      'Pink': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',
      'Blue': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80'
    },
    colors: ['Pink', 'Blue'], sizes: ['Standard'],
    occasion: ['birthday'], tags: ['camera', 'instax', 'photo', 'birthday']
  },
  {
    id: 'BDY-19', name: 'Luxury Eau De Parfum Gift Set for Him & Her (2 x 100ml)',
    gender: 'Unisex', category: 'Beauty & Fragrance', subcategory: 'Perfumes', brand: 'MaisonParfums',
    description: 'Exquisite French fragrance duo featuring woody amber noir and blooming velvet jasmine.',
    price: 3999, originalPrice: 6500, discount: 38,
    frontImg: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80',
    occasion: ['birthday', 'anniversary'], tags: ['perfume', 'luxury', 'birthday']
  },
  {
    id: 'BDY-20', name: 'Keychron Wireless Mechanical Keyboard with RGB Backlighting',
    gender: 'Unisex', category: 'Tech & Electronics', subcategory: 'Computer Gear', brand: 'Keychron',
    description: 'Compact 75% hot-swappable mechanical keyboard with Mac & Windows compatibility.',
    price: 4599, originalPrice: 6499, discount: 29,
    frontImg: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
    colors: ['Grey', 'Black'], sizes: ['Standard'],
    occasion: ['birthday', 'casual', 'work'], tags: ['keyboard', 'tech', 'gaming', 'birthday']
  },

  // Above 5000
  {
    id: 'BDY-21', name: 'Fossil Minimalist Chronograph White Dial Watch',
    gender: 'Men', category: 'Timepieces', subcategory: 'Watches', brand: 'Fossil',
    description: 'Clean aesthetic chronograph with dual sub-dials, brushed stainless steel case, and saddle brown strap.',
    price: 5995, originalPrice: 8495, discount: 29,
    frontImg: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    colorImages: {
      'Brown': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
      'Black': 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&q=80'
    },
    colors: ['Brown', 'Black'], sizes: ['Standard'],
    occasion: ['birthday', 'work'], tags: ['watch', 'fossil', 'chronograph', 'birthday']
  },
  {
    id: 'BDY-22', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    gender: 'Unisex', category: 'Tech & Electronics', subcategory: 'Audio', brand: 'Sony',
    description: 'Industry-leading active noise cancellation with 8 microphones and 30-hour battery life.',
    price: 8490, originalPrice: 12990, discount: 35,
    frontImg: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    colorImages: {
      'Black': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      'Silver': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80'
    },
    colors: ['Black', 'Silver'], sizes: ['Standard'],
    occasion: ['birthday', 'casual'], tags: ['headphones', 'sony', 'audio', 'birthday']
  },
  {
    id: 'BDY-23', name: 'Apple AirPods Pro Style Active Noise Cancelling TWS Earbuds',
    gender: 'Unisex', category: 'Tech & Electronics', subcategory: 'Audio', brand: 'Apple',
    description: 'Adaptive Transparency, Personalized Spatial Audio with dynamic head tracking, and MagSafe case.',
    price: 5499, originalPrice: 8999, discount: 39,
    frontImg: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80',
    colors: ['White'], sizes: ['Standard'],
    occasion: ['birthday'], tags: ['apple', 'airpods', 'tws', 'birthday']
  },
  {
    id: 'BDY-24', name: 'Michael Kors Rose Gold Crystal Embellished Ladies Watch',
    gender: 'Women', category: 'Timepieces', subcategory: 'Watches', brand: 'Michael Kors',
    description: 'Glamorous women\'s wrist timepiece coated in lustrous rose gold with crystal pavé bezel accents.',
    price: 7499, originalPrice: 11999, discount: 37,
    frontImg: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    colorImages: {
      'Rose Gold': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
      'Silver': 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&q=80'
    },
    colors: ['Rose Gold', 'Silver'], sizes: ['Standard'],
    occasion: ['birthday', 'anniversary'], tags: ['watch', 'michael kors', 'rose gold', 'birthday']
  },
  {
    id: 'BDY-25', name: 'Seiko 5 Sports Automatic Tactical Field Watch',
    gender: 'Men', category: 'Timepieces', subcategory: 'Watches', brand: 'Seiko',
    description: 'Japanese automatic 4R36 caliber movement with day-date display and ballistic nylon strap.',
    price: 6890, originalPrice: 9500, discount: 27,
    frontImg: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    colors: ['Black'], sizes: ['Standard'],
    occasion: ['birthday'], tags: ['seiko', 'automatic', 'watch', 'birthday']
  },
  {
    id: 'BDY-26', name: 'Tommy Hilfiger Men\'s Reversible Lambskin Leather Jacket',
    gender: 'Men', category: 'Apparel & Fashion', subcategory: 'Jackets', brand: 'Tommy Hilfiger',
    description: 'Premium genuine lambskin leather bomber jacket with satin lining and zippered utility pockets.',
    price: 8999, originalPrice: 14999, discount: 40,
    frontImg: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    colorImages: {
      'Black': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
      'Brown': 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&q=80'
    },
    colors: ['Black', 'Brown'], sizes: ['M', 'L', 'XL', 'XXL'],
    occasion: ['birthday'], tags: ['jacket', 'leather', 'men', 'birthday']
  },
  {
    id: 'BDY-27', name: 'Kindle Paperwhite 16GB Waterproof 6.8-inch Glare-Free E-Reader',
    gender: 'Unisex', category: 'Tech & Electronics', subcategory: 'Tablets', brand: 'Amazon Kindle',
    description: 'Warm adjustable light, 10-week battery life, and 20% faster page turns for avid book lovers.',
    price: 11999, originalPrice: 14999, discount: 20,
    frontImg: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
    colors: ['Black'], sizes: ['16GB'],
    occasion: ['birthday'], tags: ['kindle', 'ereader', 'tech', 'birthday']
  },
  {
    id: 'BDY-28', name: 'Dyson Supersonic Hair Dryer Intelligent Heat Control Gift Edition',
    gender: 'Women', category: 'Beauty & Fragrance', subcategory: 'Hair Care', brand: 'Dyson',
    description: 'Engineered for fast drying with zero heat damage. Includes 5 magnetic styling attachments.',
    price: 29900, originalPrice: 34900, discount: 14,
    frontImg: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    colors: ['Pink', 'Silver'], sizes: ['Standard'],
    occasion: ['birthday'], tags: ['dyson', 'hair dryer', 'luxury', 'birthday']
  }
];

// Combine all and build
console.log('Writing catalog...');
const allProductsCatalog = [
  ...birthdayList.map(createItem),
  ...weddingProducts.map(p => p),
  ...anniversaryProducts.map(p => p),
  ...festivalProducts.map(p => p),
  ...housewarmingProducts.map(p => p),
  ...casualProducts.map(p => p),
  ...travelProducts.map(p => p),
  ...workProducts.map(p => p)
];

console.log('Total catalog count:', allProductsCatalog.length);
