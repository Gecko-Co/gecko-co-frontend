const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.cleanupExpiredReservations = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = Date.now();
    const geckosRef = db.collection('geckos');
    
    try {
      const expiredReservations = await geckosRef
        .where('status', '==', 'Reserved')
        .where('reservedUntil', '<', now)
        .get();

      const batch = db.batch();
      expiredReservations.forEach((doc) => {
        batch.update(doc.ref, { status: 'Available', reservedUntil: null });
      });

      await batch.commit();
      console.log('Expired reservations cleaned up');
      return null;
    } catch (error) {
      console.error("Error cleaning up reservations: ", error);
      return null;
    }
  });