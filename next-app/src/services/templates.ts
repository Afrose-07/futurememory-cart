export const WhatsAppTemplates = {
  orderConfirmed: (
    language: 'en' | 'ta' | 'hi' | 'tanglish', 
    orderId: string, 
    total: number, 
    customerName: string,
    items: { name: string; size: string; color: string; qty: number }[]
  ) => {
    
    // Format items list
    const itemsList = items.map(item => `- ${item.qty}x ${item.name} (Size: ${item.size}, Color: ${item.color})`).join('\n');

    switch (language) {
      case 'ta':
        return `🎉 உங்கள் ஆர்டர் உறுதி செய்யப்பட்டது!

வணக்கம் ${customerName}, FutureMemory Cart-ல் ஷாப்பிங் செய்ததற்கு நன்றி.

📦 *ஆர்டர் எண்:* #${orderId}
💵 *மொத்த தொகை:* ₹${total}

*நீங்கள் வாங்கியவை:*
${itemsList}

🚚 உங்கள் ஆர்டர் ஷிப் செய்யப்பட்டதும் மீண்டும் தகவல் தெரிவிக்கப்படும்.
உதவிக்கு: support@futurememory.com`;

      case 'hi':
        return `🎉 आपका ऑर्डर कन्फर्म हो गया है!

नमस्ते ${customerName}, FutureMemory Cart के साथ खरीदारी करने के लिए धन्यवाद।

📦 *ऑर्डर आईडी:* #${orderId}
💵 *कुल राशि:* ₹${total}

*आपके आइटम:*
${itemsList}

🚚 आपका ऑर्डर शिप होने पर आपको एक और अपडेट प्राप्त होगा।
सहायता के लिए: support@futurememory.com`;

      case 'tanglish':
        return `🎉 Ungal Order Confirm aagivitathu!

Vanakkam ${customerName}, FutureMemory Cart-il shopping seithatharku nandri.

📦 *Order ID:* #${orderId}
💵 *Total Amount:* ₹${total}

*Neengal Vaangiyavai:*
${itemsList}

🚚 Ungal order ship aanathum meendum update varum.
Uthavikku: support@futurememory.com`;

      case 'en':
      default:
        return `🎉 Order Confirmed!

Hi ${customerName}, Thank you for shopping with FutureMemory Cart.

📦 *Order ID:* #${orderId}
💵 *Total:* ₹${total}

*Your Items:*
${itemsList}

🚚 You will receive another update when your order is shipped.
Need help? support@futurememory.com`;
    }
  }
};
