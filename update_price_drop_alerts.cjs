const fs = require('fs');

// 1. UPDATE MemoryCartPriceAlertPage.jsx
let memoryCode = fs.readFileSync('src/pages/MemoryCartPriceAlertPage.jsx', 'utf8');
memoryCode = memoryCode.replace(/\r\n/g, '\n');

const memoryOldImport = `import React from 'react';`;
const memoryNewImport = `import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';`;

if (!memoryCode.includes('useNotifications')) {
  memoryCode = memoryCode.replace(memoryOldImport, memoryNewImport);
}

const memoryOldComp = `const MemoryCartPriceAlertPage = () => {
  const { memoryItems, getDueReminders, getPriceDropItems } = useMemoryCart();
  const { addToCart } = useCart();`;

const memoryNewComp = `const MemoryCartPriceAlertPage = () => {
  const { memoryItems, getDueReminders, getPriceDropItems } = useMemoryCart();
  const { addToCart } = useCart();
  const { addNotification } = useNotifications();
  const [alertDispatched, setAlertDispatched] = useState(null);

  const handleSendPriceDropAlert = () => {
    const pref = localStorage.getItem('customer_notification_pref') || 'whatsapp';
    const phone = (localStorage.getItem('customer_whatsapp_number') || '9876543210').replace(/\\D/g, '');
    const fullPhone = phone.length === 10 ? '91' + phone : phone;

    const alertMsg = \`Memory Cart Price Drop Alert! 🎉\\n\${priceDropItems.length} items on your essentials list have dropped in price! Total savings: ₹\${totalSavings}.\\nOrder now before prices reset: http://localhost:5173/memory-cart/price-alerts\`;

    setAlertDispatched({
      channel: pref,
      target: pref === 'whatsapp' ? \`+\${fullPhone}\` : 'your registered Email',
      message: \`Dispatched to \${pref.toUpperCase()} (\${pref === 'whatsapp' ? '+' + fullPhone : 'Email'}): Total savings ₹\${totalSavings}\`,
      waLink: pref === 'whatsapp' ? \`https://wa.me/\${fullPhone}?text=\${encodeURIComponent(alertMsg)}\` : null
    });

    addNotification({
      title: 'Price Drop Alert Sent! 📉',
      message: \`Notified via \${pref.toUpperCase()} for ₹\${totalSavings} savings\`,
      type: 'deal'
    });
  };`;

if (!memoryCode.includes('handleSendPriceDropAlert')) {
  memoryCode = memoryCode.replace(memoryOldComp, memoryNewComp);
}

// Add notification banner and button
const memoryActionTarget = `        action={
          priceDropItems.length > 0 && (
            <Button variant="success" onClick={handleBuyAllDeals} icon="">
              Claim Deals ({priceDropItems.length}) - Add to Cart
            </Button>
          )
        }`;

const memoryActionReplacement = `        action={
          priceDropItems.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSendPriceDropAlert}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🔔 Notify Me on WhatsApp / Email
              </button>
              <Button variant="success" onClick={handleBuyAllDeals} icon="">
                Claim Deals ({priceDropItems.length}) - Add to Cart
              </Button>
            </div>
          )
        }`;

if (memoryCode.includes(memoryActionTarget)) {
  memoryCode = memoryCode.replace(memoryActionTarget, memoryActionReplacement);
}

// Add alert banner in container
const memoryContainerTarget = `<div className="container">`;
const memoryContainerReplacement = `<div className="container">
        {alertDispatched && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>{alertDispatched.channel === 'whatsapp' ? '💬' : '✉️'}</span>
              <div>
                <strong style={{ color: '#15803d', display: 'block' }}>Price Drop Notification Dispatched!</strong>
                <span style={{ fontSize: '0.84rem', color: '#334155' }}>{alertDispatched.message}</span>
              </div>
            </div>
            {alertDispatched.waLink && (
              <a
                href={alertDispatched.waLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#16a34a', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none' }}
              >
                Open in WhatsApp ↗
              </a>
            )}
          </div>
        )}`;

if (!memoryCode.includes('alertDispatched &&')) {
  memoryCode = memoryCode.replace(memoryContainerTarget, memoryContainerReplacement);
}

fs.writeFileSync('src/pages/MemoryCartPriceAlertPage.jsx', memoryCode, 'utf8');
console.log('MemoryCartPriceAlertPage.jsx successfully updated with price alert notifications!');

// 2. UPDATE FutureCartDealAlertPage.jsx
let futureCode = fs.readFileSync('src/pages/FutureCartDealAlertPage.jsx', 'utf8');
futureCode = futureCode.replace(/\r\n/g, '\n');

const futureOldImport = `import React from 'react';`;
const futureNewImport = `import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';`;

if (!futureCode.includes('useNotifications')) {
  futureCode = futureCode.replace(futureOldImport, futureNewImport);
}

const futureOldComp = `const FutureCartDealAlertPage = () => {
  const { futureData } = useFutureCart();
  const { addToCart } = useCart();`;

const futureNewComp = `const FutureCartDealAlertPage = () => {
  const { futureData } = useFutureCart();
  const { addToCart } = useCart();
  const { addNotification } = useNotifications();
  const [dealAlertSent, setDealAlertSent] = useState(null);

  const handleSendFutureDealAlert = () => {
    const pref = localStorage.getItem('customer_notification_pref') || 'whatsapp';
    const phone = (localStorage.getItem('customer_whatsapp_number') || '9876543210').replace(/\\D/g, '');
    const fullPhone = phone.length === 10 ? '91' + phone : phone;

    const alertMsg = \`Future Cart Deal Alert! 🎉\\nMilestone: \${occasion}\\n\${dealItems.length} items in your future plan have matched active merchant discounts! Total savings: ₹\${totalDealSavings}.\\nCheck deals: http://localhost:5173/future-cart/deal-alerts\`;

    setDealAlertSent({
      channel: pref,
      target: pref === 'whatsapp' ? \`+\${fullPhone}\` : 'your registered Email',
      message: \`Dispatched to \${pref.toUpperCase()} (\${pref === 'whatsapp' ? '+' + fullPhone : 'Email'}): Total savings ₹\${totalDealSavings}\`,
      waLink: pref === 'whatsapp' ? \`https://wa.me/\${fullPhone}?text=\${encodeURIComponent(alertMsg)}\` : null
    });

    addNotification({
      title: 'Future Cart Deal Alert Dispatched! 🎯',
      message: \`Sent to \${pref.toUpperCase()} for \${occasion}\`,
      type: 'deal'
    });
  };`;

if (!futureCode.includes('handleSendFutureDealAlert')) {
  futureCode = futureCode.replace(futureOldComp, futureNewComp);
}

const futureActionTarget = `        action={
          dealItems.length > 0 && (
            <Button variant="success" onClick={handleBuyAllDeals} icon="">
              Buy All Deal Items ({dealItems.length}) Now
            </Button>
          )
        }`;

const futureActionReplacement = `        action={
          dealItems.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSendFutureDealAlert}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🔔 Notify Me on WhatsApp / Email
              </button>
              <Button variant="success" onClick={handleBuyAllDeals} icon="">
                Buy All Deal Items ({dealItems.length}) Now
              </Button>
            </div>
          )
        }`;

if (futureCode.includes(futureActionTarget)) {
  futureCode = futureCode.replace(futureActionTarget, futureActionReplacement);
}

const futureContainerTarget = `<div className="container">`;
const futureContainerReplacement = `<div className="container">
        {dealAlertSent && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>{dealAlertSent.channel === 'whatsapp' ? '💬' : '✉️'}</span>
              <div>
                <strong style={{ color: '#15803d', display: 'block' }}>Future Cart Deal Notification Dispatched!</strong>
                <span style={{ fontSize: '0.84rem', color: '#334155' }}>{dealAlertSent.message}</span>
              </div>
            </div>
            {dealAlertSent.waLink && (
              <a
                href={dealAlertSent.waLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#16a34a', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none' }}
              >
                Open in WhatsApp ↗
              </a>
            )}
          </div>
        )}`;

if (!futureCode.includes('dealAlertSent &&')) {
  futureCode = futureCode.replace(futureContainerTarget, futureContainerReplacement);
}

fs.writeFileSync('src/pages/FutureCartDealAlertPage.jsx', futureCode, 'utf8');
console.log('FutureCartDealAlertPage.jsx successfully updated with deal alert notifications!');
