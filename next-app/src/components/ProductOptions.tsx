"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Variant {
  id: string;
  size: string;
  colorId: string;
  stock: number;
}

interface ProductOptionsProps {
  variants: Variant[];
  colors: { id: string; name: string; hexCode: string }[];
}

// Ensure the exact order requested by the user
const CLOTHING_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export default function ProductOptions({ variants, colors }: ProductOptionsProps) {
  const t = useTranslations('Product');
  const [selectedColor, setSelectedColor] = useState<string>(colors[0]?.id || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showSizeError, setShowSizeError] = useState(false);

  // Filter sizes based on the currently selected color
  const availableVariants = variants.filter(v => v.colorId === selectedColor);
  
  // Sort them so they appear in the exact order requested (XS to XXXL)
  const sortedVariants = [...availableVariants].sort((a, b) => {
    const indexA = CLOTHING_ORDER.indexOf(a.size);
    const indexB = CLOTHING_ORDER.indexOf(b.size);
    // If not in CLOTHING_ORDER (like shoes), just sort alphabetically
    if (indexA === -1 || indexB === -1) return a.size.localeCompare(b.size);
    return indexA - indexB;
  });

  // Filter colors based on the currently selected size
  const getAvailableColors = () => {
    if (!selectedSize) return colors;
    const colorsWithSize = variants.filter(v => v.size === selectedSize && v.stock > 0).map(v => v.colorId);
    return colors.map(c => ({
      ...c,
      disabled: !colorsWithSize.includes(c.id)
    }));
  };

  const currentColors = getAvailableColors();

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setShowSizeError(true);
      return;
    }
    setShowSizeError(false);
    alert(`Added to cart: Color ${selectedColor}, Size ${selectedSize}`);
  };

  return (
    <div className="space-y-8 mt-6">
      
      {/* Color Selector */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          {t('color', { defaultMessage: 'Color' })}: 
          <span className="font-normal text-muted-foreground ml-2">
            {colors.find(c => c.id === selectedColor)?.name}
          </span>
        </h3>
        <div className="flex space-x-3">
          {currentColors.map((color) => {
            const isColorDisabled = 'disabled' in color && color.disabled;
            return (
              <button
                key={color.id}
                disabled={isColorDisabled as boolean}
                onClick={() => {
                  setSelectedColor(color.id);
                  if (isColorDisabled) setSelectedSize('');
                  setShowSizeError(false);
                }}
                className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                  selectedColor === color.id ? 'border-primary scale-110' : 'border-border hover:border-gray-400'
                } ${isColorDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: color.hexCode }}
                aria-label={`Select ${color.name}`}
              >
                {(isColorDisabled as boolean) && (
                  <div className="absolute inset-0 w-full h-full border-t-2 border-red-500 rotate-45 origin-center scale-110 top-1/2 left-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-foreground">
            {t('size', { defaultMessage: 'Size' })}
          </h3>
          <button className="text-sm text-primary underline font-medium">
            {t('sizeChart', { defaultMessage: 'Size Chart' })}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {sortedVariants.map((variant) => {
            const isOutOfStock = variant.stock === 0;
            const isLowStock = variant.stock > 0 && variant.stock <= 3;
            const isSelected = selectedSize === variant.size;

            return (
              <div key={variant.id} className="relative flex flex-col items-center">
                <button
                  disabled={isOutOfStock}
                  onClick={() => {
                    setSelectedSize(variant.size);
                    setShowSizeError(false);
                  }}
                  className={`relative flex items-center justify-center min-w-[3rem] px-3 h-12 border rounded-xl font-medium transition-all
                    ${isOutOfStock 
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                      : isSelected
                        ? 'border-primary bg-primary text-white shadow-md'
                        : 'border-border text-foreground hover:border-primary'
                    }
                  `}
                >
                  {variant.size}
                  
                  {/* Diagonal strike-through for out of stock as requested */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 w-full h-full border-t border-gray-300 rotate-[-35deg] origin-center scale-110 top-1/2 left-0" />
                  )}
                </button>
                
                {/* Low Stock Indicator */}
                {isLowStock && !isOutOfStock && (
                  <span className="absolute -bottom-5 text-[10px] text-red-500 font-medium whitespace-nowrap">
                    {t('onlyLeft', { count: variant.stock, defaultMessage: `Only ${variant.stock} left` })}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Error Message if Add to Cart clicked without Size/Color */}
        {showSizeError && (
          <p className="mt-4 text-sm text-red-500 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {t('pleaseSelectSize', { defaultMessage: 'Please select both Size and Color' })}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-4">
        <button 
          onClick={handleAddToCart}
          className={`flex-1 h-14 rounded-xl font-bold text-lg transition-colors ${
            !selectedSize || !selectedColor 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-opacity-90 active:scale-95'
          }`}
        >
          {t('addToCart', { defaultMessage: 'Add to Cart' })}
        </button>
        <button className="w-14 h-14 flex items-center justify-center rounded-xl border border-border text-foreground hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

    </div>
  );
}
