const fs = require('fs');

// 1. Rewrite NotificationContext.jsx
const notifContextCode = `import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateId } from '../utils/helpers';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('fm_notifications_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeToast, setActiveToast] = useState(null);

  // Default toggles
  const defaultToggles = {
    order: true,
    wishlist: true,
    memoryCart: true,
    price: true,
    stock: true
  };

  const getToggles = () => {
    try {
      const stored = localStorage.getItem('fm_notif_toggles');
      return stored ? JSON.parse(stored) : defaultToggles;
    } catch {
      return defaultToggles;
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('fm_notifications_v1', JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const addNotification = ({ type, title, message, relatedOrderId, relatedProductId }) => {
    const toggles = getToggles();
    
    // Check toggles based on type
    if (type === 'order' && !toggles.order) return;
    if (type === 'wishlist' && !toggles.wishlist) return;
    if (type === 'reminder' && !toggles.memoryCart) return;
    if (type === 'price_drop' && !toggles.price) return;
    if (type === 'stock' && !toggles.stock) return;

    // Prevent duplicate notifications for the same event
    const isDuplicate = notifications.some(n => 
      n.type === type && 
      (relatedOrderId ? n.relatedOrderId === relatedOrderId : true) && 
      (relatedProductId ? n.relatedProductId === relatedProductId : true) &&
      (Date.now() - new Date(n.createdAt).getTime() < 86400000) // within 24h
    );

    // Except for order notifications, which we always allow if triggered
    if (isDuplicate && type !== 'order') return;

    const notification = {
      notificationId: \`NOTIF-\${Math.random().toString(36).substring(2, 9).toUpperCase()}\`,
      id: generateId(),
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      read: false,
      relatedOrderId,
      relatedProductId,
      link: relatedOrderId ? \`/order-history\` : relatedProductId ? \`/product/\${relatedProductId}\` : '/notifications'
    };

    setNotifications(prev => [notification, ...prev]);
    playChime();

    setActiveToast(notification);
    setTimeout(() => {
      setActiveToast(current => (current?.id === notification.id ? null : current));
    }, 4500);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        (notif.id === id || notif.notificationId === id) ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id && n.notificationId !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('fm_notifications_v1');
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
      getUnreadCount
    }}>
      {children}
      {activeToast && (
        <div
          className="fm-global-floating-toast"
          style={{
            position: 'fixed',
            top: '30px',
            right: '24px',
            zIndex: 999999,
            background: '#4f46e5',
            color: '#fff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            borderRadius: '16px',
            padding: '16px 20px',
            maxWidth: '380px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            animation: 'fmToastSlideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onClick={() => setActiveToast(null)}
        >
          <div style={{ fontSize: '1.5rem', background: '#ffffff33', padding: '10px', borderRadius: '12px' }}>
            🔔
          </div>
          <div style={{ flex: 1, cursor: 'pointer' }}>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>New Notification</h5>
            <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 800, marginBottom: '2px' }}>{activeToast.title}</div>
            <div style={{ fontSize: '0.86rem', color: '#f8fafc', lineHeight: 1.4 }}>{activeToast.message}</div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
`;
fs.writeFileSync('src/context/NotificationContext.jsx', notifContextCode);

// 2. Patch OrderContext.jsx to trigger notifications
let orderCtx = fs.readFileSync('src/context/OrderContext.jsx', 'utf8');

if (!orderCtx.includes('useNotifications')) {
  orderCtx = orderCtx.replace("import { generateId, formatPrice } from '../utils/helpers';", 
    "import { generateId, formatPrice } from '../utils/helpers';\nimport { useNotifications } from './NotificationContext';");
}

if (!orderCtx.includes('const { addNotification } = useNotifications();')) {
  orderCtx = orderCtx.replace("const [orders, setOrders] = useState", 
    "const { addNotification } = useNotifications();\n  const [orders, setOrders] = useState");
}

if (!orderCtx.includes("addNotification({ type: 'order'")) {
  orderCtx = orderCtx.replace(/return newOrder;\r?\n\s*\};/,
  `// Notification for placement
    if (addNotification) {
      addNotification({
        type: 'order',
        title: 'Order Placed',
        message: \`Your order \${orderId} for \${formatPrice(newOrder.totalAmount)} has been placed successfully.\`,
        relatedOrderId: orderId
      });
    }
    return newOrder;
  };`);
}

if (!orderCtx.includes("addNotification({ type: 'order', title: 'Order Cancelled'")) {
  orderCtx = orderCtx.replace(/cancelReason: reason\r?\n\s*\};\r?\n\s*\}\r?\n\s*return order;\r?\n\s*\}\)\);/m, 
  `cancelReason: reason
        };
      }
      return order;
    }));
    
    if (addNotification) {
      addNotification({
        type: 'order',
        title: 'Order Cancelled',
        message: \`Your order \${orderId} has been cancelled successfully.\`,
        relatedOrderId: orderId
      });
    }`);
}

fs.writeFileSync('src/context/OrderContext.jsx', orderCtx);

// 3. Create useAppEvents Hook and add it to App.jsx
const appEventsCode = `import { useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useWishlist } from '../context/WishlistContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { allProductsCatalog } from '../data/allOccasionsCatalog';
import { formatPrice } from '../utils/helpers';

export const useAppEvents = () => {
  const { addNotification } = useNotifications();
  const { wishlist } = useWishlist();
  const { memoryItems } = useMemoryCart();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Simulate Wishlist Price Drops & Stock Alerts
    wishlist.forEach(item => {
      const liveProduct = allProductsCatalog.find(p => String(p.id) === String(item.id || item.productId));
      if (!liveProduct) return;
      
      if (liveProduct.price < (item.price || liveProduct.price)) {
        addNotification({
          type: 'price_drop',
          title: 'Price Updated',
          message: \`\${liveProduct.name} dropped from \${formatPrice(item.price)} to \${formatPrice(liveProduct.price)}!\`,
          relatedProductId: liveProduct.id
        });
      }
      
      if (item.stock === 0 && liveProduct.stock > 0) {
        addNotification({
          type: 'stock',
          title: 'Back in Stock',
          message: \`\${liveProduct.name} is now back in stock at \${formatPrice(liveProduct.price)}!\`,
          relatedProductId: liveProduct.id
        });
      }
    });

    if (memoryItems.length > 0) {
      const firstMemoryItem = memoryItems[0];
      addNotification({
        type: 'reminder',
        title: 'Memory Cart Reminder',
        message: \`You saved \${firstMemoryItem.name} for a future occasion.\`,
        relatedProductId: firstMemoryItem.id || firstMemoryItem.productId
      });
    }

  }, [addNotification, wishlist, memoryItems]);
};
`;
fs.writeFileSync('src/hooks/useAppEvents.js', appEventsCode);

let appJsx = fs.readFileSync('src/App.jsx', 'utf8');
if (!appJsx.includes('useAppEvents')) {
  appJsx = appJsx.replace("import { AdminAuthProvider } from './context/AdminAuthContext';", "import { AdminAuthProvider } from './context/AdminAuthContext';\nimport { useAppEvents } from './hooks/useAppEvents';");
  appJsx = appJsx.replace("function AppContent() {\n  const { isAuthenticated } = useAuth();", "function AppContent() {\n  const { isAuthenticated } = useAuth();\n  useAppEvents();");
  fs.writeFileSync('src/App.jsx', appJsx);
}

// 4. SettingsModal.jsx toggles
let settings = fs.readFileSync('src/components/SettingsModal.jsx', 'utf8');
if (!settings.includes('Notification Toggles')) {
  const newSection = `
          {/* Notification Toggles */}
          <section className="fm-setting-section">
            <div className="fm-section-label">
              <span className="section-title">🔔 Notification Settings</span>
              <span className="section-hint">Choose which alerts you want to receive</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(() => {
                const toggles = JSON.parse(localStorage.getItem('fm_notif_toggles') || '{"order":true,"wishlist":true,"memoryCart":true,"price":true,"stock":true}');
                const toggleItem = (key) => {
                  const newToggles = { ...toggles, [key]: !toggles[key] };
                  localStorage.setItem('fm_notif_toggles', JSON.stringify(newToggles));
                  window.dispatchEvent(new Event('storage'));
                };
                return [
                  { key: 'order', label: 'Order Updates' },
                  { key: 'wishlist', label: 'Wishlist Updates' },
                  { key: 'memoryCart', label: 'Memory Cart Reminders' },
                  { key: 'price', label: 'Price Alerts' },
                  { key: 'stock', label: 'Stock Alerts' }
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 500, color: '#334155' }}>{item.label}</span>
                    <label className="fm-toggle-switch" style={{ cursor: 'pointer' }}>
                      <input type="checkbox" checked={toggles[item.key]} onChange={() => toggleItem(item.key)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    </label>
                  </div>
                ));
              })()}
            </div>
          </section>
  `;
  settings = settings.replace("{/* Notification Preference */}", newSection + "\n          {/* Notification Preference */}");
  fs.writeFileSync('src/components/SettingsModal.jsx', settings);
}
