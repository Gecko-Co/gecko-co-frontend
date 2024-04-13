import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-12 text-center">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <div className="social-circle">
                <FontAwesomeIcon icon={faFacebook} size="2x" />
              </div>
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <div className="social-circle">
                <FontAwesomeIcon icon={faInstagram} size="2x" />
              </div>
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <div className="social-circle">
                <FontAwesomeIcon icon={faTwitter} size="2x" />
              </div>
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <div className="social-circle">
                <FontAwesomeIcon icon={faYoutube} size="2x" />
              </div>
            </a>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-12 text-center">
            <p>
              <a href="/" className="footer-link">Home</a>
              <span className="mx-2">|</span>
              <a href="/shop" className="footer-link">Shop</a>
              <span className="mx-2">|</span>
              <a href="/about" className="footer-link">About</a>
              <span className="mx-2">|</span>
              <a href="/contact" className="footer-link">Contact</a>
            </p>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-12 text-center">
            <p>© 2018-2024 Gecko Co.®</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
