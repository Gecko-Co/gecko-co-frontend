// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
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
import Scroll from './components/Scroll/Scroll';
import Messenger from './components/Messenger/Messenger';
import PolicyPage from './components/Policy/Policy';
import SignIn from './components/Auth/SignIn';
import Account from './components/Account/Account';
import { inject } from '@vercel/analytics';
import SignUp from './components/Auth/SignUp';
import Settings from './components/Account/Settings';

inject();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <CartProvider>
        <div className="App">
          <Flag />
          <Navbar user={user} />
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
              <Route path="/signin" element={user ? <Navigate to="/account" /> : <SignIn />} />
              <Route path="/account" element={<Account user={user} />} />
              <Route path="/settings" element={<Settings user={user} />} />
              <Route path="/signup" element={<SignUp />} />
              
            </Routes>
          </div>
          <Scroll />
          {/* <Messenger/> */}
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
          }}
          containerStyle={{
            bottom: 20,
            left: 20,
            zIndex: 9999999,
          }}
        />
      </CartProvider>
    </Router>
  );
}

export default App;