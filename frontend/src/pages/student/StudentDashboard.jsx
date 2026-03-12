import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import StatusTimeline from "../../components/StatusTimeline";
import Preloader from "../../components/Preloader";

import { db } from "../../firebase/config";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

const BASE_URL = "http://127.0.0.1:8000";

export default function StudentDashboard() {

    const [currentUser, setCurrentUser] = useState(null);
    const [myGroup, setMyGroup] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        fetchStudentData();
    }, []);

    // =========================
    // FETCH USER + GROUP
    // =========================
    const fetchStudentData = async () => {

        try {

            const token = getToken();

            if (!token) {
                setLoading(false);
                return;
            }

            // USER PROFILE
            const profileRes = await fetch(`${BASE_URL}/user-profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (profileRes.ok) {

                const profileData = await profileRes.json();
                setCurrentUser(profileData);

                // Start realtime notification listener
                startRealtimeNotifications(profileData.uid);

            }

            // MY GROUP
            const groupRes = await fetch(`${BASE_URL}/my-group`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (groupRes.ok) {

                const groupData = await groupRes.json();

                if (groupData.projectName) {
                    setMyGroup(groupData);
                }

            }

        } catch (err) {

            console.log("Dashboard error:", err);

        }

        setLoading(false);

    };


    // =========================
    // REALTIME NOTIFICATIONS
    // =========================
    const startRealtimeNotifications = (uid) => {

        const q = query(
            collection(db, "notifications"),
            where("userId", "==", uid),
            orderBy("createdAt", "desc")
        );

        onSnapshot(q, (snapshot) => {

            const list = [];

            snapshot.forEach(doc => {

                const data = doc.data();

                list.push({
                    id: doc.id,
                    ...data
                });

            });

            setNotifications(list);

        });

    };


    if (loading) return <Preloader />;

    return (

        <div>

            <Header />
            <Sidebar role="student" />

            <div className="main">

                {/* ================= STUDENT INFO ================= */}

                <div className="card">

                    <h2 style={{ color: "#0B3D91" }}>
                        Student Dashboard
                    </h2>

                    {currentUser && (
                        <>
                            <p><strong>Name:</strong> {currentUser.name}</p>
                            <p><strong>Email:</strong> {currentUser.email}</p>

                            {currentUser.usn && (
                                <p><strong>USN:</strong> {currentUser.usn}</p>
                            )}

                            <p><strong>Branch:</strong> {currentUser.branch}</p>
                        </>
                    )}

                </div>


                {/* ================= GROUP DETAILS ================= */}

                <div className="card">

                    {!myGroup ? (

                        <p>No project group created yet.</p>

                    ) : (

                        <>

                            <h3 style={{ color: "#0B3D91" }}>
                                {myGroup.projectName}
                            </h3>

                            <p><strong>Group ID:</strong> {myGroup.groupId}</p>

                            <p><strong>Domain:</strong> {myGroup.domain}</p>

                            {myGroup.guide && (
                                <p>
                                    <strong>Guide:</strong> {myGroup.guide.name}
                                </p>
                            )}

                            <p>
                                <strong>Group Leader:</strong>{" "}
                                {
                                    myGroup.members.find(
                                        m => m.uid === myGroup.leaderId
                                    )?.name
                                }
                            </p>

                            <h4 style={{ marginTop: "15px" }}>
                                Group Members
                            </h4>

                            <ul>

                                {myGroup.members.map(member => (

                                    <li key={member.uid}>
                                        {member.name}

                                        {member.uid === myGroup.leaderId &&
                                            " (Leader)"
                                        }

                                    </li>

                                ))}

                            </ul>


                            {/* PROJECT STATUS */}

                            <div style={{ marginTop: "20px" }}>

                                <h4>Project Progress</h4>

                                <StatusTimeline
                                    status={myGroup.status}
                                />

                            </div>

                        </>

                    )}

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
                                padding: "12px",
                                borderBottom: "1px solid #eee"
                            }}
                        >

                            <div>{n.message}</div>

                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#888",
                                    marginTop: "5px"
                                }}
                            >

                                {n.createdAt?.toDate
                                    ? n.createdAt.toDate().toLocaleString()
                                    : ""}

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}