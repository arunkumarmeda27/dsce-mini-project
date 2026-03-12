import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updatePassword
} from "firebase/auth";

import {
    doc,
    setDoc,
    getDoc
} from "firebase/firestore";

import { auth, db } from "../firebase/config";


// SIGNUP
export async function signup(userData) {

    const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userData.password
        );

    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {

        uid: uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        usn: userData.usn,
        branch: userData.branch,
        approved: false,
        createdAt: new Date()

    });

    return uid;

}


// LOGIN
export async function login(email, password) {

    const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    const uid = userCredential.user.uid;

    const docSnap =
        await getDoc(doc(db, "users", uid));

    if (!docSnap.data().approved) {

        throw new Error("Admin approval required");

    }

    return docSnap.data();

}


// CHANGE PASSWORD
export async function changePassword(newPassword) {

    await updatePassword(auth.currentUser, newPassword);

}