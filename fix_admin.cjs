const fs = require('fs');

let adminPage = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

adminPage = adminPage.replace(
  "<th>Status</th>\\n                      <th>Actions</th>",
  "<th>Status</th>\\n                      <th>Notifications</th>\\n                      <th>Actions</th>"
);

adminPage = adminPage.replace(
  "                            <span className={`z-status-pill ${o.status.toLowerCase().replace(/\\\\s+/g, '-')}`}>\\n                              {o.status}\\n                            </span>\\n                          </td>\\n                          <td>\\n                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>",
  "                            <span className={`z-status-pill ${o.status.toLowerCase().replace(/\\\\s+/g, '-')}`}>\\n                              {o.status}\\n                            </span>\\n                          </td>\\n                          <td>\\n                            <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>\\n                              <div>📧 {o.notificationStatus?.email || 'N/A'}</div>\\n                              <div>💬 {o.notificationStatus?.whatsapp || 'N/A'}</div>\\n                            </div>\\n                          </td>\\n                          <td>\\n                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>"
);

// Fallback for line endings
adminPage = adminPage.replace(
  "<th>Status</th>\\r\\n                      <th>Actions</th>",
  "<th>Status</th>\\r\\n                      <th>Notifications</th>\\r\\n                      <th>Actions</th>"
);

adminPage = adminPage.replace(
  "                            <span className={`z-status-pill ${o.status.toLowerCase().replace(/\\\\s+/g, '-')}`}>\\r\\n                              {o.status}\\r\\n                            </span>\\r\\n                          </td>\\r\\n                          <td>\\r\\n                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>",
  "                            <span className={`z-status-pill ${o.status.toLowerCase().replace(/\\\\s+/g, '-')}`}>\\r\\n                              {o.status}\\r\\n                            </span>\\r\\n                          </td>\\r\\n                          <td>\\r\\n                            <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>\\r\\n                              <div>📧 {o.notificationStatus?.email || 'N/A'}</div>\\r\\n                              <div>💬 {o.notificationStatus?.whatsapp || 'N/A'}</div>\\r\\n                            </div>\\r\\n                          </td>\\r\\n                          <td>\\r\\n                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>"
);

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', adminPage);
console.log('Fixed admin page');
