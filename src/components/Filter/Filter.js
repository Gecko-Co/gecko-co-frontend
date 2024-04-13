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
 clearFilters, // Receive clearFilters as a prop
}) => {
 const [selectedStatus, setSelectedStatus] = useState('');
 const [selectedSpecies, setSelectedSpecies] = useState('');
 const [selectedGender, setSelectedGender] = useState('');
 const [isClicked, setIsClicked] = useState(false); // State for animation

 const handleClearFilters = () => {
    setIsClicked(true); // Start animation
    setTimeout(() => {
      setIsClicked(false); // Reset animation
      setSelectedStatus('');
      setSelectedSpecies('');
      setSelectedGender('');
      clearFilters(); // Call clearFilters directly
    }, 280); // Reset after 1 second
 };

 return (
    <div className="col-lg-3 col-12 mb-5">
      <div className="text-center fw-bold fs-4 mb-2">Filters</div>
      <div className="d-flex justify-content-center"> {/* Center button container */}
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
          }} // Change background and text color on hover
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = isClicked ? "#23283b" : "white";
            e.target.style.color = isClicked ? "white" : "#23283b";
          }} // Reset background and text color on hover out
        >
          {isClicked ? 'Clearing...' : 'Clear Filters'}
        </button>
      </div>
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
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          updatePageNumber={updatePageNumber}
          updateGender={updateGender}
        />
      </div>
      {/* Inline styles for the open accordion heading and Clear Filters button */}
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
