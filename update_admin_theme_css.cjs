const fs = require('fs');

const cssPath = 'src/pages/AdminDashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

const darkModeAndResponsiveCss = `

/* ======================================================== */
/* OLED DARK MODE & DYNAMIC ACCENT SUPPORT                  */
/* ======================================================== */

.fm-admin-root.admin-theme-dark,
[data-theme="dark"] .fm-admin-root,
body[data-theme="dark"] .fm-admin-root {
  --z-bg: #090d16;
  --z-card-bg: #111827;
  --z-border: #1f2937;
  --z-border-subtle: #1e293b;
  --z-text-dark: #f8fafc;
  --z-text-muted: #94a3b8;
  --z-text-light: #64748b;
  background-color: #090d16 !important;
  color: #f8fafc !important;
}

.fm-admin-root.admin-theme-dark .zestro-topbar {
  background: #111827 !important;
  border-bottom-color: #1f2937 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.fm-admin-root.admin-theme-dark .zestro-sidebar {
  background: #0d131f !important;
  border-right-color: #1f2937 !important;
}

.fm-admin-root.admin-theme-dark .sidebar-nav-item {
  color: #94a3b8 !important;
}

.fm-admin-root.admin-theme-dark .sidebar-nav-item:hover {
  background: #1e293b !important;
  color: #f8fafc !important;
}

.fm-admin-root.admin-theme-dark .sidebar-nav-item.active {
  background: rgba(168, 85, 247, 0.15) !important;
  color: #f8fafc !important;
  border-left-color: var(--primary-color) !important;
}

.fm-admin-root.admin-theme-dark .zestro-pane-content,
.fm-admin-root.admin-theme-dark .z-card,
.fm-admin-root.admin-theme-dark .stat-card,
.fm-admin-root.admin-theme-dark .zestro-table-header-bar,
.fm-admin-root.admin-theme-dark .zestro-modal-box,
.fm-admin-root.admin-theme-dark .admin-user-chip,
.fm-admin-root.admin-theme-dark .z-table-input,
.fm-admin-root.admin-theme-dark .z-table-select,
.fm-admin-root.admin-theme-dark .zestro-search-input {
  background: #111827 !important;
  border-color: #1f2937 !important;
  color: #f8fafc !important;
}

.fm-admin-root.admin-theme-dark .stat-card {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
}

.fm-admin-root.admin-theme-dark table thead th {
  background: #1e293b !important;
  color: #cbd5e1 !important;
  border-bottom-color: #334155 !important;
}

.fm-admin-root.admin-theme-dark table tbody tr td {
  border-bottom-color: #1f2937 !important;
  color: #e2e8f0 !important;
}

.fm-admin-root.admin-theme-dark table tbody tr:hover td {
  background: #172133 !important;
}

.fm-admin-root.admin-theme-dark .zestro-modal-input,
.fm-admin-root.admin-theme-dark input,
.fm-admin-root.admin-theme-dark select,
.fm-admin-root.admin-theme-dark textarea {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

.fm-admin-root.admin-theme-dark .zestro-modal-backdrop {
  background: rgba(0, 0, 0, 0.75);
}

.fm-admin-root.admin-theme-dark .btn-customer-app {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #e2e8f0 !important;
}

/* ======================================================== */
/* HIGH-RESOLUTION & LARGE SCREEN RESPONSIVE SCALING         */
/* ======================================================== */

@media (min-width: 1440px) {
  .fm-admin-root {
    font-size: clamp(14px, 0.9vw, 17px);
  }

  .zestro-main {
    padding: clamp(20px, 1.8vw, 36px);
  }

  .stat-card-value {
    font-size: clamp(1.4rem, 1.6vw, 2.2rem) !important;
  }

  .zestro-brand-title {
    font-size: clamp(1rem, 1.1vw, 1.3rem);
  }

  .zestro-topbar {
    height: clamp(64px, 4.5vw, 76px);
  }
}

@media (min-width: 1920px) {
  .zestro-main {
    max-width: 1800px;
    margin: 0 auto;
    width: 100%;
  }

  .zestro-table-container,
  .zestro-pane-content {
    border-radius: 16px;
  }
}
`;

if (!css.includes('admin-theme-dark')) {
  css += darkModeAndResponsiveCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Appended dark mode and responsive scaling CSS successfully!');
} else {
  console.log('admin-theme-dark already present in CSS');
}
