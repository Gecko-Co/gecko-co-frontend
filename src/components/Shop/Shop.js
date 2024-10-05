import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import Card from "../Card/Card";
import Pagination from "../Pagination/Pagination";
import Filter from "../Filter/Filter";
import placeholderData from "../../data";

function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filteredResults, setFilteredResults] = useState(placeholderData.results);
  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [species, setSpecies] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [cart, setCart] = useState([]);
  const itemsPerPage = 12;

  const updateFiltersFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    setStatus(params.get('status') || "");
    setGender(params.get('gender') || "");
    setSpecies(params.get('species') || "");
    setSortOrder(params.get('sort') || "asc");
    setPageNumber(parseInt(params.get('page') || "1", 10));
  }, [location.search]);

  useEffect(() => {
    updateFiltersFromUrl();
  }, [updateFiltersFromUrl]);

  const updateUrl = useCallback((newParams) => {
    const params = new URLSearchParams(location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    navigate(`?${params.toString()}`, { replace: true });
  }, [navigate, location.search]);

  const filterAndSortResults = useCallback(() => {
    let filtered = [...placeholderData.results];

    if (status) {
      filtered = filtered.filter(result => result.status.toLowerCase() === status.toLowerCase());
    }

    if (species) {
      filtered = filtered.filter(result => result.species.toLowerCase() === species.toLowerCase());
    }

    if (gender) {
      filtered = filtered.filter(result => {
        if (gender.toLowerCase() === 'unknown') {
          return result.gender.toLowerCase() === 'unknown' || result.gender === '';
        }
        return result.gender.toLowerCase() === gender.toLowerCase();
      });
    }

    filtered.sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });

    setFilteredResults(filtered);
    setNoResults(filtered.length === 0);
  }, [status, species, gender, sortOrder]);

  useEffect(() => {
    filterAndSortResults();
  }, [filterAndSortResults]);

  const clearFilters = useCallback(() => {
    setStatus("");
    setSpecies("");
    setGender("");
    setPageNumber(1);
    // Remove all filter parameters from the URL, but keep the sort order
    const params = new URLSearchParams(location.search);
    ['status', 'species', 'gender', 'page'].forEach(param => params.delete(param));
    navigate(`?${params.toString()}`, { replace: true });
  }, [navigate, location.search]);

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    // Update only the sort parameter in the URL
    const params = new URLSearchParams(location.search);
    params.set('sort', newSortOrder);
    navigate(`?${params.toString()}`, { replace: true });
  };

  const addToCart = (gecko) => {
    setCart(prevCart => [...prevCart, gecko]);
  };

  const paginatedResults = filteredResults.slice(
    (pageNumber - 1) * itemsPerPage,
    pageNumber * itemsPerPage
  );

  return (
    <div className="App" style={{ backgroundColor: 'white' }}>
      <div className="container" style={{ marginTop: '130px' }}>
        <div className="row">
          <Filter
            status={status}
            species={species}
            gender={gender}
            updateStatus={(newStatus) => { setStatus(newStatus); updateUrl({ status: newStatus }); }}
            updateSpecies={(newSpecies) => { setSpecies(newSpecies); updateUrl({ species: newSpecies }); }}
            updateGender={(newGender) => { setGender(newGender); updateUrl({ gender: newGender }); }}
            clearFilters={clearFilters}
          />
          <div className="col-lg-8 col-12">
            <div className="row mb-3" style={{ marginTop: '70px' }}>
              <div className="col-12 d-flex justify-content-end align-items-center">
                <span style={{ color: '#23283b', marginRight: '10px' }}>Sort by Price:</span>
                <div className="btn-group" role="group" aria-label="Sort order">
                  <button 
                    onClick={() => handleSortChange("asc")} 
                    className={`btn ${sortOrder === 'asc' ? 'btn-primary' : 'btn-outline-primary'}`}
                    style={{
                      backgroundColor: sortOrder === 'asc' ? '#23283b' : 'white',
                      color: sortOrder === 'asc' ? 'white' : '#23283b',
                      borderColor: '#23283b'
                    }}
                  >
                    Low to High
                  </button>
                  <button 
                    onClick={() => handleSortChange("desc")} 
                    className={`btn ${sortOrder === 'desc' ? 'btn-primary' : 'btn-outline-primary'}`}
                    style={{
                      backgroundColor: sortOrder === 'desc' ? '#23283b' : 'white',
                      color: sortOrder === 'desc' ? 'white' : '#23283b',
                      borderColor: '#23283b'
                    }}
                  >
                    High to Low
                  </button>
                </div>
              </div>
            </div>

            {noResults ? (
              <div className="text-center mt-5">
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>No Geckos Found 😢</p>
              </div>
            ) : (
              <Card results={paginatedResults} addToCart={addToCart} />
            )}
          </div>
        </div>
      </div>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={filteredResults.length}
        currentPage={pageNumber}
        onPageChange={(newPage) => { setPageNumber(newPage); updateUrl({ page: newPage.toString() }); }}
      />
    </div>
  );
}

export default Shop;