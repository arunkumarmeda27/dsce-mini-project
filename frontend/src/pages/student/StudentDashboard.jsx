import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import StatusTimeline from "../../components/StatusTimeline";
import Preloader from "../../components/Preloader";
import Toast from "../../components/Toast";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function StudentDashboard() {

    const [currentUser, setCurrentUser] = useState(null);
    const [myGroup, setMyGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState("");
    const [toast, setToast] = useState(null);

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        fetchStudentData();
    }, []);

    // =========================
    // FETCH DATA
    // =========================
    const fetchStudentData = async () => {

        try {

            const token = getToken();

            const profileRes = await fetch(`${BASE_URL}/users/user-profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setCurrentUser(profileData);
            }

            const groupRes = await fetch(`${BASE_URL}/groups/my-group`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (groupRes.ok) {
                const groupData = await groupRes.json();
                if (groupData?.groupId) setMyGroup(groupData);
            }

        } catch {
            setToast({ message: "Failed to load dashboard", type: "error" });
        }

        setLoading(false);
    };

    // =========================
    // PASSWORD RESET
    // =========================
    const resetPassword = async () => {

        if (newPassword.length < 6) {
            return setToast({
                message: "Password must be at least 6 characters",
                type: "error"
            });
        }

        try {

            const res = await fetch(`${BASE_URL}/users/reset-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({ newPassword })
            });

            const data = await res.json();

            if (!res.ok)
                return setToast({ message: data.detail, type: "error" });

            setToast({ message: "Password updated successfully", type: "success" });
            setNewPassword("");

        } catch {
            setToast({ message: "Server error", type: "error" });
        }
    };

    if (loading) return <Preloader />;

    return (

        <div>

            <Header />
            <Sidebar role="student" />

            <div className="main">

                {/* ===== TOP GRID ===== */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                    gap: "20px"
                }}>

                    {/* PROFILE CARD */}
                    <div style={cardStyle}>
                        <h3 style={titleStyle}>👤 Profile</h3>

                        {currentUser && (
                            <div style={{ marginTop: "12px", lineHeight: "1.8" }}>
                                <p><strong>Name:</strong> {currentUser.name}</p>
                                <p><strong>Email:</strong> {currentUser.email}</p>
                                <p><strong>USN:</strong> {currentUser.usn}</p>
                                <p><strong>Branch:</strong> {currentUser.branch}</p>
                            </div>
                        )}
                    </div>

                    {/* PASSWORD CARD */}
                    <div style={cardStyle}>
                        <h3 style={titleStyle}>🔐 Change Password</h3>

                        <div style={{ marginTop: "12px" }}>

                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input"
                                style={{ marginBottom: "12px" }}
                            />

                            <button
                                className="btn-primary"
                                style={{ width: "100%" }}
                                onClick={resetPassword}
                            >
                                Update Password
                            </button>

                        </div>
                    </div>

                </div>

                {/* ===== GROUP CARD ===== */}
                <div style={{ ...cardStyle, marginTop: "25px" }}>

                    <h3 style={titleStyle}>📊 Project Overview</h3>

                    {!myGroup ? (

                        <p style={{ marginTop: "10px", color: "gray" }}>
                            No group created yet
                        </p>

                    ) : (

                        <>

                            {/* INFO GRID */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                                gap: "15px",
                                marginTop: "15px"
                            }}>
                                <Info label="Project Name" value={myGroup.projectName} />
                                <Info label="Group ID" value={myGroup.groupId} />
                                <Info label="Domain" value={myGroup.domain} />
                                <Info label="Status" value={myGroup.status?.replace(/_/g, " ")} />
                            </div>

                            {/* MEMBERS */}
                            <h4 style={{ marginTop: "20px" }}>👥 Members</h4>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                                gap: "10px",
                                marginTop: "10px"
                            }}>
                                {myGroup.members?.map(m => (
                                    <div key={m.uid} style={{
                                        ...memberCard,
                                        border: m.uid === myGroup.leaderId
                                            ? "2px solid #1565C0"
                                            : "2px solid transparent"
                                    }}>
                                        {m.uid === myGroup.leaderId && (
                                            <div style={{ fontSize: "11px", color: "#1565C0", fontWeight: "700", marginBottom: "4px" }}>
                                                👑 Leader
                                            </div>
                                        )}
                                        <div>{m.name}</div>
                                        <span style={{ fontSize: "12px", color: "gray" }}>{m.usn || "N/A"}</span>
                                    </div>
                                ))}
                            </div>

                            {/* GUIDE */}
                            <h4 style={{ marginTop: "20px" }}>🎓 Guide</h4>
                            <div style={{
                                marginTop: "10px",
                                padding: "14px 16px",
                                background: myGroup.guideId ? "#F0F7FF" : "#FFF8E1",
                                borderRadius: "10px",
                                borderLeft: `4px solid ${myGroup.guideId ? "#1565C0" : "#FFA000"}`,
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                            }}>
                                <span style={{ fontSize: "20px" }}>{myGroup.guideId ? "✅" : "⏳"}</span>
                                <div>
                                    <div style={{ fontWeight: "600", color: myGroup.guideId ? "#1565C0" : "#F57C00" }}>
                                        {myGroup.guideName || "Not Assigned Yet"}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#777", marginTop: "2px" }}>
                                        {myGroup.guideId
                                            ? (myGroup.status === "GUIDE_ACCEPTED"
                                                ? "Guide has accepted your group ✅"
                                                : myGroup.status === "GUIDE_REJECTED"
                                                    ? "Guide rejected — awaiting reassignment"
                                                    : "Guide assigned — awaiting acceptance")
                                            : "Admin will assign a guide soon"}
                                    </div>
                                </div>
                            </div>

                            {/* STATUS TIMELINE */}
                            <div style={{ marginTop: "20px" }}>
                                <StatusTimeline status={myGroup.status} />
                            </div>

                        </>

                    )}

                </div>

            </div>

            {/* TOAST */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

        </div>
    );
}


// ===============================
// STYLES
// ===============================
const cardStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 6px 25px rgba(0,0,0,0.06)",
    border: "1px solid #eee"
};

const titleStyle = {
    color: "#1565C0",
    fontWeight: "600"
};

const memberCard = {
    padding: "10px",
    background: "#F5F9FF",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "500"
};


// ===============================
// INFO COMPONENT
// ===============================
function Info({ label, value }) {
    return (
        <div style={{
            background: "#F5F9FF",
            padding: "12px",
            borderRadius: "10px",
            borderLeft: "4px solid #1565C0"
        }}>
            <div style={{ fontSize: "12px", color: "#777" }}>{label}</div>
            <div style={{ fontWeight: "600" }}>{value}</div>
        </div>
    );
}
