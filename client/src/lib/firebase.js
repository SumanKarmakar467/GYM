import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBmvba_oodAjFHq4Hta_oSpHNfXeH1TxCw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gym1-b11c9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gym1-b11c9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gym1-b11c9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "353985247712",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:353985247712:web:865184393a819f9f589385",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-C2EQQBBLZ8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

export { auth, googleProvider };