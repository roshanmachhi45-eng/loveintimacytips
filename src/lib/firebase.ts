import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBJfn2Ive_yfleJeEabVfaqo8EN_JfIj5g",
  authDomain: "://firebaseapp.com", // यहाँ हमेशा डिफॉल्ट फ़ायरबेस डोमेन ही रहना चाहिए
  projectId: "loveons",
  storageBucket: "loveons.firebasestorage.app",
  messagingSenderId: "791675098600",
  appId: "1:791675098600:web:1209bda0c838172f81b49d",
  measurementId: "G-DJSXYEN7TY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    // यह है असली ब्रह्मास्त्र: डायरेक्ट गूगल के ऑफिशियल साइन-इन पेज पर विंडो को रीडायरेक्ट करना
    const currentUrl = window.location.origin;
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=791675098600-u819234857102934.apps.googleusercontent.com&redirect_uri=https://://firebaseapp.com/__/auth/handler&response_type=token%20id_token&scope=openid%20profile%20email&state=${encodeURIComponent(currentUrl)}`;
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
