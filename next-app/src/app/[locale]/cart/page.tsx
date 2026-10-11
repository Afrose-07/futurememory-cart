"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Dummy Data
const initialCart = [
  {
    id: 'cart-1',
    productId: 'p1',
    name: 'Premium Cotton T-Shirt',
    price: 799,
    size: 'L',
    color: 'Black',
    quantity: 2,
    maxStock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=200'
  },
  {
    id: 'cart-2',
    productId: 'p2',
    name: 'Vintage Denim Jeans',
    price: 1899,
    size: '32',
    color: 'Blue',
    quantity: 1,
    maxStock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=200'
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCart);

  const updateQuantity = (id: string, newQty: number, maxStock: number) => {
    if (newQty < 1) return;
    // Stock limit logic (Stock exceed panna koodadhu)
    if (newQty > maxStock) {
      alert(`Only ${maxStock} items available in stock!`);
      return;
    }
    
    setCartItems(items => 
      items.map(item => item.id === id ? { ...item, quantity: newQty } : item)
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST dummy
  const total = subtotal + tax;

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-extrabold text-foreground mb-8 tracking-tight">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border premium-shadow">
            <svg className="mx-auto h-20 w-20 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
            <Link href="/shop" className="premium-button inline-block px-8 py-3">Continue Shopping</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-4 md:p-6 rounded-2xl border border-border premium-shadow flex flex-col md:flex-row gap-6 relative">
                  
                  {/* Image */}
                  <div className="relative w-full md:w-32 aspect-square rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground font-medium">
                        <span className="bg-gray-100 px-3 py-1 rounded-md">Size: <strong className="text-foreground">{item.size}</strong></span>
                        <span className="bg-gray-100 px-3 py-1 rounded-md">Color: <strong className="text-foreground">{item.color}</strong></span>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.maxStock)}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-white hover:bg-gray-50 text-foreground font-bold shadow-sm"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.maxStock)}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-white hover:bg-gray-50 text-foreground font-bold shadow-sm"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                        <p className="text-xl font-black text-foreground">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 md:static md:self-start text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="bg-white p-6 rounded-2xl border border-border premium-shadow sticky top-24">
                <h2 className="text-xl font-bold text-foreground mb-6">Summary</h2>
                
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated GST (18%)</span>
                    <span className="text-foreground">₹{Math.round(tax)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>
                </div>

                <div className="border-t border-border mt-6 pt-6 flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-2xl font-black text-primary">₹{Math.round(total)}</span>
                </div>

                <Link href="/checkout" className="block w-full premium-button text-center text-lg">
                  Proceed to Checkout
                </Link>

                <p className="text-xs text-center text-muted-foreground mt-4 flex justify-center items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure SSL Checkout
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
