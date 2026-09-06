import { initializeApp } from 'firebase/app';
import type { AuthError } from 'firebase/auth';
import {
  getAuth,
  GoogleAuthProvider,
  signOut,
  signInWithRedirect,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBJfn2Ive_yfleJeEabVfaqo8EN_JfIj5g',
  authDomain: 'loveons.firebaseapp.com',
  projectId: 'loveons',
  storageBucket: 'loveons.firebasestorage.app',
  messagingSenderId: '791675098600',
  appId: '1:791675098600:web:1209bda0c838172f81b49d',
  measurementId: 'G-DJSXYEN7TY',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence setup failed:', err);
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface SignInResult {
  success: boolean;
  error?: string;
  code?: string;
}

export const signInWithGoogle = async (): Promise<SignInResult> => {
  try {
    // signInWithRedirect is the most reliable method for production
    // on custom domains. Popups get blocked by mobile browsers and
    // cross-origin restrictions on Vercel.
    await signInWithRedirect(auth, googleProvider);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    console.error('Google Sign-In Error:', {
      code: authError?.code,
      message: authError?.message,
      name: authError?.name,
    });

    return {
      success: false,
      error: authError?.message || 'Sign-in failed',
      code: authError?.code,
    };
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout Error:', error);
    throw error;
  }
};
