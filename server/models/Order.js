import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  image: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  trackingId: {
    type: String
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    fullName: String,
    mobile: String,
    addressLine: String,
    city: String,
    pincode: String,
    state: String
  },
  paymentMethod: {
    type: String,
    default: 'UPI'
  },
  status: {
    type: String,
    enum: [
      'Placed',
      'Processing',
      'Shipped',
      'Delivered',
      'Return Requested',
      'Pickup Scheduled',
      'Refund Processed',
      'Cancelled'
    ],
    default: 'Placed'
  },
  deliveredAt: Date,
  returnInfo: {
    returnId: String,
    reason: String,
    comments: String,
    refundMode: String,
    photoUrl: String,
    pickupDate: String,
    pickupSlot: String,
    courierPartner: String,
    requestedAt: Date,
    approvedAt: Date,
    refundReference: String,
    refundedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
