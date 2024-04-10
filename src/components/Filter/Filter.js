import React, { useState } from 'react'; // Ensure useState is imported from 'react'
import Status from './category/Status'; // Adjust the path as necessary
import Species from './category/Species'; // Adjust the path as necessary
import Gender from './category/Gender'; // Adjust the path as necessary

const Filter = ({
  pageNumber,
  updatePageNumber,
  updateStatus,
  updateGender,
  updateSpecies,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');

  let clear = () => {
    updateStatus("");
    updateGender("");
    updateSpecies("");
    updatePageNumber(1);
    window.location.reload(false);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    updateStatus(newStatus);
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
          updatePageNumber={updatePageNumber}
          updateSpecies={updateSpecies}
        />
        <Gender
          updatePageNumber={updatePageNumber}
          updateGender={updateGender}
        />
      </div>
      {/* Status filter dropdown */}

    </div>
  );
};

export default Filter;
