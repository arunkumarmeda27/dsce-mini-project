import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

    const handleSignup = async () => {

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (!email.endsWith("@dsce.edu.in")) {
            alert("Use valid DSCE email");
            return;
        }

        if (!branch) {
            alert("Please select branch");
            return;
        }

        if (role === "student" && !usn) {
            alert("USN required for students");
            return;
        }

        if (!phone) {
            alert("Phone number required");
            return;
        }

        try {

            const res = await fetch("http://127.0.0.1:8000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
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
                alert(data.detail || "Signup failed");
                return;
            }

            alert("Signup request submitted. Wait for admin approval.");
            navigate("/");

        } catch (err) {

            console.error(err);
            alert("Server error");

        }

    };

    return (

        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            background: "#F4F6F9"
        }}>

            <div className="card" style={{ width: "450px" }}>

                <h2 style={{ textAlign: "center", color: "#0B3D91" }}>
                    Signup Portal
                </h2>

                <label>Select Role</label>
                <select
                    className="input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="student">Student</option>
                    <option value="guide">Guide</option>
                </select>

                <label>Full Name</label>
                <input
                    className="input"
                    placeholder="Example: MEDA"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <label>College Email</label>
                <input
                    className="input"
                    placeholder="1ds24iso27@dsce.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>Select Branch</label>
                <select
                    className="input"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                >

                    <option value="">Select Branch</option>

                    <option value="AIML">Artificial Intelligence & Machine Learning</option>
                    <option value="AERO">Aeronautical Engineering</option>
                    <option value="AUTO">Automobile Engineering</option>
                    <option value="BT">Biotechnology</option>
                    <option value="CH">Chemical Engineering</option>
                    <option value="CE">Civil Engineering</option>
                    <option value="CSE">Computer Science and Engineering</option>
                    <option value="CSECYBER">CSE (Cyber Security)</option>
                    <option value="CSEDS">CSE (Data Science)</option>
                    <option value="CSEIOCYBER">CSE (IoT & Cyber Security)</option>
                    <option value="CSD">Computer Science and Design</option>
                    <option value="EEE">Electrical & Electronics Engineering</option>
                    <option value="ECE">Electronics & Communication Engineering</option>
                    <option value="ISE">Information Science and Engineering</option>
                    <option value="EIE">Electronics & Instrumentation Engineering</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="MEE">Medical Electronics Engineering</option>
                    <option value="ETE">Electronics & Telecommunication Engineering</option>
                    <option value="RA">Robotics and Artificial Intelligence</option>

                </select>

                {role === "student" && (
                    <>
                        <label>USN</label>
                        <input
                            className="input"
                            placeholder="Example: 1DS24IS027"
                            value={usn}
                            onChange={(e) => setUsn(e.target.value.toUpperCase())}
                        />
                    </>
                )}

                <label>Phone</label>
                <input
                    className="input"
                    placeholder="Example:+91 (your no.)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <label>Password</label>
                <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label>Confirm Password</label>
                <input
                    type="password"
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                    className="btn-primary"
                    style={{ width: "100%", marginTop: "15px" }}
                    onClick={handleSignup}
                >
                    Submit Signup Request
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

    );

}