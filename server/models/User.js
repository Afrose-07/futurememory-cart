import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  walletBalance: {
    type: Number,
    default: 500
  },
  provider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  googleId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  notificationPreference: {
    type: String,
    enum: ['email', 'whatsapp', 'sms'],
    default: 'email'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
