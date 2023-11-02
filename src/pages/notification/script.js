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
let loadingResource = document.getElementById("loadingResource")
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
            } else {
                loadUserNotifier()
            }
        });
    }
});


async function loadUserNotifier() {
    notificationCardsDiv.innerHTML = ``
    let q = query(collection(db, "notifys"), where("for", "==", `${actualUserEmail}`));
    let querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        let article = document.createElement("article")
        let confirmtBtn = document.createElement("button")
        notificationCardsDiv.insertAdjacentElement("beforeend", article)
        article.classList.add("adminNotification__card")
        article.innerHTML = `
            <p class="notificationCard__title" ${`${doc.data().title}`.includes("recusada") || `${doc.data().title}`.includes("cancelado") ? `style="color: #FF4A4A;"` : ``}><ion-icon name="notifications-outline"></ion-icon>${doc.data().title}</p>
            <ul class="notificationCard__ul">
                <li class="notificationCard__li">${doc.data().description}</li>
            </ul>
        `
        article.style.order = `-${doc.data().timestamp.seconds}`
        article.insertAdjacentElement("beforeend", confirmtBtn)
        confirmtBtn.classList.add("notificationCard__userConfirm")
        confirmtBtn.textContent = "Confirmar"
        article.insertAdjacentHTML("beforeend", `<span class="notificationCard__dateSpan">${doc.data().date}</span>`)
        confirmtBtn.onclick = function () {
            loadingResource.style.display = "flex"
            loadingResource.style.opacity = "0.8"
            deleteNotify(doc.id)
        }
    })
}

async function deleteNotify(id) {
    await deleteDoc(doc(db, "notifys", `${id}`)).then(() => {
        loadUserNotifier()
        loadingResource.style.display = ""
        loadingResource.style.opacity = ""
    })
}

async function loadAdminNotifier() {
    notificationCardsDiv.innerHTML = ``
    if (userAdmin == true) {
        let q = query(collection(db, "requests"), where("userEmail", "!=", ""));
        let querySnapshot = await getDocs(q);
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
                    let rejectBtn = document.createElement("button")
                    let confirmBtn = document.createElement("button")
                    let div = document.createElement("div")
                    notificationCardsDiv.insertAdjacentElement("beforeend", article)
                    article.classList.add("adminNotification__card")
                    article.innerHTML = `
                    <p class="notificationCard__title">Solicitação de agendamento</p>
                    <ul class="notificationCard__ul">
                        <li class="notificationCard__li">De: ${doc.data().userEmail}</li>
                        <li class="notificationCard__li">Agendamento: ${doc.data().dayName} ás ${`${doc.data().hours}`.length == 1 ? `0${doc.data().hours}:00` : `${doc.data().hours}:00`}</li>
                        <li class="notificationCard__li">Serviço: ${`${doc.data().services}`.replace(",", ", ")}</li>
                        <li class="notificationCard__li">Valor: ${doc.data().value != "A combinar" ? `$${doc.data().value}` : `${doc.data().value}`}</li>
                    </ul>
                    `
                    article.insertAdjacentElement("beforeend", viewVouncherBtn)
                    article.insertAdjacentElement("beforeend", div)
                    div.classList.add("notificationCard__div")
                    div.insertAdjacentElement("beforeend", rejectBtn)
                    div.insertAdjacentElement("beforeend", confirmBtn)
                    rejectBtn.classList.add("notificationCard__btn")
                    rejectBtn.classList.add("reject")
                    confirmBtn.classList.add("notificationCard__btn")
                    confirmBtn.classList.add("confirm")
                    rejectBtn.textContent = "Rejeitar"
                    confirmBtn.textContent = "confirm"
                    article.insertAdjacentHTML("beforeend", `                        
                            <p class="notificationCard__date">${doc.data().notifierDate} ás ${doc.data().notifierHours}</p>`)
                    viewVouncherBtn.classList.add("notificationCard__viewVoucher")
                    viewVouncherBtn.type = "button"
                    viewVouncherBtn.textContent = "Ver comprovante"
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    viewVouncherBtn.onclick = function () {
                        viewVouncherDiv.style.display = "block"
                        viewVouncherImg.src = `${url}`
                    }
                    confirmBtn.onclick = function () {
                        loadingResource.style.display = "flex"
                        loadingResource.style.opacity = "0.8"
                        scheduling(doc.data().dayName, doc.data().hours, doc.id, doc.data().userEmail, doc.data().userName, doc.data().services, doc.data().value)
                    }
                    rejectBtn.onclick = function () {
                        loadingResource.style.display = "flex"
                        loadingResource.style.opacity = "0.8"
                        recusing(doc.data().dayName, doc.data().hours, doc.id, doc.data().userEmail, doc.data().userName, doc.data().services, doc.data().value)
                    }
                })
                .catch((error) => {
                    if (doc.data().value == "A combinar") {
                        let article = document.createElement("article")
                        let rejectBtn = document.createElement("button")
                        let confirmBtn = document.createElement("button")
                        let div = document.createElement("div")
                        notificationCardsDiv.insertAdjacentElement("beforeend", article)
                        article.classList.add("adminNotification__card")
                        article.innerHTML = `
                                <p class="notificationCard__title">Solicitação de agendamento</p>
                                <ul class="notificationCard__ul">
                                    <li class="notificationCard__li">De: ${doc.data().userEmail}</li>
                                    <li class="notificationCard__li">Agendamento: ${doc.data().dayName} ás ${`${doc.data().hours}`.length == 1 ? `0${doc.data().hours}:00` : `${doc.data().hours}:00`}</li>
                                    <li class="notificationCard__li">Serviço: ${`${doc.data().services}`.replace(",", ", ")}</li>
                                    <li class="notificationCard__li">Valor: ${doc.data().value != "A combinar" ? `$${doc.data().value}` : `${doc.data().value}`}</li>
                                </ul>
                                `
                        article.insertAdjacentElement("beforeend", div)
                        div.classList.add("notificationCard__div")
                        div.insertAdjacentElement("beforeend", rejectBtn)
                        div.insertAdjacentElement("beforeend", confirmBtn)
                        rejectBtn.classList.add("notificationCard__btn")
                        rejectBtn.classList.add("reject")
                        confirmBtn.classList.add("notificationCard__btn")
                        confirmBtn.classList.add("confirm")
                        rejectBtn.textContent = "Rejeitar"
                        confirmBtn.textContent = "confirm"
                        article.insertAdjacentHTML("beforeend", `                        
                                <p class="notificationCard__date">${doc.data().notifierDate} ás ${doc.data().notifierHours}</p>`)
                        article.style.order = `-${doc.data().timestamp.seconds}`
                        confirmBtn.onclick = function () {
                            loadingResource.style.display = "flex"
                            loadingResource.style.opacity = "0.8"
                            scheduling(doc.data().dayName, doc.data().hours, doc.id, doc.data().userEmail, doc.data().userName, doc.data().services, doc.data().value)
                        }
                        rejectBtn.onclick = function () {
                            loadingResource.style.display = "flex"
                            loadingResource.style.opacity = "0.8"
                            recusing(doc.data().dayName, doc.data().hours, doc.id, doc.data().userEmail, doc.data().userName, doc.data().services, doc.data().value)
                        }
                    }
                });
        });
    }
}

async function scheduling(dayName, hours, vouncherId, userEmail, userName, services, value) {
    let formatHours = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    await setDoc(doc(db, `${dayName}`, `${formatHours}`), {
        agended: true,
        vouncherId: vouncherId,
        userEmail: userEmail,
        userName: userName,
        services: services,
        value: value,
        dateAgended: `${dayName} ás ${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    });
    let dataAtual = new Date();
    let dia = dataAtual.getDate().toString().padStart(2, '0');
    let mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    let dataFormatada = `${dia}/${mes}`;
    let docRef = await addDoc(collection(db, "notifys"), {
        for: `${userEmail}`,
        title: "Agendamento confirmado",
        description: `Sua solicitação de agendamento de ${dayName} ás ${formatHours} foi aceita`,
        date: `${dataFormatada}`,
        timestamp: serverTimestamp()
    }).then(() => {
        notificationCardsDiv.innerHTML = ``
        deleteRequest(vouncherId)
        notificationCardsDiv.innerHTML = ``
    })
}

async function recusing(dayName, hours, vouncherId, userEmail, userName, services, value) {
    let formatHours = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    let dataAtual = new Date();
    let dia = dataAtual.getDate().toString().padStart(2, '0');
    let mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    let dataFormatada = `${dia}/${mes}`;
    let docRef = await addDoc(collection(db, "notifys"), {
        for: `${userEmail}`,
        title: "Solicitação recusada",
        description: `Seu pedido de agendamento de ${dayName} ás ${formatHours} foi recusado`,
        date: `${dataFormatada}`,
        timestamp: serverTimestamp()
    });
    notificationCardsDiv.innerHTML = ``
    deleteRequest(vouncherId)
    notificationCardsDiv.innerHTML = ``
}

async function deleteRequest(id) {
    await deleteDoc(doc(db, "requests", `${id}`));
    loadingResource.style.display = "none"
    loadingResource.style.opacity = "0"
}


let q = query(collection(db, "requests"), where("userEmail", "!=", ""));
let unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            if (userAdmin == true) {
                let reloadNotification = document.getElementById("reloadNotification")
                reloadNotification.style.transform = "translateY(0px)"
                reloadNotification.onclick = () => {
                    notificationCardsDiv.innerHTML = ``
                    loadAdminNotifier()
                    reloadNotification.style.transform = ""
                }
            } else {
                loadUserNotifier()
            }
        }
        if (change.type === "modified") {
            if (userAdmin == true) {
                let reloadNotification = document.getElementById("reloadNotification")
                reloadNotification.style.transform = "translateY(0px)"
                reloadNotification.onclick = () => {
                    notificationCardsDiv.innerHTML = ``
                    loadAdminNotifier()
                    reloadNotification.style.transform = ""
                }
            } else {
                loadUserNotifier()
            }
        }
        if (change.type === "removed") {
            if (userAdmin == true) {
                notificationCardsDiv.innerHTML = ``
                loadAdminNotifier()
                notificationCardsDiv.innerHTML = ``
            } else {
                loadUserNotifier()
            }
        }
    });
});
