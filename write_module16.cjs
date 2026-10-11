const fs = require('fs');

const profilePageCode = `import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useFutureCart } from '../context/FutureCartContext';
import { useWishlist } from '../context/WishlistContext';
import { useOrders } from '../context/OrderContext';
import { useNotifications } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { Package, Heart, Calendar, Settings, MapPin, Bell, Globe, Camera } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, isAuthenticated, isGuest, updateUserProfile, logout } = useAuth();
  const { memoryItems } = useMemoryCart();
  const { futureData } = useFutureCart();
  const { wishlist } = useWishlist();
  const { orders } = useOrders();
  const { getUnreadCount } = useNotifications();
  const { openSettings } = useSettings();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    avatar: user?.avatar || ''
  });

  const [addresses, setAddresses] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        avatar: user.avatar || ''
      });
      try {
        const stored = localStorage.getItem(\`fm_addresses_\${user.email}\`);
        if (stored) setAddresses(JSON.parse(stored));
      } catch {}
    }
  }, [user]);

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile.replace(/\\D/g, ''))) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    updateUserProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const joinedDate = user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : new Date().toLocaleDateString();
  const unreadCount = getUnreadCount();
  const uniqueWishlistCount = new Set(wishlist.map(w => w.productId || w.id)).size;

  return (
    <div className="fm-profile-page">
      <PageHeader
        title="My Account & Preferences"
        subtitle="Manage your profile information, notification preferences, and personalized shopping settings."
        breadcrumbs={[{ label: 'Profile' }]}
        badge={isGuest ? 'Guest User' : 'Verified Member'}
      />

      <div className="container" style={{ maxWidth: '1200px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px', margin: '40px 0' }}>
          
          {/* LEFT SIDEBAR - Account Settings Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 16px auto' }}>
                  {formData.avatar && formData.avatar.startsWith('data:') ? (
                    <img src={formData.avatar} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 600 }}>
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ position: 'absolute', bottom: '0', right: '0', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    <Camera size={16} color="#475569" />
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#0f172a' }}>{formData.name || 'User'}</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#64748b' }}>Joined {joinedDate}</p>
              </div>

              <div style={{ padding: '16px 0' }}>
                <h4 style={{ padding: '0 24px', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '8px' }}>Dashboard Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', color: '#334155', fontSize: '0.95rem' }}>
                    <span>Orders</span> <strong>{orders.length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', color: '#334155', fontSize: '0.95rem' }}>
                    <span>Wishlist</span> <strong>{uniqueWishlistCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', color: '#334155', fontSize: '0.95rem' }}>
                    <span>FutureMemory</span> <strong>{memoryItems.length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', color: '#334155', fontSize: '0.95rem' }}>
                    <span>Addresses</span> <strong>{addresses.length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', color: '#334155', fontSize: '0.95rem' }}>
                    <span>Notifications</span> <strong>{unreadCount}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 0' }}>
              <h4 style={{ padding: '0 24px', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '8px' }}>Account Settings</h4>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <a href="#personal-info" className="profile-nav-link active">Personal Information</a>
                <Link to="/checkout" className="profile-nav-link">Saved Addresses</Link>
                <button onClick={openSettings} className="profile-nav-link" style={{ textAlign: 'left', border: 'none', background: 'transparent', width: '100%', padding: '12px 24px' }}>Language & App Settings</button>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 0' }}>
              <h4 style={{ padding: '0 24px', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '8px' }}>Shortcuts</h4>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Link to="/order-history" className="profile-nav-link">My Orders</Link>
                <Link to="/wishlist" className="profile-nav-link">My Wishlist</Link>
                <Link to="/memory-cart" className="profile-nav-link">FutureMemory Cart</Link>
                <Link to="/notifications" className="profile-nav-link">Notifications</Link>
              </div>
            </div>

            <Button variant="danger" size="md" fullWidth onClick={handleLogout} style={{ marginTop: '8px' }}>
              Logout
            </Button>
          </div>

          {/* RIGHT SIDE - Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Edit Profile */}
            <div id="personal-info" style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>Edit Profile</h3>
              
              {isSaved && (
                <div style={{ background: '#dcfce3', color: '#16a34a', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 500 }}>
                  ✓ Profile changes saved successfully!
                </div>
              )}

              {error && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 500 }}>
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                  <Button type="submit" variant="primary" size="lg">Save Changes</Button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
`;

fs.writeFileSync('src/pages/ProfilePage.jsx', profilePageCode);
console.log('Successfully wrote src/pages/ProfilePage.jsx');
