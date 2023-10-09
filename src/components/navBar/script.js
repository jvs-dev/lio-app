let goPerfil = document.getElementById("goPerfil")
let goHome = document.getElementById("goHome")
let navBar_div = document.querySelectorAll(".navBar__div")

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
})

goHome.addEventListener("click", ()=> {
    desativePages(document.getElementById("homeSection"))
})