import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useFutureCart } from '../context/FutureCartContext';
import { useLanguage } from '../context/LanguageContext';
import { allProductsCatalog } from '../data/allOccasionsCatalog';
import ProductGrid from '../components/ProductGrid';
import Button from '../components/Button';
import { 
  ShieldCheck, 
  MessageCircle, 
  ShoppingBag, 
  Heart, 
  UserPlus, 
  LogIn, 
  Truck, 
  Wallet, 
  Bot, 
  Bell, 
  Watch, 
  Cpu, 
  Shirt, 
  Gem, 
  Briefcase, 
  Gift, 
  Home as HomeIcon,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { formatPrice, formatDate } from '../utils/helpers';
import './HomePage.css';

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { memoryItems, getDueReminders } = useMemoryCart();
  const { futureData, getPlannedTotal } = useFutureCart();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const dueReminders = getDueReminders();
  
  // Clean standard e-commerce product curation matching 10 master categories
  const dealsOfTheDay = allProductsCatalog.filter(p => p.discount >= 35).slice(0, 16);
  const trendingBestSellers = allProductsCatalog.filter(p => p.rating >= 4.8).slice(0, 16);
  const featuredTech = allProductsCatalog.filter(p => p.category === 'Electronics & Gadgets' || p.category === 'Watches').slice(0, 16);
  const lifestyleCollection = allProductsCatalog.filter(p => p.category === "Women's Fashion" || p.category === "Men's Fashion" || p.category === "Kids' Fashion" || p.category === "Bags & Luggage").slice(0, 16);

  const handleGuardedNav = (e, targetUrl, reason = 'browse our collection') => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login', {
        state: {
          from: { pathname: targetUrl },
          message: ` Please create an account or sign in to ${reason}.`
        }
      });
    }
  };

  return (
    <div className="fm-home-page">
        {/* Ultra-Modern Hero Banner */}
        <section className="fm-home-hero" style={{ paddingTop: isAuthenticated ? '0' : '30px' }}>
        <div className="container">
          <div className="fm-home-hero-card">
            <div className="fm-home-hero-text">
              <div className="hero-top-badges">
                <span className="fm-home-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={16} /> {t('hassleFreeReturns')}
                </span>
                <span className="fm-home-sub-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MessageCircle size={16} /> {t('whatsappOrderUpdates')}
                </span>
              </div>
              
              {isAuthenticated ? (
                <>
                  <h1 className="hero-headline">
                    {t('welcomeBack')}, <span className="highlight-name">{user?.name ? user.name.split(' ')[0] : 'Shopper'}</span>!
                  </h1>
                  <p className="hero-subtext">
                    {lang === 'ta'
                      ? 'உங்கள் விருப்பமான எலக்ட்ரானிக்ஸ், ஆடைகள் மற்றும் வீட்டுப் பொருட்களை 10-நாட்கள் எளிதான ரிட்டர்ன் உத்தரவாதத்துடன் ஷாப்பிங் செய்யுங்கள்.'
                      : 'Explore premium electronics, fashion, lifestyle essentials, and home favorites with 7-days doorstep return guarantee.'}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="hero-headline">
                    {lang === 'ta' ? 'ஸ்மார்ட் ஷாப்பிங் மற்றும் எளிதான ரிட்டர்ன்' : 'Next-Gen Smart Shopping & 7-days Easy Returns'}
                  </h1>
                  <p className="hero-subtext">
                    {lang === 'ta'
                      ? 'அனைத்து உயர்தர தயாரிப்புகளுக்கும் வீட்டு வாசலில் ரிட்டர்ன் மற்றும் உடனடி ரீஃபண்ட் வசதி.'
                      : 'Discover verified products with 100% doorstep reverse pickup guarantee, instant wallet bonus, and AI memory cart.'}
                  </p>
                </>
              )}

              {/* Action Buttons */}
              <div className="hero-btn-group">
                {isAuthenticated ? (
                  <>
                    <Link to="/shop" className="fm-hero-cta-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ShoppingBag size={20} /> {lang === 'ta' ? 'ஷாப்பிங் செய்ய' : 'Explore Catalog'}
                    </Link>
                    <Link to="/memory-cart" className="fm-hero-cta-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Heart size={20} /> {t('openMemoryCart')} ({memoryItems.length})
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/signup" className="fm-hero-cta-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <UserPlus size={20} /> {t('createAccountToShop')}
                    </Link>
                    <Link to="/login" className="fm-hero-cta-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <LogIn size={20} /> {t('signIn')}
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="fm-home-hero-stats">
                <div className="stat-item">
                  <span className="stat-num">100%</span>
                  <span className="stat-lbl">{lang === 'ta' ? 'அசல் தயாரிப்புகள்' : 'Genuine Products'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">Top</span>
                  <span className="stat-lbl">{lang === 'ta' ? 'பிரத்யேக பரிசுகள்' : 'Curated Gifts'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">7 days</span>
                  <span className="stat-lbl">{t('daysReturnGuarantee')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">100%</span>
                  <span className="stat-lbl">{t('doorstepReturns')}</span>
                </div>
              </div>
            </div>

            {/* Right Side: Smart Feature Showcase Card */}
            <div className="fm-hero-feature-preview">
              <div className="feature-preview-glass-card">
                <div className="preview-card-header">
                  <span className="preview-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Heart size={14} /> Memory Cart Active
                  </span>
                  <span className="preview-rating">⭐ 4.9 / 5.0</span>
                </div>

                <div className="preview-product-spotlight">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
                    alt="Minimalist Watch"
                    className="preview-img"
                  />
                  <div className="preview-details">
                    <h4>Minimalist Ceramic Chronograph</h4>
                    <p className="preview-cadence"> Auto-Refill Cadence: <strong>Every 2 Months</strong></p>
                    <div className="preview-price-row">
                      <span className="preview-price">₹3,499</span>
                      <span className="preview-save">Save 25% OFF</span>
                    </div>
                  </div>
                </div>

                <div className="preview-card-perks">
                  <div className="perk-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="var(--primary-color)" />
                    <small>7-days Doorstep Return</small>
                  </div>
                  <div className="perk-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={16} color="#f59e0b" />
                    <small>Express 48h Dispatch</small>
                  </div>
                  <div className="perk-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageCircle size={16} color="#25d366" />
                    <small>WhatsApp Notifications</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Navigation Strip */}
      <section className="container mt-2">
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none'
        }}>
          {[
            { label: "Women's Fashion", cat: "Women's Fashion", icon: '👗' },
            { label: "Men's Fashion", cat: "Men's Fashion", icon: '👔' },
            { label: "Kids' Fashion", cat: "Kids' Fashion", icon: '🧸' },
            { label: "Bags & Luggage", cat: "Bags & Luggage", icon: '👜' },
            { label: "Electronics & Gadgets", cat: "Electronics & Gadgets", icon: '🎧' },
            { label: "Home & Kitchen", cat: "Home & Kitchen", icon: '🍳' },
            { label: "Beauty & Personal Care", cat: "Beauty & Personal Care", icon: '💄' },
            { label: "Watches", cat: "Watches", icon: '⌚' },
            { label: "Accessories", cat: "Accessories", icon: '💍' },
            { label: "Gifts & Greeting Cards", cat: "Gifts & Greeting Cards", icon: '🎁' }
          ].map(c => (
            <Link
              key={c.cat}
              to={`/shop?category=${encodeURIComponent(c.cat)}`}
              onClick={(e) => handleGuardedNav(e, `/shop?category=${encodeURIComponent(c.cat)}`, `view ${c.label}`)}
              style={{
                flexShrink: 0,
                padding: '9px 18px',
                borderRadius: '9999px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#334155',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.15s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{c.icon}</span> {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 7-days Return Trust Ribbon */}
      <section className="container mt-2">
        <div className="fm-trust-ribbon">
          <div className="trust-col">
            <span className="trust-icon"><ShieldCheck size={28} color="var(--primary-color)" /></span>
            <div>
              <strong>7 days Easy Return Guarantee</strong>
              <p>Hassle-free return with doorstep reverse pickup.</p>
            </div>
          </div>
          <div className="trust-col">
            <span className="trust-icon"><Wallet size={28} color="#f59e0b" /></span>
            <div>
              <strong>Instant Wallet Refunds</strong>
              <p>Get +5% extra bonus cash on wallet refunds.</p>
            </div>
          </div>
          <div className="trust-col">
            <span className="trust-icon"><Truck size={28} color="#2563eb" /></span>
            <div>
              <strong>Free Express Courier</strong>
              <p>Dispatched with tracking to every Indian pincode.</p>
            </div>
          </div>
          <div className="trust-col">
            <span className="trust-icon"><Bot size={28} color="#10b981" /></span>
            <div>
              <strong>English & Tanglish AI Bot</strong>
              <p>24/7 smart assistant for recommendations & support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Due Reminder Alert Bar */}
      {dueReminders.length > 0 && (
        <section className="fm-due-banner-section">
          <div className="container">
            <div className="fm-due-alert-box">
              <div className="fm-due-alert-left">
                <span className="due-bell"><Bell size={24} color="#f59e0b" /></span>
                <div>
                  <h4>Refill Due Today in Memory Cart!</h4>
                  <p>You have {dueReminders.length} product(s) scheduled for restock: {dueReminders.map(i => i.name).join(', ')}</p>
                </div>
              </div>
              <Link to="/memory-cart/reminders" onClick={(e) => handleGuardedNav(e, '/memory-cart/reminders', 'view scheduled refills')}>
                <Button variant="primary" size="sm">
                  Review & Refill Now →
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Section 1:  Trending Best Sellers */}
      <section className="container mt-3">
        <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.6rem' }}>
               {lang === 'ta' ? 'அதிகம் விற்பனையாகும் பொருட்கள்' : 'Trending Best Sellers'}
            </h2>
            <p className="section-desc" style={{ margin: 0 }}>
              {lang === 'ta' ? 'வாடிக்கையாளர்களால் அதிகம் விரும்பப்பட்ட உயர்தர பொருட்கள்' : 'Top customer-rated electronics, accessories, and essentials'}
            </p>
          </div>
          <Link to="/shop" onClick={(e) => handleGuardedNav(e, '/shop', 'explore best sellers')}>
            <Button variant="outline" size="sm">
              {lang === 'ta' ? 'அனைத்தையும் பார்' : 'View All'} →
            </Button>
          </Link>
        </div>
        <ProductGrid products={trendingBestSellers} columns={4} />
      </section>

      {/* Section 2:  Deals of the Day (25%+ OFF) */}
      <section className="container mt-3">
        <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.6rem' }}>
               {lang === 'ta' ? 'இன்றைய சிறப்பு தள்ளுபடிகள்' : 'Deals of the Day'}
            </h2>
            <p className="section-desc" style={{ margin: 0 }}>
              {lang === 'ta' ? 'அனைத்து பொருட்களுக்கும் 10-நாட்கள் எளிதான ரிட்டர்ன் உத்தரவாதம்' : 'Limited-time deals with verified 7-days doorstep reverse pickup'}
            </p>
          </div>
          <Link to="/shop" onClick={(e) => handleGuardedNav(e, '/shop', 'explore all deals')}>
            <Button variant="outline" size="sm">
              {lang === 'ta' ? 'தள்ளுபடிகளைப் பார்' : 'View All Deals'} →
            </Button>
          </Link>
        </div>
        <ProductGrid products={dealsOfTheDay} columns={4} />
      </section>

      {/* Promo Banner with Coupon */}
      <section className="container mt-3">
        <div className="fm-home-promo-banner">
          <div className="promo-left">
            <span className="promo-tag">LIMITED SPECIAL COUPON</span>
            <h2>Get Flat 25% OFF with Code MEMORY25</h2>
            <p>Applies across all store categories with 7-days doorstep reverse pickup guarantee.</p>
          </div>
          <div className="promo-right">
            <Link to="/shop" onClick={(e) => handleGuardedNav(e, '/shop', 'shop with discount')}>
              <Button size="lg" variant="primary">Shop Catalog Now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3:  Smart Tech & Wearables */}
      <section className="container mt-3">
        <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.6rem' }}>
               {lang === 'ta' ? 'ஸ்மார்ட் டெக் & வாட்ச்கள்' : 'Smart Tech & Wearables'}
            </h2>
            <p className="section-desc" style={{ margin: 0 }}>
              {lang === 'ta' ? 'ஸ்மார்ட்வாட்ச்கள், புளூடூத் இயர்போன்கள் மற்றும் பிரீமியம் கேஜெட்கள்' : 'High-precision smartwatches, audio devices, and connected gear'}
            </p>
          </div>
          <Link to={`/shop?category=${encodeURIComponent('Electronics & Gadgets')}`} onClick={(e) => handleGuardedNav(e, `/shop?category=${encodeURIComponent('Electronics & Gadgets')}`, 'view tech collection')}>
            <Button variant="outline" size="sm">
              {lang === 'ta' ? 'எலக்ட்ரானிக்ஸ் பார்' : 'Explore Tech'} →
            </Button>
          </Link>
        </div>
        <ProductGrid products={featuredTech} columns={4} />
      </section>

      {/* Section 4:  Fashion & Lifestyle Collection */}
      <section className="container mt-3 mb-4">
        <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.6rem' }}>
               {lang === 'ta' ? 'பேஷன் & லைஃப்ஸ்டைல்' : 'Fashion & Lifestyle Essentials'}
            </h2>
            <p className="section-desc" style={{ margin: 0 }}>
              {lang === 'ta' ? 'பாரம்பரிய ஆடைகள், தோல் பைகள் மற்றும் நகைகள்' : 'Curated ethnic wear, genuine leather accessories, and jewellery'}
            </p>
          </div>
          <Link to={`/shop?category=${encodeURIComponent("Women's Fashion")}`} onClick={(e) => handleGuardedNav(e, `/shop?category=${encodeURIComponent("Women's Fashion")}`, 'view lifestyle collection')}>
            <Button variant="outline" size="sm">
              {lang === 'ta' ? 'பேஷன் பார்' : 'Explore Fashion'} →
            </Button>
          </Link>
        </div>
        <ProductGrid products={lifestyleCollection} columns={4} />
      </section>
      </div>
  );
};

export default HomePage;
