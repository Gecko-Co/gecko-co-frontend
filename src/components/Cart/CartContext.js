import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import customToast from '../../utils/toast';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback(async (item) => {
    if (!item || typeof item.id !== 'string' || item.id.trim() === '') {
      console.error("Invalid item:", item);
      customToast.error('Failed to add item to cart');
      return false;
    }

    try {
      console.log("Adding item to cart:", item);
      const geckoRef = doc(db, 'geckos', item.id);
      const geckoSnap = await getDoc(geckoRef);
      
      if (!geckoSnap.exists()) {
        console.error("Gecko document does not exist:", item.id);
        customToast.error('Gecko not found');
        return false;
      }

      const geckoData = geckoSnap.data();
      console.log("Gecko data:", geckoData);

      if (geckoData.status === 'Available') {
        await updateDoc(geckoRef, { 
          status: 'Reserved', 
          reservedUntil: Date.now() + 30 * 60 * 1000 // 30 minutes from now
        });
        
        setCart((prevCart) => {
          const newCart = [...prevCart, item];
          localStorage.setItem('cart', JSON.stringify(newCart));
          return newCart;
        });
        
        customToast.success('Gecko added to cart!');
        return true;
      } else {
        console.error("Gecko is not available:", geckoData.status);
        customToast.error('Gecko is not available');
        return false;
      }
    } catch (error) {
      console.error("Error adding to cart: ", error);
      customToast.error('Failed to add gecko to cart');
      return false;
    }
  }, []);

  const removeFromCart = useCallback(async (index) => {
    try {
      const item = cart[index];
      if (!item || typeof item.id !== 'string' || item.id.trim() === '') {
        console.error("Invalid item:", item);
        customToast.error('Failed to remove item from cart');
        return;
      }

      const geckoRef = doc(db, 'geckos', item.id);
      await updateDoc(geckoRef, { status: 'Available', reservedUntil: null });
      
      setCart((prevCart) => {
        const newCart = prevCart.filter((_, i) => i !== index);
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
      customToast.success('Item removed from cart');
    } catch (error) {
      console.error("Error removing from cart: ", error);
      customToast.error('Failed to remove item from cart');
    }
  }, [cart]);

  const clearCart = useCallback(async () => {
    try {
      for (const item of cart) {
        if (!item || typeof item.id !== 'string' || item.id.trim() === '') {
          console.error("Invalid item:", item);
          continue;
        }
        const geckoRef = doc(db, 'geckos', item.id);
        await updateDoc(geckoRef, { status: 'Available', reservedUntil: null });
      }
      setCart([]);
      localStorage.removeItem('cart');
      customToast.success('Cart cleared');
    } catch (error) {
      console.error("Error clearing cart: ", error);
      customToast.error('Failed to clear cart');
    }
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};