import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
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
const db = getFirestore(app);
let showsigninPassword = document.getElementById("showsigninPassword")
let signinPassword = document.getElementById("signinPassword")
let showsigninPasswordConfirm = document.getElementById("showsigninPasswordConfirm")
let signinPasswordConfirm = document.getElementById("signinPasswordConfirm")
let replaceToLogin = document.getElementById("replaceToLogin")
let createAccount = document.getElementById("createAccount")
let signinErrorP = document.getElementById("signinErrorP")
let signinName = document.getElementById("signinName")
let signinEmail = document.getElementById("signinEmail")

showsigninPassword.addEventListener("click", () => {
    if (signinPassword.type == "password") {
        signinPassword.type = "text"
        showsigninPassword.name = "eye-off-outline"
    } else {
        signinPassword.type = "password"
        showsigninPassword.name = "eye-outline"
    }
})

showsigninPasswordConfirm.addEventListener("click", () => {
    if (signinPasswordConfirm.type == "password") {
        signinPasswordConfirm.type = "text"
        showsigninPasswordConfirm.name = "eye-off-outline"
    } else {
        signinPasswordConfirm.type = "password"
        showsigninPasswordConfirm.name = "eye-outline"
    }
})

replaceToLogin.addEventListener("click", () => {
    let signinSection = document.getElementById("signinSection")
    let loginSection = document.getElementById("loginSection")
    let loginTitle = document.getElementById("loginTitle")
    signinSection.style.transform = "translateX(100vw)"
    setTimeout(() => {
        loginSection.style.transform = "translateX(0vw)"
        loginTitle.style.transform = "translateX(0vw)"
    }, 100);
})

createAccount.addEventListener("click", () => {
    createAccount.innerHTML = `<div class="dot-spinner">
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
  </div>`
    createAccount.classList.add("loading")
    if (signinPassword.value != "" && signinPasswordConfirm.value != "" && signinName.value != "" && signinEmail.value != "") {
        if (signinPassword.value.length > 7) {
            if (signinPassword.value == signinPasswordConfirm.value) {
                addAccount(signinPassword.value, signinEmail.value, signinName.value)
            } else {
                signinErrorP.textContent = "As senhas não correspondem"
                createAccount.innerHTML = `Criar conta`
                createAccount.classList.remove("loading")
                setTimeout(() => {
                    signinErrorP.textContent = ""
                }, 5000);
            }
        } else {
            signinErrorP.textContent = "A senha deve ter no mínimo 8 caracteres"
            createAccount.innerHTML = `Criar conta`
            createAccount.classList.remove("loading")
            setTimeout(() => {
                signinErrorP.textContent = ""
            }, 5000);
        }
    } else {
        signinErrorP.textContent = "Preencha todos os campos para continuar"
        createAccount.innerHTML = `Criar conta`
        createAccount.classList.remove("loading")
        setTimeout(() => {
            signinErrorP.textContent = ""
        }, 5000);
    }
})

function addAccount(password, email, name) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            addData(email, name)
        })
        .catch((error) => {
            signinErrorP.textContent = "Conta já existente ou dados incorretos"
            createAccount.innerHTML = `Criar conta`
            createAccount.classList.remove("loading")
            setTimeout(() => {
                signinErrorP.textContent = ""
            }, 5000);
        });
}

async function addData(email, name) {
    await setDoc(doc(db, "users", `${email}`), {
        userName: name,
        userPhoto: "assets/perfilImg.jpg",
        posts: 0,
        credits: 0,
        hairCuts: 0
    });
    activeWelcome()
    setTimeout(() => {
        activePages()
    }, 500);
    setTimeout(() => {
        desativeWelcome()
    }, 2000);
}

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