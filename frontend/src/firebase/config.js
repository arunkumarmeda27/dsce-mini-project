import { initializeApp } from "firebase/app";
import {
    getAuth,
    setPersistence,
    browserSessionPersistence
} from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// =================================
// FIREBASE CONFIG
// =================================
const firebaseConfig = {
    apiKey: "AIzaSyAL_CwVTF7c93JMFdy_q57PRRl7z3NwJ7U",
    authDomain: "dsce-mini-project.firebaseapp.com",
    projectId: "dsce-mini-project",
    storageBucket: "dsce-mini-project.firebasestorage.app",
    messagingSenderId: "609164741519",
    appId: "1:609164741519:web:67a91c4f7fae54459d99fa"
};

// =================================
// INITIALIZE APP
// =================================
const app = initializeApp(firebaseConfig);

// =================================
// AUTH
// =================================
export const auth = getAuth(app);

// 🔥 FORCE SESSION PERSISTENCE (Clears session when tab or window is closed)
setPersistence(auth, browserSessionPersistence)
    .then(() => {
        console.log("✅ Auth session-only persistence enabled");
    })
    .catch((err) => {
        console.error("Persistence error:", err);
    });

// =================================
// FIRESTORE
// =================================
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});
