import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import './SettingsModal.css';

const SettingsModal = () => {
  const {
    theme,
    setTheme,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    notificationPreference,
    setNotificationPreference,
    isSettingsOpen,
    closeSettings
  } = useSettings();

  const { lang, changeLanguage, t } = useLanguage();

  const [toggles, setToggles] = React.useState(() => JSON.parse(localStorage.getItem('fm_notif_toggles') || '{"order":true,"wishlist":true,"memoryCart":true,"price":true,"stock":true}'));

  const toggleItem = (key) => {
    const newToggles = { ...toggles, [key]: !toggles[key] };
    setToggles(newToggles);
    localStorage.setItem('fm_notif_toggles', JSON.stringify(newToggles));
    window.dispatchEvent(new Event('storage'));
  };

  if (!isSettingsOpen) return null;

  const themesList = [
    { id: 'light', name: 'Clean Light', color: 'var(--primary-color)', previewBg: '#ffffff', desc: 'Modern & Crisp' },
    { id: 'dark', name: 'Obsidian Dark', color: '#6366f1', previewBg: '#090d16', desc: 'Midnight OLED' },
    { id: 'gold', name: 'Royal Gold', color: '#d97706', previewBg: '#0d0c0a', desc: 'Luxury Amber' },
    { id: 'emerald', name: 'Emerald Forest', color: '#059669', previewBg: '#04140e', desc: 'Nature Green' },
    { id: 'cyber', name: 'Cyber Neon', color: '#9333ea', previewBg: '#0b0717', desc: 'Futuristic Glow' },
    { id: 'rose', name: 'Rose Sunset', color: '#e11d48', previewBg: '#14080c', desc: 'Warm Elegance' }
  ];

  const fontsList = [
    { id: 'sans', name: 'Plus Jakarta Sans', sample: 'Modern Standard' },
    { id: 'inter', name: 'Inter UI', sample: 'Crisp Tech' },
    { id: 'poppins', name: 'Poppins', sample: 'Geometric Chic' },
    { id: 'serif', name: 'Playfair Display', sample: 'Luxury Serif' },
    { id: 'outfit', name: 'Outfit', sample: 'Friendly Rounded' }
  ];

  const fontSizes = [
    { id: 'sm', label: 'Compact', size: '14px' },
    { id: 'md', label: 'Standard', size: '16px' },
    { id: 'lg', label: 'Large', size: '18px' },
    { id: 'xl', label: 'Extra Large', size: '20px' }
  ];

  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' }
  ];

  return (
    <div className="fm-settings-backdrop" onClick={closeSettings}>
      <div className="fm-settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="fm-settings-header">
          <div className="fm-settings-title-group">
            <span className="fm-settings-icon">⚙️</span>
            <div>
              <h3>{t('settingsTitle')}</h3>
              <p className="fm-settings-sub">Customize theme, typography, size, and regional language</p>
            </div>
          </div>
          <button className="fm-settings-close-btn" onClick={closeSettings} aria-label="Close settings">
            ✕
          </button>
        </div>

        <div className="fm-settings-body">
          {/* Language Selector */}
          <section className="fm-setting-section">
            <div className="fm-section-label">
              <span className="section-title">{t('languageSelect')}</span>
              <span className="section-hint">Select a language to transform the entire website</span>
            </div>
            <div className="fm-lang-grid">
              {languages.map((l) => (
                <button
                  key={l.code}
                  className={`fm-lang-card ${lang === l.code ? 'active' : ''}`}
                  onClick={() => changeLanguage(l.code)}
                >
                  <span className="lang-flag">{l.flag}</span>
                  <div className="lang-text">
                    <span className="lang-native">{l.native}</span>
                    <span className="lang-eng">{l.name}</span>
                  </div>
                  {lang === l.code && <span className="lang-check">✓</span>}
                </button>
              ))}
            </div>
          </section>

          {/* Theme Color Selector */}
          <section className="fm-setting-section">
            <div className="fm-section-label">
              <span className="section-title">{t('themeColor')}</span>
              <span className="section-hint">Choose your preferred visual palette</span>
            </div>
            <div className="fm-themes-grid">
              {themesList.map((th) => (
                <button
                  key={th.id}
                  className={`fm-theme-card ${theme === th.id ? 'active' : ''}`}
                  onClick={() => setTheme(th.id)}
                  style={{ '--theme-accent': th.color }}
                >
                  <div className="theme-color-dot" style={{ backgroundColor: th.color, border: `2px solid ${th.previewBg}` }}>
                    <div className="theme-inner-bg" style={{ backgroundColor: th.previewBg }} />
                  </div>
                  <div className="theme-meta">
                    <span className="theme-name">{th.name}</span>
                    <span className="theme-desc">{th.desc}</span>
                  </div>
                  {theme === th.id && <span className="theme-selected-badge">Active</span>}
                </button>
              ))}
            </div>
          </section>

          {/* Font Family Selector */}
          <section className="fm-setting-section">
            <div className="fm-section-label">
              <span className="section-title">✍️ {t('fontFamily')}</span>
              <span className="section-hint">Select typeface aesthetic</span>
            </div>
            <div className="fm-fonts-row">
              {fontsList.map((f) => (
                <button
                  key={f.id}
                  className={`fm-font-btn ${fontFamily === f.id ? 'active' : ''}`}
                  onClick={() => setFontFamily(f.id)}
                >
                  <span className="font-btn-name">{f.name}</span>
                  <span className="font-btn-sample">{f.sample}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Font Size Scaling */}
          <section className="fm-setting-section">
            <div className="fm-section-label">
              <span className="section-title">{t('fontSize')}</span>
              <span className="section-hint">Adjust reading comfort across screens</span>
            </div>
            <div className="fm-fontsize-tabs">
              {fontSizes.map((s) => (
                <button
                  key={s.id}
                  className={`fm-size-tab ${fontSize === s.id ? 'active' : ''}`}
                  onClick={() => setFontSize(s.id)}
                >
                  <span className="size-label">{s.label}</span>
                  <span className="size-val">({s.size})</span>
                </button>
              ))}
            </div>
          </section>

          {/* Notification Toggles */}
          <section className="fm-setting-section">
            <div className="fm-section-label">
              <span className="section-title">🔔 Notification Settings</span>
              <span className="section-hint">Choose which alerts you want to receive</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'order', label: 'Order Updates' },
                { key: 'wishlist', label: 'Wishlist Updates' },
                { key: 'memoryCart', label: 'Memory Cart Reminders' },
                { key: 'price', label: 'Price Alerts' },
                { key: 'stock', label: 'Stock Alerts' }
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 500, color: '#334155' }}>{item.label}</span>
                  <label className="fm-toggle-switch" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={toggles[item.key]} onChange={() => toggleItem(item.key)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Notification Preference */}
          <section className="fm-setting-section">
            <div className="fm-section-label">
              <span className="section-title">Notification Preference</span>
              <span className="section-hint">Where should we send your updates?</span>
            </div>
            <div className="fm-fontsize-tabs">
              {[
                { id: 'whatsapp', label: 'WhatsApp', icon: '📱 ' },
                { id: 'email', label: 'Email', icon: '✉️ ' }
              ].map((p) => (
                <button
                  key={p.id}
                  className={`fm-size-tab ${notificationPreference === p.id ? 'active' : ''}`}
                  onClick={() => {
                    setNotificationPreference(p.id);
                    if (p.id === 'email') {
                      const email = localStorage.getItem('customer_email') || 'afromalik07@gmail.com';
                      fetch('http://localhost:5000/api/users/activate-channel', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, channel: 'email', name: 'Valued Customer' })
                      }).catch(() => {});
                    }
                  }}
                >
                  <span className="size-label">{p.icon}{p.label}</span>
                </button>
              ))}
            </div>
            {notificationPreference === 'email' && (
              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>✓ Verified Gmail SMTP: {localStorage.getItem('customer_email') || 'afromalik07@gmail.com'}</span>
                <a href="https://mail.google.com/mail/u/0/#inbox" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'underline' }}>Open Gmail ↗</a>
              </div>
            )}
          </section>
        </div>

        <div className="fm-settings-footer">
          <button
            className="fm-btn-reset"
            onClick={() => {
              setTheme('light');
              setFontFamily('sans');
              setFontSize('md');
              changeLanguage('en');
            }}
          >
            {t('resetSettings')}
          </button>
          <button className="fm-btn-apply" onClick={closeSettings}>
            {t('saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
