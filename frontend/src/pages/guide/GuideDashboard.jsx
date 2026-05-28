import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Preloader from "../../components/Preloader";
import Toast from "../../components/Toast";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function GuideDashboard() {

    const navigate = useNavigate();

    const [guideInfo, setGuideInfo] = useState(null);
    const [groups, setGroups] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState("");
    const [researchAreaInput, setResearchAreaInput] = useState("");
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {

        try {

            const profile = await api.getUserProfile();
            setGuideInfo(profile);
            setResearchAreaInput(profile.researchArea || "");

            const guideGroups = await api.getGuideGroups();
            setGroups(guideGroups || []);

            const submissionData = await api.getGuideSubmissions();
            setSubmissions(submissionData || []);

        } catch {
            setToast({ message: "Failed to load data", type: "error" });
        }

        setLoading(false);
    };

    // ======================
    // RESEARCH AREA
    // ======================
    const updateResearchArea = async () => {
        try {
            await api.updateResearchArea(researchAreaInput.trim());
            setToast({ message: "Research area updated successfully", type: "success" });
            loadDashboard();
        } catch (err) {
            setToast({ message: err.message || "Failed to update research area", type: "error" });
        }
    };

    // ======================
    // EXPORT
    // ======================
    const downloadFile = async (type) => {

        try {

            const token = localStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/groups/export/${type}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `Guide_Report.${type === "excel" ? "xlsx" : "pdf"}`;
            a.click();

        } catch {
            setToast({ message: "Export failed", type: "error" });
        }
    };

    // ======================
    // PASSWORD
    // ======================
    const resetPassword = async () => {

        if (newPassword.length < 6)
            return setToast({ message: "Min 6 characters", type: "error" });

        try {
            await api.resetPassword(newPassword);
            setToast({ message: "Password updated", type: "success" });
            setNewPassword("");
        } catch {
            setToast({ message: "Failed", type: "error" });
        }
    };

    // ======================
    // ACCEPT / REJECT
    // ======================
    const handleDecision = async (groupId, decision) => {

        try {
            await api.guideDecision(groupId, decision);
            setToast({ message: `Group ${decision}`, type: "success" });
            loadDashboard();
        } catch {
            setToast({ message: "Action failed", type: "error" });
        }
    };

    // ======================
    // NOTIFY STUDENTS
    // ======================
    const handleNotifyGuide = async (groupId) => {
        const message = window.prompt("Enter notification message for this group's students:");
        if (!message || message.trim() === "") return;

        try {
            await api.sendGuideNotification(groupId, message.trim());
            setToast({ message: "Notification sent tracking", type: "success" });
        } catch {
            setToast({ message: "Failed to send notification", type: "error" });
        }
    };

    if (loading) return <Preloader />;

    return (

        <div>

            <Header />
            <Sidebar role="guide" />

            <div className="main">

                {/* HEADER */}
                <div style={card}>
                    <h2 style={{ color: "#1565C0" }}>Guide Dashboard</h2>

                    <p><b>{guideInfo?.name}</b></p>
                    <p>{guideInfo?.email}</p>
                    <p>{guideInfo?.branch}</p>
                    <div style={{ marginTop: "8px", fontSize: "15px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <b>Research Area:</b>{" "}
                        {guideInfo?.researchArea ? (
                            guideInfo.researchArea.split(",").map((area, idx) => (
                                <span key={idx} style={{ color: "#1565C0", fontWeight: "600", background: "#E3F2FD", padding: "4px 10px", borderRadius: "6px" }}>
                                    {area.trim()}
                                </span>
                            ))
                        ) : (
                            <span style={{ color: "#777", background: "#f5f5f5", padding: "4px 10px", borderRadius: "6px" }}>
                                Not specified yet
                            </span>
                        )}
                    </div>

                    {/* EXPORT BUTTONS */}
                    <div style={{ marginTop: "10px" }}>
                        <button className="btn-primary"
                            onClick={() => downloadFile("excel")}>
                            Export Excel
                        </button>

                        <button className="btn-accent"
                            style={{ marginLeft: "10px" }}
                            onClick={() => downloadFile("pdf")}>
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* RESEARCH AREA */}
                <div style={card}>
                    <h3 style={{ color: "#1565C0", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 10px 0" }}>
                        🔬 Research Area
                    </h3>
                    <p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px 0", lineHeight: "1.5" }}>
                        Specify your research domains (e.g. IoT, AI/ML, Web Development, Cyber Security). 
                        Student groups will be automatically allocated to you based on these topics.
                    </p>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                            type="text"
                            className="input"
                            style={{ margin: 0, flex: 1, maxWidth: "400px" }}
                            placeholder="e.g. IoT, AI/ML, Blockchain"
                            value={researchAreaInput}
                            onChange={(e) => setResearchAreaInput(e.target.value)}
                        />
                        <button 
                            className="btn-primary"
                            style={{ padding: "10px 20px" }}
                            onClick={updateResearchArea}
                        >
                            Save Area
                        </button>
                    </div>
                </div>

                {/* STATS */}
                <div style={grid}>
                    <Stat title="Total Groups" value={groups.length} />
                    <Stat title="Accepted" value={groups.filter(g => g.status === "GUIDE_ACCEPTED").length} />
                    <Stat title="Pending" value={groups.filter(g => g.status === "GUIDE_ASSIGNED").length} />
                </div>

                {/* PASSWORD */}
                <div style={card}>
                    <h3>🔐 Change Password</h3>

                    <input
                        type="password"
                        className="input"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <button className="btn-primary"
                        style={{ marginTop: "10px" }}
                        onClick={resetPassword}>
                        Update
                    </button>
                </div>

                {/* GROUPS */}
                <div style={card}>
                    <h3 style={{ color: "#1565C0" }}>Assigned Groups</h3>

                    <table style={{ width: "100%" }}>

                        <thead style={{ background: "#1565C0", color: "white" }}>
                            <tr>
                                <th>ID</th>
                                <th>Project</th>
                                <th>Status</th>
                                <th>Members</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {groups.map(g => (

                                <tr key={g.groupId}>

                                    <td>{g.groupId}</td>
                                    <td>{g.projectName}</td>
                                    <td>{g.status}</td>

                                    <td>
                                        {g.members.map(m => (
                                            <div key={m.uid} style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px solid #eee" }}>
                                                <div style={{ fontWeight: "500", color: "#1565C0" }}>{m.name} ({m.usn || "N/A"})</div>
                                                {g.status === "GUIDE_ACCEPTED" && (
                                                    <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                                                        <div>📧 {m.email || "No email"}</div>
                                                        <div style={{ marginTop: "2px" }}>📞 {m.phone || "No phone"}</div>
                                                        {m.phone && (
                                                            <div style={{ marginTop: "4px" }}>
                                                                <a 
                                                                    href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}`} 
                                                                    target="_blank" 
                                                                    rel="noreferrer"
                                                                    style={{ color: "#25D366", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: "600" }}
                                                                >
                                                                    💬 WhatsApp
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </td>

                                    <td>

                                        {g.status === "GUIDE_ASSIGNED" && (
                                            <>
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => handleDecision(g.groupId, "ACCEPT")}
                                                >
                                                    Accept
                                                </button>

                                                <button
                                                    className="btn-accent"
                                                    style={{ marginLeft: "5px" }}
                                                    onClick={() => handleDecision(g.groupId, "REJECT")}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {g.status === "GUIDE_ACCEPTED" && (
                                            <>
                                                {/* VIEW FILES BUTTON */}
                                                <button
                                                    style={{
                                                        marginLeft: "5px",
                                                        padding: "6px 10px",
                                                        borderRadius: "6px",
                                                        cursor: "pointer"
                                                    }}
                                                    onClick={() => navigate(`/guide/view-files/${g.groupId}`)}
                                                >
                                                    View Files
                                                </button>

                                                {/* NOTIFY BUTTON */}
                                                <button
                                                    style={{
                                                        marginLeft: "5px",
                                                        padding: "6px 10px",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        background: "#4CAF50",
                                                        color: "white",
                                                        border: "none"
                                                    }}
                                                    onClick={() => handleNotifyGuide(g.groupId)}
                                                >
                                                    Notify
                                                </button>
                                            </>
                                        )}

                                    </td>

                                </tr>

                            ))}
                        </tbody>

                    </table>
                </div>

                {/* SUBMISSIONS */}
                <div style={card}>
                    <h3 style={{ color: "#1565C0" }}>Project Submissions</h3>

                    {submissions.map(sub => (

                        <div key={sub.id} style={submissionCard}>

                            <p><b>Group:</b> {sub.groupId}</p>
                            <p><b>Status:</b> {sub.status}</p>

                            <div style={{ marginTop: "10px" }}>
                                <button onClick={() =>
                                    navigate(`/guide/view-files/${sub.groupId}`)
                                }>
                                    📂 Open Files
                                </button>
                            </div>

                        </div>

                    ))}

                </div>

            </div>

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


// ================= STYLES =================
const card = {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 6px 25px rgba(0,0,0,0.06)",
    marginBottom: "20px"
};

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "15px"
};

const submissionCard = {
    padding: "15px",
    background: "#F5F9FF",
    borderRadius: "10px",
    marginTop: "10px"
};

function Stat({ title, value }) {
    return (
        <div style={card}>
            <h4>{title}</h4>
            <h2 style={{ color: "#1565C0" }}>{value}</h2>
        </div>
    );
}
