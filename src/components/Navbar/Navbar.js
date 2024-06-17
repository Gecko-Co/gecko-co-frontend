import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.scss';

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // State to manage mobile menu

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
      // Apply scroll animation only if the mobile menu is closed
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, prevScrollPos]);

  // Close menu on route change
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
        <NavLink to="/contact" text="Contact Us" toggleMenu={toggleMenu} />
      </div>
      <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
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
    return text === "Home" || text === "Learn" || text === "Contact Us";
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
