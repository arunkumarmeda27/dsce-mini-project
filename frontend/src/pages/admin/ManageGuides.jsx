import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function ManageGuides() {

    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGuides();
    }, []);

    // ==========================
    // FETCH GUIDES
    // ==========================
    const fetchGuides = async () => {

        setLoading(true);

        try {

            const response = await api.getGuides();

            if (Array.isArray(response)) {
                setGuides(response);
            } else {
                alert(response?.detail || "Failed to load guides");
            }

        } catch (err) {

            console.error(err);
            alert("Server error");

        } finally {

            setLoading(false);

        }
    };

    // ==========================
    // CONTACT GUIDE (WHATSAPP)
    // ==========================
    const contactGuide = (phone) => {

        if (!phone) {
            alert("Phone number not available");
            return;
        }

        const message = "Contact the Mini Project Coordinator";

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");

    };

    // ==========================
    // REMOVE GUIDE
    // ==========================
    const removeGuide = async (uid) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to remove this guide?"
        );

        if (!confirmDelete) return;

        try {

            const res = await api.deleteUser(uid);

            if (res?.message) {

                alert("Guide removed successfully");
                fetchGuides();

            } else {

                alert(res?.detail || "Failed to remove guide");

            }

        } catch (err) {

            console.error(err);
            alert("Server error");

        }

    };

    return (

        <div>

            <Header />
            <Sidebar role="admin" />

            <div className="main">

                <div className="card">

                    <h2 style={{ color: "#0B3D91" }}>
                        Manage Guides
                    </h2>

                    {loading && <p>Loading guides...</p>}

                    {!loading && guides.length === 0 && (
                        <p>No guides found</p>
                    )}

                    {!loading && guides.length > 0 && (

                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                marginTop: "10px"
                            }}
                        >

                            <thead style={{ background: "#0B3D91", color: "white" }}>

                                <tr>

                                    <th style={{ padding: "10px" }}>Name</th>
                                    <th style={{ padding: "10px" }}>Branch</th>
                                    <th style={{ padding: "10px" }}>Email</th>
                                    <th style={{ padding: "10px" }}>Phone</th>
                                    <th style={{ padding: "10px" }}>Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {guides.map((guide) => (

                                    <tr key={guide.uid} style={{ borderBottom: "1px solid #eee" }}>

                                        <td style={{ padding: "10px" }}>
                                            {guide.name}
                                        </td>

                                        <td style={{ padding: "10px" }}>
                                            {guide.branch}
                                        </td>

                                        <td style={{ padding: "10px" }}>
                                            {guide.email}
                                        </td>

                                        <td style={{ padding: "10px" }}>
                                            {guide.phone || "Not Available"}
                                        </td>

                                        <td style={{ padding: "10px" }}>

                                            <button
                                                className="btn-primary"
                                                onClick={() =>
                                                    contactGuide(guide.phone)
                                                }
                                            >
                                                WhatsApp
                                            </button>

                                            <button
                                                className="btn-accent"
                                                style={{ marginLeft: "10px" }}
                                                onClick={() =>
                                                    removeGuide(guide.uid)
                                                }
                                            >
                                                Remove
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