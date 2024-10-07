import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import placeholderData from '../src/data.js';

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
const db = getFirestore(app);

async function addGeckosToFirestore() {
  const geckosCollection = collection(db, 'geckos');
  
  for (const gecko of placeholderData.results) {
    try {
      const docRef = await addDoc(geckosCollection, {
        ...gecko,
        reservedUntil: null
      });
      console.log(`Added gecko: ${gecko.name} with ID: ${docRef.id}`);
    } catch (error) {
      console.error(`Error adding gecko ${gecko.name}:`, error);
      if (error.code === 'permission-denied') {
        console.error('Please check your Firestore security rules.');
      }
    }
  }
  console.log('Finished adding geckos to Firestore');
}

addGeckosToFirestore().then(() => {
  console.log('Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});