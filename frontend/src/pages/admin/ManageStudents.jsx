import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function ManageStudents() {

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {

        setLoading(true);

        try {

            const response = await api.getStudents();

            if (Array.isArray(response)) {
                setStudents(response);
            } else {
                alert("Failed to load students");
            }

        } catch (err) {

            console.error(err);
            alert("Server error");

        } finally {

            setLoading(false);

        }

    };

    const contactStudent = (phone) => {

        if (!phone) {
            alert("Phone number not available");
            return;
        }

        const message = "Contact the Mini Project Coordinator";

        const url =
            `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");

    };

    // =============================
    // REMOVE STUDENT
    // =============================
    const removeStudent = async (uid) => {

        if (!window.confirm("Are you sure you want to remove this student?"))
            return;

        try {

            const res = await api.deleteUser(uid);

            if (res.message) {
                alert("Student removed successfully");
                fetchStudents();
            } else {
                alert(res.detail || "Failed to remove student");
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
                        Manage Students
                    </h2>

                    {loading && <p>Loading students...</p>}

                    {!loading && students.length === 0 && (
                        <p>No students found</p>
                    )}

                    {!loading && students.length > 0 && (

                        <table style={{ width: "100%", borderCollapse: "collapse" }}>

                            <thead style={{ background: "#0B3D91", color: "white" }}>

                                <tr>

                                    <th style={{ padding: "10px" }}>Name</th>
                                    <th style={{ padding: "10px" }}>USN</th>
                                    <th style={{ padding: "10px" }}>Email</th>
                                    <th style={{ padding: "10px" }}>Phone</th>
                                    <th style={{ padding: "10px" }}>Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {students.map(student => (

                                    <tr key={student.uid}>

                                        <td style={{ padding: "10px" }}>
                                            {student.name}
                                        </td>

                                        <td style={{ padding: "10px" }}>
                                            {student.usn}
                                        </td>

                                        <td style={{ padding: "10px" }}>
                                            {student.email}
                                        </td>

                                        <td style={{ padding: "10px" }}>
                                            {student.phone || "Not Available"}
                                        </td>

                                        <td style={{ padding: "10px" }}>

                                            <button
                                                className="btn-primary"
                                                onClick={() =>
                                                    contactStudent(student.phone)
                                                }
                                            >
                                                WhatsApp
                                            </button>

                                            <button
                                                className="btn-accent"
                                                style={{ marginLeft: "10px" }}
                                                onClick={() =>
                                                    removeStudent(student.uid)
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