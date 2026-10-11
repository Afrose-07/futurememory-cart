import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import fs from 'fs';

let waClient = null;
let isWaReady = false;
let latestQr = null;

export const getLatestQr = () => latestQr;
export const getIsWaReady = () => isWaReady;

export const initWhatsAppBot = () => {
    try {
        console.log('[WhatsApp Bot] Initializing Client in safe mode...');
        
        const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
        const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        
        let execPath = null;
        if (fs.existsSync(edgePath)) execPath = edgePath;
        else if (fs.existsSync(chromePath)) execPath = chromePath;

        waClient = new Client({
            authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
            puppeteer: {
                headless: true,
                executablePath: execPath || undefined,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote']
            }
        });

        waClient.on('qr', (qr) => {
            latestQr = qr;
            console.log('\n======================================================');
            console.log('📱 SCAN THIS QR CODE WITH YOUR WHATSAPP TO LINK BOT 📱');
            console.log('Or visit in browser: http://localhost:5000/qr');
            console.log('======================================================\n');
            try {
                qrcode.generate(qr, { small: true });
            } catch (e) {}
        });

        waClient.on('ready', () => {
            console.log('✅ [WhatsApp Bot] Connected and ready to send messages!');
            isWaReady = true;
            latestQr = null;
        });

        waClient.on('disconnected', (reason) => {
            console.log('ℹ️ [WhatsApp Bot] Disconnected (Standby Mode):', reason);
            isWaReady = false;
        });

        waClient.on('auth_failure', (msg) => {
            console.warn('⚠️ [WhatsApp Bot] Auth failure notice:', msg);
            isWaReady = false;
        });

        waClient.initialize().catch(err => {
            console.warn('⚠️ [WhatsApp Bot Notice] Puppeteer standby:', err.message);
            isWaReady = false;
        });
    } catch (err) {
        console.warn('⚠️ [WhatsApp Bot Notice] Initialization skipped/standby:', err.message);
        isWaReady = false;
    }
};

export const sendBotWhatsApp = async (phone, message) => {
    if (!isWaReady || !waClient) {
        console.warn(`[WhatsApp Bot] Bot in standby. Message for +${phone} logged.`);
        return false;
    }
    try {
        const chatId = `${phone}@c.us`;
        await waClient.sendMessage(chatId, message);
        return true;
    } catch (err) {
        console.warn(`[WhatsApp Bot] Send error for +${phone}:`, err.message);
        return false;
    }
};
