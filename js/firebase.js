import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCjE7kpwMZcFRVJsJcWPIQwEzgH-YrcXk0',
  authDomain: 'registro-edu-aa4c8.firebaseapp.com',
  projectId: 'registro-edu-aa4c8',
  storageBucket: 'registro-edu-aa4c8.firebasestorage.app',
  messagingSenderId: '1032924835108',
  appId: '1:1032924835108:web:f21d00c988d9898b3497b1'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export { collection, addDoc, doc, getDoc, serverTimestamp, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged };
