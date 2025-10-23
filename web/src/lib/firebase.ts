import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

/** Provided config (unchanged) */
const firebaseConfig = {
  apiKey: "AIzaSyAFFyRB7F7LHNVraB5xL7zSunVPa7zbq9E",
  authDomain: "pls-fix-thx.firebaseapp.com",
  projectId: "pls-fix-thx",
  storageBucket: "pls-fix-thx.firebasestorage.app",
  messagingSenderId: "684982102967",
  appId: "1:684982102967:web:ede742c0e2e5d497c61632",
  measurementId: "G-04FXJHYHCS"
};

export const app = initializeApp(firebaseConfig);

// Analytics optional; safe-check for SSR/emulator
export async function initAnalytics() {
  try {
    if (typeof window !== "undefined" && (await isSupported())) {
      return getAnalytics(app);
    }
  } catch {}
  return null;
}

