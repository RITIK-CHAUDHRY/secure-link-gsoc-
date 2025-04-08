
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZ0ZXN2VHjJcWTSJJHEY4d2hMfjfTR6ic",
  authDomain: "link-9b736.firebaseapp.com",
  projectId: "link-9b736",
  storageBucket: "link-9b736.firebasestorage.app",
  messagingSenderId: "599084787321",
  appId: "1:599084787321:web:806f8c7a3c515ccf5716a8",
  measurementId: "G-Z9L9DN9GBX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
