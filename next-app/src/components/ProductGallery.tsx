"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  // Sort images by their designated position (Front, Back, Side, etc.)
  const sortedImages = [...images].sort((a, b) => a.position - b.position);
  
  const [mainImage, setMainImage] = useState<ProductImage>(sortedImages[0]);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fallback if no images are provided
  if (!sortedImages.length) {
    return (
      <div className="w-full aspect-[3/4] bg-gray-100 rounded-2xl flex items-center justify-center border border-border">
        <span className="text-muted-foreground font-medium">No Images Available</span>
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="flex flex-col md:flex-row-reverse gap-4">
      
      {/* Main Image Viewport with Hover Zoom */}
      <div className="w-full md:w-[80%]">
        <div 
          className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-zoom-in bg-secondary premium-shadow border border-border"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Base Image */}
          <Image
            src={mainImage?.url || "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=1000"}
            alt={mainImage?.alt || productName}
            fill
            className={`object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Zoomed Image Layer */}
          {isHovering && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${mainImage?.url || "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=1000"})`,
                backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                backgroundSize: '200%', // Magnification level
                backgroundRepeat: 'no-repeat'
              }}
            />
          )}
        </div>
      </div>

      {/* Thumbnails Sidebar */}
      <div className="w-full md:w-[20%] flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0">
        {sortedImages.map((img) => (
          <button
            key={img.id}
            onClick={() => setMainImage(img)}
            className={`relative flex-shrink-0 w-20 h-24 md:w-full md:aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
              mainImage.id === img.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'
            }`}
          >
            <Image
              src={img.url}
              alt={img.alt || `Thumbnail ${img.position}`}
              fill
              className="object-cover"
              sizes="100px"
            />
          </button>
        ))}
      </div>
      
    </div>
  );
}
