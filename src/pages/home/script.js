import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, updateDoc, query, where, getDocs, increment, arrayUnion, arrayRemove, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
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
let actualUserCredits = 0
let actualUserName = ""
let actualUserHairCuts = ""
let homePostsSection = document.getElementById("homePostsSection")

onAuthStateChanged(auth, (user) => {
    if (user) {
        actualUserEmail = user.email
        let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
            actualUserPhoto = doc.data().userPhoto
            actualUserCredits = doc.data().credits
            actualUserName = doc.data().userName
            actualUserHairCuts = doc.data().hairCuts
            loadPosts()
        });
    }
});

async function loadPosts() {
    homePostsSection.innerHTML = ""
    let q = query(collection(db, "posts"), where("authorName", "!=", ""));
    let querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        getDownloadURL(ref(storage, `posts/${doc.id}.jpg`))
            .then((url) => {
                const xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = (event) => {
                    const blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                getDownloadURL(ref(storage, `${doc.data().authorPhoto}`))
                    .then((authorUrl) => {
                        const xhr2 = new XMLHttpRequest();
                        xhr2.responseType = 'blob';
                        xhr2.onload = (event) => {
                            const blob = xhr2.response;
                        };
                        xhr2.open('GET', authorUrl);
                        xhr2.send();
                        let article = document.createElement("article")
                        let like = false
                        doc.data().likedBy.forEach(element => {
                            if (element == actualUserEmail) {
                                like = true
                            }
                        });
                        homePostsSection.insertAdjacentElement("beforeend", article)
                        article.classList.add("postCard")
                        article.style.order = `-${doc.data().timestamp.seconds}`
                        article.id = doc.id
                        article.innerHTML = `
                            <div class="postCard__div--1">
                                <div class="postCard__div--2">
                                    <div class="postCard__div--resetUserImg">
                                        <img src="${authorUrl}" class="postCard__userImg">
                                    </div>
                                    <p class="postCard__userName">${doc.data().authorName}</p>
                                </div>
                                <img src="${url}" class="postCard__mainImg">
                            </div>
                            <div class="postCard__div--3"><div class="heart-container postCard__likeThis" title="Like">
                            <input type="checkbox" class="checkbox postCard__checkbox" ${like == true ? "checked" : ""}>
                            <div class="svg-container">
                                <svg viewBox="0 0 24 24" class="svg-outline" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z">
                                    </path>
                                </svg>
                                <svg viewBox="0 0 24 24" class="svg-filled" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z">
                                    </path>
                                </svg>
                                <svg class="svg-celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="10,10 20,20"></polygon>
                                    <polygon points="10,50 20,50"></polygon>
                                    <polygon points="20,80 30,70"></polygon>
                                    <polygon points="90,10 80,20"></polygon>
                                    <polygon points="90,50 80,50"></polygon>
                                    <polygon points="80,80 70,70"></polygon>
                                </svg>
                            </div>
                        </div><span
                                class="postCard__span">${doc.data().likedBy.length} Likes</span><ion-icon class="postCard__elipsis"
                                name="ellipsis-vertical"></ion-icon></div>
                            <p class="postCard__text">${doc.data().description}</p>
                            <div class="postCard__div--4"></div>`
                        let likeBtn = document.querySelector(`#${doc.id} .postCard__likeThis`)
                        let likeBtnInput = document.querySelector(`#${doc.id} .postCard__checkbox`)
                        let likeNumber = document.querySelector(`#${doc.id} .postCard__span`)
                        let mainImg = document.querySelector(`#${doc.id} .postCard__mainImg`)
                        verifyDataLoop(doc.id, likeBtnInput, likeNumber)
                        mainImg.ondblclick = function () {
                            verifyLike(doc.id, likeBtn, likeNumber)
                        }
                        likeBtn.addEventListener("click", () => {
                            verifyLike(doc.id, likeBtn, likeNumber)
                        })
                    })
            })
    });
}

async function verifyDataLoop(id, component, txt) {
    let unsub = onSnapshot(doc(db, "posts", `${id}`), (doc) => {
        txt.textContent = `${doc.data().likedBy.length} Likes`
        let i = 0
        let e = 0
        while (i < doc.data().likedBy.length) {
            if (doc.data().likedBy[i] == actualUserEmail) {
                e++
            }
            i++
        }
        if (e == 0) {
            component.checked = false
        } else {
            component.checked = true
        }
    });

}

async function verifyLike(id, component, txt) {
    const docRef = doc(db, "posts", `${id}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        let i = 0
        let e = 0
        while (i < docSnap.data().likedBy.length) {
            if (docSnap.data().likedBy[i] == actualUserEmail) {
                e++
            }
            i++
        }
        if (e == 0) {
            addLike(id, component, txt, docSnap.data().likedBy.length)
        } else {
            removeLike(id, component, txt, docSnap.data().likedBy.length)
        }
    }
}

async function addLike(id, component, txt, likes) {
    let washingtonRef = doc(db, "posts", `${id}`);
    await updateDoc(washingtonRef, {
        likedBy: arrayUnion(`${actualUserEmail}`)
    });
    component.style.color = "#f00"
    component.name = "heart"
    txt.textContent = `${likes + 1} Likes`
}

async function removeLike(id, component, txt, likes) {
    let washingtonRef = doc(db, "posts", `${id}`);
    await updateDoc(washingtonRef, {
        likedBy: arrayRemove(`${actualUserEmail}`)
    });
    component.style.color = ""
    component.name = "heart-outline"
    txt.textContent = `${likes - 1} Likes`
}