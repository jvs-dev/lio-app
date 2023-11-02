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

let nomesDosDiasDaSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
let actualUserEmail = ""
let actualUserPhoto = ""
let actualUserCredits = 0
let actualUserName = ""
let actualUserHairCuts = ""
let userAdmin = false
let loadingResource = document.getElementById("loadingResource")
let agendSectionHeader = document.querySelector("#agendSection .section__header")
let viewTickets = document.getElementById("viewTickets")
let closeViewTickets = document.getElementById("closeViewTickets")
let shareData = {
    title: "Lio Hairstyle",
    text: "Deixe reluzir sua melhor versão!",
    url: "https://lio-hairstyle-app.vercel.app/",
};
let alertCancelAgend = document.getElementById("alertCancelAgend")
let cancelCancelAgend = document.getElementById("cancelCancelAgend")
let confirmCancelAgend = document.getElementById("confirmCancelAgend")
let alertCancelAgendIcon = document.querySelector("#alertCancelAgend lord-icon")
cancelCancelAgend.addEventListener("click", () => {
    alertCancelAgend.style.opacity = "0"
    setTimeout(() => {
        alertCancelAgend.style.display = "none"
        alertCancelAgendIcon.trigger = ""
    }, 200);
})



closeViewTickets.addEventListener("click", () => {
    viewTickets.style.transform = ""
})

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
            } else {
                let btn = document.createElement("button")
                agendSectionHeader.insertAdjacentElement("beforeend", btn)
                btn.type = "button"
                btn.innerHTML = `Tickets<ion-icon name="ticket-outline"></ion-icon>`
                btn.classList.add("openViewTickets")
                btn.addEventListener("click", () => {
                    viewTickets.style.transform = "translateX(0%)"
                    loadTickets()
                })
            }
        });
    }
});


async function loadTickets() {
    let ticketsDiv = document.getElementById("ticketsDiv")
    ticketsDiv.innerHTML = ``
    let q = query(collection(db, "Domingo"), where("userEmail", "==", `${actualUserEmail}`));
    let querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        let weekDayName = `${doc.data().dateAgended}`.replace(` ás ${doc.id}`, ``)
        let article = document.createElement("article")
        ticketsDiv.insertAdjacentElement("beforeend", article)
        article.classList.add("ticket")
        let dataAtual = new Date();
        // Encontra o dia da semana atual (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)

        let numberWeekDay = nomesDosDiasDaSemana.indexOf(`${weekDayName}`)
        let diaSemanaAtual = dataAtual.getDay();
        let diasAteProximaTerca = Number(numberWeekDay) - diaSemanaAtual;
        if (diasAteProximaTerca <= 0) {
            diasAteProximaTerca += 7;
        }
        let proximaTerca = new Date(dataAtual);
        proximaTerca.setDate(dataAtual.getDate() + diasAteProximaTerca);
        let dia = proximaTerca.getDate().toString().padStart(2, '0');
        let mes = (proximaTerca.getMonth() + 1).toString().padStart(2, '0');
        let ano = proximaTerca.getFullYear();
        article.innerHTML = `
            <div class="ticket__div--1">
                <div class="ticket__div--2">
                <p class="ticket__title">Lio Hairstyle</p>
                <p class="ticket__name">${doc.data().userEmail}</p>
                <div class="ticket__div--3">
                    <p class="ticket__date">${dia}/${mes}<br>${weekDayName}</p>
                    <p class="ticket__value">${doc.data().value == "A combinar" ? `${doc.data().value}` : `$${doc.data().value}`}</p>
                    <p class="ticket__hours">${doc.id}</p>
                </div>
                </div>
            </div>
        `
        let cancelAgendBtn = document.createElement("button")
        article.insertAdjacentElement("afterend", cancelAgendBtn)
        cancelAgendBtn.classList.add("cancelAgendBtn")
        cancelAgendBtn.innerHTML = `<ion-icon name="trash-outline"></ion-icon> Desagendar`
        cancelAgendBtn.addEventListener("click", () => {
            alertCancelAgend.style.display = "flex"
            setTimeout(() => {
                alertCancelAgend.style.opacity = "1"
                alertCancelAgendIcon.trigger = "in"
                confirmCancelAgend.onclick = function () {
                    loadingResource.style.display = "flex"
                    loadingResource.style.opacity = "0.8"
                    loadingResource.style.zIndex = "1000"
                    alertCancelAgend.style.opacity = "0"
                    setTimeout(() => {
                        alertCancelAgend.style.display = "none"
                        alertCancelAgendIcon.trigger = ""
                    }, 200);
                    verifyRemoveAgend(weekDayName, doc.id)
                }
            }, 1);
        })
    });
}

async function verifyRemoveAgend(dayName, hours) {
    let cityRef = doc(db, `${dayName}`, `${hours}`);
    await updateDoc(cityRef, {
        agended: false,
        vouncherId: deleteField(),
        userEmail: deleteField(),
        userName: deleteField(),
        services: deleteField(),
        value: deleteField(),
        dateAgended: deleteField()
    }).then(() => {
        addnotify(dayName, hours).then(() => {
            loadTickets()
            loadingResource.style.display = ""
            loadingResource.style.opacity = ""
            loadingResource.style.zIndex = ""
        })
    });
}

async function addnotify(dayName, hours) {
    let dataAtual = new Date();
    let dia = dataAtual.getDate().toString().padStart(2, '0');
    let mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    let dataFormatada = `${dia}/${mes}`;
    let docRef = await addDoc(collection(db, "notifys"), {
        for: `${actualUserEmail}`,
        title: "Agendamento cancelado",
        description: `Você cancelou o agendamento de ${dayName} ás ${hours}`,
        date: `${dataFormatada}`,
        timestamp: serverTimestamp()
    });
}