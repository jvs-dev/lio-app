let goPerfil = document.getElementById("goPerfil")
let goHome = document.getElementById("goHome")
let goAgend = document.getElementById("goAgend")
let navBar_div = document.querySelectorAll(".navBar__div")
let navBar = document.getElementById("navBar")

function desativePages(activethis) {
    let main_section = document.querySelectorAll(".main__section")
    main_section.forEach(element => {
        element.style.display = "none"
    });
    activethis.style.display = "flex"
}

navBar_div.forEach(element => {
    element.onclick = function (evt) {
        navBar_div.forEach(elem => {
            elem.classList.remove("active")
        })
        element.classList.add("active")
    }
});

goPerfil.addEventListener("click", () => {
    desativePages(document.getElementById("perfilSection"))
    navBar.style.background="var(--light-gray)"
})

goHome.addEventListener("click", ()=> {
    desativePages(document.getElementById("homeSection"))
    navBar.style.background="var(--light-gray)"
})

goAgend.addEventListener("click", ()=> {
    desativePages(document.getElementById("agendSection"))
    navBar.style.background="var(--dark-gray)"
})