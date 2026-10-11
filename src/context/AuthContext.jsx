import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Clean registered users initial state - no dummy mock accounts!
const SEED_USERS = [];

export const AuthProvider = ({ children }) => {
  // Registry of all registered accounts in localStorage
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('future_registered_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Clean out any old mock demo users
          const cleanUsers = parsed.filter(u => 
            !['anandha.krishnan@gmail.com', 'priya.sundaram@gmail.com', 'karthik.subramanian@outlook.com', 'arunkumar@gmail.com'].includes(u.email?.toLowerCase())
          );
          return cleanUsers;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Active logged-in user: defaults to null (visitor is NOT logged in by default)
  const [user, setUser] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem('future_active_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem('future_active_user');
      return Boolean(storedUser);
    } catch {
      return false;
    }
  });

  const [isGuest, setIsGuest] = useState(false);

  // Sync active user to sessionStorage so it clears on exit
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('future_active_user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      sessionStorage.removeItem('future_active_user');
      setIsAuthenticated(false);
    }
  }, [user]);

  // Sync registered users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('future_registered_users', JSON.stringify(registeredUsers));
    } catch (e) {
      console.error('Failed to sync registered users', e);
    }
  }, [registeredUsers]);

  // Login with Email & Password validation against real registered accounts
  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail === 'afromalik07@gmail.com') {
      return { success: false, error: 'This is an Admin account. Please use the Admin Portal.' };
    }
    
    // Read fresh from localStorage to guarantee latest registered accounts
    let usersList = registeredUsers;
    try {
      const stored = localStorage.getItem('future_registered_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          usersList = parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }

    const existing = usersList.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (existing) {
      const sessionUser = {
        ...existing,
        loginTime: new Date().toISOString()
      };
      setUser(sessionUser);
      setIsAuthenticated(true);
      setIsGuest(false);
      return { success: true };
    }

    // Check if email exists with wrong password
    const emailExists = usersList.some(u => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return {
        success: false,
        error: ' Incorrect password. Please check your credentials and try again.'
      };
    }

    return {
      success: false,
      error: ' No account found with this email. Please create a new account (Sign Up).'
    };
  };

  // Google OAuth Login with real user details
  const loginWithGoogle = (googleUserData) => {
    const cleanEmail = (googleUserData.email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    if (cleanEmail === 'afromalik07@gmail.com') {
      return { success: false, error: 'This is an Admin account. Please use the Admin Portal.' };
    }

    let existing = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      existing = {
        name: googleUserData.name || 'Google User',
        email: cleanEmail,
        password: 'google_oauth_verified',
        avatar: googleUserData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleUserData.name || 'G')}`,
        mobile: googleUserData.mobile || '',
        walletBalance: 500,
        provider: 'google',
        joinedDate: new Date().toISOString()
      };
      setRegisteredUsers(prev => [...prev, existing]);
    }

    const sessionUser = {
      ...existing,
      loginTime: new Date().toISOString()
    };
    setUser(sessionUser);
    setIsAuthenticated(true);
    setIsGuest(false);
    return { success: true };
  };

  // Signup with real user credentials
  const signup = ({ name, email, password, mobile }) => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail === 'afromalik07@gmail.com') {
      return { success: false, error: 'This email is reserved for Admin use.' };
    }
    
    const alreadyExists = registeredUsers.some(u => u.email.toLowerCase() === cleanEmail);

    if (alreadyExists) {
      return {
        success: false,
        error: ' An account with this email already exists. Please log in instead.'
      };
    }

    const newUser = {
      name: name.trim(),
      email: cleanEmail,
      password: password,
      mobile: mobile ? mobile.trim() : '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      walletBalance: 500, // Sign-up welcome credit
      provider: 'email',
      joinedDate: new Date().toISOString()
    };

    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('future_registered_users', JSON.stringify(updatedUsers));
    return { success: true };
  };

  const addWalletCredit = (amount) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        walletBalance: (prev.walletBalance || 0) + amount
      };
      setRegisteredUsers(list =>
        list.map(u => u.email.toLowerCase() === prev.email.toLowerCase() ? { ...u, walletBalance: updated.walletBalance } : u)
      );
      return updated;
    });
  };

  const updateUserProfile = (updatedData) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      setRegisteredUsers(list =>
        list.map(u => u.email.toLowerCase() === prev.email.toLowerCase() ? { ...u, ...updatedData } : u)
      );
      return updated;
    });
  };

  // Admin CRUD for Customer Accounts
  const addCustomer = async (customerData) => {
    const cleanEmail = (customerData.email || '').trim().toLowerCase();
    const exists = registeredUsers.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'A customer with this email address already exists.' };
    }

    const newCustomer = {
      id: 'user_' + Date.now(),
      name: (customerData.name || 'Valued Customer').trim(),
      email: cleanEmail,
      password: customerData.password || 'Welcome@123',
      mobile: customerData.mobile || '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customerData.name || 'C')}`,
      walletBalance: Number(customerData.walletBalance) || 500,
      provider: customerData.provider || 'email',
      status: customerData.status || 'active',
      joinedDate: new Date().toISOString()
    };

    setRegisteredUsers(prev => [newCustomer, ...prev]);

    // Async attempt to persist to backend
    fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    }).catch(() => null);

    return { success: true, customer: newCustomer };
  };

  const updateCustomer = async (idOrEmail, updatedData) => {
    let updatedObj = null;
    setRegisteredUsers(prev => prev.map(u => {
      if (u.id === idOrEmail || u.email.toLowerCase() === idOrEmail.toLowerCase()) {
        updatedObj = { ...u, ...updatedData };
        return updatedObj;
      }
      return u;
    }));

    // If current logged in user was modified
    if (user && (user.id === idOrEmail || user.email.toLowerCase() === idOrEmail.toLowerCase())) {
      setUser(prev => ({ ...prev, ...updatedData }));
    }

    // Async attempt to persist to backend
    fetch(`http://localhost:5000/api/users/${idOrEmail}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    }).catch(() => null);

    return { success: true, customer: updatedObj };
  };

  const deleteCustomer = async (idOrEmail) => {
    setRegisteredUsers(prev => prev.filter(
      u => u.id !== idOrEmail && u.email.toLowerCase() !== idOrEmail.toLowerCase()
    ));

    // If current logged-in user is deleted
    if (user && (user.id === idOrEmail || user.email.toLowerCase() === idOrEmail.toLowerCase())) {
      logout();
    }

    // Async attempt to persist to backend
    fetch(`http://localhost:5000/api/users/${idOrEmail}`, {
      method: 'DELETE'
    }).catch(() => null);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsGuest(false);
    sessionStorage.removeItem('future_active_user');
    localStorage.removeItem('future_active_user');
    localStorage.removeItem('customer_whatsapp_number');
    localStorage.removeItem('customer_mobile');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('customer_email');
    localStorage.removeItem('fm_addresses_guest');
    localStorage.removeItem('fm_notif_pref');
    localStorage.removeItem('customer_notification_pref');
    localStorage.removeItem('customer_upi_id');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isGuest,
      registeredUsers,
      login,
      loginWithGoogle,
      signup,
      addWalletCredit,
      updateUserProfile,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
