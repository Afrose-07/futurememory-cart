import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useFutureCart } from '../context/FutureCartContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { MONTH_OPTIONS } from '../utils/constants';
import { getNextReminderDate, formatDate } from '../utils/helpers';
import './FutureCartPage.css';

const FutureCartMonthPage = () => {
  const [searchParams] = useSearchParams();
  const { futureData, setMonths, setBudgetGoal } = useFutureCart();
  const navigate = useNavigate();

  const occasion = searchParams.get('occasion') || futureData.occasion || 'Wedding';
  const [selectedMonth, setSelectedMonth] = useState(futureData.months || 3);
  const [budget, setBudget] = useState(futureData.budgetGoal || 15000);

  const targetDate = getNextReminderDate(selectedMonth);

  const handleProceed = () => {
    setMonths(selectedMonth);
    setBudgetGoal(budget);
    navigate(`/future-cart/recommendations?occasion=${encodeURIComponent(occasion)}`);
  };

  return (
    <div className="fm-future-page">
      <PageHeader
        title={` Plan for ${occasion}`}
        subtitle="Step 2 of 3: Set your planning horizon and optional target budget."
        breadcrumbs={[
          { label: 'Future Cart', link: '/future-cart' },
          { label: 'Timeline & Budget' }
        ]}
      />

      <div className="container">
        {/* Wizard Stepper */}
        <div className="fm-wizard-stepper">
          <div className="wizard-step">
            <span className="step-num"></span>
            <span className="step-label">1. {occasion}</span>
          </div>
          <div className="wizard-line" />
          <div className="wizard-step active">
            <span className="step-num">2</span>
            <span className="step-label">Timeline & Budget</span>
          </div>
          <div className="wizard-line" />
          <div className="wizard-step">
            <span className="step-num">3</span>
            <span className="step-label">Curated Plan</span>
          </div>
        </div>

        <div className="fm-month-picker-container" style={{ maxWidth: '780px', margin: '0 auto 40px auto' }}>
          {/* Milestone Target Date Card */}
          <div className="fm-target-preview-box" style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, var(--primary-color) 100%)',
            color: '#ffffff',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '32px',
            boxShadow: '0 10px 25px rgba(124, 58, 237, 0.25)'
          }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#e9d5ff', fontWeight: 700 }}>
              Estimated Milestone Date
            </span>
            <h2 style={{ fontSize: '2rem', margin: '8px 0', fontWeight: 800 }}>
              {formatDate(targetDate)}
            </h2>
            <p style={{ margin: 0, color: 'var(--primary-light)', fontSize: '0.95rem' }}>
              We'll curate recommendations and track early discounts across your {selectedMonth}-month horizon.
            </p>
          </div>

          {/* Month Selector Grid */}
          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Select Timeline (When is your {occasion}?):
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {MONTH_OPTIONS.slice(0, 6).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedMonth(opt.value)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: selectedMonth === opt.value ? '2px solid #7c3aed' : '1.5px solid #cbd5e1',
                    background: selectedMonth === opt.value ? '#faf5ff' : '#ffffff',
                    color: selectedMonth === opt.value ? '#7c3aed' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Goal Input */}
          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div className="flex-between mb-1">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Estimated Event Budget Goal:
              </h3>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed' }}>
                ₹{Number(budget).toLocaleString('en-IN')}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              We will track item totals to help you stay within your designated budget.
            </p>
            <input
              type="range"
              min="2000"
              max="50000"
              step="1000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fm-wizard-bottom-bar" style={{ maxWidth: '780px', margin: '0 auto' }}>
          <Link to="/future-cart">
            <Button variant="secondary">← Back to Occasions</Button>
          </Link>
          <Button variant="future" size="lg" onClick={handleProceed} icon="">
            Generate Curated Recommendations →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FutureCartMonthPage;
