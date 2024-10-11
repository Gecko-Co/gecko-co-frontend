import React from 'react';
import { useCart } from './CartContext';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowLeft, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import customToast from '../../utils/toast';
import './Cart.scss';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price), 0);
  };

  const handleCheckout = () => {
    customToast.warning('Checkout is currently under maintenance. Please try again later.');
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="continue-shopping">
              <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <Link to={`/gecko/${item.id}`} className="item-link">
                    <img src={item.images} alt={item.title} className="item-image" />
                    <div className="item-details">
                      <h3>{item.title}</h3>
                      <p className="item-price">₱{parseFloat(item.price).toLocaleString('en-US')}</p>
                    </div>
                  </Link>
                  <div className="item-actions">
                    <button onClick={() => removeFromCart(item)} className="remove-button">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <p className="cart-total">Total: ₱{calculateTotal().toLocaleString('en-US')}</p>
              <div className="cart-actions">
                <button onClick={clearCart} className="clear-cart-button">
                  <FontAwesomeIcon icon={faTrash} /> Clear Cart
                </button>
                <button onClick={handleCheckout} className="checkout-button">
                  <FontAwesomeIcon icon={faCreditCard} /> Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;