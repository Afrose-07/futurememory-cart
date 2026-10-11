import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import ProductGrid from '../components/ProductGrid';
import { products } from '../data/products';
import { OCCASIONS, OCCASION_DETAILS } from '../utils/constants';
import './LandingPage.css';

const LandingPage = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="fm-landing-page">
      {/* Hero Section */}
      <section className="fm-hero">
        <div className="container fm-hero-container">
          <div className="fm-hero-content">
            <span className="fm-hero-pill"> The Evolution of E-Commerce</span>
            <h1 className="fm-hero-title">
              Shop Today, <span className="highlight-memory">Remember Repurchases</span>, & <span className="highlight-future">Plan the Future</span>.
            </h1>
            <p className="fm-hero-subtitle">
              Traditional carts only think about right now. FutureMemory Cart introduces an intelligent 3-in-1 cart experience that organizes immediate purchases, essential product refills, and milestone occasion budgets.
            </p>
            <div className="fm-hero-buttons">
              <Link to="/shop">
                <Button size="lg" variant="primary" icon="️">
                  Explore Products
                </Button>
              </Link>
              <Link to="/future-cart">
                <Button size="lg" variant="future" icon="">
                  Plan an Event
                </Button>
              </Link>
              <Link to="/memory-cart">
                <Button size="lg" variant="memory" icon="">
                  Try Memory Cart
                </Button>
              </Link>
            </div>
          </div>

          <div className="fm-hero-visual">
            <div className="fm-hero-cards-stack">
              <div className="fm-preview-card normal-preview">
                <div className="preview-header">
                  <span className="preview-icon">️</span>
                  <div>
                    <strong>Normal Cart</strong>
                    <span>Instant checkout & lightning shipping</span>
                  </div>
                </div>
                <div className="preview-stat">Ready for 1-Click Buy</div>
              </div>

              <div className="fm-preview-card memory-preview">
                <div className="preview-header">
                  <span className="preview-icon"></span>
                  <div>
                    <strong>Memory Cart</strong>
                    <span>Auto-refills & price drop alerts</span>
                  </div>
                </div>
                <div className="preview-tag">Every 2 Months Refill • ₹50 Price Drop!</div>
              </div>

              <div className="fm-preview-card future-preview">
                <div className="preview-header">
                  <span className="preview-icon"></span>
                  <div>
                    <strong>Future Cart</strong>
                    <span>Occasion timeline & budget planner</span>
                  </div>
                </div>
                <div className="preview-tag">Wedding Plan in 3 Months • Curated Bundles</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Carts Deep Dive */}
      <section className="fm-features-section">
        <div className="container">
          <div className="fm-section-header text-center">
            <span className="section-subtitle">Triple Cart Architecture</span>
            <h2 className="section-title">One Store. Three Intelligent Ways to Buy.</h2>
            <p className="section-desc">
              Experience seamless shopping tailored for how real people buy: now, recurring, and planned.
            </p>
          </div>

          <div className="fm-three-carts-grid">
            {/* Card 1: Normal Cart */}
            <div className="fm-feature-box feat-normal">
              <div className="feat-icon-box">️</div>
              <h3>1. Standard Instant Cart</h3>
              <p>
                Add items to your cart for immediate needs with promo coupons, live discounts, and frictionless multi-payment checkout.
              </p>
              <ul className="feat-bullets">
                <li> Instant item count & subtotal updates</li>
                <li> Promotional discount codes (e.g. <code>FUTURE20</code>)</li>
                <li> 1-click move to Wishlist or Memory Cart</li>
              </ul>
              <Link to="/shop" className="feat-link">Shop Catalog →</Link>
            </div>

            {/* Card 2: Memory Cart */}
            <div className="fm-feature-box feat-memory">
              <div className="feat-icon-box"></div>
              <h3>2. Memory Cart (Recurring)</h3>
              <p>
                Never run out of skincare, hair shampoo, or daily essentials. Set refill intervals and receive price drop alerts.
              </p>
              <ul className="feat-bullets">
                <li> Customized intervals (1 to 6 months)</li>
                <li> Live price drop savings notifications</li>
                <li> 1-click move to normal cart when due</li>
              </ul>
              <Link to="/memory-cart" className="feat-link link-memory">Manage Refills →</Link>
            </div>

            {/* Card 3: Future Cart */}
            <div className="fm-feature-box feat-future">
              <div className="feat-icon-box"></div>
              <h3>3. Future Cart (Occasions)</h3>
              <p>
                Got an upcoming Wedding, College Semester, Vacation, or New Home? Plan products ahead with intelligent timeline recommendations.
              </p>
              <ul className="feat-bullets">
                <li> Tailored suggestions based on occasion tags</li>
                <li> Month-by-month countdown & budget tracker</li>
                <li> Early-bird deal alerts before your milestone</li>
              </ul>
              <Link to="/future-cart" className="feat-link link-future">Start Milestone Plan →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Occasion Planning Quick Hub */}
      <section className="fm-occasions-section">
        <div className="container">
          <div className="fm-section-header text-center">
            <span className="section-subtitle">Milestone Planning Hub</span>
            <h2 className="section-title">What are you preparing for?</h2>
            <p className="section-desc">
              Select an upcoming event to receive curated bundles and timeline savings.
            </p>
          </div>

          <div className="fm-occasions-grid">
            {OCCASIONS.map((occ) => {
              const details = OCCASION_DETAILS[occ] || { icon: '', description: 'Curated shopping planner', popularTimeline: '1 Month' };
              return (
                <Link
                  key={occ}
                  to={`/future-cart?selected=${encodeURIComponent(occ)}`}
                  className="fm-occasion-pill-card"
                >
                  <span className="occ-icon">{details.icon}</span>
                  <div className="occ-info">
                    <h4>{occ}</h4>
                    <p>{details.description}</p>
                    <span className="occ-timeline">Popular timeline: {details.popularTimeline}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Products Preview */}
      <section className="fm-trending-section">
        <div className="container">
          <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-subtitle">Top Highlights</span>
              <h2 className="section-title">Popular Items Across All Carts</h2>
            </div>
            <Link to="/shop">
              <Button variant="outline">View All 20 Products →</Button>
            </Link>
          </div>

          <ProductGrid products={featuredProducts} columns={4} />
        </div>
      </section>

      {/* Call to Action */}
      <section className="fm-cta-section">
        <div className="container">
          <div className="fm-cta-box">
            <h2>Ready for a Smarter Shopping Routine?</h2>
            <p>
              Join thousands of shoppers organizing their daily essentials and upcoming life events with FutureMemory Cart.
            </p>
            <div className="fm-cta-actions">
              <Link to="/signup">
                <Button size="lg" variant="primary">Create Free Account</Button>
              </Link>
              <Link to="/shop">
                <Button size="lg" variant="secondary">Browse as Guest</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
