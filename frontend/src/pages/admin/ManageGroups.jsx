import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function ManageGroups() {

    const [groups, setGroups] = useState([]);
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {

        setLoading(true);

        try {
            const groupData = await api.getBranchGroups();
            const guideData = await api.getGuides();

            setGroups(groupData || []);
            setGuides(guideData || []);

        } catch (err) {
            console.error(err);
            alert("Failed to load group data");
        } finally {
            setLoading(false);
        }
    };

    const assignGuide = async (groupId, guideId) => {

        if (!guideId) return;

        try {
            await api.assignGuide(groupId, guideId);
            alert("Guide assigned successfully");
            fetchData();
        } catch {
            alert("Assignment failed");
        }
    };

    const deleteGroup = async (groupId) => {

        if (!window.confirm("Delete this group permanently?")) return;

        try {
            await api.deleteGroup(groupId);
            alert("Group deleted");
            fetchData();
        } catch {
            alert("Delete failed");
        }
    };

    // 🔥 NEW: SEND NOTIFICATION
    const sendNotification = async (groupId, target) => {

        const message = prompt(`Enter message for ${target}`);

        if (!message) return;

        try {
            await api.sendNotification(groupId, target, message);
            alert("Notification sent successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to send notification");
        }
    };

    return (

        <div>

            <Header />
            <Sidebar role="admin" />

            <div className="main">

                <div className="card">

                    <h2 style={{ color: "#0B3D91" }}>
                        Manage Project Groups
                    </h2>

                    {loading && <p>Loading...</p>}

                    {!loading && groups.length === 0 && (
                        <p>No groups available</p>
                    )}

                    <div style={{ display: "grid", gap: "15px" }}>

                        {groups.map(group => (

                            <div key={group.groupId}
                                style={{
                                    border: "1px solid #eee",
                                    borderRadius: "12px",
                                    padding: "16px",
                                    background: "white",
                                    boxShadow: "0 3px 12px rgba(0,0,0,0.05)"
                                }}
                            >

                                {/* TOP */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}>
                                    <h3 style={{ color: "#0B3D91" }}>
                                        {group.projectName}
                                    </h3>

                                    <span style={{
                                        fontSize: "12px",
                                        background: "#E3F2FD",
                                        padding: "5px 10px",
                                        borderRadius: "8px"
                                    }}>
                                        {group.groupId}
                                    </span>
                                </div>

                                <p><strong>Domain:</strong> {group.domain}</p>

                                {/* STATUS BADGE */}
                                <span style={{
                                    display: "inline-block",
                                    marginTop: "5px",
                                    padding: "4px 10px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    background:
                                        group.status === "GUIDE_ACCEPTED"
                                            ? "#E8F5E9"
                                            : group.status === "GUIDE_ASSIGNED"
                                                ? "#FFF3E0"
                                                : "#ECEFF1"
                                }}>
                                    {group.status}
                                </span>

                                {/* MEMBERS */}
                                <div style={{ marginTop: "10px" }}>
                                    <strong>Members:</strong>

                                    {group.members.length === 0 ? (
                                        <p style={{ color: "gray" }}>No members</p>
                                    ) : (
                                        group.members.map(m => (
                                            <div key={m.uid}>
                                                {m.name} ({m.usn || "N/A"})
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* GUIDE */}
                                <p style={{ marginTop: "10px" }}>
                                    <strong>Guide:</strong>{" "}
                                    {group.guideName || "Not Assigned"}
                                </p>

                                {/* ASSIGN */}
                                <select
                                    className="input"
                                    style={{ marginTop: "10px" }}
                                    onChange={(e) =>
                                        assignGuide(group.groupId, e.target.value)
                                    }
                                >
                                    <option value="">Assign Guide</option>

                                    {guides.map(g => (
                                        <option key={g.uid} value={g.uid}>
                                            {g.name}
                                        </option>
                                    ))}
                                </select>

                                {/* ACTIONS */}
                                <div style={{
                                    marginTop: "12px",
                                    display: "flex",
                                    gap: "10px",
                                    flexWrap: "wrap"
                                }}>

                                    <button
                                        className="btn-accent"
                                        onClick={() => deleteGroup(group.groupId)}
                                    >
                                        Delete
                                    </button>

                                    <button
                                        className="btn-primary"
                                        onClick={() => sendNotification(group.groupId, "students")}
                                    >
                                        Notify Students
                                    </button>

                                    <button
                                        className="btn-primary"
                                        onClick={() => sendNotification(group.groupId, "guide")}
                                    >
                                        Notify Guide
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </div>
    );

}