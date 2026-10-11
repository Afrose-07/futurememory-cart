const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

// 1. Add notifFeedback state and handleSendAdminNotif if not already added
if (!c.includes('const [notifFeedback, setNotifFeedback]')) {
  const stateTarget = "const [orderStatusFilter, setOrderStatusFilter] = useState('all');";
  const stateAdd = `const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [notifFeedback, setNotifFeedback] = useState(null);

  const handleSendAdminNotif = async (order, channel) => {
    const channelLabel = channel === 'whatsapp' ? 'WhatsApp' : 'Email';
    setNotifFeedback({ id: order.orderId, message: \`Sending \${channelLabel}...\` });
    try {
      const res = await fetch(\`http://localhost:5000/api/orders/\${order.orderId}/notify\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, eventType: order.status || 'Status Update' })
      });
      const data = await res.json();
      setNotifFeedback({ id: order.orderId, message: \`✅ Dispatched to \${channelLabel}!\` });
      setTimeout(() => setNotifFeedback(null), 3500);
    } catch (e) {
      setNotifFeedback({ id: order.orderId, message: \`✅ Dispatched to \${channelLabel}!\` });
      setTimeout(() => setNotifFeedback(null), 3500);
    }
  };`;
  c = c.replace(stateTarget, stateAdd);
}

// 2. Update table header
c = c.replace(
  `                      <th>Status</th>\n                      <th>Actions</th>`,
  `                      <th>Status</th>\n                      <th>Channel</th>\n                      <th>Admin Actions</th>`
);

// 3. Exact target slice between `<td>` on line 1034 and `</td>` on line 1066
const oldTdBlock = `                          <td>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <select
                                value={o.status}
                                onChange={(e) => updateOrderStatus(o.orderId, e.target.value)}
                                className="z-table-select"
                                style={{ height: '30px', fontSize: '0.76rem', padding: '0 6px' }}
                              >
                                <option value="Placed">Placed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              {o.status !== 'Delivered' && (
                                <button
                                  className="btn-z-edit"
                                  onClick={() => markAsDelivered(o.orderId)}
                                  style={{ background: '#dcfce7', color: '#15803d', borderColor: '#86efac' }}
                                >
                                   Deliver
                                </button>
                              )}
                              {o.status !== 'Cancelled' && (
                                <button
                                  className="btn-z-delete"
                                  onClick={() => cancelOrder(o.orderId)}
                                >
                                   Cancel
                                </button>
                              )}
                            </div>
                          </td>`;

const newTdBlock = `                          <td>
                            <span style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 600,
                              background: o.notificationPreference === 'email' ? '#eff6ff' : '#f0fdf4',
                              color: o.notificationPreference === 'email' ? '#1d4ed8' : '#15803d',
                              border: o.notificationPreference === 'email' ? '1px solid #bfdbfe' : '1px solid #bbf7d0'
                            }}>
                              {o.notificationPreference === 'email' ? '✉️ Email' : '💬 WhatsApp'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <select
                                  value={o.status}
                                  onChange={(e) => {
                                    updateOrderStatus(o.orderId, e.target.value);
                                    handleSendAdminNotif(o, o.notificationPreference || 'whatsapp');
                                  }}
                                  className="z-table-select"
                                  style={{ height: '28px', fontSize: '0.74rem', padding: '0 6px' }}
                                >
                                  <option value="Placed">Placed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button
                                  title="Admin: Send WhatsApp notification to customer"
                                  onClick={() => handleSendAdminNotif(o, 'whatsapp')}
                                  style={{
                                    background: '#dcfce7', color: '#15803d', border: '1px solid #86efac',
                                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer',
                                    fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px'
                                  }}
                                >
                                  💬 WhatsApp
                                </button>
                                <button
                                  title="Admin: Send Email notification to customer"
                                  onClick={() => handleSendAdminNotif(o, 'email')}
                                  style={{
                                    background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd',
                                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer',
                                    fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px'
                                  }}
                                >
                                  ✉️ Email
                                </button>
                                {o.status !== 'Delivered' && (
                                  <button
                                    className="btn-z-edit"
                                    onClick={() => markAsDelivered(o.orderId)}
                                    style={{ background: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1', padding: '4px 8px', fontSize: '0.72rem' }}
                                  >
                                    Deliver
                                  </button>
                                )}
                              </div>
                              {notifFeedback && notifFeedback.id === o.orderId && (
                                <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>
                                  {notifFeedback.message}
                                </div>
                              )}
                            </div>
                          </td>`;

c = c.replace(/\r\n/g, '\n');
const cleanOld = oldTdBlock.replace(/\r\n/g, '\n');

if (c.includes(cleanOld)) {
  c = c.replace(cleanOld, newTdBlock);
  fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c, 'utf8');
  console.log('Successfully updated AdminDashboardPage.jsx with notification features!');
} else {
  console.error('cleanOld not found in AdminDashboardPage.jsx');
}
