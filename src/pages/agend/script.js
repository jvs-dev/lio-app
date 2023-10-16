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


loadAgendCards()