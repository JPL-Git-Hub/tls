import { validateServiceConfig } from './config-validator'

const validateClientConfig = () => {
  const useEmulator = process.env.USE_EMULATOR === 'true';
  
  if (useEmulator) {
    return {
      apiKey: 'demo-api-key',
      authDomain: 'demo-project.firebaseapp.com',
      projectId: 'demo-project',
      storageBucket: 'demo-project.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:demo',
      measurementId: 'G-DEMO',
    };
  }

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  return validateServiceConfig('Firebase client', config);
};

const validateAdminConfig = () => {
  const useEmulator = process.env.USE_EMULATOR === 'true';
  
  if (useEmulator) {
    return {
      projectId: 'demo-project',
      clientEmail: 'demo@demo-project.iam.gserviceaccount.com',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC=\n-----END PRIVATE KEY-----\n',
    };
  }

  const config = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  };

  return validateServiceConfig('Firebase admin', config);
};

export const firebaseClientConfig = validateClientConfig();
export const firebaseAdminConfig = validateAdminConfig();
export const useEmulator = process.env.USE_EMULATOR === 'true';