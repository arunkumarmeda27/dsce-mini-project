import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

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
                    await auth.signOut();
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    localStorage.removeItem("name");
                    localStorage.removeItem("uid");
                    setUser(false);
                    setAuthLoading(false);
                    return;
                }

                try {
                    // Always get a fresh token and store it
                    const freshToken = await firebaseUser.getIdToken(true);
                    localStorage.setItem("token", freshToken);
                    setUser(firebaseUser);
                } catch {
                    // Token refresh failed — treat as logged out
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    localStorage.removeItem("name");
                    localStorage.removeItem("uid");
                    setUser(false);
                }
            } else {
                // No active Firebase session — clear stale data
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("name");
                localStorage.removeItem("uid");
                setUser(false);
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, authLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
