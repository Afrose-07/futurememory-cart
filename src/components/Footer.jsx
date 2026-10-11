import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="fm-footer">
      <div className="container">
        <div className="fm-footer-grid">
          {/* Brand Col */}
          <div className="fm-footer-col brand-col">
            <div className="fm-footer-brand">
              <BrandLogo size="md" dark={true} />
            </div>
            <p className="fm-footer-desc">
              Next-generation personalized e-commerce system that combines standard shopping, smart recurring repurchase memory, and milestone-driven future occasion planning.
            </p>
            <div className="fm-footer-badges">
              <span className="pill-feat"> Instant Cart</span>
              <span className="pill-feat"> Memory Repurchase</span>
              <span className="pill-feat"> Future Planner</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="fm-footer-col">
            <h4>Quick Navigation</h4>
            <ul>
              <li><Link to="/home">Home Highlights</Link></li>
              <li><Link to="/shop">Shop All Products</Link></li>
              <li><Link to="/categories">Product Categories</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/cart">Active Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Memory Cart System */}
          <div className="fm-footer-col">
            <h4>Memory Cart System</h4>
            <ul>
              <li><Link to="/memory-cart">Repurchase Dashboard</Link></li>
              <li><Link to="/memory-cart/reminders">Refill Reminders Schedule</Link></li>
              <li><Link to="/memory-cart/price-alerts">Price Drop Tracker</Link></li>
              <li><Link to="/notifications">Alert Preferences</Link></li>
            </ul>
          </div>

          {/* Future Cart System */}
          <div className="fm-footer-col">
            <h4>Future Cart System</h4>
            <ul>
              <li><Link to="/future-cart">Occasion Selector</Link></li>
              <li><Link to="/future-cart/month">Planning Timeline</Link></li>
              <li><Link to="/future-cart/recommendations">Curated Bundles</Link></li>
              <li><Link to="/future-cart/dashboard">Event Budget Dashboard</Link></li>
              <li><Link to="/future-cart/deal-alerts">Planned Deals & Offers</Link></li>
            </ul>
          </div>
        </div>

        <div className="fm-footer-bottom">
          <p>© {new Date().getFullYear()} FutureMemory Cart Inc. Built for high-efficiency personalized shopping.</p>
          <div className="fm-footer-bottom-links">
            <Link to="/profile">My Account</Link>
            <span>•</span>
            <Link to="/order-history">Order History</Link>
            <span>•</span>
            <Link to="/shop?category=Gifts">Gift Finder</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
