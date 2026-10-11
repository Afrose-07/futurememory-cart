import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('fm_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  const [fontFamily, setFontFamily] = useState(() => {
    try {
      return localStorage.getItem('fm_font') || 'sans';
    } catch {
      return 'sans';
    }
  });

  const [fontSize, setFontSize] = useState(() => {
    try {
      return localStorage.getItem('fm_fontsize') || 'md';
    } catch {
      return 'md';
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState(false);

  const [notificationPreference, setNotificationPreference] = useState(() => {
    try {
      return localStorage.getItem('fm_notif_pref') || 'email';
    } catch {
      return 'email';
    }
  });

  // Apply attributes and CSS variables on root html element
  useEffect(() => {
    try {
      localStorage.setItem('fm_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('fm_font', fontFamily);
      document.documentElement.setAttribute('data-font', fontFamily);
    } catch (e) {
      console.error(e);
    }
  }, [fontFamily]);

  useEffect(() => {
    try {
      localStorage.setItem('fm_fontsize', fontSize);
      document.documentElement.setAttribute('data-fontsize', fontSize);
    } catch (e) {
      console.error(e);
    }
  }, [fontSize]);
  
  useEffect(() => {
    try {
      localStorage.setItem('fm_notif_pref', notificationPreference);
      localStorage.setItem('customer_notification_pref', notificationPreference);
    } catch (e) {
      console.error(e);
    }
  }, [notificationPreference]);

  const toggleSettings = () => setIsSettingsOpen(prev => !prev);
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const openGoogleAuth = () => setIsGoogleAuthOpen(true);
  const closeGoogleAuth = () => setIsGoogleAuthOpen(false);

  return (
    <SettingsContext.Provider value={{
      theme,
      setTheme,
      fontFamily,
      setFontFamily,
      fontSize,
      setFontSize,
      notificationPreference,
      setNotificationPreference,
      isSettingsOpen,
      openSettings,
      closeSettings,
      toggleSettings,
      isGoogleAuthOpen,
      openGoogleAuth,
      closeGoogleAuth
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
