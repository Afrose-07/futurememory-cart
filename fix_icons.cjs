const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

c = c.replace(/>\? Delete</g, '>🗑️ Delete<');
c = c.replace(/>\? Edit</g, '>✏️ Edit<');
c = c.replace(/<td>\{c\.mobile \|\| ''\}<\/td>/g, '<td>{c.mobile || \'-\'}</td>');
c = c.replace(/\{o\.shippingAddress\?\.city\}  \{o\.shippingAddress\?\.mobile\}/g, '{o.shippingAddress?.city} - {o.shippingAddress?.mobile}');
c = c.replace(/<strong>\{rev\.name\}<\/strong>  <span/g, '<strong>{rev.name}</strong> - <span');

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed additional icons');
