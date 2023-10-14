import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
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
let inputElement = document.getElementById('newPostImg');
let previewElement = document.getElementById('postPreviewImg');
let cancelNewPost = document.getElementById("cancelNewPost")
let addPostSection = document.getElementById("addPostSection")
let publicNewPost = document.getElementById("publicNewPost")
let loadingResource = document.getElementById("loadingResource")
let allUserPhotos = document.getElementById("allUserPhotos")
let deletePost = document.getElementById("deletePost")

onAuthStateChanged(auth, (user) => {
    if (user) {
        actualUserEmail = user.email
        let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
            actualUserPhoto = doc.data().userPhoto
            actualUserCredits = doc.data().credits
            actualUserName = doc.data().userName
            actualUserHairCuts = doc.data().hairCuts
            actualUserPosts = doc.data().posts
        });
    }
});


cancelNewPost.addEventListener("click", () => {
    addPostSection.style.opacity = "0"
    setTimeout(() => {
        addPostSection.style.display = "none"
    }, 200);
})

inputElement.addEventListener('change', function () {
    let file = inputElement.files[0];

    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            previewElement.src = e.target.result;
            addPostSection.style.display = "flex"
            setTimeout(() => {
                addPostSection.style.opacity = "1"
            }, 1);
        };
        reader.readAsDataURL(file);
    } else {
        previewElement.src = "";
        addPostSection.style.opacity = "0"
        addPostSection.style.display = "none"
    }
});

publicNewPost.addEventListener("click", () => {
    loadingResource.style.display = "flex"
    setTimeout(() => {
        loadingResource.style.opacity = "0.8"
    }, 1);
    let postText = document.getElementById("newPostText").value
    let postImg = previewElement.src
    if (postImg != "" && postText != "") {
        addPost(postImg, postText)
    }
})

async function addPost(img, text) {
    let docRef = await addDoc(collection(db, "posts"), {
        description: `${text}`,
        authorName: `${actualUserName}`,
        authorEmail: `${actualUserEmail}`,
        authorPhoto: `${actualUserPhoto}`,
        timestamp: serverTimestamp(),
        likedBy: []
    });
    let itemsImagesRef = ref(storage, `posts/${docRef.id}.jpg`);
    let image = `${img}`;
    uploadString(itemsImagesRef, image, 'data_url').then((snapshot) => {
        loadingResource.style.opacity = "0";
        addPostSection.style.opacity = "0"
        loadPosts(actualUserEmail)
        setTimeout(() => {
            loadingResource.style.display = "none";
            addPostSection.style.display = "none"
        }, 200);
    });
}


async function loadPosts(email) {
    let i = 0
    allUserPhotos.innerHTML = ""
    const q = query(collection(db, "posts"), where("authorEmail", "==", `${email}`));
    const querySnapshot = await getDocs(q);
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
                let div = document.createElement("div")
                allUserPhotos.insertAdjacentElement("beforeend", div)
                div.classList.add("perfil__userPhotos__div")
                div.style.order = `${doc.data().timestamp.seconds}`
                div.innerHTML = `<img class="perfil__userPhotos__img" src="${url}">`
                div.addEventListener("click", () => {
                    let viewPostSection_div = document.querySelector(".viewPostSection__div")
                    viewPostSectionImg.src = `${url}`
                    viewPostSection.style.display = "flex"
                    setTimeout(() => {
                        viewPostSection.style.opacity = "1"
                    }, 1);
                    viewPostSection_div.addEventListener("click", (evt) => {
                        evt.stopPropagation()
                    })
                    viewPostSection.addEventListener("click", () => {
                        viewPostSection.style.opacity = "0"
                        setTimeout(() => {
                            viewPostSection.style.display = "none"
                        }, 200);
                    })
                    deletePost.addEventListener("click", () => {
                        deleteThisPost(doc.id)
                        loadingResource.style.display = "flex"
                        setTimeout(() => {
                            loadingResource.style.opacity = "0.8"
                        }, 1);
                    })
                })
                i++
                actualUserPosts = i
                perfilPosts.textContent = `${i}`
            })
    });
}

async function deleteThisPost(id) {
    await deleteDoc(doc(db, "posts", `${id}`));
    let desertRef = ref(storage, `posts/${id}.jpg`);
    deleteObject(desertRef).then(() => {
        loadPosts(actualUserEmail)
        viewPostSection.style.opacity = "0"
        loadingResource.style.opacity = "0"
        setTimeout(() => {
            loadingResource.style.display = "none"
            viewPostSection.style.display = "none"
        }, 200);
    }).catch((error) => {
        loadPosts(actualUserEmail)
        viewPostSection.style.opacity = "0"
        loadingResource.style.opacity = "0"
        setTimeout(() => {
            loadingResource.style.display = "none"
            viewPostSection.style.display = "none"
        }, 200);
    });

}