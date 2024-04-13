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
    let filtered = placeholderData.results;

    if (status) {
      filtered = filtered.filter(result => result.status === status);
    }

    if (species) {
      filtered = filtered.filter(result => result.species === species);
    }

    if (gender) {
      filtered = filtered.filter(result => result.gender === gender);
    }

    setFilteredResults(filtered);
    updatePageNumber(1);
 };

 const clearFilters = () => {
    setFilteredResults(placeholderData.results);
    updatePageNumber(1);
    updateStatus("");
    updateSpecies("");
    updateGender("");
 };

 return (
    <div className="App">
      <h1 className="text-center mb-3"></h1>

      <div className="container">
        <div className="row">
          <Filter
            pageNumber={pageNumber}
            updatePageNumber={updatePageNumber}
            updateStatus={handleStatusChange}
            updateGender={handleGenderChange}
            updateSpecies={handleSpeciesChange}
            clearFilters={clearFilters} // Pass clearFilters as a prop
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
