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
let homeHeader = document.querySelector("#homeSection .section__header")
let userAdmin = false

onAuthStateChanged(auth, (user) => {
    if (user) {
        let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
            userAdmin = false
            if (doc.data().admin == true) {
                userAdmin = true
                loadData()
                let goEditBtn = document.createElement("button")
                homeHeader.insertAdjacentElement("beforeend", goEditBtn)
                goEditBtn.innerHTML = `<ion-icon name="construct-outline"></ion-icon>`
                goEditBtn.classList.add("goEditBtn")
                goEditBtn.addEventListener("click", () => {
                    let editWebSection = document.getElementById("editWebSection")
                    let closeEditWebSection = document.getElementById("closeEditWebSection")
                    let editWebSectionInput = document.querySelectorAll(".editWebSection__formInput")
                    editWebSectionInput.forEach(element => {
                        element.addEventListener("input", () => {
                            let EditpixKey = document.getElementById("EditpixKey").value
                            let EditIntro = document.getElementById("EditIntro").value
                            let EditTell = document.getElementById("EditTell").value
                            let EditLink = document.getElementById("EditLink").value
                            let EditCover = document.getElementById("EditCover").value
                            let EditMobileCover = document.getElementById("EditMobileCover").value
                            let EditShow1 = document.getElementById("EditShow1").value
                            let EditShow2 = document.getElementById("EditShow2").value
                            let EditShow3 = document.getElementById("EditShow3").value
                            saveData(EditpixKey, EditIntro, EditTell, EditLink, EditCover, EditMobileCover, EditShow1, EditShow2, EditShow3)
                        })
                    });
                    closeEditWebSection.addEventListener("click", () => {
                        editWebSection.style.transform = "translateX(100vw)"
                    })
                    editWebSection.style.transform = "translateX(0px)"
                })
            }
        });
    }
});

async function loadData() {
    let docRef = doc(db, "AllData", "Data");
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        document.getElementById("EditpixKey").value = docSnap.data().pixKey
        document.getElementById("EditIntro").value = docSnap.data().Intro
        document.getElementById("EditTell").value = docSnap.data().Tell
        document.getElementById("EditLink").value = docSnap.data().Link
        document.getElementById("EditCover").value = docSnap.data().Cover
        document.getElementById("EditMobileCover").value = docSnap.data().MobileCover
        document.getElementById("EditShow1").value = docSnap.data().Show1
        document.getElementById("EditShow2").value = docSnap.data().Show2
        document.getElementById("EditShow3").value = docSnap.data().Show3
    }
}

async function saveData(EditpixKey, EditIntro, EditTell, EditLink, EditCover, EditMobileCover, EditShow1, EditShow2, EditShow3) {
    if (userAdmin == true) {
        await setDoc(doc(db, "AllData", "Data"), {
            pixKey: `${EditpixKey == undefined ? "" : EditpixKey}`,
            Intro: `${EditIntro == undefined ? "" : EditIntro}`,
            Tell: `${EditTell == undefined ? "" : EditTell}`,
            Link: `${EditLink == undefined ? "" : EditLink}`,
            Cover: `${EditCover == undefined ? "" : EditCover}`,
            MobileCover: `${EditMobileCover == undefined ? "" : EditMobileCover}`,
            Show1: `${EditShow1 == undefined ? "" : EditShow1}`,
            Show2: `${EditShow2 == undefined ? "" : EditShow2}`,
            Show3: `${EditShow3 == undefined ? "" : EditShow3}`
        });
    }
}