import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { allProductsCatalog } from '../data/allOccasionsCatalog';
import { useLanguage } from '../context/LanguageContext';
import './CategoriesPage.css';

const STORE_DEPARTMENTS = [
  {
    id: "Women's Fashion",
    name: "Women's Fashion",
    icon: '👗',
    banner: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    description: 'Kurti Sets, Sarees, Dresses, Ethnic Wear, Western Styles, Nightwear & More.'
  },
  {
    id: "Men's Fashion",
    name: "Men's Fashion",
    icon: '👔',
    banner: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
    description: 'Formal & Casual Shirts, T-Shirts, Pants, Jeans, Track Pants, Blazers & Innerwear.'
  },
  {
    id: "Kids' Fashion",
    name: "Kids' Fashion",
    icon: '🧸',
    banner: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80',
    description: 'Boys & Girls Outfits, Party Frocks, Ethnic Sets, Denim, Footwear & Accessories.'
  },
  {
    id: 'Bags & Luggage',
    name: 'Bags & Luggage',
    icon: '👜',
    banner: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
    description: 'Handbags, Canvas Totes, Laptop Briefcases, Backpacks, Wallets & Spinner Trolleys.'
  },
  {
    id: 'Electronics & Gadgets',
    name: 'Electronics & Gadgets',
    icon: '🎧',
    banner: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    description: 'Smartphones, Laptops, Tablets, Smartwatches, True Wireless Earbuds & Audio.'
  },
  {
    id: 'Home & Kitchen',
    name: 'Home & Kitchen',
    icon: '🍳',
    banner: 'https://images.unsplash.com/photo-1584990347449-39908cb05423?w=600&auto=format&fit=crop&q=80',
    description: 'Granite Cookware, Pressure Cookers, Dinner Sets, Air Fryers, Bedding & Home Decor.'
  },
  {
    id: 'Beauty & Personal Care',
    name: 'Beauty & Personal Care',
    icon: '💄',
    banner: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    description: 'Skincare Serums, Sunscreens, Makeup Palettes, Luxury Perfumes & Grooming Kits.'
  },
  {
    id: 'Watches',
    name: 'Watches & Timepieces',
    icon: '⌚',
    banner: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    description: 'Men & Women Analog Chronographs, Smartwatches, Couple Watch Sets & Luxury Watches.'
  },
  {
    id: 'Accessories',
    name: 'Fashion Accessories',
    icon: '💍',
    banner: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    description: 'Gold Necklaces, Crystal Earrings, Bangles, Polarized Sunglasses, Leather Belts & Scarves.'
  },
  {
    id: 'Gifts & Greeting Cards',
    name: 'Gifts & Greeting Cards',
    icon: '🎁',
    banner: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&auto=format&fit=crop&q=80',
    description: 'Personalized Photo Mugs, Frames, Luxury Gift Hampers, Pop-up Cards & LED Lamps.'
  }
];

const CategoriesPage = () => {
  const { t, lang } = useLanguage();
  const [searchFilter, setSearchFilter] = useState('');

  const filteredDepts = STORE_DEPARTMENTS.filter(dept => {
    return dept.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
           dept.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
           dept.id.toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div className="fm-categories-page">
      <PageHeader
        title={`️ ${t('categories')}`}
        subtitle={lang === 'ta'
          ? 'அனைத்து உயர்தர தயாரிப்புப் பிரிவுகளையும் 10-நாட்கள் எளிதான ரிட்டர்ன் உத்தரவாதத்துடன் ஆராயுங்கள்.'
          : 'Explore store departments and categories, covered by our 7-days doorstep return guarantee.'}
        breadcrumbs={[{ label: t('categories') }]}
        badge="Product Departments"
      />

      <div className="container">
        {/* Search & Filter Bar */}
        <div className="fm-occ-search-wrapper">
          <div className="fm-occ-search-bar">
            <span className="occ-search-icon"></span>
            <input
              type="text"
              placeholder={lang === 'ta' ? 'பிரிவுகளைத் தேடுங்கள் (எ.கா: Watches, Tech, Ethnic)...' : 'Search categories (e.g. Watches, Tech, Ethnic, Jewellery)...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            {searchFilter && (
              <button className="clear-btn" onClick={() => setSearchFilter('')}></button>
            )}
          </div>
          <span className="occ-count-indicator">
            {filteredDepts.length} {lang === 'ta' ? 'பிரிவுகள் உள்ளன' : 'Categories Available'}
          </span>
        </div>

        {/* Store Departments Grid */}
        <div className="fm-occasions-full-grid">
          {filteredDepts.map((dept, idx) => {
            const count = allProductsCatalog.filter(p => p.category.toLowerCase() === dept.id.toLowerCase()).length || 20;

            return (
              <Link
                key={dept.id}
                to={`/shop?category=${encodeURIComponent(dept.id)}`}
                className="fm-occ-card"
              >
                <div className="occ-card-image-wrap">
                  <img src={dept.banner} alt={dept.name} />
                  <span className="occ-badge-counter">{count} Products</span>
                  <span className="occ-guarantee-tag">️ 7 days Return</span>
                </div>

                <div className="occ-card-body">
                  <div className="occ-title-row">
                    <span className="occ-icon">{dept.icon}</span>
                    <h3 className="occ-title">{dept.name}</h3>
                  </div>
                  <p className="occ-desc">{dept.description}</p>
                  <div className="occ-card-cta">
                    <span>{lang === 'ta' ? 'பிரிவை பார்க்க' : 'Explore Department'} ({count} Items) →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
