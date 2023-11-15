import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, updateDoc, deleteField, query, where, getDocs, deleteDoc, getDoc, arrayUnion, arrayRemove, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
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
const storage = getStorage(app);

let notifys = 0
let goPerfil = document.getElementById("goPerfil")
let goHome = document.getElementById("goHome")
let goAgend = document.getElementById("goAgend")
let goNotifier = document.getElementById("goNotifier")
let navBar_div = document.querySelectorAll(".navBar__div")
let navBar = document.getElementById("navBar")
let navBarNotify = document.getElementById("navBarNotify")
let userAdmin = false
let actualUserEmail = ""



onAuthStateChanged(auth, (user) => {
    if (user) {
        actualUserEmail = user.email
        let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
            userAdmin = false
            if (doc.data().admin == true) {
                userAdmin = true
            }            
        });
    }
});



function desativePages(activethis) {
    let main_section = document.querySelectorAll(".main__section")
    main_section.forEach(element => {
        element.style.display = "none"
    });
    activethis.style.display = "flex"
}

navBar_div.forEach(element => {
    element.onclick = function (evt) {
        navBar_div.forEach(elem => {
            elem.classList.remove("active")
        })
        element.classList.add("active")
    }
});

goPerfil.addEventListener("click", () => {
    desativePages(document.getElementById("perfilSection"))
    navBar.style.background = "var(--light-gray)"
})

goHome.addEventListener("click", () => {
    desativePages(document.getElementById("homeSection"))
    navBar.style.background = "var(--light-gray)"
})

goAgend.addEventListener("click", () => {
    desativePages(document.getElementById("agendSection"))
    navBar.style.background = "var(--dark-gray)"
})

goNotifier.addEventListener("click", () => {
    desativePages(document.getElementById("notificationSection"))
    navBar.style.background = "var(--light-gray)"
})
