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


let data = new Date();
let numeroDoDiaDaSemana = data.getDay();
let nomesDosDiasDaSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
let nomeDoDiaDaSemana = nomesDosDiasDaSemana[numeroDoDiaDaSemana];
let agendCardsSection = document.getElementById("agendCardsSection")
let actualUserEmail = ""
let actualUserPhoto = ""
let actualUserCredits = 0
let actualUserName = ""
let actualUserHairCuts = ""
let userAdmin = false
let userSelectedCuts = []
let userSelectedCutsValue = 0
let comboSelect = document.getElementById("comboSelect")
let quantyCutsSelecteds = 0
let loadingResource = document.getElementById("loadingResource")
let adminCancelCancelAgend = document.getElementById("adminCancelCancelAgend")
let barberPixKey = document.getElementById("barberPixKey")

adminCancelCancelAgend.addEventListener("click", () => {
    let adminCancelAgend = document.getElementById("adminCancelAgend")
    adminCancelAgend.style.opacity = "0"
    setTimeout(() => {
        let icon = document.querySelector("#adminCancelAgend lord-icon")
        icon.trigger = ""
        adminCancelAgend.style.display = "none"
        adminCancelAgend.style.zIndex = ""
    }, 200);
})

setInterval(() => {
    let paymentSection_paymentVoucher = document.querySelector(".paymentSection__paymentVoucher")
    let paymentSection_pixKey = document.querySelector(".paymentSection__pixKey")
    let paymentSection_total_span = document.querySelector(".paymentSection__total__span")
    paymentSection_total_span.innerHTML = `$${Number(userSelectedCutsValue) > 0 ? userSelectedCutsValue : `0.0`}`
    if (userSelectedCutsValue > 0) {
        paymentSection_paymentVoucher.style.display = ""
        paymentSection_pixKey.style.display = ""
    } else {
        paymentSection_paymentVoucher.style.display = "none"
        paymentSection_pixKey.style.display = "none"
    }
}, 1000);


onAuthStateChanged(auth, (user) => {
    if (user) {
        actualUserEmail = user.email
        let unsub2 = onSnapshot(doc(db, "AllData", `Data`), (doc) => {
            barberPixKey.innerHTML = `Envie para esta chave pix:<br>${docSnapPix.data().pixKey}`
        })
        let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
            actualUserPhoto = doc.data().userPhoto
            actualUserCredits = doc.data().credits
            actualUserName = doc.data().userName
            actualUserHairCuts = doc.data().hairCuts
            userAdmin = false
            if (doc.data().admin == true) {
                userAdmin = true
            }
        });
        comboSelect.oninput = function () {
            userSelectedCutsValue = 0
            quantyCutsSelecteds = 0
            userSelectedCuts = []
            loadServicesToPay()
        }
        loadAgendCards()
        loadServicesToPay()
    }
});

async function loadServicesToPay() {
    if (comboSelect.value == "service") {
        let paymentSectionServices = document.getElementById("paymentSectionServices")
        paymentSectionServices.innerHTML = ""
        let querySnapshot = await getDocs(collection(db, "service"));
        querySnapshot.forEach((doc) => {
            let article = document.createElement("article")
            let selectThis = document.createElement("span")
            paymentSectionServices.insertAdjacentElement("beforeend", article)
            article.classList.add("serviceArticle")
            article.innerHTML = `
                <ul class="serviceArticle__ul">
                    ${doc.data().Service1 != undefined ? `<li>${doc.data().Service1}</li>` : ``}
                    ${doc.data().Service2 != undefined ? `<li>${doc.data().Service2}</li>` : ``}
                    ${doc.data().Service3 != undefined ? `<li>${doc.data().Service3}</li>` : ``}
                </ul>
                <span class="serviceArticle__span">${doc.data().ServiceValue != "A combinar" ? `$${doc.data().ServiceValue}` : "A combinar"}</span>`
            article.insertAdjacentElement("afterbegin", selectThis)
            selectThis.classList.add("serviceArticle__selectThis")
            selectThis.onclick = function () {
                if (selectThis.classList.contains("active")) {
                    if (doc.data().ServiceValue != "A combinar") {
                        userSelectedCutsValue = Number(userSelectedCutsValue) - Number(doc.data().ServiceValue)
                    }
                    userSelectedCuts.splice(userSelectedCuts.indexOf(`${doc.data().Service1}`), 1)
                    selectThis.classList.remove("active")
                    quantyCutsSelecteds = quantyCutsSelecteds - 1
                    article.style.borderColor = ""
                    let paymentSection_total_span = document.querySelector(".paymentSection__total__span")
                    paymentSection_total_span.innerHTML = `$${Number(userSelectedCutsValue) > 0 ? userSelectedCutsValue : `0.0`}`
                } else {
                    if (doc.data().ServiceValue != "A combinar") {
                        userSelectedCutsValue = Number(userSelectedCutsValue) + Number(doc.data().ServiceValue)
                    }
                    userSelectedCuts.push(`${doc.data().Service1}`)
                    selectThis.classList.add("active")
                    quantyCutsSelecteds = quantyCutsSelecteds + 1
                    article.style.borderColor = "var(--primary-color)"
                    let paymentSection_total_span = document.querySelector(".paymentSection__total__span")
                    paymentSection_total_span.innerHTML = `$${Number(userSelectedCutsValue) > 0 ? userSelectedCutsValue : `0.0`}`
                }
            }
        });
    }
    if (comboSelect.value == "serviceCombo") {
        let paymentSectionServices = document.getElementById("paymentSectionServices")
        paymentSectionServices.innerHTML = ""
        let querySnapshot2 = await getDocs(collection(db, "serviceCombo"));
        querySnapshot2.forEach((doc) => {
            let article = document.createElement("article")
            let selectThis = document.createElement("span")
            paymentSectionServices.insertAdjacentElement("beforeend", article)
            article.classList.add("serviceArticle")
            article.innerHTML = `
                <ul class="serviceArticle__ul">
                    ${doc.data().Service1 != undefined ? `<li>${doc.data().Service1}</li>` : ``}
                    ${doc.data().Service2 != undefined ? `<li>${doc.data().Service2}</li>` : ``}
                    ${doc.data().Service3 != undefined ? `<li>${doc.data().Service3}</li>` : ``}
                </ul>
                <span class="serviceArticle__span">${doc.data().ServiceValue != "A combinar" ? `$${doc.data().ServiceValue}` : "A combinar"}</span>`
            article.insertAdjacentElement("afterbegin", selectThis)
            selectThis.classList.add("serviceArticle__selectThis")
            selectThis.onclick = function () {
                if (selectThis.classList.contains("active")) {
                    if (doc.data().ServiceValue != "A combinar") {
                        userSelectedCutsValue = Number(userSelectedCutsValue) - Number(doc.data().ServiceValue)
                    }
                    if (doc.data().Service1 != undefined && doc.data().Service2 != undefined && doc.data().Service3 != undefined) {
                        userSelectedCuts.splice(userSelectedCuts.indexOf(`${doc.data().Service1}`), 1)
                    } else {
                        if (doc.data().Service1 != undefined && doc.data().Service2 != undefined) {
                            userSelectedCuts.splice(userSelectedCuts.indexOf(`${doc.data().Service1}`), 1)
                        } else {
                            if (doc.data().Service1 != undefined) {
                                userSelectedCuts.splice(userSelectedCuts.indexOf(`${doc.data().Service1}`), 1)
                            }
                        }
                    }
                    selectThis.classList.remove("active")
                    quantyCutsSelecteds = quantyCutsSelecteds - 1
                    article.style.borderColor = ""
                    let paymentSection_total_span = document.querySelector(".paymentSection__total__span")
                    paymentSection_total_span.innerHTML = `$${Number(userSelectedCutsValue) > 0 ? userSelectedCutsValue : `0.0`}`
                } else {
                    if (doc.data().ServiceValue != "A combinar") {
                        userSelectedCutsValue = Number(userSelectedCutsValue) + Number(doc.data().ServiceValue)
                    }
                    if (doc.data().Service1 != undefined && doc.data().Service2 != undefined && doc.data().Service3 != undefined) {
                        userSelectedCuts.push(`${doc.data().Service1}/${doc.data().Service2}/${doc.data().Service3}`)
                    } else {
                        if (doc.data().Service1 != undefined && doc.data().Service2 != undefined) {
                            userSelectedCuts.push(`${doc.data().Service1}/${doc.data().Service2}`)
                        } else {
                            if (doc.data().Service1 != undefined) {
                                userSelectedCuts.push(`${doc.data().Service1}`)
                            }
                        }
                    }
                    selectThis.classList.add("active")
                    quantyCutsSelecteds = quantyCutsSelecteds + 1
                    article.style.borderColor = "var(--primary-color)"
                    let paymentSection_total_span = document.querySelector(".paymentSection__total__span")
                    paymentSection_total_span.innerHTML = `$${Number(userSelectedCutsValue) > 0 ? userSelectedCutsValue : `0.0`}`
                }
            }
        });
    }
}

function loadAgendCards() {
    let i = 0
    agendCardsSection.innerHTML = ""
    nomesDosDiasDaSemana.forEach(dayName => {
        if (dayName != "Segunda-feira") {
            let article = document.createElement("article")
            agendCardsSection.insertAdjacentElement("beforeend", article)
            article.classList.add("agendCard")
            if (dayName == nomeDoDiaDaSemana) {
                article.classList.add("closed")
            }
            article.id = dayName
            article.innerHTML = `<p class="agendCard__p">${dayName == nomeDoDiaDaSemana ? `${dayName} (Hoje)` : dayName}</p>
            <div class="agendCard__div">
            </div>
            <ion-icon name="caret-down-sharp" class="agendCard__icon"></ion-icon>`
            let div = document.querySelector(`#${dayName} .agendCard__div`)
            let hourIndex = 8
            while (hourIndex < 20) {
                if (hourIndex != 12) {
                    let thisHour = hourIndex
                    let button = document.createElement("button")
                    div.insertAdjacentElement("beforeend", button)
                    button.classList.add("agendCard__hour")
                    verifyDate(dayName, thisHour, button)
                } else {
                    let button = document.createElement("button")
                    div.insertAdjacentElement("beforeend", button)
                    button.classList.add("agendCard__hour")
                    button.classList.add("closed")
                    button.textContent = `Fechado`
                    button.addEventListener("click", (evt) => {
                        evt.stopPropagation()
                    })
                }
                hourIndex++
            }
            article.addEventListener("click", () => {
                if (article.classList.contains("closed") == false) {
                    if (article.classList.contains("open")) {
                        article.classList.remove("open")
                    } else {
                        article.classList.add("open")
                    }
                }
            })
        }
        i++
    });
}

async function removeLastAgend(dayName, hours) {
    let hourFormated = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    let cityRef = doc(db, `${dayName}`, `${hourFormated}`);
    await updateDoc(cityRef, {
        agended: false,
        vouncherId: deleteField(),
        userEmail: deleteField(),
        userName: deleteField(),
        services: deleteField(),
        value: deleteField(),
        dateAgended: deleteField(),
        AgendDate: deleteField()
    });
}

function realTimeDate(dayName, hours, button) {
    let hourFormated = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    const unsub = onSnapshot(doc(db, `${dayName}`, `${hourFormated}`), (doc) => {
        button.textContent = `${hourFormated}`
        button.style.color = ""
        button.style.background = ""
        button.style.pointerEvents = ""
        button.classList.remove("closed")
        button.classList.remove("agended")
        button.onclick = function () {

        }
        button.removeEventListener("click", () => {

        })
        if (doc.data().agended == true) {
            function converterStringParaData(dataString) {
                var partesData = dataString.split("/");
                var ano = parseInt("20" + partesData[2]);
                var mes = parseInt(partesData[1]) - 1;
                var dia = parseInt(partesData[0]);
                return new Date(ano, mes, dia);
            }
            function compararDatas(dataString1, dataString2) {
                var data1 = converterStringParaData(dataString1);
                var data2 = converterStringParaData(dataString2);

                if (data1 > data2) {
                    return "A primeira data é depois da segunda data.";
                } else if (data1 < data2) {
                    return "A primeira data é antes da segunda data.";
                } else {
                    return "As datas são iguais.";
                }
            }

            // Exemplo de uso            
            var dataAtual = new Date();
            var dataAtualFormatada = `${dataAtual.getDate()}/${dataAtual.getMonth() + 1}/${dataAtual.getFullYear().toString()}`;
            var resultado = compararDatas(`${dataAtualFormatada}`, `${doc.data().AgendDate}`);
            if (resultado == "A primeira data é depois da segunda data.") {
                removeLastAgend(dayName, hours)
            } else {
                button.classList.add("closed")
                button.textContent = `Fechado`
                if (userAdmin == true) {
                    button.textContent = `Agendado`
                    button.style.color = "var(--dark-gray)"
                    button.style.background = "#4AFF9D"
                    button.onclick = function () {
                        let icon = document.querySelector("#adminCancelAgend lord-icon")
                        let adminCancelAgend = document.getElementById("adminCancelAgend")
                        let adminConfirmCancelAgend = document.getElementById("adminConfirmCancelAgend")
                        icon.trigger = ""
                        adminCancelAgend.style.display = "flex"
                        adminCancelAgend.style.zIndex = "1000"
                        setTimeout(() => {
                            adminCancelAgend.style.opacity = "1"
                            icon.trigger = "in"
                            adminConfirmCancelAgend.onclick = function () {
                                loadingResource.style.display = "flex"
                                loadingResource.style.opacity = "0.8"
                                adminCancelAgendFct(dayName, hourFormated, doc.data().userEmail, button).then(() => {
                                    loadingResource.style.display = ""
                                    loadingResource.style.opacity = ""
                                    adminCancelAgend.style.opacity = "0"
                                    setTimeout(() => {
                                        icon.trigger = ""
                                        adminCancelAgend.style.display = "none"
                                        adminCancelAgend.style.zIndex = ""
                                    }, 200);
                                })
                            }
                        }, 1);
                    }
                } else {
                    if (doc.data().userEmail == actualUserEmail) {
                        button.textContent = `Agendado`
                        button.style.color = "var(--dark-gray)"
                        button.style.background = "#4AFF9D"
                        button.style.pointerEvents = "none"
                        button.onclick = function () {

                        }
                        button.addEventListener("click", (evt) => {
                            evt.stopPropagation()
                        })
                    }
                }
                button.addEventListener("click", (evt) => {
                    evt.stopPropagation()
                })
                if (dayName == nomeDoDiaDaSemana) {
                    verifyRemoveAgend(dayName, hours, button)
                    button.addEventListener("click", (evt) => {
                        evt.stopPropagation()
                    })
                }
            }
        } else {
            if (doc.data().closed == true) {
                button.classList.add("closed")
                button.textContent = `Fechado`
                if (userAdmin == true) {
                    button.addEventListener("click", (evt) => {
                        evt.stopPropagation()
                        if (doc.data().agended != true) {
                            openCloseData(dayName, hours, button)
                            console.log("oi");
                        }
                    })
                } else {
                    button.style.pointerEvents = "none"
                    button.onclick = function () {

                    }
                }
            } else {
                if (userAdmin == true) {
                    button.textContent = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
                    button.onclick = function (evt) {
                        evt.stopPropagation()
                        if (doc.data().agended != true) {
                            openCloseData(dayName, hours, button)
                            console.log("oi");
                        }
                    }
                } else {
                    button.textContent = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
                    button.addEventListener("click", (evt) => {
                        evt.stopPropagation()
                        let paymentDiv = document.getElementById("paymentDiv")
                        let paymentSection = document.getElementById("paymentSection")
                        let paymentDateComponent = document.querySelector("#paymentSection .paymentSection__h2 span")
                        let closePaymentSection = document.getElementById("closePaymentSection")
                        paymentDateComponent.textContent = `${dayName.replace("-feira", "")} ás ${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
                        paymentDiv.style.display = "flex"
                        setTimeout(() => {
                            paymentDiv.style.opacity = "1"
                            setTimeout(() => {
                                paymentSection.style.transform = "translateY(22%)"
                                setTimeout(() => {
                                    paymentDiv.style.overflowY = "auto"
                                    let confirmPayment = document.getElementById("confirmPayment")
                                    confirmPayment.onclick = function () {
                                        if (Number(userSelectedCutsValue) == 0 && quantyCutsSelecteds > 0) {
                                            loadingResource.style.display = "flex"
                                            loadingResource.style.opacity = "0.6"
                                            loadingResource.style.zIndex = "1000"
                                            requestAgend(dayName, hours, "")
                                        } else {
                                            console.log(quantyCutsSelecteds);
                                            let alertVouncher = document.getElementById("alertVouncher")
                                            alertVouncher.style.display = "flex"
                                            setTimeout(() => {
                                                alertVouncher.style.display = "none"
                                            }, 7000);
                                        }
                                    }
                                    document.getElementById('paymentVoucherInput').addEventListener('change', function (event) {
                                        let file = event.target.files[0];
                                        let reader = new FileReader();
                                        reader.onload = function () {
                                            if (event.target.files[0].type == "application/pdf") {
                                                let arrayBuffer = this.result;
                                                pdfjsLib.getDocument(arrayBuffer).promise.then(function (pdf) {
                                                    return pdf.getPage(1);
                                                }).then(function (page) {
                                                    let canvas = document.createElement('canvas');
                                                    let context = canvas.getContext('2d');
                                                    let viewport = page.getViewport({ scale: 1.0 });
                                                    canvas.width = viewport.width;
                                                    canvas.height = viewport.height;
                                                    let renderContext = {
                                                        canvasContext: context,
                                                        viewport: viewport
                                                    };
                                                    page.render(renderContext).promise.then(function () {
                                                        const img = document.getElementById('paymentVoucherImg');
                                                        img.src = canvas.toDataURL('image/jpeg');
                                                        confirmPayment.onclick = function () {
                                                            if (img.src != "") {
                                                                if (Number(userSelectedCutsValue) > 0) {
                                                                    loadingResource.style.display = "flex"
                                                                    loadingResource.style.opacity = "0.6"
                                                                    loadingResource.style.zIndex = "1000"
                                                                    requestAgend(dayName, hours, img.src)
                                                                } else {
                                                                    let alertVouncher = document.getElementById("alertVouncher")
                                                                    alertVouncher.style.display = "flex"
                                                                    setTimeout(() => {
                                                                        alertVouncher.style.display = "none"
                                                                    }, 7000);
                                                                }
                                                            } else {
                                                                if (Number(userSelectedCutsValue) == 0 && quantyCutsSelecteds > 0) {
                                                                    loadingResource.style.display = "flex"
                                                                    loadingResource.style.opacity = "0.6"
                                                                    loadingResource.style.zIndex = "1000"
                                                                    requestAgend(dayName, hours, "")
                                                                } else {
                                                                    console.log(quantyCutsSelecteds);
                                                                    let alertVouncher = document.getElementById("alertVouncher")
                                                                    alertVouncher.style.display = "flex"
                                                                    setTimeout(() => {
                                                                        alertVouncher.style.display = "none"
                                                                    }, 7000);
                                                                }
                                                            }
                                                        }
                                                    });
                                                });
                                            } else {
                                                let paymentVoucherImg = document.getElementById('paymentVoucherImg');
                                                paymentVoucherImg.src = reader.result;
                                                reader.readAsDataURL(file);
                                                confirmPayment.onclick = function () {
                                                    let paymentVoucherImg = document.getElementById('paymentVoucherImg');
                                                    if (paymentVoucherImg.src != "") {
                                                        if (Number(userSelectedCutsValue) > 0) {
                                                            loadingResource.style.display = "flex"
                                                            loadingResource.style.opacity = "0.6"
                                                            loadingResource.style.zIndex = "1000"
                                                            requestAgend(dayName, hours, paymentVoucherImg.src)
                                                        } else {
                                                            let alertVouncher = document.getElementById("alertVouncher")
                                                            alertVouncher.style.display = "flex"
                                                            setTimeout(() => {
                                                                alertVouncher.style.display = "none"
                                                            }, 7000);
                                                        }
                                                    } else {
                                                        if (Number(userSelectedCutsValue) == 0 && quantyCutsSelecteds > 0) {
                                                            loadingResource.style.display = "flex"
                                                            loadingResource.style.opacity = "0.6"
                                                            loadingResource.style.zIndex = "1000"
                                                            requestAgend(dayName, hours, "")
                                                        } else {
                                                            console.log(quantyCutsSelecteds);
                                                            let alertVouncher = document.getElementById("alertVouncher")
                                                            alertVouncher.style.display = "flex"
                                                            setTimeout(() => {
                                                                alertVouncher.style.display = "none"
                                                            }, 7000);
                                                        }
                                                    }
                                                }
                                            }
                                        };
                                        reader.readAsArrayBuffer(file);
                                    });
                                }, 500);
                            }, 200);
                        }, 1);
                        paymentSection.addEventListener("click", (evt) => {
                            evt.stopPropagation()
                        })
                        paymentDiv.addEventListener("click", () => {
                            paymentDiv.style.overflowY = ""
                            paymentSection.style.transform = ""
                            setTimeout(() => {
                                paymentDiv.style.opacity = "0"
                                setTimeout(() => {
                                    paymentDiv.style.display = "none"
                                    let paymentVoucherInput = document.getElementById('paymentVoucherInput');
                                    let paymentVoucherImg = document.getElementById('paymentVoucherImg');
                                    paymentVoucherInput.value = ""
                                    paymentVoucherImg.src = ""
                                    confirmPayment.onclick = function () {

                                    }
                                }, 200);
                            }, 400);
                        })
                        closePaymentSection.addEventListener("click", () => {
                            paymentDiv.style.overflowY = ""
                            paymentSection.style.transform = ""
                            setTimeout(() => {
                                paymentDiv.style.opacity = "0"
                                setTimeout(() => {
                                    paymentDiv.style.display = "none"
                                    let paymentVoucherInput = document.getElementById('paymentVoucherInput');
                                    let paymentVoucherImg = document.getElementById('paymentVoucherImg');
                                    paymentVoucherInput.value = ""
                                    paymentVoucherImg.src = ""
                                    confirmPayment.onclick = function () {

                                    }
                                }, 200);
                            }, 400);
                        })
                    })
                }
            }
        }
    });
}

async function verifyDate(dayName, hours, button) {
    let hourFormated = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    let docRef = doc(db, `${dayName}`, `${hourFormated}`);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        realTimeDate(dayName, hours, button)
    } else {
        if (userAdmin == true) {
            button.textContent = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
            button.addEventListener("click", (evt) => {
                evt.stopPropagation()
                openCloseData(dayName, hours, button)
            })
        } else {
            button.textContent = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
            button.addEventListener("click", (evt) => {
                evt.stopPropagation()
                let paymentDiv = document.getElementById("paymentDiv")
                let paymentSection = document.getElementById("paymentSection")
                let paymentDateComponent = document.querySelector("#paymentSection .paymentSection__h2 span")
                let closePaymentSection = document.getElementById("closePaymentSection")
                paymentDateComponent.textContent = `${dayName.replace("-feira", "")} ás ${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
                paymentDiv.style.display = "flex"
                setTimeout(() => {
                    paymentDiv.style.opacity = "1"
                    setTimeout(() => {
                        paymentSection.style.transform = "translateY(22%)"
                        setTimeout(() => {
                            paymentDiv.style.overflowY = "auto"
                            let confirmPayment = document.getElementById("confirmPayment")
                            confirmPayment.onclick = function () {
                                if (Number(userSelectedCutsValue) == 0 && Number(quantyCutsSelecteds) > 0) {
                                    loadingResource.style.display = "flex"
                                    loadingResource.style.opacity = "0.6"
                                    loadingResource.style.zIndex = "1000"
                                    requestAgend(dayName, hours, "")
                                } else {
                                    let alertVouncher = document.getElementById("alertVouncher")
                                    alertVouncher.style.display = "flex"
                                    setTimeout(() => {
                                        alertVouncher.style.display = "none"
                                    }, 7000);
                                }
                            }
                            document.getElementById('paymentVoucherInput').addEventListener('change', function (event) {
                                let file = event.target.files[0];
                                let reader = new FileReader();
                                reader.onload = function () {
                                    if (event.target.files[0].type == "application/pdf") {
                                        let arrayBuffer = this.result;
                                        pdfjsLib.getDocument(arrayBuffer).promise.then(function (pdf) {
                                            return pdf.getPage(1);
                                        }).then(function (page) {
                                            let canvas = document.createElement('canvas');
                                            let context = canvas.getContext('2d');
                                            let viewport = page.getViewport({ scale: 1.0 });
                                            canvas.width = viewport.width;
                                            canvas.height = viewport.height;
                                            let renderContext = {
                                                canvasContext: context,
                                                viewport: viewport
                                            };
                                            page.render(renderContext).promise.then(function () {
                                                const img = document.getElementById('paymentVoucherImg');
                                                img.src = canvas.toDataURL('image/jpeg');
                                                confirmPayment.onclick = function () {
                                                    if (img.src != "") {
                                                        if (Number(userSelectedCutsValue) > 0) {
                                                            loadingResource.style.display = "flex"
                                                            loadingResource.style.opacity = "0.6"
                                                            loadingResource.style.zIndex = "1000"
                                                            requestAgend(dayName, hours, img.src)
                                                        } else {
                                                            let alertVouncher = document.getElementById("alertVouncher")
                                                            alertVouncher.style.display = "flex"
                                                            setTimeout(() => {
                                                                alertVouncher.style.display = "none"
                                                            }, 7000);
                                                        }
                                                    } else {
                                                        if (Number(userSelectedCutsValue) == 0 && quantyCutsSelecteds > 0) {
                                                            loadingResource.style.display = "flex"
                                                            loadingResource.style.opacity = "0.6"
                                                            loadingResource.style.zIndex = "1000"
                                                            requestAgend(dayName, hours, "")
                                                        } else {
                                                            console.log(quantyCutsSelecteds);
                                                            let alertVouncher = document.getElementById("alertVouncher")
                                                            alertVouncher.style.display = "flex"
                                                            setTimeout(() => {
                                                                alertVouncher.style.display = "none"
                                                            }, 7000);
                                                        }
                                                    }
                                                }
                                            });
                                        });
                                    } else {
                                        let paymentVoucherImg = document.getElementById('paymentVoucherImg');
                                        paymentVoucherImg.src = reader.result;
                                        reader.readAsDataURL(file);
                                        confirmPayment.onclick = function () {
                                            let paymentVoucherImg = document.getElementById('paymentVoucherImg');
                                            if (paymentVoucherImg.src != "" && Number(userSelectedCutsValue) > 0) {
                                                loadingResource.style.display = "flex"
                                                loadingResource.style.opacity = "0.6"
                                                loadingResource.style.zIndex = "1000"
                                                requestAgend(dayName, hours, paymentVoucherImg.src)
                                            } else {
                                                if (Number(userSelectedCutsValue) == 0 && quantyCutsSelecteds > 0) {
                                                    loadingResource.style.display = "flex"
                                                    loadingResource.style.opacity = "0.6"
                                                    loadingResource.style.zIndex = "1000"
                                                    requestAgend(dayName, hours, "")
                                                } else {
                                                    console.log(quantyCutsSelecteds);
                                                    let alertVouncher = document.getElementById("alertVouncher")
                                                    alertVouncher.style.display = "flex"
                                                    setTimeout(() => {
                                                        alertVouncher.style.display = "none"
                                                    }, 7000);
                                                }
                                            }
                                        }
                                    }
                                };
                                reader.readAsArrayBuffer(file);
                            });
                        }, 500);
                    }, 200);
                }, 1);
                paymentSection.addEventListener("click", (evt) => {
                    evt.stopPropagation()
                })
                paymentDiv.addEventListener("click", () => {
                    paymentDiv.style.overflowY = ""
                    paymentSection.style.transform = ""
                    setTimeout(() => {
                        paymentDiv.style.opacity = "0"
                        setTimeout(() => {
                            paymentDiv.style.display = "none"
                            let paymentVoucherInput = document.getElementById('paymentVoucherInput');
                            let paymentVoucherImg = document.getElementById('paymentVoucherImg');
                            paymentVoucherInput.value = ""
                            paymentVoucherImg.src = ""
                            confirmPayment.onclick = function () {

                            }
                        }, 200);
                    }, 400);
                })
                closePaymentSection.addEventListener("click", () => {
                    paymentDiv.style.overflowY = ""
                    paymentSection.style.transform = ""
                    setTimeout(() => {
                        paymentDiv.style.opacity = "0"
                        setTimeout(() => {
                            paymentDiv.style.display = "none"
                            let paymentVoucherInput = document.getElementById('paymentVoucherInput');
                            let paymentVoucherImg = document.getElementById('paymentVoucherImg');
                            paymentVoucherInput.value = ""
                            paymentVoucherImg.src = ""
                            confirmPayment.onclick = function () {

                            }
                        }, 200);
                    }, 400);
                })
            })
        }
    }

}

async function verifyRemoveAgend(dayName, hours, button) {
    let hourFormated = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    let dataAtual = new Date();
    let horaAtual = dataAtual.getHours();
    let minutosAtuais = dataAtual.getMinutes();
    let horarioDeReferencia = `${hourFormated}`;
    let partesHorario = horarioDeReferencia.split(":");
    let horaDeReferencia = parseInt(partesHorario[0]);
    let minutosDeReferencia = parseInt(partesHorario[1]);
    if (horaAtual > horaDeReferencia || (horaAtual === horaDeReferencia && minutosAtuais > minutosDeReferencia)) {
        let cityRef = doc(db, `${dayName}`, `${hourFormated}`);
        await updateDoc(cityRef, {
            agended: false,
            vouncherId: deleteField(),
            userEmail: deleteField(),
            userName: deleteField(),
            services: deleteField(),
            value: deleteField(),
            dateAgended: deleteField(),
            AgendDate: deleteField()
        });

    }
}

async function openCloseData(dayName, hours, button) {
    let hourFormated = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    let docRef = doc(db, `${dayName}`, `${hourFormated}`);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        if (userAdmin == true) {
            if (docSnap.data().closed == true) {
                openData(dayName, hours, button)
            } else {
                closeData(dayName, hours, button)
            }
        }
    } else {
        if (userAdmin == true) {
            closeData(dayName, hours, button)
        }
    }
}

async function closeData(dayName, hours, button) {
    let formatHours = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    await setDoc(doc(db, `${dayName}`, `${formatHours}`), {
        closed: true
    });
    button.classList.add("closed")
    button.textContent = `Fechado`
}

async function openData(dayName, hours, button) {
    let formatHours = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    await setDoc(doc(db, `${dayName}`, `${formatHours}`), {
        closed: false
    });
    button.classList.remove("closed")
    button.textContent = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
}

async function requestAgend(dayName, hours, vouncher) {
    let proximaDataSemana
    function obterProximaData(diaSemana) {
        let dataAtual = new Date();
        let diaSemanaAtual = dataAtual.getDay();
        let diferencaDias = (diaSemana - diaSemanaAtual + 7) % 7;
        let proximaData = new Date(dataAtual);
        proximaData.setDate(dataAtual.getDate() + diferencaDias);
        let dia = proximaData.getDate();
        let mes = proximaData.getMonth() + 1;
        let ano = proximaData.getFullYear();
        dia = dia < 10 ? '0' + dia : dia;
        mes = mes < 10 ? '0' + mes : mes;
        let dataFormatada = dia + '/' + mes + '/' + ano;
        return dataFormatada;
    }
    switch (dayName) {
        case "Domingo":
            proximaDataSemana = obterProximaData(0);
            break;
        case "Segunda-feira":
            proximaDataSemana = obterProximaData(1);
            break;
        case "Terça-feira":
            proximaDataSemana = obterProximaData(2);
            break;
        case "Quarta-feira":
            proximaDataSemana = obterProximaData(3);
            break;
        case "Quinta-feira":
            proximaDataSemana = obterProximaData(4);
            break;
        case "Sexta-feira":
            proximaDataSemana = obterProximaData(5);
            break;
        case "Sábado":
            proximaDataSemana = obterProximaData(6);
            break;
    }
    let agora = new Date();
    let hora = agora.getHours().toString().padStart(2, '0');
    let minutos = agora.getMinutes().toString().padStart(2, '0');
    let horaAtual = `${hora}:${minutos}`;
    let dia = agora.getDate().toString().padStart(2, '0');
    let mes = (agora.getMonth() + 1).toString().padStart(2, '0');
    let ano = agora.getFullYear().toString().slice(-2);
    let dataAtual = `${dia}/${mes}/${ano}`;
    if (userSelectedCutsValue == 0) {
        let formatHours = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
        let docRef = await addDoc(collection(db, `requests`), {
            dayName: dayName,
            hours: hours,
            userName: actualUserName,
            userEmail: actualUserEmail,
            value: "A combinar",
            services: userSelectedCuts,
            timestamp: serverTimestamp(),
            notifierHours: horaAtual,
            notifierDate: dataAtual,
            AgendDate: proximaDataSemana
        });
        loadingResource.style.display = "none"
        loadingResource.style.opacity = "0"
        animatedConfirmPay()
    } else {
        let formatHours = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
        let docRef = await addDoc(collection(db, `requests`), {
            dayName: dayName,
            hours: hours,
            userName: actualUserName,
            userEmail: actualUserEmail,
            value: Number(userSelectedCutsValue),
            services: userSelectedCuts,
            timestamp: serverTimestamp(),
            notifierHours: horaAtual,
            notifierDate: dataAtual,
            AgendDate: proximaDataSemana
        });
        let itemsImagesRef = ref(storage, `vounchers/${docRef.id}.jpg`);
        let image = `${vouncher}`;
        uploadString(itemsImagesRef, image, 'data_url').then((snapshot) => {
            loadingResource.style.display = "none"
            loadingResource.style.opacity = "0"
            animatedConfirmPay()
        });
    }
}

function animatedConfirmPay() {
    let animatedCheckPayment = document.getElementById("animatedCheckPayment")
    let animatedCheckPaymentIcon = document.querySelector("#animatedCheckPayment .animatedCheckPayment__icon")
    let paymentVoucherInput = document.getElementById('paymentVoucherInput');
    let paymentVoucherImg = document.getElementById('paymentVoucherImg');
    let paymentDiv = document.getElementById("paymentDiv")
    let confirmPayment = document.getElementById("confirmPayment")
    let animatedCheckPaymentSpan = document.querySelector("#animatedCheckPayment .animatedCheckPayment__span")
    paymentDiv.style.overflowY = ""
    paymentSection.style.transform = ""
    setTimeout(() => {
        paymentVoucherInput.value = ""
        paymentVoucherImg.src = ""
        confirmPayment.onclick = function () { }
        animatedCheckPayment.style.display = "flex"
        setTimeout(() => {
            animatedCheckPayment.style.opacity = "1"
            setTimeout(() => {
                paymentDiv.style.opacity = "0"
                paymentDiv.style.display = "none"
                setTimeout(() => {
                    animatedCheckPaymentIcon.src = "https://cdn.lordicon.com/oqdmuxru.json"
                    animatedCheckPaymentIcon.trigger = "in"
                    setTimeout(() => {
                        animatedCheckPaymentSpan.style.opacity = "1"
                        animatedCheckPayment.onclick = function () {
                            animatedCheckPaymentIcon.src = ""
                            animatedCheckPayment.style.opacity = "0"
                            setTimeout(() => {
                                animatedCheckPayment.style.display = "none"
                                animatedCheckPaymentSpan.style.opacity = "0"
                            }, 200);
                        }
                    }, 1000);
                }, 200);
            }, 200);
        }, 1);
    }, 400);
}


async function adminCancelAgendFct(dayName, hours, docEmail, button) {
    let cityRef = doc(db, `${dayName}`, `${hours}`);
    await updateDoc(cityRef, {
        agended: false,
        vouncherId: deleteField(),
        userEmail: deleteField(),
        userName: deleteField(),
        services: deleteField(),
        value: deleteField(),
        dateAgended: deleteField(),
        AgendDate: deleteField()
    }).then(() => {
        cancelAgendAddNotify(dayName, hours, docEmail)
        button.textContent = `${hours}`
        button.style.color = "var(--white)"
        button.style.background = "var(--light-gray)"
    });
}

async function cancelAgendAddNotify(dayName, hours, docEmail) {
    let dataAtual = new Date();
    let dia = dataAtual.getDate().toString().padStart(2, '0');
    let mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    let dataFormatada = `${dia}/${mes}`;
    let docRef = await addDoc(collection(db, "notifys"), {
        for: `${docEmail}`,
        title: "Agendamento cancelado",
        description: `O agendamento de ${dayName} ás ${hours} foi cancelado e você será reembolsado`,
        date: `${dataFormatada}`,
        timestamp: serverTimestamp()
    });
    let docRef2 = await addDoc(collection(db, "notifys"), {
        for: `admin`,
        title: "Agendamento cancelado",
        description: `Você cancelou o agendamento de ${dayName} ás ${hours}`,
        date: `${dataFormatada}`,
        timestamp: serverTimestamp()
    });

}