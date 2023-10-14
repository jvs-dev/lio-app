import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, updateDoc, query, where, getDocs, increment, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
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
let homePostsSection = document.getElementById("homePostsSection")

onAuthStateChanged(auth, (user) => {
    if (user) {
        actualUserEmail = user.email
        let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
            actualUserPhoto = doc.data().userPhoto
            actualUserCredits = doc.data().credits
            actualUserName = doc.data().userName
            actualUserHairCuts = doc.data().hairCuts
            actualUserPosts = doc.data().posts
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
                        homePostsSection.insertAdjacentElement("beforeend", article)
                        article.classList.add("postCard")
                        article.style.order = `${doc.data().timestamp.seconds}`
                        article.id = doc.id
                        article.innerHTML = `
                            <div class="postCard__div--1">
                                <div class="postCard__div--2"><img src="${authorUrl}" class="postCard__userImg">
                                <p class="postCard__userName">${doc.data().authorName}</p>
                                </div>
                                <img src="${url}" class="postCard__mainImg">
                            </div>
                            <div class="postCard__div--3"><ion-icon name="heart-outline" class="postCard__likeThis"></ion-icon><span
                                class="postCard__span">${doc.data().likes} Likes</span><ion-icon class="postCard__elipsis"
                                name="ellipsis-vertical"></ion-icon></div>
                            <p class="postCard__text">${doc.data().description}</p>
                            <div class="postCard__div--4"></div>`
                        let likeBtn = document.querySelector(`#${doc.id} .postCard__likeThis`)
                        likeBtn.addEventListener("click", () => {
                            let i = 0
                            let e = 0
                            while (i < doc.data().likedBy.length) {
                                if (doc.data().likedBy[i] == actualUserEmail) {
                                    e++
                                }
                                i++
                            }
                            if (e < 1) {
                                addLike(doc.id)
                            }
                        })
                    })
            })
    });
}

async function addLike(id) {
    const washingtonRef = doc(db, "posts", `${id}`);
    await updateDoc(washingtonRef, {
        likes: increment(1),
        likedBy: arrayUnion(`${actualUserEmail}`)
    });
    loadPosts()
}