import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { getGeckoDetailUrl } from '../../utils/urlHelpers';
import "./Card.scss";

const Card = ({ results, addToCart }) => {
  const [hoveredGecko, setHoveredGecko] = useState(null);

  const handleAddToCart = async (gecko) => {
    if (!gecko || typeof gecko.id !== 'string' || gecko.id.trim() === '') {
      console.error("Invalid gecko:", gecko);
      return;
    }
    await addToCart(gecko);
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
        const { id, images, title, price, status, gender, name } = gecko;
        const priceInPHP = price ? `₱${parseFloat(price).toLocaleString('en-US')}` : "Price not available";
        const imageUrl = getImageUrl(images);

        return (
          <div 
            key={id} 
            className="card"
            onMouseEnter={() => setHoveredGecko(id)}
            onMouseLeave={() => setHoveredGecko(null)}
          >
            <div className="card-image-container">
              <img src={imageUrl} alt={title} className="card-image" />
              <div className="card-quick-info">
                <span className="card-gender">{gender}</span>
                <span className="card-name">{name}</span>
              </div>
            </div>
            <div className="card-content">
              <div className="card-info">
                <h3 className="card-title">
                  <span className="card-title-text">{title}</span>
                </h3>
                <p className="card-price">{priceInPHP}</p>
              </div>
              <div className="card-actions">
                <Link to={getGeckoDetailUrl(name)} className="btn btn-primary">View Details</Link>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleAddToCart(gecko)}
                  disabled={status.toLowerCase() !== 'available'}
                >
                  {hoveredGecko === id ? (
                    <FontAwesomeIcon icon={faShoppingCart} />
                  ) : (
                    status.toLowerCase() === 'available' ? 'Add to Cart' : 'Not Available'
                  )}
                </button>
              </div>
            </div>
            <div className={`card-status ${status.toLowerCase()}`}>
              {status}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Card;