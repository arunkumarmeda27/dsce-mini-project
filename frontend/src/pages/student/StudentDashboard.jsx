import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import StatusTimeline from "../../components/StatusTimeline";
import Preloader from "../../components/Preloader";
import Toast from "../../components/Toast";
import { getFreshToken } from "../../utils/getToken";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function StudentDashboard() {

    const [currentUser, setCurrentUser] = useState(null);
    const [myGroup, setMyGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState("");
    const [toast, setToast] = useState(null);
    const [activeAlerts, setActiveAlerts] = useState([]);

    const getToken = getFreshToken;

    useEffect(() => {
        fetchStudentData();
        const uid = localStorage.getItem("uid");
        if (uid) {
            checkNotifications(uid);
        }
    }, []);

    // =========================
    // CHECK ALERTS
    // =========================
    const checkNotifications = async (uid) => {
        try {
            const q1 = query(collection(db, "notifications"), where("userId", "==", uid));
            const q2 = query(collection(db, "notifications"), where("users", "array-contains", uid));
            
            const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
            const notifs = [...s1.docs, ...s2.docs].map(d => d.data());
            
            // Remove duplicates by ID if any logic overlaps
            const uniqueNotifs = Array.from(new Set(notifs.map(n => JSON.stringify(n)))).map(n => JSON.parse(n));

            if (uniqueNotifs.length > 0) {
                // Set the notifications to display in the gorgeous themed modal
                setActiveAlerts(uniqueNotifs);
            }
        } catch (err) {
            console.error("Failed to fetch alerts:", err);
        }
    };

    // =========================
    // FETCH DATA
    // =========================
    const fetchStudentData = async () => {

        try {

            const token = await getToken();

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
                    Authorization: `Bearer ${await getToken()}`
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

            {/* BEAUTIFUL CUSTOM THEMED NOTIFICATION ALERT MODAL */}
            {activeAlerts.length > 0 && (
                <NotificationModal
                    notifications={activeAlerts}
                    onClose={() => setActiveAlerts([])}
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


// ===============================
// NOTIFICATION MODAL COMPONENT
// ===============================
function NotificationModal({ notifications, onClose }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(11, 61, 145, 0.45)", // brand overlay
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
            animation: "alertFadeIn 0.25s ease-out forwards"
        }}>
            <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                width: "480px",
                maxWidth: "90%",
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 24px 60px rgba(11, 61, 145, 0.3)",
                border: "1px solid rgba(11, 61, 145, 0.1)",
                overflow: "hidden",
                animation: "alertSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            }}>
                {/* Header */}
                <div style={{
                    background: "linear-gradient(135deg, #0B3D91 0%, #1565C0 100%)",
                    padding: "20px 24px",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    position: "relative"
                }}>
                    <div style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "50%",
                        width: "42px",
                        height: "42px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "22px",
                        animation: "pulseBell 2s infinite"
                    }}>
                        🔔
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", letterSpacing: "0.5px", color: "white" }}>
                            New Notifications
                        </h3>
                        <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "2px" }}>
                            You have {notifications.length} new {notifications.length === 1 ? 'notification' : 'notifications'}
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            right: "20px",
                            top: "20px",
                            background: "transparent",
                            border: "none",
                            color: "white",
                            fontSize: "20px",
                            cursor: "pointer",
                            opacity: 0.8,
                            transition: "all 0.2s ease",
                            lineHeight: 1
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = 1}
                        onMouseLeave={(e) => e.target.style.opacity = 0.8}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    padding: "20px 24px",
                    overflowY: "auto",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    background: "#F8FAFC"
                }}>
                    {notifications.map((n, index) => (
                        <div 
                            key={index} 
                            style={{
                                background: "#ffffff",
                                padding: "16px",
                                borderRadius: "12px",
                                borderLeft: "5px solid #1565C0",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                                transition: "all 0.2s ease",
                                cursor: "default"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
                            }}
                        >
                            <h4 style={{
                                color: "#0B3D91",
                                margin: "0 0 8px 0",
                                fontSize: "15px",
                                fontWeight: "600"
                            }}>
                                {n.title || "Notification"}
                            </h4>
                            <div 
                                style={{
                                    color: "#4A5568",
                                    fontSize: "13.5px",
                                    lineHeight: "1.6"
                                }}
                                dangerouslySetInnerHTML={{ __html: n.message }}
                            />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{
                    padding: "16px 24px",
                    borderTop: "1px solid #E2E8F0",
                    background: "#ffffff",
                    display: "flex",
                    justifyContent: "flex-end"
                }}>
                    <button
                        className="btn-primary"
                        onClick={onClose}
                        style={{
                            padding: "10px 24px",
                            fontWeight: "600",
                            borderRadius: "8px",
                            fontSize: "14px",
                            boxShadow: "0 4px 12px rgba(11, 61, 145, 0.2)",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
                        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                    >
                        Got It, Thanks!
                    </button>
                </div>
            </div>
        </div>
    );
}
