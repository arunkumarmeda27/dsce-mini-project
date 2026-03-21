import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Preloader from "../../components/Preloader";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function CreateGroup() {

    const [currentUser, setCurrentUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [projectName, setProjectName] = useState("");
    const [domain, setDomain] = useState("");
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alreadyCreated, setAlreadyCreated] = useState(false);

    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState(null);
    const [creating, setCreating] = useState(false);

    const navigate = useNavigate();

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {

        try {

            const token = getToken();

            const groupRes = await fetch(`${BASE_URL}/groups/my-group`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const groupData = await groupRes.json();

            if (groupRes.ok && groupData?.groupId) {
                setAlreadyCreated(true);
                setLoading(false);
                return;
            }

            const profileRes = await fetch(`${BASE_URL}/users/user-profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const profileData = await profileRes.json();

            if (profileRes.ok) setCurrentUser(profileData);

            const studentRes = await fetch(`${BASE_URL}/groups/eligible-students`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const studentData = await studentRes.json();

            if (studentRes.ok) setStudents(studentData);

        } catch {
            setModal({
                title: "Error",
                message: "Server error while loading data"
            });
        }

        setLoading(false);
    };

    // ===============================
    // SELECT MEMBERS
    // ===============================
    const handleCheckbox = (uid) => {

        if (selected.includes(uid)) {
            setSelected(selected.filter(id => id !== uid));
        } else {

            if (selected.length >= 3) {
                return setModal({
                    title: "Limit Reached",
                    message: "You can select only 3 members"
                });
            }

            setSelected([...selected, uid]);
        }
    };

    // ===============================
    // CREATE GROUP
    // ===============================
    const handleCreate = async () => {

        if (!projectName.trim()) {
            return setModal({
                title: "Missing Field",
                message: "Enter project name"
            });
        }

        if (!domain.trim()) {
            return setModal({
                title: "Missing Field",
                message: "Enter domain"
            });
        }

        if (selected.length !== 3) {
            return setModal({
                title: "Invalid Selection",
                message: "Select exactly 3 members"
            });
        }

        try {

            setCreating(true);

            const res = await fetch(`${BASE_URL}/groups/create-group`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },

                body: JSON.stringify({
                    projectName,
                    domain,
                    members: selected
                })

            });

            const data = await res.json();

            if (res.ok) {

                setToast({
                    message: "Group created successfully 🎉",
                    type: "success"
                });

                setTimeout(() => {
                    navigate("/student");
                }, 1500);

            } else {

                setModal({
                    title: "Error",
                    message: data.detail || "Failed to create group"
                });

            }

        } catch {

            setModal({
                title: "Server Error",
                message: "Please try again later"
            });

        } finally {
            setCreating(false);
        }

    };

    if (loading) return <Preloader />;

    return (

        <div>

            <Header />
            <Sidebar role="student" />

            <div className="main">

                <div className="card">

                    <h2 style={{ color: "#1565C0" }}>
                        Create Project Group
                    </h2>

                    {alreadyCreated ? (

                        <div style={{ marginTop: "15px" }}>

                            <p style={{
                                color: "#2E7D32",
                                fontWeight: "bold"
                            }}>
                                ✅ Group already created
                            </p>

                            <button
                                className="btn-primary"
                                onClick={() => navigate("/student")}
                            >
                                Go to Dashboard
                            </button>

                        </div>

                    ) : (

                        <>

                            <p>
                                Leader: <strong>{currentUser?.name}</strong>
                            </p>

                            {/* INPUTS */}
                            <input
                                className="input"
                                placeholder="Project Name"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                            />

                            <input
                                className="input"
                                placeholder="Domain (AI, Web, IoT...)"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            />

                            {/* MEMBERS */}
                            <h4 style={{ marginTop: "15px" }}>
                                Select 3 Members
                            </h4>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                                gap: "10px"
                            }}>

                                {students.map(u => (

                                    <div
                                        key={u.uid}
                                        onClick={() => handleCheckbox(u.uid)}
                                        style={{
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: selected.includes(u.uid)
                                                ? "2px solid #1565C0"
                                                : "1px solid #ddd",
                                            cursor: "pointer",
                                            background: selected.includes(u.uid)
                                                ? "#E3F2FD"
                                                : "white"
                                        }}
                                    >
                                        <strong>{u.name}</strong>
                                        <div style={{ fontSize: "12px" }}>
                                            {u.usn}
                                        </div>
                                    </div>

                                ))}

                            </div>

                            <p style={{ marginTop: "10px" }}>
                                Selected: {selected.length}/3
                            </p>

                            <button
                                className="btn-primary"
                                onClick={handleCreate}
                                disabled={creating}
                                style={{ width: "100%" }}
                            >
                                {creating ? "Creating..." : "Create Group"}
                            </button>

                        </>

                    )}

                </div>

            </div>

            {/* MODAL */}
            {modal && (
                <Modal
                    title={modal.title}
                    message={modal.message}
                    onClose={() => setModal(null)}
                />
            )}

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
