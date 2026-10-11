import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/helpers';
import { Bell, ShoppingBag, Heart, Tag, Package } from 'lucide-react';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications, getUnreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = getUnreadCount();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'price_drop':
        return <Tag size={16} />;
      case 'reminder':
        return <Heart size={16} />;
      case 'deal':
        return <ShoppingBag size={16} />;
      case 'order':
        return <Package size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <div className="fm-notif-container" ref={dropdownRef}>
      <button
        className="fm-notif-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
      >
        <span className="fm-notif-icon"><Bell size={24} /></span>
        {unreadCount > 0 && <span className="fm-notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="fm-notif-dropdown">
          <div className="fm-notif-header">
            <div className="fm-notif-header-title">
              <h4>Notifications</h4>
              {unreadCount > 0 && (
                <span className="fm-notif-unread-tag">{unreadCount} unread</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="fm-notif-action-btn"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="fm-notif-list">
            {notifications.length === 0 ? (
              <div className="fm-notif-empty">
                <span></span>
                <p>All caught up! No notifications.</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className={`fm-notif-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <span className="fm-notif-item-icon">{getIconForType(notif.type)}</span>
                  <div className="fm-notif-item-content">
                    <p className="fm-notif-item-title">{notif.title}</p>
                    <p className="fm-notif-item-desc">{notif.message}</p>
                    <span className="fm-notif-item-time">{formatDate(notif.timestamp)}</span>
                  </div>
                  {!notif.read && <span className="fm-notif-unread-dot" />}
                </div>
              ))
            )}
          </div>

          <div className="fm-notif-footer">
            <Link
              to="/notifications"
              className="fm-notif-view-all"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications ({notifications.length}) →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
