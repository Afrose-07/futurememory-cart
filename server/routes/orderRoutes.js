import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { getMongoStatus } from '../config/db.mongo.js';
import { sendOrderConfirmationWhatsApp } from '../services/whatsappService.js';
import { dispatchNotification } from '../services/notificationService.js';

const router = express.Router();

// Fallback in-memory orders store
let memoryOrders = [
  {
    orderId: 'FM-984210',
    trackingId: 'TRK-984210-EXP',
    items: [
      {
        id: 'prod_1',
        name: 'Classic Chronograph Royal Blue Watch',
        price: 3499,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500'
      }
    ],
    totalAmount: 3499,
    shippingAddress: {
      fullName: 'Karthik Raja',
      mobile: '+91 98401 23456',
      addressLine: 'Flat 4B, Emerald Heights, T.Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017'
    },
    paymentMethod: 'UPI',
    status: 'Delivered',
    deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    if (getMongoStatus()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      if (orders.length > 0) {
        return res.json({ success: true, count: orders.length, orders });
      }
    }
    return res.json({ success: true, count: memoryOrders.length, orders: memoryOrders });
  } catch (err) {
    console.error('Fetch orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// POST /api/orders (Customer creates order)
router.post('/', async (req, res) => {
  try {
    const { 
      items, 
      totalAmount, 
      shippingAddress, 
      deliveryAddress, 
      paymentMethod, 
      email, 
      mobile, 
      customerName, 
      orderId: reqOrderId, 
      trackingId: reqTrackingId, 
      notificationPreference: reqNotificationPreference 
    } = req.body;

    const orderId = reqOrderId || ('FM-' + Math.floor(100000 + Math.random() * 900000));
    const trackingId = reqTrackingId || ('TRK-' + orderId + '-EXP');

    const finalAddress = shippingAddress || deliveryAddress || {};
    const finalEmail = email || finalAddress.email;
    const finalMobile = mobile || finalAddress.mobile || finalAddress.phone;
    const finalCustomerName = customerName || finalAddress.fullName || 'Customer';
    const finalPref = reqNotificationPreference || 'email';

    const orderPayload = {
      orderId,
      trackingId,
      items: items || [],
      totalAmount: totalAmount || 0,
      shippingAddress: { ...finalAddress, email: finalEmail, mobile: finalMobile, fullName: finalCustomerName },
      paymentMethod: paymentMethod || 'UPI',
      status: 'Placed',
      email: finalEmail,
      mobile: finalMobile,
      customerName: finalCustomerName,
      notificationPreference: finalPref,
      createdAt: new Date()
    };

    // Automated server-side WhatsApp dispatch
    const notifResult = await dispatchNotification(orderPayload, 'Placed');
    orderPayload.notificationStatus = notifResult;
    if (getMongoStatus()) {
      const newOrder = new Order(orderPayload);
      await newOrder.save();
      return res.status(201).json({ success: true, order: newOrder, notifications: notifResult });
    }

    memoryOrders.unshift(orderPayload);
    return res.status(201).json({ success: true, order: orderPayload, notifications: notifResult });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// POST /api/orders/:id/whatsapp (Resend WhatsApp Invoice)
router.post('/:id/whatsapp', async (req, res) => {
  try {
    const { id } = req.params;
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

    const waResult = await sendOrderConfirmationWhatsApp(orderPayload);
    return res.status(200).json({ success: true, whatsapp: waResult });
  } catch (err) {
    console.error('WhatsApp resend error:', err);
    return res.status(500).json({ success: false, message: 'Failed to resend WhatsApp' });
  }
});

// POST /api/orders/:id/resend-email (Resend email confirmation to customer)
router.post('/:id/resend-email', async (req, res) => {
  try {
    const { id } = req.params;
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

    const targetEmail = req.body.email || orderPayload.email || orderPayload.shippingAddress?.email || orderPayload.deliveryAddress?.email;
    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'No email address found for this order' });
    }

    const dispatchOrder = {
      ...(orderPayload.toObject ? orderPayload.toObject() : orderPayload),
      email: targetEmail,
      notificationPreference: 'email'
    };

    const notifResult = await dispatchNotification(dispatchOrder, 'Invoice & Confirmation');
    return res.status(200).json({ success: true, delivered: notifResult.email === 'SENT', notifResult, message: `Real email dispatched to ${targetEmail}` });
  } catch (err) {
    console.error('Email resend error:', err);
    return res.status(500).json({ success: false, message: 'Failed to resend email' });
  }
});

// POST /api/orders/send-email (Direct email trigger with order data)
router.post('/send-email', async (req, res) => {
  try {
    const orderData = req.body;
    const targetEmail = orderData.email || orderData.shippingAddress?.email || orderData.deliveryAddress?.email;
    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    const notifResult = await dispatchNotification({
      ...orderData,
      email: targetEmail,
      notificationPreference: 'email'
    }, 'Placed');

    return res.status(200).json({ success: true, delivered: notifResult.email === 'SENT', notifResult, message: `Real email dispatched to ${targetEmail}` });
  } catch (err) {
    console.error('Direct order email dispatch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to dispatch email' });
  }
});

// PUT /api/orders/:id/status (Admin updates status e.g. Shipped, Delivered)
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
});

// PUT /api/orders/:id/return (Customer requests or Admin processes 7-days return)
router.put('/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, returnDetails } = req.body; // action: 'request', 'approve_pickup', 'issue_refund'

    let statusUpdate = {};
    if (action === 'request') {
      statusUpdate = {
        status: 'Return Requested',
        returnInfo: {
          returnId: 'RET-' + Math.floor(1000 + Math.random() * 9000),
          requestedAt: new Date(),
          ...returnDetails
        }
      };
    } else if (action === 'approve_pickup') {
      statusUpdate = {
        status: 'Pickup Scheduled',
        'returnInfo.approvedAt': new Date(),
        'returnInfo.pickupDate': 'Tomorrow',
        'returnInfo.courierPartner': 'Delhivery Express Reverse Logistics'
      };
    } else if (action === 'issue_refund') {
      statusUpdate = {
        status: 'Refund Processed',
        'returnInfo.refundedAt': new Date(),
        'returnInfo.refundReference': 'REF-' + Math.floor(100000 + Math.random() * 900000)
      };
    }

    if (getMongoStatus()) {
      const updated = await Order.findOneAndUpdate(
        { $or: [{ orderId: id }, { _id: id }] },
        statusUpdate,
        { new: true }
      );
      if (updated) {
        return res.json({ success: true, order: updated });
      }
    }

    // In-memory fallback
    memoryOrders = memoryOrders.map(o => {
      if (o.orderId === id) {
        const curInfo = o.returnInfo || {};
        return {
          ...o,
          status: statusUpdate.status || o.status,
          returnInfo: {
            ...curInfo,
            ...(statusUpdate.returnInfo || {}),
            ...(action === 'issue_refund' ? { refundReference: 'REF-' + Math.floor(100000 + Math.random() * 900000) } : {})
          }
        };
      }
      return o;
    });

    const found = memoryOrders.find(o => o.orderId === id);
    return res.json({ success: true, order: found });
  } catch (err) {
    console.error('Return process error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process return' });
  }
});

export default router;
