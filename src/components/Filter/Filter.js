import React, { useState } from 'react';
import Status from './category/Status';
import Species from './category/Species';
import Gender from './category/Gender';

const Filter = ({
  pageNumber,
  updatePageNumber,
  updateStatus,
  updateGender,
  updateSpecies,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [isClicked, setIsClicked] = useState(false);

  let clear = () => {
    updateStatus("");
    updateGender("");
    updateSpecies("");
    updatePageNumber(1);
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 200);
  };

  return (
    <div className="col-lg-3 col-12 mb-5">
      <div className="text-center fw-bold fs-4 mb-2">Filters</div>
      <button
        style={{ 
          cursor: "pointer", 
          backgroundColor: isClicked ? "#0b5ed7" : "#23283b", 
          color: "white", 
          border: "none", 
          padding: "5px 20px", 
          borderRadius: "4px", 
          transition: "background-color 0.3s ease",
          display: "block",
          margin: "0 auto"
        }}
        onClick={clear}
        className="text-decoration-none text-center mb-3"
      >
        {isClicked ? 'Clearing...' : 'Clear Filters'}
      </button>
      <div className="accordion" id="accordionExample">
        <Status
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          updatePageNumber={updatePageNumber}
          updateStatus={updateStatus}
        />
        <Species
          selectedSpecies={selectedSpecies}
          setSelectedSpecies={setSelectedSpecies}
          updatePageNumber={updatePageNumber}
          updateSpecies={updateSpecies}
        />
        <Gender
          updatePageNumber={updatePageNumber}
          updateGender={updateGender}
        />
      </div>
      {/* Inline styles for the open accordion heading and Clear Filters button */}
      <style jsx>{`
        .accordion-button:not(.collapsed) {
          background-color: #23283b !important; /* Same as footer background color */
          color: white !important; /* Important to override Bootstrap's default color */
        }
        .accordion-button:not(.collapsed):hover {
          background-color: #23283b !important; /* Same as selected background color */
          color: white !important; /* Important to override Bootstrap's default color */
        }
        button:hover {
          background-color: #0b5ed7;
        }
      `}</style>
    </div>
  );
};

export default Filter;
