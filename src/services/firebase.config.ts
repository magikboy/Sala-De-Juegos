import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwyq3HejvRCNfEfkQ-eOe82obkJjAmKlo",
  authDomain: "salajuegos-c652e.firebaseapp.com",
  projectId: "salajuegos-c652e",
  storageBucket: "salajuegos-c652e.appspot.com",
  messagingSenderId: "130934895816",
  appId: "1:130934895816:web:2c66c0c09336e7710ca1fd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
