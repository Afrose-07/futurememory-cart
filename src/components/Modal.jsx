import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, footer = null, maxWidth = '540px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fm-modal-backdrop" onClick={onClose}>
      <div
        className="fm-modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fm-modal-header">
          <h3 className="fm-modal-title">{title}</h3>
          <button className="fm-modal-close" onClick={onClose} aria-label="Close modal">
            
          </button>
        </div>
        <div className="fm-modal-body">{children}</div>
        {footer && <div className="fm-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
