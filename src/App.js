import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap';
import './App.scss';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Shop from './components/Shop/Shop';
import Flag from './components/Flag/Flag';
import Footer from './components/Footer/Footer';
import Learn from './components/Learn/Learn';
import GeckoSpecies from './components/GeckoSpecies/GeckoSpecies';
import Cart from './components/Cart/Cart';
import Contact from './components/Contact/Contact';
import GeneticCalculator from './components/GeneticCalculator/GeneticCalculator';
import AdSenseScript from './components/Adsense/Adsense';
import Scroll from './components/Scroll/Scroll';
import Messenger from './components/Messenger/Messenger';
import PolicyPage from './components/Policy/Policy';
import { inject } from '@vercel/analytics';

inject();

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (item) => {
    setCartItems([...cartItems, item]);
  };

  const removeFromCart = (index) => {
    const newCartItems = [...cartItems];
    newCartItems.splice(index, 1);
    setCartItems(newCartItems);
  };

  return (
    <Router>
      <div className="App">
        <Flag />
        <Navbar cartItems={cartItems} setShowCart={setShowCart} />
        <Cart 
          isOpen={showCart} 
          onClose={() => setShowCart(false)} 
          cartItems={cartItems} 
          removeFromCart={removeFromCart}
        />
        <Scroll />
        <Messenger />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop addToCart={addToCart} />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:species" element={<GeckoSpecies />} />
        <Route path="/genetic-calculator" element={<GeneticCalculator />} />
        <Route path="/policies" element={<PolicyPage />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
      <AdSenseScript />
    </Router>
  );
}

export default App;