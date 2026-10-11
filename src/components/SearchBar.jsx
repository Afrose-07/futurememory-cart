import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'Search 10,000+ products, occasions, brands...', initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form className="fm-searchbar" onSubmit={handleSubmit}>
      <span className="fm-searchbar-icon"></span>
      <input
        type="text"
        className="fm-searchbar-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (onSearch) onSearch(e.target.value);
        }}
      />
      {query && (
        <button type="button" className="fm-searchbar-clear" onClick={handleClear}>
          
        </button>
      )}
      <button type="submit" className="fm-searchbar-btn">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
