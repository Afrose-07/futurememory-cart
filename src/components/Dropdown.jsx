import React from 'react';
import './Dropdown.css';

const Dropdown = ({
  options = [],
  value,
  onChange,
  label = '',
  placeholder = 'Select an option',
  className = '',
  disabled = false
}) => {
  return (
    <div className={`fm-dropdown-wrapper ${className}`}>
      {label && <label className="fm-dropdown-label">{label}</label>}
      <div className="fm-dropdown-select-container">
        <select
          className="fm-dropdown-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
        <span className="fm-dropdown-arrow">▾</span>
      </div>
    </div>
  );
};

export default Dropdown;
