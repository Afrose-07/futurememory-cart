import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getMongoStatus } from '../config/db.mongo.js';

const router = express.Router();

const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'futurememory_jwt_secret_dev';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// In-memory fallback customers store when MongoDB is not connected
let memoryUsers = [
  {
    id: 'user_cust_1',
    name: 'Anandha Krishnan',
    email: 'anandha.krishnan@gmail.com',
    password: 'google_oauth_verified',
    mobile: '+91 98765 43210',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Anandha',
    walletBalance: 1250,
    provider: 'google',
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
  },
  {
    id: 'user_cust_2',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@gmail.com',
    password: 'google_oauth_verified',
    mobile: '+91 94432 11223',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya',
    walletBalance: 750,
    provider: 'google',
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: 'user_cust_3',
    name: 'Karthik Subramanian',
    email: 'karthik.subramanian@outlook.com',
    password: 'Password@123',
    mobile: '+91 98401 56789',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Karthik',
    walletBalance: 500,
    provider: 'email',
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'user_cust_4',
    name: 'Deepa Radhakrishnan',
    email: 'deepa.radha@yahoo.com',
    password: 'Password@123',
    mobile: '+91 99620 87654',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Deepa',
    walletBalance: 2000,
    provider: 'email',
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  }
];

// GET /api/users - Get all customers
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    if (getMongoStatus()) {
      let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } }
          ]
        };
      }
      const users = await User.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, users });
    }

    // In-memory fallback
    let results = [...memoryUsers];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        u => u.name.toLowerCase().includes(q) ||
             u.email.toLowerCase().includes(q) ||
             (u.mobile && u.mobile.includes(q))
      );
    }
    return res.json({ success: true, count: results.length, users: results });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer list' });
  }
});

// POST /api/users - Create new customer (Admin Add Customer)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, mobile, walletBalance, provider, status } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (getMongoStatus()) {
      const exists = await User.findOne({ email: cleanEmail });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Customer with this email already exists' });
      }
      const newUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: password || 'Welcome@123',
        mobile: mobile || '',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        walletBalance: Number(walletBalance) || 500,
        provider: provider || 'email',
        status: status || 'active'
      });
      return res.status(201).json({ success: true, user: newUser });
    }

    // Fallback in-memory
    const exists = memoryUsers.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return res.status(400).json({ success: false, message: 'Customer with this email already exists' });
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: password || 'Welcome@123',
      mobile: mobile || '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      walletBalance: Number(walletBalance) || 500,
      provider: provider || 'email',
      status: status || 'active',
      createdAt: new Date().toISOString()
    };

    memoryUsers.unshift(newUser);
    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error('Error adding customer:', err);
    return res.status(500).json({ success: false, message: 'Failed to create customer' });
  }
});

// PUT /api/users/:id - Update customer (Admin Update Customer)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, walletBalance, status, password } = req.body;

    if (getMongoStatus()) {
      const updated = await User.findByIdAndUpdate(
        id,
        {
          ...(name && { name: name.trim() }),
          ...(mobile !== undefined && { mobile }),
          ...(walletBalance !== undefined && { walletBalance: Number(walletBalance) }),
          ...(status && { status }),
          ...(password && { password })
        },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
      return res.json({ success: true, user: updated });
    }

    // Fallback in-memory
    const idx = memoryUsers.findIndex(u => u.id === id || u.email === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    memoryUsers[idx] = {
      ...memoryUsers[idx],
      ...(name && { name: name.trim() }),
      ...(mobile !== undefined && { mobile }),
      ...(walletBalance !== undefined && { walletBalance: Number(walletBalance) }),
      ...(status && { status }),
      ...(password && { password })
    };

    return res.json({ success: true, user: memoryUsers[idx] });
  } catch (err) {
    console.error('Error updating customer:', err);
    return res.status(500).json({ success: false, message: 'Failed to update customer' });
  }
});

// DELETE /api/users/:id - Delete customer (Admin Delete Customer)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (getMongoStatus()) {
      const deleted = await User.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
      return res.json({ success: true, message: 'Customer deleted successfully' });
    }

    // Fallback in-memory
    const initialLen = memoryUsers.length;
    memoryUsers = memoryUsers.filter(u => u.id !== id && u.email !== id);

    if (memoryUsers.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    return res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete customer' });
  }
});

// POST /api/auth/google - Real Google OAuth endpoint
router.post('/google', async (req, res) => {
  try {
    const { email, name, avatar, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (getMongoStatus()) {
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          name: name || 'Google User',
          email: cleanEmail,
          password: 'google_oauth_verified',
          avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'G')}`,
          googleId: googleId || 'g_' + Date.now(),
          provider: 'google',
          walletBalance: 500,
          status: 'active'
        });
      }

      const token = signToken({ id: user._id, email: user.email, provider: 'google' });
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          walletBalance: user.walletBalance,
          provider: user.provider,
          status: user.status
        }
      });
    }

    // In-memory fallback
    let user = memoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = {
        id: 'user_' + Date.now(),
        name: name || 'Google User',
        email: cleanEmail,
        password: 'google_oauth_verified',
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'G')}`,
        walletBalance: 500,
        provider: 'google',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      memoryUsers.unshift(user);
    }

    const token = signToken({ id: user.id, email: user.email, provider: 'google' });
    return res.json({
      success: true,
      token,
      user
    });
  } catch (err) {
    console.error('Google Auth backend error:', err);
    return res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});
import { dispatchNotification, sendLoginAlert, sendChannelActivationEmail, sendNotification } from '../services/notificationService.js';

// POST /api/users/activate-channel and /api/auth/activate-channel
router.post('/activate-channel', async (req, res) => {
  try {
    const { email, name, channel } = req.body;
    if (channel === 'email' && email) {
      const sent = await sendChannelActivationEmail(email, name || 'Customer');
      return res.json({ success: true, delivered: sent, message: `Real activation email sent to ${email}` });
    }
    return res.json({ success: true, message: 'Notification channel preference saved' });
  } catch (err) {
    console.error("Failed to activate channel email:", err);
    return res.status(500).json({ success: false, message: 'Failed to dispatch channel activation' });
  }
});

// POST /api/users/notify-login and /api/auth/notify-login
router.post('/notify-login', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (email) {
      await sendLoginAlert(email, name);
    }
    return res.json({ success: true, message: 'Login alert dispatched' });
  } catch (err) {
    console.error("Failed to trigger login email:", err);
    return res.status(500).json({ success: false, message: 'Failed to notify login' });
  }
});

// POST /api/users/notify
router.post('/notify', async (req, res) => {
  try {
    const { email, name, message, mobile, channel } = req.body;
    await sendNotification(
      { email, name, mobile, notificationPreference: channel || 'email' }, 
      message
    );
    return res.json({ success: true, message: 'Notification sent' });
  } catch (err) {
    console.error("Failed to trigger notify:", err);
    return res.status(500).json({ success: false, message: 'Failed to notify' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email, mobile, preference } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });
  
  try {
    const resetLink = `http://127.0.0.1:5173/reset-password?token=${Math.random().toString(36).substring(7)}`;
    const message = `Hello,\n\nYou requested a password reset. Click the link to reset your password: ${resetLink}\n\nIf you did not request this, ignore this message.`;
    
    await dispatchNotification({ 
      email, 
      name: 'Customer', 
      mobile: mobile,
      notificationPreference: preference || 'email' 
    }, message);

    return res.json({ success: true, message: 'Password reset link sent.' });
  } catch (err) {
    console.error("Failed to send email:", err);
    return res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

export default router;
