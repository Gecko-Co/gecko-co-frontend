import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Search from "../Search/Search";
import Card from "../Card/Card";
import Pagination from "../Pagination/Pagination";
import Filter from "../Filter/Filter";
import placeholderData from "../../data";

function Home() {
  const history = useNavigate();
  const [filteredResults, setFilteredResults] = useState(placeholderData.results);
  const [pageNumber, updatePageNumber] = useState(1);
  const [status, updateStatus] = useState("");
  const [gender, updateGender] = useState("");
  const [species, updateSpecies] = useState("");
  const [search, setSearch] = useState("");

  const handleStatusChange = (newStatus) => {
    updateStatus(newStatus);
    filterResults(newStatus, species, gender);
  };

  const handleSpeciesChange = (newSpecies) => {
    updateSpecies(newSpecies);
    filterResults(status, newSpecies, gender);
  };

  const handleGenderChange = (newGender) => {
    updateGender(newGender);
    filterResults(status, species, newGender);
  };

  const filterResults = (status, species, gender) => {
    const filtered = placeholderData.results.filter(result => 
      (!status || result.status === status) &&
      (!species || result.species === species) &&
      (!gender || result.gender === gender)
    );
    setFilteredResults(filtered);
    updatePageNumber(1);
  };

  return (
    <div className="App">
      <h1 className="text-center mb-3"></h1>
      <Search setSearch={setSearch} updatePageNumber={updatePageNumber} />
      <div className="container">
        <div className="row">
          <Filter
            pageNumber={pageNumber}
            status={status}
            species={species}
            gender={gender}
            updateStatus={handleStatusChange}
            updateGender={handleGenderChange}
            updateSpecies={handleSpeciesChange}
            updatePageNumber={updatePageNumber}
          />
          <div className="col-lg-8 col-12">
            <div className="row">
              <Card page="/" results={filteredResults} />
            </div>
          </div>
        </div>
      </div>
      <Pagination
        info={placeholderData.info}
        pageNumber={pageNumber}
        updatePageNumber={updatePageNumber}
      />
    </div>
  );
}

export default Home;
