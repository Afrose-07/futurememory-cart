import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: ' Please sign in or create an account to explore our premium catalog and manage your cart.'
        }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
