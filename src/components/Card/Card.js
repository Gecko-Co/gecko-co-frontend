import React, { useState } from "react";
import GeckoDetails from "./GeckoDetails";
import "./Card.scss";

const Card = ({ results, addToCart }) => {
  const [selectedGecko, setSelectedGecko] = useState(null);

  const handleShowDetails = (gecko) => {
    setSelectedGecko(gecko);
  };

  const handleCloseDetails = () => {
    setSelectedGecko(null);
  };

  const handleAddToCart = async (gecko) => {
    if (!gecko || typeof gecko.id !== 'string' || gecko.id.trim() === '') {
      console.error("Invalid gecko:", gecko);
      return;
    }
    await addToCart(gecko);
    setSelectedGecko(null);
  };

  const getImageUrl = (imagePath) => {
    const baseUrl = "https://www.geckoco.ph/";
    return imagePath ? `${baseUrl}${imagePath}` : '/placeholder.svg';
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
        const { id, images, species, price, status, gender, name } = gecko;
        const priceInPHP = price ? `₱${parseFloat(price).toLocaleString('en-US')}` : "Price not available";
        const imageUrl = getImageUrl(images);

        return (
          <div key={id} className="card">
            <div className="card-image-container">
              <img src={imageUrl} alt={species} className="card-image" />
              <div className="card-quick-info">
                <span className="card-gender">{gender}</span>
                <span className="card-name">{name}</span>
              </div>
            </div>
            <div className="card-content">
              <div className="card-info">
                <h3 className="card-title">{species}</h3>
                <p className="card-price">{priceInPHP}</p>
              </div>
              <div className="card-actions">
                <button className="btn btn-primary" onClick={() => handleShowDetails(gecko)}>View Details</button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleAddToCart(gecko)}
                  disabled={status.toLowerCase() !== 'available'}
                >
                  {status.toLowerCase() === 'available' ? 'Add to Cart' : 'Not Available'}
                </button>
              </div>
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