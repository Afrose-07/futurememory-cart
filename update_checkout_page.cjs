const fs = require('fs');
let c = fs.readFileSync('src/pages/CheckoutPage.jsx', 'utf8');

c = c.replace(
  "const [deliveryOption, setDeliveryOption] = useState('Standard');",
  "const [deliveryOption, setDeliveryOption] = useState('Standard');\n  const [notificationPreference, setNotificationPreference] = useState('whatsapp');"
);

c = c.replace(
  "deliveryOption,\n        deliveryAddress: selectedAddr,",
  "deliveryOption,\n        deliveryAddress: selectedAddr,\n        notificationPreference,"
);

const deliverySectionTarget = `<div className="checkout-section">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>D. Delivery Option</h2>`;

const notifSectionHtml = `
          <hr style={{ margin: '32px 0', border: 0, borderTop: '1px solid #e2e8f0' }} />

          {/* NOTIFICATION PREFERENCE */}
          <div className="checkout-section">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>E. Order Updates Notification Channel</h2>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
              Select where the Admin and delivery network should send real-time tracking updates:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label style={{ 
                border: notificationPreference === 'whatsapp' ? '2px solid #22c55e' : '1px solid #cbd5e1', 
                borderRadius: '12px', padding: '16px', cursor: 'pointer', 
                background: notificationPreference === 'whatsapp' ? '#f0fdf4' : '#fff',
                display: 'flex', flexDirection: 'column', gap: '6px'
              }}>
                <input type="radio" name="notificationChannel" checked={notificationPreference === 'whatsapp'} onChange={() => setNotificationPreference('whatsapp')} style={{ display: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem' }}>💬</span>
                  <strong style={{ fontSize: '1.02rem', color: '#15803d' }}>WhatsApp Alerts</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Instant tracking and status messages sent to your mobile via WhatsApp.</p>
              </label>

              <label style={{ 
                border: notificationPreference === 'email' ? '2px solid #3b82f6' : '1px solid #cbd5e1', 
                borderRadius: '12px', padding: '16px', cursor: 'pointer', 
                background: notificationPreference === 'email' ? '#eff6ff' : '#fff',
                display: 'flex', flexDirection: 'column', gap: '6px'
              }}>
                <input type="radio" name="notificationChannel" checked={notificationPreference === 'email'} onChange={() => setNotificationPreference('email')} style={{ display: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem' }}>✉️</span>
                  <strong style={{ fontSize: '1.02rem', color: '#1d4ed8' }}>Email Notifications</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Detailed invoices and dispatched tracking sent directly to your email.</p>
              </label>
            </div>
          </div>
`;

// Insert after Delivery Option closing div
const deliveryEndTarget = `              </label>
            </div>
          </div>`;

c = c.replace(/\r\n/g, '\n');
const target = deliveryEndTarget.replace(/\r\n/g, '\n');
if (c.includes(target)) {
  c = c.replace(target, target + notifSectionHtml);
  fs.writeFileSync('src/pages/CheckoutPage.jsx', c, 'utf8');
  console.log('Successfully updated CheckoutPage.jsx');
} else {
  console.error('Target not found in CheckoutPage.jsx');
}
