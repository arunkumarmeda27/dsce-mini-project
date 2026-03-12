import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAL_CwVTF7c93JMFdy_q57PRRl7z3NwJ7U",
    authDomain: "dsce-mini-project.firebaseapp.com",
    projectId: "dsce-mini-project",
    storageBucket: "dsce-mini-project.firebasestorage.app",
    messagingSenderId: "609164741519",
    appId: "1:609164741519:web:67a91c4f7fae54459d99fa",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);