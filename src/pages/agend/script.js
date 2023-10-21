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

onAuthStateChanged(auth, (user) => {
    if (user) {
        actualUserEmail = user.email
        let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
            actualUserPhoto = doc.data().userPhoto
            actualUserCredits = doc.data().credits
            actualUserName = doc.data().userName
            actualUserHairCuts = doc.data().hairCuts
            if (doc.data().admin == true) {
                userAdmin = true
            }
        });
        loadAgendCards()
    }
});


function loadAgendCards() {
    let i = 0
    agendCardsSection.innerHTML = ""
    nomesDosDiasDaSemana.forEach(dayName => {
        if (dayName != "Segunda-feira") {
            let article = document.createElement("article")
            agendCardsSection.insertAdjacentElement("beforeend", article)
            article.classList.add("agendCard")
            if (dayName == nomeDoDiaDaSemana || i < numeroDoDiaDaSemana) {
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


async function verifyDate(dayName, hours, button) {
    let hourFormated = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    let docRef = doc(db, `${dayName}`, `${hourFormated}`);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        if (docSnap.data().agended == true) {
            button.classList.add("closed")
            button.textContent = `Fechado`
            if (userAdmin == true) {
                button.textContent = `Agendado`
                button.style.color = "var(--dark-gray)"
                button.style.background = "#4AFF9D"
            }
            button.addEventListener("click", (evt) => {
                evt.stopPropagation()
            })
        } else {
            if (docSnap.data().closed == true) {
                button.classList.add("closed")
                button.textContent = `Fechado`
                if (userAdmin == true) {
                    button.addEventListener("click", (evt) => {
                        evt.stopPropagation()
                        openCloseData(dayName, hours, button)
                    })
                }
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
                                paymentSection.style.transform = "translateY(0%)"
                                setTimeout(() => {
                                    paymentDiv.style.overflowY = "auto"
                                    let confirmPayment = document.getElementById("confirmPayment")
                                    confirmPayment.onclick = function () {
                                        let alertVouncher = document.getElementById("alertVouncher")
                                        alertVouncher.style.display = "flex"
                                        setTimeout(() => {
                                            alertVouncher.style.display = "none"
                                        }, 7000);
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
                                                                scheduling(dayName, hours, img.src)
                                                            } else {
                                                                let alertVouncher = document.getElementById("alertVouncher")
                                                                alertVouncher.style.display = "flex"
                                                                setTimeout(() => {
                                                                    alertVouncher.style.display = "none"
                                                                }, 7000);
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
                                                        scheduling(dayName, hours, paymentVoucherImg.src)
                                                    } else {
                                                        let alertVouncher = document.getElementById("alertVouncher")
                                                        alertVouncher.style.display = "flex"
                                                        setTimeout(() => {
                                                            alertVouncher.style.display = "none"
                                                        }, 7000);
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
                        paymentSection.style.transform = "translateY(0%)"
                        setTimeout(() => {
                            paymentDiv.style.overflowY = "auto"
                            let confirmPayment = document.getElementById("confirmPayment")
                            confirmPayment.onclick = function () {
                                let alertVouncher = document.getElementById("alertVouncher")
                                alertVouncher.style.display = "flex"
                                setTimeout(() => {
                                    alertVouncher.style.display = "none"
                                }, 7000);
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
                                                        scheduling(dayName, hours, img.src)
                                                    } else {
                                                        let alertVouncher = document.getElementById("alertVouncher")
                                                        alertVouncher.style.display = "flex"
                                                        setTimeout(() => {
                                                            alertVouncher.style.display = "none"
                                                        }, 7000);
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
                                                scheduling(dayName, hours, paymentVoucherImg.src)
                                            } else {
                                                let alertVouncher = document.getElementById("alertVouncher")
                                                alertVouncher.style.display = "flex"
                                                setTimeout(() => {
                                                    alertVouncher.style.display = "none"
                                                }, 7000);
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
    let formatHours = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    let docRef = await addDoc(collection(db, `requests`), {
        dayName: dayName,
        hours: hours,
        vouncherID: `${dayName}-${formatHours}`,
        userName: actualUserName,
        userEmail: actualUserEmail,
        value: 0//inserir valor dos cortes
    });
    animatedConfirmPay()
}

/* async function scheduling(dayName, hours, vouncher) {
    let formatHours = `${`${hours}`.length == 1 ? `0${hours}:00` : `${hours}:00`}`
    await setDoc(doc(db, `${dayName}`, `${formatHours}`), {
        agended: true,
        
    });
    animatedConfirmPay()
} */

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