import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';

async function cleanupExpiredReservations() {
  const geckosCollection = collection(db, 'geckos');
  const now = Date.now();
  const q = query(geckosCollection, where('status', '==', 'Reserved'), where('reservedUntil', '<', now));
  
  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, { status: 'Available', reservedUntil: null });
    });
    console.log('Expired reservations cleaned up');
  } catch (error) {
    console.error("Error cleaning up reservations: ", error);
  }
}

export { cleanupExpiredReservations };