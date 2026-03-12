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

        } catch {

            alert("Failed to load data");

        } finally {

            setLoading(false);
        }
    };

    // =============================
    // ASSIGN GUIDE
    // =============================
    const assignGuide = async (groupId, guideId) => {

        if (!guideId) return;

        try {

            const res = await api.assignGuide(groupId, guideId);

            if (res.message) {

                alert("Guide assigned successfully");
                fetchData();

            } else {

                alert(res.detail || "Assignment failed");

            }

        } catch {

            alert("Server error");

        }
    };

    // =============================
    // DELETE GROUP
    // =============================
    const deleteGroup = async (groupId) => {

        if (!window.confirm("Delete this group?")) return;

        try {

            const res = await api.deleteGroup(groupId);

            if (res.message) {

                alert("Group deleted");
                fetchData();

            }

        } catch {

            alert("Delete failed");

        }
    };

    // =============================
    // SEND NOTIFICATION
    // =============================
    const sendNotification = async (groupId) => {

        const message = prompt("Enter notification message");

        if (!message) return;

        try {

            const res = await api.sendNotification(groupId, message);

            if (res.message) {
                alert("Notification sent");
            }

        } catch {

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

                    {loading && <p>Loading groups...</p>}

                    {!loading && groups.length === 0 && (
                        <p>No groups available</p>
                    )}

                    {!loading && groups.length > 0 && (

                        <table style={{ width: "100%" }}>

                            <thead style={{ background: "#0B3D91", color: "white" }}>

                                <tr>

                                    <th>Sl No</th>
                                    <th>Group ID</th>
                                    <th>Project Name</th>
                                    <th>Domain</th>
                                    <th>Guide</th>
                                    <th>Members</th>
                                    <th>Assign Guide</th>
                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {groups.map((group, index) => (

                                    <tr key={group.id}>

                                        <td>{index + 1}</td>

                                        <td>{group.id}</td>

                                        <td>{group.projectName}</td>

                                        <td>{group.domain}</td>

                                        <td>
                                            {group.guideName || "Not Assigned"}
                                        </td>

                                        <td>

                                            {group.members.map((m, i) => (
                                                <div key={i}>
                                                    {m.name} ({m.usn})
                                                </div>
                                            ))}

                                        </td>

                                        {/* GUIDE DROPDOWN */}

                                        <td>

                                            <select
                                                onChange={(e) =>
                                                    assignGuide(group.id, e.target.value)
                                                }
                                            >

                                                <option value="">
                                                    Select Guide
                                                </option>

                                                {guides.map(g => (

                                                    <option
                                                        key={g.uid}
                                                        value={g.uid}
                                                    >
                                                        {g.name}
                                                    </option>

                                                ))}

                                            </select>

                                        </td>

                                        <td>

                                            <button
                                                className="btn-accent"
                                                onClick={() => deleteGroup(group.id)}
                                            >
                                                Delete
                                            </button>

                                            <button
                                                className="btn-primary"
                                                style={{ marginLeft: "10px" }}
                                                onClick={() =>
                                                    sendNotification(group.id)
                                                }
                                            >
                                                Notify
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>

        </div>

    );
}