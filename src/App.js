import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './components/Cart/CartContext';
import { Toaster } from 'react-hot-toast';
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
import FacebookMessenger from './components/Messenger/FacebookMessenger';
import PolicyPage from './components/Policy/Policy';
import { inject } from '@vercel/analytics';

inject();

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="App">
          <Flag />
          <Navbar />
          <Scroll />
          <FacebookMessenger 
        pageId="115629306499727"
      />
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:species" element={<GeckoSpecies />} />
          <Route path="/genetic-calculator" element={<GeneticCalculator />} />
          <Route path="/policies" element={<PolicyPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
        <Footer />
        <AdSenseScript />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </CartProvider>
    </Router>
  );
}

export default App;