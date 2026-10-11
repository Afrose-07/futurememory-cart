import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import './AuthPages.css';

const AccountCreatedPage = () => {
  const { user } = useAuth();

  return (
    <div className="fm-auth-container">
      <div className="fm-auth-card fm-success-card">
        <span className="fm-success-icon"></span>
        <h2>Account Created Successfully!</h2>
        <p>
          Welcome aboard, <strong>{user?.name || 'Shopper'}</strong>! Your personal Smart Shopping assistant is ready.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/home">
            <Button variant="primary" size="lg" fullWidth icon="">
              Go to Home Page
            </Button>
          </Link>
          <Link to="/future-cart">
            <Button variant="future" size="md" fullWidth icon="">
              Set Up First Occasion Plan
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="secondary" size="md" fullWidth icon="️">
              Start Shopping Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountCreatedPage;
