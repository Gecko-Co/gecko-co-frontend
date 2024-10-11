import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './components/Cart/CartContext';
import { AuthProvider } from './components/Auth/AuthContext';
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
import Scroll from './components/Scroll/Scroll';
import PolicyPage from './components/Policy/Policy';
import SignIn from './components/Auth/SignIn';
import Account from './components/Account/Account';
import { inject } from '@vercel/analytics';
import SignUp from './components/Auth/SignUp';
import Settings from './components/Account/Settings';
import GeckoDetailsPage from './components/Card/GeckoDetails';

inject();

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Flag />
            <Navbar />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/:species" element={<GeckoSpecies />} />
                <Route path="/genetic-calculator" element={<GeneticCalculator />} />
                <Route path="/policies" element={<PolicyPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/account" element={<Account />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/gecko/:id" element={<GeckoDetailsPage />} />
              </Routes>
            </div>
            <Scroll />
            <Footer />
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#bd692d',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                maxWidth: '350px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
              success: {
                icon: '✅',
              },
              error: {
                icon: '❌',
              },
              warning: {
                icon: '⚠️',
              },
              info: {
                icon: '🔔',
              },
            }}
            containerStyle={{
              bottom: 20,
              left: 20,
              zIndex: 9999999,
            }}
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;