import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { 
  MapPin, 
  LayoutDashboard, 
  ShoppingCart, 
  Calendar, 
  Clock, 
  Building2, 
  Settings as SettingsIcon, 
  PhoneCall, 
  Code2, 
  LogOut,
  Heart,
  Bell
} from 'lucide-react';
import './ProjectSidebar.css';

const ProjectSidebar = () => {
  const { user, logout } = useAuth();
  const { openSettings } = useSettings();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="fm-sidebar-wrapper">
      {/* Main Navigation */}
      <div className="fm-sidebar-section">
        <h5>SHOPPING SERVICES</h5>
        <nav className="fm-sidebar-nav">
          <Link to="/home" className={`fm-sidebar-link ${location.pathname === '/home' || location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
            {(location.pathname === '/home' || location.pathname === '/') && <span className="live-badge">LIVE</span>}
          </Link>
          
          <Link to="/shop" className={`fm-sidebar-link ${isActive('/shop') ? 'active' : ''}`}>
            <ShoppingCart size={18} />
            <span>Shop Catalog</span>
          </Link>
          
          <Link to="/categories" className={`fm-sidebar-link ${isActive('/categories') ? 'active' : ''}`}>
            <Building2 size={18} />
            <span>Categories</span>
          </Link>

          <Link to="/cart" className={`fm-sidebar-link ${isActive('/cart') ? 'active' : ''}`}>
            <ShoppingCart size={18} />
            <span>Cart</span>
          </Link>
        </nav>
      </div>

      <div className="fm-sidebar-section">
        <h5>SMART CART</h5>
        <nav className="fm-sidebar-nav">
          <Link to="/memory-cart" className={`fm-sidebar-link ${isActive('/memory-cart') ? 'active' : ''}`}>
            <Calendar size={18} />
            <span>Memory Cart</span>
          </Link>

          <Link to="/future-cart" className={`fm-sidebar-link ${isActive('/future-cart') ? 'active' : ''}`}>
            <Clock size={18} />
            <span>Future Cart</span>
          </Link>
        </nav>
      </div>

      <div className="fm-sidebar-section">
        <h5>ACCOUNT</h5>
        <nav className="fm-sidebar-nav">
          <Link to="/wishlist" className={`fm-sidebar-link ${isActive('/wishlist') ? 'active' : ''}`}>
            <Heart size={18} />
            <span>Wishlist</span>
          </Link>

          <Link to="/notifications" className={`fm-sidebar-link ${isActive('/notifications') ? 'active' : ''}`}>
            <Bell size={18} />
            <span>Notifications</span>
          </Link>

          <button onClick={openSettings} className="fm-sidebar-link" style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Footer Profile */}
      <Link to="/profile" className="fm-sidebar-profile" style={{ textDecoration: 'none' }}>
        <div className="profile-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
        </div>
        <div className="profile-info">
          <h6>{user?.name || 'Shopper Guest'}</h6>
          <span>{user?.role === 'admin' ? 'ADMIN' : 'CUSTOMER'}</span>
        </div>
        {user && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              logout();
            }} 
            className="logout-btn" 
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        )}
      </Link>
    </div>
  );
};

export default ProjectSidebar;
