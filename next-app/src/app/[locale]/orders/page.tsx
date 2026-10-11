"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Dummy Order History Data
const initialOrders = [
  {
    id: 'FMC-89302',
    date: 'Oct 01, 2026',
    status: 'Delivered', // Status decides button logic
    total: 2298,
    daysSinceDelivery: 3, // For 7-day return logic
    items: [
      {
        id: 'i1',
        name: 'Premium Oversized Black T-Shirt',
        size: 'L',
        color: 'Black',
        price: 1499,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=200',
      },
    ]
  },
  {
    id: 'FMC-89305',
    date: 'Oct 05, 2026',
    status: 'Confirmed',
    total: 799,
    daysSinceDelivery: 0,
    items: [
      {
        id: 'i2',
        name: 'Classic White Sneakers',
        size: '9',
        color: 'White',
        price: 799,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=200',
      }
    ]
  }
];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState(initialOrders);

  const handleAction = (orderId: string, action: string) => {
    alert(`${action} requested for Order ${orderId}`);
    // Here we would call the API to process return or cancel.
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-foreground mb-8 tracking-tight">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => {
            
            // Logic rules from documentation
            const canCancel = ['Order Received', 'Confirmed', 'Packed'].includes(order.status);
            const canReturn = order.status === 'Delivered' && order.daysSinceDelivery <= 7;
            const canTrack = ['Shipped', 'Out for Delivery'].includes(order.status);

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-border premium-shadow overflow-hidden">
                
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Order Placed: {order.date}</p>
                    <h3 className="text-lg font-bold text-foreground">Order {order.id}</h3>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Total Amount</p>
                    <h3 className="text-lg font-bold text-foreground">₹{order.total}</h3>
                  </div>
                  <div className="text-left md:text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 space-y-6">
                  {order.items.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-border">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">Size: <strong className="text-foreground">{item.size}</strong> • Color: <strong className="text-foreground">{item.color}</strong></p>
                        <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-foreground mt-2">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-border bg-gray-50 flex justify-end gap-3">
                  {canTrack && (
                    <button className="px-4 py-2 border border-primary text-primary font-bold text-sm rounded-lg hover:bg-primary hover:text-white transition-colors">
                      Track Package
                    </button>
                  )}
                  {canReturn && (
                    <button 
                      onClick={() => handleAction(order.id, 'Return')}
                      className="px-4 py-2 border border-orange-500 text-orange-500 font-bold text-sm rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      Return / Refund
                    </button>
                  )}
                  {canCancel && (
                    <button 
                      onClick={() => handleAction(order.id, 'Cancel')}
                      className="px-4 py-2 border border-red-500 text-red-500 font-bold text-sm rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  {!canTrack && !canReturn && !canCancel && (
                    <Link href={`/product/some-slug`} className="px-4 py-2 border border-border text-foreground font-bold text-sm rounded-lg hover:bg-gray-100 transition-colors">
                      Buy it again
                    </Link>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
