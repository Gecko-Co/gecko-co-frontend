import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
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
 const [noResults, setNoResults] = useState(false); // State to track no results
 const [sortOrder, setSortOrder] = useState("asc"); // default ascending order

 useEffect(() => {
    filterResults(status, species, gender);
 }, [status, species, gender, sortOrder]);

 const handleStatusChange = (newStatus) => {
    updateStatus(newStatus);
 };

 const handleSpeciesChange = (newSpecies) => {
    updateSpecies(newSpecies);
 };

 const handleGenderChange = (newGender) => {
    updateGender(newGender);
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

    if (filtered.length === 0) {
      setNoResults(true);
    } else {
      setNoResults(false);
    }

    // Apply sorting
    const sortedResults = [...filtered].sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);

      if (sortOrder === "asc") {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });

    setFilteredResults(sortedResults);
    updatePageNumber(1);
 };

 const clearFilters = () => {
    setFilteredResults(placeholderData.results);
    updatePageNumber(1);
    updateStatus("");
    updateSpecies("");
    updateGender("");
    setNoResults(false); // Reset no results state
 };

 const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
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
            <div className="row mb-3">
              <div className="col">
                <span style={{ color: '#23283b' }}>Sort by Price:</span>
                <button onClick={toggleSortOrder} className={`btn btn-link ${sortOrder === 'asc' ? 'active' : ''}`} style={{ color: '#23283b' }}>
                 <i className="fas fa-arrow-up"></i>
                </button>
                <button onClick={toggleSortOrder} className={`btn btn-link ${sortOrder === 'desc' ? 'active' : ''}`} style={{ color: '#23283b' }}>
                 <i className="fas fa-arrow-down"></i>
                </button>
              </div>
            </div>

            {noResults ? (
              <div className="text-center mt-5">
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>No Geckos Found 😢</p>
              </div>
            ) : (
              <Card page="/" results={filteredResults} />
            )}
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
