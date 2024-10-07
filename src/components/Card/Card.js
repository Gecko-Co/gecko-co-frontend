// src/components/Card/Card.js
import React, { useState } from "react";
import GeckoDetails from "./GeckoDetails";
import "./Card.scss";

const Card = ({ results, addToCart }) => {
  const [selectedGecko, setSelectedGecko] = useState(null);
  const [touchedCard, setTouchedCard] = useState(null);

  const handleShowDetails = (gecko) => {
    setSelectedGecko(gecko);
  };

  const handleCloseDetails = () => {
    setSelectedGecko(null);
  };

  const handleTouchStart = (id) => {
    setTouchedCard(id);
  };

  const handleTouchEnd = () => {
    setTouchedCard(null);
  };

  const handleAddToCart = async (gecko) => {
    if (!gecko || typeof gecko.id !== 'string' || gecko.id.trim() === '') {
      console.error("Invalid gecko:", gecko);
      return;
    }
    await addToCart(gecko);
    setSelectedGecko(null); // Close the modal after attempting to add to cart
  };

  if (!results || results.length === 0) {
    return (
      <div className="no-results">
        <p>No Geckos Found 😢</p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {results.map((gecko) => {
        const { id, images, species = "Unknown Species", price, status } = gecko;

        const priceInPHP = price ? `₱${parseFloat(price).toLocaleString('en-US')}` : "Price not available";

        return (
          <div 
            key={id} 
            className={`card ${touchedCard === id ? 'touched' : ''}`}
            onTouchStart={() => handleTouchStart(id)}
            onTouchEnd={handleTouchEnd}
          >
            <div className="card-image-container">
              <img src={images} alt={species} className="card-image" />
              <div
                className="card-overlay"
                onClick={() => handleShowDetails(gecko)}
              >
                View Details
              </div>
            </div>
            <div className="card-content">
              <h3 className="card-title">{species}</h3>
              <p className="card-price">{priceInPHP}</p>
            </div>
            <div className={`card-status ${status.toLowerCase()}`}>
              {status}
            </div>
          </div>
        );
      })}
      {selectedGecko && (
        <GeckoDetails
          gecko={selectedGecko}
          isOpen={!!selectedGecko}
          onClose={handleCloseDetails}
          addToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default Card;