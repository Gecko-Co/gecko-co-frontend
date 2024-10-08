import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useCart } from '../Cart/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faCog, faShoppingCart, faTrash, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import customToast from '../../utils/toast';
import './Account.scss';

const Account = ({ user }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart } = useCart();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
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

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="account-container">
      <div className="account-page">
        <h1>My Account</h1>
        <div className="account-info">
          <p><strong>Email:</strong> {user.email}</p>
          {user.displayName && <p><strong>Name:</strong> {user.displayName}</p>}
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
                {cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <img src={item.images} alt={item.species} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h3>{item.species}</h3>
                      <p>₱{parseFloat(item.price).toLocaleString('en-US')}</p>
                    </div>
                    <button onClick={() => removeFromCart(index)} className="remove-item">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <p>Total: ₱{parseFloat(calculateTotal()).toLocaleString('en-US')}</p>
              </div>
              <div className="cart-actions">
                <button onClick={() => navigate('/cart')} className="checkout-button">
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