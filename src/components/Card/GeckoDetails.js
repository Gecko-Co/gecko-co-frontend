import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVenusMars, faWeightHanging, faClock, faDollarSign, faUser, faInfoCircle, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../Cart/CartContext';
import { useAuth } from '../Auth/AuthContext';
import customToast from '../../utils/toast';
import './GeckoDetails.scss';

const GeckoDetails = () => {
  const [gecko, setGecko] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchGecko = async () => {
      try {
        let geckoDoc;
        // First, try to fetch the gecko using the id
        const geckoRef = doc(db, 'geckos', id);
        let geckoSnap = await getDoc(geckoRef);

        if (geckoSnap.exists()) {
          geckoDoc = geckoSnap;
        } else {
          // If not found by id, try to fetch using the 'name' field
          const geckosCollection = collection(db, 'geckos');
          const q = query(geckosCollection, where('name', '==', id));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            geckoDoc = querySnapshot.docs[0];
          } else {
            console.log('No such gecko!');
            setGecko(null);
            return;
          }
        }

        const geckoData = { id: geckoDoc.id, ...geckoDoc.data() };
        console.log('Fetched gecko:', geckoData);
        setGecko(geckoData);
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
    if (!currentUser) {
      customToast.error('Please log in to add items to your cart');
      return;
    }

    if (!gecko) {
      console.error("Invalid gecko:", gecko);
      customToast.error('Failed to add gecko to cart. Please try again.');
      return;
    }

    try {
      console.log("Adding gecko to cart:", gecko);
      const success = await addToCart(gecko);
      if (success) {
        customToast.success('Gecko added to cart successfully!');
      }
      // The error cases are now handled in the CartContext
    } catch (error) {
      console.error("Error adding gecko to cart:", error);
      customToast.error('Failed to add gecko to cart. Please try again.');
    }
  };

  const handleContactBreeder = () => {
    customToast.warning('Contact breeder functionality is currently under maintenance. Please try again later.');
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
              disabled={!currentUser || gecko.status.toLowerCase() !== 'available'}
            >
              {!currentUser ? 'Log in to Add to Cart' : 
                (gecko.status.toLowerCase() === 'available' ? (
                  <>
                    <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                  </>
                ) : 'Not Available')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeckoDetails;