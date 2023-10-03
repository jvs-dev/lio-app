let showloginPassword = document.getElementById("showloginPassword")
let loginPassword = document.getElementById("loginPassword")
let replaceToSignin = document.getElementById("replaceToSignin")

showloginPassword.addEventListener("click", () => {
    if (loginPassword.type == "password") {
        loginPassword.type = "text"
        showloginPassword.name = "eye-off-outline"
    } else {
        loginPassword.type = "password"
        showloginPassword.name = "eye-outline"
    }
})

replaceToSignin.addEventListener("click", () => {
    let signinSection = document.getElementById("signinSection")
    let loginSection = document.getElementById("loginSection")
    let loginTitle = document.getElementById("loginTitle")
    loginTitle.style.transform = "translateX(100vw)"
    loginSection.style.transform = "translateX(-100vw)"
    setTimeout(() => {
        signinSection.style.transform = "translateX(0vw)"
    }, 100);
})