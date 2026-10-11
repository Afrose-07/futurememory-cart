"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// Dummy interfaces for types
interface FilterOption {
  label: string;
  value: string;
  count: number;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  imageUrl: string;
  rating: number;
}

interface ProductListingProps {
  products: Product[];
  totalProducts: number;
  availableSizes: FilterOption[];
  availableColors: FilterOption[];
}

export default function ProductListing({ products, totalProducts, availableSizes, availableColors }: ProductListingProps) {
  const t = useTranslations('Shop');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (val: string) => {
    setActiveFilters(prev => 
      prev.includes(val) ? prev.filter(f => f !== val) : [...prev, val]
    );
  };

  const clearAllFilters = () => setActiveFilters([]);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      
      {/* 2800px sticky sidebar requested in spec */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-24 bg-white p-6 rounded-xl border border-border premium-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-foreground">{t('filters', { defaultMessage: 'Filters' })}</h2>
            {activeFilters.length > 0 && (
              <button onClick={clearAllFilters} className="text-xs text-primary font-medium hover:underline">
                {t('clearAll', { defaultMessage: 'Clear all' })}
              </button>
            )}
          </div>

          {/* Size Filter */}
          <div className="mb-8">
            <h3 className="font-semibold text-foreground mb-3">{t('size', { defaultMessage: 'Size' })}</h3>
            <div className="space-y-2">
              {availableSizes.map(size => {
                const isZero = size.count === 0;
                return (
                  <label key={size.value} className={`flex items-center justify-between group ${isZero ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        disabled={isZero}
                        checked={activeFilters.includes(size.value)}
                        onChange={() => toggleFilter(size.value)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className={`text-sm ${isZero ? 'text-gray-400' : 'text-gray-700 group-hover:text-primary'}`}>
                        {size.label}
                      </span>
                    </div>
                    {/* Count next to option e.g. "Footwear (48)" */}
                    <span className="text-xs text-muted-foreground">({size.count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('color', { defaultMessage: 'Color' })}</h3>
            <div className="space-y-2">
              {availableColors.map(color => {
                const isZero = color.count === 0;
                return (
                  <label key={color.value} className={`flex items-center justify-between group ${isZero ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        disabled={isZero}
                        checked={activeFilters.includes(color.value)}
                        onChange={() => toggleFilter(color.value)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className={`text-sm ${isZero ? 'text-gray-400' : 'text-gray-700 group-hover:text-primary'}`}>
                        {color.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">({color.count})</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1">
        
        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map(filter => (
              <span key={filter} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {filter}
                <button onClick={() => toggleFilter(filter)} className="ml-2 hover:text-red-500">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {t('showing', { defaultMessage: 'Showing' })} <span className="font-bold text-foreground">{totalProducts}</span> {t('products', { defaultMessage: 'products' })}
          </p>
        </div>

        {/* NO DEAD ENDS: Empty State with Suggestions */}
        {products.length === 0 ? (
          <div>
            <div className="text-center py-20 bg-white rounded-xl border border-border premium-shadow mb-12">
              <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t('noProductsMatch', { defaultMessage: 'No products match these filters.' })}
              </h3>
              
              {/* Active Filters as Chips in the empty state itself */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6 mt-4">
                  <span className="text-sm text-muted-foreground mr-2 self-center">Active Filters:</span>
                  {activeFilters.map(filter => (
                    <span key={filter} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {filter}
                      <button onClick={() => toggleFilter(filter)} className="ml-2 hover:text-red-500 font-bold">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <button onClick={clearAllFilters} className="premium-button">
                {t('clearAllFilters', { defaultMessage: 'Clear All Filters' })}
              </button>
            </div>

            {/* You may also like... Suggestions */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6">
                {t('youMayAlsoLike', { defaultMessage: 'You may also like' })}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {/* 4 Dummy suggestion products as placeholders for the actual query */}
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="premium-card group block overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                    <div className="relative aspect-[3/4] bg-gray-100">
                      <Image 
                        src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000" 
                        alt="Suggested Product"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-foreground truncate">Trending Style {idx}</h4>
                      <p className="mt-1 font-bold text-foreground">₹1299</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <Link key={product.id} href={`/product/${product.slug}`} className="premium-card group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-gray-100">
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Discount Badge */}
                  {product.mrp > product.price && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                      -{Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-foreground truncate">{product.name}</h3>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="font-bold text-foreground">₹{product.price}</span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-muted-foreground line-through">₹{product.mrp}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
