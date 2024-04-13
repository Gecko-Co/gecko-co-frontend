import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.scss';

const Navbar = () => {
 const location = useLocation();
 const [isOpen, setIsOpen] = useState(false); // State to toggle the hamburger menu

 const toggleMenu = () => {
    setIsOpen(!isOpen);
 };

 return (
    <nav className="navbar">
      <Link to="/" className="logo-link">
        <img src="/images/geckoco-png.png" alt="Geckoco Logo" className="logo" />
        <span className="company-name">Gecko Co.</span>
      </Link>
      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        <NavLink to="/" text="Shop" />
        <NavLink to="#" text="MORPHpedia" />
        <NavLink to="#" text="PH Husbandry" />
        <NavLink to="#" text="Genetic Calculator" />
      </div>
      <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
 );
};

const NavLink = ({ to, text }) => {
 const location = useLocation();

 return (
    <Link 
      to={to} 
      className={`nav-link ${location.pathname === to ? 'active' : ''}`}
    >
      {text}
    </Link>
 );
};

export default Navbar;
