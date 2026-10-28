const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');

/**
 * Firebase Admin SDK Configuration - Phase 4
 * Initializes Firebase Admin Auth & Storage using server environment variables.
 * Private keys and service account details NEVER touch the client or git repository.
 */

let isInitialized = false;
let appInstance = null;
let authInstance = null;
let storageBucketInstance = null;

const initializeFirebaseAdmin = () => {
  const existingApps = admin.getApps ? admin.getApps() : [];
  if (existingApps.length > 0) {
    appInstance = existingApps[0];
    authInstance = getAuth(appInstance);
    isInitialized = true;
    return { admin, auth: authInstance };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    (projectId ? `${projectId}.appspot.com` : undefined);

  if (projectId && clientEmail && privateKey) {
    try {
      // Correctly handle escaped newlines in environment variable
      privateKey = privateKey.replace(/\\n/g, '\n');

      appInstance = admin.initializeApp({
        credential: admin.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });

      authInstance = getAuth(appInstance);
      isInitialized = true;
      console.log('✅ Firebase Admin SDK initialized successfully with Service Account & Storage.');
    } catch (error) {
      console.error(`❌ Firebase Admin SDK Initialization Failed: ${error.message}`);
    }
  } else if (projectId) {
    // Fallback: Initialize with project ID (e.g. for GCP environments or Application Default Credentials)
    try {
      appInstance = admin.initializeApp({
        projectId,
        storageBucket,
      });
      authInstance = getAuth(appInstance);
      isInitialized = true;
      console.log(`ℹ️ Firebase Admin SDK initialized with Project ID: ${projectId}`);
    } catch (error) {
      console.error(`❌ Firebase Admin SDK Project ID Init Failed: ${error.message}`);
    }
  } else {
    console.warn(
      '⚠️ Firebase Admin SDK Warning: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are not fully configured in server/.env.'
    );
    console.warn('⚠️ Real Firebase token verification & Cloud Storage will require valid service account credentials in server/.env.');
  }

  return { admin, auth: authInstance };
};

// Initialize on module load
initializeFirebaseAdmin();

const isFirebaseAdminInitialized = () => isInitialized;

const getFirebaseAuth = () => {
  if (!authInstance && isInitialized && appInstance) {
    authInstance = getAuth(appInstance);
  }
  return authInstance;
};

const getFirebaseStorageBucket = () => {
  if (!isInitialized || !appInstance) {
    return null;
  }
  try {
    if (!storageBucketInstance) {
      const bucketName =
        process.env.FIREBASE_STORAGE_BUCKET ||
        (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.appspot.com` : undefined);
      storageBucketInstance = getStorage(appInstance).bucket(bucketName);
    }
    return storageBucketInstance;
  } catch (err) {
    console.warn('⚠️ Firebase Storage Bucket resolution error:', err.message);
    return null;
  }
};

module.exports = {
  admin,
  getFirebaseAuth,
  getFirebaseStorageBucket,
  isFirebaseAdminInitialized,
};
