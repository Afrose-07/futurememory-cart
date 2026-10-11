import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFutureCart } from '../context/FutureCartContext';
import { products } from '../data/products';
import { getOccasionRecommendations } from '../utils/helpers';
import PageHeader from '../components/PageHeader';
import RecommendationCard from '../components/RecommendationCard';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import './FutureCartPage.css';

const FutureCartRecommendationsPage = () => {
  const [searchParams] = useSearchParams();
  const { futureData } = useFutureCart();

  const activeOccasion = searchParams.get('occasion') || futureData.occasion || 'Wedding';
  const matchingProducts = getOccasionRecommendations(activeOccasion, products);
  const fallbackProducts = products.slice(0, 8);
  const displayProducts = matchingProducts.length > 0 ? matchingProducts : fallbackProducts;

  return (
    <div className="fm-future-page">
      <PageHeader
        title={` Curated Recommendations for ${activeOccasion}`}
        subtitle={`Step 3 of 3: Handpicked products matching your ${activeOccasion} timeline.`}
        breadcrumbs={[
          { label: 'Future Cart', link: '/future-cart' },
          { label: activeOccasion, link: '/future-cart/month' },
          { label: 'Recommendations' }
        ]}
        badge={`${displayProducts.length} Suggestions`}
        action={
          <Link to="/future-cart/dashboard">
            <Button variant="primary" icon="">
              View Event Plan Dashboard ({futureData.plannedProducts.length}) →
            </Button>
          </Link>
        }
      />

      <div className="container">
        {/* Wizard Stepper */}
        <div className="fm-wizard-stepper">
          <div className="wizard-step">
            <span className="step-num"></span>
            <span className="step-label">1. {activeOccasion}</span>
          </div>
          <div className="wizard-line" />
          <div className="wizard-step">
            <span className="step-num"></span>
            <span className="step-label">2. {futureData.months || 3} Months</span>
          </div>
          <div className="wizard-line" />
          <div className="wizard-step active">
            <span className="step-num">3</span>
            <span className="step-label">Curated Items</span>
          </div>
        </div>

        {/* Informational Banner */}
        <div style={{
          background: '#f8fafc',
          border: '1.5px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
               Tailor Your {activeOccasion} Package
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Add items below to your Future Cart. You can adjust priorities, monitor bundle discounts, and buy whenever ready.
            </p>
          </div>
          <Link to="/shop">
            <Button variant="secondary" size="sm">Search Catalog for More</Button>
          </Link>
        </div>

        {/* Recommendations Grid */}
        {displayProducts.length === 0 ? (
          <EmptyState
            icon=""
            title="No Specific Bundles Found"
            description="Explore our full catalog to manually add items to your future occasion plan."
            actionText="Browse Shop Catalog"
            actionLink="/shop"
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
            {displayProducts.map((prod) => (
              <RecommendationCard
                key={prod.id}
                product={prod}
                occasionName={activeOccasion}
              />
            ))}
          </div>
        )}

        {/* Finish Wizard Action Bar */}
        <div className="fm-wizard-bottom-bar">
          <div>
            Currently Planned: <strong>{futureData.plannedProducts.length} Items</strong>
          </div>
          <Link to="/future-cart/dashboard">
            <Button variant="future" size="lg" icon="">
              Open Full {activeOccasion} Dashboard →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FutureCartRecommendationsPage;
