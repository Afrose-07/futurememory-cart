import { sendNotification } from './services/notificationService.js';

async function testWhatsappAndSms() {
  console.log('Sending test WhatsApp & SMS to: 917339668463');
  
  await sendNotification({ 
    name: 'Afrose', 
    mobile: '917339668463', 
    notificationPreference: 'whatsapp' 
  }, '🎉 Congratulations! Your FutureMemory Cart WhatsApp notifications are working!');

  await sendNotification({ 
    name: 'Afrose', 
    mobile: '917339668463', 
    notificationPreference: 'sms' 
  }, '🎉 Your FutureMemory Cart SMS notifications are working via Textbelt (Free tier)!');

  console.log('Test completed.');
  process.exit(0);
}

// Give whatsapp client some time to initialize before sending
setTimeout(testWhatsappAndSms, 15000);
