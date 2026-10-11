import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useFutureCart } from '../context/FutureCartContext';
import { useOrders } from '../context/OrderContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { allProductsCatalog } from '../data/allOccasionsCatalog';
import { formatPrice } from '../utils/helpers';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const { lang } = useLanguage();
  const [botLang, setBotLang] = useState(lang === 'ta' ? 'ta' : 'en');

  const { addToCart } = useCart();
  const { addToFutureCart } = useFutureCart();
  const { orders } = useOrders();
  const { addNotification } = useNotifications();
  const chatBottomRef = useRef(null);

  // Sync bot language if site language changes
  useEffect(() => {
    setBotLang(lang === 'ta' ? 'ta' : 'en');
  }, [lang]);

  const initialGreeting = {
    id: 1,
    sender: 'bot',
    text: botLang === 'ta'
      ? "வணக்கம்! நான் உங்கள் FutureMemory AI ஷாப்பிங் உதவியாளர். பிரத்யேக பரிசுகள், வாட்ச்கள், மெமரி கார்ட் ரீஃபில், ஆர்டர் டிராக்கிங், அல்லது 10 நாட்கள் ரிட்டர்ன் பற்றி தமிழ் அல்லது Tanglish-ல் தாராளமாக கேளுங்கள்."
      : "Vanakkam! I am your FutureMemory AI Shopping Assistant. Feel free to ask in Tamil, Tanglish, or English about curated gifts, watches, Memory Cart restocks, order tracking, or 7-days return guarantee.",
    chips: botLang === 'ta'
      ? [
          "வாட்ச் பரிசுகள் ₹1500 கீழ் ⌚",
          "10 நாட்கள் ரிட்டர்ன் பாலிசி ️",
          "பிறந்தநாள் பரிசுகள் ",
          "ஆர்டர் நிலை டிராக்கிங் ",
          "இன்றைய சலுகைகள் "
        ]
      : [
          "Watch gifts under ₹1500 ⌚",
          "7 days Return Policy ️",
          "Birthday gifts ",
          "Check active order status ",
          "Today's Offers & Deals "
        ],
    time: "Just now"
  };

  const [messages, setMessages] = useState([initialGreeting]);

  // Update greeting when bot language is switched
  const handleSwitchLanguage = (newLang) => {
    setBotLang(newLang);
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: newLang === 'ta'
          ? "வணக்கம்! நான் உங்கள் FutureMemory AI ஷாப்பிங் உதவியாளர். பிரத்யேக பரிசுகள், வாட்ச்கள், மெமரி கார்ட் ரீஃபில், ஆர்டர் டிராக்கிங், அல்லது 10 நாட்கள் ரிட்டர்ன் பற்றி தமிழ் அல்லது Tanglish-ல் தாராளமாக கேளுங்கள்."
          : "Vanakkam! I am your FutureMemory AI Assistant. Feel free to ask in Tamil, Tanglish, or English about curated gifts, watches, Memory Cart restocks, order tracking, or 7-days return guarantee.",
        chips: newLang === 'ta'
          ? [
              "வாட்ச் பரிசுகள் ₹1500 கீழ் ⌚",
              "10 நாட்கள் ரிட்டர்ன் பாலிசி ️",
              "பிறந்தநாள் பரிசுகள் ",
              "ஆர்டர் நிலை டிராக்கிங் ",
              "இன்றைய சலுகைகள் "
            ]
          : [
              "Watch gifts under ₹1500 ⌚",
              "7 days Return Policy ️",
              "Birthday gifts ",
              "Check active order status ",
              "Today's Offers & Deals "
            ],
        time: "Just now"
      }
    ]);
  };

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Text to Speech
  const handlePlayAudio = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#•`_]/g, ' ').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = botLang === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (Voice to Text)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please type your message.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = botLang === 'ta' ? 'ta-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMsg(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleSend = (userText) => {
    const text = userText || inputMsg;
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: "Just now"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');

    setTimeout(() => {
      const reply = generateAiResponse(text.trim());
      setMessages(prev => [...prev, reply]);
    }, 400);
  };

  const generateAiResponse = (query) => {
    const q = query.toLowerCase();

    // 1. Watch / Timepieces specific handler
    if (q.includes('watch') || q.includes('smartwatch') || q.includes('timepiece') || q.includes('kadikaram') || q.includes('வாட்ச்')) {
      let watchItems = allProductsCatalog.filter(p => 
        p.name.toLowerCase().includes('watch') || p.category.toLowerCase() === 'timepieces'
      );
      if (q.includes('low') || q.includes('under') || q.includes('budget') || q.includes('1500') || q.includes('1000') || q.includes('cheap') || q.includes('kammi')) {
        watchItems = watchItems.filter(w => w.currentPrice <= 1500);
      }
      return {
        id: Date.now() + 1,
        sender: 'bot',
        text: botLang === 'ta'
          ? "⌚ **பிரபலமான கைக்கடிகாரங்கள் & ஸ்மார்ட் வாட்ச்கள்:**\nஅனைத்து வாட்ச்களும் 100% அசல் பிராண்ட் புகைப்படங்களுடன், 10 நாட்கள் இலவச ரிட்டர்ன் உத்தரவாதத்துடன் வருகின்றன!"
          : "⌚ **Curated Wrist Watches & Smartwatches:**\nHere are authentic timepieces specifically verified with 7-days doorstep return guarantee!",
        products: watchItems.slice(0, 3),
        chips: botLang === 'ta'
          ? ["10 நாட்கள் ரிட்டர்ன் பாலிசி ️", "இன்றைய சலுகைகள் ", "பிறந்தநாள் பரிசுகள் "]
          : ["Watch gifts under ₹1500 ⌚", "7 days Return Policy ️", " Today's Offers"],
        time: "Just now"
      };
    }

    // 2. Today's Offers / Discounts / Deals
    if (q.includes('offer') || q.includes('deal') || q.includes('discount') || q.includes('coupon') || q.includes('thallupadi') || q.includes('சலுகை')) {
      return {
        id: Date.now() + 1,
        sender: 'bot',
        text: botLang === 'ta'
          ? " **à®‡à®©à¯à®±à¯ˆà®¯ à®šà®¿à®±à®ªà¯à®ªà¯ à®¤à®³à¯à®³à¯à®ªà®Ÿà®¿à®•à®³à¯ & à®šà®²à¯à®•à¯ˆà®•à®³à¯:**\n\n• **MEMORY25**: à®…à®©à¯ˆà®¤à¯à®¤à¯ à®ªà®°à®¿à®šà¯à®ªà¯ à®ªà¯Šà®°à¯à®Ÿà¯à®•à®³à¯à®•à¯à®•à¯à®®à¯ à®¨à¯‡à®°à®Ÿà®¿ 25% à®¤à®³à¯à®³à¯à®ªà®Ÿà®¿!\n• **FREE DELIVERY**: à®‡à®¨à¯à®¤à®¿à®¯à®¾ à®®à¯à®´à¯à®µà®¤à¯à®®à¯ à®‡à®²à®µà®š à®µà®¿à®°à¯ˆà®µà¯ à®Ÿà¯†à®²à®¿à®µà®°à®¿.\n• **WALLET BONUS**: à®°à®¿à®Ÿà¯à®Ÿà®°à¯à®©à¯ à®ªà®£à®¤à¯à®¤à¯ˆ à®‰à®Ÿà®©à®Ÿà®¿ à®µà®¾à®²à®Ÿà¯à®Ÿà®¿à®²à¯ à®ªà¯†à®±à¯à®±à®¾à®²à¯ +5% à®•à¯‚à®Ÿà¯à®¤à®²à¯ à®•à¯‡à®·à¯à®ªà¯‡à®•à¯!\n• **COMBO**: 2 à®ªà®¿à®±à®¨à¯à®¤à®¨à®¾à®³à¯ à®ªà®°à®¿à®šà¯à®•à®³à¯ à®µà®¾à®™à¯à®•à®¿à®©à®¾à®²à¯ à®‡à®²à®µà®š à®¤à®©à®¿à®ªà¯à®ªà®¯à®©à¯ à®ªà®°à®¿à®šà¯ à®•à®ªà¯."
          : " **Today's Hot Deals & Offers on FutureMemory Cart:**\n\n• **MEMORY25**: Flat 25% OFF on all curated gift items!\n• **FREE DELIVERY**: Free Express Dispatch on all orders across India.\n• **WALLET BONUS**: Extra +5% cashback when choosing Instant Wallet refund during returns!\n• **COMBO SPECIAL**: Buy 2 Birthday gifts and get a free personalized mug.",
        chips: botLang === 'ta'
          ? ["பிறந்தநாள் பரிசுகள் ", "வாட்ச் பரிசுகள் ₹1500 கீழ் ⌚", "ஆர்டர் நிலை டிராக்கிங் "]
          : [" Birthday Gifts", "Watch gifts under ₹1500 ⌚", " Track My Order"],
        time: "Just now"
      };
    }

    // 3. Birthday gifts
    if (q.includes('birthday') || q.includes('piranthanaal') || q.includes('bday') || q.includes('pirantha naal') || q.includes('à®ªà®¿à®±à®¨à¯à®¤à®¨à®¾à®³à¯')) {
      const bdayItems = allProductsCatalog.filter(p => p.occasionId === 'birthday').slice(0, 3);
      return {
        id: Date.now() + 1,
        sender: 'bot',
        text: botLang === 'ta'
          ? " **பிறந்தநாள் சிறந்த பரிசுகள்:**\nபிறந்தநாளுக்கு மிகவும் விரும்பப்படும் டிரெண்டிங் பரிசுகள்! 10 நாட்கள் ரிட்டர்ன் உத்தரவாதத்துடன் கிடைக்கிறது."
          : " **Top Birthday Gift Recommendations:**\nTrending gifts handpicked for Birthday celebrations with 7-days return guarantee.",
        products: bdayItems,
        chips: botLang === 'ta'
          ? ["வாட்ச் பரிசுகள் ₹1500 கீழ் ⌚", "10 நாட்கள் ரிட்டர்ன் பாலிசி ️", "இன்றைய சலுகைகள் "]
          : ["Watch gifts under ₹1500 ⌚", " Today's Offers", " 7 days Return Policy"],
        time: "Just now"
      };
    }

    // 4. Return Policy & 7 days Returns
    if (q.includes('return') || q.includes('replace') || q.includes('damaged') || q.includes('refund') || q.includes('broken') || q.includes('epdi return') || q.includes('thirumba') || q.includes('ரிட்டர்ன்')) {
      return {
        id: Date.now() + 1,
        sender: 'bot',
        text: botLang === 'ta'
          ? "️ **10 à®¨à®¾à®Ÿà¯à®•à®³à¯ à®¤à¯Šà®¨à¯à®¤à®°à®µà®¿à®²à¯à®²à®¾à®¤ à®°à®¿à®Ÿà¯à®Ÿà®°à¯à®©à¯ à®ªà®¾à®²à®¿à®šà®¿:**\n\n1. à®ªà¯Šà®°à¯à®³à¯ à®Ÿà¯†à®²à®¿à®µà®°à®¿ à®†à®© à®¨à®¾à®³à®¿à®²à®¿à®°à¯à®¨à¯à®¤à¯ **10 à®¨à®¾à®Ÿà¯à®•à®³à¯à®•à¯à®•à¯à®³à¯** à®Žà®ªà¯à®ªà¯‹à®¤à¯ à®µà¯‡à®£à¯à®Ÿà¯à®®à®¾à®©à®¾à®²à¯à®®à¯ à®¤à®¿à®°à¯à®®à¯à®ª à®…à®©à¯à®ªà¯à®ªà®²à®¾à®®à¯.\n2. à®šà¯‡à®¤à®®à¯ à®…à®²à¯à®²à®¤à¯ à®¤à®µà®±à®¾à®© à®ªà¯Šà®°à¯à®³à¯ à®µà®¨à¯à®¤à®¾à®²à¯ à®‡à®²à®µà®šà®®à®¾à®• à®µà¯€à®Ÿà¯à®Ÿà¯à®•à¯à®•à¯‡ à®µà®¨à¯à®¤à¯ à®¤à®¿à®°à¯à®®à¯à®ªà®ªà¯ à®ªà¯†à®±à¯à®µà¯‹à®®à¯.\n3. **à®°à¯€à®ƒà®ªà®£à¯à®Ÿà¯ à®¤à¯‡à®°à¯à®µà¯à®•à®³à¯:**\n   • à®¨à¯‡à®°à®Ÿà®¿ à®µà®™à¯à®•à®¿à®•à¯ à®•à®£à®•à¯à®•à¯ / UPI (2-3 à®¨à®¾à®Ÿà¯à®•à®³à¯)\n   • FutureMemory à®‰à®Ÿà®©à®Ÿà®¿ à®µà®¾à®²à®Ÿà¯ (+5% à®•à¯‚à®Ÿà¯à®¤à®²à¯ à®ªà¯‹à®©à®¸à¯ à®°à¯Šà®•à¯à®•à®®à¯!).\n4. Order History à®ªà®•à¯à®•à®¤à¯à®¤à®¿à®²à¯ à®šà¯†à®©à¯à®±à¯ **'Return or Replace Item'** à®•à®¿à®³à®¿à®•à¯ à®šà¯†à®¯à¯à®¤à¯ à®•à¯‹à®°à®¿à®•à¯à®•à¯ˆ à®µà¯ˆà®•à¯à®•à®²à®¾à®®à¯!"
          : "️ **7-days Hassle-Free Return Guarantee:**\n\n1. You can initiate a return or replacement within **7 days** of delivery.\n2. Defective, broken, or wrong items receive free doorstep reverse pickup.\n3. **Refund Options:**\n   • Direct Bank Account / UPI (2-3 business days)\n   • FutureMemory Instant Wallet (+5% extra free cash!).\n4. Simply visit your Order History page and click **'Return or Replace Item'**.",
        chips: botLang === 'ta'
          ? ["ஆர்டர் நிலை டிராக்கிங் ", "இன்றைய சலுகைகள் ", "பிறந்தநாள் பரிசுகள் "]
          : [" View Order History", " Today's Offers", " Birthday Gifts"],
        time: "Just now"
      };
    }

    // 5. Order Tracking / Delivery status
    if (q.includes('track') || q.includes('status') || q.includes('order') || q.includes('delivery') || q.includes('eppo varum') || q.includes('à®Ÿà®¿à®°à®¾à®•à¯à®•à®¿à®™à¯')) {
      const latest = orders[0];
      if (latest) {
        return {
          id: Date.now() + 1,
          sender: 'bot',
          text: botLang === 'ta'
            ? ` **à®šà®®à¯€à®ªà®¤à¯à®¤à®¿à®¯ à®†à®°à¯à®Ÿà®°à¯ à®¨à®¿à®²à¯ˆ:**\n• **à®†à®°à¯à®Ÿà®°à¯ #${latest.orderId}**\n• à®¨à®¿à®²à¯ˆ: **${latest.status}**\n• à®Ÿà®¿à®°à®¾à®•à¯à®•à®¿à®™à¯ à®à®Ÿà®¿: \`${latest.trackingId || 'TRK-FM-LIVE'}\`\n• à®ªà¯Šà®°à¯à®Ÿà¯à®•à®³à¯: ${latest.items?.map(i => i.name).join(', ')}\n• à®®à¯Šà®¤à¯à®¤à®®à¯: ${formatPrice(latest.totalAmount)}\n\n${latest.status === 'Delivered' ? ' à®‡à®¨à¯à®¤ à®†à®°à¯à®Ÿà®°à¯ 10 à®¨à®¾à®Ÿà¯à®•à®³à¯ à®°à®¿à®Ÿà¯à®Ÿà®°à¯à®©à¯ à®µà®šà®¤à®¿à®•à¯à®•à¯ à®¤à®•à¯à®¤à®¿à®¯à®¾à®©à®¤à¯!' : ' à®µà®¿à®°à¯ˆà®µà¯ à®Ÿà¯†à®²à®¿à®µà®°à®¿à®•à¯à®•à®¾à®• à®µà®´à®¿à®¯à®¿à®²à¯ à®‰à®³à¯à®³à®¤à¯.'}`
            : ` **Latest Order Update:**\n• **Order #${latest.orderId}**\n• Status: **${latest.status}**\n• Tracking ID: \`${latest.trackingId || 'TRK-FM-LIVE'}\`\n• Items: ${latest.items?.map(i => i.name).join(', ')}\n• Total: ${formatPrice(latest.totalAmount)}\n\n${latest.status === 'Delivered' ? ' This package is eligible for 7-days Return!' : ' In transit for fast express delivery.'}`,
          chips: botLang === 'ta'
            ? ["10 நாட்கள் ரிட்டர்ன் பாலிசி ️", "இன்றைய சலுகைகள் "]
            : [" 7 days Return Info", " Today's Offers"],
          time: "Just now"
        };
      }
      return {
        id: Date.now() + 1,
        sender: 'bot',
        text: botLang === 'ta'
          ? "உங்கள் ஆர்டர்கள் Order History பக்கத்தில் பாதுகாப்பாக சேமிக்கப்பட்டுள்ளன. ஒவ்வொரு ஆர்டருக்கும் 10 நாட்கள் ரிட்டர்ன் உத்தரவாதம் உள்ளது!"
          : "Your past orders are safe in your Order History page. Every single product is covered by our 7-days return guarantee!",
        chips: botLang === 'ta'
          ? ["இன்றைய சலுகைகள் ", "பிறந்தநாள் பரிசுகள் "]
          : [" Today's Offers", " Birthday Gifts"],
        time: "Just now"
      };
    }

    // 6. Tanglish & Tamil Greeting
    if (q.includes('tanglish') || q.includes('tamil') || q.includes('vanakkam') || q.includes('epdi iruka') || q.includes('à®µà®£à®•à¯à®•à®®à¯')) {
      return {
        id: Date.now() + 1,
        sender: 'bot',
        text: "வணக்கம்!  நான் நலமாக உள்ளேன்! FutureMemory Cart-ல் முக்கிய நிகழ்வுகளுக்கான தேர்ந்தெடுக்கப்பட்ட பிரீமியம் பரிசுகள் உள்ளன. பிறந்தநாள், திருமணம், வாட்ச்கள், கல்லூரி, தீபாவளி, அல்லது பொங்கல் பரிசு பற்றி எதை வேண்டுமானாலும் கேளுங்கள், உடனே வழிகாட்டுகிறேன்!",
        chips: [
          "வாட்ச் பரிசுகள் ₹1500 கீழ் ⌚",
          "10 நாட்கள் ரிட்டர்ன் பாலிசி ️",
          "இன்றைய சலுகைகள் "
        ],
        time: "Just now"
      };
    }

    // 7. General search across catalog
    const matched = allProductsCatalog.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.occasionName?.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 3);

    if (matched.length > 0) {
      return {
        id: Date.now() + 1,
        sender: 'bot',
        text: botLang === 'ta'
          ? ` "${query}" தொடர்பான **${matched.length} சிறந்த பரிசுகள்**:`
          : ` Found **${matched.length} perfect gifts** for "${query}":`,
        products: matched,
        chips: botLang === 'ta'
          ? ["10 நாட்கள் ரிட்டர்ன் பாலிசி ️", "இன்றைய சலுகைகள் "]
          : [" Today's Offers", " 7 days Return Policy"],
        time: "Just now"
      };
    }

    // Fallback
    return {
      id: Date.now() + 1,
      sender: 'bot',
      text: botLang === 'ta'
        ? "à®‰à®™à¯à®•à®³à¯à®•à¯à®•à¯ à®‰à®¤à®µ à®¨à®¾à®©à¯ à®¤à®¯à®¾à®°à®¾à®• à®‰à®³à¯à®³à¯‡à®©à¯! à®¤à®®à®¿à®´à®¿à®²à¯ à®…à®²à¯à®²à®¤à¯ à®†à®™à¯à®•à®¿à®²à®¤à¯à®¤à®¿à®²à¯ à®•à¯‡à®³à¯à®™à¯à®•à®³à¯:\n• 'இன்றைய ஆஃபர் என்ன?'\n• 'நல்ல வாட்ச் பரிசு சொல்லு'\n• 'ரிட்டர்ன் செய்வது எப்படி?'\n• 'என் ஆர்டர் எப்போது வரும்?'"
        : "I'm here to help! You can ask in English, Tamil, or Tanglish:\n• 'Today offer enna?'\n• 'Suggest watches under ₹1500'\n• 'How to return items?'\n• 'Track my order'",
      chips: botLang === 'ta'
        ? ["வாட்ச் பரிசுகள் ₹1500 கீழ் ⌚", "10 நாட்கள் ரிட்டர்ன் பாலிசி ️", "இன்றைய சலுகைகள் "]
        : ["Watch gifts under ₹1500 ⌚", "7 days Return Policy ️", " Today's Offers"],
      time: "Just now"
    };
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    addNotification({
      title: 'Added from Assistant! ️',
      message: `${product.name} added to your cart.`,
      type: 'cart',
      link: '/cart'
    });
  };

  const handleAddToFuture = (product) => {
    addToFutureCart(product, 'birthday', 1);
    addNotification({
      title: 'Saved in Future Cart ',
      message: `${product.name} scheduled for upcoming occasion.`,
      type: 'future',
      link: '/future-cart'
    });
  };

  return (
    <div className="fm-chatbot-wrapper">
      {/* Sleek Floating Pill Trigger (Screenshot 4 Reference) */}
      {!isOpen && (
        <button
          type="button"
          className="fm-chatbot-pill-trigger"
          onClick={() => setIsOpen(true)}
          title="Open FutureMemory AI Assistant"
        >
          <div className="pill-robot-avatar">
            <span className="pill-robot-emoji">🤖</span>
          </div>
          <div className="pill-text-content">
            <span className="pill-bot-title">FutureMemory AI</span>
          </div>
          <span className="pill-status-dot" />
        </button>
      )}

      {/* Target Chatbot Window (Screenshot 3 Reference) */}
      {isOpen && (
        <div className="fm-chat-window-tvl">
          {/* Header with Dark Teal Gradient & Language Switcher */}
          <div className="tvl-chat-header">
            <div className="tvl-header-left">
              <div className="tvl-robot-badge">
                <span></span>
              </div>
              <div className="tvl-header-info">
                <div className="tvl-title-row">
                  <span className="tvl-title">FutureMemory Bot AI</span>
                  <span className="tvl-online-badge">ONLINE</span>
                </div>
                <span className="tvl-subtitle">Smart Gift & Shopping Assistant</span>
              </div>
            </div>

            <div className="tvl-header-actions">
              {/* Language Switcher [ தமிழ் | EN ] */}
              <div className="tvl-lang-toggle">
                <button
                  type="button"
                  className={`tvl-lang-btn ${botLang === 'ta' ? 'active' : ''}`}
                  onClick={() => handleSwitchLanguage('ta')}
                >
                  தமிழ்
                </button>
                <button
                  type="button"
                  className={`tvl-lang-btn ${botLang === 'en' ? 'active' : ''}`}
                  onClick={() => handleSwitchLanguage('en')}
                >
                  EN
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                className="tvl-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="tvl-chat-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`tvl-msg-container ${msg.sender}`}>
                <div className="tvl-msg-card">
                  <div className="tvl-msg-text">
                    {msg.text.split('\n').map((line, lIdx) => (
                      <p key={lIdx}>{line}</p>
                    ))}
                  </div>

                  {/* Audio Button on bottom-right of bot message */}
                  {msg.sender === 'bot' && (
                    <button
                      type="button"
                      className={`tvl-audio-btn ${speakingMsgId === msg.id ? 'is-speaking' : ''}`}
                      onClick={() => handlePlayAudio(msg.id, msg.text)}
                      title="Listen to audio"
                    >
                      <span>{speakingMsgId === msg.id ? '️' : ''}</span>
                      <span>{speakingMsgId === msg.id ? 'Stop' : 'Audio'}</span>
                    </button>
                  )}

                  {/* Embedded Products Carousel */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="tvl-chat-products">
                      {msg.products.map((p) => (
                        <div key={p.id} className="tvl-chat-prod-row">
                          <img src={p.images.front} alt={p.name} />
                          <div className="prod-row-info">
                            <span className="prod-row-name">{p.name}</span>
                            <span className="prod-row-price">
                              {formatPrice(p.price)} <del>{formatPrice(p.originalPrice)}</del>
                            </span>
                            <span className="prod-row-badge">️ 7 days Return</span>
                          </div>
                          <div className="prod-row-btns">
                            <button
                              type="button"
                              className="prod-add-btn"
                              onClick={() => handleAddToCart(p)}
                            >
                              ️ Add
                            </button>
                            <button
                              type="button"
                              className="prod-plan-btn"
                              onClick={() => handleAddToFuture(p)}
                            >
                               Plan
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggestion Chips */}
                {msg.chips && (
                  <div className="tvl-chips-list">
                    {msg.chips.map((chip, cIdx) => (
                      <button
                        key={cIdx}
                        type="button"
                        className="tvl-chip-item"
                        onClick={() => handleSend(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <span className="tvl-timestamp">{msg.time || "Just now"}</span>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Input Area */}
          <form
            className="tvl-chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            {/* Voice Input Mic */}
            <button
              type="button"
              className={`tvl-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceInput}
              title={isListening ? "Listening... Speak now" : "Speak (Voice input)"}
            >
              ️
            </button>

            {/* Text Input */}
            <input
              type="text"
              className="tvl-text-input"
              placeholder={botLang === 'ta' ? "பொருட்களை பற்றி கேளுங்கள்..." : "Ask questions about products..."}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
            />

            {/* Paper Plane Send Button */}
            <button
              type="submit"
              className="tvl-send-btn"
              disabled={!inputMsg.trim()}
              title="Send message"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
