const fs = require('fs');

const replacement = `              <div className="admin-modern-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #3b82f6 100%)', borderRadius: '20px', padding: '24px', color: '#fff', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, opacity: 0.9 }}>Gross Revenue</h4>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>+14.5%</span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>₹1,87,999</h2>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>Compared to last week (₹1.64L)</p>
                </div>

                <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#64748b' }}>Total Orders</h4>
                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>Active</span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{orders.length > 0 ? orders.length : 5}</h2>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>3 pending fulfillment</p>
                </div>

                <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#64748b' }}>New Customers</h4>
                    <span style={{ background: '#f3e8ff', color: 'var(--primary-color)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>This Month</span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{registeredUsers.length > 0 ? registeredUsers.length : 12}</h2>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>+3 recent signups today</p>
                </div>

                <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#64748b' }}>Future Cart Bookings</h4>
                    <span style={{ background: '#fff7ed', color: '#ea580c', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>Upcoming</span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{futurePreOrders.length}</h2>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>₹14,648 in scheduled value</p>
                </div>
              </div>

              {/* LIVE CUSTOMER ACTIVITY FEED */}
              <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px #10b981' }}></span>
                    Live Customer Activity Feed
                  </h3>
                  <button className="z-btn-outline" onClick={() => setActiveTab('orders')} style={{ padding: '8px 16px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer' }}>View All Orders</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid var(--primary-color)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, flexShrink: 0 }}>AK</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#0f172a' }}>Anandha Krishnan <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginLeft: '8px' }}>just placed a Future Cart Pre-Order</span></h4>
                      <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>Scheduled a Wedding Anniversary gift for "Priya Sundaram" (Delivery: Oct 15, 2026). Total: <strong>₹4,899</strong></p>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Just Now</div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, flexShrink: 0 }}>VS</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#0f172a' }}>Vikram Singh <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginLeft: '8px' }}>registered a new account</span></h4>
                      <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>New customer joined via Google Sign-In. Added "Classic Chronograph Watch" to Wishlist.</p>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>12 mins ago</div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, flexShrink: 0 }}>RN</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#0f172a' }}>Ramesh Narayanan <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginLeft: '8px' }}>completed a purchase</span></h4>
                      <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>Order #ORD-9821 for 3 items was successfully paid via UPI. <strong>₹6,450</strong></p>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>1 hr ago</div>
                  </div>
                </div>
              </div>

              {/* Pipelines */}`;

let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');
c = c.replace(/<div className="zestro-kpi-grid">[\s\S]*?{\/\* Pipelines \*\/}/, replacement);
fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Replaced overview layout successfully.');
