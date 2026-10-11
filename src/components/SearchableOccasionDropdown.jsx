import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Sparkles, Filter } from 'lucide-react';
import { occasionsMetadata } from '../data/allOccasionsCatalog';
import './SearchableOccasionDropdown.css';

const GROUPS = [
  'All',
  'Celebrations & Gifts',
  'Festivals & Cultural Events',
  'College & Career',
  'Lifestyle & Special Moments'
];

const SearchableOccasionDropdown = ({
  selectedOccasion = 'All',
  onChange,
  className = '',
  placeholder = 'Select Occasion'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setSelectedGroup('All');
    }
  }, [isOpen]);

  const currentOccasionObj = useMemo(() => {
    if (!selectedOccasion || selectedOccasion === 'All') return null;
    return occasionsMetadata.find(
      (o) => o.id === selectedOccasion || o.name.toLowerCase() === selectedOccasion.toLowerCase()
    );
  }, [selectedOccasion]);

  // Filter occasions by search and group tab
  const filteredOccasions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return occasionsMetadata.filter((occ) => {
      if (selectedGroup !== 'All' && occ.group !== selectedGroup) {
        return false;
      }
      if (q) {
        const matchName = occ.name.toLowerCase().includes(q);
        const matchGroup = occ.group.toLowerCase().includes(q);
        const matchDesc = (occ.description || '').toLowerCase().includes(q);
        const matchId = occ.id.toLowerCase().includes(q);
        return matchName || matchGroup || matchDesc || matchId;
      }
      return true;
    });
  }, [searchQuery, selectedGroup]);

  // Group occasions for rendering
  const groupedOccasions = useMemo(() => {
    const groups = {};
    filteredOccasions.forEach((occ) => {
      if (!groups[occ.group]) {
        groups[occ.group] = [];
      }
      groups[occ.group].push(occ);
    });
    return groups;
  }, [filteredOccasions]);

  const handleSelect = (occId) => {
    onChange && onChange(occId);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange && onChange('All');
  };

  return (
    <div className={`fm-occ-dropdown-wrapper ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`fm-occ-trigger-btn ${isOpen ? 'active' : ''} ${currentOccasionObj ? 'has-selection' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="fm-occ-trigger-left">
          {currentOccasionObj ? (
            <>
              <span className="fm-occ-trigger-icon">{currentOccasionObj.icon}</span>
              <div className="fm-occ-trigger-labels">
                <span className="fm-occ-trigger-name">{currentOccasionObj.name}</span>
                <span className="fm-occ-trigger-group">{currentOccasionObj.group}</span>
              </div>
            </>
          ) : (
            <>
              <span className="fm-occ-trigger-icon default">
                <Filter size={16} />
              </span>
              <span className="fm-occ-trigger-placeholder">{placeholder}</span>
            </>
          )}
        </div>

        <div className="fm-occ-trigger-right">
          {currentOccasionObj && (
            <span
              className="fm-occ-clear-chip"
              onClick={handleClear}
              title="Clear occasion filter"
              role="button"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={18} className={`fm-occ-chevron ${isOpen ? 'rotated' : ''}`} />
        </div>
      </button>

      {/* Dropdown Modal Menu */}
      {isOpen && (
        <div className="fm-occ-menu-panel">
          {/* Header & Search */}
          <div className="fm-occ-menu-header">
            <div className="fm-occ-search-box">
              <Search size={16} className="fm-occ-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="fm-occ-search-input"
                placeholder="Search 34 occasions (e.g. Birthday, Diwali, Travel)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="fm-occ-search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Group Category Tabs */}
            <div className="fm-occ-group-tabs">
              {GROUPS.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  className={`fm-occ-tab-btn ${selectedGroup === grp ? 'active' : ''}`}
                  onClick={() => setSelectedGroup(grp)}
                >
                  {grp === 'All' ? '🌟 All Occasions' : grp}
                </button>
              ))}
            </div>
          </div>

          {/* Body List of Occasions */}
          <div className="fm-occ-menu-body">
            {/* All Occasions Default Option */}
            {selectedGroup === 'All' && !searchQuery && (
              <div
                className={`fm-occ-item fm-occ-all-item ${selectedOccasion === 'All' ? 'selected' : ''}`}
                onClick={() => handleSelect('All')}
              >
                <div className="fm-occ-item-left">
                  <span className="fm-occ-item-icon">✨</span>
                  <div>
                    <strong className="fm-occ-item-title">All Occasions & Gifts</strong>
                    <span className="fm-occ-item-desc">Browse complete 1,020+ catalog across all events</span>
                  </div>
                </div>
                {selectedOccasion === 'All' && (
                  <span className="fm-occ-check">
                    <Check size={16} />
                  </span>
                )}
              </div>
            )}

            {filteredOccasions.length === 0 ? (
              <div className="fm-occ-empty-state">
                <p>No occasions found matching "{searchQuery}".</p>
                <button
                  type="button"
                  className="fm-occ-empty-reset-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGroup('All');
                  }}
                >
                  View All Occasions
                </button>
              </div>
            ) : (
              Object.entries(groupedOccasions).map(([groupName, occList]) => (
                <div key={groupName} className="fm-occ-group-section">
                  <div className="fm-occ-group-header">
                    <span>{groupName}</span>
                    <span className="fm-occ-group-badge">{occList.length} Occasions</span>
                  </div>
                  <div className="fm-occ-items-grid">
                    {occList.map((occ) => {
                      const isSelected =
                        selectedOccasion === occ.id ||
                        selectedOccasion.toLowerCase() === occ.name.toLowerCase();
                      return (
                        <div
                          key={occ.id}
                          className={`fm-occ-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelect(occ.id)}
                        >
                          <div className="fm-occ-item-left">
                            <span className="fm-occ-item-icon">{occ.icon}</span>
                            <div className="fm-occ-item-text">
                              <span className="fm-occ-item-title">{occ.name}</span>
                              <span className="fm-occ-item-badge">30 Gifts</span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="fm-occ-check">
                              <Check size={16} />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="fm-occ-menu-footer">
            <span className="fm-occ-footer-note">
              34 Occasion Categories • 30 Verified Products per Occasion
            </span>
            {selectedOccasion !== 'All' && (
              <button
                type="button"
                className="fm-occ-footer-reset-btn"
                onClick={() => handleSelect('All')}
              >
                Clear Occasion Filter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableOccasionDropdown;
