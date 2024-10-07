import React, { useEffect, useRef, useState } from 'react';
import './GeckoDetails.scss';
import { useCart } from '../Cart/CartContext';

const GeckoDetails = ({ gecko, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');
  const modalRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.body.style.overflow = 'visible';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !gecko) return null;

  const { images, breeder, species, gender, price, status, age, weight, description } = gecko;

  const genderIcon = gender === "Male" ? "♂️" : gender === "Female" ? "♀️" : "❓";
  const priceInPHP = price ? `₱${parseFloat(price).toLocaleString('en-US')}` : "Price not available";

  const handleAddToCart = () => {
    addToCart(gecko);
    onClose(); // Close the modal after adding to cart
  };

  return (
    <div className={`gecko-details-overlay ${isOpen ? 'open' : ''}`}>
      <div ref={modalRef} className="gecko-details-modal">
        <button onClick={onClose} className="close-button" aria-label="Close details">
          &times;
        </button>
        <div className="gecko-details-content">
          <div className="gecko-details-image-container">
            <img src={images} alt={species} className="gecko-details-image" />
            <div className="gecko-details-image-overlay">
              <h2>{species}</h2>
              <span className={`gecko-details-status ${status.toLowerCase()}`}>{status}</span>
            </div>
          </div>
          <div className="gecko-details-info">
            <div className="gecko-details-tabs">
              <button 
                className={activeTab === 'details' ? 'active' : ''} 
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button 
                className={activeTab === 'description' ? 'active' : ''} 
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
            </div>
            {activeTab === 'details' && (
              <div className="gecko-details-tab-content">
                <div className="gecko-details-item">
                  <span className="gecko-details-label">Breeder:</span>
                  <span className="gecko-details-value">{breeder}</span>
                </div>
                <div className="gecko-details-item">
                  <span className="gecko-details-label">Gender:</span>
                  <span className="gecko-details-value">{gender} {genderIcon}</span>
                </div>
                <div className="gecko-details-item">
                  <span className="gecko-details-label">Price:</span>
                  <span className="gecko-details-value">{priceInPHP}</span>
                </div>
                {age && (
                  <div className="gecko-details-item">
                    <span className="gecko-details-label">Age:</span>
                    <span className="gecko-details-value">{age}</span>
                  </div>
                )}
                {weight && (
                  <div className="gecko-details-item">
                    <span className="gecko-details-label">Weight:</span>
                    <span className="gecko-details-value">{weight}</span>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'description' && (
              <div className="gecko-details-tab-content">
                <p>{description || "No description available for this gecko."}</p>
              </div>
            )}
          </div>
        </div>
        <div className="gecko-details-actions">
          <button className="gecko-details-action-button primary">Contact Breeder</button>
          <button className="gecko-details-action-button secondary" onClick={handleAddToCart}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default GeckoDetails;