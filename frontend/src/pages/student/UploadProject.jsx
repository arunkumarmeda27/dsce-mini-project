import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

const BASE_URL = "http://127.0.0.1:8000";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadProject() {

    const [group, setGroup] = useState(null);
    const [report, setReport] = useState(null);
    const [ppt, setPpt] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        fetchGroup();
    }, []);

    const fetchGroup = async () => {

        try {

            const res = await fetch(`${BASE_URL}/my-group`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });

            const data = await res.json();

            if (res.ok && data.projectName) {
                setGroup(data);
            }

        } catch {

            alert("Server error");

        }
    };

    // ===============================
    // FILE VALIDATION
    // ===============================
    const validateFiles = () => {

        if (report) {

            if (!report.name.toLowerCase().endsWith(".pdf")) {
                alert("Final report must be PDF");
                return false;
            }

            if (report.size > MAX_FILE_SIZE) {
                alert("Report must be less than 10MB");
                return false;
            }

        }

        if (ppt) {

            const valid =
                ppt.name.toLowerCase().endsWith(".ppt") ||
                ppt.name.toLowerCase().endsWith(".pptx") ||
                ppt.name.toLowerCase().endsWith(".pdf");

            if (!valid) {
                alert("Presentation must be PPT, PPTX, or PDF");
                return false;
            }

            if (ppt.size > MAX_FILE_SIZE) {
                alert("Presentation must be less than 10MB");
                return false;
            }

        }

        if (images.length > 0) {

            for (let img of images) {

                const validImage =
                    img.type === "image/jpeg" ||
                    img.type === "image/png";

                if (!validImage) {
                    alert("Images must be JPG or PNG");
                    return false;
                }

                if (img.size > MAX_FILE_SIZE) {
                    alert("Each image must be less than 10MB");
                    return false;
                }

            }

        }

        return true;
    };

    // ===============================
    // HANDLE UPLOAD
    // ===============================
    const handleUpload = async () => {

        if (!group || !group.groupId) {
            alert("Create a group first");
            return;
        }

        if (!report && !ppt && images.length === 0) {
            alert("Select at least one file");
            return;
        }

        if (!validateFiles()) return;

        try {

            setLoading(true);

            const formData = new FormData();

            if (report) formData.append("report", report);
            if (ppt) formData.append("ppt", ppt);

            images.forEach((img) => {
                formData.append("images", img);
            });

            const res = await fetch(
                `${BASE_URL}/upload-project/${group.groupId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: formData
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.detail || "Upload failed");
                return;
            }

            alert("Project files uploaded successfully");

        } catch {

            alert("Server error");

        }

        setLoading(false);

    };

    return (

        <div>

            <Header />
            <Sidebar role="student" />

            <div className="main">

                <div className="card">

                    <h2 style={{ color: "#0B3D91" }}>
                        Upload Project Files
                    </h2>

                    {!group ? (

                        <p>No group created yet.</p>

                    ) : (

                        <>

                            <p>
                                <strong>Project:</strong> {group.projectName}
                            </p>

                            <p>
                                <strong>Status:</strong> {group.status}
                            </p>

                            <hr style={{ margin: "15px 0" }} />

                            <label>Upload Final Report (PDF)</label>
                            <input
                                type="file"
                                className="input"
                                accept=".pdf"
                                onChange={(e) => setReport(e.target.files[0])}
                            />

                            <label>Upload Presentation (PPT / PPTX / PDF)</label>
                            <input
                                type="file"
                                className="input"
                                accept=".ppt,.pptx,.pdf"
                                onChange={(e) => setPpt(e.target.files[0])}
                            />

                            <label>Upload Project Images</label>
                            <input
                                type="file"
                                className="input"
                                multiple
                                accept="image/png,image/jpeg"
                                onChange={(e) => setImages([...e.target.files])}
                            />

                            <button
                                className="btn-primary"
                                style={{ marginTop: "15px" }}
                                onClick={handleUpload}
                                disabled={loading}
                            >
                                {loading ? "Uploading..." : "Upload Files"}
                            </button>

                        </>

                    )}

                </div>

            </div>

        </div>

    );

}