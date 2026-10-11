import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useFutureCart } from '../context/FutureCartContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { occasionsMetadata } from '../data/allOccasionsCatalog';
import NotificationBell from './NotificationBell';
import BrandLogo from './BrandLogo';
import { 
  ShieldCheck, 
  Truck, 
  Settings, 
  Search, 
  X, 
  Heart, 
  ShoppingCart, 
  ShoppingBag, 
  Watch, 
  Cpu, 
  Shirt, 
  Gem, 
  Briefcase, 
  Gift, 
  Calendar,
  UserCog,
  User,
  LogOut,
  Home,
  Grid
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const { wishlist } = useWishlist();
  const { memoryItems } = useMemoryCart();
  const { futureData } = useFutureCart();
  const { openSettings, openGoogleAuth } = useSettings();
  const { t, lang, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const requireAuthNav = (e, path, message = ' Please create an account or sign in to browse the shop and view products.') => {
    if (!isAuthenticated) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      setIsDrawerOpen(false);
      navigate('/login', { state: { message } });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
    setIsDrawerOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
      setIsMobileMenuOpen(false);
      setIsDrawerOpen(false);
    }
  };

  const languageLabels = {
    en: { flag: '', label: 'English' },
    ta: { flag: '', label: 'தமிழ்' },
    ml: { flag: '', label: 'മലയാളം' },
    kn: { flag: '', label: 'ಕನ್ನಡ' },
    te: { flag: '', label: 'తెలుగు' }
  };

  return (
    <header className="fm-navbar-root">
      {/* Customer-Facing Top Banner */}
      <div className="fm-top-banner">
        <div className="container fm-top-banner-content">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} /> <strong>7-days Hassle-Free Returns:</strong> Free doorstep reverse pickup & instant refund | Free Delivery over ₹999
          </span>
          <div className="fm-top-banner-links">
            <span style={{ color: '#a5b4fc', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Truck size={14} /> {t('freeDelivery')}
            </span>
            <span>•</span>
            <button className="settings-quick-link" onClick={openSettings} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Settings size={14} /> {t('settings')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="fm-main-nav">
        <div className="container fm-nav-container">
          {/* Left Drawer Button + Brand */}
          <div className="fm-nav-left-group">
            <button
              type="button"
              className="fm-drawer-toggle-btn"
              onClick={() => setIsDrawerOpen(true)}
              title="Open Categories & Occasions Drawer"
            >
              <span className="drawer-hamburger"></span>
              <span className="drawer-label">{t('cat_all')}</span>
            </button>

            <div className="fm-nav-brand">
              <Link to="/home" className="fm-brand-link" onClick={() => setIsMobileMenuOpen(false)}>
                <BrandLogo size="md" showTagline={true} />
              </Link>
            </div>
          </div>

          {/* Interactive Search Bar (Available for all visitors) */}
          <form className="fm-nav-search-form" onSubmit={handleSearchSubmit} role="search">
            <button type="submit" className="fm-nav-search-icon-btn" title="Search store products">
              <Search size={18} />
            </button>
            <input
              type="text"
              placeholder={t('searchPlaceholder') || "Search products, smart tech, gifts, SKU..."}
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="fm-nav-search-input"
              aria-label="Search products"
            />
            {navSearch && (
              <button
                type="button"
                className="fm-nav-search-clear"
                onClick={() => setNavSearch('')}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Desktop Nav Links (Available for all visitors) */}
          <div className="fm-nav-links">
            <NavLink to="/home" className={({ isActive }) => `fm-nav-link ${isActive ? 'active' : ''}`}>
              {t('home')}
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) => `fm-nav-link ${isActive ? 'active' : ''}`}
            >
              {t('shop')}
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) => `fm-nav-link ${isActive ? 'active' : ''}`}
            >
              {t('categories')}
            </NavLink>
            <NavLink
              to="/memory-cart"
              className={({ isActive }) => `fm-nav-link fm-nav-link-memory ${isActive ? 'active' : ''}`}
            >
              <span className="fm-link-pill pill-memory">{t('memoryCart')}</span>
              {memoryItems.length > 0 && <span className="fm-mini-badge memory-badge">{memoryItems.length}</span>}
            </NavLink>
            <NavLink
              to="/future-cart"
              className={({ isActive }) => `fm-nav-link fm-nav-link-future ${isActive ? 'active' : ''}`}
            >
              <span className="fm-link-pill pill-future">{t('futureCart')}</span>
            </NavLink>
          </div>

          {/* Actions: Settings, Language, Wishlist, Notifications, Cart, Auth */}
          <div className="fm-nav-actions">
            {/* Language Quick Dropdown */}
            <div className="fm-lang-dropdown-wrap">
              <button
                className="fm-lang-nav-btn"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                title="Change Website Language"
              >
                <span>{languageLabels[lang]?.flag || ''}</span>
                <span className="lang-code-text">{languageLabels[lang]?.label || 'EN'}</span>
                <span className="lang-caret">▼</span>
              </button>

              {isLangDropdownOpen && (
                <div className="fm-lang-menu-popover">
                  {Object.entries(languageLabels).map(([code, info]) => (
                    <button
                      key={code}
                      className={`lang-option-row ${lang === code ? 'active' : ''}`}
                      onClick={() => {
                        changeLanguage(code);
                        setIsLangDropdownOpen(false);
                      }}
                    >
                      <span className="opt-flag">{info.flag}</span>
                      <span className="opt-name">{info.label}</span>
                      {lang === code && <span className="opt-check"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated && (
              <>
                <button
                  className="fm-action-btn fm-settings-action-btn"
                  onClick={openSettings}
                  title="Personalize Theme, Font Style, & Size"
                >
                  <span className="fm-action-icon"><Settings size={20} /></span>
                </button>

                <Link to="/wishlist" className="fm-action-btn" title="Wishlist">
                  <span className="fm-action-icon"><Heart size={20} /></span>
                  {wishlist.length > 0 && <span className="fm-action-badge">{wishlist.length}</span>}
                </Link>

                <NotificationBell />

                <Link to="/cart" className="fm-action-btn fm-cart-action-btn" title="Cart">
                  <span className="fm-action-icon"><ShoppingCart size={20} /></span>
                  {getCartCount() > 0 && <span className="fm-action-badge cart-count-badge">{getCartCount()}</span>}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="fm-user-menu">
                <Link to="/profile" className="fm-profile-btn" title="View Profile & 7-days Orders">
                  <div className="fm-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="fm-user-text">
                    <span className="fm-username">{user?.name ? user.name.split(' ')[0] : 'Account'}</span>
                  </div>
                </Link>
                <button onClick={handleLogout} className="fm-logout-btn" title="Sign out">
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="fm-auth-btns">
                <Link to="/login" className="fm-btn-login">{t('login')}</Link>
                <Link to="/signup" className="fm-btn-signup" style={{ background: 'var(--primary-color)', color: '#ffffff', padding: '7px 16px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)' }}>{t('signup')}</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="fm-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? '' : ''}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="fm-mobile-menu">
            <form className="fm-mobile-search" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
              />
              <button type="submit"><Search size={18} /></button>
            </form>

            <div className="fm-mobile-nav-links">
              <Link to="/home" onClick={() => setIsMobileMenuOpen(false)}> {t('home')}</Link>
              <Link to="/shop" onClick={(e) => requireAuthNav(e, '/shop')}>️ {t('shop')}</Link>
              <Link to="/categories" onClick={(e) => requireAuthNav(e, '/categories')}> {t('categories')}</Link>
              <button
                className="mobile-settings-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openSettings();
                }}
              >
                ️ {t('settings')}
              </button>
              <Link to="/memory-cart" onClick={(e) => requireAuthNav(e, '/memory-cart')}>
                 {t('memoryCart')} ({memoryItems.length})
              </Link>
              <Link to="/future-cart" onClick={(e) => requireAuthNav(e, '/future-cart')}>
                 {t('futureCart')} ({futureData.plannedProducts?.length || 0})
              </Link>
              <Link to="/wishlist" onClick={(e) => requireAuthNav(e, '/wishlist')}>
                ️ {t('wishlist')} ({wishlist.length})
              </Link>
              <Link to="/cart" onClick={(e) => requireAuthNav(e, '/cart')}>
                ️ {t('normalCart')} ({getCartCount()})
              </Link>
              <Link to="/order-history" onClick={(e) => requireAuthNav(e, '/order-history')}>
                 {t('orderHistory')} (7-days Return)
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}> {t('myProfile')}</Link>
                  <button onClick={handleLogout} className="fm-mobile-logout-btn">{t('logout')}</button>
                </>
              ) : (
                <div className="fm-mobile-auth">
                  <button onClick={openGoogleAuth} className="fm-btn-google-auth mb-1">
                    Sign in with Google
                  </button>
                  <div className="flex gap-1">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="fm-btn-login flex-1 text-center">{t('login')}</Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="fm-btn-signup flex-1 text-center">{t('signup')}</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Left Sidebar Drawer (Amazon-Style Navigation) */}
      {isDrawerOpen && (
        <div className="fm-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="fm-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="fm-drawer-header">
              <div className="fm-drawer-user">
                <span className="drawer-user-icon"></span>
                <span>Hello, {isAuthenticated && user?.name ? user.name.split(' ')[0] : 'Sign In'}</span>
              </div>
              <button
                type="button"
                className="fm-drawer-close"
                onClick={() => setIsDrawerOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="fm-drawer-body">
              {/* Category Section */}
              <div className="fm-drawer-section">
                <h4 className="fm-drawer-heading">Shop By Department</h4>
                <Link to="/shop" onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span><ShoppingBag size={18} /></span> All Store Products
                </Link>
                <Link to={`/shop?category=${encodeURIComponent("Women's Fashion")}`} onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span>👗</span> Women's Fashion
                </Link>
                <Link to={`/shop?category=${encodeURIComponent("Men's Fashion")}`} onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span>👔</span> Men's Fashion
                </Link>
                <Link to={`/shop?category=${encodeURIComponent("Kids' Fashion")}`} onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span>🧸</span> Kids' Fashion
                </Link>
                <Link to={`/shop?category=${encodeURIComponent("Bags & Luggage")}`} onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span>👜</span> Bags & Luggage
                </Link>
                <Link to={`/shop?category=${encodeURIComponent("Electronics & Gadgets")}`} onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span>🎧</span> Electronics & Gadgets
                </Link>
                <Link to={`/shop?category=${encodeURIComponent("Home & Kitchen")}`} onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span>🍳</span> Home & Kitchen
                </Link>
                <Link to={`/shop?category=${encodeURIComponent("Beauty & Personal Care")}`} onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span>💄</span> Beauty & Personal Care
                </Link>
                <Link to={`/shop?category=Watches`} onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span>⌚</span> Watches & Timepieces
                </Link>
                <Link to={`/shop?category=Accessories`} onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span>💍</span> Fashion Accessories
                </Link>
                <Link to={`/shop?category=${encodeURIComponent("Gifts & Greeting Cards")}`} onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span>🎁</span> Gifts & Greeting Cards
                </Link>
              </div>

              {/* Curated Occasions Section */}
              <div className="fm-drawer-section">
                <h4 className="fm-drawer-heading">Curated Occasions & Festivals</h4>
                {['Celebrations & Gifts', 'Festivals & Cultural Events', 'College & Career', 'Lifestyle & Special Moments'].map(grp => (
                  <div key={grp} style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      {grp}
                    </div>
                    <div className="fm-drawer-occasions-grid">
                      {occasionsMetadata.filter(o => o.group === grp).map(occ => (
                        <Link
                          key={occ.id}
                          to={`/shop?occasion=${occ.id}`}
                          onClick={() => setIsDrawerOpen(false)}
                          className="fm-drawer-occ-pill"
                        >
                          <span>{occ.icon}</span>
                          <span>{occ.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Smart Carts Suite */}
              <div className="fm-drawer-section">
                <h4 className="fm-drawer-heading">Smart Features & Guarantee</h4>
                <Link to="/memory-cart" onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span><Heart size={18} /></span> Memory Cart (Auto-Refill & Reminders)
                </Link>
                <Link to="/future-cart" onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span><Calendar size={18} /></span> Future Cart (Occasion & Budget Planner)
                </Link>
                <Link to="/order-history" onClick={() => setIsDrawerOpen(false)} className="fm-drawer-item">
                  <span><ShieldCheck size={18} /></span> 7-days Return & Exchange Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
