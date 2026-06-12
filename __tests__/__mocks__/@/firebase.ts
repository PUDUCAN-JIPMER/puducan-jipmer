import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHLgbuZqBaMK-hRAklZ3CyeqK-vj_Pl74",
  authDomain: "puducan-jipmer-29523.firebaseapp.com",
  projectId: "puducan-jipmer-29523",
  storageBucket: "puducan-jipmer-29523.firebasestorage.app",
  messagingSenderId: "63383542916",
  appId: "1:63383542916:web:aea7cd4e48d6d703ec76d1",
  measurementId: "G-246PEB6XW2"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;