
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmj8gsB_tzOFLrS0hAs3JWcdCvwVyHtV4",
  authDomain: "link-e51d1.firebaseapp.com",
  projectId: "link-e51d1",
  storageBucket: "link-e51d1.firebasestorage.app",
  messagingSenderId: "212955962201",
  appId: "1:212955962201:web:727973cc8d7aafffe74a48",
  measurementId: "G-RR6DKS5LW7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
