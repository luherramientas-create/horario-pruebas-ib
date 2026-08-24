import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

// Proyecto Firebase exclusivo de Horario de Pruebas IB.
const firebaseConfig = {
  apiKey: 'AIzaSyAwzTmyxrRXJJg12E0oWf_ypvH3ZMOGUKA',
  authDomain: 'pruebas-ib-cariari.firebaseapp.com',
  projectId: 'pruebas-ib-cariari',
  storageBucket: 'pruebas-ib-cariari.firebasestorage.app',
  messagingSenderId: '710955776260',
  appId: '1:710955776260:web:9b9a9d967de0f1ad76f851'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export { collection, addDoc, doc, getDoc, serverTimestamp, signInWithPopup, signOut, onAuthStateChanged };
