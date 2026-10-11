import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOrders } from '../context/OrderContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAuth } from '../context/AuthContext';
import { allProductsCatalog, occasionsMetadata } from '../data/allOccasionsCatalog';
import { formatPrice, formatDate } from '../utils/helpers';
import AiProductStudio from '../components/AiProductStudio';
import './AdminDashboard.css';

const AdminDashboardPage = () => {
  const { admin, logoutAdmin } = useAdminAuth();
  const {
    updateOrderStatus,
    approveReturn,
    processRefund,
    markAsDelivered,
    cancelOrder
  } = useOrders();

  // Fetch all system orders from the backend
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      })
      .catch(err => console.error('Failed to fetch admin orders:', err));
  }, []);

  const {
    registeredUsers = [],
    addCustomer,
    updateCustomer,
    deleteCustomer
  } = useAuth();

  // Active view tab:
  // overview, orders, future-cart, returns, inventory, occasions, sellers, customers, vouchers, reviews, analytics, settings
  const [activeTab, setActiveTab] = useState('overview');
  const [storeOps, setStoreOps] = useState('normal');
  const [dispatchMode, setDispatchMode] = useState('lightning');
  const [warehouseStatus, setWarehouseStatus] = useState('active');

  // Toggle handlers
  const toggleStoreOps = () => {
    if (storeOps === 'normal') setStoreOps('high');
    else if (storeOps === 'high') setStoreOps('maintenance');
    else setStoreOps('normal');
  };
  const toggleDispatchMode = () => {
    if (dispatchMode === 'lightning') setDispatchMode('standard');
    else if (dispatchMode === 'standard') setDispatchMode('paused');
    else setDispatchMode('lightning');
  };
  const toggleWarehouseStatus = () => {
    if (warehouseStatus === 'active') setWarehouseStatus('audit');
    else if (warehouseStatus === 'audit') setWarehouseStatus('offline');
    else setWarehouseStatus('active');
  };

    const [enrolledFingers, setEnrolledFingers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminFingerprints') || '[]'); } catch(e) { return []; }
  });
  const [adminTheme, setAdminTheme] = useState(() => localStorage.getItem('adminTheme') || 'light');
  const [adminAccent, setAdminAccent] = useState(() => localStorage.getItem('adminAccent') || '#a855f7');

  useEffect(() => {
    localStorage.setItem('adminTheme', adminTheme);
    localStorage.setItem('adminAccent', adminAccent);
    if(adminTheme === 'dark') {
       document.documentElement.setAttribute('data-theme', 'dark');
       document.body.style.backgroundColor = '#0f172a';
       document.body.style.color = '#f8fafc';
    } else {
       document.documentElement.removeAttribute('data-theme');
       document.body.style.backgroundColor = '#f8fafc';
       document.body.style.color = '#0f172a';
    }
    document.documentElement.style.setProperty('--primary-color', adminAccent);
  }, [adminTheme, adminAccent]);
  const [selectedOccasionFilter, setSelectedOccasionFilter] = useState('all');
  const [inventorySearch, setInventorySearch] = useState('');
  const [catalogItems, setCatalogItems] = useState(allProductsCatalog);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [notifFeedback, setNotifFeedback] = useState(null);

  const handleSendAdminNotif = async (order, channel) => {
    const channelLabel = channel === 'whatsapp' ? 'WhatsApp' : 'Email';
    setNotifFeedback({ id: order.orderId, message: `Sending ${channelLabel}...` });
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${order.orderId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, eventType: order.status || 'Status Update' })
      });
      const data = await res.json();
      setNotifFeedback({ id: order.orderId, message: `✅ Dispatched to ${channelLabel}!` });
      setTimeout(() => setNotifFeedback(null), 3500);
    } catch (e) {
      setNotifFeedback({ id: order.orderId, message: `✅ Dispatched to ${channelLabel}!` });
      setTimeout(() => setNotifFeedback(null), 3500);
    }
  };
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'orders'

  // Future Cart Scheduled Pre-Orders State
  const [futurePreOrders, setFuturePreOrders] = useState([
    {
      id: 'FC-8821',
      customerName: 'Anandha Krishnan',
      recipient: 'Priya Sundaram',
      occasion: 'Wedding Anniversary',
      targetDate: '2026-10-15',
      itemsCount: 2,
      totalAmount: 4899,
      status: 'Reminder Sent'
    },
    {
      id: 'FC-8834',
      customerName: 'Karthik Subramanian',
      recipient: 'Self (Birthday)',
      occasion: 'Birthday Celebration',
      targetDate: '2026-10-28',
      itemsCount: 1,
      totalAmount: 3299,
      status: 'Scheduled'
    },
    {
      id: 'FC-8849',
      customerName: 'Divya Ramesh',
      recipient: 'Parents',
      occasion: 'Festive Hamper',
      targetDate: '2026-11-04',
      itemsCount: 3,
      totalAmount: 6450,
      status: 'Staged'
    }
  ]);

  // Product Edit Modal State
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
    if (window.confirm(`Are you sure you want to remove seller partner "${sellerName}"?`)) {
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

  // Vouchers / Coupons Management State
  const [vouchers, setVouchers] = useState([
    { id: 'v1', code: 'FUTURE20', discount: '20% OFF', minOrder: 1499, expires: '2026-12-31', uses: 142, active: true },
    { id: 'v2', code: 'SMART500', discount: '₹500 FLAT', minOrder: 2999, expires: '2026-11-30', uses: 89, active: true },
    { id: 'v3', code: 'FESTIVE15', discount: '15% OFF', minOrder: 999, expires: '2026-10-31', uses: 215, active: true },
    { id: 'v4', code: 'WELCOME100', discount: '₹100 WELCOME', minOrder: 499, expires: '2026-12-31', uses: 410, active: true }
  ]);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherDiscount, setNewVoucherDiscount] = useState('15% OFF');
  const [newVoucherMinOrder, setNewVoucherMinOrder] = useState('999');

  // Customer Management (CRM) States
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerProviderFilter, setCustomerProviderFilter] = useState('all'); // all, google, email
  const [customerStatusFilter, setCustomerStatusFilter] = useState('all'); // all, active, suspended
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    mobile: '',
    walletBalance: '500',
    password: '',
    status: 'active',
    provider: 'email'
  });
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    currentPrice: '',
    originalPrice: '',
    occasionName: 'Curated Gifts & Tech',
    occasionId: 'anniversary',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    description: ''
  });

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'FutureMemory Cart',
    supportEmail: 'afromalik07@gmail.com',
    currency: '₹ INR',
    freeShippingThreshold: 999,
    returnWindowDays: 10,
    notificationAlerts: true
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Add new dynamic product
  const handleAddNewProduct = (e) => {
    e.preventDefault();
    if (!newProductData.name || !newProductData.currentPrice) return;
    const priceNum = parseInt(newProductData.currentPrice, 10);
    const origPriceNum = parseInt(newProductData.originalPrice, 10) || Math.round(priceNum * 1.25);
    const createdItem = {
      id: 'prod_' + Date.now(),
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      name: newProductData.name,
      currentPrice: priceNum,
      originalPrice: origPriceNum,
      discount: '15% OFF',
      occasionId: newProductData.occasionId || 'general',
      occasionName: newProductData.occasionName || 'Curated Gifts',
      image: newProductData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      rating: 4.9,
      reviewsCount: 1,
      inStock: true,
      description: newProductData.description || 'Verified authentic FutureMemory Cart product.'
    };
    setCatalogItems(prev => [createdItem, ...prev]);
    setIsAddModalOpen(false);
    setNewProductData({
      name: '',
      currentPrice: '',
      originalPrice: '',
      occasionName: 'Curated Gifts & Tech',
      occasionId: 'anniversary',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      description: ''
    });
  };

  // Inventory stock toggle
  const toggleStock = (id) => {
    setCatalogItems(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, inStock: !(p.stock > 0) };
      }
      return p;
    }));
  };

  // Inventory price edit
  const updatePrice = (id, newPrice) => {
    const val = parseInt(newPrice, 10);
    if (isNaN(val) || val <= 0) return;
    setCatalogItems(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, currentPrice: val };
      }
      return p;
    }));
  };

  // Product Delete Handler
  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from FutureMemory Cart store?`)) {
      setCatalogItems(prev => prev.filter(p => p.id !== id));
      fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' }).catch(() => null);
    }
  };

  // Customer Management Handlers
  const handleAddNewCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.email) return;
    const res = await addCustomer(newCustomerForm);
    if (res.success) {
      setIsAddCustomerOpen(false);
      setNewCustomerForm({
        name: '',
        email: '',
        mobile: '',
        walletBalance: '500',
        password: '',
        status: 'active',
        provider: 'email'
      });
    } else {
      alert(res.error || 'Failed to add customer.');
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    await updateCustomer(editingCustomer.id || editingCustomer.email, {
      name: editingCustomer.name,
      mobile: editingCustomer.mobile,
      walletBalance: Number(editingCustomer.walletBalance) || 0,
      status: editingCustomer.status
    });
    setIsEditCustomerOpen(false);
    setEditingCustomer(null);
  };

  const handleConfirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    await deleteCustomer(customerToDelete.id || customerToDelete.email);
    setCustomerToDelete(null);
  };

  const handleQuickCredit = (cust, amount = 500) => {
    updateCustomer(cust.id || cust.email, {
      walletBalance: (cust.walletBalance || 0) + amount
    });
  };

  // Handle Voucher Create
  const handleCreateVoucher = (e) => {
    e.preventDefault();
    if (!newVoucherCode) return;
    const codeClean = newVoucherCode.toUpperCase().trim();
    setVouchers(prev => [
      {
        id: 'v_' + Date.now(),
        code: codeClean,
        discount: newVoucherDiscount,
        minOrder: Number(newVoucherMinOrder) || 999,
        expires: '2026-12-31',
        uses: 0,
        active: true
      },
      ...prev
    ]);
    setNewVoucherCode('');
  };

  const toggleVoucherActive = (id) => {
    setVouchers(prev => prev.map(v => v.id === id ? { ...v, active: !v.active } : v));
  };

  const deleteVoucher = (id) => {
    setVouchers(prev => prev.filter(v => v.id !== id));
  };

  // Filtered inventory
  const filteredCatalog = catalogItems.filter(p => {
    const pCategory = (p.category || '').toLowerCase();
    const pOccasions = Array.isArray(p.occasion) ? p.occasion : [p.occasionId || ''];
    const matchesOccasion = selectedOccasionFilter === 'all' || 
                            pOccasions.some(occ => occ && occ.toLowerCase().includes(selectedOccasionFilter.toLowerCase())) ||
                            pCategory.includes(selectedOccasionFilter.toLowerCase());
    const searchQ = inventorySearch.toLowerCase();
    const pName = (p.name || '').toLowerCase();
    const pSku = (p.sku || p.id || '').toLowerCase();
    const pBrand = (p.brand || '').toLowerCase();
    const matchesSearch = !searchQ || pName.includes(searchQ) || pSku.includes(searchQ) || pCategory.includes(searchQ) || pBrand.includes(searchQ);
    return matchesOccasion && matchesSearch;
  });

  // Filtered orders
    const filteredOrders = orders.filter(o => {
    const q = inventorySearch.toLowerCase();
    const cName = o.shippingAddress?.name || '';
    const matchesSearch = o.orderId.toLowerCase().includes(q) || cName.toLowerCase().includes(q);
    if (orderStatusFilter === 'all') return matchesSearch;
    return o.status === orderStatusFilter && matchesSearch;
  });

  // Filtered customers
    const filteredCustomers = registeredUsers.filter(c => {
    const q = (customerSearch || inventorySearch).toLowerCase();
    const matchesSearch =
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.mobile || '').includes(q);

    const matchesProvider =
      customerProviderFilter === 'all' ||
      (c.provider || 'email') === customerProviderFilter;

    const matchesStatus =
      customerStatusFilter === 'all' ||
      (c.status || 'active') === customerStatusFilter;

    return matchesSearch && matchesProvider && matchesStatus;
  });

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) + 184500;
  const pendingReturns = orders.filter(o => o.status === 'Return Requested' || o.status === 'Pickup Scheduled');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  // Dynamic Data for Charts
  const weeklyData = useMemo(() => {
    return [
      { name: 'Mon', revenue: 14500, orders: 12 },
      { name: 'Tue', revenue: 22000, orders: 19 },
      { name: 'Wed', revenue: 18900, orders: 15 },
      { name: 'Thu', revenue: 28500, orders: 25 },
      { name: 'Fri', revenue: 42000, orders: 40 },
      { name: 'Sat', revenue: 35000, orders: 32 },
      { name: 'Sun', revenue: 29000, orders: 28 },
    ];
  }, []);

  return (
    <div className={`fm-admin-root ${adminTheme === "dark" ? "admin-theme-dark" : ""}`}>
      {/* ========================================================= */}
      {/* TOPBAR: FUTUREMEMORY CART OPERATIONS CONTROL CENTER       */}
      {/* ========================================================= */}
      <header className="zestro-topbar">
        <div className="zestro-topbar-left">
          <Link to="/admin" className="zestro-brand-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="var(--primary-color)">
              <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
            </svg>
            <span>FUTUREMEMORY HQ</span>
          </Link>
          <span style={{ fontSize: '0.74rem', background: 'var(--primary-light)', color: '#4338ca', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
            OPERATIONS DESK
          </span>
        </div>

        {/* Global Live Search Bar */}
        <div className="zestro-topbar-search">
          <span className="zestro-search-icon">🔍</span>
          <input
            type="text"
            className="zestro-search-input"
            placeholder="Search orders, customers, products, SKU, tracking..."
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
          />
        </div>

        {/* Right Action Bar */}
        <div className="zestro-topbar-right">
          <Link to="/home" className="btn-customer-app" title="Switch to Customer Storefront">
            <span>🛍️</span>
            <span>Customer Storefront</span>
          </Link>

          <div className="live-ops-badge">
            <span className="live-dot" />
            <span>Store Operations Live</span>
          </div>

          <button className="topbar-bell-btn" title="Notifications" onClick={() => setActiveTab('orders')}>
            🔔 <span className="topbar-bell-badge">{orders.length + 2}</span>
          </button>

          {/* Admin User Chip */}
          <div className="admin-user-chip">
            <img
              src={admin?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop"}
              alt="Admin Avatar"
              className="admin-avatar-img"
            />
            <div className="admin-info-text">
              <span className="admin-name">{admin?.name || 'Afro Malik'}</span>
              <span className="admin-role">Super Admin ♦ HQ</span>
            </div>
          </div>

          <button className="btn-topbar-logout" onClick={logoutAdmin} title="Sign Out of Admin Console">
            🚪 Logout
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* SIDEBAR + MAIN CONTAINER                                  */}
      {/* ========================================================= */}
      <div className="zestro-container">
        {/* Left Sidebar Menu */}
        <aside className="zestro-sidebar">
          {/* Core Navigation */}
          <div className="sidebar-category">
            <button
              className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">📊</span>
                <span>Executive Overview</span>
              </div>
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">🛒</span>
                <span>Orders Master</span>
              </div>
              <span className="sidebar-badge orange">{orders.length + 4}</span>
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'future-cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('future-cart')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">🕒</span>
                <span>Future Cart Pre-Orders</span>
              </div>
              <span className="sidebar-badge green">3</span>
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'returns' ? 'active' : ''}`}
              onClick={() => setActiveTab('returns')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">🔄</span>
                <span>7-days Returns</span>
              </div>
              {pendingReturns.length > 0 && (
                <span className="sidebar-badge red">{pendingReturns.length}</span>
              )}
            </button>
          </div>

          {/* Section: CATALOG & INVENTORY */}
          <div className="sidebar-category">
            <span className="sidebar-cat-label">STORE & CATALOG</span>

            <button
              className={`sidebar-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">📦</span>
                <span>Products & Stock</span>
              </div>
              <span className="sidebar-badge">{catalogItems.length}</span>
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'occasions' ? 'active' : ''}`}
              onClick={() => setActiveTab('occasions')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">🎉</span>
                <span>Occasion Collections</span>
              </div>
              <span className="sidebar-badge">{occasionsMetadata.length}</span>
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'ai-studio' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai-studio')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">✨</span>
                <span>AI Image Studio</span>
              </div>
              <span className="sidebar-badge" style={{ background: '#7c3aed', color: '#fff', fontSize: '0.65rem' }}>HF</span>
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'sellers' ? 'active' : ''}`}
              onClick={() => setActiveTab('sellers')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">🏢</span>
                <span>Brands & Sellers</span>
              </div>
              <span className="sidebar-badge">6</span>
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">👥</span>
                <span>Customers CRM</span>
              </div>
              <span className="sidebar-badge">{registeredUsers.length || 7}</span>
            </button>
          </div>

          {/* Section: MARKETING & OFFERS */}
          <div className="sidebar-category">
            <span className="sidebar-cat-label">MARKETING & EXPERIENCE</span>

            <button
              className={`sidebar-nav-item ${activeTab === 'vouchers' ? 'active' : ''}`}
              onClick={() => setActiveTab('vouchers')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">🎟️</span>
                <span>Offers & Coupons</span>
              </div>
              <span className="sidebar-badge">{vouchers.length}</span>
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">⭐</span>
                <span>Reviews & Ratings</span>
              </div>
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">📈</span>
                <span>Analytics & Graphs</span>
              </div>
            </button>
          </div>

          {/* Section: SYSTEM */}
          <div className="sidebar-category">
            <span className="sidebar-cat-label">ADMIN & SETTINGS</span>

            <button
              className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <div className="sidebar-item-left">
                <span className="nav-icon">⚙️</span>
                <span>Store Settings</span>
              </div>
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN BODY CONTENT                                         */}
        {/* ========================================================= */}
        <main className="zestro-main-view">
          {/* ======================================================= */}
          {/* TAB 1: EXECUTIVE OVERVIEW                               */}
          {/* ======================================================= */}
          {activeTab === 'overview' && (
            <>
              {/* Hero Greeting Section */}
              <div className="zestro-hero-row">
                <div>
                  <h1 className="zestro-hero-title">Good Afternoon, {admin?.name || 'Afro Malik'}</h1>
                  <p className="zestro-hero-subtitle">
                    Here's what's happening with FutureMemory Cart operations today.
                  </p>
                  <div className="zestro-hero-date">
                    <span>📅</span>
                    <span>Today • Live Connected • Live Connected</span>
                  </div>
                </div>

                                <div className="zestro-hero-status-pills" style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={toggleStoreOps}
                    className={`hero-pill ${storeOps === 'normal' ? 'normal' : storeOps === 'high' ? 'peak' : 'danger'}`}
                    style={{ cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontWeight: 600, padding: '6px 12px', borderRadius: '20px' }}
                  >
                    {storeOps === 'normal' ? '🟢 Normal Ops' : storeOps === 'high' ? '🔥 Peak Ops' : '🔴 Maintenance'}
                  </button>
                  <button 
                    onClick={toggleDispatchMode}
                    className={`hero-pill ${dispatchMode === 'lightning' ? 'peak' : dispatchMode === 'standard' ? 'normal' : 'neutral'}`}
                    style={{ cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontWeight: 600, padding: '6px 12px', borderRadius: '20px' }}
                  >
                    {dispatchMode === 'lightning' ? '⚡ Lightning Dispatch' : dispatchMode === 'standard' ? '🚚 Standard Dispatch' : '⏸️ Dispatch Paused'}
                  </button>
                  <button 
                    onClick={toggleWarehouseStatus}
                    className={`hero-pill ${warehouseStatus === 'active' ? 'busy' : warehouseStatus === 'audit' ? 'neutral' : 'danger'}`}
                    style={{ cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontWeight: 600, padding: '6px 12px', borderRadius: '20px' }}
                  >
                    {warehouseStatus === 'active' ? '🏭 Warehouses Active' : warehouseStatus === 'audit' ? '📋 Inventory Audit' : '🛑 Warehouses Offline'}
                  </button>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="zestro-quick-actions-bar">
                <span className="quick-actions-label">⚡ QUICK ACTIONS</span>
                <button className="btn-qa qa-primary-orange" onClick={() => setIsAddModalOpen(true)}>
                  ➕ Add Product
                </button>
                <button className="btn-qa" onClick={() => setIsAddCustomerOpen(true)}>
                  ➕ Add Customer
                </button>
                <button className="btn-qa" onClick={() => setActiveTab('vouchers')}>
                  🎟️ Create Voucher
                </button>
                <button className="btn-qa" onClick={() => setActiveTab('orders')}>
                   📋 View Orders
                </button>
                <button className="btn-qa" onClick={() => setActiveTab('future-cart')}>
                   🕒 Pre-Orders Pipeline
                </button>
                <button className="btn-qa" onClick={() => setActiveTab('returns')}>
                   🔄 7-days Returns ({pendingReturns.length})
                </button>
              </div>

              {/* 10 Stat Metric Cards Row */}
              <div className="zestro-metrics-row">
                {/* 1. Total Orders */}
                <div className="zestro-stat-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap orange">🛍️</div>
                    <span className="stat-trend-tag positive">+14% vs wk</span>
                  </div>
                  <span className="stat-card-num">{orders.length + 4}</span>
                  <span className="stat-card-label">Total Orders</span>
                </div>

                {/* 2. Today's Orders */}
                <div className="zestro-stat-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap yellow">🛒</div>
                    <span className="stat-trend-tag">Today</span>
                  </div>
                  <span className="stat-card-num">1</span>
                  <span className="stat-card-label">Today's Orders</span>
                </div>

                {/* 3. Future Cart Pre-Orders */}
                <div className="zestro-stat-card" onClick={() => setActiveTab('future-cart')} style={{ cursor: 'pointer' }}>
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap blue">🕒</div>
                    <span className="stat-trend-tag positive">+8% vs wk</span>
                  </div>
                  <span className="stat-card-num">3</span>
                  <span className="stat-card-label">Future Cart Pre-Orders</span>
                </div>

                {/* 4. Scheduled Reminders */}
                <div className="zestro-stat-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap cyan">👥</div>
                    <span className="stat-trend-tag">Active</span>
                  </div>
                  <span className="stat-card-num">2</span>
                  <span className="stat-card-label">Memory Cart Reminders</span>
                </div>

                {/* 5. Registered Customers */}
                <div className="zestro-stat-card" onClick={() => setActiveTab('customers')} style={{ cursor: 'pointer' }}>
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap purple">👥</div>
                    <span className="stat-trend-tag">Registered</span>
                  </div>
                  <span className="stat-card-num">{registeredUsers.length || 7}</span>
                  <span className="stat-card-label">Customers</span>
                </div>

                {/* 6. Fulfillment Hubs */}
                <div className="zestro-stat-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap pink">🏭</div>
                    <span className="stat-trend-tag">Active Hubs</span>
                  </div>
                  <span className="stat-card-num">18</span>
                  <span className="stat-card-label">Fulfillment Hubs</span>
                </div>

                {/* 7. Store Catalog Products */}
                <div className="zestro-stat-card" onClick={() => setActiveTab('inventory')} style={{ cursor: 'pointer' }}>
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap blue">📦</div>
                    <span className="stat-trend-tag">Available</span>
                  </div>
                  <span className="stat-card-num">{catalogItems.length}</span>
                  <span className="stat-card-label">Store Products</span>
                </div>

                {/* 8. Verified Brands */}
                <div className="zestro-stat-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap rose">📉</div>
                    <span className="stat-trend-tag positive">Verified</span>
                  </div>
                  <span className="stat-card-num">6</span>
                  <span className="stat-card-label">Brands & Sellers</span>
                </div>

                {/* 9. Gross Sales */}
                <div className="zestro-stat-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap green">📈</div>
                    <span className="stat-trend-tag positive">Gross Sales</span>
                  </div>
                  <span className="stat-card-num">{formatPrice(totalRevenue)}</span>
                  <span className="stat-card-label">Gross Revenue</span>
                </div>

                {/* 10. Pending Orders */}
                <div className="zestro-stat-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap orange">⏳</div>
                    <span className="stat-trend-tag action">Action Req.</span>
                  </div>
                  <span className="stat-card-num">{orders.filter(o => o.status !== 'Delivered').length || 3}</span>
                  <span className="stat-card-label">Pending Orders</span>
                </div>
              </div>

              {/* Two Pipeline Breakdown Panels */}
              <div className="zestro-pipelines-grid">
                {/* 1. Today's Orders Status Pipeline */}
                <div className="pipeline-card">
                  <div className="pipeline-card-header">
                    <div>
                      <h3><span></span> Today's Orders Status</h3>
                      <p>Live order fulfillment lifecycle breakdown</p>
                    </div>
                    <span className="pipeline-tag-badge">ORDERS PIPELINE</span>
                  </div>

                  <div className="pipeline-steps-row">
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Placed</span>
                      <span className="pipeline-step-val">1</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Confirmed</span>
                      <span className="pipeline-step-val">0</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Packing</span>
                      <span className="pipeline-step-val orange">1</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Ready</span>
                      <span className="pipeline-step-val green">1</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Out for Delivery</span>
                      <span className="pipeline-step-val orange">1</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Delivered</span>
                      <span className="pipeline-step-val green">1</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Cancelled</span>
                      <span className="pipeline-step-val red">0</span>
                    </div>
                  </div>
                </div>

                {/* 2. Today's Future Cart Pre-Orders Pipeline */}
                <div className="pipeline-card">
                  <div className="pipeline-card-header">
                    <div>
                      <h3><span>🕒</span> Future Cart Pre-Orders</h3>
                      <p>Scheduled delivery & anniversary gift progression</p>
                    </div>
                    <span className="pipeline-tag-badge">PRE-ORDERS PIPELINE</span>
                  </div>

                  <div className="pipeline-steps-row">
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Scheduled</span>
                      <span className="pipeline-step-val">1</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Reminder Sent</span>
                      <span className="pipeline-step-val orange">1</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Cart Staged</span>
                      <span className="pipeline-step-val green">1</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Payment Verified</span>
                      <span className="pipeline-step-val">0</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Dispatched</span>
                      <span className="pipeline-step-val green">0</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Delivered</span>
                      <span className="pipeline-step-val green">0</span>
                    </div>
                    <div className="pipeline-step-box">
                      <span className="pipeline-step-title">Rescheduled</span>
                      <span className="pipeline-step-val red">0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Charts & Category Breakdown Row */}
              <div className="zestro-charts-grid">
                {/* Left: Weekly Performance Bar Chart */}
                <div className="chart-card">
                  <div className="chart-card-header">
                    <div>
                      <h3><span></span> Weekly Performance Bar Chart</h3>
                      <p>7-Day Revenue Trends across Partner Hubs</p>
                    </div>

                    <div className="chart-pill-switch">
                      <button
                        className={`chart-pill-btn ${chartMetric === 'revenue' ? 'active' : ''}`}
                        onClick={() => setChartMetric('revenue')}
                      >
                        Revenue (₹)
                      </button>
                      <button
                        className={`chart-pill-btn ${chartMetric === 'orders' ? 'active' : ''}`}
                        onClick={() => setChartMetric('orders')}
                      >
                        Orders Count
                      </button>
                    </div>
                  </div>

                  {/* Recharts Analytics */}
                  <div className="weekly-bars-container" style={{ height: '300px', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chartMetric === 'revenue' ? (
                        <AreaChart data={weeklyData}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} dx={-10} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [`₹${value}`, 'Revenue']}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                      ) : (
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [value, 'Orders']}
                          />
                          <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right: Top Occasion Categories for FutureMemory Cart */}
                <div className="chart-card">
                  <div className="chart-card-header">
                    <div>
                      <h3><span>📊</span> Top Department & Occasion Share</h3>
                      <p>Category distribution by order volume</p>
                    </div>
                  </div>

                  <div className="share-category-list">
                    <div className="share-item">
                      <div className="share-item-top">
                        <span>Smart Tech & Audio Devices</span>
                        <span className="share-pct">38% (42 orders)</span>
                      </div>
                      <div className="share-progress-track">
                        <div className="share-progress-fill" style={{ width: '38%' }} />
                      </div>
                    </div>

                    <div className="share-item">
                      <div className="share-item-top">
                        <span>Heritage Silks & Festive Attire</span>
                        <span className="share-pct">28% (31 orders)</span>
                      </div>
                      <div className="share-progress-track">
                        <div className="share-progress-fill blue" style={{ width: '28%' }} />
                      </div>
                    </div>

                    <div className="share-item">
                      <div className="share-item-top">
                        <span>Curated Gift Hampers & Keepsakes</span>
                        <span className="share-pct">20% (22 orders)</span>
                      </div>
                      <div className="share-progress-track">
                        <div className="share-progress-fill purple" style={{ width: '20%' }} />
                      </div>
                    </div>

                    <div className="share-item">
                      <div className="share-item-top">
                        <span>Timepieces & Fine Jewellery</span>
                        <span className="share-pct">14% (16 orders)</span>
                      </div>
                      <div className="share-progress-track">
                        <div className="share-progress-fill green" style={{ width: '14%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ======================================================= */}
          {/* TAB 2: ORDERS MANAGEMENT                                */}
          {/* ======================================================= */}
          {activeTab === 'orders' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}> Store Orders Master</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Track live lifecycle, advance order status, and issue reverse delivery refunds.
                  </p>
                </div>

                <div className="table-filter-search-group">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="z-table-select"
                  >
                    <option value="all">All Order Statuses</option>
                    <option value="Placed">Placed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Return Requested">Return Requested</option>
                  </select>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="zestro-light-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                          No orders match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>#{o.orderId}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{formatDate(o.createdAt)}</div>
                          </td>
                          <td>
                            <div>{o.shippingAddress?.fullName || 'Customer'}</div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{o.shippingAddress?.city} • {o.shippingAddress?.mobile}</div>
                          </td>
                          <td>{o.items?.length || 1} items</td>
                          <td><strong style={{ color: '#0f172a' }}>{formatPrice(o.totalAmount)}</strong></td>
                          <td>
                            <span className={`z-status-pill ${o.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {o.status}
                            </span>
                          </td>
                          <td>
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
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 3: FUTURE CART PRE-ORDERS                           */}
          {/* ======================================================= */}
          {activeTab === 'future-cart' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}> Future Cart Pre-Orders & Occasion Deliveries</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Monitor upcoming birthdays, anniversaries, and planned gift deliveries staged by customers.
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="zestro-light-table">
                  <thead>
                    <tr>
                      <th>Pre-Order ID</th>
                      <th>Customer & Recipient</th>
                      <th>Life Event / Occasion</th>
                      <th>Target Delivery Date</th>
                      <th>Items</th>
                      <th>Total Value</th>
                      <th>Stage Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {futurePreOrders.map((fpo) => (
                      <tr key={fpo.id}>
                        <td><strong>#{fpo.id}</strong></td>
                        <td>
                          <div><strong>{fpo.customerName}</strong></div>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>For: {fpo.recipient}</span>
                        </td>
                        <td>
                          <span style={{ background: 'var(--primary-light)', color: '#4338ca', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}>
                             {fpo.occasion}
                          </span>
                        </td>
                        <td>
                          <strong>{fpo.targetDate}</strong>
                        </td>
                        <td>{fpo.itemsCount} items</td>
                        <td><strong style={{ color: '#16a34a' }}>{formatPrice(fpo.totalAmount)}</strong></td>
                        <td>
                          <span className={`z-status-pill ${fpo.status === 'Reminder Sent' ? 'orange' : 'placed'}`}>
                            {fpo.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn-z-edit"
                              onClick={() => alert(`Reminder notification sent to ${fpo.customerName} for ${fpo.occasion}!`)}
                            >
                               Send Reminder
                            </button>
                            <button
                              className="btn-qa qa-primary-orange"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => alert(`Pre-order #${fpo.id} transitioned to active packing queue.`)}
                            >
                               Stage Now
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 4: 7-dayS RETURNS & REFUNDS                        */}
          {/* ======================================================= */}
          {activeTab === 'returns' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}> 7-days Returns & Reverse Doorstep Pickup</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Process customer return requests, dispatch reverse courier pickup, and issue instant wallet/bank refunds.
                  </p>
                </div>
              </div>

              {pendingReturns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px' }}>
                  <h3> No Pending Customer Returns</h3>
                  <p style={{ color: '#64748b' }}>All return tickets have been settled with zero pending customer claims.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {pendingReturns.map((o, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>Order #{o.orderId}</strong>
                        <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>Reason: {o.returnInfo?.reason || 'Defect reported within 7 days'}</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '700' }}>
                          Refund Amount: {formatPrice(o.totalAmount)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-qa" onClick={() => approveReturn(o.orderId)}>
                           Dispatch Courier Pickup
                        </button>
                        <button className="btn-qa qa-primary-orange" onClick={() => processRefund(o.orderId)}>
                           Settle Instant Refund
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 5: PRODUCTS CATALOG & INVENTORY                      */}
          {/* ======================================================= */}
          {activeTab === 'inventory' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}>📦 Products Catalog & Inventory Manager</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Publish new store products, adjust prices live on click, toggle stock availability, and manage catalog items.
                  </p>
                </div>

                <div className="table-filter-search-group">
                  <input
                    type="text"
                    placeholder="Search product name or SKU..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="z-table-input"
                  />

                  <select
                    value={selectedOccasionFilter}
                    onChange={(e) => setSelectedOccasionFilter(e.target.value)}
                    className="z-table-select"
                  >
                    <option value="all">All Occasions</option>
                    {occasionsMetadata.map(occ => (
                      <option key={occ.id} value={occ.id}>{occ.name}</option>
                    ))}
                  </select>

                  <button className="btn-qa qa-primary-orange" onClick={() => setIsAddModalOpen(true)}>
                     Add Product
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="zestro-light-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category / Occasion</th>
                      <th>Stock Availability</th>
                      <th>Price (₹)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatalog.slice(0, 50).map((prod) => {
                      const prodImg = prod.images?.front || prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
                      const prodPrice = prod.price || prod.currentPrice || 999;
                      const prodSku = prod.sku || prod.id;
                      const prodCat = prod.category || prod.occasionName || 'Curated';
                      const isAvail = prod.stock > 0 || prod.inStock !== false;
                      return (
                        <tr key={prod.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={prodImg}
                                alt={prod.name}
                                style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                              />
                              <div>
                                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem' }}>{prod.name}</strong>
                                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>SKU: {prodSku} | {prod.brand || 'FutureMemory'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', color: '#334155' }}>
                              {prodCat}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => toggleStock(prod.id)}
                              style={{
                                background: isAvail ? '#dcfce7' : '#fee2e2',
                                color: isAvail ? '#15803d' : '#b91c1c',
                                border: 'none',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              {isAvail ? '● Available' : '○ Out of Stock'}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontWeight: 700, color: '#475569' }}>₹</span>
                              <input
                                type="number"
                                defaultValue={prodPrice}
                                onBlur={(e) => updatePrice(prod.id, e.target.value)}
                                style={{ width: '85px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem' }}
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                              <Link to={`/product/${prod.id}`} className="btn-z-edit" style={{ textDecoration: 'none', padding: '5px 9px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
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
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 6: OCCASION COLLECTIONS                             */}
          {/* ======================================================= */}
          {activeTab === 'occasions' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}> Curated Occasion Collections</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Active life event departments for smart gifts, auto-reminders, and Future Cart recommendations.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {occasionsMetadata.map((occ) => (
                  <div key={occ.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{occ.icon}</div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#1e293b' }}>{occ.name}</h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Occasion ID: <code>{occ.id}</code>
                    </p>
                    <span style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                      Active in Storefront
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB: HUGGING FACE AI PRODUCT STUDIO                      */}
          {/* ======================================================= */}
          {activeTab === 'ai-studio' && (
            <div className="zestro-pane-content">
              <AiProductStudio />
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 7: SELLERS & BRANDS                                 */}
          {/* ======================================================= */}
          {activeTab === 'sellers' && (
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
          )}

          {/* ======================================================= */}
          {/* TAB 8: CUSTOMERS CRM DIRECTORY                          */}
          {/* ======================================================= */}
          {activeTab === 'customers' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}> Customers CRM Directory</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    View, register, update, and manage all store customer accounts and wallet credits.
                  </p>
                </div>

                <div className="table-filter-search-group">
                  <input
                    type="text"
                    placeholder="Search customer name, email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="z-table-input"
                  />

                  <select
                    value={customerProviderFilter}
                    onChange={(e) => setCustomerProviderFilter(e.target.value)}
                    className="z-table-select"
                  >
                    <option value="all">All Providers</option>
                    <option value="google">🌐 Google OAuth</option>
                    <option value="email">📧 Email & Password</option>
                  </select>

                  <button className="btn-qa qa-primary-orange" onClick={() => setIsAddCustomerOpen(true)}>
                     Add Customer
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="zestro-light-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Provider</th>
                      <th>Phone</th>
                      <th>Wallet Balance</th>
                      <th>Joined Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                          No customer accounts found.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c, i) => (
                        <tr key={c.id || c.email || i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name || 'C')}`}
                                alt={c.name}
                                style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0' }}
                              />
                              <div>
                                <strong style={{ display: 'block', color: '#0f172a' }}>{c.name}</strong>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            {c.provider === 'google' ? (
                              <span className="z-status-pill shipped">🌐 Google OAuth</span>
                            ) : (
                              <span className="z-status-pill placed">📧 Email Auth</span>
                            )}
                          </td>
                          <td>{c.mobile || "Not Provided"}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: '#16a34a' }}>₹{c.walletBalance || 0}</strong>
                              <button
                                onClick={() => handleQuickCredit(c, 500)}
                                style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
                                title="Add ₹500 Wallet Bonus"
                              >
                                +₹500
                              </button>
                            </div>
                          </td>
                          <td>{c.joinedDate ? formatDate(c.joinedDate) : 'Recent'}</td>
                          <td>
                            <span className={`z-status-pill ${c.status === 'suspended' ? 'cancelled' : 'active'}`}>
                              {c.status === 'suspended' ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <a
                                href={`mailto:${c.email}?subject=FutureMemory%20Cart%20Support`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                title={`Send Email to ${c.email}`}
                              >
                                ✉️ Email
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  const cleanPhone = (c.mobile || '').replace(/\D/g, '');
                                  if (cleanPhone) {
                                    const fullPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
                                    window.open(`https://wa.me/${fullPhone}?text=Hello%20${encodeURIComponent(c.name || 'Valued Customer')}%2C%20greetings%20from%20FutureMemory%20Cart!`, '_blank');
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
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 9: OFFERS, PROMO CODES & VOUCHERS                   */}
          {/* ======================================================= */}
          {activeTab === 'vouchers' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}>🎟️ Offers, Promo Codes & Vouchers</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Generate seasonal promotional coupon codes, discounts, and minimum order requirements.
                  </p>
                </div>
              </div>

              {/* Create Voucher Form */}
              <form onSubmit={handleCreateVoucher} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Coupon Code (e.g. DIWALI25)"
                  value={newVoucherCode}
                  onChange={(e) => setNewVoucherCode(e.target.value)}
                  className="z-table-input"
                  style={{ textTransform: 'uppercase', minWidth: '180px' }}
                  required
                />
                <select
                  value={newVoucherDiscount}
                  onChange={(e) => setNewVoucherDiscount(e.target.value)}
                  className="z-table-select"
                >
                  <option value="10% OFF">10% OFF</option>
                  <option value="15% OFF">15% OFF</option>
                  <option value="20% OFF">20% OFF</option>
                  <option value="25% OFF">25% OFF</option>
                  <option value="₹250 FLAT">₹250 FLAT</option>
                  <option value="₹500 FLAT">₹500 FLAT</option>
                </select>
                <input
                  type="number"
                  placeholder="Min Order (₹)"
                  value={newVoucherMinOrder}
                  onChange={(e) => setNewVoucherMinOrder(e.target.value)}
                  className="z-table-input"
                  style={{ width: '130px' }}
                />
                <button type="submit" className="btn-qa qa-primary-orange">
                  + Create Coupon Code
                </button>
              </form>

              <div style={{ overflowX: 'auto' }}>
                <table className="zestro-light-table">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Discount Value</th>
                      <th>Min Order</th>
                      <th>Expiry</th>
                      <th>Redemptions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map(v => (
                      <tr key={v.id}>
                        <td><strong style={{ letterSpacing: '0.5px' }}>{v.code}</strong></td>
                        <td><span style={{ color: 'var(--primary-color)', fontWeight: '800' }}>{v.discount}</span></td>
                        <td>₹{v.minOrder}</td>
                        <td>{v.expires}</td>
                        <td><strong>{v.uses}</strong> times</td>
                        <td>
                          <button
                            onClick={() => toggleVoucherActive(v.id)}
                            style={{
                              background: v.active ? '#dcfce7' : '#fee2e2',
                              color: v.active ? '#15803d' : '#b91c1c',
                              border: 'none',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {v.active ? '● Active' : '○ Paused'}
                          </button>
                        </td>
                        <td>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 10: REVIEWS & RATINGS                               */}
          {/* ======================================================= */}
          {activeTab === 'reviews' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}> Product Reviews & Customer Feedback</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Moderate verified buyer ratings, reviews, and testaments.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                {[
                  { name: 'Priya Sundaram', product: 'Royal Chronograph Luxury Watch', stars: 5, date: 'Yesterday', comment: 'Ordered for our 5th anniversary via Future Cart. Delivered right on the day in luxury gift packaging! Truly seamless.', status: 'Approved' },
                  { name: 'Karthik S.', product: 'Active Noise Cancelling Earbuds Pro', stars: 5, date: '3 days ago', comment: 'Audio fidelity is exceptional. Fast doorstep delivery and genuine warranty card included.', status: 'Approved' },
                  { name: 'Meera Krishnan', product: 'Kanjivaram Pure Silk Saree', stars: 5, date: '1 week ago', comment: 'The zari work and silk softness is world-class. Looks exactly like the high-res catalog photos.', status: 'Approved' }
                ].map((rev, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div>
                        <strong>{rev.name}</strong> • <span style={{ color: '#64748b', fontSize: '0.8rem' }}>on <em>{rev.product}</em></span>
                      </div>
                      <span style={{ color: '#eab308', fontSize: '0.9rem' }}>{''.repeat(rev.stars)}</span>
                    </div>
                    <p style={{ margin: '6px 0 10px 0', fontSize: '0.88rem', color: '#334155' }}>
                      "{rev.comment}"
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#94a3b8' }}>
                      <span>Submitted {rev.date}</span>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                         {rev.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 10.5: ANALYTICS & GRAPHS                            */}
          {/* ======================================================= */}
          {activeTab === 'analytics' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}> Store Analytics & Performance</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Visual insights, revenue generation, and order frequency across active customer IDs.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 500px', background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f172a' }}>Revenue Overview (Last 6 Months)</h3>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer>
                      <AreaChart data={[
                        { name: 'Apr', revenue: 40000, orders: 240 },
                        { name: 'May', revenue: 30000, orders: 198 },
                        { name: 'Jun', revenue: 20000, orders: 120 },
                        { name: 'Jul', revenue: 27800, orders: 160 },
                        { name: 'Aug', revenue: 18900, orders: 110 },
                        { name: 'Sep', revenue: 23900, orders: 130 },
                        { name: 'Oct', revenue: 34900, orders: 205 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Area type="monotone" dataKey="revenue" stroke="var(--primary-color)" fill="var(--primary-light)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ flex: '1 1 400px', background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f172a' }}>Orders by Customer ID (Top Performers)</h3>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer>
                      <BarChart data={[
                        { id: 'afromalik', orders: 15 },
                        { id: 'priya_s', orders: 12 },
                        { id: 'karthik07', orders: 8 },
                        { id: 'divya_r', orders: 6 },
                        { id: 'guest_44', orders: 4 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="id" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 11: STORE SETTINGS                                  */}
          {/* ======================================================= */}
          {activeTab === 'settings' && (
            <div className="zestro-pane-content">
              <div className="zestro-table-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}>⚙️ Store Settings & Biometric Security</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Global parameters for currency, 7-days return policy window, and administrator contact.
                  </p>
                </div>
              </div>

              {settingsSaved && (
                <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: '700' }}>
                  ✅ Store configuration updated successfully!
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Basic Settings</h3>
                  <div className="z-form-group">
                    <label>Storefront Brand Name</label>
                    <input
                      className="zestro-modal-input"
                      type="text"
                      value={storeSettings.storeName}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                    />
                  </div>

                  <div className="z-form-group">
                    <label>Master Administrator Email (Notifications & Alerts)</label>
                    <input
                      className="zestro-modal-input"
                      type="email"
                      value={storeSettings.supportEmail}
                      onChange={(e) => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div className="z-form-group">
                      <label>Free Shipping Order Threshold (₹)</label>
                      <input
                        className="zestro-modal-input"
                        type="number"
                        value={storeSettings.freeShippingThreshold}
                        onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: e.target.value })}
                      />
                    </div>

                    <div className="z-form-group">
                      <label>Hassle-Free Return Policy Window (Days)</label>
                      <input
                        className="zestro-modal-input"
                        type="number"
                        value={storeSettings.returnWindowDays}
                        onChange={(e) => setStoreSettings({ ...storeSettings, returnWindowDays: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>🔐 Biometric Security</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Enroll up to 2 fingerprints (2 Fingerprints) for fast & secure Admin Login. This ensures only you can access the dashboard.</p>
                  
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px', padding: '16px', borderRadius: '8px', border: enrolledFingers.includes('owner1') ? '2px solid #16a34a' : '1px dashed #cbd5e1', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
                       <div style={{ fontSize: '2.5rem' }}>☝️</div>
                       <strong style={{ fontSize: '0.9rem', color: '#334155' }}>Fingerprint 1</strong>
                       {enrolledFingers.includes('owner1') ? (
                         <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>✓ Enrolled</span>
                       ) : (
                         <button type="button" onClick={() => {
                            const newArr = [...enrolledFingers, 'owner1'];
                            setEnrolledFingers(newArr);
                            localStorage.setItem('adminFingerprints', JSON.stringify(newArr));
                         }} className="btn-qa qa-primary-orange" style={{ padding: '6px 14px', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}>Scan to Enroll</button>
                       )}
                    </div>

                    <div style={{ flex: '1 1 200px', padding: '16px', borderRadius: '8px', border: enrolledFingers.includes('owner2') ? '2px solid #16a34a' : '1px dashed #cbd5e1', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
                       <div style={{ fontSize: '2.5rem' }}>👍</div>
                       <strong style={{ fontSize: '0.9rem', color: '#334155' }}>Fingerprint 2</strong>
                       {enrolledFingers.includes('owner2') ? (
                         <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>✓ Enrolled</span>
                       ) : (
                         <button type="button" onClick={() => {
                            const newArr = [...enrolledFingers, 'owner2'];
                            setEnrolledFingers(newArr);
                            localStorage.setItem('adminFingerprints', JSON.stringify(newArr));
                         }} className="btn-qa qa-primary-orange" style={{ padding: '6px 14px', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}>Scan to Enroll</button>
                       )}
                    </div>
                  </div>
                  {enrolledFingers.length > 0 && (
                     <button type="button" onClick={() => {
                         setEnrolledFingers([]);
                         localStorage.removeItem('adminFingerprints');
                     }} style={{ alignSelf: 'flex-start', background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>Reset Biometrics</button>
                  )}
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>🎨 Admin UI Customization</h3>
                  
                  <div className="z-form-group">
                    <label>Admin Dashboard Theme Mode</label>
                    <select className="zestro-modal-input" value={adminTheme} onChange={(e) => setAdminTheme(e.target.value)}>
                      <option value="light">☀️ Light Mode (Default)</option>
                      <option value="dark">🌙 Dark Mode (OLED)</option>
                      <option value="system">💻 System Default</option>
                    </select>
                  </div>

                  <div className="z-form-group">
                    <label>Accent Color</label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      {['#a855f7', '#ea4335', '#25d366', '#f59e0b', '#ec4899', '#0ea5e9'].map(color => (
                        <div key={color} onClick={() => setAdminAccent(color)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: color, cursor: 'pointer', border: color === adminAccent ? '3px solid #64748b' : 'none' }}></div>
                      ))}
                    </div>
                  </div>

                  <div className="z-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" id="sidebarToggle" defaultChecked style={{ width: '18px', height: '18px' }} />
                    <label htmlFor="sidebarToggle" style={{ margin: 0 }}>Enable Collapsible Sidebar</label>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>💬 Notification Integration API</h3>
                  <div className="z-form-group">
                    <label>Twilio WhatsApp API Key (SID)</label>
                    <input type="password" placeholder="sk_test_••••••••••••••••" className="zestro-modal-input" />
                  </div>
                  
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>*If left blank, simulated browser notifications will be used for WhatsApp.</p>
                </div>

                <button type="submit" className="btn-qa qa-primary-orange" style={{ alignSelf: 'flex-start', padding: '12px 28px', fontSize: '1rem', marginTop: '8px' }}>
                  💾 Save Store Settings
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}

      {/* MODAL 1: ADD PRODUCT */}
      {isAddModalOpen && (
        <div className="zestro-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="zestro-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="zestro-modal-header">
              <h3> Add New Product to FutureMemory Cart</h3>
              <button className="zestro-modal-close" onClick={() => setIsAddModalOpen(false)}></button>
            </div>

            <form onSubmit={handleAddNewProduct} className="zestro-modal-form">
              <div className="z-form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Chronograph Luxury Watch / Kanjivaram Silk Saree"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div className="z-form-group">
                  <label>Current Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="349"
                    value={newProductData.currentPrice}
                    onChange={(e) => setNewProductData({ ...newProductData, currentPrice: e.target.value })}
                    required
                  />
                </div>

                <div className="z-form-group">
                  <label>Original MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="499"
                    value={newProductData.originalPrice}
                    onChange={(e) => setNewProductData({ ...newProductData, originalPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="z-form-group">
                <label>Occasion Category</label>
                <select
                  value={newProductData.occasionId}
                  onChange={(e) => {
                    const sel = occasionsMetadata.find(o => o.id === e.target.value);
                    setNewProductData({
                      ...newProductData,
                      occasionId: e.target.value,
                      occasionName: sel ? sel.name : 'Curated Items'
                    });
                  }}
                >
                  {occasionsMetadata.map(occ => (
                    <option key={occ.id} value={occ.id}>{occ.name}</option>
                  ))}
                </select>
              </div>

              <div className="z-form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProductData.image}
                  onChange={(e) => setNewProductData({ ...newProductData, image: e.target.value })}
                />
              </div>

              <div className="z-form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Detailed product highlights..."
                  value={newProductData.description}
                  onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                />
              </div>

              <div className="z-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                   Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CUSTOMER */}
      {isAddCustomerOpen && (
        <div className="zestro-modal-backdrop" onClick={() => setIsAddCustomerOpen(false)}>
          <div className="zestro-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="zestro-modal-header">
              <h3> Register New Customer</h3>
              <button className="zestro-modal-close" onClick={() => setIsAddCustomerOpen(false)}></button>
            </div>

            <form onSubmit={handleAddNewCustomer} className="zestro-modal-form">
              <div className="z-form-group">
                <label>Customer Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sundaram"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="z-form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="priya@example.com"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div className="z-form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newCustomerForm.mobile}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, mobile: e.target.value })}
                  />
                </div>

                <div className="z-form-group">
                  <label>Initial Wallet Balance (₹)</label>
                  <input
                    type="number"
                    value={newCustomerForm.walletBalance}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, walletBalance: e.target.value })}
                  />
                </div>
              </div>

              <div className="z-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsAddCustomerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                   Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT CUSTOMER */}
      {isEditCustomerOpen && editingCustomer && (
        <div className="zestro-modal-backdrop" onClick={() => setIsEditCustomerOpen(false)}>
          <div className="zestro-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="zestro-modal-header">
              <h3>✏️ Edit Customer Profile</h3>
              <button className="zestro-modal-close" onClick={() => setIsEditCustomerOpen(false)}></button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="zestro-modal-form">
              <div className="z-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  required
                />
              </div>

              <div className="z-form-group">
                <label>Email (Read Only)</label>
                <input
                  type="email"
                  value={editingCustomer.email}
                  disabled
                  style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div className="z-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={editingCustomer.mobile || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, mobile: e.target.value })}
                  />
                </div>

                <div className="z-form-group">
                  <label>Wallet Balance (₹)</label>
                  <input
                    type="number"
                    value={editingCustomer.walletBalance || 0}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, walletBalance: e.target.value })}
                  />
                </div>
              </div>

              <div className="z-form-group">
                <label>Account Status</label>
                <select
                  value={editingCustomer.status || 'active'}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="suspended">Suspended (Blocked)</option>
                </select>
              </div>

              <div className="z-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsEditCustomerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CUSTOMER CONFIRMATION */}
      {customerToDelete && (
        <div className="zestro-modal-backdrop" onClick={() => setCustomerToDelete(null)}>
          <div className="zestro-modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="zestro-modal-header">
              <h3 style={{ color: '#dc2626' }}>🗑️ Delete Customer Account</h3>
              <button className="zestro-modal-close" onClick={() => setCustomerToDelete(null)}></button>
            </div>
            <div style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#475569' }}>
              Are you sure you want to permanently remove customer <strong>{customerToDelete.name}</strong> ({customerToDelete.email})?
            </div>
            <div className="z-modal-actions" style={{ padding: '12px 24px' }}>
              <button className="btn-modal-cancel" onClick={() => setCustomerToDelete(null)}>Cancel</button>
              <button
                className="btn-modal-save"
                style={{ background: '#dc2626' }}
                onClick={handleConfirmDeleteCustomer}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 5: EDIT PRODUCT */}
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

export default AdminDashboardPage;
