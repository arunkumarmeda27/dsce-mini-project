import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api } from "../../services/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Approvals() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    // -----------------------------
    // Fetch Pending Users
    // -----------------------------
    const fetchUsers = async () => {

        setLoading(true);

        try {

            const data = await api.getPendingUsers();

            setUsers(data || []);

        } catch (error) {

            console.error(error);
            alert("Error fetching users");

        }

        setLoading(false);
    };

    // -----------------------------
    // Approve User
    // -----------------------------
    const approveUser = async (uid) => {

        try {

            const res = await fetch(`${BASE_URL}/users/approve/${uid}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.detail || "Approval failed");
                return;
            }

            alert("User approved successfully");

            fetchUsers();

        } catch (error) {

            alert("Server error during approval");

        }

    };

    // -----------------------------
    // Reject User
    // -----------------------------
    const rejectUser = async (uid) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to reject this user?"
        );

        if (!confirmDelete) return;

        try {

            const res = await fetch(`${BASE_URL}/users/reject/${uid}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.detail || "Reject failed");
                return;
            }

            alert("User rejected successfully");

            fetchUsers();

        } catch (error) {

            alert("Server error during rejection");

        }

    };

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <div>

            <Header />
            <Sidebar role="admin" />

            <div className="main">

                <div className="card">

                    <h2 style={{ color: "#0B3D91" }}>
                        Pending User Approvals
                    </h2>

                    {loading && <p>Loading users...</p>}

                    {!loading && users.length === 0 && (
                        <p>No pending approvals</p>
                    )}

                    {!loading && users.map((user) => (

                        <div
                            key={user.uid}
                            style={{
                                border: "1px solid #ddd",
                                padding: "15px",
                                marginBottom: "12px",
                                borderRadius: "8px",
                                background: "#fff"
                            }}
                        >

                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <p><strong>Branch:</strong> {user.branch}</p>

                            <div style={{ marginTop: "10px" }}>

                                <button
                                    className="btn-primary"
                                    onClick={() => approveUser(user.uid)}
                                >
                                    Approve
                                </button>

                                <button
                                    className="btn-accent"
                                    style={{ marginLeft: "10px" }}
                                    onClick={() => rejectUser(user.uid)}
                                >
                                    Reject
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
}
