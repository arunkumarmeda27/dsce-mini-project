import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dsce-logo.png";

export default function Signup() {

    const navigate = useNavigate();

    const [role, setRole] = useState("student");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [usn, setUsn] = useState("");
    const [branch, setBranch] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ KEEP SAME BRANCH LIST
    const branches = {
        "AI": "Artificial Intelligence and Machine Learning",
        "AE": "Aeronautical Engineering",
        "ABE": "Automobile Engineering",
        "BT": "Biotechnology",
        "CSE": "Computer Science and Engineering",
        "CSBS": "Computer Science and Business Systems",
        "CY": "CSE (Cyber Security)",
        "DS": "CSE (Data Science)",
        "IOT": "CSE (IoT & Cyber Security)",
        "CSD": "Computer Science and Design",
        "CH": "Chemical Engineering",
        "CE": "Civil Engineering",
        "EEE": "Electrical & Electronics Engineering",
        "ECE": "Electronics & Communication Engineering",
        "ISE": "Information Science and Engineering",
        "EIE": "Electronics and Instrumentation Engineering",
        "ME": "Mechanical Engineering",
        "MEE": "Medical Electronics Engineering",
        "ETE": "Electronics and Telecommunication Engineering",
        "RAI": "Robotics and Artificial Intelligence"
    };

    const handleSignup = async () => {

        setMessage("");

        if (!name || !email || !password || !confirmPassword)
            return setMessage("Fill all required fields");

        if (!email.endsWith("@dsce.edu.in"))
            return setMessage("Use DSCE college email only");

        if (!branch)
            return setMessage("Select branch");

        if (role === "student" && !usn)
            return setMessage("USN required");

        if (!phone)
            return setMessage("Phone number required");

        if (password !== confirmPassword)
            return setMessage("Passwords do not match");

        setLoading(true);

        try {

            const res = await fetch("http://127.0.0.1:8000/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                    branch,
                    phone,
                    usn: role === "student" ? usn : null
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.detail || "Signup failed");
                setLoading(false);
                return;
            }

            setMessage("✅ Signup submitted. Await approval");

            setTimeout(() => navigate("/"), 1500);

        } catch {
            setMessage("Server error");
        }

        setLoading(false);
    };

    return (

        <div style={{
            minHeight: "100vh",
            background: "#ffffff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px"
        }}>

            <div style={{
                width: "430px",
                maxHeight: "92vh",
                overflowY: "auto",
                background: "#fff",
                padding: "30px",
                borderRadius: "16px",
                boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
                border: "1px solid #eee"
            }}>

                {/* LOGO */}
                <div style={{ textAlign: "center" }}>
                    <img src={logo} height="55" />
                    <h2 style={{ color: "#1565C0", marginTop: "10px" }}>
                        Create Account
                    </h2>
                    <p style={{ fontSize: "12px", color: "#777" }}>
                        DSCE Mini Project Portal
                    </p>
                </div>

                {/* MESSAGE */}
                {message && (
                    <div style={{
                        marginTop: "10px",
                        padding: "10px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        textAlign: "center",
                        background: message.includes("✅") ? "#E8F5E9" : "#FFEBEE",
                        color: message.includes("✅") ? "#2E7D32" : "#D32F2F"
                    }}>
                        {message}
                    </div>
                )}

                {/* FORM */}
                <div style={{ marginTop: "15px" }}>

                    <Label>Role</Label>
                    <select className="input" value={role}
                        onChange={(e) => setRole(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="guide">Guide</option>
                    </select>

                    <Label>Full Name</Label>
                    <input className="input"
                        placeholder="ex-Arun Kumar Meda"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Label>College Email</Label>
                    <input className="input"
                        placeholder="1ds24is027@dsce.edu.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Label>Branch</Label>
                    <select className="input"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}>
                        <option value="">Select Branch</option>
                        {Object.entries(branches).map(([code, name]) => (
                            <option key={code} value={code}>
                                {code} - {name}
                            </option>
                        ))}
                    </select>

                    {role === "student" && (
                        <>
                            <Label>USN</Label>
                            <input className="input"
                                placeholder="1DS24IS027"
                                value={usn}
                                onChange={(e) => setUsn(e.target.value.toUpperCase())}
                            />
                        </>
                    )}

                    <Label>Phone</Label>
                    <input className="input"
                        placeholder="+91 XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <Label>Password</Label>
                    <input type="password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Label>Confirm Password</Label>
                    <input type="password"
                        className="input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {/* BUTTON */}
                    <button
                        className="btn-primary"
                        style={{
                            width: "100%",
                            marginTop: "15px",
                            padding: "12px",
                            fontSize: "15px"
                        }}
                        onClick={handleSignup}
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "🚀 Create Account"}
                    </button>

                    <button
                        className="btn-accent"
                        style={{ width: "100%", marginTop: "10px" }}
                        onClick={() => navigate("/")}
                    >
                        Back to Login
                    </button>

                </div>

            </div>

        </div>
    );
}

// ===============================
// LABEL COMPONENT
// ===============================
function Label({ children }) {
    return (
        <label style={{
            fontSize: "13px",
            fontWeight: "600",
            marginTop: "10px",
            display: "block"
        }}>
            {children}
        </label>
    );
}