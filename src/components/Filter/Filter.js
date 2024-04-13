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

  let clear = () => {
    updateStatus("");
    updateGender("");
    updateSpecies("");
    updatePageNumber(1);
  };

  return (
    <div className="col-lg-3 col-12 mb-5">
      <div className="text-center fw-bold fs-4 mb-2">Filters</div>
      <div
        style={{ cursor: "pointer" }}
        onClick={clear}
        className="text-primary text-decoration-underline text-center mb-3"
      >
        Clear Filters
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
          updatePageNumber={updatePageNumber}
          updateGender={updateGender}
        />
      </div>
      {/* Inline styles for the open accordion heading */}
      <style jsx>{`
        .accordion-button:not(.collapsed) {
          background-color: #23283b; /* Same as footer background color */
          color: white !important; /* Important to override Bootstrap's default color */
        }
      `}</style>
    </div>
  );
};

export default Filter;
