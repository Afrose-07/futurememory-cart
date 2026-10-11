import mongoose from 'mongoose';

const NotificationLogSchema = new mongoose.Schema({
  notificationId: { type: String, required: true },
  orderId: { type: String, required: true },
  customerId: { type: String },
  channel: { type: String, enum: ['EMAIL', 'WHATSAPP', 'IN_APP'], required: true },
  eventType: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'SENT', 'FAILED', 'SKIPPED'], default: 'PENDING' },
  errorMessage: { type: String },
  sentAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.NotificationLog || mongoose.model('NotificationLog', NotificationLogSchema);
