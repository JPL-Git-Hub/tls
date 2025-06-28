import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential } from 'firebase/auth'
import { clientAuth } from './client'

// Configure Google OAuth provider with domain restriction for attorneys
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  hd: 'thelawshop.com', // Restrict to Google Workspace domain
  prompt: 'select_account'
})

// Configure Google OAuth provider for clients without domain restriction
export const googleClientProvider = new GoogleAuthProvider()
googleClientProvider.setCustomParameters({
  prompt: 'select_account'
})

// Google OAuth sign-in for attorneys
export const signInWithGoogle = async (): Promise<UserCredential> => {
  return await signInWithPopup(clientAuth, googleProvider)
}

// Google OAuth sign-in for clients
export const signInWithGoogleClient = async (): Promise<UserCredential> => {
  return await signInWithPopup(clientAuth, googleClientProvider)
}

// Email/password authentication for client portal access
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(clientAuth, email, password)
}

export const createAccountWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return await createUserWithEmailAndPassword(clientAuth, email, password)
}

// TODO: Add UX message for authorization failures in middleware/route protection:
// "We recognize your account, but we cannot currently provide you access. 
// Please call Joe Leon at 9176076915 or email us at josephleon@thelawshop.com"

export { clientAuth }