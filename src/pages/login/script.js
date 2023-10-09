import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
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

let showloginPassword = document.getElementById("showloginPassword")
let loginPassword = document.getElementById("loginPassword")
let replaceToSignin = document.getElementById("replaceToSignin")
let loginEmail = document.getElementById("loginEmail")
let loginBtn = document.getElementById("loginBtn")
let loginErrorP = document.getElementById("loginErrorP")

showloginPassword.addEventListener("click", () => {
    if (loginPassword.type == "password") {
        loginPassword.type = "text"
        showloginPassword.name = "eye-off-outline"
    } else {
        loginPassword.type = "password"
        showloginPassword.name = "eye-outline"
    }
})

replaceToSignin.addEventListener("click", () => {
    let signinSection = document.getElementById("signinSection")
    let loginSection = document.getElementById("loginSection")
    let loginTitle = document.getElementById("loginTitle")
    loginTitle.style.transform = "translateX(100vw)"
    loginSection.style.transform = "translateX(-100vw)"
    setTimeout(() => {
        signinSection.style.transform = "translateX(0vw)"
    }, 100);
})


loginBtn.addEventListener("click", () => {
    loginBtn.innerHTML = `<div class="dot-spinner">
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
  </div>`
    loginBtn.classList.add("loading")
    if (loginPassword.value != "" && loginEmail.value != "") {
        loginAccount(loginPassword.value, loginEmail.value)
    } else {
        loginErrorP.textContent = "Preencha todos os campos para continuar"
        loginBtn.innerHTML = `Login`
        loginBtn.classList.remove("loading")
        setTimeout(() => {
            loginErrorP.textContent = ""
        }, 5000);
    }
})

function loginAccount(password, email) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            activeWelcome()
            setTimeout(() => {
                activePages()
            }, 500);
            setTimeout(() => {
                desativeWelcome()
            }, 2000);
        })
        .catch((error) => {
            loginErrorP.textContent = "Verifique seus dados e tente novamente"
            loginBtn.innerHTML = `Login`
            loginBtn.classList.remove("loading")
            setTimeout(() => {
                signinErrorP.textContent = ""
            }, 5000);
        });
}

function activeWelcome() {
    let welcomeSection = document.getElementById("welcomeSection")
    welcomeSection.style.display = "flex"
    setTimeout(() => {
        welcomeSection.style.opacity = "1"
    }, 1);
}

function activePages() {
    let navBar = document.getElementById("navBar")
    let homeSection = document.getElementById("homeSection")
    let signinSection = document.getElementById("signinSection")
    let loginSection = document.getElementById("loginSection")
    loginSection.style.display = "none"
    navBar.style.display = "flex"
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