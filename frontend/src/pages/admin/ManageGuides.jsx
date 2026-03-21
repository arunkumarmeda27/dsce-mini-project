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
                setGuides([]);
            }

        } catch (err) {

            console.error("Fetch guides error:", err);
            alert("Failed to load guides");

        } finally {

            setLoading(false);

        }
    };

    // ==========================
    // CONTACT GUIDE
    // ==========================

    const contactGuide = (phone) => {

        if (!phone) {
            alert("Phone number not available");
            return;
        }

        const message = "Contact the Mini Project Coordinator";

        const url =
            `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");

    };

    // ==========================
    // REMOVE GUIDE
    // ==========================

    const removeGuide = async (uid) => {

        if (!window.confirm("Remove this guide permanently?"))
            return;

        try {

            const res = await api.deleteUser(uid);

            if (res?.message) {

                alert("Guide removed successfully");

                setGuides(prev =>
                    prev.filter(g => g.uid !== uid)
                );

            } else {

                alert(res?.detail || "Failed to remove guide");

            }

        } catch (err) {

            console.error("Delete guide error:", err);
            alert("Server error while removing guide");

        }

    };

    return (

        <div>

            <Header />
            <Sidebar role="admin" />

            <div className="main">

                <div className="card">

                    <h2 style={{ color: "#0B3D91", marginBottom: "20px" }}>
                        Manage Guides
                    </h2>


                    {/* LOADING */}

                    {loading && (
                        <p style={{ color: "#777" }}>
                            Loading guides...
                        </p>
                    )}


                    {/* NO GUIDES */}

                    {!loading && guides.length === 0 && (
                        <p>No guides found</p>
                    )}


                    {/* GUIDE TABLE */}

                    {!loading && guides.length > 0 && (

                        <table>

                            <thead style={{ background: "#0B3D91", color: "white" }}>

                                <tr>

                                    <th>Name</th>
                                    <th>Branch</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {guides.map((guide) => (

                                    <tr key={guide.uid}>

                                        <td>{guide.name || "N/A"}</td>

                                        <td>{guide.branch || "N/A"}</td>

                                        <td>{guide.email}</td>

                                        <td>
                                            {guide.phone
                                                ? guide.phone
                                                : "Not Available"}
                                        </td>

                                        <td>

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