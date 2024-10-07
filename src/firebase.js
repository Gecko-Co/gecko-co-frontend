import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDSZZEIn2qImteTJYpBJzSJZ7Jqzdic8Pg",
    authDomain: "gecko-co.firebaseapp.com",
    projectId: "gecko-co",
    storageBucket: "gecko-co.appspot.com",
    messagingSenderId: "531275334948",
    appId: "1:531275334948:web:ea1154b1f5ee930e931fb1",
    measurementId: "G-G1CRKRSN8V"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);