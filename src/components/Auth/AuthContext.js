import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, googleProvider, db } from '../../firebase';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import customToast from '../../utils/toast';

const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if the user document already exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // If the user document doesn't exist, create it
        const [firstName, ...lastNameParts] = user.displayName.split(' ');
        const lastName = lastNameParts.join(' ');

        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          email: user.email,
          createdAt: new Date().toISOString()
        });

        // Update the user's profile with the split name
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`
        });
      }

      customToast.success('Signed in successfully with Google!');
      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      customToast.error('Failed to sign in with Google. Please try again.');
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signOut,
    signInWithGoogle,
    setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };