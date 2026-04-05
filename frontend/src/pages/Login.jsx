import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "firebase/auth";
import { auth } from "../firebase/config";
import logo from "../assets/dsce-logo.png";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [message, setMessage] = useState("");

    const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    // =========================
    // HANDLE USER FLOW
    // =========================
    const handleUserRouting = async (token) => {

        const res = await fetch(`${BASE_URL}/users/user-profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 🔥 NEW USER
        if (res.status === 404) {

            await fetch(`${BASE_URL}/users/google-register`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate("/complete-profile");
            return;
        }

        const data = await res.json();

        console.log("User Data:", data);

        // 🔥 FORCE PROFILE PAGE ALWAYS FIRST
        if (!data.role) {
            navigate("/complete-profile");
            return;
        }

        // 🔥 EVEN IF ROLE EXISTS → STILL ALLOW EDIT (IMPORTANT FIX)
        if (!data.usn && data.role === "student") {
            navigate("/complete-profile");
            return;
        }

        // 🔥 NOT APPROVED → BLOCK ON LOGIN PAGE
        if (!data.approved) {
            localStorage.removeItem("token"); // Clear token so ProtectedRoute blocks them
            setMessage("⏳ Your account is pending admin approval. Please wait.");
            return;
        }

        // ✅ SUCCESS LOGIN
        localStorage.setItem("name", data.name);
        localStorage.setItem("uid", data.uid);
        localStorage.setItem("role", data.role);

        if (data.role === "admin") navigate("/admin");
        else if (data.role === "guide") navigate("/guide");
        else navigate("/student");
    };

    // =========================
    // EMAIL LOGIN
    // =========================
    const login = async () => {

        setMessage("");

        if (!email || !password)
            return setMessage("Enter email and password");

        if (!email.endsWith("@dsce.edu.in"))
            return setMessage("Use DSCE email only");

        setLoading(true);

        try {

            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            // Force-refresh to always get a valid token
            const token = await userCredential.user.getIdToken(true);
            localStorage.setItem("token", token);

            await handleUserRouting(token);

        } catch {
            setMessage("Login failed");
        }

        setLoading(false);
    };

    const googleLogin = async () => {

        if (googleLoading) return; // Prevent double-click
        setGoogleLoading(true);
        setMessage("");

        const provider = new GoogleAuthProvider();

        provider.setCustomParameters({
            prompt: "select_account"
        });

        try {

            const result = await signInWithPopup(auth, provider);

            const user = result.user;
            const email = user.email;

            // 🚫 DOMAIN CHECK
            if (!email.endsWith("@dsce.edu.in")) {
                await signOut(auth);
                setMessage("Use DSCE college email only");
                return;
            }

            // Force-refresh to always get a valid token
            const token = await user.getIdToken(true);
            localStorage.setItem("token", token);

            await handleUserRouting(token);

        } catch (err) {
            // Ignore harmless double-click cancellation
            if (err.code !== "auth/cancelled-popup-request") {
                console.error(err);
                if (err.code === "auth/popup-blocked") {
                    setMessage("Popup was blocked. Please allow popups for this site.");
                } else if (err.code === "auth/popup-closed-by-user") {
                    setMessage("Sign-in cancelled.");
                } else {
                    setMessage("Google login failed. Try again.");
                }
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    // =========================
    // RESET PASSWORD
    // =========================
    const resetPassword = async () => {

        if (!email)
            return setMessage("Enter email first");

        if (!email.endsWith("@dsce.edu.in"))
            return setMessage("Use DSCE email");

        try {
            await sendPasswordResetEmail(auth, email.trim());
            setMessage("✅ Reset email sent");
        } catch {
            setMessage("Failed to send reset email");
        }
    };

    return (

        <div style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#ffffff"
        }}>

            <div style={{
                width: "100%",
                maxWidth: "380px",
                padding: "30px",
                borderRadius: "12px",
                border: "1px solid #eee",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                textAlign: "center"
            }}>

                <img src={logo} height="55" />

                <h2 style={{ marginTop: "10px", color: "#1565C0" }}>
                    DSCE Portal
                </h2>

                {message && (
                    <p style={{
                        color: message.includes("✅") ? "green" : "red",
                        fontSize: "13px"
                    }}>
                        {message}
                    </p>
                )}

                <input
                    className="input"
                    placeholder="College Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    className="input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="btn-primary"
                    style={{ width: "100%", marginTop: "10px" }}
                    onClick={login}
                >
                    {loading ? "Loading..." : "Login"}
                </button>

                <div style={{ margin: "15px 0", fontSize: "12px", color: "#888" }}>
                    -------- OR --------
                </div>

                <button
                    onClick={googleLogin}
                    disabled={googleLoading}
                    style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        background: "#fff",
                        cursor: googleLoading ? "not-allowed" : "pointer",
                        opacity: googleLoading ? 0.7 : 1
                    }}
                >
                    {googleLoading ? "Signing in..." : "🔵 Continue with Google"}
                </button>

                <button
                    className="btn-accent"
                    style={{ width: "100%", marginTop: "10px" }}
                    onClick={() => navigate("/signup")}
                >
                    Create Account
                </button>

                <button
                    style={{
                        marginTop: "10px",
                        background: "none",
                        border: "none",
                        color: "#1565C0",
                        cursor: "pointer"
                    }}
                    onClick={resetPassword}
                >
                    Forgot Password?
                </button>

            </div>

        </div>
    );
}
