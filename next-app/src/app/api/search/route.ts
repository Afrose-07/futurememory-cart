import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Multi-lingual & Transliteration Synonym Map
// This maps user search terms (in any language/script) to the canonical database keyword/slug.
const SYNONYM_MAP: Record<string, string> = {
  // T-Shirts
  't-shirt': 't-shirt',
  'tshirt': 't-shirt',
  't shirt': 't-shirt',
  'டி-ஷர்ட்': 't-shirt',
  'टी-शर्ट': 't-shirt',
  'ಟಿ-ಶರ್ಟ್': 't-shirt',
  'టీ-షర్ట్': 't-shirt',
  
  // Shirts
  'shirt': 'shirt',
  'sattai': 'shirt',
  'சட்டை': 'shirt',
  'शर्ट': 'shirt',

  // Churidar
  'churidar': 'churidar',
  'chudithar': 'churidar',
  'சுடிதார்': 'churidar',
  'चूड़ीदार': 'churidar',

  // Shoes / Footwear
  'shoes': 'shoe',
  'shoe': 'shoe',
  'seruppu': 'shoe',
  'செருப்பு': 'shoe',
  'जूते': 'shoe',
  'sneakers': 'sneaker',
  
  // Kurti / Kurta
  'kurta': 'kurta',
  'kurti': 'kurti',
  'குர்தா': 'kurta',
  'குர்தி': 'kurti',
  'कुर्ता': 'kurta',
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase().trim();

    if (!query) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    // 1. Synonym Resolution (Transliteration & Multi-Language)
    // If the user types "sattai", it gets resolved to "shirt"
    const resolvedQuery = SYNONYM_MAP[query] || query;

    // 2. Database Search
    // We search across all language columns natively in Prisma
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { nameEn: { contains: resolvedQuery, mode: 'insensitive' } },
          { nameTa: { contains: query, mode: 'insensitive' } }, // Original query (சட்டை)
          { nameHi: { contains: query, mode: 'insensitive' } }, // Original query (जूते)
          { descEn: { contains: resolvedQuery, mode: 'insensitive' } },
          { subcategory: { slug: { contains: resolvedQuery, mode: 'insensitive' } } },
        ]
      },
      take: 24, // Infinite scroll limit
      include: {
        images: { take: 1 }, // Only get the first image for the search listing
        variants: {
          select: { size: true, colorId: true, stock: true }
        }
      }
    });

    return NextResponse.json({ 
      originalQuery: query, 
      resolvedQuery, 
      count: products.length,
      products 
    }, { status: 200 });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
