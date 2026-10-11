import dotenv from 'dotenv';
dotenv.config();

const phone = process.argv[2] || '917339668463';
const metaToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER;

console.log(`\n======================================================`);
console.log(`📲 Testing Real WhatsApp Message Dispatch`);
console.log(`📞 Recipient: +${phone}`);
console.log(`======================================================\n`);

if (metaToken && metaPhoneId) {
  console.log(`🚀 Using Meta WhatsApp Cloud API...`);
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${metaPhoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${metaToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: `🎉 FutureMemory Cart: Test message sent to your WhatsApp successfully!` }
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ [SUCCESS!] Real WhatsApp message delivered to +${phone}!`);
      console.log(`🆔 Message ID:`, data.messages?.[0]?.id);
    } else {
      console.error(`❌ Meta WhatsApp API Error:`, data.error?.message || data);
    }
  } catch (e) {
    console.error(`❌ Network error:`, e.message);
  }
} else if (twilioSid && twilioToken) {
  console.log(`🚀 Using Twilio WhatsApp API...`);
  try {
    const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
    const params = new URLSearchParams();
    params.append('From', `whatsapp:${twilioFrom || '+14155238886'}`);
    params.append('To', `whatsapp:+${phone}`);
    params.append('Body', `🎉 FutureMemory Cart: Real WhatsApp Test Confirmation!`);

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ [SUCCESS!] Real Twilio WhatsApp message delivered to +${phone}! SID:`, data.sid);
    } else {
      console.error(`❌ Twilio Error:`, data.message || data);
    }
  } catch (e) {
    console.error(`❌ Network error:`, e.message);
  }
} else {
  console.log(`⚠️ [NO CLOUD API TOKEN CONFIGURED IN server/.env]`);
  console.log(`WhatsApp requires a Meta or Twilio API key to push messages over the internet to a physical phone.`);
  console.log(`\nTo get a 100% FREE Meta WhatsApp API Token:`);
  console.log(`1. Go to: https://developers.facebook.com`);
  console.log(`2. Create an App -> Choose "WhatsApp" -> Click "Set Up".`);
  console.log(`3. Under API Setup, copy the "Temporary Access Token" and "Phone Number ID".`);
  console.log(`4. Paste them into server/.env:`);
  console.log(`   WHATSAPP_CLOUD_API_TOKEN=your_token_here`);
  console.log(`   WHATSAPP_PHONE_NUMBER_ID=your_id_here`);
  console.log(`\nOnce configured, every order placed will immediately deliver a real WhatsApp notification to the customer's phone!\n`);
}
