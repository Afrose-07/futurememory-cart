"use client";

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface CartItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  size: string;
  colorName: string;
  imageUrl: string;
}

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  returnDays: number;
}

export default function CheckoutSummary({ items, subtotal, discount, total, returnDays }: CheckoutSummaryProps) {
  const t = useTranslations('Checkout');

  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-border premium-shadow">
      <h2 className="text-xl font-bold text-foreground mb-6">
        {t('orderSummary', { defaultMessage: 'Order Summary' })}
      </h2>

      {/* Cart Items List */}
      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
        {items.map((item) => (
          <div key={item.id} className="flex space-x-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            
            {/* Product Image */}
            <div className="relative w-20 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-border">
              <Image 
                src={item.imageUrl} 
                alt={item.productName} 
                fill 
                className="object-cover"
              />
            </div>

            {/* Product Details (MUST SHOW SIZE AND COLOR) */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2">
                  {item.productName}
                </h3>
                <div className="mt-1 flex items-center text-xs text-muted-foreground space-x-2">
                  <span>{t('size', { defaultMessage: 'Size' })}: <strong className="text-foreground">{item.size}</strong></span>
                  <span>•</span>
                  <span>{t('color', { defaultMessage: 'Color' })}: <strong className="text-foreground">{item.colorName}</strong></span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mt-2">
                <span className="text-xs font-medium text-gray-500">
                  {t('qty', { defaultMessage: 'Qty' })}: {item.quantity}
                </span>
                <span className="text-sm font-bold text-foreground">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            </div>
            
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 py-4 border-t border-dashed border-gray-300">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{t('subtotal', { defaultMessage: 'Subtotal' })}</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-sm text-green-600 font-medium">
          <span>{t('discount', { defaultMessage: 'Discount' })}</span>
          <span>- ₹{discount}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{t('shipping', { defaultMessage: 'Shipping' })}</span>
          <span className="text-green-600">{t('free', { defaultMessage: 'FREE' })}</span>
        </div>
      </div>

      <div className="py-4 border-t border-border flex justify-between items-center">
        <span className="text-lg font-bold text-foreground">{t('total', { defaultMessage: 'Total to pay' })}</span>
        <span className="text-2xl font-black text-primary">₹{total}</span>
      </div>

      <button className="w-full premium-button mt-4 text-lg">
        {t('proceedToPayment', { defaultMessage: 'Proceed to Payment' })}
      </button>

      {/* STRICT RULE: Return Policy Guarantee */}
      <div className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4 flex items-start space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="text-sm font-bold text-green-800">
            {t('returnPolicyTitle', { days: returnDays, defaultMessage: `${returnDays}-Days Easy Return` })}
          </h4>
          <p className="text-xs text-green-700 mt-1">
            {t('returnPolicyDesc', { defaultMessage: 'Doorstep reverse pickup & instant refund on every product.' })}
          </p>
        </div>
      </div>

    </div>
  );
}
