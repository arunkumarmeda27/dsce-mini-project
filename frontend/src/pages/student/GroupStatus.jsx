import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Preloader from "../../components/Preloader";

const BASE_URL = "http://127.0.0.1:8000";

export default function GroupStatus() {

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        fetchGroup();
    }, []);

    const fetchGroup = async () => {

        try {

            const token = getToken();

            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch(`${BASE_URL}/my-group`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();

                // Only set if real group exists
                if (data && data.projectName) {
                    setGroup(data);
                }
            }

        } catch (err) {
            console.log("Group status error:", err);
        }

        setLoading(false);
    };

    // ✅ USE PRELOADER
    if (loading) return <Preloader />;

    return (

        <div>

            <Header />
            <Sidebar role="student" />

            <div className="main">

                <div className="card">

                    <h2 style={{ color: "#0B3D91" }}>
                        Group Status
                    </h2>

                    {!group ? (
                        <p style={{ marginTop: "15px" }}>
                            No group created yet.
                        </p>
                    ) : (

                        <div style={{ marginTop: "15px" }}>

                            {/* ===== GROUP BASIC DETAILS ===== */}

                            <p><strong>Group ID:</strong> {group.groupId}</p>
                            <p><strong>Project Name:</strong> {group.projectName}</p>
                            <p><strong>Domain:</strong> {group.domain}</p>

                            <p>
                                <strong>Group Leader:</strong>{" "}
                                {
                                    group.members?.find(
                                        m => m.uid === group.leaderId
                                    )?.name || "-"
                                }
                            </p>

                            {/* ===== MEMBERS ===== */}

                            <h4 style={{ marginTop: "15px", color: "#0B3D91" }}>
                                Group Members
                            </h4>

                            <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>

                                <thead style={{ background: "#0B3D91", color: "white" }}>
                                    <tr>
                                        <th style={{ padding: "8px", textAlign: "left" }}>Name</th>
                                        <th style={{ padding: "8px", textAlign: "left" }}>USN</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {group.members?.map(member => (
                                        <tr key={member.uid}>
                                            <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                                                {member.name}
                                                {member.uid === group.leaderId && " (Leader)"}
                                            </td>
                                            <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                                                {member.usn || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                            {/* ===== GUIDE INFO ===== */}

                            <div style={{ marginTop: "20px" }}>

                                <p>
                                    <strong>Guide Name:</strong>{" "}
                                    {group.guideName ? group.guideName : "Not Assigned"}
                                </p>

                                <p>
                                    <strong>Guide Status:</strong>{" "}
                                    {group.status}
                                </p>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}