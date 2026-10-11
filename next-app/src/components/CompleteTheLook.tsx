"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface MatchItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  selected: boolean;
}

const mockMatches: MatchItem[] = [
  {
    id: 'm1',
    name: 'Vintage Blue Denim Jeans',
    category: 'Jeans',
    price: 1899,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=200',
    selected: true
  },
  {
    id: 'm2',
    name: 'Classic White Sneakers',
    category: 'Footwear',
    price: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200',
    selected: true
  },
  {
    id: 'm3',
    name: 'Matte Black Chronograph Watch',
    category: 'Accessories',
    price: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200',
    selected: true
  }
];

export default function CompleteTheLook({ currentProductPrice }: { currentProductPrice: number }) {
  const [items, setItems] = useState<MatchItem[]>(mockMatches);

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const selectedItems = items.filter(i => i.selected);
  const totalExtraPrice = selectedItems.reduce((acc, curr) => acc + curr.price, 0);
  const bundleTotal = currentProductPrice + totalExtraPrice;
  // Offer a 10% discount for buying the bundle
  const bundleDiscount = Math.round(bundleTotal * 0.10);
  const finalPrice = bundleTotal - bundleDiscount;

  const handleAddBundle = () => {
    alert(`Successfully added current item and ${selectedItems.length} matching items to cart!`);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-border premium-shadow mt-8">
      <div className="flex items-center space-x-2 mb-6">
        <span className="text-xl">✨</span>
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">Complete The Look</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Our stylists recommend pairing this with the following items for a perfect outfit.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Items List */}
        <div className="flex-1 space-y-4">
          {items.map(item => (
            <div 
              key={item.id} 
              onClick={() => toggleItem(item.id)}
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                item.selected ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'
              }`}
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              
              <div className="ml-4 flex-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.category}</p>
                <h4 className="text-sm font-bold text-foreground line-clamp-1">{item.name}</h4>
                <p className="text-sm font-black text-foreground mt-1">₹{item.price}</p>
              </div>

              <div className="ml-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  item.selected ? 'bg-primary border-primary text-white' : 'border-gray-300'
                }`}>
                  {item.selected && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bundle Summary */}
        <div className="w-full md:w-64 bg-gray-50 rounded-xl p-5 border border-border flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-foreground mb-4">Bundle Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Current Item</span>
                <span className="font-medium text-foreground">₹{currentProductPrice}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Matching Items ({selectedItems.length})</span>
                <span className="font-medium text-foreground">₹{totalExtraPrice}</span>
              </div>
              <div className="flex justify-between text-green-600 font-bold pt-2 border-t border-gray-200 mt-2">
                <span>Bundle Discount</span>
                <span>- ₹{bundleDiscount}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-2xl font-black text-primary">₹{finalPrice}</span>
            </div>
            <button 
              onClick={handleAddBundle}
              disabled={selectedItems.length === 0}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                selectedItems.length > 0 
                ? 'bg-foreground text-white hover:bg-gray-800' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Add {selectedItems.length + 1} Items to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
