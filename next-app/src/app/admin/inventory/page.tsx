"use client";

import React, { useState } from 'react';

// Dummy initial data mimicking the exact requested structure
const initialInventory = [
  {
    productName: "Premium Oversized Black T-Shirt",
    sku: "SKU-MEN-TSH-0001",
    colors: [
      { name: "Black", sizes: { S: 5, M: 10, L: 0, XL: 8, XXL: 4, XXXL: 2 } },
      { name: "White", sizes: { S: 3, M: 0, L: 7, XL: 5, XXL: 2, XXXL: 1 } },
    ]
  },
  {
    productName: "Vintage Denim Jeans",
    sku: "SKU-MEN-JEA-0042",
    colors: [
      { name: "Blue", sizes: { S: 12, M: 8, L: 5, XL: 0, XXL: 2, XXXL: 0 } },
    ]
  }
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState(initialInventory);
  const [saving, setSaving] = useState(false);

  const handleStockChange = (productIdx: number, colorIdx: number, size: string, newStock: string) => {
    const value = parseInt(newStock) || 0;
    
    setInventory(prev => {
      const updated = [...prev];
      updated[productIdx].colors[colorIdx].sizes[size as keyof typeof updated[number]['colors'][number]['sizes']] = Math.max(0, value);
      return updated;
    });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Inventory successfully updated in Database!");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">Directly update stock levels across the Size × Colour matrix.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-bold text-white transition-colors ${saving ? 'bg-gray-400' : 'bg-primary hover:bg-opacity-90'}`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {inventory.map((product, pIdx) => (
          <div key={product.sku} className="bg-white rounded-2xl border border-border premium-shadow overflow-hidden mb-8">
            <div className="bg-gray-50 px-6 py-4 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-foreground">{product.productName}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-1">{product.sku}</p>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 rounded-t-xl text-sm font-bold text-foreground">
                    <th className="p-4 border-b border-border border-r border-r-border/50 w-32">Colour</th>
                    {SIZES.map(size => (
                      <th key={size} className="p-4 border-b border-border text-center">{size}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {product.colors.map((color, cIdx) => (
                    <tr key={color.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-foreground border-r border-border/50">
                        {color.name}
                      </td>
                      {SIZES.map(size => {
                        const stock = color.sizes[size as keyof typeof color.sizes] || 0;
                        const isOutOfStock = stock === 0;
                        
                        return (
                          <td key={size} className="p-3 text-center">
                            <input 
                              type="number" 
                              min="0"
                              value={stock}
                              onChange={(e) => handleStockChange(pIdx, cIdx, size, e.target.value)}
                              className={`w-16 h-10 text-center font-mono font-medium rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                                isOutOfStock ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-300 text-foreground'
                              }`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        
      </div>
    </div>
  );
}
