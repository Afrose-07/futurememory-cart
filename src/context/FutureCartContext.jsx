import React, { createContext, useContext, useState, useEffect } from 'react';
import { getNextReminderDate } from '../utils/helpers';

const FutureCartContext = createContext();

export const FutureCartProvider = ({ children }) => {
  const [futureData, setFutureData] = useState(() => {
    try {
      const stored = localStorage.getItem('futureCart');
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed && typeof parsed === 'object') {
        return {
          occasion: parsed.occasion || '',
          months: parsed.months || null,
          targetDate: parsed.targetDate || null,
          budgetGoal: Number(parsed.budgetGoal) || 0,
          plannedProducts: Array.isArray(parsed.plannedProducts) ? parsed.plannedProducts : []
        };
      }
    } catch {}
    return {
      occasion: '',
      months: null,
      targetDate: null,
      budgetGoal: 0,
      plannedProducts: []
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('futureCart', JSON.stringify(futureData));
    } catch (e) {
      console.error(e);
    }
  }, [futureData]);

  const setOccasion = (occasion) => {
    setFutureData(prev => ({ ...prev, occasion }));
  };

  const setMonths = (months) => {
    const m = parseInt(months, 10) || 1;
    const targetDate = getNextReminderDate(m);
    setFutureData(prev => ({ ...prev, months: m, targetDate }));
  };

  const setBudgetGoal = (budgetGoal) => {
    setFutureData(prev => ({ ...prev, budgetGoal: Number(budgetGoal) || 0 }));
  };

  const addPlannedProduct = (product, priority = 'Medium') => {
    setFutureData(prev => {
      if (prev.plannedProducts.some(p => p.id === product.id)) {
        return prev;
      }
      return {
        ...prev,
        plannedProducts: [...prev.plannedProducts, { ...product, priority }]
      };
    });
  };

  const removePlannedProduct = (id) => {
    setFutureData(prev => ({
      ...prev,
      plannedProducts: prev.plannedProducts.filter(p => p.id !== id)
    }));
  };

  const isInFuturePlan = (id) => {
    return futureData.plannedProducts.some(p => p.id === id);
  };

  const getPlannedTotal = () => {
    return futureData.plannedProducts.reduce((total, p) => total + (p.price || 0), 0);
  };

  const resetFutureCart = () => {
    const emptyState = {
      occasion: null,
      months: null,
      targetDate: null,
      budgetGoal: 10000,
      plannedProducts: []
    };
    setFutureData(emptyState);
    localStorage.removeItem('futureCart');
  };

  return (
    <FutureCartContext.Provider value={{
      futureData,
      setOccasion,
      setMonths,
      setBudgetGoal,
      addPlannedProduct,
      addToFutureCart: addPlannedProduct,
      removePlannedProduct,
      isInFuturePlan,
      getPlannedTotal,
      resetFutureCart
    }}>
      {children}
    </FutureCartContext.Provider>
  );
};

export const useFutureCart = () => useContext(FutureCartContext);
