import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import {
  firebaseClientConfig,
  useEmulator,
} from '@/lib/config/firebase-client-config'

// Initialize Firebase app with singleton pattern
const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseClientConfig) : getApp()

// Initialize Firebase services
export const clientAuth = getAuth(firebaseApp)
export const clientDb = getFirestore(firebaseApp)
export const clientStorage = getStorage(firebaseApp)

// Connect to emulators if USE_EMULATOR=true
if (useEmulator) {
  try {
    connectAuthEmulator(clientAuth, 'http://localhost:9099')
    connectFirestoreEmulator(clientDb, 'localhost', 8080)
    connectStorageEmulator(clientStorage, 'localhost', 9199)
  } catch {
    // Emulators already connected
  }
}

export default firebaseApp
