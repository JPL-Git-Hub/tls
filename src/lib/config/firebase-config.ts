import { validateServiceConfig } from './config-validator'

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

export const firebaseAdminConfig = validateAdminConfig();
export const useEmulator = process.env.USE_EMULATOR === 'true';