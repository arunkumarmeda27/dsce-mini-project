import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Preloader from "../../components/Preloader";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function GuideDashboard() {

    const [guideInfo, setGuideInfo] = useState(null);
    const [groups, setGroups] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {

        try {

            const profile = await api.getUserProfile();
            setGuideInfo(profile);

            const guideGroups = await api.getGuideGroups();
            setGroups(guideGroups);

            const submissionData = await api.getGuideSubmissions();
            setSubmissions(submissionData);

            const notify = await api.getMyNotifications();
            setNotifications(notify);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    };

    // =================================
    // GUIDE ACCEPT / REJECT GROUP
    // =================================
    const handleDecision = async (groupId, decision) => {

        try {

            await api.guideDecision(groupId, decision);

            alert(`Group ${decision}`);

            loadDashboard();

        } catch {

            alert("Action failed");

        }

    };

    // =================================
    // REVIEW PROJECT SUBMISSION
    // =================================
    const reviewSubmission = async (submissionId, decision) => {

        const comment = prompt("Enter comment for students");

        try {

            await api.reviewSubmission(submissionId, decision, comment);

            alert("Review submitted");

            loadDashboard();

        } catch {

            alert("Review failed");

        }

    };

    if (loading) return <Preloader />;

    return (

        <div>

            <Header />
            <Sidebar role="guide" />

            <div className="main">

                {/* ================= GUIDE PROFILE ================= */}

                <div className="card">

                    <h2 style={{ color: "#0B3D91" }}>
                        Guide Dashboard
                    </h2>

                    {guideInfo && (
                        <>
                            <p><strong>Name:</strong> {guideInfo.name}</p>
                            <p><strong>Email:</strong> {guideInfo.email}</p>
                            <p><strong>Branch:</strong> {guideInfo.branch}</p>
                        </>
                    )}

                </div>


                {/* ================= GUIDE LIMIT INDICATOR ================= */}

                <div className="card">

                    <h3 style={{ color: "#0B3D91" }}>
                        Guide Group Capacity
                    </h3>

                    <p>
                        Assigned Groups: <strong>{groups.length} / 3</strong>
                    </p>

                    {groups.length >= 3 && (
                        <p style={{ color: "red" }}>
                            Maximum limit reached
                        </p>
                    )}

                </div>


                {/* ================= ANALYTICS ================= */}

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "15px",
                    marginBottom: "20px"
                }}>

                    <div className="card">
                        <h3>Total Assigned</h3>
                        <h2>{groups.length}</h2>
                    </div>

                    <div className="card">
                        <h3>Accepted</h3>
                        <h2>
                            {groups.filter(g => g.status === "GUIDE_ACCEPTED").length}
                        </h2>
                    </div>

                    <div className="card">
                        <h3>Pending</h3>
                        <h2>
                            {groups.filter(g => g.status === "GUIDE_ASSIGNED").length}
                        </h2>
                    </div>

                </div>


                {/* ================= ASSIGNED GROUPS ================= */}

                <div className="card">

                    <h3 style={{ color: "#0B3D91" }}>
                        Assigned Groups
                    </h3>

                    {groups.length === 0 && (
                        <p>No groups assigned</p>
                    )}

                    {groups.map(group => (

                        <div
                            key={group.groupId}
                            style={{
                                marginTop: "20px",
                                padding: "15px",
                                border: "1px solid #ddd",
                                borderRadius: "8px"
                            }}
                        >

                            <h3 style={{ color: "#0B3D91" }}>
                                {group.projectName}
                            </h3>

                            <p><strong>Group ID:</strong> {group.groupId}</p>

                            <p><strong>Domain:</strong> {group.domain}</p>

                            <p><strong>Status:</strong> {group.status}</p>

                            <h4>Members</h4>

                            <ul>

                                {group.members.map((m, i) => (
                                    <li key={i}>
                                        {m.name} ({m.usn})
                                    </li>
                                ))}

                            </ul>

                            {group.status === "GUIDE_ASSIGNED" && (

                                <div style={{ marginTop: "10px" }}>

                                    <button
                                        className="btn-primary"
                                        onClick={() => handleDecision(group.groupId, "ACCEPT")}
                                    >
                                        Accept
                                    </button>

                                    <button
                                        className="btn-accent"
                                        style={{ marginLeft: "10px" }}
                                        onClick={() => handleDecision(group.groupId, "REJECT")}
                                    >
                                        Reject
                                    </button>

                                </div>

                            )}

                        </div>

                    ))}

                </div>


                {/* ================= PROJECT SUBMISSIONS ================= */}

                <div className="card">

                    <h3 style={{ color: "#0B3D91" }}>
                        Project Submissions
                    </h3>

                    {submissions.length === 0 && (
                        <p>No submissions yet</p>
                    )}

                    {submissions.map(sub => (

                        <div
                            key={sub.id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "15px",
                                borderRadius: "8px",
                                marginTop: "15px"
                            }}
                        >

                            <p><strong>Group:</strong> {sub.groupId}</p>

                            <p><strong>Status:</strong> {sub.status}</p>

                            <div style={{ marginTop: "10px" }}>

                                {sub.reportUrl && (
                                    <div>
                                        <a
                                            href={sub.reportUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Download Report
                                        </a>
                                    </div>
                                )}

                                {sub.pptUrl && (
                                    <div>
                                        <a
                                            href={sub.pptUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Download Presentation
                                        </a>
                                    </div>
                                )}

                            </div>

                            {sub.status === "SUBMITTED" && (

                                <div style={{ marginTop: "10px" }}>

                                    <button
                                        className="btn-primary"
                                        onClick={() =>
                                            reviewSubmission(sub.id, "APPROVED")
                                        }
                                    >
                                        Approve
                                    </button>

                                    <button
                                        className="btn-accent"
                                        style={{ marginLeft: "10px" }}
                                        onClick={() =>
                                            reviewSubmission(sub.id, "REJECTED")
                                        }
                                    >
                                        Reject
                                    </button>

                                </div>

                            )}

                        </div>

                    ))}

                </div>


                {/* ================= NOTIFICATIONS ================= */}

                <div className="card">

                    <h3 style={{ color: "#0B3D91" }}>
                        Notifications
                    </h3>

                    {notifications.length === 0 && (
                        <p>No notifications</p>
                    )}

                    {notifications.map(n => (

                        <div
                            key={n.id}
                            style={{
                                padding: "10px",
                                borderBottom: "1px solid #eee"
                            }}
                        >

                            {n.message}

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}