import { sendNotification } from './services/notificationService.js';

async function testEmail() {
  console.log('Sending test email to: afromalik07@gmail.com');
  await sendNotification({ 
    name: 'Afrose', 
    email: 'afromalik07@gmail.com', 
    notificationPreference: 'email' 
  }, '🎉 Congratulations! Your FutureMemory Cart email notifications are working 100% for real!');
  console.log('Test completed.');
  process.exit(0);
}

testEmail();
