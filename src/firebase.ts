
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
  console.log("1. Google login started");

  try {
    const result = await signInWithPopup(
      auth,
      googleProvider
    );

    console.log("2. Google login successful:", result.user);

    return result.user;
  } catch (error: any) {
    console.error("3. Google login failed:", error);
    throw error;
  }
};

  return result.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export default app;



