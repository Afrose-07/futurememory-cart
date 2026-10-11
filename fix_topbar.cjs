const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

c = c.replace(/<span className="zestro-search-icon"><\/span>/g, '<span className="zestro-search-icon">🔍</span>');
c = c.replace(/<button className="topbar-bell-btn" title="Notifications" onClick=\{\(\) => setActiveTab\('orders'\)\}>\s*/, '<button className="topbar-bell-btn" title="Notifications" onClick={() => setActiveTab(\'orders\')}>\n            🔔 ');
// Use a broad regex for the corrupted role string
c = c.replace(/<span className="admin-role">Super Admin[^<]*HQ<\/span>/g, '<span className="admin-role">Super Admin ♦ HQ</span>');

const newOrdersFilter = `  const filteredOrders = orders.filter(o => {
    const q = inventorySearch.toLowerCase();
    const cName = o.shippingAddress?.name || '';
    const matchesSearch = o.orderId.toLowerCase().includes(q) || cName.toLowerCase().includes(q);
    if (orderStatusFilter === 'all') return matchesSearch;
    return o.status === orderStatusFilter && matchesSearch;
  });`;
c = c.replace(/const filteredOrders = orders\.filter\(o => \{[\s\S]*?\}\);/, newOrdersFilter);

const newCustomersFilter = `  const filteredCustomers = registeredUsers.filter(c => {
    const q = (customerSearch || inventorySearch).toLowerCase();
    const matchesSearch =
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.mobile || '').includes(q);`;
c = c.replace(/const filteredCustomers = registeredUsers\.filter\(c => \{\s*const q = customerSearch\.toLowerCase\(\);\s*const matchesSearch =[\s\S]*?\(c\.mobile \|\| ''\)\.includes\(q\);/, newCustomersFilter);

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed Topbar icons and Global Search');
