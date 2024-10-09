import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import placeholderData from '../src/data.js';

const firebaseConfig = {
  // You might encounter this error: GrpcConnection RPC 'Write' stream 0x36416bd3 error
  // Just hard code the key values if that happens
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
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