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
                setStudents([]);
            }

        } catch (err) {

            console.error("Fetch students error:", err);
            alert("Failed to load students");

        } finally {

            setLoading(false);

        }

    };


    // =============================
    // CONTACT STUDENT
    // =============================

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

        if (!window.confirm("Remove this student permanently?"))
            return;

        try {

            const res = await api.deleteUser(uid);

            if (res?.message) {

                alert("Student removed successfully");

                setStudents(prev =>
                    prev.filter(s => s.uid !== uid)
                );

            } else {

                alert(res?.detail || "Failed to remove student");

            }

        } catch (err) {

            console.error("Delete student error:", err);
            alert("Server error while removing student");

        }

    };


    return (

        <div>

            <Header />
            <Sidebar role="admin" />

            <div className="main">

                <div className="card">

                    <h2 style={{ color: "#0B3D91", marginBottom: "20px" }}>
                        Manage Students
                    </h2>


                    {/* LOADING */}

                    {loading && (
                        <p style={{ color: "#777" }}>
                            Loading students...
                        </p>
                    )}


                    {/* NO STUDENTS */}

                    {!loading && students.length === 0 && (
                        <p>No students found</p>
                    )}


                    {/* STUDENT TABLE */}

                    {!loading && students.length > 0 && (

                        <table>

                            <thead style={{ background: "#0B3D91", color: "white" }}>

                                <tr>

                                    <th>Name</th>
                                    <th>USN</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {students.map(student => (

                                    <tr key={student.uid}>

                                        <td>{student.name || "N/A"}</td>

                                        <td>{student.usn || "N/A"}</td>

                                        <td>{student.email}</td>

                                        <td>
                                            {student.phone
                                                ? student.phone
                                                : "Not Available"}
                                        </td>

                                        <td>

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
