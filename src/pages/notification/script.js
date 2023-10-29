import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, updateDoc, query, where, getDocs, deleteDoc, getDoc, arrayUnion, arrayRemove, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
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
let actualUserEmail = ""
let actualUserPhoto = ""
let actualUserCredits = 0
let actualUserName = ""
let actualUserHairCuts = ""
let userAdmin = false
let notificationCardsDiv = document.getElementById("notificationCardsDiv")
let closeViewVouncherDiv = document.getElementById("closeViewVouncherDiv")
let viewVouncherDiv = document.getElementById("viewVouncherDiv")
let viewVouncherImg = document.getElementById("viewVouncherImg")
closeViewVouncherDiv.onclick = function () {
    viewVouncherDiv.style.display = "none"
    viewVouncherImg.src = ""
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        actualUserEmail = user.email
        let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
            actualUserPhoto = doc.data().userPhoto
            actualUserCredits = doc.data().credits
            actualUserName = doc.data().userName
            actualUserHairCuts = doc.data().hairCuts
            userAdmin = false
            if (doc.data().admin == true) {
                userAdmin = true
                loadAdminNotifier()
            }
        });
    }
});


function loadAdminNotifier() {
    notificationCardsDiv.innerHTML = ``
    if (userAdmin = true) {
        let q = query(collection(db, "requests"), where("userEmail", "!=", ""));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                getDownloadURL(ref(storage, `vounchers/${doc.id}.jpg`))
                    .then((url) => {
                        const xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob';
                        xhr.onload = (event) => {
                            const blob = xhr.response;
                        };
                        xhr.open('GET', url);
                        xhr.send();
                        let article = document.createElement("article")
                        let viewVouncherBtn = document.createElement("button")
                        notificationCardsDiv.insertAdjacentElement("beforeend", article)
                        article.classList.add("adminNotification__card")
                        article.innerHTML = `
                    <p class="notificationCard__title">Solicitação de agendamento</p>
                    <ul class="notificationCard__ul">
                        <li class="notificationCard__li">De: ${doc.data().userEmail}</li>
                        <li class="notificationCard__li">Agendamento: ${doc.data().dayName} ás ${`${doc.data().hours}`.length == 1 ? `0${doc.data().hours}:00` : `${doc.data().hours}:00`}</li>
                        <li class="notificationCard__li">Serviço: ${`${doc.data().services}`.replace(",", ", ")}</li>
                        <li class="notificationCard__li">Valor: $${doc.data().value}</li>
                    </ul>
                    `
                        article.insertAdjacentElement("beforeend", viewVouncherBtn)
                        article.insertAdjacentHTML("beforeend", `
                            <div class="notificationCard__div">
                                <button type="button" class="notificationCard__btn reject">Rejeitar</button>
                                <button type="button" class="notificationCard__btn confirm">Confirmar</button>
                            </div>
                            <p class="notificationCard__date">${doc.data().notifierDate} ás ${doc.data().notifierHours}</p>`)
                        viewVouncherBtn.classList.add("notificationCard__viewVoucher")
                        viewVouncherBtn.type = "button"
                        viewVouncherBtn.textContent = "Ver comprovante"
                        article.style.order = `-${doc.data().timestamp.seconds}`
                        viewVouncherBtn.onclick = function () {
                            viewVouncherDiv.style.display = "block"
                            viewVouncherImg.src = `${url}`
                        }
                    })
                    .catch((error) => {
                        // Handle any errors
                    });
            });
        });
    }
}

async function scheduling(dayName, hours, vouncherId) {
    let formatHours = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    await setDoc(doc(db, `${dayName}`, `${formatHours}`), {
        agended: true,

    });
}