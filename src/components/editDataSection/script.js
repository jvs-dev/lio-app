import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, updateDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
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

let actualUserEmail = ""
let actualUserPhoto = ""
let actualUserCredits = ""
let actualUserName = ""
let actualUserHairCuts = ""
let actualUserPosts = ""
let actualUserPhotoUrl = ""
let editData = document.getElementById("editData")
let editDataSection = document.getElementById("editDataSection")
let replacePerfilImgPreview = document.getElementById("replacePerfilImgPreview")
let replaceUserName = document.getElementById("replaceUserName")
let cancelReplaceData = document.getElementById("cancelReplaceData")
let replaceUserPhoto = document.getElementById("replaceUserPhoto")
let confirmReplaceData = document.getElementById("confirmReplaceData")
let loadingResource = document.getElementById("loadingResource")
let perfilImg = document.getElementById("perfilImg")
let newUrl = ""

onAuthStateChanged(auth, (user) => {
    if (user) {
        actualUserEmail = user.email
        let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
            actualUserPhoto = doc.data().userPhoto
            perfilImg.src = doc.data().userPhoto
            actualUserCredits = doc.data().credits
            actualUserName = doc.data().userName
            replaceUserName.value = doc.data().userName
            actualUserHairCuts = doc.data().hairCuts
            actualUserPosts = doc.data().posts
            if (doc.data().userPhoto == "assets/perfilImg.jpg") {
                replacePerfilImgPreview.src = `${doc.data().userPhoto}`
            } else {
                getDownloadURL(ref(storage, `users/${user.email}.jpg`))
                    .then((url) => {
                        const xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob';
                        xhr.onload = (event) => {
                            const blob = xhr.response;
                        };
                        xhr.open('GET', url);
                        xhr.send();
                        replacePerfilImgPreview.src = `${url}`
                        actualUserPhotoUrl = `${url}`
                    })
            }
        });

    }
});

editData.addEventListener("click", () => {
    editDataSection.style.display = "flex"
    setTimeout(() => {
        editDataSection.style.opacity = "1"
    }, 1);
})

cancelReplaceData.addEventListener("click", () => {
    editDataSection.style.opacity = "0"
    setTimeout(() => {
        editDataSection.style.display = "none"
    }, 200);
})

replaceUserPhoto.addEventListener('change', function () {
    let file = replaceUserPhoto.files[0];

    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            replacePerfilImgPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        replacePerfilImgPreview.src = "";
    }
});

confirmReplaceData.addEventListener("click", () => {
    if (replacePerfilImgPreview.src != "" && replaceUserName.value != "") {
        loadingResource.style.display = "flex"
        setTimeout(() => {
            loadingResource.style.opacity = "0.8"
        }, 1);
        perfilImg.src = replacePerfilImgPreview.src
        if (replacePerfilImgPreview.src != "assets/perfilImg.jpg" && replacePerfilImgPreview.src != actualUserPhotoUrl) {
            replaceAll(replacePerfilImgPreview.src, replaceUserName.value)
        } else {
            replaceName(replacePerfilImgPreview.src, replaceUserName.value)
        }
    }
})




async function replaceName(img, txt) {
    let washingtonRef = doc(db, "users", `${actualUserEmail}`);
    await updateDoc(washingtonRef, {
        userName: `${txt}`
    });
    if (img == "assets/perfilImg.jpg") {
        getUpdatePosts("assets/perfilImg.jpg", txt)
    } else {
        getUpdatePosts(`users/${actualUserEmail}.jpg`, txt)
    }
}





async function replaceAll(img, txt) {
    let washingtonRef = doc(db, "users", `${actualUserEmail}`);
    await updateDoc(washingtonRef, {
        userPhoto: `users/${actualUserEmail}.jpg`,
        userName: `${txt}`
    });

    let itemsImagesRef = ref(storage, `users/${actualUserEmail}.jpg`);
    let image = `${img}`;
    uploadString(itemsImagesRef, image, 'data_url').then((snapshot) => {
        getUpdatePosts(`users/${actualUserEmail}.jpg`, txt)
    });
}

async function getUpdatePosts(img, txt) {
    let q = query(collection(db, "posts"), where("authorEmail", "==", `${actualUserEmail}`));
    let querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        updatePosts(doc.id, img, txt)
    });
    loadingResource.style.opacity = "0";
    editDataSection.style.opacity = "0";
    setTimeout(() => {
        loadingResource.style.display = "none";
        editDataSection.style.display = "none";
    }, 200);
}

async function updatePosts(docId, img, txt) {
    let washingtonRef = doc(db, "posts", `${docId}`);
    await updateDoc(washingtonRef, {
        authorName: `${txt}`,
        authorPhoto: `${img}`
    });
}