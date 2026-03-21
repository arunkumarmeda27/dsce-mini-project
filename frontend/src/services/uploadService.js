import {
    ref,
    uploadBytes
} from "firebase/storage";

import { storage } from "../firebase/config";

export async function uploadFile(file, groupId) {

    const storageRef =
        ref(storage, `projects/${groupId}/${file.name}`);

    await uploadBytes(storageRef, file);

}
