import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    serverTimestamp
} from "firebase/firestore";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {

    const [currentUser, setCurrentUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [notifications, setNotifications] = useState([]);

    // Load user from localStorage (after login)
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setCurrentUser(user);
            fetchGroups(user);
            fetchNotifications(user.uid);
        }
    }, []);

    // Fetch groups
    const fetchGroups = async (user) => {

        const q = query(
            collection(db, "groups"),
            where("branch", "==", user.branch)
        );

        const snapshot = await getDocs(q);

        const list = [];

        snapshot.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() });
        });

        setGroups(list);
    };

    // Create Group
    const createGroup = async (projectName, domain, selectedMembers) => {

        if (selectedMembers.length !== 3) {
            alert("Group must be 4 members");
            return;
        }

        await addDoc(collection(db, "groups"), {
            projectName,
            domain,
            branch: currentUser.branch,
            joiningYear: currentUser.joiningYear,
            leaderId: currentUser.uid,
            members: [currentUser.uid, ...selectedMembers],
            guideId: null,
            guideName: null,
            status: "CREATED",
            createdAt: serverTimestamp()
        });

        alert("Group created");

        fetchGroups(currentUser);
    };

    // Assign Guide
    const assignGuide = async (groupId, guide) => {

        const groupRef = doc(db, "groups", groupId);

        await updateDoc(groupRef, {
            guideName: guide,
            status: "GUIDE_PENDING"
        });

        fetchGroups(currentUser);
    };

    // Guide Decision
    const guideDecision = async (groupId, decision) => {

        const groupRef = doc(db, "groups", groupId);

        await updateDoc(groupRef, {
            status: decision
        });

        const group = groups.find(g => g.id === groupId);

        await addDoc(collection(db, "notifications"), {
            toUserId: group.leaderId,
            message:
                decision === "GUIDE_ACCEPTED"
                    ? "Guide accepted your project"
                    : "Guide rejected your project",
            read: false,
            createdAt: serverTimestamp()
        });

        fetchGroups(currentUser);
    };

    // Fetch notifications
    const fetchNotifications = async (uid) => {

        const q = query(
            collection(db, "notifications"),
            where("toUserId", "==", uid)
        );

        const snapshot = await getDocs(q);

        const list = [];

        snapshot.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() });
        });

        setNotifications(list);
    };

    return (
        <AppContext.Provider
            value={{
                currentUser,
                groups,
                notifications,
                createGroup,
                assignGuide,
                guideDecision
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
