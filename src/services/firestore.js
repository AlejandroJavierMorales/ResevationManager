// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3CojyXaSdYr1sD1cAm4Py1ol2T8soqCc",
  authDomain: "reservationmanager-4fae9.firebaseapp.com",
  projectId: "reservationmanager-4fae9",
  storageBucket: "reservationmanager-4fae9.appspot.com",
  messagingSenderId: "192547282013",
  appId: "1:192547282013:web:ef1d32119b2cd6b50bc1b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);