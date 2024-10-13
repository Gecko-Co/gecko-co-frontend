import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faGift } from '@fortawesome/free-solid-svg-icons';
import './EventPopup.scss';

export default function EventPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="event-popup-overlay">
      <div className="event-popup">
        <button className="close-button" onClick={closePopup}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="popup-content">
          <FontAwesomeIcon icon={faGift} className="gift-icon" />
          <h2>Christmas Event!</h2>
          <p>Join our exciting Rolling Icon game and win a beautiful Sunglow gecko!</p>
          <Link to="/blogs/rolling-icon-christmas-event" className="event-link">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}