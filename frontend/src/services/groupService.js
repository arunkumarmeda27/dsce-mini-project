import {
    collection,
    doc,
    setDoc,
    getDoc
} from "firebase/firestore";

import { db } from "../firebase/config";


// LOCK STUDENT
export async function lockStudent(usn) {

    await setDoc(doc(db, "locks", usn), {

        locked: true,
        time: Date.now()

    });

}


// CHECK LOCK
export async function isLocked(usn) {

    const docSnap =
        await getDoc(doc(db, "locks", usn));

    if (!docSnap.exists())
        return false;

    const data = docSnap.data();

    if (Date.now() - data.time > 300000) {

        return false;

    }

    return true;

}


// CREATE GROUP
export async function createGroup(groupData) {

    await setDoc(doc(collection(db, "groups")), groupData);

}
