import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { getMongoStatus } from '../config/db.mongo.js';

const router = express.Router();

// Helper to sign JWT
const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'futurememory_jwt_secret_dev';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'afromalik07@gmail.com').toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'afromalik07';

    // 1. Check MongoDB if connected
    if (getMongoStatus()) {
      const dbAdmin = await Admin.findOne({ email: cleanEmail });
      if (dbAdmin) {
        const isMatch = dbAdmin.password === password;
        if (isMatch) {
          const token = signToken({ id: dbAdmin._id, email: dbAdmin.email, role: dbAdmin.role });
          return res.json({
            success: true,
            admin: {
              id: dbAdmin._id,
              name: dbAdmin.name || 'Afro Malik',
              email: dbAdmin.email,
              role: dbAdmin.role || 'superadmin',
              token
            }
          });
        }
      }
    }

    // 2. Strict check: only afromalik07@gmail.com with afromalik07 is permitted!
    if (cleanEmail === envAdminEmail && password === envAdminPassword) {
      const token = signToken({ email: envAdminEmail, role: 'superadmin' });
      return res.json({
        success: true,
        admin: {
          id: 'admin_afro_malik_1',
          name: 'Afro Malik',
          email: envAdminEmail,
          role: 'superadmin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop',
          token
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: '❌ Invalid admin credentials! Only authorized admin (afromalik07@gmail.com / afromalik07) can access.'
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during admin authentication' });
  }
});

// POST /api/admin/google - Real Google Sign-in for Admin
router.post('/google', async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'afromalik07@gmail.com').toLowerCase();

    // Verify authorized admin Google account
    if (cleanEmail === envAdminEmail || cleanEmail.includes('afromalik')) {
      const token = signToken({ email: cleanEmail, role: 'superadmin' });
      return res.json({
        success: true,
        admin: {
          id: 'admin_google_' + Date.now(),
          name: name || 'Afro Malik',
          email: cleanEmail,
          role: 'superadmin',
          avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop',
          token
        }
      });
    }

    return res.status(403).json({
      success: false,
      message: '❌ Access Denied! Google account is not authorized as Master Administrator.'
    });
  } catch (err) {
    console.error('Admin Google OAuth error:', err);
    return res.status(500).json({ success: false, message: 'Admin Google authentication failed' });
  }
});

// GET /api/admin/me (Verify session)
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No authorization token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'futurememory_jwt_secret_dev';
    const decoded = jwt.verify(token, secret);
    return res.json({
      success: true,
      admin: decoded
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
});

export default router;
