const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

c = c.split('`?${val/1000}k`').join('`₹${val/1000}k`');
c = c.split('>?{').join('>₹{');
c = c.split('(?)').join('(₹)');
c = c.split('>?250').join('>₹250');
c = c.split('"?250').join('"₹250');
c = c.split('>?500').join('>₹500');
c = c.split('"?500').join('"₹500');
c = c.split('`?${value}`').join('`₹${value}`');

c = c.split('<span className="nav-icon">?</span>').join('<span className="nav-icon">📦</span>');
c = c.split('<div className="stat-icon-wrap yellow">?</div>').join('<div className="stat-icon-wrap yellow">🛒</div>');
c = c.split('<div className="stat-icon-wrap cyan">?</div>').join('<div className="stat-icon-wrap cyan">👥</div>');
c = c.split('<div className="stat-icon-wrap blue">?</div>').join('<div className="stat-icon-wrap blue">📦</div>');
c = c.split('<div className="stat-icon-wrap rose">?</div>').join('<div className="stat-icon-wrap rose">📉</div>');
c = c.split('<div className="stat-icon-wrap green">?</div>').join('<div className="stat-icon-wrap green">📈</div>');

c = c.split('<h3><span>?</span> Top Department').join('<h3><span>📊</span> Top Department');
c = c.split('<h2>? Products Catalog').join('<h2>📦 Products Catalog');
c = c.split('<h2>? Verified Sellers').join('<h2>🤝 Verified Sellers');
c = c.split('<h2>? Offers, Promo').join('<h2>🏷️ Offers, Promo');
c = c.split('<h2>? FutureMemory').join('<h2>⚙️ FutureMemory');

c = c.split('?? Google OAuth').join('🌐 Google OAuth');
c = c.split('? Email & Password').join('📧 Email & Password');
c = c.split('? Email Auth').join('📧 Email Auth');
c = c.split('?? Light Mode').join('☀️ Light Mode');
c = c.split('?? Dark Mode').join('🌙 Dark Mode');
c = c.split('?? System Default').join('💻 System Default');
c = c.split('?? Admin UI Customization').join('🎨 Admin UI Customization');

c = c.split('<h3>? Edit Customer').join('<h3>✏️ Edit Customer');
c = c.split('>? Delete Customer').join('>🗑️ Delete Customer');

// Also fix `>₹\d+` pattern manually if needed
for (let i = 0; i <= 9; i++) {
    c = c.split(`>?${i}`).join(`>₹${i}`);
}

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed corrupted characters');
