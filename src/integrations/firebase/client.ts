
// Firebase configuration and client setup
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHhzWWg94QHwaMQiKPojQO6gFE0oYn1F4",
  authDomain: "warehouse-management-system-c5a7d.firebaseapp.com",
  projectId: "warehouse-management-system-c5a7d",
  storageBucket: "warehouse-management-system-c5a7d.appspot.com",
  messagingSenderId: "722042539301",
  appId: "1:722042539301:web:0f9e6c5cb4bff4b4ad6dd4",
  measurementId: "G-WRXVB8JZZL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
