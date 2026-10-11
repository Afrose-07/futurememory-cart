import React, { createContext, useContext, useState, useEffect } from 'react';
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
      notificationId: `NOTIF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      id: generateId(),
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      read: false,
      relatedOrderId,
      relatedProductId,
      link: relatedOrderId ? `/order-history?orderId=${relatedOrderId}` : relatedProductId ? `/product/${relatedProductId}` : '/notifications'
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
            background: 'var(--primary-color)',
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
