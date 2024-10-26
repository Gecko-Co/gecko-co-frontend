import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Flag from '../Flag/Flag';

export default function PageWrapper({ children }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className={`page-wrapper ${!isHomePage ? 'with-background-effect' : ''}`}>
      <Flag />
      <Navbar />
      <div className="main-content">
        {children}
      </div>
      <Footer />
    </div>
  );
}