import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faGift } from '@fortawesome/free-solid-svg-icons';
import './EventPopup.scss';

export default function EventPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenEventPopup');
    const dontShowAgain = localStorage.getItem('dontShowEventPopup');

    if (!hasSeenPopup && dontShowAgain !== 'true') {
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('hasSeenEventPopup', 'true');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsVisible(false);
  };

  const dontShowAgain = () => {
    localStorage.setItem('dontShowEventPopup', 'true');
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
          <h2>Early Christmas Event!</h2>
          <p>Join our Gecko Hunt game and win a beautiful Sunglow gecko! Reach 5000 points to be eligible!</p>
          <Link to="/blogs/gecko-hunt-christmas-event" className="event-link">
            Learn More
          </Link>
          <button onClick={dontShowAgain} className="dont-show-again">Don't show this again</button>
        </div>
      </div>
    </div>
  );
}