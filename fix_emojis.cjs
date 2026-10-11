const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

// Fix Topbar Button
c = c.replace(/\? Create Voucher/g, '🎟️ Create Voucher');

// Fix Sidebar Icons
c = c.replace(/<span className="nav-icon"><\/span>\s*<span>Dashboard Overview<\/span>/, '<span className="nav-icon">📊</span>\n                <span>Dashboard Overview</span>');
c = c.replace(/<span className="nav-icon"><\/span>\s*<span>Order Management<\/span>/, '<span className="nav-icon">🛒</span>\n                <span>Order Management</span>');
c = c.replace(/<span className="nav-icon"><\/span>\s*<span>Future Cart Pre-Orders<\/span>/, '<span className="nav-icon">🕒</span>\n                <span>Future Cart Pre-Orders</span>');
c = c.replace(/<span className="nav-icon"><\/span>\s*<span>Returns & Refunds<\/span>/, '<span className="nav-icon">↩️</span>\n                <span>Returns & Refunds</span>');
c = c.replace(/<span className="nav-icon">📦<\/span>\s*<span>Inventory Catalog<\/span>/, '<span className="nav-icon">📦</span>\n                <span>Inventory Catalog</span>');
c = c.replace(/<span className="nav-icon"><\/span>\s*<span>Occasions & Events<\/span>/, '<span className="nav-icon">📅</span>\n                <span>Occasions & Events</span>');
c = c.replace(/<span className="nav-icon">📦<\/span>\s*<span>Sellers & Vendors<\/span>/, '<span className="nav-icon">🏬</span>\n                <span>Sellers & Vendors</span>');
c = c.replace(/<span className="nav-icon"><\/span>\s*<span>Customer Base<\/span>/, '<span className="nav-icon">👥</span>\n                <span>Customer Base</span>');
c = c.replace(/<span className="nav-icon">📦<\/span>\s*<span>Vouchers & Promos<\/span>/, '<span className="nav-icon">🎟️</span>\n                <span>Vouchers & Promos</span>');
c = c.replace(/<span className="nav-icon"><\/span>\s*<span>Reviews & Ratings<\/span>/, '<span className="nav-icon">⭐</span>\n                <span>Reviews & Ratings</span>');
c = c.replace(/<span className="nav-icon"><\/span>\s*<span>Business Analytics<\/span>/, '<span className="nav-icon">📈</span>\n                <span>Business Analytics</span>');
c = c.replace(/<span className="nav-icon">📦<\/span>\s*<span>Settings & Security<\/span>/, '<span className="nav-icon">⚙️</span>\n                <span>Settings & Security</span>');


// Fix Stat Cards
c = c.replace(/<div className="stat-icon-wrap orange"><\/div>\s*<span className="stat-trend-tag positive">\+12% vs mth<\/span>\s*<\/div>\s*<span className="stat-card-num">₹\d+,?\d*,?\d*<\/span>\s*<span className="stat-card-label">Total Revenue<\/span>/, `<div className="stat-icon-wrap orange">💰</div>
                    <span className="stat-trend-tag positive">+12% vs mth</span>
                  </div>
                  <span className="stat-card-num">₹{formatPrice(728500)}</span>
                  <span className="stat-card-label">Total Revenue</span>`);

c = c.replace(/<div className="stat-icon-wrap blue"><\/div>\s*<span className="stat-trend-tag positive">\+8% vs wk<\/span>\s*<\/div>\s*<span className="stat-card-num">3<\/span>\s*<span className="stat-card-label">Future Cart Pre-Orders<\/span>/, `<div className="stat-icon-wrap blue">🕒</div>
                    <span className="stat-trend-tag positive">+8% vs wk</span>
                  </div>
                  <span className="stat-card-num">3</span>
                  <span className="stat-card-label">Future Cart Pre-Orders</span>`);

c = c.replace(/<div className="stat-icon-wrap purple"><\/div>\s*<span className="stat-trend-tag neutral">Registered<\/span>\s*<\/div>\s*<span className="stat-card-num">1<\/span>\s*<span className="stat-card-label">Customers<\/span>/, `<div className="stat-icon-wrap purple">👤</div>
                    <span className="stat-trend-tag neutral">Registered</span>
                  </div>
                  <span className="stat-card-num">{registeredUsers.length}</span>
                  <span className="stat-card-label">Customers</span>`);

c = c.replace(/<div className="stat-icon-wrap pink"><\/div>\s*<span className="stat-trend-tag neutral">Active Hubs<\/span>\s*<\/div>\s*<span className="stat-card-num">18<\/span>\s*<span className="stat-card-label">Fulfillment Hubs<\/span>/, `<div className="stat-icon-wrap pink">🏢</div>
                    <span className="stat-trend-tag neutral">Active Hubs</span>
                  </div>
                  <span className="stat-card-num">18</span>
                  <span className="stat-card-label">Fulfillment Hubs</span>`);

c = c.replace(/<div className="stat-icon-wrap orange"><\/div>\s*<span className="stat-trend-tag positive">\+2.1%<\/span>\s*<\/div>\s*<span className="stat-card-num">4.8%<\/span>\s*<span className="stat-card-label">Conversion Rate<\/span>/, `<div className="stat-icon-wrap orange">🎯</div>
                    <span className="stat-trend-tag positive">+2.1%</span>
                  </div>
                  <span className="stat-card-num">4.8%</span>
                  <span className="stat-card-label">Conversion Rate</span>`);

// Fix Pipeline icons
c = c.replace(/<h3><span><\/span> Future Cart Pre-Orders<\/h3>/, '<h3><span>🕒</span> Future Cart Pre-Orders</h3>');

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed missing emojis in Admin Dashboard');
