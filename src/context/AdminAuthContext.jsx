import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

const ADMIN_STORAGE_KEY = 'futurememory_admin_session';

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = sessionStorage.getItem(ADMIN_STORAGE_KEY) || localStorage.getItem(ADMIN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (admin) {
      try {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
      } catch (e) {}
    } else {
      try {
        sessionStorage.removeItem(ADMIN_STORAGE_KEY);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      } catch (e) {}
    }
  }, [admin]);

  const loginAdmin = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      // First attempt backend API call if server is running
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setAdmin(data.admin);
        setLoading(false);
        return { success: true };
      }

      // Fallback verification for offline / direct test
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === 'afromalik07@gmail.com' && password === 'afromalik07') {
        const verifiedAdmin = {
          id: 'admin_afro_malik_1',
          name: 'Afro Malik',
          email: 'afromalik07@gmail.com',
          role: 'superadmin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop',
          token: 'token_admin_' + Date.now()
        };
        setAdmin(verifiedAdmin);
        setLoading(false);
        return { success: true };
      } else {
        const errMsg = ' Invalid admin credentials! Only authorized admin (afromalik07@gmail.com / afromalik07) can access.';
        setError(errMsg);
        setLoading(false);
        return { success: false, message: errMsg };
      }
    } catch (err) {
      const errMsg = 'Login failed. Please check credentials or try again.';
      setError(errMsg);
      setLoading(false);
      return { success: false, message: errMsg };
    }
  };

  // Google OAuth Login for Admin
  const loginAdminWithGoogle = async (googleUserData = {}) => {
    setLoading(true);
    setError('');

    try {
      if (googleUserData.email !== 'afromalik07@gmail.com') {
        setLoading(false);
        return { success: false, message: 'Access Denied! Only afromalik07@gmail.com is authorized.' };
      }

      const res = await fetch('http://localhost:5000/api/admin/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUserData)
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setAdmin(data.admin);
        setLoading(false);
        return { success: true };
      }

      // Default authorized admin session via Google
      const verifiedAdmin = {
        id: 'admin_afro_malik_google',
        name: googleUserData.name || 'Afro Malik',
        email: googleUserData.email || 'afromalik07@gmail.com',
        role: 'superadmin',
        avatar: googleUserData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop',
        token: 'token_admin_google_' + Date.now()
      };
      setAdmin(verifiedAdmin);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: 'Google authentication failed' };
    }
  };

  const loginAdminWithPin = async (pin, email = 'afromalik07@gmail.com') => {
    setLoading(true);
    setError('');

    const cleanPin = String(pin).trim();
    if (cleanPin !== '260107') {
      const errMsg = 'This code is invalid. Get a new code and try again.';
      setError(errMsg);
      setLoading(false);
      return { success: false, message: errMsg };
    }

    const verifiedAdmin = {
      id: 'admin_afro_malik_master',
      name: 'Afro Malik',
      email: 'afromalik07@gmail.com',
      role: 'superadmin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop',
      token: 'token_admin_master_' + Date.now()
    };

    setAdmin(verifiedAdmin);
    try {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(verifiedAdmin));
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(verifiedAdmin));
    } catch (e) {}

    setLoading(false);
    return { success: true, admin: verifiedAdmin };
  };

  const logoutAdmin = () => {
    setAdmin(null);
    try {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {}
  };

  const isAdminAuthenticated = Boolean(admin && admin.role);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAdminAuthenticated,
        loginAdmin,
        loginAdminWithGoogle,
        loginAdminWithPin,
        logoutAdmin,
        error,
        setError,
        loading
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
