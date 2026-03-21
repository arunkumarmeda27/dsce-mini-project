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

            const res = await fetch(`${BASE_URL}/groups/my-group`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (data?.groupId) setGroup(data);
            }

        } catch (err) {
            console.log("Group status error:", err);
        }

        setLoading(false);
    };

    // =========================
    // STATUS COLOR
    // =========================
    const getStatusColor = (status) => {

        switch (status) {
            case "CREATED": return "#ECEFF1";
            case "GUIDE_ASSIGNED": return "#FFF3E0";
            case "GUIDE_ACCEPTED": return "#E8F5E9";
            case "SUBMITTED": return "#E3F2FD";
            default: return "#F5F5F5";
        }
    };

    if (loading) return <Preloader />;

    return (

        <div>

            <Header />
            <Sidebar role="student" />

            <div className="main">

                <div className="card" style={{
                    borderRadius: "12px",
                    boxShadow: "0 6px 25px rgba(0,0,0,0.08)"
                }}>

                    <h2 style={{ color: "#1565C0" }}>
                        📊 Group Status
                    </h2>

                    {!group ? (

                        <p style={{ marginTop: "15px", color: "gray" }}>
                            No group created yet.
                        </p>

                    ) : (

                        <div style={{ marginTop: "20px" }}>

                            {/* HEADER INFO */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                                gap: "10px"
                            }}>

                                <InfoBox label="Group ID" value={group.groupId} />
                                <InfoBox label="Project" value={group.projectName} />
                                <InfoBox label="Domain" value={group.domain} />

                                <InfoBox
                                    label="Leader"
                                    value={
                                        group.members?.find(
                                            m => m.uid === group.leaderId
                                        )?.name || "-"
                                    }
                                />

                            </div>

                            {/* STATUS */}
                            <div style={{ marginTop: "20px" }}>

                                <span style={{
                                    padding: "6px 14px",
                                    borderRadius: "20px",
                                    background: getStatusColor(group.status),
                                    fontWeight: "bold"
                                }}>
                                    {group.status}
                                </span>

                            </div>

                            {/* GUIDE */}
                            <div style={{ marginTop: "15px" }}>

                                <span style={{
                                    padding: "6px 14px",
                                    borderRadius: "20px",
                                    background: group.guideId ? "#E8F5E9" : "#FFF3E0"
                                }}>
                                    👨‍🏫 Guide:{" "}
                                    {group.guideId && group.guideName
                                        ? group.guideName
                                        : "Not Assigned"}
                                </span>

                            </div>

                            {/* MEMBERS TABLE */}
                            <h4 style={{
                                marginTop: "25px",
                                color: "#1565C0"
                            }}>
                                👥 Group Members
                            </h4>

                            <table style={{
                                width: "100%",
                                marginTop: "10px",
                                borderCollapse: "collapse",
                                borderRadius: "10px",
                                overflow: "hidden"
                            }}>

                                <thead style={{
                                    background: "#1565C0",
                                    color: "white"
                                }}>
                                    <tr>
                                        <th style={{ padding: "10px" }}>Name</th>
                                        <th style={{ padding: "10px" }}>USN</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {group.members?.map(member => (

                                        <tr key={member.uid}
                                            style={{
                                                background:
                                                    member.uid === group.leaderId
                                                        ? "#E3F2FD"
                                                        : "white"
                                            }}
                                        >

                                            <td style={{
                                                padding: "10px",
                                                borderBottom: "1px solid #eee"
                                            }}>
                                                {member.name}
                                                {member.uid === group.leaderId &&
                                                    " ⭐"
                                                }
                                            </td>

                                            <td style={{
                                                padding: "10px",
                                                borderBottom: "1px solid #eee"
                                            }}>
                                                {member.usn || "-"}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}


// =========================
// SMALL COMPONENT
// =========================
function InfoBox({ label, value }) {

    return (
        <div style={{
            padding: "12px",
            background: "#F5F9FF",
            borderRadius: "10px",
            borderLeft: "4px solid #1565C0"
        }}>
            <div style={{ fontSize: "12px", color: "#777" }}>
                {label}
            </div>
            <div style={{ fontWeight: "bold" }}>
                {value}
            </div>
        </div>
    );
}