import React, { useState } from 'react';
import FilterCategory from './FilterCategory';
import './Filter.scss';

function Filter({ 
  status, 
  species, 
  gender, 
  updateStatus, 
  updateSpecies, 
  updateGender, 
  clearFilters 
}) {
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleCategory = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  return (
    <div className="filter-container">
      <h2 className="filter-title">Filters</h2>
      <button onClick={clearFilters} className="clear-filters-btn">
        Clear Filters
      </button>
      <div className="filter-accordion">
        <FilterCategory 
          title="Status" 
          options={["Available", "Sold", "Reserved"]}
          selectedValue={status}
          updateValue={updateStatus}
          isOpen={activeCategory === 'Status'}
          toggleOpen={() => toggleCategory('Status')}
        />
        <FilterCategory 
          title="Species" 
          options={["Leopard Gecko", "Crested Gecko", "African Fat-tailed Gecko", "Knob-Tailed Gecko"]}
          selectedValue={species}
          updateValue={updateSpecies}
          isOpen={activeCategory === 'Species'}
          toggleOpen={() => toggleCategory('Species')}
        />
        <FilterCategory 
          title="Gender" 
          options={["Female", "Male", "Unknown"]}
          selectedValue={gender}
          updateValue={updateGender}
          isOpen={activeCategory === 'Gender'}
          toggleOpen={() => toggleCategory('Gender')}
        />
      </div>
    </div>
  );
}

export default Filter;