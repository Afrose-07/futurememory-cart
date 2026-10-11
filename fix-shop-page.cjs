const fs = require('fs');
let content = fs.readFileSync('src/pages/ShopPage.jsx', 'utf8');

// fix the state declarations
content = content.replace(
  "const [selectedSubcategory, setSelectedSubcategory] = useState(initialCategory);",
  "const [selectedCategory, setSelectedCategory] = useState(initialCategory);\n  const [selectedSubcategory, setSelectedSubcategory] = useState('All');"
);

// fix available colors
content = content.replace(
  "const availableColors = ['All', 'Black', 'White', 'Red', 'Blue', 'Green', 'Gold', 'Silver', 'Brown', 'Multicolor'];",
  "const availableColors = ['All', 'Black', 'White', 'Red', 'Blue', 'Navy Blue', 'Olive Green', 'Maroon', 'Green', 'Gold', 'Silver', 'Brown', 'Multicolor'];"
);

// fix filteredProducts and groupedProducts
const oldFilteredProductsRegex = /const filteredProducts = useMemo\(\(\) => \{[\s\S]*?const handleResetFilters = \(\) => \{/m;

const newFilteredProducts = `const filteredProducts = useMemo(() => {
    let parsedQuery = searchQuery.trim().toLowerCase();
    
    return allProductsCatalog
      .filter(p => {
        if (priceTier === 'low' && p.currentPrice > 1000) return false;
        if (priceTier === 'medium' && (p.currentPrice <= 1000 || p.currentPrice > 5000)) return false;
        if (priceTier === 'high' && p.currentPrice <= 5000) return false;
        if (p.currentPrice > maxPrice) return false;
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (selectedSubcategory !== 'All' && p.subcategory !== selectedSubcategory) return false;
        if (selectedGender !== 'All' && p.gender !== selectedGender) return false;
        if (selectedColor !== 'All' && p.color?.name !== selectedColor) return false;

        if (parsedQuery) {
          const searchWords = parsedQuery.split(/\\s+/);
          const name = (p.name || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          const sub = (p.subcategory || '').toLowerCase();
          const gender = (p.gender || '').toLowerCase();
          const color = (p.color?.name || '').toLowerCase();
          const tags = (p.tags || []).join(' ').toLowerCase();
          const productType = (p.productType || '').toLowerCase();

          const isMatch = searchWords.every(word => {
            return name.includes(word) ||
                   cat.includes(word) ||
                   sub.includes(word) ||
                   gender.includes(word) ||
                   color.includes(word) ||
                   tags.includes(word) ||
                   productType.includes(word);
          });
          
          if (!isMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (parsedQuery && sortBy === 'featured') {
          const scoreMatch = (p) => {
            let score = 0;
            const words = parsedQuery.split(/\\s+/);
            words.forEach(word => {
              const w = word.trim();
              if (!w) return;
              if ((p.name || '').toLowerCase().includes(w)) score += 10;
              else if ((p.category || '').toLowerCase().includes(w)) score += 8;
              else if ((p.subcategory || '').toLowerCase().includes(w)) score += 8;
              else if ((p.color?.name || '').toLowerCase().includes(w)) score += 6;
              else if ((p.gender || '').toLowerCase().includes(w)) score += 4;
              else if ((p.tags || []).join(' ').toLowerCase().includes(w)) score += 2;
            });
            return score;
          };
          const scoreA = scoreMatch(a);
          const scoreB = scoreMatch(b);
          if (scoreA !== scoreB) return scoreB - scoreA;
        }
        if (sortBy === 'price-low' || (priceTier === 'low' && sortBy === 'featured')) return a.currentPrice - b.currentPrice;
        if (sortBy === 'price-high' || (priceTier === 'high' && sortBy === 'featured')) return b.currentPrice - a.currentPrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'discount') return (b.discount || 0) - (a.discount || 0);
        return 0;
      });
  }, [selectedSubcategory, selectedCategory, searchQuery, sortBy, maxPrice, priceTier, selectedColor, selectedGender]);

  const groupedProducts = useMemo(() => {
    const map = new Map();
    filteredProducts.forEach(p => {
      const groupId = p.modelId || p.id;
      if (!map.has(groupId)) {
        const variantsCount = p.modelId ? allProductsCatalog.filter(cp => cp.modelId === p.modelId).length : 1;
        map.set(groupId, { ...p, variantsCount });
      }
    });
    return Array.from(map.values());
  }, [filteredProducts]);

  const handleResetFilters = () => {`;

content = content.replace(oldFilteredProductsRegex, newFilteredProducts);
fs.writeFileSync('src/pages/ShopPage.jsx', content);
