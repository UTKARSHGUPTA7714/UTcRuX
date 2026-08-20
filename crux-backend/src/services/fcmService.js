const fs = require('fs');
const path = require('path');

let firebaseAdmin = null;

function initializeFirebase() {
  if (firebaseAdmin) return firebaseAdmin;
  
  try {
    const admin = require('firebase-admin');
    const credPath = process.env.FIREBASE_CREDENTIALS_PATH || path.join(__dirname, '../../serviceAccountKey.json');
    
    if (fs.existsSync(credPath)) {
      const serviceAccount = require(credPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseAdmin = admin;
      console.log('✓ [FCM Service] Firebase Admin SDK initialized with local service account.');
    } else {
      console.log('ℹ [FCM Service] Local serviceAccountKey.json not present. FCM signals will run in simulation mode.');
    }
  } catch (err) {
    console.log('ℹ [FCM Service] Firebase Admin initialization skipped (running local development mode).');
  }
  return firebaseAdmin;
}

async function sendPushSignal(contentId, type = 'CRUX_UPDATED') {
  try {
    const admin = initializeFirebase();
    const payload = {
      data: {
        type: type,
        contentId: String(contentId),
        timestamp: new Date().toISOString()
      },
      topic: 'crux_public'
    };

    if (admin) {
      const response = await admin.messaging().send(payload);
      console.log(`✓ [FCM Dispatch] Push signal sent to topic 'crux_public' for item: ${contentId} (Msg ID: ${response})`);
      return { success: true, messageId: response };
    } else {
      console.log(`✓ [FCM Dispatch - Dev Mode] Signal prepared for topic 'crux_public' (Type: ${type}, Content ID: ${contentId}).`);
      return { success: true, devMode: true };
    }
  } catch (error) {
    // Log failure safely without exposing sensitive credentials or stack traces
    console.warn(`⚠️ [FCM Dispatch] Push notification skipped or failed: ${error.message || error}`);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendPushSignal
};
