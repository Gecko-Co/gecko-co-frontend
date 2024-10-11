import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from '../Auth/AuthContext';
import customToast from '../../utils/toast';
import { doc, updateDoc, getDoc, setDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
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
      
      let geckoDoc;
      // First, try to fetch the gecko using the id
      const geckoRef = doc(db, 'geckos', item.id.toString());
      let geckoSnap = await getDoc(geckoRef);
      
      if (!geckoSnap.exists()) {
        // If not found by id, try to fetch using the 'name' field
        const geckosCollection = collection(db, 'geckos');
        const q = query(geckosCollection, where('name', '==', item.name));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          geckoDoc = querySnapshot.docs[0];
        } else {
          console.error("Gecko document does not exist:", item.id);
          customToast.error('Gecko not found');
          return false;
        }
      } else {
        geckoDoc = geckoSnap;
      }

      const geckoData = geckoDoc.data();
      console.log("Gecko data:", geckoData);

      if (geckoData.status === 'Available') {
        const userCartRef = doc(db, 'userCarts', currentUser.uid);
        const userCartSnap = await getDoc(userCartRef);
        const currentCart = userCartSnap.data().items || [];

        // Check if the item already exists in the cart
        const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === geckoDoc.id);

        if (existingItemIndex !== -1) {
          customToast.info('This gecko is already in your cart');
          return false;
        }

        // If the item doesn't exist, add it to the cart
        await updateDoc(userCartRef, {
          items: arrayUnion({ ...item, id: geckoDoc.id })
        });
        
        setCart(prevCart => [...prevCart, { ...item, id: geckoDoc.id }]);
        
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
      const userCartRef = doc(db, 'userCarts', currentUser.uid);
      await setDoc(userCartRef, { items: [] });
      
      setCart([]);
      customToast.success('Cart cleared');
    } catch (error) {
      console.error("Error clearing cart: ", error);
      customToast.error('Failed to clear cart');
    }
  }, [currentUser]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider, useCart };