const fs = require('fs');
let c = fs.readFileSync('server/routes/orderRoutes.js', 'utf8');

const targetOld = `// PUT /api/orders/:id/status (Admin updates status e.g. Shipped, Delivered)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updates = { status };
    if (status === 'Delivered') {
      updates.deliveredAt = new Date();
    }

    if (getMongoStatus()) {
      const updated = await Order.findOneAndUpdate(
        { $or: [{ orderId: id }, { _id: id }] },
        updates,
        { new: true }
      );
      if (updated) {
        return res.json({ success: true, order: updated });
      }
    }

    // In-memory fallback
    memoryOrders = memoryOrders.map(o => {
      if (o.orderId === id) {
        return { ...o, ...updates };
      }
      return o;
    });

    const found = memoryOrders.find(o => o.orderId === id);
    return res.json({ success: true, order: found });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});`;

const targetNew = `// PUT /api/orders/:id/status (Admin updates status e.g. Shipped, Delivered)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, channel } = req.body;

    const updates = { status };
    if (status === 'Delivered') {
      updates.deliveredAt = new Date();
    }

    let targetOrder = null;
    if (getMongoStatus()) {
      targetOrder = await Order.findOneAndUpdate(
        { $or: [{ orderId: id }, { _id: id }] },
        updates,
        { new: true }
      );
    } else {
      memoryOrders = memoryOrders.map(o => {
        if (o.orderId === id) {
          return { ...o, ...updates };
        }
        return o;
      });
      targetOrder = memoryOrders.find(o => o.orderId === id);
    }

    if (targetOrder) {
      const orderCopy = { 
        ...(targetOrder.toObject ? targetOrder.toObject() : targetOrder),
        notificationPreference: channel || targetOrder.notificationPreference || 'whatsapp'
      };
      await dispatchNotification(orderCopy, status);
      return res.json({ success: true, order: targetOrder });
    }

    return res.status(404).json({ success: false, message: 'Order not found' });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// POST /api/orders/:id/notify (Admin directly dispatches notification via WhatsApp or Email)
router.post('/:id/notify', async (req, res) => {
  try {
    const { id } = req.params;
    const { channel = 'whatsapp', eventType = 'Status Update' } = req.body;

    let orderPayload = null;
    if (getMongoStatus()) {
      orderPayload = await Order.findOne({ $or: [{ orderId: id }, { _id: id }] });
    }
    if (!orderPayload) {
      orderPayload = memoryOrders.find(o => o.orderId === id);
    }
    if (!orderPayload) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderCopy = {
      ...(orderPayload.toObject ? orderPayload.toObject() : orderPayload),
      notificationPreference: channel
    };

    const notifResult = await dispatchNotification(orderCopy, eventType);
    return res.status(200).json({ 
      success: true, 
      message: 'Notification sent via ' + channel.toUpperCase() + '!', 
      channel, 
      result: notifResult 
    });
  } catch (err) {
    console.error('Admin notify error:', err);
    return res.status(500).json({ success: false, message: 'Failed to dispatch notification' });
  }
});`;

c = c.replace(/\r\n/g, '\n');
const targetOldClean = targetOld.replace(/\r\n/g, '\n');
if (c.includes(targetOldClean)) {
  c = c.replace(targetOldClean, targetNew);
  fs.writeFileSync('server/routes/orderRoutes.js', c, 'utf8');
  console.log('Successfully updated orderRoutes.js');
} else {
  console.error('Target not found in orderRoutes.js');
}
