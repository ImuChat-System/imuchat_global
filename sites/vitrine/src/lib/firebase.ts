// Import the functions you need from the SDKs you need
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA4a4HUIjne9ERzI4iHezn8JHBb2C9mgDE",
    authDomain: "imuchat-378ad.firebaseapp.com",
    databaseURL: "https://imuchat-378ad-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "imuchat-378ad",
    storageBucket: "imuchat-378ad.firebasestorage.app",
    messagingSenderId: "524860706727",
    appId: "1:524860706727:web:1d46790182b3ea8dc93082",
    measurementId: "G-MZGRWV7B90"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally (only in browser environment)
let analytics: Analytics | null = null;

if (typeof globalThis.window !== 'undefined') {
    isSupported().then((supported: any) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { analytics, app };

