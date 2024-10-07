// src/components/Cart/Cart.js
import React from 'react';
import { useCart } from './CartContext';
import './Cart.scss';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price), 0);
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2>Your Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="cart-items">
              {cart.map((item, index) => (
                <li key={item.id} className="cart-item">
                  <img src={item.images} alt={item.species} className="item-image" />
                  <div className="item-details">
                    <h3>{item.species}</h3>
                    <p className="item-price">₱{parseFloat(item.price).toLocaleString('en-US')}</p>
                  </div>
                  <button onClick={() => removeFromCart(index)} className="remove-button">Remove</button>
                </li>
              ))}
            </ul>
            <div className="cart-summary">
              <p className="cart-total">Total: ₱{calculateTotal().toLocaleString('en-US')}</p>
              <button onClick={clearCart} className="clear-cart-button">Clear Cart</button>
              <button className="checkout-button">Proceed to Checkout</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;