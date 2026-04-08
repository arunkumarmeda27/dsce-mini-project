import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // null = still loading, false = not logged in, object = logged in user
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {

                // 🚫 STRICT DOMAIN CHECK
                const email = firebaseUser.email || "";
                if (!email.endsWith("@dsce.edu.in")) {
                    console.warn("🚫 Non-college email detected. Signing out...");
                    const { signOut } = await import("firebase/auth");
                    await signOut(auth);
                    clearSession();
                    setUser(false);
                    setAuthLoading(false);
                    return;
                }

                try {
                    // 🔑 Always get a fresh token
                    const freshToken = await firebaseUser.getIdToken(true);
                    localStorage.setItem("token", freshToken);

                    // 🛠️ FETCH USER PROFILE FROM FIRESTORE
                    const userRef = doc(db, "users", firebaseUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        
                        // 🔥 Merge Firebase Auth user with Firestore Profile
                        setUser({
                            ...firebaseUser,
                            role: userData.role,
                            dbName: userData.name,
                            approved: userData.approved,
                            branch: userData.branch
                        });

                        // Keep localStorage as fallback/cache (not source of truth anymore)
                        localStorage.setItem("role", userData.role || "");
                        localStorage.setItem("name", userData.name || "");
                        localStorage.setItem("uid", firebaseUser.uid);

                    } else {
                        // User exists in Auth but not in DB -> Needs profile completion
                        setUser({ 
                            ...firebaseUser, 
                            role: null, 
                            needsProfile: true 
                        });
                    }

                } catch (error) {
                    console.error("Auth Error:", error);
                    clearSession();
                    setUser(false);
                }
            } else {
                clearSession();
                setUser(false);
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const clearSession = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("uid");
    };

    const refreshAuth = async () => {
        if (!auth.currentUser) return;
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                setUser({
                    ...auth.currentUser,
                    role: userData.role,
                    dbName: userData.name,
                    approved: userData.approved,
                    branch: userData.branch
                });
            }
        } catch (error) {
            console.error("Refresh Auth error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, authLoading, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
