import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './PageHeader.css';

const PageHeader = ({
  title,
  subtitle,
  badge = null,
  breadcrumbs = [],
  action = null
}) => {
  const { t } = useLanguage();

  return (
    <div className="fm-page-header">
      <div className="container">
        {breadcrumbs.length > 0 && (
          <div className="fm-breadcrumbs">
            <Link to="/">{t('home')}</Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className="fm-breadcrumb-separator">/</span>
                {crumb.link ? (
                  <Link to={crumb.link}>{crumb.label}</Link>
                ) : (
                  <span className="fm-breadcrumb-current">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="fm-page-header-main">
          <div className="fm-page-header-text">
            <div className="fm-page-title-row">
              <h1 className="fm-page-title">{title}</h1>
              {badge && <span className="fm-page-badge">{badge}</span>}
            </div>
            {subtitle && <p className="fm-page-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="fm-page-header-action">{action}</div>}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
