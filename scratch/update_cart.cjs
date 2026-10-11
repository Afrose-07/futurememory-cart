const fs = require('fs');
let code = fs.readFileSync('src/pages/CartPage.jsx', 'utf8');

if (!code.includes('useLanguage')) {
  code = code.replace(/import \{ useAuth \} from '\.\.\/context\/AuthContext';/, "import { useAuth } from '../context/AuthContext';\nimport { useLanguage } from '../context/LanguageContext';");
}

if (!code.includes('const { t } = useLanguage();')) {
  code = code.replace(/const \{ isAuthenticated \} = useAuth\(\);/, "const { isAuthenticated } = useAuth();\n  const { t } = useLanguage();");
}

code = code.replace(/title="️ Instant Shopping Cart"/, 'title={`️ ${t(\'cartTitle\') || \'Instant Shopping Cart\'}`}');
code = code.replace(/subtitle="Review your immediate order items, apply promo vouchers, and proceed to lightning checkout."/, 'subtitle={t(\'cartSubtitle\') || \'Review your immediate order items, apply promo vouchers, and proceed to lightning checkout.\'}');
code = code.replace(/>Clear Cart</, '>{t(\'clearCart\') || \'Clear Cart\'}<');
code = code.replace(/title="Your Normal Cart is Empty"/, 'title={t(\'emptyCartTitle\') || \'Your Normal Cart is Empty\'}');
code = code.replace(/description="Looks like you haven't added any products for immediate checkout yet."/, 'description={t(\'emptyCartDesc\') || "Looks like you haven\'t added any products for immediate checkout yet."}');
code = code.replace(/actionText="Start Shopping"/, 'actionText={t(\'startShopping\') || \'Start Shopping\'}');

code = code.replace(/<h4>Want regular auto-refill reminders\?<\/h4>/, '<h4>{t(\'memoryCartPromoTitle\') || \'Want regular auto-refill reminders?\'}</h4>');
code = code.replace(/Items like shampoo, skincare, and stationery can be moved to your <strong>Memory Cart<\/strong> to receive price drop alerts and restock reminders\./, '{t(\'memoryCartPromoDesc\') || \'Items like shampoo, skincare, and stationery can be moved to your Memory Cart to receive price drop alerts and restock reminders.\'}');
code = code.replace(/>Explore Memory Cart</, '>{t(\'exploreMemoryCart\') || \'Explore Memory Cart\'}<');

code = code.replace(/<h3 className="fm-summary-title">Order Summary<\/h3>/, '<h3 className="fm-summary-title">{t(\'orderSummary\') || \'Order Summary\'}</h3>');
code = code.replace(/<span>Original MRP:<\/span>/, '<span>{t(\'originalMrp\') || \'Original MRP:\'}</span>');
code = code.replace(/<span>Product Discount:<\/span>/, '<span>{t(\'productDiscount\') || \'Product Discount:\'}</span>');
code = code.replace(/<span>Subtotal \(\{getCartCount\(\)\} items\):<\/span>/, '<span>{t(\'subtotalItems\')?.replace(\'{count}\', getCartCount()) || `Subtotal (${getCartCount()} items):`}</span>');
code = code.replace(/<span>Standard Shipping:<\/span>/, '<span>{t(\'standardShipping\') || \'Standard Shipping:\'}</span>');
code = code.replace(/<strong className="green-val">FREE<\/strong>/, '<strong className="green-val">{t(\'free\') || \'FREE\'}</strong>');
code = code.replace(/<span>Total Amount:<\/span>/, '<span>{t(\'totalAmount\') || \'Total Amount:\'}</span>');
code = code.replace(/Proceed to Checkout \(\{formatPrice\(finalTotal\)\}\)/, '{t(\'proceedToCheckout\') || \'Proceed to Checkout\'} ({formatPrice(finalTotal)})');
code = code.replace(/<span>️ 100% Safe & Secure Checkout<\/span>/, '<span>️ {t(\'secureCheckout\') || \'100% Safe & Secure Checkout\'}</span>');
code = code.replace(/<span> Quick Dispatch in 24 Hours<\/span>/, '<span> {t(\'quickDispatch\') || \'Quick Dispatch in 24 Hours\'}</span>');

fs.writeFileSync('src/pages/CartPage.jsx', code);
console.log('CartPage updated');
