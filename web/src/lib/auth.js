import { ref } from "vue";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

export const currentUser = ref(null);

// Resolves once Firebase has restored the session (used by the router guard)
export const authReady = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    resolve();
  });
});

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const getIdToken = async () => (auth.currentUser ? auth.currentUser.getIdToken() : null);
