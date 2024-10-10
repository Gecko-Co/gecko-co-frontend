import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVenusMars, faWeightHanging, faClock, faDollarSign, faUser, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../Cart/CartContext';
import customToast from '../../utils/toast';
import './GeckoDetails.scss';

const GeckoDetails = () => {
  const [gecko, setGecko] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGecko = async () => {
      try {
        const geckoDoc = await getDoc(doc(db, 'geckos', id));
        if (geckoDoc.exists()) {
          setGecko({ id: geckoDoc.id, ...geckoDoc.data() });
        } else {
          console.log('No such gecko!');
        }
      } catch (error) {
        console.error('Error fetching gecko:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGecko();
  }, [id]);

  const getImageUrl = (imagePath) => {
    const baseUrl = "https://www.geckoco.ph/";
    return imagePath ? `${baseUrl}${imagePath}` : '/placeholder.svg';
  };

  const handleAddToCart = async () => {
    if (!gecko || typeof gecko.id !== 'string' || gecko.id.trim() === '') {
      console.error("Invalid gecko:", gecko);
      return;
    }
    await addToCart(gecko);
    customToast.success('Gecko added to cart!');
  };

  const handleContactBreeder = () => {
    // Implement contact breeder functionality
    customToast.info('Contact breeder functionality not implemented yet.');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!gecko) {
    return <div className="error">Gecko not found</div>;
  }

  return (
    <div className="gecko-details-page">
      <div className="gecko-details-container">
        <div className="gecko-image-container">
          <img src={getImageUrl(gecko.images)} alt={gecko.title} className="gecko-image" />
          <div className={`gecko-status ${gecko.status.toLowerCase()}`}>{gecko.status}</div>
        </div>
        <div className="gecko-info-container">
          <h1>{gecko.title}</h1>
          <div className="gecko-info">
            <div className="info-item">
              <FontAwesomeIcon icon={faVenusMars} />
              <span><strong>Gender:</strong> {gecko.gender}</span>
            </div>
            <div className="info-item">
              <FontAwesomeIcon icon={faUser} />
              <span><strong>Breeder:</strong> {gecko.breeder}</span>
            </div>
            <div className="info-item">
              <FontAwesomeIcon icon={faDollarSign} />
              <span><strong>Price:</strong> ₱{parseFloat(gecko.price).toLocaleString('en-US')}</span>
            </div>
            {gecko.age && (
              <div className="info-item">
                <FontAwesomeIcon icon={faClock} />
                <span><strong>Age:</strong> {gecko.age}</span>
              </div>
            )}
            {gecko.weight && (
              <div className="info-item">
                <FontAwesomeIcon icon={faWeightHanging} />
                <span><strong>Weight:</strong> {gecko.weight}</span>
              </div>
            )}
          </div>
          <div className="gecko-description">
            <h2><FontAwesomeIcon icon={faInfoCircle} /> Description</h2>
            <p>{gecko.description || "No description available for this gecko."}</p>
          </div>
          <div className="gecko-actions">
            <button className="action-button primary" onClick={handleContactBreeder}>Contact Breeder</button>
            <button 
              className="action-button secondary" 
              onClick={handleAddToCart}
              disabled={gecko.status.toLowerCase() !== 'available'}
            >
              {gecko.status.toLowerCase() === 'available' ? 'Add to Cart' : 'Not Available'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeckoDetails;