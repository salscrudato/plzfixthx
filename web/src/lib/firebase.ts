import { initializeApp } from "firebase/app";

/** Firebase config - updated to match .firebaserc */
const firebaseConfig = {
  apiKey: "AIzaSyAFFyRB7F7LHNVraB5xL7zSunVPa7zbq9E",
  authDomain: "plsfixthx-ai-2025.firebaseapp.com",
  projectId: "plsfixthx-ai-2025",
  storageBucket: "plsfixthx-ai-2025.firebasestorage.app",
  messagingSenderId: "684982102967",
  appId: "1:684982102967:web:ede742c0e2e5d497c61632",
  measurementId: "G-04FXJHYHCS"
};

export const app = initializeApp(firebaseConfig);

// Analytics disabled to avoid permissions errors
// Can be re-enabled when Firebase Installations API is properly configured
export async function initAnalytics() {
  // Analytics disabled
  return null;
}

