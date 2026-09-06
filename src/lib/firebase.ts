import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut } from 'firebase/auth';
// आपका फ़ायरबेस कॉन्फ़िगरेशन कोड [image_cgxzGe.png]
const firebaseConfig = {
  apiKey: "AIzaSyBJfn2Ive_yfleJeEabVfaqo8EN_JfIj5g",
  authDomain: "loveons.firebaseapp.com",
  projectId: "loveons",
  storageBucket: "loveons.firebasestorage.app",
  messagingSenderId: "791675098600",
  appId: "1:791675098600:web:1209bda0c838172f81b49d",
  measurementId: "G-DJSXYEN7TY"
};
// फ़ायरबेस को इनिशियलाइज़ करें
const app = initializeApp(firebaseConfig);

// ऑथेंटिकेशन और गूगल प्रोवाइडर को एक्सपोर्ट करें
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};
// लॉगआउट करने का हेल्पर फ़ंक्शन
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};
