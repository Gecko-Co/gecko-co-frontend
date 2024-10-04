import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.scss';

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setIsScrolled(currentScrollPos > 50);
      setPrevScrollPos(currentScrollPos);
    };

    if (!isOpen) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, prevScrollPos]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : 'unscrolled'} ${isOpen ? 'open' : ''}`}>
      <Link to="/" className="logo-link">
        <img src="/images/geckoco-png.png" alt="Geckoco Logo" className="logo" />
        <span className="company-name">Gecko Co.</span>
      </Link>
      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        <NavLink to="/" text="Home" toggleMenu={toggleMenu} />
        <NavLink to="/shop" text="Shop" toggleMenu={toggleMenu} />
        <NavLink to="/learn" text="Learn" toggleMenu={toggleMenu} />
        <NavLink to="/genetic-calculator" text="Genetic Calculator" toggleMenu={toggleMenu} />
        <NavLink to="/contact" text="Contact Us" toggleMenu={toggleMenu} />
      </div>
      <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
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
    return text === "Add name of the navlink to show maintenance" ;
  };

  const handleClick = () => {
    toggleMenu(); 
  };

  return (
    <div className="nav-link-container">
      <Link
        to={to}
        className={`nav-link ${location.pathname === to ? 'active' : ''}`}
        onClick={handleClick}
      >
        {text}
      </Link>
      {shouldShowBadge(text) && (
        <span className="maintenance-icon" aria-label="Under maintenance">&#x1F6A7;</span>
      )}
    </div>
  );
};

export default Navbar;