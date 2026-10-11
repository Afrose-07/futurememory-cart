const fs = require('fs');

const targetPath = 'src/pages/AdminDashboardPage.jsx';
let content = fs.readFileSync(targetPath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Initial Vouchers with currency symbol
content = content.replace(
  `{ id: 'v2', code: 'SMART500', discount: '?500 FLAT', minOrder: 2999, expires: '2026-11-30', uses: 89, active: true },`,
  `{ id: 'v2', code: 'SMART500', discount: '₹500 FLAT', minOrder: 2999, expires: '2026-11-30', uses: 89, active: true },`
);
content = content.replace(
  `{ id: 'v4', code: 'WELCOME100', discount: '?100 WELCOME', minOrder: 499, expires: '2026-12-31', uses: 410, active: true }`,
  `{ id: 'v4', code: 'WELCOME100', discount: '₹100 WELCOME', minOrder: 499, expires: '2026-12-31', uses: 410, active: true }`
);

// 2. Add Sellers State, Product Edit state, Voucher Edit state
const stateInsertionTarget = `  // Vouchers / Coupons Management State`;
const newStates = `  // Product Edit Modal State
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Sellers & Brands Management State
  const [sellers, setSellers] = useState([
    { id: 's1', name: 'Apex Chrono Technologies', category: 'Smartwatches & Timepieces', rating: '4.9 ⭐', products: 24, status: 'Verified' },
    { id: 's2', name: 'Heritage Silks & Weaves Co.', category: 'Sarees & Ethnic Wear', rating: '4.8 ⭐', products: 45, status: 'Verified' },
    { id: 's3', name: 'Aura Sound Labs', category: 'ANC Earbuds & Smart Audio', rating: '4.9 ⭐', products: 18, status: 'Verified' },
    { id: 's4', name: 'Artisan Gourmet Sweets', category: 'Handcrafted Hampers & Chocolates', rating: '4.7 ⭐', products: 30, status: 'Verified' },
    { id: 's5', name: 'Royal Leathercraft & Bags', category: 'Bags & Leather Accessories', rating: '4.8 ⭐', products: 15, status: 'Verified' },
    { id: 's6', name: 'Shine Fine Jewels', category: 'Silver & Gold Plated Sets', rating: '4.9 ⭐', products: 28, status: 'Verified' }
  ]);
  const [isAddSellerOpen, setIsAddSellerOpen] = useState(false);
  const [isEditSellerOpen, setIsEditSellerOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [newSellerForm, setNewSellerForm] = useState({ name: '', category: '', rating: '5.0 ⭐', products: 1, status: 'Verified' });

  // Voucher Edit State
  const [isEditVoucherOpen, setIsEditVoucherOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setCatalogItems(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    setIsEditProductOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteSeller = (sellerId, sellerName) => {
    if (window.confirm(\`Are you sure you want to remove seller partner "\${sellerName}"?\`)) {
      setSellers(prev => prev.filter(s => s.id !== sellerId));
    }
  };

  const handleAddNewSeller = (e) => {
    e.preventDefault();
    if (!newSellerForm.name) return;
    const newS = {
      id: 's-' + Date.now(),
      ...newSellerForm,
      products: Number(newSellerForm.products) || 1
    };
    setSellers(prev => [newS, ...prev]);
    setIsAddSellerOpen(false);
    setNewSellerForm({ name: '', category: '', rating: '5.0 ⭐', products: 1, status: 'Verified' });
  };

  const handleUpdateSeller = (e) => {
    e.preventDefault();
    if (!editingSeller) return;
    setSellers(prev => prev.map(s => s.id === editingSeller.id ? editingSeller : s));
    setIsEditSellerOpen(false);
    setEditingSeller(null);
  };

  const handleUpdateVoucher = (e) => {
    e.preventDefault();
    if (!editingVoucher) return;
    setVouchers(prev => prev.map(v => v.id === editingVoucher.id ? editingVoucher : v));
    setIsEditVoucherOpen(false);
    setEditingVoucher(null);
  };

  // Vouchers / Coupons Management State`;

if (!content.includes('isEditProductOpen')) {
  content = content.replace(stateInsertionTarget, newStates);
  console.log('Added states and handlers for Products, Sellers, and Vouchers!');
}

// 3. Theme class on root div
content = content.replace(
  '<div className="fm-admin-root">',
  '<div className={`fm-admin-root ${adminTheme === "dark" ? "admin-theme-dark" : ""}`}'
);

// 4. Topbar icons
content = content.replace(
  `<Link to="/home" className="btn-customer-app" title="Switch to Customer Storefront">\n            <span></span>\n            <span>Customer Storefront</span>\n          </Link>`,
  `<Link to="/home" className="btn-customer-app" title="Switch to Customer Storefront">\n            <span>🛍️</span>\n            <span>Customer Storefront</span>\n          </Link>`
);
content = content.replace(
  `<button className="btn-topbar-logout" onClick={logoutAdmin} title="Sign Out of Admin Console">\n             Logout\n          </button>`,
  `<button className="btn-topbar-logout" onClick={logoutAdmin} title="Sign Out of Admin Console">\n            🚪 Logout\n          </button>`
);

// 5. In Products table: Add Edit ✏️ button
const oldProductActions = `<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <Link to={\`/product/\${prod.id}\`} className="btn-z-edit" style={{ textDecoration: 'none', padding: '5px 10px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                Preview 👁️
                              </Link>
                              <button
                                className="btn-z-delete"
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                title="Delete from Catalog"
                                style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                              >
                                🗑️ Delete
                              </button>
                            </div>`;

const newProductActions = `<div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <button
                                className="btn-z-edit"
                                onClick={() => {
                                  setEditingProduct({
                                    ...prod,
                                    currentPrice: prod.price || prod.currentPrice || 999,
                                    category: prod.category || prod.occasionName || 'Curated'
                                  });
                                  setIsEditProductOpen(true);
                                }}
                                style={{ padding: '5px 9px', fontSize: '0.76rem' }}
                              >
                                ✏️ Edit
                              </button>
                              <Link to={\`/product/\${prod.id}\`} className="btn-z-edit" style={{ textDecoration: 'none', padding: '5px 9px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                👁️ View
                              </Link>
                              <button
                                className="btn-z-delete"
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                title="Delete from Catalog"
                                style={{ padding: '5px 9px', fontSize: '0.76rem' }}
                              >
                                🗑️ Delete
                              </button>
                            </div>`;

if (content.includes(oldProductActions)) {
  content = content.replace(oldProductActions, newProductActions);
  console.log('Added Edit ✏️ button to Product actions!');
} else {
  console.log('oldProductActions not found, searching alternative...');
}

// 6. Customers CRM: Email, WhatsApp, Edit, Delete
const oldCustomerActions = `<td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn-z-edit"
                                onClick={() => {
                                  setEditingCustomer({ ...c });
                                  setIsEditCustomerOpen(true);
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn-z-delete"
                                onClick={() => setCustomerToDelete(c)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>`;

const newCustomerActions = `<td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <a
                                href={\`mailto:\${c.email}?subject=FutureMemory%20Cart%20Support\`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                title={\`Send Email to \${c.email}\`}
                              >
                                ✉️ Email
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  const cleanPhone = (c.mobile || '').replace(/\\D/g, '');
                                  if (cleanPhone) {
                                    const fullPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
                                    window.open(\`https://wa.me/\${fullPhone}?text=Hello%20\${encodeURIComponent(c.name || 'Valued Customer')}%2C%20greetings%20from%20FutureMemory%20Cart!\`, '_blank');
                                  } else {
                                    alert('Phone number not provided for this customer.');
                                  }
                                }}
                                style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                title="Chat on WhatsApp"
                              >
                                💬 WhatsApp
                              </button>
                              <button
                                className="btn-z-edit"
                                onClick={() => {
                                  setEditingCustomer({ ...c });
                                  setIsEditCustomerOpen(true);
                                }}
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn-z-delete"
                                onClick={() => setCustomerToDelete(c)}
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>`;

if (content.includes(oldCustomerActions)) {
  content = content.replace(oldCustomerActions, newCustomerActions);
  console.log('Added Email and WhatsApp to Customer CRM actions!');
}

// 7. Replace Sellers tab with dynamic state and Edit/Delete
const oldSellersTarget = `{activeTab === 'sellers' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}>🏢 Verified Sellers & Brand Partners</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Authorized distributors and brands powering FutureMemory Cart inventory.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {[
                  { name: 'Apex Chrono Technologies', category: 'Smartwatches & Timepieces', rating: '4.9 ', products: 24, status: 'Verified' },
                  { name: 'Heritage Silks & Weaves Co.', category: 'Sarees & Ethnic Wear', rating: '4.8 ', products: 45, status: 'Verified' },
                  { name: 'Aura Sound Labs', category: 'ANC Earbuds & Smart Audio', rating: '4.9 ', products: 18, status: 'Verified' },
                  { name: 'Artisan Gourmet Sweets', category: 'Handcrafted Hampers & Chocolates', rating: '4.7 ', products: 30, status: 'Verified' },
                  { name: 'Royal Leathercraft & Bags', category: 'Bags & Leather Accessories', rating: '4.8 ', products: 15, status: 'Verified' },
                  { name: 'Shine Fine Jewels', category: 'Silver & Gold Plated Sets', rating: '4.9 ', products: 28, status: 'Verified' }
                ].map((s, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{s.name}</h3>
                      <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>{s.status}</span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#64748b' }}>{s.category}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      <span>Rating: <strong style={{ color: '#d97706' }}>{s.rating}</strong></span>
                      <span>Catalog: <strong>{s.products} Products</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}`;

const newSellersSection = `{activeTab === 'sellers' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}>🏢 Verified Sellers & Brand Partners</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Authorized distributors and verified brands powering FutureMemory Cart inventory.
                  </p>
                </div>
                <button className="btn-qa qa-primary-orange" onClick={() => setIsAddSellerOpen(true)}>
                  ➕ Add New Seller
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {sellers.map((s) => (
                  <div key={s.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{s.name}</h3>
                        <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>{s.status}</span>
                      </div>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#64748b' }}>{s.category}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '14px' }}>
                        <span>Rating: <strong style={{ color: '#d97706' }}>{s.rating}</strong></span>
                        <span>Catalog: <strong>{s.products} Products</strong></span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      <button
                        className="btn-z-edit"
                        onClick={() => {
                          setEditingSeller({ ...s });
                          setIsEditSellerOpen(true);
                        }}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-z-delete"
                        onClick={() => handleDeleteSeller(s.id, s.name)}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}`;

if (content.includes(oldSellersTarget)) {
  content = content.replace(oldSellersTarget, newSellersSection);
  console.log('Replaced Sellers section with dynamic state, Edit ✏️ and Delete 🗑️!');
} else {
  console.log('oldSellersTarget not found, checking match...');
}

// 8. In Vouchers table: Add Edit ✏️ button and fix {v.discount}
const oldVoucherAction = `<td>
                          <button className="btn-z-delete" onClick={() => deleteVoucher(v.id)}>
                            🗑️ Delete
                          </button>
                        </td>`;

const newVoucherAction = `<td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn-z-edit"
                              onClick={() => {
                                setEditingVoucher({ ...v });
                                setIsEditVoucherOpen(true);
                              }}
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn-z-delete"
                              onClick={() => deleteVoucher(v.id)}
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>`;

if (content.includes(oldVoucherAction)) {
  content = content.replace(oldVoucherAction, newVoucherAction);
  console.log('Added Edit ✏️ to Vouchers table actions!');
}

content = content.replace(
  `<td><span style={{ color: 'var(--primary-color)', fontWeight: '800' }}>{v.discount}% OFF</span></td>`,
  `<td><span style={{ color: 'var(--primary-color)', fontWeight: '800' }}>{v.discount}</span></td>`
);

// 9. Store Settings tweaks
content = content.replace(
  `<h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}>⚙️ FutureMemory Cart Store Configuration</h2>`,
  `<h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}>⚙️ Store Settings & Biometric Security</h2>`
);
content = content.replace(
  ` Store configuration updated successfully!`,
  `✅ Store configuration updated successfully!`
);
content = content.replace(
  ` Save Store Settings`,
  `💾 Save Store Settings`
);
content = content.replace(
  `placeholder="sk_test_"`,
  `placeholder="sk_test_••••••••••••••••"`
);

// 10. Append new Modals (Product Edit, Seller Add, Seller Edit, Voucher Edit) before closing </div>
const modalInsertionTarget = `    </div>\n  );\n};\n\nexport default AdminDashboardPage;`;

const extraModals = `      {/* MODAL 5: EDIT PRODUCT */}
      {isEditProductOpen && editingProduct && (
        <div className="zestro-modal-backdrop" onClick={() => setIsEditProductOpen(false)}>
          <div className="zestro-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="zestro-modal-header">
              <h3>✏️ Edit Product Details</h3>
              <button className="zestro-modal-close" onClick={() => setIsEditProductOpen(false)}></button>
            </div>
            <form onSubmit={handleUpdateProduct} className="zestro-modal-form">
              <div className="z-form-group">
                <label>Product Title</label>
                <input
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="z-form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.currentPrice || editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, currentPrice: Number(e.target.value), price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="z-form-group">
                  <label>Category / Occasion</label>
                  <input
                    type="text"
                    value={editingProduct.category || editingProduct.occasionName || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value, occasionName: e.target.value })}
                  />
                </div>
              </div>
              <div className="z-form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={editingProduct.images?.front || editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value, images: { ...(editingProduct.images || {}), front: e.target.value } })}
                />
              </div>
              <div className="z-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsEditProductOpen(false)}>Cancel</button>
                <button type="submit" className="btn-modal-save">💾 Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD SELLER */}
      {isAddSellerOpen && (
        <div className="zestro-modal-backdrop" onClick={() => setIsAddSellerOpen(false)}>
          <div className="zestro-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="zestro-modal-header">
              <h3>➕ Add New Verified Seller</h3>
              <button className="zestro-modal-close" onClick={() => setIsAddSellerOpen(false)}></button>
            </div>
            <form onSubmit={handleAddNewSeller} className="zestro-modal-form">
              <div className="z-form-group">
                <label>Company / Seller Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Chrono Technologies"
                  value={newSellerForm.name}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="z-form-group">
                <label>Category Specialty</label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Timepieces & Accessories"
                  value={newSellerForm.category}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, category: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="z-form-group">
                  <label>Initial Catalog Count</label>
                  <input
                    type="number"
                    value={newSellerForm.products}
                    onChange={(e) => setNewSellerForm({ ...newSellerForm, products: e.target.value })}
                  />
                </div>
                <div className="z-form-group">
                  <label>Seller Status</label>
                  <select
                    value={newSellerForm.status}
                    onChange={(e) => setNewSellerForm({ ...newSellerForm, status: e.target.value })}
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending Review">Pending Review</option>
                  </select>
                </div>
              </div>
              <div className="z-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsAddSellerOpen(false)}>Cancel</button>
                <button type="submit" className="btn-modal-save">➕ Create Seller</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: EDIT SELLER */}
      {isEditSellerOpen && editingSeller && (
        <div className="zestro-modal-backdrop" onClick={() => setIsEditSellerOpen(false)}>
          <div className="zestro-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="zestro-modal-header">
              <h3>✏️ Edit Seller Information</h3>
              <button className="zestro-modal-close" onClick={() => setIsEditSellerOpen(false)}></button>
            </div>
            <form onSubmit={handleUpdateSeller} className="zestro-modal-form">
              <div className="z-form-group">
                <label>Company / Seller Name</label>
                <input
                  type="text"
                  value={editingSeller.name || ''}
                  onChange={(e) => setEditingSeller({ ...editingSeller, name: e.target.value })}
                  required
                />
              </div>
              <div className="z-form-group">
                <label>Category Specialty</label>
                <input
                  type="text"
                  value={editingSeller.category || ''}
                  onChange={(e) => setEditingSeller({ ...editingSeller, category: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="z-form-group">
                  <label>Catalog Products Count</label>
                  <input
                    type="number"
                    value={editingSeller.products || 0}
                    onChange={(e) => setEditingSeller({ ...editingSeller, products: Number(e.target.value) })}
                  />
                </div>
                <div className="z-form-group">
                  <label>Rating</label>
                  <input
                    type="text"
                    value={editingSeller.rating || '4.9 ⭐'}
                    onChange={(e) => setEditingSeller({ ...editingSeller, rating: e.target.value })}
                  />
                </div>
              </div>
              <div className="z-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsEditSellerOpen(false)}>Cancel</button>
                <button type="submit" className="btn-modal-save">💾 Save Seller</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: EDIT VOUCHER */}
      {isEditVoucherOpen && editingVoucher && (
        <div className="zestro-modal-backdrop" onClick={() => setIsEditVoucherOpen(false)}>
          <div className="zestro-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="zestro-modal-header">
              <h3>✏️ Edit Voucher / Promo Code</h3>
              <button className="zestro-modal-close" onClick={() => setIsEditVoucherOpen(false)}></button>
            </div>
            <form onSubmit={handleUpdateVoucher} className="zestro-modal-form">
              <div className="z-form-group">
                <label>Promo Code</label>
                <input
                  type="text"
                  value={editingVoucher.code || ''}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="z-form-group">
                  <label>Discount Value</label>
                  <input
                    type="text"
                    value={editingVoucher.discount || ''}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, discount: e.target.value })}
                    required
                  />
                </div>
                <div className="z-form-group">
                  <label>Minimum Order (₹)</label>
                  <input
                    type="number"
                    value={editingVoucher.minOrder || 0}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, minOrder: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="z-form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={editingVoucher.expires || ''}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, expires: e.target.value })}
                />
              </div>
              <div className="z-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsEditVoucherOpen(false)}>Cancel</button>
                <button type="submit" className="btn-modal-save">💾 Save Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;`;

if (!content.includes('isEditProductOpen && editingProduct')) {
  content = content.replace(modalInsertionTarget, extraModals);
  console.log('Appended all extra modals (Product Edit, Seller Add/Edit, Voucher Edit)!');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('AdminDashboardPage.jsx successfully updated!');
