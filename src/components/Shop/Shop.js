import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../Cart/CartContext';
import Card from "../Card/Card";
import Pagination from "../Pagination/Pagination";
import Filter from "../Filter/Filter";
import { Helmet } from 'react-helmet';
import './Shop.scss';

function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const [geckos, setGeckos] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [species, setSpecies] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

  const updateFiltersFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    setStatus(params.get('status') || "");
    setSpecies(params.get('species') || "");
    setGender(params.get('gender') || "");
    setPageNumber(parseInt(params.get('page') || "1", 10));
    setSortOrder(params.get('sort') || "asc");
  }, [location.search]);

  const updateUrl = useCallback((newParams) => {
    const params = new URLSearchParams(location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [location.pathname, navigate]);

  const fetchGeckos = useCallback(async () => {
    setLoading(true);
    try {
      const geckosCollection = collection(db, 'geckos');
      const geckosQuery = query(geckosCollection, orderBy("price", sortOrder));
      const querySnapshot = await getDocs(geckosQuery);
      const geckosData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setGeckos(geckosData);
    } catch (error) {
      console.error("Error fetching geckos:", error);
    } finally {
      setLoading(false);
    }
  }, [sortOrder]);

  useEffect(() => {
    updateFiltersFromUrl();
  }, [updateFiltersFromUrl]);

  useEffect(() => {
    fetchGeckos();
  }, [fetchGeckos]);

  useEffect(() => {
    filterAndSortResults();
  }, [geckos, status, species, gender, sortOrder]);

  const handleAddToCart = useCallback(async (gecko) => {
    if (!gecko || typeof gecko.id !== 'string' || gecko.id.trim() === '') {
      console.error("Invalid gecko:", gecko);
      return;
    }
    const success = await addToCart(gecko);
    if (success) {
      setGeckos((prevGeckos) =>
        prevGeckos.map((g) =>
          g.id === gecko.id ? { ...g, status: 'Reserved' } : g
        )
      );
    }
  }, [addToCart]);

  const filterAndSortResults = useCallback(() => {
    let results = [...geckos];

    if (status) {
      results = results.filter(gecko => gecko.status.toLowerCase() === status.toLowerCase());
    }
    if (species) {
      results = results.filter(gecko => gecko.species.toLowerCase() === species.toLowerCase());
    }
    if (gender) {
      results = results.filter(gecko => gecko.gender.toLowerCase() === gender.toLowerCase());
    }

    results.sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });

    setFilteredResults(results);
    setNoResults(results.length === 0);
  }, [geckos, status, species, gender, sortOrder]);

  const clearFilters = useCallback(() => {
    setStatus("");
    setSpecies("");
    setGender("");
    setPageNumber(1);
    updateUrl({ status: "", species: "", gender: "", page: "1" });
  }, [updateUrl]);

  const handleSortChange = useCallback((newSortOrder) => {
    setSortOrder(newSortOrder);
    updateUrl({ 
      sort: newSortOrder, 
      status, 
      species, 
      gender, 
      page: pageNumber.toString() 
    });
  }, [updateUrl, status, species, gender, pageNumber]);

  const handleFilterChange = useCallback((filterType, value) => {
    const newFilters = { status, species, gender, sort: sortOrder, page: '1' };
    newFilters[filterType] = value;
    setPageNumber(1);
    updateUrl(newFilters);

    switch (filterType) {
      case 'status':
        setStatus(value);
        break;
      case 'species':
        setSpecies(value);
        break;
      case 'gender':
        setGender(value);
        break;
      default:
        break;
    }
  }, [status, species, gender, sortOrder, updateUrl]);

  const paginatedResults = filteredResults.slice(
    (pageNumber - 1) * itemsPerPage,
    pageNumber * itemsPerPage
  );

  return (
    <>
      <Helmet>
        <title>Buy Geckos | Gecko Co.</title>
        <meta name="description" content="Browse our selection of high-quality, ethically bred geckos including Leopard Geckos, Crested Geckos, and more. Find your perfect pet today!" />
        <link rel="canonical" href="https://geckoco.ph/shop" />
      </Helmet>
      <div className="shop-container">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-4 col-12">
              <Filter
                status={status}
                species={species}
                gender={gender}
                updateStatus={(newStatus) => handleFilterChange('status', newStatus)}
                updateSpecies={(newSpecies) => handleFilterChange('species', newSpecies)}
                updateGender={(newGender) => handleFilterChange('gender', newGender)}
                clearFilters={clearFilters}
              />
            </div>
            <div className="col-lg-9 col-md-8 col-12">
              <div className="shop-header">
                <h1 className="shop-title">Geckos for sale</h1>
                <div className="sort-container">
                  <span className="sort-label">Sort by Price:</span>
                  <div className="btn-group" role="group" aria-label="Sort order">
                    <button 
                      onClick={() => handleSortChange("asc")} 
                      className={`btn ${sortOrder === 'asc' ? 'btn-primary' : 'btn-outline-primary'}`}
                    >
                      Low to High
                    </button>
                    <button 
                      onClick={() => handleSortChange("desc")} 
                      className={`btn ${sortOrder === 'desc' ? 'btn-primary' : 'btn-outline-primary'}`}
                    >
                      High to Low
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading geckos...</p>
                </div>
              ) : noResults ? (
                <div className="no-results-container">
                  <p className="no-results">No Geckos Found 😢</p>
                  <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
                </div>
              ) : (
                <div className="shop-content">
                  <Card results={paginatedResults} addToCart={handleAddToCart} />
                  <Pagination
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredResults.length}
                    currentPage={pageNumber}
                    onPageChange={(newPage) => { 
                      setPageNumber(newPage); 
                      updateUrl({ 
                        page: newPage.toString(),
                        status,
                        species,
                        gender,
                        sort: sortOrder
                      }); 
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Shop;