"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [language, setLanguage] = useState("EN");

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border premium-shadow">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-xl font-bold text-foreground">
            FutureMemory<span className="text-primary">Cart</span>
          </Link>
        </div>

        {/* Navigation Menu (Desktop) */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/men" className="text-sm font-medium hover:text-primary transition-colors">Men</Link>
          <Link href="/women" className="text-sm font-medium hover:text-primary transition-colors">Women</Link>
          <Link href="/kids" className="text-sm font-medium hover:text-primary transition-colors">Kids</Link>
          <Link href="/footwear" className="text-sm font-medium hover:text-primary transition-colors">Footwear</Link>
          <Link href="/accessories" className="text-sm font-medium hover:text-primary transition-colors">Accessories</Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
          <input 
            type="text" 
            placeholder="Search for products, brands and more..." 
            className="w-full bg-secondary text-foreground text-sm rounded-full pl-10 pr-4 py-2 border-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Language Selector */}
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer text-foreground"
          >
            <option value="EN">EN</option>
            <option value="TA">தமிழ்</option>
            <option value="HI">हिन्दी</option>
          </select>

          {/* Icons (Wishlist, Cart, Profile) */}
          <div className="flex items-center space-x-3 text-foreground">
            {/* Wishlist */}
            <Link href="/wishlist" className="hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>
            {/* Cart */}
            <Link href="/cart" className="hover:text-primary transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </Link>
            {/* Profile */}
            <Link href="/login" className="hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
