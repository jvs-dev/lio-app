import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, updateDoc, query, where, getDocs, deleteDoc, getDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
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
let agendHeader = document.querySelector("#agendSection .section__header")

onAuthStateChanged(auth, (user) => {
    if (user) {
        actualUserEmail = user.email
        let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
            actualUserPhoto = doc.data().userPhoto
            actualUserCredits = doc.data().credits
            actualUserName = doc.data().userName
            actualUserHairCuts = doc.data().hairCuts
            userAdmin = false
            agendHeader.innerHTML = `
                    <p>Lio Hairstyle</p>
                `
            if (doc.data().admin == true) {
                userAdmin = true
                agendHeader.innerHTML = `
                    <p>Lio Hairstyle</p>
                    <button type="button" class="agendHeader__btn" id="headerBtnCreateService"><ion-icon name="cut-outline"></ion-icon>Serviços</button>
                `
                let headerBtnCreateService = document.getElementById("headerBtnCreateService")
                let closeCreateServicesForm = document.getElementById("closeCreateServicesForm")
                let goCreateService = document.getElementById("goCreateService")
                let closeCreateServices = document.getElementById("closeCreateServices")
                let createServicesForm = document.getElementById("createServicesForm")
                let createServices = document.getElementById("createServices")
                let confirmCreateService = document.getElementById("confirmCreateService")
                loadServices()
                headerBtnCreateService.onclick = function () {
                    createServices.style.display = "flex"
                    setTimeout(() => {
                        createServices.style.opacity = "1"
                        closeCreateServices.onclick = function () {
                            createServices.style.opacity = "0"
                            setTimeout(() => {
                                createServices.style.display = "none"
                            }, 200);
                        }
                        goCreateService.onclick = function () {
                            createServicesForm.style.display = "flex"
                            setTimeout(() => {
                                createServicesForm.style.opacity = "1"
                                let combineServiceVale = document.getElementById("combineServiceVale")
                                combineServiceVale.onclick = function () {
                                    if (combineServiceVale.classList.contains("active")) {
                                        combineServiceVale.classList.remove("active")
                                        let ServiceValue = document.getElementById("ServiceValue")
                                        ServiceValue.type = "number"
                                        ServiceValue.value = ""
                                        ServiceValue.disabled = false
                                    } else {
                                        combineServiceVale.classList.add("active")
                                        let ServiceValue = document.getElementById("ServiceValue")
                                        ServiceValue.type = "text"
                                        ServiceValue.value = "A combinar"
                                        ServiceValue.disabled = true
                                    }
                                }
                                confirmCreateService.onclick = function () {
                                    let ServiceValue = document.getElementById("ServiceValue")
                                    let Service1 = document.getElementById("Service1")
                                    if (ServiceValue.value != "" && Service1.value != "") {
                                        createNewService()
                                    } else {
                                        let alertCreateService = document.getElementById("alertCreateService")
                                        alertCreateService.style.display = "flex"
                                        setTimeout(() => {
                                            alertCreateService.style.display = "none"
                                        }, 7000);
                                    }
                                }
                                closeCreateServicesForm.onclick = function () {
                                    createServicesForm.style.opacity = "0"
                                    setTimeout(() => {
                                        createServicesForm.style.display = "none"
                                        clearInputs()
                                    }, 200);
                                }
                            }, 1);
                        }
                    }, 1);
                }
            }
        });
    }
});

async function createNewService() {
    if (userAdmin == true) {
        let confirmCreateService = document.getElementById("confirmCreateService")
        let loadingResource = document.getElementById("loadingResource")
        let createServicesForm = document.getElementById("createServicesForm")
        loadingResource.style.display = "flex"
        loadingResource.style.opacity = "0.7"
        confirmCreateService.style.pointerEvents = "none"
        let ServiceValue = document.getElementById("ServiceValue").value
        let Service1 = document.getElementById("Service1").value
        let Service2 = document.getElementById("Service2").value
        let Service3 = document.getElementById("Service3").value
        if (ServiceValue != "" && Service1 != "" && Service2 != "" && Service3 != "") {
            let docRef1 = await addDoc(collection(db, "serviceCombo"), {
                ServiceValue: ServiceValue,
                Service1: Service1,
                Service2: Service2,
                Service3: Service3
            });
            confirmCreateService.style.pointerEvents = ""
            createServicesForm.style.opacity = "0"
            createServicesForm.style.display = "none"
            loadingResource.style.display = "none"
            loadingResource.style.opacity = "0"
            clearInputs()
            loadServices()
        } else {
            if (ServiceValue != "" && Service1 != "" && Service2 != "") {
                let docRef2 = await addDoc(collection(db, "serviceCombo"), {
                    ServiceValue: ServiceValue,
                    Service1: Service1,
                    Service2: Service2
                });
                confirmCreateService.style.pointerEvents = ""
                createServicesForm.style.opacity = "0"
                createServicesForm.style.display = "none"
                loadingResource.style.display = "none"
                loadingResource.style.opacity = "0"
                clearInputs()
                loadServices()
            } else {
                if (ServiceValue != "" && Service1 != "") {
                    let docRef3 = await addDoc(collection(db, "service"), {
                        ServiceValue: ServiceValue,
                        Service1: Service1
                    });
                    confirmCreateService.style.pointerEvents = ""
                    createServicesForm.style.opacity = "0"
                    createServicesForm.style.display = "none"
                    loadingResource.style.display = "none"
                    loadingResource.style.opacity = "0"
                    clearInputs()
                    loadServices()
                }
            }
        }
    }
}

function clearInputs() {
    let ServiceValue = document.getElementById("ServiceValue").value = ""
    let Service1 = document.getElementById("Service1").value = ""
    let Service2 = document.getElementById("Service2").value = ""
    let Service3 = document.getElementById("Service3").value = ""
}

async function loadServices() {
    if (userAdmin == true) {
        let createServicesSection = document.getElementById("createServicesSection")
        createServicesSection.innerHTML = ""
        let querySnapshot = await getDocs(collection(db, "service"));
        querySnapshot.forEach((doc) => {
            let article = document.createElement("article")
            let deletServiceBtn = document.createElement("ion-icon")
            createServicesSection.insertAdjacentElement("beforeend", article)
            article.classList.add("serviceArticle")
            article.innerHTML = `
            <ul class="serviceArticle__ul">
                ${doc.data().Service1 != undefined ? `<li>${doc.data().Service1}</li>` : ``}
            </ul>
            <span class="serviceArticle__span">${doc.data().ServiceValue != "A combinar" ? `$${doc.data().ServiceValue}` : "A combinar"}</span>`
            article.insertAdjacentElement("afterbegin", deletServiceBtn)
            deletServiceBtn.name = "trash-outline"
            deletServiceBtn.classList.add("serviceArticle__icon")
            deletServiceBtn.onclick = function () {
                deletService("service", doc.id)
            }
        });
        let querySnapshot2 = await getDocs(collection(db, "serviceCombo"));
        querySnapshot2.forEach((doc) => {
            let article = document.createElement("article")
            let deletServiceBtn = document.createElement("ion-icon")
            createServicesSection.insertAdjacentElement("beforeend", article)
            article.classList.add("serviceArticle")
            article.innerHTML = `
            <ul class="serviceArticle__ul">
                ${doc.data().Service1 != undefined ? `<li>${doc.data().Service1}</li>` : ``}
                ${doc.data().Service2 != undefined ? `<li>${doc.data().Service2}</li>` : ``}
                ${doc.data().Service3 != undefined ? `<li>${doc.data().Service3}</li>` : ``}
            </ul>
            <span class="serviceArticle__span">${doc.data().ServiceValue != "A combinar" ? `$${doc.data().ServiceValue}` : "A combinar"}</span>`
            article.insertAdjacentElement("afterbegin", deletServiceBtn)
            deletServiceBtn.name = "trash-outline"
            deletServiceBtn.classList.add("serviceArticle__icon")
            deletServiceBtn.onclick = function () {
                deletService("serviceCombo", doc.id)
            }
        });
    }
}

async function deletService(serviceType, id) {
    if (userAdmin == true) {
        await deleteDoc(doc(db, `${serviceType}`, `${id}`));
        loadServices()
    }
}