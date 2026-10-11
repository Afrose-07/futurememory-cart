import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { user, addWalletCredit } = useAuth();
  const { addNotification } = useNotifications();

  const getOrdersStorageKey = (u) => {
    if (!u || !u.email) return 'fm_orders_guest';
    return `fm_orders_${u.email.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
  };

  const loadOrdersForUser = (u) => {
    try {
      const key = getOrdersStorageKey(u);
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  };

  const [orders, setOrders] = useState(() => loadOrdersForUser(user));
  const [activeReturnOrder, setActiveReturnOrder] = useState(null);

  // Switch orders dynamically when the active customer logs in or out
  useEffect(() => {
    setOrders(loadOrdersForUser(user));
  }, [user?.email]);

  // Persist changes to the active customer's specific key
  useEffect(() => {
    try {
      const key = getOrdersStorageKey(user);
      localStorage.setItem(key, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders, user?.email]);

  // Create new order
  const placeOrder = (orderData) => {
    const deliveryEstimated = new Date();
    deliveryEstimated.setDate(deliveryEstimated.getDate() + 3);
    
    // Get setting directly from localStorage to ensure latest
    const notifPref = orderData?.notificationPreference || localStorage.getItem('fm_notif_pref') || 'whatsapp';

    const newOrder = {
      orderId: `FMC-2026-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
      orderDate: new Date().toISOString(),
      deliveryDate: deliveryEstimated.toISOString(),
      status: 'Received',
      trackingId: `TRK-FM-${Math.floor(100000 + Math.random() * 900000)}-IN`,
      ...orderData,
      notificationPreference: notifPref,
      email: orderData?.email || user?.email || localStorage.getItem('customer_email') || '',
      mobile: orderData?.mobile || user?.mobile || localStorage.getItem('customer_whatsapp_number') || '',
      customerName: orderData?.customerName || user?.name || 'Customer',
      shippingAddress: orderData?.shippingAddress || orderData?.deliveryAddress || {}
    };

    setOrders(prev => [newOrder, ...prev]);

    // Asynchronously sync order to backend MongoDB / Express database
    fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).catch(err => {
      console.warn('Backend DB sync notice:', err.message);
    });

    addNotification({
      title: 'Order Confirmed! ',
      message: `Order #${newOrder.orderId} placed successfully. Covered by 7-days Return Policy.`,
      type: 'order',
      link: '/order-history',
      silent: true // Only show in UI, don't send duplicate backend fetch (rich invoice handles it)
    });

    // Notification for placement
    if (addNotification) {
      addNotification({
        type: 'order',
        title: 'Order Placed',
        message: `Your order ${newOrder.orderId} for ₹${newOrder.totalAmount} has been placed successfully.`,
        relatedOrderId: newOrder.orderId
      });
    }
    return newOrder;
  };

  // Mark delivered instantly (useful for testing the 7-days return flow immediately)
  const markAsDelivered = (orderId) => {
    setOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        const now = new Date();
        const returnLimit = new Date(now.getTime() + (10 * 24 * 60 * 60 * 1000));
        return {
          ...order,
          status: 'Delivered',
          deliveryDate: now.toISOString(),
          items: order.items.map(it => ({
            ...it,
            returnEligibleUntil: returnLimit.toISOString()
          }))
        };
      }
      return order;
    }));

    addNotification({
      title: 'Package Delivered! ',
      message: `Order #${orderId} marked as delivered. 7-days Return window is now active.`,
      type: 'order',
      link: '/order-history'
    });
  };

  // Submit 7-days return request
  const requestReturn = (orderId, returnDetails) => {
    setOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        return {
          ...order,
          status: 'Return Requested',
          returnInfo: {
            returnId: `RET-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
            requestedAt: new Date().toISOString(),
            status: 'Return Requested',
            reason: returnDetails.reason,
            comments: returnDetails.comments,
            refundMode: returnDetails.refundMode,
            pickupDate: returnDetails.pickupDate,
            pickupSlot: returnDetails.pickupSlot || '10:00 AM - 01:00 PM',
            returnAmount: order.totalAmount,
            photoUrl: returnDetails.photoUrl || null
          }
        };
      }
      return order;
    }));

    addNotification({
      title: 'Return Request Received! ',
      message: `Return registered for Order #${orderId}. Reverse pickup scheduled for ${returnDetails.pickupDate}.`,
      type: 'order',
      link: '/order-history'
    });
  };

  // Admin approves return & schedules pickup
  const approveReturn = (orderId) => {
    setOrders(prev => prev.map(order => {
      if (order.orderId === orderId && order.returnInfo) {
        return {
          ...order,
          status: 'Pickup Scheduled',
          returnInfo: {
            ...order.returnInfo,
            status: 'Pickup Scheduled',
            approvedAt: new Date().toISOString(),
            courierPartner: 'Delhivery Express Reverse Logistics',
            agentName: 'Suresh M. (+91 94441 88920)'
          }
        };
      }
      return order;
    }));

    addNotification({
      title: 'Return Pickup Confirmed ',
      message: `Courier agent assigned for reverse pickup on Order #${orderId}.`,
      type: 'order',
      link: '/order-history'
    });
  };

  // Admin processes refund (either to Wallet with +5% bonus or original bank)
  const processRefund = (orderId) => {
    setOrders(prev => prev.map(order => {
      if (order.orderId === orderId && order.returnInfo) {
        const isWallet = order.returnInfo.refundMode === 'wallet';
        const baseAmount = order.returnInfo.returnAmount || order.totalAmount;
        const refundFinal = isWallet ? Math.round(baseAmount * 1.05) : baseAmount;

        if (isWallet) {
          addWalletCredit(refundFinal);
        }

        return {
          ...order,
          status: 'Refund Processed',
          returnInfo: {
            ...order.returnInfo,
            status: 'Refund Processed',
            refundedAt: new Date().toISOString(),
            finalRefundAmount: refundFinal,
            refundReference: `REF-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
          }
        };
      }
      return order;
    }));

    addNotification({
      title: 'Refund Issued! ',
      message: `Full refund has been processed for Order #${orderId}. Check your wallet/account.`,
      type: 'order',
      link: '/order-history'
    });
  };

  // Cancel order (before delivery)
  const cancelOrder = (orderId, reason = 'Customer requested cancellation') => {
    let refundAmount = 0;
    
    setOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        refundAmount = order.totalAmount || 0;
        return {
          ...order,
          status: 'Cancelled',
          orderStatus: 'Cancelled',
          cancelledAt: new Date().toISOString(),
          cancelReason: reason
        };
      }
      return order;
    }));
    
    if (addNotification) {
      addNotification({
        type: 'order',
        title: 'Order Cancelled',
        message: `Your order ${orderId} has been cancelled successfully.`,
        relatedOrderId: orderId
      });
    }

    setTimeout(() => {
      if (refundAmount > 0) {
        addWalletCredit(refundAmount);
        addNotification({
          title: 'Order Cancelled & Refunded ',
          message: `Order #${orderId} cancelled (${reason}). ₹${refundAmount.toLocaleString('en-IN')} has been refunded to your Wallet.`,
          type: 'order',
          link: '/order-history'
        });
      } else {
        addNotification({
          title: 'Order Cancelled ',
          message: `Order #${orderId} was cancelled successfully.`,
          type: 'order',
          link: '/order-history'
        });
      }
    }, 50);
  };

  // Direct status update (for Admin Dashboard)
  const updateOrderStatus = async (orderId, newStatus, channel) => {
    if (newStatus === 'Delivered') {
      markAsDelivered(orderId);
    } else {
      setOrders(prev => prev.map(order => {
        if (order.orderId === orderId) {
          return {
            ...order,
            status: newStatus
          };
        }
        return order;
      }));
    }

    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, channel })
      });
    } catch (e) {
      console.warn('Backend order status sync notice:', e);
    }
  };

  const notifyCustomerFromAdmin = async (orderId, channel, eventType) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, eventType: eventType || 'Status Update' })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Backend admin notify notice:', e);
      return { success: true, message: `Dispatched via ${channel} (Simulated)` };
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      placeOrder,
      markAsDelivered,
      requestReturn,
      approveReturn,
      processRefund,
      cancelOrder,
      updateOrderStatus,
      notifyCustomerFromAdmin,
      activeReturnOrder,
      setActiveReturnOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
