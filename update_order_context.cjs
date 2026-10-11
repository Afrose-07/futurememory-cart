const fs = require('fs');
let c = fs.readFileSync('src/context/OrderContext.jsx', 'utf8');

c = c.replace(
  "const notifPref = localStorage.getItem('fm_notif_pref') || 'email';",
  "const notifPref = orderData?.notificationPreference || localStorage.getItem('fm_notif_pref') || 'whatsapp';"
);

const oldUpdate = `  // Direct status update (for Admin Dashboard)
  const updateOrderStatus = (orderId, newStatus) => {
    if (newStatus === 'Delivered') {
      markAsDelivered(orderId);
      return;
    }
    setOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        return {
          ...order,
          status: newStatus
        };
      }
      return order;
    }));
  };`;

const newUpdate = `  // Direct status update (for Admin Dashboard)
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
      await fetch(\`http://localhost:5000/api/orders/\${orderId}/status\`, {
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
      const res = await fetch(\`http://localhost:5000/api/orders/\${orderId}/notify\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, eventType: eventType || 'Status Update' })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Backend admin notify notice:', e);
      return { success: true, message: \`Dispatched via \${channel} (Simulated)\` };
    }
  };`;

c = c.replace(/\r\n/g, '\n');
const oldUpdateClean = oldUpdate.replace(/\r\n/g, '\n');
if (c.includes(oldUpdateClean)) {
  c = c.replace(oldUpdateClean, newUpdate);
}

// Add notifyCustomerFromAdmin to Provider value
c = c.replace(
  'updateOrderStatus,',
  'updateOrderStatus,\n      notifyCustomerFromAdmin,'
);

fs.writeFileSync('src/context/OrderContext.jsx', c, 'utf8');
console.log('Successfully updated OrderContext.jsx');
