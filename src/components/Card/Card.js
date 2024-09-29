import React, { useState } from "react";
import GeckoDetails from "./GeckoDetails";
import "./Card.scss";

const Card = ({ results }) => {
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
        const { images, breeder, species = "Unknown Species", gender, price, status } = gecko;

        let genderIcon;
        if (gender === "Male") {
          genderIcon = <i className="fas fa-mars gender-icon male"></i>;
        } else if (gender === "Female") {
          genderIcon = <i className="fas fa-venus gender-icon female"></i>;
        } else {
          genderIcon = <i className="fas fa-question-circle gender-icon unknown"></i>;
        }

        const priceInPHP = price ? `₱${parseFloat(price).toLocaleString('en-US')}` : "Price not available";

        return (
          <div 
            key={breeder} 
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
                Show more details
              </div>
            </div>
            <div className="card-content">
              <h3 className="card-title">{species}</h3>
              <div className="card-details">
                <p><strong>Gender:</strong> {gender} {genderIcon}</p>
                <p><strong>Price:</strong> {priceInPHP}</p>
                <p><strong>Breeder:</strong> {breeder}</p>
              </div>
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
      />
    </div>
  );
};

export default Card;