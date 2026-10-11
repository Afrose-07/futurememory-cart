"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Dummy Wishlist Data
const initialWishlist = [
  {
    id: 'w1',
    productId: 'p1',
    name: 'Premium Cotton T-Shirt',
    price: 799,
    size: 'L',
    color: 'Black',
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=200'
  },
  {
    id: 'w2',
    productId: 'p2',
    name: 'Vintage Denim Jeans',
    price: 1899,
    size: '32',
    color: 'Blue',
    inStock: false, // Out of stock to demonstrate "Notify Me"
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=200'
  }
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(initialWishlist);

  const removeItem = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const handleNotifyMe = (name: string) => {
    alert(`You will be notified via WhatsApp/Email when ${name} is back in stock!`);
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-extrabold text-foreground mb-8 tracking-tight">My Wishlist <span className="text-gray-400 font-medium text-lg ml-2">({wishlistItems.length} items)</span></h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border premium-shadow">
            <span className="text-6xl mb-4 block">🤍</span>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save items that you like in your wishlist.</p>
            <Link href="/shop" className="premium-button inline-block px-8 py-3">Explore Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-border premium-shadow flex flex-col relative overflow-hidden group">
                
                {/* Image */}
                <div className="relative w-full aspect-[3/4] bg-gray-100 flex-shrink-0">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Remove Button (X) */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                  >
                    ✕
                  </button>
                  
                  {/* Out of Stock Badge Overlay */}
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white px-4 py-2 rounded-lg font-bold text-gray-900 shadow-lg uppercase tracking-wider text-xs">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1">{item.name}</h3>
                  <div className="mt-1 flex gap-2 text-xs text-muted-foreground font-medium">
                    <span>Size: <strong className="text-foreground">{item.size}</strong></span>
                    <span>•</span>
                    <span>Color: <strong className="text-foreground">{item.color}</strong></span>
                  </div>
                  <p className="text-lg font-black text-foreground mt-2 mb-4">₹{item.price}</p>
                  
                  {/* Action Button: Add to Cart OR Notify Me */}
                  <div className="mt-auto">
                    {item.inStock ? (
                      <button className="w-full py-2.5 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors">
                        Move to Cart
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleNotifyMe(item.name)}
                        className="w-full py-2.5 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        Notify Me
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
