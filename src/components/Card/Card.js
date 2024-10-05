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

  const handleTouchStart = (index) => {
    setTouchedCard(index);
  };

  const handleTouchEnd = () => {
    setTouchedCard(null);
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
      {results.map((gecko, index) => {
        const { images, species = "Unknown Species", price, status } = gecko;

        const priceInPHP = price ? `₱${parseFloat(price).toLocaleString('en-US')}` : "Price not available";

        return (
          <div 
            key={index} 
            className={`card ${touchedCard === index ? 'touched' : ''}`}
            onTouchStart={() => handleTouchStart(index)}
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
      <GeckoDetails
        gecko={selectedGecko}
        isOpen={!!selectedGecko}
        onClose={handleCloseDetails}
        addToCart={addToCart}
      />
    </div>
  );
};

export default Card;