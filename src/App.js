import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Shop from './components/Shop/Shop';
import Flag from './components/Flag/Flag';
import Footer from './components/Footer/Footer';
import AdSenseScript from './components/Adsense/Adsense';
import { inject } from '@vercel/analytics';

inject();

function App() {
  return (
    <Router>
      <div className="App">
        <Flag />
        <Navbar />
      
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
      <Footer />
      <AdSenseScript />
    </Router>
    
  );
}

export default App;