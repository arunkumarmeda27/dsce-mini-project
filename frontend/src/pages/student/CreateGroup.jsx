import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Preloader from "../../components/Preloader";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:8000";

export default function CreateGroup() {

    const [currentUser, setCurrentUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [projectName, setProjectName] = useState("");
    const [domain, setDomain] = useState("");
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alreadyCreated, setAlreadyCreated] = useState(false);

    const navigate = useNavigate();

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {

        try {

            // 🔹 Check if group already exists
            const groupRes = await fetch(`${BASE_URL}/my-group`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            const groupData = await groupRes.json();

            if (groupRes.ok && groupData?.projectName) {
                setAlreadyCreated(true);
                setLoading(false);
                return;
            }

            // 🔹 Get user
            const profileRes = await fetch(`${BASE_URL}/user-profile`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            const profileData = await profileRes.json();

            if (profileRes.ok) {
                setCurrentUser(profileData);
            }

            // 🔹 Get eligible students
            const studentRes = await fetch(`${BASE_URL}/eligible-students`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            const studentData = await studentRes.json();

            if (studentRes.ok) {
                setStudents(studentData);
            }

        } catch {
            alert("Server error");
        }

        setLoading(false);
    };

    const handleCheckbox = (uid, checked) => {

        if (checked) {
            if (selected.length >= 3) {
                alert("Select only 3 members");
                return;
            }
            setSelected([...selected, uid]);
        } else {
            setSelected(selected.filter(id => id !== uid));
        }
    };

    const handleCreate = async () => {

        if (!projectName.trim()) return alert("Enter project name");
        if (!domain.trim()) return alert("Enter domain");
        if (selected.length !== 3) return alert("Select exactly 3 members");

        try {

            const res = await fetch(`${BASE_URL}/create-group`, {
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
                setAlreadyCreated(true);
            } else {
                alert(data.detail || "Error creating group");
            }

        } catch {
            alert("Server error");
        }
    };

    if (loading) return <Preloader />;

    return (

        <div>
            <Header />
            <Sidebar role="student" />

            <div className="main">
                <div className="card">

                    <h2>Create 4-Member Project Group</h2>

                    {alreadyCreated ? (

                        <div style={{ marginTop: "15px" }}>
                            <p style={{ color: "green", fontWeight: "bold" }}>
                                ✅ Your group has been created successfully.
                            </p>

                            <button
                                className="btn-primary"
                                onClick={() => navigate("/group-status")}
                                style={{ marginTop: "10px" }}
                            >
                                View Group Status
                            </button>
                        </div>

                    ) : (

                        <>
                            <p>
                                Leader: <strong>{currentUser?.name}</strong>
                            </p>

                            <input
                                className="input"
                                placeholder="Project Name"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                            />

                            <input
                                className="input"
                                placeholder="Domain"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            />

                            <h4>Select 3 Members</h4>

                            {students.length === 0 && (
                                <p style={{ fontSize: "13px", color: "gray" }}>
                                    No eligible students available.
                                </p>
                            )}

                            {students.map(u => (
                                <div key={u.uid}>
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(u.uid)}
                                        onChange={(e) =>
                                            handleCheckbox(u.uid, e.target.checked)
                                        }
                                    />
                                    {u.name}
                                </div>
                            ))}

                            <p>Selected: {selected.length}/3</p>

                            <button
                                className="btn-primary"
                                onClick={handleCreate}
                            >
                                Create Group
                            </button>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}