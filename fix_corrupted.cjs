const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

// Fix Rupee symbols
c = c.replace(/`\\?\\$\\{val\\/1000\\}k`/g, '`₹${val/1000}k`');
c = c.replace(/>\\?\\{/g, '>₹{');
c = c.replace(/\\(\\?\\)/g, '(₹)');
c = c.replace(/>\\?(\\d+)/g, '>₹$1');
c = c.replace(/>\\?</g, '>₹<');
c = c.replace(/"\\?250 FLAT"/g, '"₹250 FLAT"');
c = c.replace(/>\\?250 FLAT</g, '>₹250 FLAT<');
c = c.replace(/"\\?500 FLAT"/g, '"₹500 FLAT"');
c = c.replace(/>\\?500 FLAT</g, '>₹500 FLAT<');
c = c.replace(/`\\?\\$\\{value\\}`/g, '`₹${value}`');
c = c.replace(/tickFormatter=\\{\\(val\\) => `\\?\\$\\{val\\/1000\\}k`\\}/g, 'tickFormatter={(val) => `₹${val/1000}k`}');

// Fix emojis / icons
c = c.replace(/<span className="nav-icon">\\?<\/span>/g, '<span className="nav-icon">📦</span>');
c = c.replace(/<div className="stat-icon-wrap yellow">\\?<\/div>/g, '<div className="stat-icon-wrap yellow">🛒</div>');
c = c.replace(/<div className="stat-icon-wrap cyan">\\?<\/div>/g, '<div className="stat-icon-wrap cyan">👥</div>');
c = c.replace(/<div className="stat-icon-wrap blue">\\?<\/div>/g, '<div className="stat-icon-wrap blue">📦</div>');
c = c.replace(/<div className="stat-icon-wrap rose">\\?<\/div>/g, '<div className="stat-icon-wrap rose">📉</div>');
c = c.replace(/<div className="stat-icon-wrap green">\\?<\/div>/g, '<div className="stat-icon-wrap green">📈</div>');

c = c.replace(/<h3><span>\\?<\/span> Top Department/g, '<h3><span>📊</span> Top Department');
c = c.replace(/<h2>\\? Products Catalog/g, '<h2>📦 Products Catalog');
c = c.replace(/<h2>\\? Verified Sellers/g, '<h2>🤝 Verified Sellers');
c = c.replace(/<h2>\\? Offers, Promo/g, '<h2>🏷️ Offers, Promo');
c = c.replace(/<h2>\\? FutureMemory/g, '<h2>⚙️ FutureMemory');

c = c.replace(/>\\?\\? Google OAuth</g, '>🌐 Google OAuth<');
c = c.replace(/>\\? Email & Password</g, '>📧 Email & Password<');
c = c.replace(/>\\? Email Auth</g, '>📧 Email Auth<');
c = c.replace(/>\\?\\? Light Mode/g, '>☀️ Light Mode');
c = c.replace(/>\\?\\? Dark Mode/g, '>🌙 Dark Mode');
c = c.replace(/>\\?\\? System Default/g, '>💻 System Default');
c = c.replace(/>\\?\\? Admin UI Customization/g, '>🎨 Admin UI Customization');

c = c.replace(/<h3>\\? Edit Customer/g, '<h3>✏️ Edit Customer');
c = c.replace(/<h3 style=\\{\\{ color: '#dc2626' \\}\\}>\\? Delete Customer/g, '<h3 style={{ color: \'#dc2626\' }}>🗑️ Delete Customer');

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed corrupted characters');
