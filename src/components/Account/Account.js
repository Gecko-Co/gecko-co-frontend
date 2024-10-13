import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import { useCart } from '../Cart/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faCog, faShoppingCart, faTrash, faCreditCard, faStar } from '@fortawesome/free-solid-svg-icons';
import customToast from '../../utils/toast';
import './Account.scss';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'; // Correct import path
import { getGeckoDetailUrl } from '../../utils/urlHelpers';

const Account = () => {
  const navigate = useNavigate();
  const { currentUser, loading, signOut } = useAuth();
  const { cart, removeFromCart, clearCart } = useCart();
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserPoints(userSnap.data().points || 0);
        }
      }
    };

    fetchUserPoints();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      customToast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      customToast.error('Failed to sign out. Please try again.');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2);
  };

  const handleCheckout = () => {
    customToast.warning('Checkout is currently under maintenance. Please try again later.');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="account-container">
      <div className="account-page">
        <h1>My Account</h1>
        <div className="account-info">
          <p><strong>Email:</strong> {currentUser.email}</p>
          {currentUser.displayName && <p><strong>Name:</strong> {currentUser.displayName}</p>}
          <p><strong>Points:</strong> <FontAwesomeIcon icon={faStar} className="points-icon" /> {userPoints}</p>
        </div>
        <div className="account-actions">
          <button onClick={() => navigate('/cart')}>
            <FontAwesomeIcon icon={faShoppingCart} /> View Cart
          </button>
          <button onClick={() => navigate('/settings')}>
            <FontAwesomeIcon icon={faCog} /> Account Settings
          </button>
          <button onClick={handleSignOut} className="sign-out-button">
            <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
          </button>
        </div>
        <div className="cart-preview">
          <h2>Cart Preview</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <Link to={getGeckoDetailUrl(item.name)} className="cart-item-link">
                      <img src={item.images} alt={item.title} className="cart-item-image" />
                      <div className="cart-item-details">
                        <h3>{item.title}</h3>
                        <p>₱{parseFloat(item.price).toLocaleString('en-US')}</p>
                      </div>
                    </Link>
                    <button onClick={() => removeFromCart(item)} className="remove-item">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <p>Total: ₱{parseFloat(calculateTotal()).toLocaleString('en-US')}</p>
              </div>
              <div className="cart-actions">
                <button onClick={handleCheckout} className="checkout-button">
                  <FontAwesomeIcon icon={faCreditCard} /> Proceed to Checkout
                </button>
                <button onClick={clearCart} className="clear-cart-button">
                  <FontAwesomeIcon icon={faTrash} /> Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;