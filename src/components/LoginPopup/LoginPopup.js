import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaTimes } from 'react-icons/fa';
import './LoginPopup.scss';

const LoginPopup = ({ onClose }) => {
  return (
    <div className="login-popup-overlay">
      <div className="login-popup">
        <button onClick={onClose} className="close-button">
          <FaTimes />
        </button>
        <h2>Welcome to Gecko Co.</h2>
        <p>Please sign in to access your account or continue as a guest.</p>
        <div className="login-options">
          <Link to="/signin" className="signin-button">
            <FaSignInAlt />
            Sign In
          </Link>
          <button onClick={onClose} className="guest-button">
            <FaUserPlus />
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;