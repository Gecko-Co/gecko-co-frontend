import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap";
import React, { useState } from "react";

import Search from "./components/Search/Search";
import Card from "./components/Card/Card";
import Pagination from "./components/Pagination/Pagination";
import Filter from "./components/Filter/Filter";
import Navbar from "./components/Navbar/Navbar";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Episodes from "./Pages/Episodes";
import Location from "./Pages/Location";
import CardDetails from "./components/Card/CardDetails";

const placeholderData = {
  info: {
    count: 5,
    pages: 1,
  },
  results: [
    {
      id: 1,
      name: "KT1",
      status: "Sold",
      species: "Knob-tailed Gecko",
      gender: "Male",
      images: "images/kt1.jpg",
    },
    {
      id: 2,
      name: "LG1",
      status: "Reserved",
      species: "Leopard Gecko",
      gender: "Male",
      images: "images/lg1.jpg",
      price: "$1000"
    },
    {
      id: 3,
      name: "AFT1",
      status: "Available",
      species: "African Fat-Tailed Gecko",
      gender: "Male",
      images: "images/aft1.jpg",
      price: "$1000"
    },
    {
      id: 4,
      name: "C1",
      status: "Available",
      species: "Crested Gecko",
      gender: "Male",
      images: "images/c1.jpg",
      price: "$1000"
    },
    {
      id: 5,
      name: "LG2",
      status: "Reserved",
      species: "Leopard Gecko",
      gender: "Male",
      images: "images/lg2.jpg",
      price: "$1000"
    },
  ],
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:id" element={<CardDetails />} />

        <Route path="/episodes" element={<Episodes />} />
        <Route path="/episodes/:id" element={<CardDetails />} />

        <Route path="/location" element={<Location />} />
        <Route path="/location/:id" element={<CardDetails />} />
      </Routes>
    </Router>
  );
}

const Home = () => {
  let [pageNumber, updatePageNumber] = useState(1);
  let [status, updateStatus] = useState("");
  let [gender, updateGender] = useState("");
  let [species, updateSpecies] = useState("");
  let [search, setSearch] = useState("");

  // Use static data instead of fetched data
  let fetchedData = placeholderData; // Use the static data here
  let { info, results } = fetchedData;

  return (
    <div className="App">
      <h1 className="text-center mb-3"></h1>
      <Search setSearch={setSearch} updatePageNumber={updatePageNumber} />
      <div className="container">
        <div className="row">
          <Filter
            pageNumber={pageNumber}
            status={status}
            updateStatus={updateStatus}
            updateGender={updateGender}
            updateSpecies={updateSpecies}
            updatePageNumber={updatePageNumber}
          />
          <div className="col-lg-8 col-12">
            <div className="row">
              <Card page="/" results={results} />
            </div>
          </div>
        </div>
      </div>
      <Pagination
        info={info}
        pageNumber={pageNumber}
        updatePageNumber={updatePageNumber}
      />
    </div>
  );
};

export default App;
