import { db } from "../firebase/config";
import { doc, updateDoc } from "firebase/firestore";

export async function approveUser(uid) {

    await updateDoc(doc(db, "users", uid), {

        approved: true

    });

}
