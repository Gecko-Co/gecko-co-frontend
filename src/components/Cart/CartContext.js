import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from '../Auth/AuthContext'; // Updated import path
import customToast from '../../utils/toast';
import { doc, updateDoc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';

const CartContext = createContext();

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      if (currentUser) {
        const userCartRef = doc(db, 'userCarts', currentUser.uid);
        const userCartSnap = await getDoc(userCartRef);
        if (userCartSnap.exists()) {
          setCart(userCartSnap.data().items || []);
        } else {
          await setDoc(userCartRef, { items: [] });
        }
      } else {
        setCart([]);
      }
    };

    fetchCart();
  }, [currentUser]);

  const addToCart = useCallback(async (item) => {
    if (!currentUser) {
      customToast.error('Please log in to add items to your cart');
      return false;
    }

    if (!item || !item.id) {
      console.error("Invalid item:", item);
      customToast.error('Failed to add item to cart');
      return false;
    }

    try {
      console.log("Adding item to cart:", item);
      
      const geckoRef = doc(db, 'geckos', item.id.toString());
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
          reservedBy: currentUser.uid,
          reservedUntil: Date.now() + 30 * 60 * 1000 // 30 minutes from now
        });
        
        const userCartRef = doc(db, 'userCarts', currentUser.uid);
        await updateDoc(userCartRef, {
          items: arrayUnion({ ...item, id: geckoSnap.id })
        });
        
        setCart(prevCart => [...prevCart, { ...item, id: geckoSnap.id }]);
        
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
  }, [currentUser]);

  const removeFromCart = useCallback(async (itemToRemove) => {
    if (!currentUser) {
      customToast.error('Please log in to remove items from your cart');
      return;
    }

    try {
      const geckoRef = doc(db, 'geckos', itemToRemove.id.toString());
      await updateDoc(geckoRef, { 
        status: 'Available', 
        reservedBy: null,
        reservedUntil: null 
      });
      
      const userCartRef = doc(db, 'userCarts', currentUser.uid);
      await updateDoc(userCartRef, {
        items: arrayRemove(itemToRemove)
      });
      
      setCart(prevCart => prevCart.filter(item => item.id !== itemToRemove.id));
      customToast.success('Item removed from cart');
    } catch (error) {
      console.error("Error removing from cart: ", error);
      customToast.error('Failed to remove item from cart');
    }
  }, [currentUser]);

  const clearCart = useCallback(async () => {
    if (!currentUser) {
      customToast.error('Please log in to clear your cart');
      return;
    }

    try {
      for (const item of cart) {
        const geckoRef = doc(db, 'geckos', item.id.toString());
        await updateDoc(geckoRef, { 
          status: 'Available', 
          reservedBy: null,
          reservedUntil: null 
        });
      }
      
      const userCartRef = doc(db, 'userCarts', currentUser.uid);
      await setDoc(userCartRef, { items: [] });
      
      setCart([]);
      customToast.success('Cart cleared');
    } catch (error) {
      console.error("Error clearing cart: ", error);
      customToast.error('Failed to clear cart');
    }
  }, [cart, currentUser]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider, useCart };