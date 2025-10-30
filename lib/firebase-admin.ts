import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getFirebaseAdminPrivateKey() {
  const privateKeyBase64 = process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY;

  const pk = Buffer.from(privateKeyBase64 || '', 'base64').toString('utf-8');

  return pk
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
    privateKey: getFirebaseAdminPrivateKey(),
  }),
};

const adminApp = getApps().length === 0
  ? initializeApp(firebaseAdminConfig)
  : getApps()[0];

export const adminAuth = getAuth(adminApp);
