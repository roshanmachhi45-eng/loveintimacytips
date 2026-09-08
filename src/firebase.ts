
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJfn2Ive_YfIeEabVfaq8EN_JfIj5g",
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
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export default app;


