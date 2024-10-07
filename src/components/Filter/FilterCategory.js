import React from 'react';
import './FilterCategory.scss';

const FilterCategory = ({ title, options, selectedValue, updateValue, isOpen, toggleOpen }) => {
  return (
    <div className={`filter-category ${isOpen ? 'open' : ''}`}>
      <button 
        className="filter-category-toggle"
        onClick={toggleOpen}
      >
        {title}
        <span className="toggle-icon">{isOpen ? '−' : '+'}</span>
      </button>
      <div className="filter-category-content">
        {options.map((option) => (
          <label key={option} className="filter-option">
            <input
              type="radio"
              name={title}
              value={option}
              checked={selectedValue === option}
              onChange={() => updateValue(option)}
            />
            <span className="filter-option-label">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterCategory;