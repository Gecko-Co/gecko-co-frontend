import React, { useState } from 'react';
import Status from './category/Status';
import Species from './category/Species';
import Gender from './category/Gender';

const Filter = ({
  status,
  species,
  gender,
  updateStatus,
  updateSpecies,
  updateGender,
  clearFilters,
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClearFilters = () => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
      clearFilters();
    }, 280);
  };

  return (
    <div className="col-lg-3 col-12 mb-5">
      <div className="text-center fw-bold fs-4 mb-2" style={{ paddingTop: '60px' }}>Filters</div>
      <div className="d-flex justify-content-center">
        <button
          style={{ 
            cursor: "pointer", 
            backgroundColor: isClicked ? "#23283b" : "white", 
            color: isClicked ? "white" : "#23283b", 
            border: "1px solid #23283b", 
            padding: "5px 20px", 
            borderRadius: "4px", 
            transition: "background-color 0.3s ease, color 0.3s ease"
          }}
          onClick={handleClearFilters}
          className="text-decoration-none text-center mb-3"
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#23283b';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = isClicked ? "#23283b" : "white";
            e.target.style.color = isClicked ? "white" : "#23283b";
          }}
        >
          {isClicked ? 'Clearing...' : 'Clear Filters'}
        </button>
      </div>
      <div className="accordion" id="accordionExample">
        <Status
          selectedStatus={status}
          updateStatus={updateStatus}
        />
        <Species
          selectedSpecies={species}
          updateSpecies={updateSpecies}
        />
        <Gender
          selectedGender={gender}
          updateGender={updateGender}
        />
      </div>
      <style jsx>{`
        .accordion-button:not(.collapsed) {
          background-color: #23283b !important; 
          color: white !important; 
        }
        .accordion-button:not(.collapsed):hover {
          background-color: #23283b !important; 
          color: white !important; 
        }
      `}</style>
    </div>
  );
};

export default Filter;