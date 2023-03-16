importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");
firebase.initializeApp({
    apiKey: "AIzaSyAs2Q4trxapFgbix3GHhWwV-t24nTTfgU4",
    authDomain: "kompwnd-io.firebaseapp.com",
    projectId: "kompwnd-io",
    storageBucket: "kompwnd-io.appspot.com",
    messagingSenderId: "103346830123",
    appId: "1:103346830123:web:38a0da569dd8479a9e636e",
    vapidKey: "BJALViBDfHMigTpr-65CucAq-phBt2gEgGE_sli6HDUtBYAyKHtT0GlIQE9OlMiVipRnGDehgUvz9zHs4oUCwEY"
});
const messaging = firebase.messaging();