import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useOrders } from './OrderContext';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const { user } = useAuth();
  const { orders } = useOrders();

  const [reviews, setReviews] = useState(() => {
    try {
      const stored = localStorage.getItem('fm_reviews_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fm_reviews_v1', JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (reviewData) => {
    const newReview = {
      reviewId: `REV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      date: new Date().toISOString(),
      userEmail: user?.email || 'guest',
      userName: user?.name || 'Guest',
      verifiedPurchase: true, // We only allow adding if canUserReview is true
      ...reviewData
    };
    setReviews(prev => [newReview, ...prev]);
    return newReview;
  };

  const getReviewsForModel = (modelId) => {
    return reviews.filter(r => r.modelId === modelId);
  };

  const hasUserReviewed = (modelId) => {
    const email = user?.email || 'guest';
    return reviews.some(r => r.modelId === modelId && r.userEmail === email);
  };

  const canUserReview = (modelId) => {
    if (hasUserReviewed(modelId)) return false;
    
    // Check if user bought it
    for (const order of orders) {
      if (order.items && order.items.some(item => item.modelId === modelId)) {
        return true;
      }
    }
    return false;
  };

  const getRatingStats = (modelId) => {
    const modelReviews = getReviewsForModel(modelId);
    if (modelReviews.length === 0) return { average: 0, count: 0, distribution: [0,0,0,0,0] };
    
    let total = 0;
    const dist = [0, 0, 0, 0, 0]; // 1-star to 5-star
    
    modelReviews.forEach(r => {
      total += r.rating;
      dist[r.rating - 1]++;
    });
    
    return {
      average: (total / modelReviews.length).toFixed(1),
      count: modelReviews.length,
      distribution: dist.map(d => Math.round((d / modelReviews.length) * 100))
    };
  };

  return (
    <ReviewContext.Provider value={{
      reviews,
      addReview,
      getReviewsForModel,
      hasUserReviewed,
      canUserReview,
      getRatingStats
    }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) throw new Error('useReviews must be used within ReviewProvider');
  return context;
};
