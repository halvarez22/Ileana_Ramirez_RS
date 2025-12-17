// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBm6UzMSmSXwk2gUjAgRILgXXspe7N7QVk",
  authDomain: "ileanaramirez-9e718.firebaseapp.com",
  projectId: "ileanaramirez-9e718",
  storageBucket: "ileanaramirez-9e718.firebasestorage.app",
  messagingSenderId: "540280025152",
  appId: "1:540280025152:web:8b57f86886891550bc6fa5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
