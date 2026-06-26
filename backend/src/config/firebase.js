const admin = require('firebase-admin');

if (!admin.apps.length) {
  // In production: use GOOGLE_APPLICATION_CREDENTIALS env var OR
  // pass serviceAccount JSON from env
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Local dev: place your serviceAccountKey.json in backend root
    try {
      const sa = require('../../serviceAccountKey.json');
      admin.initializeApp({ credential: admin.credential.cert(sa) });
    } catch (e) {
      console.error('Firebase Admin init failed: provide serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT env var');
      process.exit(1);
    }
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
