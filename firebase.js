// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAt_vlmvQS6GQRgwdpcVkscvw7z-ksqPxs",
  authDomain: "dalda-22470.firebaseapp.com",
  projectId: "dalda-22470",
  storageBucket: "dalda-22470.appspot.com",
  messagingSenderId: "382038605683",
  appId: "1:382038605683:web:e317b9d0f1c042a48acf06",
  measurementId: "G-9WDSJKCTYY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);