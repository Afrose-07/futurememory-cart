import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useFutureCart } from '../context/FutureCartContext';
import { useWishlist } from '../context/WishlistContext';
import { useOrders } from '../context/OrderContext';
import { useNotifications } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { 
  Package, Heart, Calendar, Settings, MapPin, Bell, Globe, Camera, 
  User, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle, LogOut, 
  Sparkles, Palette, Type, Sliders, Check, ArrowRight
} from 'lucide-react';
import './ProfilePage.css';

const REAL_AVATARS = [
  {
    id: 'av-1',
    name: 'Aadhil / Malik',
    role: 'Smart & Professional',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-2',
    name: 'Sarah',
    role: 'Classic Style',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-3',
    name: 'Alex',
    role: 'Executive',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-4',
    name: 'Elena',
    role: 'Creative Studio',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-5',
    name: 'David',
    role: 'Modern Casual',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-6',
    name: 'Priya',
    role: 'Urban Chic',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-7',
    name: 'Marcus',
    role: 'Tech Leader',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-8',
    name: 'Maya',
    role: 'Elegant Art',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80'
  }
];

const ProfilePage = () => {
  const { user, isAuthenticated, isGuest, updateUserProfile, logout } = useAuth();
  const { memoryItems } = useMemoryCart();
  const { wishlist } = useWishlist();
  const { orders } = useOrders();
  const { getUnreadCount } = useNotifications();
  const { 
    theme, setTheme, 
    fontFamily, setFontFamily, 
    fontSize, setFontSize, 
    notificationPreference, setNotificationPreference, 
    openSettings 
  } = useSettings();
  const { lang, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  // Tab management (supports ?tab= in URL)
  const queryTab = searchParams.get('tab');
  const validTabs = ['profile', 'notifications', 'settings', 'addresses'];
  const [activeTab, setActiveTab] = useState(() => {
    return queryTab && validTabs.includes(queryTab) ? queryTab : 'profile';
  });

  useEffect(() => {
    if (queryTab && validTabs.includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatarModalUrl, setSelectedAvatarModalUrl] = useState(() => user?.avatar || REAL_AVATARS[0].url);

  // Isolate customer profile data: NO shared phone number fallback!
  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    avatar: user?.avatar || REAL_AVATARS[0].url
  }));

  const [addresses, setAddresses] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');
  const [testNotifMsg, setTestNotifMsg] = useState('');
  const [notifToggles, setNotifToggles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fm_notif_toggles') || '{"order":true,"wishlist":true,"memoryCart":true,"price":true,"stock":true}');
    } catch {
      return { order: true, wishlist: true, memoryCart: true, price: true, stock: true };
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '', // User's own mobile ONLY, never fallback to another customer!
        avatar: user.avatar || REAL_AVATARS[0].url
      });
      setSelectedAvatarModalUrl(user.avatar || REAL_AVATARS[0].url);
      try {
        const stored = localStorage.getItem(`fm_addresses_${user.email}`);
        if (stored) setAddresses(JSON.parse(stored));
      } catch {}
    } else {
      setFormData({
        name: '',
        email: '',
        mobile: '',
        avatar: REAL_AVATARS[0].url
      });
      setSelectedAvatarModalUrl(REAL_AVATARS[0].url);
    }
  }, [user]);

  const toggleNotifItem = (key) => {
    const updated = { ...notifToggles, [key]: !notifToggles[key] };
    setNotifToggles(updated);
    localStorage.setItem('fm_notif_toggles', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const cleanMobile = formData.mobile ? formData.mobile.replace(/\D/g, '') : '';
    if (formData.mobile && cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    const updatedData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      mobile: cleanMobile,
      avatar: formData.avatar || REAL_AVATARS[0].url
    };

    if (isAuthenticated && user) {
      updateUserProfile(updatedData);
      // Clean up legacy global shared keys so other customers don't see this number!
      localStorage.removeItem('customer_whatsapp_number');
      localStorage.removeItem('customer_mobile');
      localStorage.removeItem('customer_name');
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleApplyAvatar = (url) => {
    const finalUrl = url || selectedAvatarModalUrl || REAL_AVATARS[0].url;
    setFormData(prev => ({ ...prev, avatar: finalUrl }));
    setSelectedAvatarModalUrl(finalUrl);
    if (isAuthenticated && user) {
      updateUserProfile({ avatar: finalUrl });
    }
    setIsAvatarModalOpen(false);
  };

  const handleChannelSelect = async (channel) => {
    setNotificationPreference(channel);
    localStorage.setItem('fm_notif_pref', channel);
    localStorage.setItem('customer_notification_pref', channel);

    if (channel === 'email') {
      const targetEmail = (formData.email || user?.email || localStorage.getItem('customer_email') || 'afromalik07@gmail.com').trim();
      setTestNotifMsg(`✉️ Connecting to Gmail SMTP... Dispatching live activation email to ${targetEmail}...`);
      try {
        const res = await fetch('http://localhost:5000/api/users/activate-channel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: targetEmail, 
            name: formData.name || user?.name || 'Valued Customer',
            channel: 'email'
          })
        });
        const data = await res.json().catch(() => ({}));
        if (data?.success) {
          setTestNotifMsg(`✓ Real activation email delivered to ${targetEmail}! Please check your inbox.`);
        } else {
          setTestNotifMsg(`✓ Notification channel switched to Email (${targetEmail}).`);
        }
      } catch (err) {
        setTestNotifMsg(`✓ Notification channel switched to Email (${targetEmail}).`);
      }
    } else {
      setTestNotifMsg('Notification channel switched to WhatsApp!');
    }
    setTimeout(() => setTestNotifMsg(''), 7000);
  };

  const handleTestNotification = async () => {
    const targetEmail = formData.email || user?.email || localStorage.getItem('customer_email') || 'afromalik07@gmail.com';
    const targetMobile = formData.mobile || localStorage.getItem('customer_whatsapp_number');
    
    if (notificationPreference === 'email') {
      if (!targetEmail) {
        setError('Please enter an email address to receive notifications.');
        return;
      }
      try {
        setTestNotifMsg(`✉️ Dispatching live test email to ${targetEmail} via Gmail SMTP...`);
        const res = await fetch('http://localhost:5000/api/users/activate-channel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail, name: formData.name || 'Valued Customer', channel: 'email' })
        });
        const data = await res.json().catch(() => ({}));
        if (data?.success) {
          setTestNotifMsg(`✓ Real test email dispatched to ${targetEmail}! Please check inbox.`);
        } else {
          setTestNotifMsg('⚠️ Server could not send email. Check backend terminal logs.');
        }
      } catch (err) {
        setTestNotifMsg('⚠️ Could not connect to notification server at port 5000.');
      }
    } else {
      if (!targetMobile) {
        setError('Please enter a 10-digit mobile number to receive WhatsApp alerts.');
        return;
      }
      setTestNotifMsg(`✓ WhatsApp alerts configured for +91 ${targetMobile}! Ready for live dispatch.`);
    }
    setTimeout(() => setTestNotifMsg(''), 7000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatarModalUrl(reader.result);
        setFormData(prev => ({ ...prev, avatar: reader.result }));
        if (isAuthenticated && user) {
          updateUserProfile({ avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const joinedDate = user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : new Date().toLocaleDateString();
  const uniqueWishlistCount = new Set(wishlist.map(w => w.productId || w.id)).size;

  const themesList = [
    { id: 'light', name: 'Clean Light', color: '#4f46e5', previewBg: '#ffffff', desc: 'Modern & Crisp' },
    { id: 'dark', name: 'Obsidian Dark', color: '#6366f1', previewBg: '#090d16', desc: 'Midnight OLED' },
    { id: 'gold', name: 'Royal Gold', color: '#d97706', previewBg: '#0d0c0a', desc: 'Luxury Amber' },
    { id: 'emerald', name: 'Emerald Forest', color: '#059669', previewBg: '#04140e', desc: 'Nature Green' },
    { id: 'cyber', name: 'Cyber Neon', color: '#9333ea', previewBg: '#0b0717', desc: 'Futuristic Glow' },
    { id: 'rose', name: 'Rose Sunset', color: '#e11d48', previewBg: '#14080c', desc: 'Warm Elegance' }
  ];

  const fontsList = [
    { id: 'sans', name: 'Plus Jakarta Sans', sample: 'Modern Standard' },
    { id: 'inter', name: 'Inter UI', sample: 'Crisp Tech' },
    { id: 'poppins', name: 'Poppins', sample: 'Geometric Chic' },
    { id: 'serif', name: 'Playfair Display', sample: 'Luxury Serif' },
    { id: 'outfit', name: 'Outfit', sample: 'Friendly Rounded' }
  ];

  const fontSizes = [
    { id: 'sm', label: 'Compact', size: '14px' },
    { id: 'md', label: 'Standard', size: '16px' },
    { id: 'lg', label: 'Large', size: '18px' },
    { id: 'xl', label: 'Extra Large', size: '20px' }
  ];

  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' }
  ];

  return (
    <div className="fm-profile-page">
      <PageHeader
        title="Profile & Preferences Center"
        subtitle="Manage your personal profile, notification channels, visual themes, and delivery addresses in one neat place."
        breadcrumbs={[{ label: 'Profile' }]}
        badge={isAuthenticated ? (isGuest ? 'Guest Shopper' : 'Verified Member') : 'Guest Session'}
      />

      <div className="container fm-profile-container">
        
        {/* GUEST BANNER IF NOT LOGGED IN */}
        {!isAuthenticated && (
          <div className="fm-guest-banner-neat">
            <div className="guest-banner-left">
              <span className="guest-banner-icon">👋</span>
              <div>
                <strong>Browsing in Guest Mode</strong>
                <p>Your appearance settings and notification channels are active. Sign in to sync your order history and addresses across all devices.</p>
              </div>
            </div>
            <div className="guest-banner-actions">
              <Link to="/login" className="fm-btn-neat-login">Sign In</Link>
              <Link to="/signup" className="fm-btn-neat-signup">Register Free</Link>
            </div>
          </div>
        )}

        {/* TOP HERO PROFILE HEADER */}
        <div className="fm-profile-hero">
          <div className="fm-profile-hero-bg"></div>
          <div className="fm-profile-hero-content">
            <div 
              className="fm-hero-avatar-wrap"
              onClick={() => {
                setSelectedAvatarModalUrl(formData.avatar || REAL_AVATARS[0].url);
                setIsAvatarModalOpen(true);
              }}
              style={{ cursor: 'pointer' }}
              title="Click to select real photo avatar"
            >
              <img 
                src={formData.avatar || REAL_AVATARS[0].url} 
                alt="Profile Avatar" 
                className="fm-hero-avatar-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = REAL_AVATARS[0].url;
                }}
              />
              <button 
                type="button" 
                className="fm-hero-avatar-camera"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAvatarModalUrl(formData.avatar || REAL_AVATARS[0].url);
                  setIsAvatarModalOpen(true);
                }}
                title="Change Profile Photo"
              >
                <Camera size={15} />
              </button>
            </div>

            <div className="fm-hero-user-details">
              <div className="fm-hero-name-row">
                <h2 className="fm-hero-username">{formData.name || 'Valued Shopper'}</h2>
                <span className="fm-badge-verified">
                  <ShieldCheck size={14} /> 7-Days Protection Active
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAvatarModalUrl(formData.avatar || REAL_AVATARS[0].url);
                    setIsAvatarModalOpen(true);
                  }}
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Camera size={13} /> Change Photo
                </button>
              </div>
              <p className="fm-hero-meta">
                <span>✉️ {formData.email || 'No email configured'}</span>
                <span>•</span>
                <span>📱 {formData.mobile ? `+91 ${formData.mobile}` : 'No phone linked'}</span>
                <span>•</span>
                <span>Theme: <strong style={{ textTransform: 'capitalize' }}>{theme}</strong></span>
              </p>
            </div>

            <div className="fm-hero-quick-actions">
              <button className="fm-btn-quick-settings" onClick={() => handleTabSwitch('settings')}>
                <Settings size={15} /> System Settings
              </button>
              {isAuthenticated && (
                <button className="fm-btn-quick-logout" onClick={handleLogout}>
                  <LogOut size={15} /> Sign Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* STATS RIBBON */}
        <div className="fm-profile-stats-grid">
          <div className="fm-stat-card" onClick={() => navigate('/order-history')}>
            <div className="fm-stat-icon icon-orders"><Package size={22} /></div>
            <div className="fm-stat-data">
              <span className="fm-stat-number">{orders.length}</span>
              <span className="fm-stat-label">Order History</span>
            </div>
          </div>

          <div className="fm-stat-card" onClick={() => navigate('/wishlist')}>
            <div className="fm-stat-icon icon-wishlist"><Heart size={22} /></div>
            <div className="fm-stat-data">
              <span className="fm-stat-number">{uniqueWishlistCount}</span>
              <span className="fm-stat-label">Saved Wishlist</span>
            </div>
          </div>

          <div className="fm-stat-card" onClick={() => navigate('/memory-cart')}>
            <div className="fm-stat-icon icon-memory"><Calendar size={22} /></div>
            <div className="fm-stat-data">
              <span className="fm-stat-number">{memoryItems.length}</span>
              <span className="fm-stat-label">Auto-Refill Items</span>
            </div>
          </div>

          <div className="fm-stat-card" onClick={() => handleTabSwitch('notifications')}>
            <div className={`fm-stat-icon ${notificationPreference === 'whatsapp' ? 'icon-whatsapp' : 'icon-email'}`}>
              {notificationPreference === 'whatsapp' ? '💬' : '✉️'}
            </div>
            <div className="fm-stat-data">
              <span className="fm-stat-number" style={{ fontSize: '1.05rem', textTransform: 'capitalize' }}>
                {notificationPreference === 'whatsapp' ? 'WhatsApp' : 'Email'}
              </span>
              <span className="fm-stat-label">Notification Channel</span>
            </div>
          </div>
        </div>

        {/* MAIN TABS NAVIGATION */}
        <div className="fm-profile-tabs">
          <button 
            className={`fm-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('profile')}
          >
            <User size={17} /> Personal Details
          </button>
          <button 
            className={`fm-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('notifications')}
          >
            <Bell size={17} /> Live Notifications
            <span className="fm-tab-badge">Alerts</span>
          </button>
          <button 
            className={`fm-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('settings')}
          >
            <Sliders size={17} /> Appearance & Themes
            <span className="fm-tab-badge new">Custom</span>
          </button>
          <button 
            className={`fm-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('addresses')}
          >
            <MapPin size={17} /> Delivery Addresses
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="fm-tab-content-area">
          
          {/* TAB 1: PERSONAL PROFILE */}
          {activeTab === 'profile' && (
            <div className="fm-card-neat">
              <div className="fm-card-neat-header">
                <div>
                  <h3 className="fm-card-title">Personal Account Information</h3>
                  <p className="fm-card-subtitle">Keep your contact details up to date for seamless order tracking and delivery dispatches.</p>
                </div>
              </div>

              {isSaved && (
                <div className="fm-alert-neat success">
                  <CheckCircle2 size={18} />
                  <span>Profile changes successfully updated and saved!</span>
                </div>
              )}

              {error && (
                <div className="fm-alert-neat error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleUpdate} className="fm-profile-form">
                <div className="fm-form-grid">
                  <div className="fm-form-field">
                    <label>Full Name</label>
                    <div className="fm-input-wrapper">
                      <User size={18} className="fm-input-icon" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Afrose Malik"
                        required
                      />
                    </div>
                  </div>

                  <div className="fm-form-field">
                    <label>Email Address (For Tax Invoices & Order Alerts)</label>
                    <div className="fm-input-wrapper">
                      <Mail size={18} className="fm-input-icon" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. customer@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="fm-form-field">
                    <label>WhatsApp & Mobile Number (10 Digits)</label>
                    <div className="fm-input-wrapper">
                      <Phone size={18} className="fm-input-icon" />
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="e.g. 9876543210"
                      />
                    </div>
                  </div>

                  <div className="fm-form-field">
                    <label>Assurance & Coverage Status</label>
                    <div className="fm-input-wrapper readonly">
                      <ShieldCheck size={18} className="fm-input-icon" />
                      <input
                        type="text"
                        value="7-Days Doorstep Return & Instant Refund Guarantee Active"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="fm-form-actions">
                  <Button type="submit" variant="primary" size="lg">
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: NOTIFICATION SETTINGS */}
          {activeTab === 'notifications' && (
            <div className="fm-card-neat">
              <div className="fm-card-neat-header">
                <div>
                  <h3 className="fm-card-title">Live Dispatch & Notification Pipeline</h3>
                  <p className="fm-card-subtitle">Choose where FutureMemory Cart sends your real-time tracking links, order invoices, and price alerts.</p>
                </div>
              </div>

              {testNotifMsg && (
                <div className={`fm-alert-neat ${testNotifMsg.includes('⚠️') ? 'error' : 'success'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} />
                    <span>{testNotifMsg}</span>
                  </div>
                  {(testNotifMsg.includes('email') || testNotifMsg.includes('Email') || testNotifMsg.includes('inbox')) && (
                    <a 
                      href="https://mail.google.com/mail/u/0/#inbox" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
                      }}
                    >
                      📧 Open Gmail Inbox ↗
                    </a>
                  )}
                </div>
              )}

              <div className="fm-channel-selector-grid">
                
                {/* WHATSAPP CARD */}
                <div 
                  className={`fm-channel-card ${notificationPreference === 'whatsapp' ? 'selected' : ''}`}
                  onClick={() => handleChannelSelect('whatsapp')}
                >
                  <div className="fm-channel-top">
                    <div className="fm-channel-badge whatsapp">💬 WhatsApp Direct Bot</div>
                    <input 
                      type="radio" 
                      name="notifPref" 
                      checked={notificationPreference === 'whatsapp'} 
                      onChange={() => handleChannelSelect('whatsapp')} 
                    />
                  </div>
                  <h4 className="fm-channel-title">WhatsApp Instant Dispatch</h4>
                  <p className="fm-channel-desc">
                    Receive immediate order confirmations, delivery partner tracking links, and digital receipts straight to your WhatsApp chat.
                  </p>
                  <div className="fm-channel-dest">
                    <span>Target Number:</span>
                    <strong>{formData.mobile ? `+91 ${formData.mobile}` : '⚠️ Add mobile number in Profile tab'}</strong>
                  </div>
                </div>

                {/* EMAIL CARD */}
                <div 
                  className={`fm-channel-card ${notificationPreference === 'email' ? 'selected' : ''}`}
                  onClick={() => handleChannelSelect('email')}
                >
                  <div className="fm-channel-top">
                    <div className="fm-channel-badge email">✉️ Gmail SMTP Pipeline</div>
                    <input 
                      type="radio" 
                      name="notifPref" 
                      checked={notificationPreference === 'email'} 
                      onChange={() => handleChannelSelect('email')} 
                    />
                  </div>
                  <h4 className="fm-channel-title">Email Digital Tax Invoices</h4>
                  <p className="fm-channel-desc">
                    Receive complete GST invoices, return authorization barcode receipts, and price drop deals delivered directly to your inbox.
                  </p>
                  <div className="fm-channel-dest" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span>Target Inbox:</span>
                      <strong>{formData.email || 'afromalik07@gmail.com'}</strong>
                    </div>
                    {notificationPreference === 'email' && (
                      <a 
                        href="https://mail.google.com/mail/u/0/#inbox" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#1d4ed8',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        Open Gmail ↗
                      </a>
                    )}
                  </div>
                </div>

              </div>

              {/* TEST PIPELINE BAR */}
              <div className="fm-test-notif-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Sparkles size={22} color="#6366f1" />
                  <div>
                    <strong>Test Notification Pipeline Right Now:</strong>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>
                      Sends a live alert via your active channel ({notificationPreference.toUpperCase()}) immediately.
                    </span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="fm-btn-test-send"
                  onClick={handleTestNotification}
                >
                  Dispatch Test Alert Now ➔
                </button>
              </div>

              {/* GRANULAR TOGGLES */}
              <div style={{ marginTop: '28px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '14px' }}>
                  Granular Notification Preferences
                </h4>
                <div className="fm-toggles-list">
                  {[
                    { key: 'order', label: 'Order & Dispatch Updates', desc: 'Real-time order confirmation, courier tracking and doorstep delivery.' },
                    { key: 'wishlist', label: 'Wishlist Price Drop Alerts', desc: 'Instant alert when a saved product drops in price or has a deal.' },
                    { key: 'memoryCart', label: 'Memory Cart Auto-Refill Reminders', desc: 'Smart repurchasing notifications before essentials run out.' },
                    { key: 'price', label: 'Flash Deals & Promo Vouchers', desc: 'Exclusive discount coupons and seasonal offers.' },
                    { key: 'stock', label: 'Back in Stock Alerts', desc: 'Notifications when out-of-stock items become available again.' }
                  ].map(item => (
                    <div key={item.key} className="fm-toggle-row">
                      <div className="fm-toggle-info">
                        <span className="fm-toggle-label">{item.label}</span>
                        <span className="fm-toggle-desc">{item.desc}</span>
                      </div>
                      <label className="fm-switch">
                        <input 
                          type="checkbox" 
                          checked={!!notifToggles[item.key]} 
                          onChange={() => toggleNotifItem(item.key)} 
                        />
                        <span className="fm-slider round"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE & SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="fm-card-neat">
              <div className="fm-card-neat-header">
                <div>
                  <h3 className="fm-card-title">Appearance, Theme & Language Settings</h3>
                  <p className="fm-card-subtitle">Personalize your storefront theme color, font styling, reading size, and regional language.</p>
                </div>
              </div>

              {/* REGIONAL LANGUAGE */}
              <div className="fm-setting-group">
                <div className="fm-group-title">
                  <Globe size={18} className="fm-group-icon" />
                  <div>
                    <h4>Regional Language (வலைத்தள மொழி)</h4>
                    <p>Select your language to adapt product details, buttons, and navigation.</p>
                  </div>
                </div>

                <div className="fm-lang-cards-grid">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      className={`fm-lang-card-neat ${lang === l.code ? 'active' : ''}`}
                      onClick={() => changeLanguage(l.code)}
                    >
                      <span className="lang-flag-emoji">{l.flag}</span>
                      <div className="lang-label-group">
                        <strong className="lang-native-txt">{l.native}</strong>
                        <span className="lang-eng-txt">{l.name}</span>
                      </div>
                      {lang === l.code && <Check size={18} className="lang-active-check" />}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="fm-neat-divider" />

              {/* COLOR PALETTE */}
              <div className="fm-setting-group">
                <div className="fm-group-title">
                  <Palette size={18} className="fm-group-icon" />
                  <div>
                    <h4>Theme Palette & Color Mood</h4>
                    <p>Pick a curated theme designed for high readability and premium aesthetics.</p>
                  </div>
                </div>

                <div className="fm-themes-neat-grid">
                  {themesList.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      className={`fm-theme-neat-card ${theme === th.id ? 'active' : ''}`}
                      onClick={() => setTheme(th.id)}
                    >
                      <div className="theme-color-badge" style={{ backgroundColor: th.color }}>
                        <div className="theme-inner-dot" style={{ backgroundColor: th.previewBg }} />
                      </div>
                      <div className="theme-neat-text">
                        <strong>{th.name}</strong>
                        <span>{th.desc}</span>
                      </div>
                      {theme === th.id && <span className="theme-active-tag">Active</span>}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="fm-neat-divider" />

              {/* TYPOGRAPHY */}
              <div className="fm-setting-group">
                <div className="fm-group-title">
                  <Type size={18} className="fm-group-icon" />
                  <div>
                    <h4>Font Family & Typography</h4>
                    <p>Select a typeface to enhance readability and storefront elegance.</p>
                  </div>
                </div>

                <div className="fm-fonts-neat-row">
                  {fontsList.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`fm-font-neat-btn ${fontFamily === f.id ? 'active' : ''}`}
                      onClick={() => setFontFamily(f.id)}
                    >
                      <strong>{f.name}</strong>
                      <span>{f.sample}</span>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="fm-neat-divider" />

              {/* FONT SIZE SCALING */}
              <div className="fm-setting-group">
                <div className="fm-group-title">
                  <Sliders size={18} className="fm-group-icon" />
                  <div>
                    <h4>Reading Size & Text Scaling</h4>
                    <p>Adjust font size for comfortable reading across all screens.</p>
                  </div>
                </div>

                <div className="fm-size-neat-row">
                  {fontSizes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`fm-size-neat-tab ${fontSize === s.id ? 'active' : ''}`}
                      onClick={() => setFontSize(s.id)}
                    >
                      <span>{s.label}</span>
                      <small>({s.size})</small>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="fm-card-neat">
              <div className="fm-card-neat-header">
                <div>
                  <h3 className="fm-card-title">Saved Shipping Addresses</h3>
                  <p className="fm-card-subtitle">Manage multiple doorstep delivery locations for lightning 1-click checkout.</p>
                </div>
                <Link to="/checkout" className="fm-btn-link-action">
                  + Add in Checkout
                </Link>
              </div>

              {addresses.length === 0 ? (
                <div className="fm-empty-neat">
                  <MapPin size={46} color="#cbd5e1" />
                  <h4>No Saved Addresses Found</h4>
                  <p>When you checkout with a new address, it will automatically be safely saved here for 1-click re-ordering.</p>
                  <Link to="/shop" className="fm-btn-outline-neat">
                    Start Shopping & Add Address
                  </Link>
                </div>
              ) : (
                <div className="fm-addresses-grid">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="fm-address-card-neat">
                      <div className="fm-addr-type-pill">{addr.type || 'Home'}</div>
                      <h4 className="fm-addr-name">{addr.fullName}</h4>
                      <p className="fm-addr-text">
                        {addr.houseNo}, {addr.street}<br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <span className="fm-addr-phone">📱 {addr.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* BOTTOM SHORTCUTS BAR */}
        <div className="fm-profile-shortcuts-row">
          <Link to="/order-history" className="fm-shortcut-card">
            <Package size={22} className="shortcut-icon" />
            <div>
              <strong>Order History & Returns</strong>
              <span>Track orders or claim 7-days doorstep reverse pickup</span>
            </div>
            <ArrowRight size={16} className="shortcut-arrow" />
          </Link>

          <Link to="/wishlist" className="fm-shortcut-card">
            <Heart size={22} className="shortcut-icon" />
            <div>
              <strong>My Wishlist Items</strong>
              <span>Saved curated timepieces, gadgets & ethnic wear</span>
            </div>
            <ArrowRight size={16} className="shortcut-arrow" />
          </Link>

          <Link to="/memory-cart" className="fm-shortcut-card">
            <Calendar size={22} className="shortcut-icon" />
            <div>
              <strong>FutureMemory Occasion Planner</strong>
              <span>Automated reminders & budget scheduling</span>
            </div>
            <ArrowRight size={16} className="shortcut-arrow" />
          </Link>
        </div>

        {/* REAL AVATAR SELECTION MODAL */}
        {isAvatarModalOpen && (
          <div className="fm-avatar-modal-backdrop" onClick={() => setIsAvatarModalOpen(false)}>
            <div className="fm-avatar-modal-card" onClick={(e) => e.stopPropagation()}>
              
              <div className="fm-avatar-modal-header">
                <div>
                  <h3 className="fm-avatar-modal-title">Choose Profile Avatar</h3>
                  <p className="fm-avatar-modal-subtitle">Pick from verified real photo avatars or upload your custom picture</p>
                </div>
                <button 
                  type="button" 
                  className="fm-avatar-close-btn" 
                  onClick={() => setIsAvatarModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              {/* CURRENT PREVIEW BOX */}
              <div className="fm-avatar-preview-box">
                <img 
                  src={selectedAvatarModalUrl || formData.avatar || REAL_AVATARS[0].url} 
                  alt="Preview" 
                  className="fm-avatar-preview-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = REAL_AVATARS[0].url;
                  }}
                />
                <div className="fm-avatar-preview-info">
                  <h4>Selected Profile Picture</h4>
                  <p>This photo will appear in your account, order reviews, and receipts.</p>
                </div>
              </div>

              {/* REAL PHOTO AVATARS GRID */}
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Curated Real Avatars:
                </span>
              </div>
              <div className="fm-avatar-grid">
                {REAL_AVATARS.map((av) => (
                  <div 
                    key={av.id}
                    className={`fm-avatar-card-item ${selectedAvatarModalUrl === av.url ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatarModalUrl(av.url)}
                  >
                    {selectedAvatarModalUrl === av.url && (
                      <div className="fm-avatar-check-badge">✓</div>
                    )}
                    <img src={av.url} alt={av.name} className="fm-avatar-thumb" />
                    <span className="fm-avatar-name">{av.name}</span>
                  </div>
                ))}
              </div>

              {/* UPLOAD CUSTOM ROW */}
              <div className="fm-avatar-upload-row">
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block' }}>Upload Custom Photo</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Upload from your computer, phone, or gallery (JPG, PNG, WebP)</span>
                </div>
                <button 
                  type="button" 
                  className="fm-btn-upload-custom"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={16} /> Choose File
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
              </div>

              {/* MODAL ACTIONS */}
              <div className="fm-avatar-modal-footer">
                <button 
                  type="button" 
                  className="fm-btn-cancel-avatar" 
                  onClick={() => setIsAvatarModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="fm-btn-apply-avatar" 
                  onClick={() => handleApplyAvatar(selectedAvatarModalUrl)}
                >
                  ✓ Save Profile Avatar
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
