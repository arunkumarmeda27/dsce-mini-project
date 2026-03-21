import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function CompleteProfile() {

    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [role, setRole] = useState("");
    const [branch, setBranch] = useState("");
    const [usn, setUsn] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    // ===============================
    // 🔥 TOKEN CHECK (CRITICAL FIX)
    // ===============================
    useEffect(() => {

        if (!token) {
            console.log("❌ No token → redirecting to login");
            navigate("/");
        } else {
            console.log("✅ Token found");
        }

    }, []);

    // ===============================
    // BRANCH LIST
    // ===============================
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

    const totalSteps = role === "student" ? 5 : 4;
    const progress = (step / totalSteps) * 100;

    // ===============================
    // NEXT STEP
    // ===============================
    const next = () => {

        if (step === 1 && !role)
            return setMessage("Select role");

        if (step === 2 && !branch)
            return setMessage("Select branch");

        if (step === 3 && role === "student" && !usn)
            return setMessage("Enter USN");

        if (((role === "student" && step === 4) || (role === "guide" && step === 3)) && !phone)
            return setMessage("Enter contact number");

        setMessage("");
        setStep(step + 1);
    };

    const back = () => setStep(step - 1);

    // ===============================
    // SUBMIT
    // ===============================
    const submit = async () => {

        try {

            setLoading(true);

            console.log("Submitting profile:", {
                role, branch, usn, phone
            });

            const res = await fetch(`${BASE_URL}/users/complete-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    role,
                    branch,
                    usn,
                    phone
                })
            });

            const data = await res.json();

            if (!res.ok)
                return setMessage(data.detail || "Error submitting");

            setMessage("✅ Profile submitted! Awaiting admin approval...");

            // 🔥 CRITICAL: Sign out & clear token so PublicRoute shows login page
            setTimeout(async () => {
                await signOut(auth);
                localStorage.removeItem("token");
                localStorage.removeItem("name");
                localStorage.removeItem("uid");
                navigate("/");
            }, 1800);

        } catch (err) {
            console.error(err);
            setMessage("Server error");
        }

        setLoading(false);
    };

    return (

        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#ffffff"
        }}>

            <div style={{
                width: "450px",
                padding: "30px",
                borderRadius: "16px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                border: "1px solid #eee"
            }}>

                {/* HEADER */}
                <h2 style={{ textAlign: "center", color: "#1565C0" }}>
                    🎓 Complete Profile
                </h2>

                <p style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#777"
                }}>
                    DSCE ERP Onboarding System
                </p>

                {/* PROGRESS BAR */}
                <div style={{
                    height: "8px",
                    background: "#eee",
                    borderRadius: "10px",
                    margin: "15px 0"
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: "#1565C0",
                        borderRadius: "10px",
                        transition: "0.3s"
                    }} />
                </div>

                <p style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#777"
                }}>
                    Step {step} of {totalSteps}
                </p>

                {/* MESSAGE */}
                {message && (
                    <p style={{
                        textAlign: "center",
                        color: message.includes("✅") ? "green" : "red",
                        fontSize: "13px"
                    }}>
                        {message}
                    </p>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                    <>
                        <label>Select Role</label>

                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                            <button
                                className="btn-primary"
                                style={{ flex: 1, opacity: role === "student" ? 1 : 0.6 }}
                                onClick={() => setRole("student")}
                            >
                                🎓 Student
                            </button>

                            <button
                                className="btn-accent"
                                style={{ flex: 1, opacity: role === "guide" ? 1 : 0.6 }}
                                onClick={() => setRole("guide")}
                            >
                                👨‍🏫 Guide
                            </button>
                        </div>
                    </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <>
                        <label>Select Branch</label>

                        <select
                            className="input"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                        >
                            <option value="">Select Branch</option>

                            {Object.entries(branches).map(([code, name]) => (
                                <option key={code} value={code}>
                                    {code} - {name}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                {/* STEP 3 (STUDENT) */}
                {step === 3 && role === "student" && (
                    <>
                        <label>Enter USN</label>

                        <input
                            className="input"
                            placeholder="1DS24IS027"
                            value={usn}
                            onChange={(e) => setUsn(e.target.value.toUpperCase())}
                        />
                    </>
                )}

                {/* PHONE */}
                {((role === "student" && step === 4) || (role === "guide" && step === 3)) && (
                    <>
                        <label>Contact Number</label>

                        <input
                            className="input"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </>
                )}

                {/* FINAL */}
                {step === totalSteps && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <h3 style={{ color: "#2E7D32" }}>Ready to Submit 🚀</h3>
                    </div>
                )}

                {/* BUTTONS */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px"
                }}>

                    {step > 1 && (
                        <button className="btn-accent" onClick={back}>
                            Back
                        </button>
                    )}

                    {step < totalSteps ? (
                        <button className="btn-primary" onClick={next}>
                            Next →
                        </button>
                    ) : (
                        <button className="btn-primary" onClick={submit} disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
