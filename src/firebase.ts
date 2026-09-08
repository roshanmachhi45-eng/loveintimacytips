
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJfn2Ive_YfIeJeEabVfaq8EN_JfIj5g",
  authDomain: "loveons.firebaseapp.com",
  projectId: "loveons",
  storageBucket: "loveons.firebasestorage.app",
  messagingSenderId: "791675090600",
  appId: "1:791675090600:web:1209bda0c838172f01b49d",
  measurementId: "G-DJSXYEN7TY",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

export default app;



