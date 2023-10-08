import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
const firebaseConfig = {
    apiKey: `${import.meta.env.VITE_API_KEY}`,
    authDomain: `${import.meta.env.VITE_AUTH_DOMAIN}`,
    projectId: `${import.meta.env.VITE_PROJECT_ID}`,
    storageBucket: `${import.meta.env.VITE_STORAGE_BUCKET}`,
    messagingSenderId: `${import.meta.env.VITE_MESSAGING_SENDER_ID}`,
    appId: `${import.meta.env.VITE_APP_ID}`,
    measurementId: `${import.meta.env.VITE_MEASUREMENT_ID}`
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const analytics = getAnalytics(app);

function activeWelcome() {
    let welcomeSection = document.getElementById("welcomeSection")
    welcomeSection.style.display = "flex"
    setTimeout(() => {
        welcomeSection.style.opacity = "1"
    }, 1);
}

function activePages() {
    let homeSection = document.getElementById("homeSection")
    let signinSection = document.getElementById("signinSection")
    let loginSection = document.getElementById("loginSection")
    loginSection.style.display = "none"
    homeSection.style.display = "flex"
    signinSection.style.display = "none"
}

function desativeWelcome() {
    let welcomeSection = document.getElementById("welcomeSection")
    welcomeSection.style.opacity = "0"
    setTimeout(() => {
        welcomeSection.style.display = "none"
    }, 500);
}
window.addEventListener("load", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            activeWelcome()
            activePages()
            setTimeout(() => {
                desativeWelcome()
            }, 2000);
        }
    });
})