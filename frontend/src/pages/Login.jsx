import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {

        try {

            // 1️⃣ Firebase Login
            const userCredential =
                await signInWithEmailAndPassword(auth, email, password);

            const token =
                await userCredential.user.getIdToken();

            localStorage.setItem("token", token);

            // 2️⃣ Fetch user data from backend
            const res = await fetch("http://127.0.0.1:8000/user-profile", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const userData = await res.json();

            if (!res.ok) {
                alert(userData.detail || "Login error");
                return;
            }

            // 3️⃣ Check approval
            if (!userData.approved) {
                alert("Admin approval required");
                return;
            }

            // 4️⃣ Navigate based on role
            if (userData.role === "admin") {
                navigate("/admin");
                return;
            }

            if (userData.role === "guide") {
                navigate("/guide");
                return;
            }

            navigate("/student");

        } catch (error) {

            alert("Invalid email or password");

        }

    };

    return (

        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#F4F6F9"
            }}
        >

            <div
                className="card"
                style={{
                    width: "380px",
                    textAlign: "center"
                }}
            >

                <img
                    src="/src/assets/dsce-logo.png"
                    alt="DSCE Logo"
                    style={{
                        height: "60px",
                        marginBottom: "10px"
                    }}
                />

                <h2 style={{ color: "#0B3D91" }}>
                    Mini Project Portal
                </h2>

                <p style={{ fontSize: "14px", color: "gray" }}>
                    Dayananda Sagar College of Engineering
                </p>

                <input
                    type="email"
                    placeholder="College Email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="btn-primary"
                    style={{ width: "100%", marginTop: "15px" }}
                    onClick={login}
                >
                    Login
                </button>

                <button
                    className="btn-accent"
                    style={{ width: "100%", marginTop: "10px" }}
                    onClick={() => navigate("/signup")}
                >
                    Signup
                </button>

            </div>

        </div>

    );
}