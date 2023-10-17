let data = new Date();
let numeroDoDiaDaSemana = data.getDay();
let nomesDosDiasDaSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
let nomeDoDiaDaSemana = nomesDosDiasDaSemana[numeroDoDiaDaSemana];
let agendCardsSection = document.getElementById("agendCardsSection")


function loadAgendCards() {
    let i = 0
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
                    button.textContent = `${`${thisHour}`.length == 1 ? `0${thisHour}:00` : `${thisHour}:00`}`
                    button.addEventListener("click", (evt) => {
                        evt.stopPropagation()
                        let paymentDiv = document.getElementById("paymentDiv")
                        let paymentSection = document.getElementById("paymentSection")
                        let paymentDateComponent = document.querySelector("#paymentSection .paymentSection__h2 span")
                        let closePaymentSection = document.getElementById("closePaymentSection")
                        paymentDateComponent.textContent = `${dayName.replace("-feira", "")} ás ${`${thisHour}`.length == 1 ? `0${thisHour}:00` : `${thisHour}:00`}`
                        paymentDiv.style.display = "flex"
                        setTimeout(() => {
                            paymentDiv.style.opacity = "1"
                            setTimeout(() => {
                                paymentSection.style.transform = "translateY(0%)"
                                setTimeout(() => {
                                    paymentDiv.style.overflowY = "auto"
                                    let confirmPayment = document.getElementById("confirmPayment")
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
                                                    });
                                                });
                                            } else {
                                                let paymentVoucherImg = document.getElementById('paymentVoucherImg');
                                                paymentVoucherImg.src = reader.result;
                                                reader.readAsDataURL(file);
                                            }
                                        };
                                        reader.readAsArrayBuffer(file);
                                    });
                                    confirmPayment.onclick = function () {
                                        animatedConfirmPay()
                                    }
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


function scheduling() {

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
                    animatedCheckPaymentIcon.trigger = "in"
                    setTimeout(() => {
                        animatedCheckPaymentSpan.style.opacity = "1"
                        animatedCheckPayment.onclick = function () {
                            animatedCheckPaymentIcon.trigger = "out"
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


loadAgendCards()