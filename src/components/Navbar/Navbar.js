import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.scss';
import { FaUserCircle, FaUserPlus, FaShoppingCart, FaChevronDown } from 'react-icons/fa';
import { useCart } from '../Cart/CartContext';
import { useAuth } from '../Auth/AuthContext';
import LoginPopup from '../Auth/LoginPopup';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const { cart } = useCart();
  const { currentUser } = useAuth();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setIsToolsDropdownOpen(false);
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
    setShowLoginPopup(false);
    setIsToolsDropdownOpen(false);
  }, [location]);

  const handleAccountClick = () => {
    if (currentUser) {
      navigate('/account');
    } else if (location.pathname !== '/signin') {
      setShowLoginPopup(true);
    } else {
      // Do nothing if already on the sign-in page
    }
  };

  const toggleToolsDropdown = () => {
    setIsToolsDropdownOpen(!isToolsDropdownOpen);
  };

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
        <NavLink to="/blogs" text="Blogs" toggleMenu={toggleMenu} />
        <div className={`nav-link-container tools-dropdown ${isToolsDropdownOpen ? 'open' : ''}`}>
          <button className="nav-link" onClick={toggleToolsDropdown}>
            Tools <FaChevronDown className={`dropdown-icon ${isToolsDropdownOpen ? 'open' : ''}`} />
          </button>
          <div className="tools-dropdown-menu">
            <NavLink to="/genetic-calculator" text="Calculator" toggleMenu={toggleMenu} />
            <NavLink to="/breeder-map" text="Breeder Map" toggleMenu={toggleMenu} />
          </div>
        </div>
        <NavLink to="/contact" text="Contact Us" toggleMenu={toggleMenu} />
      </div>
      <div className="menu-icons-container">
        <div className="nav-icons">
          <button onClick={handleAccountClick} className="nav-icon-link">
            {currentUser ? (
              <FaUserCircle className="icon" aria-label="Account" />
            ) : (
              <FaUserPlus className="icon" aria-label="Sign In" />
            )}
          </button>
          <Link to="/cart" className="nav-icon-link cart-icon">
            <FaShoppingCart className="icon" aria-label="Cart" />
            {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
          </Link>
        </div>
        <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      {showLoginPopup && <LoginPopup onClose={() => setShowLoginPopup(false)} />}
    </nav>
  );
};

const NavLink = ({ to, text, toggleMenu }) => {
  const location = useLocation();

  const shouldShowBadge = (text) => {
    return text === "Add name of the navlink to show maintenance";
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