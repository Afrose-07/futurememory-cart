import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectMongoDB, getMongoStatus } from './config/db.mongo.js';
import { connectMySQL, getMySQLStatus } from './config/db.mysql.js';

import adminAuthRoutes from './routes/adminAuthRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { initWhatsAppBot, getLatestQr, getIsWaReady } from './services/whatsappBot.js';

// Load environment variables from the server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const DB_TYPE = (process.env.DB_TYPE || 'mongodb').toLowerCase();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static serving for persistent AI generated product images
const publicGeneratedPath = path.join(__dirname, '..', 'public', 'generated-products');
if (!fs.existsSync(publicGeneratedPath)) {
  fs.mkdirSync(publicGeneratedPath, { recursive: true });
}
app.use('/generated-products', express.static(publicGeneratedPath));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/admin', adminAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', userRoutes);

// Healthcheck & Database Status Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'FutureMemory Enterprise Express API',
    timestamp: new Date().toISOString(),
    configuredDatabase: DB_TYPE,
    databaseStatus: {
      mongodb: getMongoStatus() ? 'CONNECTED' : 'STANDBY / MEMORY FALLBACK',
      mysql: getMySQLStatus() ? 'CONNECTED' : 'STANDBY'
    },
    version: '1.0.0'
  });
});

// Visual WhatsApp QR Code Web Page
app.get('/qr', (req, res) => {
  const isReady = getIsWaReady();
  const qr = getLatestQr();

  if (isReady) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Bot - Connected</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0fdf4; }
          .card { background: white; padding: 40px; border-radius: 16px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.06); max-width: 440px; width: 90%; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-size: 4rem; margin-bottom: 12px;">✅</div>
          <h2 style="color: #15803d; margin: 0 0 10px 0;">WhatsApp Connected!</h2>
          <p style="color: #475569; font-size: 0.95rem; line-height: 1.5;">Your WhatsApp is linked with FutureMemory Cart Bot. Real WhatsApp order updates will now be sent automatically!</p>
          <a href="http://localhost:5173" style="display: inline-block; margin-top: 20px; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Open Storefront →</a>
        </div>
      </body>
      </html>
    `);
  }

  if (!qr) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Bot - Starting</title>
        <meta http-equiv="refresh" content="3">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
          .card { background: white; padding: 40px; border-radius: 16px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.06); max-width: 440px; width: 90%; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-size: 3rem; margin-bottom: 12px;">⏳</div>
          <h3 style="color: #334155; margin: 0 0 10px 0;">Generating WhatsApp QR Code...</h3>
          <p style="color: #64748b; font-size: 0.9rem;">Please wait a moment. This page will refresh automatically in 3 seconds.</p>
        </div>
      </body>
      </html>
    `);
  }

  const qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qr);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Scan WhatsApp QR Code</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta http-equiv="refresh" content="25">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; padding: 20px; box-sizing: border-box; }
        .card { background: white; padding: 32px 24px; border-radius: 20px; text-align: center; box-shadow: 0 12px 32px rgba(0,0,0,0.08); max-width: 440px; width: 100%; border: 1px solid #e2e8f0; }
        .qr-box { background: #ffffff; padding: 14px; border: 2px dashed #22c55e; border-radius: 14px; display: inline-block; margin: 18px 0; }
        .steps { text-align: left; background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 18px; font-size: 0.88rem; color: #334155; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="card">
        <div style="font-size: 2.8rem; margin-bottom: 8px;">📱</div>
        <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 1.4rem;">Link WhatsApp Bot</h2>
        
        <div class="steps">
          1. உங்கள் போனில் <strong>WhatsApp</strong> திறக்கவும்<br>
          2. <strong>Settings ➔ Linked Devices</strong> செல்லவும்<br>
          3. <strong>Link a Device</strong> கொடுத்து கீழே உள்ள QR-ஐ Scan செய்யவும்:
        </div>

        <div class="qr-box">
          <img src="${qrImageUrl}" alt="WhatsApp QR Code" style="width: 250px; height: 250px; display: block; border-radius: 8px;" />
        </div>

        <p style="color: #94a3b8; font-size: 0.78rem; margin: 0;">
          QR Code 25 விநாடிகளுக்கு ஒருமுறை தானாக Refresh ஆகும்.
        </p>
      </div>
    </body>
    </html>
  `);
});

// Root check
app.get('/', (req, res) => {
  res.json({
    message: 'FutureMemory Cart Backend API is active',
    adminLoginEndpoint: '/api/admin/login',
    productsEndpoint: '/api/products',
    ordersEndpoint: '/api/orders',
    whatsappQr: '/qr',
    healthCheck: '/api/health'
  });
});

// Process-Level Exception Handlers to keep backend always running
process.on('uncaughtException', (err) => {
  console.warn('⚠️ [Server Process Warning - uncaughtException]:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.warn('⚠️ [Server Process Warning - unhandledRejection]:', reason?.message || reason);
});

// Start Server & Connect Database
app.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🚀 FutureMemory Cart Backend running on http://localhost:${PORT}`);
  console.log(`📡 Healthcheck & DB Status: http://localhost:${PORT}/api/health`);
  console.log(`======================================================`);

  try {
    if (DB_TYPE === 'mongodb') {
      await connectMongoDB();
    } else if (DB_TYPE === 'mysql') {
      await connectMySQL();
    } else {
      console.log(`ℹ️ [Database] Running with high-performance in-memory data store.`);
    }
  } catch (dbErr) {
    console.warn('⚠️ [Database Notice]: Running with memory fallback.');
  }

  // Initialize WhatsApp Bot safely
  try {
    initWhatsAppBot();
  } catch (waErr) {
    console.warn('⚠️ [WhatsApp Bot Init Notice]:', waErr.message);
  }
});
