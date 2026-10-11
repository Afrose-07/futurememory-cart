import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getNextReminderDate, isReminderDue } from '../utils/helpers';

const MemoryCartContext = createContext();

export const MemoryCartProvider = ({ children }) => {
  const { user } = useAuth();

  const getMemoryKey = (u) => {
    if (!u || !u.email) return 'fm_memory_guest';
    return `fm_memory_${u.email.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
  };

  const loadMemory = (u) => {
    try {
      const stored = localStorage.getItem(getMemoryKey(u));
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.filter(item => item && (item.id || item.cartKey)) : [];
    } catch {
      return [];
    }
  };

  const [memoryItems, setMemoryItems] = useState(() => loadMemory(user));

  useEffect(() => {
    setMemoryItems(loadMemory(user));
  }, [user?.email]);

  useEffect(() => {
    try {
      localStorage.setItem(getMemoryKey(user), JSON.stringify(memoryItems));
    } catch (e) {
      console.error(e);
    }
  }, [memoryItems, user?.email]);

  const generateCartKey = (item) => {
    const pId = item.productId || item.id;
    const col = item.color || 'none';
    const sz = item.size || 'none';
    return `${pId}-${col}-${sz}`;
  };

  const addToMemoryCart = (product, reminderMonths = 2) => {
    const months = parseInt(reminderMonths, 10) || 2;
    const savedDate = new Date().toISOString();
    const nextReminder = getNextReminderDate(months);
    const cartKey = generateCartKey(product);
    
    setMemoryItems(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? {
                ...item,
                ...product,
                reminderMonths: months,
                savedDate,
                nextReminder,
                usageFrequency: `Every ${months} Month${months > 1 ? 's' : ''}`
              }
            : item
        );
      }
      return [
        {
          ...product,
          cartKey,
          savedDate,
          reminderMonths: months,
          nextReminder,
          savedPrice: product.savedPrice || product.price,
          usageFrequency: `Every ${months} Month${months > 1 ? 's' : ''}`,
          autoNotification: true
        },
        ...prev
      ];
    });
  };

  const removeFromMemoryCart = (cartKey) => {
    setMemoryItems(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const editReminder = (cartKey, months) => {
    const m = parseInt(months, 10) || 1;
    setMemoryItems(prev =>
      prev.map(item =>
        item.cartKey === cartKey
          ? {
              ...item,
              reminderMonths: m,
              nextReminder: getNextReminderDate(m),
              usageFrequency: `Every ${m} Month${m > 1 ? 's' : ''}`
            }
          : item
      )
    );
  };

  const snoozeReminder = (cartKey, days = 7) => {
    setMemoryItems(prev =>
      prev.map(item => {
        if (item.cartKey === cartKey) {
          const snoozed = new Date();
          snoozed.setDate(snoozed.getDate() + days);
          return {
            ...item,
            nextReminder: snoozed.toISOString()
          };
        }
        return item;
      })
    );
  };

  const resetReminderCycle = (cartKey) => {
    setMemoryItems(prev =>
      prev.map(item => {
        if (item.cartKey === cartKey) {
          return {
            ...item,
            savedDate: new Date().toISOString(),
            nextReminder: getNextReminderDate(item.reminderMonths || 2)
          };
        }
        return item;
      })
    );
  };

  const isInMemoryCart = (idOrKey) => {
    // Just a fallback check if we pass id or cartKey
    return memoryItems.some(item => item.cartKey === idOrKey || item.id === idOrKey);
  };

  const getDueReminders = () => {
    if (!Array.isArray(memoryItems)) return [];
    return memoryItems.filter(item => item && item.nextReminder && isReminderDue(item.nextReminder));
  };

  const getPriceDropItems = () => {
    return memoryItems.filter(item => item.savedPrice && item.price < item.savedPrice);
  };

  const markAsDueToday = (cartKey) => {
    setMemoryItems(prev =>
      prev.map(item => {
        if (item.cartKey === cartKey) {
          const past = new Date();
          past.setMinutes(past.getMinutes() - 5);
          return {
            ...item,
            nextReminder: past.toISOString()
          };
        }
        return item;
      })
    );
  };

  const simulatePriceDrop = (cartKey) => {
    setMemoryItems(prev =>
      prev.map(item => {
        if (item.cartKey === cartKey) {
          return {
            ...item,
            savedPrice: Math.round(item.price * 1.25),
            price: Math.round(item.price * 0.85)
          };
        }
        return item;
      })
    );
  };

  const clearMemoryCart = () => {
    setMemoryItems([]);
    localStorage.removeItem(getMemoryKey(user));
  };

  return (
    <MemoryCartContext.Provider value={{
      memoryItems,
      addToMemoryCart,
      removeFromMemoryCart,
      editReminder,
      snoozeReminder,
      resetReminderCycle,
      markAsDueToday,
      simulatePriceDrop,
      isInMemoryCart,
      getDueReminders,
      getPriceDropItems,
      clearMemoryCart
    }}>
      {children}
    </MemoryCartContext.Provider>
  );
};

export const useMemoryCart = () => useContext(MemoryCartContext);
