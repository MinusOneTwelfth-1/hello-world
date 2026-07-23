// modulez.js : keep this file in STEMSync/docs/ on GitHub
// its url will be 'https://minusonetwelfth-1.github.io/STEMSync/modulez.js'
export function myFN(x){console.log(x)}

 import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

   // Import the Realtime Database SDK (add this in the same <script type="module"> where you initialize Firebase)
import {  getDatabase,  ref,  set,  push,  update,  remove,  onValue,  get,  runTransaction,  query,
  orderByChild,  equalTo,  limitToFirst} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

window.fdb_getDatabase=getDatabase
window.fdb_initializeApp=initializeApp
window.fdb_ref=ref
window.fdb_set=set
window.fdb_onValue=onValue
window.fdb_get=get

 // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyC2xKZJv104Bpspmt-zWxr32DKXo9oRSzM",
    authDomain: "stemsync.firebaseapp.com",
    databaseURL: "https://stemsync-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "stemsync",
    storageBucket: "stemsync.firebasestorage.app",
    messagingSenderId: "30735336262",
    appId: "1:30735336262:web:0817635d76064195965b47"
  };
  window.firebaseConfig=firebaseConfig;

const app = initializeApp(firebaseConfig);
  window.fdb_app=app;
