import React from 'react';
import './Cart.scss';

const Cart = ({ isOpen, onClose, cartItems, removeFromCart }) => {
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  return (
    <div className="cart-overlay">
      <div className="cart-content">
        <h2>Your Cart</h2>
        <button className="close-cart" onClick={onClose}>&times;</button>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="cart-items">
              {cartItems.map((item, index) => (
                <li key={index} className="cart-item">
                  <img src={item.images} alt={item.species} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h3>{item.species}</h3>
                    <p>Price: ₱{parseFloat(item.price).toLocaleString('en-US')}</p>
                  </div>
                  <button onClick={() => removeFromCart(index)} className="remove-item">&times;</button>
                </li>
              ))}
            </ul>
            <div className="cart-total">
              <strong>Total: ₱{total.toLocaleString('en-US')}</strong>
            </div>
            <button className="checkout-button">Proceed to Checkout</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;