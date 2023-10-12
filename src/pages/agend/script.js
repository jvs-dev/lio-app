let agendCard = document.querySelectorAll(".agendCard")
agendCard.forEach(element => {
    element.addEventListener("click", () => {
        if (element.classList.contains("today") == false) {
            if (element.classList.contains("open")) {
                element.classList.remove("open")
            } else {
                element.classList.add("open")
            }
        }
    })
});