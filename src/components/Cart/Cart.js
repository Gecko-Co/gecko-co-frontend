import React from 'react';
import { useCart } from './CartContext';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import './Cart.scss';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2);
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Your Cart</h1>
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/shop" className="continue-shopping">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <img src={item.images} alt={item.species} className="item-image" />
                  <div className="item-details">
                    <h3>{item.species}</h3>
                    <p className="item-price">${item.price}</p>
                  </div>
                  <button onClick={() => removeFromCart(index)} className="remove-button">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="cart-total">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
              <button className="checkout-button">Proceed to Checkout</button>
              <button onClick={clearCart} className="clear-cart-button">Clear Cart</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;