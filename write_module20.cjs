const fs = require('fs');
const path = require('path');

// 1. Create server/models/NotificationLog.js
const notifLogCode = `import mongoose from 'mongoose';

const NotificationLogSchema = new mongoose.Schema({
  notificationId: { type: String, required: true },
  orderId: { type: String, required: true },
  customerId: { type: String },
  channel: { type: String, enum: ['EMAIL', 'WHATSAPP', 'IN_APP'], required: true },
  eventType: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
  errorMessage: { type: String },
  sentAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.NotificationLog || mongoose.model('NotificationLog', NotificationLogSchema);
`;
fs.mkdirSync('server/models', { recursive: true });
fs.writeFileSync('server/models/NotificationLog.js', notifLogCode);

// 2. Rewrite server/services/notificationService.js
const notificationServiceCode = `import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import NotificationLog from '../models/NotificationLog.js';
import { getMongoStatus } from '../config/db.mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isDev = process.env.NOTIFICATION_MODE !== 'production';

let emailTransporter = null;

const initEmail = async () => {
  try {
    if (isDev && !process.env.EMAIL_HOST) {
      console.log(\`[Email Setup] DEVELOPMENT MODE: Using Ethereal Mail\`);
      const testAccount = await nodemailer.createTestAccount();
      emailTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      console.log(\`[Email Setup] PRODUCTION MODE: Real SMTP\`);
      emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  } catch (error) {
    console.error("[Email Setup] Failed:", error);
  }
};
initEmail();

const formatPhone = (mobile) => {
  if (!mobile) return null;
  const digits = mobile.replace(/\\D/g, '');
  if (digits.length === 10) return \`91\${digits}\`;
  return digits;
};

const sendMetaWhatsApp = async (phone, templateName, components) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_API_VERSION || 'v18.0';

  if (!token || !phoneId) {
    throw new Error('WhatsApp Cloud API credentials missing.');
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en' },
      components: components
    }
  };

  const res = await fetch(\`https://graph.facebook.com/\${version}/\${phoneId}/messages\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Unknown WhatsApp API error');
  return data;
};

export const dispatchNotification = async (order, eventType) => {
  const email = order.email || order.shippingAddress?.email;
  const mobile = formatPhone(order.shippingAddress?.mobile || order.mobile);
  const orderId = order.orderId;
  const customerId = order.customerId || 'guest';
  const customerName = order.customerName || order.shippingAddress?.fullName || 'Customer';

  console.log(\`\\n================ NOTIFICATION ENGINE ================\`);
  console.log(\`Event: \${eventType} | Order: \${orderId}\`);
  console.log(\`Mode: \${isDev ? 'DEVELOPMENT (Simulated)' : 'PRODUCTION (Real)'}\`);

  // 1. Email Logic
  let emailStatus = 'PENDING';
  let emailError = null;
  try {
    if (email && emailTransporter) {
      if (isDev) {
        console.log(\`[Email] DEV MODE: Simulating email to \${email}\`);
        emailStatus = 'SENT';
      } else {
        await emailTransporter.sendMail({
          from: \`"FutureMemory Cart" <\${process.env.EMAIL_FROM || process.env.EMAIL_USER}>\`,
          to: email,
          subject: \`FutureMemory Cart - Order \${eventType}\`,
          html: \`
            <div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2>Order \${eventType}</h2>
              <p>Hello \${customerName},</p>
              <p>Your order <strong>\${orderId}</strong> has been \${eventType.toLowerCase()}.</p>
              <p>Total Amount: ₹\${order.totalAmount}</p>
              <p>Status: <strong>\${order.status || eventType}</strong></p>
              <p>Thank you for shopping with FutureMemory Cart!</p>
            </div>
          \`
        });
        emailStatus = 'SENT';
        console.log(\`✅ [Email] Real email dispatched to \${email}\`);
      }
    } else {
      emailStatus = 'FAILED';
      emailError = 'No email provided or transporter not ready';
    }
  } catch (err) {
    emailStatus = 'FAILED';
    emailError = err.message;
    console.error(\`❌ [Email] Failed:\`, err.message);
  }

  // 2. WhatsApp Logic
  let waStatus = 'PENDING';
  let waError = null;
  try {
    if (mobile) {
      if (isDev) {
        console.log(\`[WhatsApp] DEV MODE: Simulating WhatsApp to +\${mobile}\`);
        waStatus = 'SENT';
      } else {
        const templateMapping = {
          'Placed': 'order_placed',
          'Confirmed': 'order_confirmed',
          'Shipped': 'order_shipped',
          'Out for Delivery': 'order_out_for_delivery',
          'Delivered': 'order_delivered',
          'Cancelled': 'order_cancelled'
        };
        const templateName = templateMapping[eventType] || 'order_placed';
        
        // Example components mapping
        const components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: customerName },
              { type: 'text', text: orderId },
              { type: 'text', text: \`₹\${order.totalAmount}\`}
            ]
          }
        ];
        
        await sendMetaWhatsApp(mobile, templateName, components);
        waStatus = 'SENT';
        console.log(\`✅ [WhatsApp] Real WhatsApp dispatched to +\${mobile}\`);
      }
    } else {
      waStatus = 'FAILED';
      waError = 'No valid mobile number provided';
    }
  } catch (err) {
    waStatus = 'FAILED';
    waError = err.message;
    console.error(\`❌ [WhatsApp] Failed:\`, err.message);
  }

  // 3. Database Logging
  if (getMongoStatus()) {
    try {
      if (emailStatus !== 'PENDING') {
        await NotificationLog.create({
          notificationId: \`NOTIF-\${Date.now()}-EM\`,
          orderId, customerId, channel: 'EMAIL', eventType, status: emailStatus, errorMessage: emailError, sentAt: emailStatus === 'SENT' ? new Date() : null
        });
      }
      if (waStatus !== 'PENDING') {
        await NotificationLog.create({
          notificationId: \`NOTIF-\${Date.now()}-WA\`,
          orderId, customerId, channel: 'WHATSAPP', eventType, status: waStatus, errorMessage: waError, sentAt: waStatus === 'SENT' ? new Date() : null
        });
      }
    } catch (dbErr) {
      console.error('Failed to log notifications to DB:', dbErr.message);
    }
  }
  
  console.log(\`=====================================================\\n\`);
  
  return { email: emailStatus, whatsapp: waStatus };
};
`;
fs.writeFileSync('server/services/notificationService.js', notificationServiceCode);

// 3. Update server/routes/orderRoutes.js to use dispatchNotification
let orderRoutesCode = fs.readFileSync('server/routes/orderRoutes.js', 'utf8');

// Replace old imports
orderRoutesCode = orderRoutesCode.replace(
  "import { sendOrderConfirmationWhatsApp } from '../services/whatsappService.js';\nimport { sendNotification } from '../services/notificationService.js';",
  "import { dispatchNotification } from '../services/notificationService.js';"
);

// Update POST /api/orders
orderRoutesCode = orderRoutesCode.replace(
  /const waResult = await sendOrderConfirmationWhatsApp\(orderPayload\);\s*orderPayload\.whatsappDispatch = waResult;\s*\/\/[^\n]*\s*\/\/[^\n]*\s*/,
  `const notifResult = await dispatchNotification(orderPayload, 'Placed');
    orderPayload.notificationStatus = notifResult;
    `
);
orderRoutesCode = orderRoutesCode.replace(
  /return res\.status\(201\)\.json\(\{ success: true, order: newOrder, whatsapp: waResult \}\);/,
  `return res.status(201).json({ success: true, order: newOrder, notifications: notifResult });`
);
orderRoutesCode = orderRoutesCode.replace(
  /return res\.status\(201\)\.json\(\{ success: true, order: orderPayload, whatsapp: waResult \}\);/,
  `return res.status(201).json({ success: true, order: orderPayload, notifications: notifResult });`
);

// Update PUT /api/orders/:id/status
if (orderRoutesCode.includes('// TODO: Trigger notifications')) {
  orderRoutesCode = orderRoutesCode.replace(
    /let oldStatus = memoryOrders\[orderIndex\]\.status;\s*memoryOrders\[orderIndex\]\.status = status;\s*\/\/ TODO: Trigger notifications/,
    `let oldStatus = memoryOrders[orderIndex].status;
        memoryOrders[orderIndex].status = status;
        
        if (oldStatus !== status) {
          await dispatchNotification(memoryOrders[orderIndex], status);
        }`
  );
  orderRoutesCode = orderRoutesCode.replace(
    /order\.status = status;\s*await order\.save\(\);\s*\/\/ TODO: Trigger notifications/,
    `order.status = status;
        await order.save();
        
        await dispatchNotification(order, status);`
  );
}

fs.writeFileSync('server/routes/orderRoutes.js', orderRoutesCode);

// 4. Update .env.example
const envExample = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/futurememory
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=futurememory
JWT_SECRET=your_jwt_secret_here

# Notification Mode (development | production)
NOTIFICATION_MODE=development

# Email Configuration
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=

# WhatsApp Cloud API Configuration
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_API_VERSION=v18.0
`;
fs.writeFileSync('server/.env.example', envExample);
fs.writeFileSync('server/.env', envExample); // Write default to .env for dev

console.log('Successfully completed Module 20 implementation.');
