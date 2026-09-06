import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signOut,
  signInWithRedirect,
  signInWithPopup,
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

setPersistence(auth, browserLocalPersistence).catch(() => {
  // Some browsers block persistence — auth still works per-session.
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function isMobile(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Windows Phone|Mobile/i.test(
    navigator.userAgent || navigator.userAgentData?.toString() || ''
  );
}

export const signInWithGoogle = async () => {
  try {
    if (isMobile()) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);

    // If popup is blocked, fall back to redirect on any device.
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (redirectError) {
      console.error('Google Redirect fallback Error:', redirectError);
      throw redirectError;
    }

    return null;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout Error:', error);
    throw error;
  }
};
