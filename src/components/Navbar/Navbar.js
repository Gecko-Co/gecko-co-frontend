import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.scss';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && isOpen) {
        toggleMenu();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  return (
    <nav className="navbar">
      <Link to="/" className="logo-link">
        <img src="/images/geckoco-png.png" alt="Geckoco Logo" className="logo" />
        <span className="company-name">Gecko Co.</span>
      </Link>
      <div className={`nav-links ${isOpen? 'open' : ''}`}>
        <NavLink to="/" text="Home" toggleMenu={toggleMenu} />
        <NavLink to="/shop" text="Shop" toggleMenu={toggleMenu} />
        <NavLink to="#" text="Geckopedia" toggleMenu={toggleMenu} />
        <NavLink to="#" text="Genetic Calculator" toggleMenu={toggleMenu} />
      </div>
      <button className={`hamburger ${isOpen? 'open' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
};

const NavLink = ({ to, text, toggleMenu }) => {
  const location = useLocation();

  const shouldShowBadge = (text) => {
    return text === "Home" || text === "Genetic Calculator" || text === "Geckopedia";
  };

  const handleClick = () => {
    toggleMenu();
  };

  return (
    <div className="nav-link-container">
      <Link
        to={to}
        className={`nav-link ${location.pathname === to? 'active' : ''}`}
        onClick={handleClick}
      >
        {text}
      </Link>
      {shouldShowBadge(text) && (
        <span className="maintenance-icon">&#x1F6A7;</span>
      )}
    </div>
  );
};

export default Navbar;
