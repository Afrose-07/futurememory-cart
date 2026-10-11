import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/helpers';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearNotifications } = useNotifications();
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  const filtered = notifications.filter(notif => {
    if (filterType === 'unread') return !notif.read;
    if (filterType === 'price_drop') return notif.type === 'price_drop';
    if (filterType === 'reminder') return notif.type === 'reminder';
    if (filterType === 'deal') return notif.type === 'deal';
    return true;
  });

  const handleCardClick = (notif) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'price_drop':
        return '';
      case 'reminder':
        return '';
      case 'deal':
        return '️';
      case 'order':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="fm-notifs-page">
      <PageHeader
        title=" Notification Center"
        subtitle="Stay alerted on due Memory Cart refills, instant price drops, and upcoming occasion deals."
        breadcrumbs={[{ label: 'Notifications' }]}
        badge={`${notifications.length} Alerts`}
        action={
          notifications.length > 0 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                Mark All Read
              </Button>
              <Button variant="danger" size="sm" onClick={clearNotifications}>
                Clear All
              </Button>
            </div>
          )
        }
      />

      <div className="container">
        {/* Filters */}
        <div className="fm-notifs-filter-bar">
          <button
            className={`notif-filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`notif-filter-btn ${filterType === 'unread' ? 'active' : ''}`}
            onClick={() => setFilterType('unread')}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
          <button
            className={`notif-filter-btn ${filterType === 'reminder' ? 'active' : ''}`}
            onClick={() => setFilterType('reminder')}
          >
             Refill Reminders
          </button>
          <button
            className={`notif-filter-btn ${filterType === 'price_drop' ? 'active' : ''}`}
            onClick={() => setFilterType('price_drop')}
          >
             Price Drops
          </button>
          <button
            className={`notif-filter-btn ${filterType === 'deal' ? 'active' : ''}`}
            onClick={() => setFilterType('deal')}
          >
            ️ Event Deals
          </button>
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon=""
            title="No Notifications Found"
            description="You are fully up to date! Price drops and reminder alerts will appear here as soon as they trigger."
            actionText="Go to Home"
            actionLink="/home"
          />
        ) : (
          <div className="fm-notifs-full-list">
            {filtered.map((notif) => (
              <div
                key={notif.id}
                className={`fm-notif-full-card ${!notif.read ? 'unread' : ''}`}
                onClick={() => handleCardClick(notif)}
              >
                <span className="notif-full-icon">{getIconForType(notif.type)}</span>
                <div className="notif-full-content">
                  <div className="flex-between">
                    <h3 className="notif-full-title">{notif.title}</h3>
                    <span className="notif-full-date">{formatDate(notif.timestamp)}</span>
                  </div>
                  <p className="notif-full-msg">{notif.message}</p>
                  {notif.link && (
                    <span className="notif-full-link">View details →</span>
                  )}
                </div>
                <button
                  className="notif-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  title="Dismiss alert"
                >
                  
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
