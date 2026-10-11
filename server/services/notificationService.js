import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import NotificationLog from '../models/NotificationLog.js';
import { initWhatsAppBot, sendBotWhatsApp } from './whatsappBot.js';
import { getMongoStatus } from '../config/db.mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

let emailTransporter = null;

const initEmail = async () => {
  try {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const user = process.env.EMAIL_USER || 'afromalik07@gmail.com';
    const pass = process.env.EMAIL_PASSWORD || 'ujolaqjhcahfkrtv';
    const port = Number(process.env.EMAIL_PORT) || 465;

    console.log(`[Email Setup] Initializing Real SMTP via ${host}:${port} for ${user}`);
    emailTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    await emailTransporter.verify();
    console.log(`✅ [Email Setup] SMTP Transporter verified and ready to dispatch live emails!`);
  } catch (error) {
    console.warn("[Email Setup] Direct SMTP verification notice:", error.message);
    // Fallback if needed
    if (!emailTransporter) {
      emailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'afromalik07@gmail.com',
          pass: 'ujolaqjhcahfkrtv'
        }
      });
    }
  }
};

initEmail();

const formatPhone = (mobile) => {
  if (!mobile) return null;
  const digits = String(mobile).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

// Dispatch Order Notification
export const dispatchNotification = async (order, eventType = 'Placed') => {
  const email = order.email || order.shippingAddress?.email || order.deliveryAddress?.email;
  const rawMobile = order.mobile || order.shippingAddress?.mobile || order.shippingAddress?.phone || order.deliveryAddress?.phone;
  const mobile = formatPhone(rawMobile);
  const orderId = order.orderId || ('FM-' + Math.floor(100000 + Math.random() * 900000));
  const customerId = order.customerId || 'guest';
  const customerName = order.customerName || order.shippingAddress?.fullName || order.deliveryAddress?.fullName || 'Valued Customer';
  const preference = (order.notificationPreference || 'email').toLowerCase();

  console.log(`\n================ NOTIFICATION ENGINE ================`);
  console.log(`Event: ${eventType} | Order: ${orderId}`);
  console.log(`Target Email: ${email || 'None'} | Target Mobile: ${mobile || 'None'}`);
  console.log(`Selected Channel: ${preference}`);

  let emailStatus = 'SKIPPED';
  let emailError = null;

  // 1. Live Email Dispatch via Gmail SMTP (Always deliver official invoice when email is present)
  if (email || preference === 'email') {
    emailStatus = 'PENDING';
    try {
      if (email && emailTransporter) {
        const itemsHtml = (order.items || []).map(item => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #1e293b; font-weight: 600;">${item.name || 'Gift Item'}</td>
            <td style="padding: 10px 0; text-align: center; color: #64748b;">x${item.quantity || 1}</td>
            <td style="padding: 10px 0; text-align: right; color: #0f172a; font-weight: 700;">₹${(item.price || 0) * (item.quantity || 1)}</td>
          </tr>
        `).join('');

        const mailOptions = {
          from: `"FutureMemory Cart" <${process.env.EMAIL_FROM || 'afromalik07@gmail.com'}>`,
          to: email,
          subject: `FutureMemory Cart - Order #${orderId} ${eventType}! 🎉`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 1.6rem; letter-spacing: -0.5px;">FutureMemory Cart</h1>
                <p style="margin: 6px 0 0 0; font-size: 0.9rem; opacity: 0.9;">Curated Gifts • 7-Days Hassle-Free Returns</p>
              </div>

              <!-- Body -->
              <div style="padding: 28px 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #f8fafc; padding-bottom: 16px; margin-bottom: 20px;">
                  <div>
                    <span style="display: block; font-size: 0.8rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Order Status</span>
                    <strong style="font-size: 1.2rem; color: #15803d;">${eventType} Successfully</strong>
                  </div>
                  <div style="text-align: right;">
                    <span style="display: block; font-size: 0.8rem; text-transform: uppercase; color: #64748b; font-weight: 700;">Order ID</span>
                    <strong style="font-size: 1.1rem; color: #4338ca;">#${orderId}</strong>
                  </div>
                </div>

                <p style="font-size: 1rem; color: #334155; line-height: 1.5;">
                  Hello <strong>${customerName}</strong>,<br>
                  Thank you for shopping with FutureMemory Cart! Your order has been placed and confirmed. Below is your detailed receipt.
                </p>

                <!-- Items Table -->
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <thead>
                    <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 0.82rem; color: #64748b;">
                      <th style="padding: 8px 0;">ITEM</th>
                      <th style="padding: 8px 0; text-align: center;">QTY</th>
                      <th style="padding: 8px 0; text-align: right;">PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml || '<tr><td colspan="3" style="padding: 10px 0;">Curated Selection</td></tr>'}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 14px 0 4px 0; font-weight: 700; font-size: 1.1rem; color: #0f172a;">Total Paid:</td>
                      <td style="padding: 14px 0 4px 0; text-align: right; font-weight: 800; font-size: 1.25rem; color: #4338ca;">₹${order.totalAmount || 0}</td>
                    </tr>
                  </tfoot>
                </table>

                <!-- Shipping Address Card -->
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-top: 16px;">
                  <strong style="color: #0f172a; font-size: 0.9rem; display: block; margin-bottom: 6px;">📍 Delivery Destination:</strong>
                  <p style="margin: 0; color: #475569; font-size: 0.88rem; line-height: 1.4;">
                    ${order.shippingAddress?.fullName || customerName}<br>
                    ${order.shippingAddress?.addressLine || 'Home Delivery'}<br>
                    ${order.shippingAddress?.city ? `${order.shippingAddress.city}, ` : ''}${order.shippingAddress?.state || ''} ${order.shippingAddress?.pincode ? `- ${order.shippingAddress.pincode}` : ''}<br>
                    ${mobile ? `Phone: +${mobile}` : ''}
                  </p>
                </div>

                <!-- 7-days Policy Highlight -->
                <div style="margin-top: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; font-size: 0.84rem; color: #166534; display: flex; align-items: center; gap: 8px;">
                  <span>🛡️</span>
                  <span><strong>7-Days Hassle-Free Returns:</strong> Eligible for doorstep instant return or exchange until 7 days after delivery.</span>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 0.8rem;">
                FutureMemory Cart Enterprise • Master Operator: afromalik07@gmail.com<br>
                This live email was automatically generated and dispatched.
              </div>
            </div>
          `
        };

        const sendRes = await emailTransporter.sendMail(mailOptions);
        emailStatus = 'SENT';
        console.log(`✅ [Real Email] Successfully delivered to ${email} (MessageID: ${sendRes.messageId})`);
      } else {
        emailStatus = 'FAILED';
        emailError = 'Recipient email missing or SMTP transporter not initialized';
        console.warn(`⚠️ [Real Email] Skipped: ${emailError}`);
      }
    } catch (err) {
      emailStatus = 'FAILED';
      emailError = err.message;
      console.error(`❌ [Real Email Error]:`, err.message);
    }
  }

  // 2. WhatsApp Logic
  let waStatus = 'SKIPPED';
  let waError = null;
  if (preference === 'whatsapp' || preference === 'both') {
    waStatus = 'PENDING';
    try {
      if (mobile) {
        const itemsList = (order.items || []).map((it, idx) => `${idx + 1}. *${it.name || 'Gift Item'}* (x${it.quantity || 1}) - ₹${(it.price || 0) * (it.quantity || 1)}`).join('\n');
        const estDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '5 Days';
        const addr = order.shippingAddress || order.deliveryAddress || {};
        const fullAddr = `${addr.addressLine || addr.houseNo || ''} ${addr.street || ''}, ${addr.city || 'Tenkasi'}, ${addr.state || 'Tamil Nadu'} - ${addr.pincode || '627811'}`.replace(/\s+/g, ' ').trim();

        const textMessage = `🛍️ *FUTUREMEMORY CART - OFFICIAL ORDER INVOICE*
━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Order ID:* #${orderId}
👤 *Customer:* ${customerName}
📞 *Mobile:* +${mobile}
💰 *Total Paid:* ₹${order.totalAmount}
🚚 *Est. Delivery:* ${estDate}

📍 *Shipping Address:*
${fullAddr}

📦 *Purchased Items:*
${itemsList || '1. Curated Gift Item (x1) - ₹' + order.totalAmount}

━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *10-DAYS DOORSTEP RETURN:* 100% Free Doorstep Pickup
🔗 *Live Tracking Link:* http://localhost:5173/order-history

✨ _Thank you for shopping with FutureMemory Cart!_`;
        
        await sendBotWhatsApp(mobile, textMessage);
        waStatus = 'SENT';
        console.log(`✅ [WhatsApp] Automatically Dispatched Official Invoice to +${mobile}`);
      } else {
        waStatus = 'FAILED';
        waError = 'No valid phone number found for WhatsApp';
      }
    } catch (err) {
      waStatus = 'FAILED';
      waError = err.message;
      console.warn(`⚠️ [WhatsApp Notice]:`, err.message);
    }
  }

  // 3. Database Logging
  if (getMongoStatus()) {
    try {
      if (emailStatus !== 'PENDING') {
        await NotificationLog.create({
          notificationId: `NOTIF-${Date.now()}-EM`,
          orderId, customerId, channel: 'EMAIL', eventType, status: emailStatus, errorMessage: emailError, sentAt: emailStatus === 'SENT' ? new Date() : null
        });
      }
      if (waStatus !== 'PENDING') {
        await NotificationLog.create({
          notificationId: `NOTIF-${Date.now()}-WA`,
          orderId, customerId, channel: 'WHATSAPP', eventType, status: waStatus, errorMessage: waError, sentAt: waStatus === 'SENT' ? new Date() : null
        });
      }
    } catch (dbErr) {
      console.error('Failed to log notifications to DB:', dbErr.message);
    }
  }

  console.log(`=====================================================\n`);
  return { email: emailStatus, whatsapp: waStatus };
};

// Direct Custom Notification (e.g. for user alerts / tests)
export const sendNotification = async (recipient, messageText) => {
  const email = recipient.email;
  const rawMobile = recipient.mobile || recipient.phone;
  const mobile = formatPhone(rawMobile);
  const preference = (recipient.notificationPreference || 'email').toLowerCase();
  const customerName = recipient.name || 'Valued Customer';

  let emailStatus = 'SKIPPED';
  let waStatus = 'SKIPPED';

  if (email && emailTransporter && (preference === 'email' || preference === 'both' || !mobile)) {
    try {
      await emailTransporter.sendMail({
        from: `"FutureMemory Cart" <${process.env.EMAIL_FROM || 'afromalik07@gmail.com'}>`,
        to: email,
        subject: `FutureMemory Cart - Notification Update`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 550px; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 18px; border-radius: 8px; color: white; text-align: center;">
              <h2 style="margin: 0; font-size: 1.3rem;">FutureMemory Cart</h2>
              <p style="margin: 4px 0 0 0; font-size: 0.85rem; opacity: 0.9;">Personalized E-Commerce Experience</p>
            </div>
            <div style="padding: 20px 0;">
              <p style="font-size: 1rem; color: #1e293b; margin-bottom: 12px;">Hello <strong>${customerName}</strong>,</p>
              <p style="font-size: 0.95rem; color: #334155; line-height: 1.6;">${messageText}</p>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; color: #94a3b8; font-size: 0.8rem;">
              © 2026 FutureMemory Cart • 7-Days Hassle-Free Returns Guarantee
            </div>
          </div>
        `
      });
      emailStatus = 'SENT';
      console.log(`✅ [Real Email] Direct notification sent to ${email}`);
    } catch (e) {
      emailStatus = 'FAILED';
      console.error(`❌ [Real Email Error]:`, e.message);
    }
  }

  if (mobile && (preference === 'whatsapp' || preference === 'both')) {
    try {
      await sendBotWhatsApp(mobile, messageText);
      waStatus = 'SENT';
    } catch (e) {
      waStatus = 'FAILED';
    }
  }

  return { email: emailStatus, whatsapp: waStatus };
};

// Customer Login Welcome Notification
export const sendLoginAlert = async (email, name = 'Customer') => {
  if (!email || !emailTransporter) return false;
  try {
    await emailTransporter.sendMail({
      from: `"FutureMemory Cart" <${process.env.EMAIL_FROM || 'afromalik07@gmail.com'}>`,
      to: email,
      subject: `FutureMemory Cart - Login Successful! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 550px; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 20px; border-radius: 8px; color: white; text-align: center;">
            <h2 style="margin: 0;">Welcome to FutureMemory Cart</h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9;">Account Authentication Confirmed</p>
          </div>
          <div style="padding: 24px 8px;">
            <p style="font-size: 1rem; color: #1e293b;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 0.95rem; color: #475569; line-height: 1.6;">
              You have successfully logged in to your FutureMemory Cart account (<strong>${email}</strong>).
            </p>
            <p style="font-size: 0.9rem; color: #64748b; line-height: 1.5;">
              Your notification preference is set to <strong>Email</strong>. All future order confirmations, dispatch receipts, and price drop alerts will be sent directly to this inbox.
            </p>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; color: #94a3b8; font-size: 0.8rem;">
            FutureMemory Cart • 7-Days Hassle-Free Returns Guarantee
          </div>
        </div>
      `
    });
    console.log(`✅ [Real Email] Login welcome email sent to ${email}`);
    return true;
  } catch (err) {
    console.error(`❌ [Real Email Login Alert Failed]:`, err.message);
    return false;
  }
};

// Customer Email Channel Activation Notification
export const sendChannelActivationEmail = async (email, name = 'Customer') => {
  if (!email || !emailTransporter) {
    console.warn('[Real Email] Cannot send activation email: email or transporter missing');
    return false;
  }
  try {
    const info = await emailTransporter.sendMail({
      from: `"FutureMemory Cart" <${process.env.EMAIL_FROM || 'afromalik07@gmail.com'}>`,
      to: email,
      subject: `FutureMemory Cart - Email Channel Activated! ✉️🎉`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 2.8rem; margin-bottom: 8px;">✉️</div>
            <h1 style="margin: 0; font-size: 1.5rem; letter-spacing: -0.5px;">Email Notifications Activated!</h1>
            <p style="margin: 6px 0 0 0; font-size: 0.9rem; opacity: 0.95;">FutureMemory Cart Notification Pipeline</p>
          </div>

          <!-- Body -->
          <div style="padding: 28px 24px; color: #334155;">
            <p style="font-size: 1.05rem; margin-top: 0;">
              Hello <strong>${name}</strong>,
            </p>
            <p style="font-size: 0.95rem; line-height: 1.6; color: #475569;">
              You have selected <strong>Email</strong> as your active notification channel on FutureMemory Cart.
            </p>

            <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 18px; margin: 20px 0;">
              <div style="font-size: 0.82rem; font-weight: 700; color: #1e40af; text-transform: uppercase; margin-bottom: 6px;">
                Verified Destination Inbox:
              </div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #1d4ed8; word-break: break-all;">
                ${email}
              </div>
              <div style="font-size: 0.82rem; color: #3b82f6; margin-top: 6px;">
                ✓ Live Gmail SMTP Pipeline Active & Verified
              </div>
            </div>

            <div style="font-size: 0.92rem; color: #475569; line-height: 1.6;">
              <strong style="color: #0f172a;">What you will receive here:</strong>
              <ul style="padding-left: 20px; margin-top: 8px;">
                <li>📦 Real-time order placement confirmations</li>
                <li>🧾 Detailed digital order tax receipts</li>
                <li>🚚 Courier live tracking updates & delivery notifications</li>
                <li>🛡️ 7-Days Hassle-Free doorstep return status</li>
                <li>🎁 Exclusive member discounts & price-drop alerts</li>
              </ul>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <a href="http://localhost:5173/shop" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; text-decoration: none; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                Continue Shopping on Store ➔
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; color: #94a3b8; font-size: 0.8rem;">
            FutureMemory Cart Enterprise • Verified Gmail SMTP<br>
            Protected by 7-Days Hassle-Free Returns Guarantee.
          </div>
        </div>
      `
    });
    console.log(`✅ [Real Email] Channel activation email sent to ${email} (MessageID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`❌ [Real Email Channel Activation Failed]:`, err.message);
    return false;
  }
};

