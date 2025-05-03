
// 1. Arquivo: src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDv1tC44oJlqezmG-2gpNRgXE_xBaIPiIg",
    authDomain: "plannedbeauty-325d3.firebaseapp.com",
    projectId: "plannedbeauty-325d3",
    storageBucket: "plannedbeauty-325d3.firebasestorage.app",
    messagingSenderId: "974008801798",
    appId: "1:974008801798:web:fe9ba8928ee349b9224187",
    measurementId: "G-0DF9V8Z66V"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  export { auth, db };