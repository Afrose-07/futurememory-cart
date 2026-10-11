const fs = require('fs');
let code = fs.readFileSync('src/data/translations.js', 'utf8');

const enNew = `
    cartTitle: "Instant Shopping Cart",
    cartSubtitle: "Review your immediate order items, apply promo vouchers, and proceed to lightning checkout.",
    clearCart: "Clear Cart",
    orderSummary: "Order Summary",
    originalMrp: "Original MRP:",
    productDiscount: "Product Discount:",
    subtotalItems: "Subtotal ({count} items):",
    standardShipping: "Standard Shipping:",
    totalAmount: "Total Amount:",
    proceedToCheckout: "Proceed to Checkout",
    secureCheckout: "100% Safe & Secure Checkout",
    quickDispatch: "Quick Dispatch in 24 Hours",
    free: "FREE",
    memoryCartPromoTitle: "Want regular auto-refill reminders?",
    memoryCartPromoDesc: "Items like shampoo, skincare, and stationery can be moved to your Memory Cart to receive price drop alerts and restock reminders.",
    exploreMemoryCart: "Explore Memory Cart",
    emptyCartTitle: "Your Normal Cart is Empty",
    emptyCartDesc: "Looks like you haven't added any products for immediate checkout yet.",
    startShopping: "Start Shopping",
    totalLabel: "Total:",
    moveToWishlist: "Move to Wishlist",
    moveToMemoryCartRepurchase: "Move to Memory Cart (Repurchase)",
    removeFromCart: "Remove from cart",
`;

const taNew = `
    cartTitle: "உடனடி ஷாப்பிங் கார்ட் (Instant Shopping Cart)",
    cartSubtitle: "உங்கள் ஆர்டர் பொருட்களை மதிப்பாய்வு செய்து, செக் அவுட்டிற்குச் செல்லவும்.",
    clearCart: "கார்ட்டை காலி செய் (Clear Cart)",
    orderSummary: "ஆர்டர் சுருக்கம் (Order Summary)",
    originalMrp: "அசல் எம்.ஆர்.பி (Original MRP):",
    productDiscount: "பொருள் தள்ளுபடி (Product Discount):",
    subtotalItems: "துணை மொத்தம் ({count} பொருட்கள்):",
    standardShipping: "டெலிவரி கட்டணம்:",
    totalAmount: "மொத்த தொகை:",
    proceedToCheckout: "பணம் செலுத்தச் செல்லவும் (Proceed to Checkout)",
    secureCheckout: "100% பாதுகாப்பான செக்-அவுட்",
    quickDispatch: "24 மணிநேரத்தில் விரைவான அனுப்புதல்",
    free: "இலவசம்",
    memoryCartPromoTitle: "தொடர்ச்சியான ஆட்டோ-ரீஃபில் நினைவூட்டல்கள் வேண்டுமா?",
    memoryCartPromoDesc: "பொருட்களை உங்கள் மெமரி கார்ட்டுக்கு மாற்றி விலை குறைப்பு எச்சரிக்கைகள் மற்றும் ரீஸ்டாக் நினைவூட்டல்களைப் பெறலாம்.",
    exploreMemoryCart: "மெமரி கார்ட்டை ஆராயுங்கள்",
    emptyCartTitle: "உங்கள் கார்ட் காலியாக உள்ளது",
    emptyCartDesc: "நீங்கள் இன்னும் எந்தப் பொருட்களையும் சேர்க்கவில்லை.",
    startShopping: "ஷாப்பிங் செய்யத் தொடங்குங்கள்",
    totalLabel: "மொத்தம் (Total):",
    moveToWishlist: "விஷ்லிஸ்ட்டுக்கு மாற்று",
    moveToMemoryCartRepurchase: "மெமரி கார்ட்டுக்கு மாற்று",
    removeFromCart: "கார்ட்டில் இருந்து நீக்கு",
`;

code = code.replace(/(cat_tech: "Tech & Gadgets")/, '$1,\n' + enNew);
code = code.replace(/(cat_tech: "தொழில்நுட்ப சாதனங்கள்")/, '$1,\n' + taNew);
code = code.replace(/(cat_tech: "ടെക് & ഗാഡ്ജറ്റുകൾ")/, '$1,\n' + enNew);
code = code.replace(/(cat_tech: "ಟೆಕ್ & ಗ್ಯಾಜೆಟ್ಸ್")/, '$1,\n' + enNew);
code = code.replace(/(cat_tech: "టెక్ & గ్యాడ్జెట్స్")/, '$1,\n' + enNew);

fs.writeFileSync('src/data/translations.js', code);
console.log('updated translations.js');
