let introductionSection = document.getElementById("introductionSection")

window.addEventListener("load", () => {
    setTimeout(() => {
        introductionSection.style.opacity = "0"
        setTimeout(() => {
            introductionSection.style.display = "none"
        }, 500);
    }, 1000);
})