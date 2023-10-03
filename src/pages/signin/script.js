let showsigninPassword = document.getElementById("showsigninPassword")
let signinPassword = document.getElementById("signinPassword")
let showsigninPasswordConfirm = document.getElementById("showsigninPasswordConfirm")
let signinPasswordConfirm = document.getElementById("signinPasswordConfirm")
let replaceToLogin = document.getElementById("replaceToLogin")

showsigninPassword.addEventListener("click", () => {
    if (signinPassword.type == "password") {
        signinPassword.type = "text"
        showsigninPassword.name = "eye-off-outline"
    } else {
        signinPassword.type = "password"
        showsigninPassword.name = "eye-outline"
    }
})

showsigninPasswordConfirm.addEventListener("click", () => {
    if (signinPasswordConfirm.type == "password") {
        signinPasswordConfirm.type = "text"
        showsigninPasswordConfirm.name = "eye-off-outline"
    } else {
        signinPasswordConfirm.type = "password"
        showsigninPasswordConfirm.name = "eye-outline"
    }
})

replaceToLogin.addEventListener("click", () => {
    let signinSection = document.getElementById("signinSection")
    let loginSection = document.getElementById("loginSection")
    let loginTitle = document.getElementById("loginTitle")
    signinSection.style.transform = "translateX(100vw)"
    setTimeout(() => {
        loginSection.style.transform = "translateX(0vw)"
        loginTitle.style.transform = "translateX(0vw)"
    }, 100);
})
