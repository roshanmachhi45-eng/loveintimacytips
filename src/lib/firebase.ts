import { initializeApp } from 'firebase/app';
import type { AuthError } from 'firebase/auth';
import {
  getAuth,
  GoogleAuthProvider,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBJfn2ive_YfleJeEabVfaqo8EN_JfIj5g',
  authDomain: 'loveons.firebaseapp.com',
  projectId: 'loveons',
  storageBucket: 'loveons.firebasestorage.app',
  messagingSenderId: '791675090600',
  appId: '1:791675090600:web:1209bda0c838172f01b49d',
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

function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

const FRIENDLY_ERRORS: Record<string, string> = {
  'auth/popup-blocked':
    'Popup was blocked by your browser. Please allow popups for this site, or try again.',
  'auth/popup-closed-by-user':
    'Sign-in popup was closed before completing. Please try again.',
  'auth/cancelled-popup-request':
    'Sign-in was cancelled. Please try again.',
  'auth/operation-not-supported-in-this-environment':
    'This browser does not support popup sign-in. Try using redirect mode.',
  'auth/auth-domain-config-required':
    'Firebase auth domain is not configured. Check Firebase console settings.',
  'auth/operation-not-allowed':
    'Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.',
  'auth/unauthorized-domain':
    'This domain is not authorized in Firebase. Add it in Firebase Console → Authentication → Settings → Authorized domains.',
};

export const signInWithGoogle = async (): Promise<SignInResult> => {
  const useRedirect = isMobile();

  try {
    if (useRedirect) {
      await signInWithRedirect(auth, googleProvider);
      return { success: true };
    }

    const result = await signInWithPopup(auth, googleProvider);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    const code = authError?.code || 'unknown';
    const message =
      FRIENDLY_ERRORS[code] || authError?.message || 'Sign-in failed';

    console.error('Google Sign-In Error:', {
      code,
      message: authError?.message,
    });

    // If popup was blocked on desktop, try redirect as a fallback.
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/operation-not-supported-in-this-environment'
    ) {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { success: true };
      } catch (redirectError) {
        const rErr = redirectError as AuthError;
        const rCode = rErr?.code || 'unknown';
        console.error('Google Redirect fallback Error:', {
          code: rCode,
          message: rErr?.message,
        });
        return {
          success: false,
          error: FRIENDLY_ERRORS[rCode] || rErr?.message || 'Sign-in failed',
          code: rCode,
        };
      }
    }

    return { success: false, error: message, code };
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
