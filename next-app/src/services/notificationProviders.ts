import { Notification, Channel, Language } from '@prisma/client';

export interface NotificationPayload {
  userId: string;
  phone: string | null;
  email: string;
  eventName: string;
  template: string;
  language: Language;
  data: Record<string, any>;
}

/**
 * Interface for notification providers (WhatsApp, Email)
 */
export interface INotificationProvider {
  send(payload: NotificationPayload): Promise<{ success: boolean; providerMessageId?: string; error?: string }>;
}

// Dummy WhatsApp Service (Twilio/Meta API integration goes here)
export const whatsappService: INotificationProvider = {
  async send(payload) {
    if (!payload.phone) {
      return { success: false, error: 'No phone number provided for WhatsApp notification' };
    }
    
    console.log(`[WhatsApp] Sending ${payload.template} to ${payload.phone} in ${payload.language}`);
    console.log(`[WhatsApp] Data:`, payload.data);
    
    // TODO: Implement actual API call to WhatsApp Cloud API / Twilio
    
    return { success: true, providerMessageId: `wa_msg_${Date.now()}` };
  }
};

// Dummy Email Service (Resend/SendGrid/Nodemailer integration goes here)
export const emailService: INotificationProvider = {
  async send(payload) {
    if (!payload.email) {
      return { success: false, error: 'No email provided for Email notification' };
    }
    
    console.log(`[Email] Sending ${payload.template} to ${payload.email} in ${payload.language}`);
    console.log(`[Email] Data:`, payload.data);
    
    // TODO: Implement actual API call to Resend or Nodemailer
    
    return { success: true, providerMessageId: `em_msg_${Date.now()}` };
  }
};
