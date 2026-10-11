import React from 'react';
import ProductGallery from '@/components/ProductGallery';
import ProductOptions from '@/components/ProductOptions';
import CompleteTheLook from '@/components/CompleteTheLook';
import Image from 'next/image';
import Link from 'next/link';

// Dummy data for the sake of UI development before connecting DB fully
const mockProduct = {
  name: "Premium Oversized Black T-Shirt",
  price: 1499,
  mrp: 2999,
  rating: 4.8,
  reviewsCount: 124,
  description: "Experience the ultimate comfort with our premium oversized t-shirt. Crafted from 100% bio-washed pure cotton, it offers a relaxed fit perfect for everyday streetwear.",
  fabric: "100% Pure Cotton",
  care: "Machine wash cold, Do not iron on print.",
  images: [
    { id: '1', url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000', alt: 'Front', position: 1 },
    { id: '2', url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1000', alt: 'Back', position: 2 },
    { id: '3', url: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1000', alt: 'Side', position: 3 },
    { id: '4', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000', alt: 'Close-up', position: 4 }
  ],
  colors: [
    { id: 'black', name: 'Black', hexCode: '#000000' },
    { id: 'white', name: 'White', hexCode: '#FFFFFF' }
  ],
  variants: [
    { id: 'v1', size: 'S', colorId: 'black', stock: 10 },
    { id: 'v2', size: 'M', colorId: 'black', stock: 15 },
    { id: 'v3', size: 'L', colorId: 'black', stock: 0 },
    { id: 'v4', size: 'XL', colorId: 'black', stock: 8 },
    { id: 'v5', size: 'S', colorId: 'white', stock: 5 },
    { id: 'v6', size: 'M', colorId: 'white', stock: 0 },
    { id: 'v7', size: 'L', colorId: 'white', stock: 7 },
  ]
};

export default function ProductDetailPage() {
  const discount = Math.round(((mockProduct.mrp - mockProduct.price) / mockProduct.mrp) * 100);

  return (
    <div className="bg-[#FDFBF7] min-h-screen pb-20 font-sans">
      
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link> &gt; 
        <Link href="/shop/men" className="hover:text-primary transition-colors mx-1">Men</Link> &gt; 
        <Link href="/shop/men/t-shirts" className="hover:text-primary transition-colors mx-1">T-Shirts</Link> &gt; 
        <span className="text-foreground ml-1">{mockProduct.name}</span>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
        
        {/* Left: Image Gallery */}
        <div>
          <ProductGallery images={mockProduct.images} productName={mockProduct.name} />
        </div>

        {/* Right: Product Info & Options */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            {mockProduct.name}
          </h1>
          
          <div className="flex items-center space-x-4 mt-3">
            <div className="flex items-center space-x-1 text-yellow-400">
              {/* Stars */}
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              <span className="text-foreground text-sm ml-2 font-medium">{mockProduct.rating} ({mockProduct.reviewsCount} Reviews)</span>
            </div>
          </div>

          <div className="flex items-end space-x-3 mt-6">
            <span className="text-3xl font-black text-foreground">₹{mockProduct.price}</span>
            <span className="text-lg text-muted-foreground line-through font-medium mb-1">₹{mockProduct.mrp}</span>
            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded font-bold mb-1">{discount}% OFF</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>

          {/* Interactive Size & Color Variants Component */}
          <div className="border-t border-b border-border py-6 my-8">
            <ProductOptions variants={mockProduct.variants} colors={mockProduct.colors} />
            
            <div className="mt-4">
               {/* Buy Now & Wishlist */}
               <div className="flex space-x-4 mt-4">
                  <button className="flex-1 h-14 rounded-xl font-bold text-lg bg-foreground text-white hover:bg-gray-800 transition-colors">
                    Buy it Now
                  </button>
                  <button className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-border text-foreground hover:border-red-500 hover:text-red-500 transition-colors">
                    ♥
                  </button>
               </div>
            </div>
          </div>

          {/* Delivery & Return Info */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-border premium-shadow flex items-start space-x-3">
              <span className="text-2xl">🚚</span>
              <div>
                <h4 className="text-sm font-bold text-foreground">Fast Delivery</h4>
                <p className="text-xs text-muted-foreground mt-1">Enter pincode to check delivery date</p>
                <div className="mt-2 flex">
                  <input type="text" placeholder="Pincode" className="w-full bg-gray-50 border border-gray-200 rounded-l-md px-2 py-1 text-xs outline-none" />
                  <button className="bg-primary text-white px-2 py-1 rounded-r-md text-xs font-bold">Check</button>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-border premium-shadow flex items-start space-x-3">
              <span className="text-2xl">↩️</span>
              <div>
                <h4 className="text-sm font-bold text-foreground">7-Day Returns</h4>
                <p className="text-xs text-muted-foreground mt-1">100% Free Doorstep Pickup available.</p>
              </div>
            </div>
          </div>

          {/* AI Style Match - Complete The Look */}
          <CompleteTheLook currentProductPrice={mockProduct.price} />

          {/* Description & Details Accordion */}
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed mt-8">
            <div>
              <h4 className="font-bold text-foreground text-base mb-2">Description</h4>
              <p>{mockProduct.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-border">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Fabric</h4>
                <p className="text-muted-foreground">{mockProduct.fabric}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Care</h4>
                <p className="text-muted-foreground">{mockProduct.care}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Suggested Products Sections */}
      <div className="container mx-auto px-4 mt-24 space-y-16">
        
        {/* Similar Products */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {/* Render Product Cards (Dummy for now) */}
             {[1, 2, 3, 4].map(idx => (
                <Link href="#" key={`similar-${idx}`} className="premium-card group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-gray-100">
                    <Image src={`https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop&sig=${idx}`} alt="Similar" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-foreground truncate">Trending Style {idx}</h3>
                    <p className="mt-1 font-bold text-foreground">₹1299</p>
                  </div>
                </Link>
             ))}
          </div>
        </section>

        {/* You May Also Like */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[5, 6, 7, 8].map(idx => (
                <Link href="#" key={`also-like-${idx}`} className="premium-card group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-gray-100">
                    <Image src={`https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1000&auto=format&fit=crop&sig=${idx}`} alt="Also Like" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-foreground truncate">Recommended Style {idx}</h3>
                    <p className="mt-1 font-bold text-foreground">₹1499</p>
                  </div>
                </Link>
             ))}
          </div>
        </section>

        {/* Recently Viewed */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Recently Viewed</h2>
          <div className="flex space-x-6 overflow-x-auto pb-4 no-scrollbar">
             {[9, 10, 11].map(idx => (
                <Link href="#" key={`recent-${idx}`} className="premium-card group block w-48 flex-shrink-0">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-gray-100">
                    <Image src={`https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop&sig=${idx}`} alt="Recent" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-foreground truncate">Previous View {idx}</h3>
                    <p className="mt-1 font-bold text-foreground">₹999</p>
                  </div>
                </Link>
             ))}
          </div>
        </section>

      </div>
    </div>
  );
}
