const fs = require('fs');

const botCode = `import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

let waClient = null;
let isWaReady = false;

export const initWhatsAppBot = () => {
    console.log('[WhatsApp Bot] Initializing Client...');
    waClient = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    waClient.on('qr', (qr) => {
        console.log('\\n======================================================');
        console.log('📱 SCAN THIS QR CODE WITH YOUR WHATSAPP TO LINK BOT 📱');
        console.log('======================================================\\n');
        qrcode.generate(qr, { small: true });
    });

    waClient.on('ready', () => {
        console.log('✅ [WhatsApp Bot] Connected and ready to send messages!');
        isWaReady = true;
    });

    waClient.on('disconnected', (reason) => {
        console.log('❌ [WhatsApp Bot] Disconnected:', reason);
        isWaReady = false;
    });

    waClient.initialize().catch(err => {
        console.error('[WhatsApp Bot] Init Error:', err);
    });
};

export const sendBotWhatsApp = async (phone, message) => {
    if (!isWaReady || !waClient) {
        throw new Error('WhatsApp Bot is not ready yet. Please scan the QR code in terminal.');
    }
    // phone format: 919876543210
    const chatId = \`\${phone}@c.us\`;
    await waClient.sendMessage(chatId, message);
    return true;
};
`;

fs.writeFileSync('server/services/whatsappBot.js', botCode);

// Now update notificationService.js to use whatsappBot.js
let notifCode = fs.readFileSync('server/services/notificationService.js', 'utf8');

// 1. Add import
notifCode = notifCode.replace(
    "import NotificationLog from '../models/NotificationLog.js';",
    "import NotificationLog from '../models/NotificationLog.js';\nimport { initWhatsAppBot, sendBotWhatsApp } from './whatsappBot.js';"
);

// 2. Initialize bot at bottom or near initEmail
notifCode = notifCode.replace(
    "initEmail();",
    "initEmail();\ninitWhatsAppBot();"
);

// 3. Update the WhatsApp logic block inside dispatchNotification
const newWaLogic = `// 2. WhatsApp Logic (Using whatsapp-web.js)
  let waStatus = 'PENDING';
  let waError = null;
  try {
    if (mobile) {
      if (isDev) {
        console.log(\`[WhatsApp] DEV MODE: Simulating WhatsApp to +\${mobile}\`);
        waStatus = 'SENT';
      } else {
        const textMessage = \`🛍️ *FUTUREMEMORY CART - ORDER \${eventType.toUpperCase()}* 🛍️\\n\\nHello \${customerName},\\nYour order *#\${orderId}* for ₹\${order.totalAmount} has been \${eventType}.\\n\\nThank you for shopping with us!✨\`;
        
        await sendBotWhatsApp(mobile, textMessage);
        waStatus = 'SENT';
        console.log(\`✅ [WhatsApp] QR Bot dispatched to +\${mobile}\`);
      }
    } else {
      waStatus = 'FAILED';
      waError = 'No valid mobile number provided';
    }
  } catch (err) {
    waStatus = 'FAILED';
    waError = err.message;
    console.error(\`❌ [WhatsApp] Failed:\`, err.message);
  }`;

// Replace the try block for WhatsApp
notifCode = notifCode.replace(
    /\/\/ 2\. WhatsApp Logic[\s\S]*?\/\/ 3\. Database Logging/,
    newWaLogic + '\n\n  // 3. Database Logging'
);

fs.writeFileSync('server/services/notificationService.js', notifCode);
console.log('Updated notification service to use whatsapp-web.js');
