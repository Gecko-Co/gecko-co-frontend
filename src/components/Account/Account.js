import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useCart } from '../Cart/CartContext';
import './Account.scss';

const Account = ({ user }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart } = useCart();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
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
          <button onClick={() => navigate('/cart')}>View Cart</button>
          <button onClick={() => navigate('/settings')}>Account Settings</button>
          <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
        </div>
        <div className="cart-preview">
          <h2>Cart Preview</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <img src={item.images} alt={item.species} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h3>{item.species}</h3>
                    <p>${item.price}</p>
                  </div>
                  <button onClick={() => removeFromCart(index)} className="remove-item">Remove</button>
                </div>
              ))}
              <div className="cart-total">
                <p>Total: ${calculateTotal()}</p>
              </div>
              <button onClick={() => navigate('/cart')} className="checkout-button">Proceed to Checkout</button>
              <button onClick={clearCart} className="clear-cart-button">Clear Cart</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;