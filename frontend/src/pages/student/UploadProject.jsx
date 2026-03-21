import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Preloader from "../../components/Preloader";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function UploadProject() {

    const [group, setGroup] = useState(null);
    const [report, setReport] = useState(null);
    const [ppt, setPpt] = useState(null);
    const [images, setImages] = useState([]);

    const [pageLoading, setPageLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [toast, setToast] = useState(null);

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        fetchGroup();
    }, []);

    // =============================
    // TOAST
    // =============================
    const showToast = (msg, type = "info") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // =============================
    // FETCH GROUP
    // =============================
    const fetchGroup = async () => {
        try {
            const res = await fetch(`${BASE_URL}/groups/my-group`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            const data = await res.json();

            if (res.ok && data.groupId) {
                setGroup(data);
            }

        } catch {
            showToast("Server error", "error");
        }

        setPageLoading(false);
    };

    // =============================
    // VALIDATION
    // =============================
    const validateFiles = () => {

        if (report) {
            if (!report.name.toLowerCase().endsWith(".pdf"))
                return showToast("Report must be PDF", "error"), false;

            if (report.size > MAX_FILE_SIZE)
                return showToast("Report <10MB only", "error"), false;
        }

        if (ppt) {
            const valid =
                ppt.name.endsWith(".ppt") ||
                ppt.name.endsWith(".pptx") ||
                ppt.name.endsWith(".pdf");

            if (!valid)
                return showToast("Presentation must be PPT/PDF", "error"), false;
        }

        for (let img of images) {
            if (!["image/png", "image/jpeg"].includes(img.type))
                return showToast("Images must be JPG/PNG", "error"), false;

            if (img.size > MAX_FILE_SIZE)
                return showToast("Image <10MB", "error"), false;
        }

        return true;
    };

    // =============================
    // UPLOAD
    // =============================
    const handleUpload = async () => {

        if (!group) return showToast("Create group first", "error");

        if (!report && !ppt && images.length === 0)
            return showToast("Select at least one file", "error");

        if (!validateFiles()) return;

        try {

            setUploading(true);

            const formData = new FormData();

            if (report) formData.append("report", report);
            if (ppt) formData.append("ppt", ppt);
            images.forEach(img => formData.append("images", img));

            const res = await fetch(
                `${BASE_URL}/groups/upload-project/${group.groupId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: formData
                }
            );

            const data = await res.json();

            if (!res.ok)
                return showToast(data.detail || "Upload failed", "error");

            showToast("Uploaded successfully 🚀", "success");

            setReport(null);
            setPpt(null);
            setImages([]);

        } catch {
            showToast("Server error", "error");
        }

        setUploading(false);
    };

    if (pageLoading) return <Preloader />;

    return (

        <div>

            <Header />
            <Sidebar role="student" />

            {/* TOAST */}
            {toast && (
                <div style={{
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    background:
                        toast.type === "success" ? "#2E7D32" :
                            toast.type === "error" ? "#D32F2F" :
                                "#1565C0",
                    color: "white",
                    padding: "12px 18px",
                    borderRadius: "8px",
                    zIndex: 9999
                }}>
                    {toast.msg}
                </div>
            )}

            <div className="main">

                <div className="card" style={{
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                }}>

                    <h2 style={{ color: "#1565C0" }}>
                        📤 Upload Project Files
                    </h2>

                    {!group ? (

                        <p>No group found</p>

                    ) : (

                        <>

                            {/* PROJECT INFO */}
                            <div style={{
                                background: "#F5F9FF",
                                padding: "15px",
                                borderRadius: "12px",
                                marginBottom: "20px"
                            }}>
                                <p><strong>{group.projectName}</strong></p>
                                <p>ID: {group.groupId}</p>

                                <span style={{
                                    background: "#E3F2FD",
                                    padding: "4px 10px",
                                    borderRadius: "10px",
                                    fontSize: "12px"
                                }}>
                                    {group.status}
                                </span>
                            </div>

                            {/* FILE INPUTS */}
                            <FileInput label="Final Report" file={report} onChange={(e) => setReport(e.target.files[0])} />
                            <FileInput label="Presentation" file={ppt} onChange={(e) => setPpt(e.target.files[0])} />
                            <FileInput label="Project Images" files={images} multiple onChange={(e) => setImages([...e.target.files])} />

                            {/* BUTTON */}
                            <button
                                className="btn-primary"
                                style={{
                                    width: "100%",
                                    marginTop: "20px",
                                    padding: "12px"
                                }}
                                onClick={handleUpload}
                                disabled={uploading}
                            >
                                {uploading ? "Uploading..." : "🚀 Upload Files"}
                            </button>

                        </>

                    )}

                </div>

            </div>

        </div>
    );
}


// =============================
// PREMIUM FILE INPUT
// =============================
function FileInput({ label, onChange, file, files, multiple }) {

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files;

        if (multiple) {
            onChange({ target: { files: dropped } });
        } else {
            onChange({ target: { files: [dropped[0]] } });
        }
    };

    return (
        <div style={{ marginBottom: "20px" }}>

            <label style={{ fontWeight: "600" }}>{label}</label>

            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById(label).click()}
                style={{
                    border: "2px dashed #1565C0",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    background: "#F5F9FF",
                    cursor: "pointer",
                    marginTop: "8px"
                }}
            >

                📁 Drag & Drop or Click to Upload

                <input
                    id={label}
                    type="file"
                    multiple={multiple}
                    onChange={onChange}
                    style={{ display: "none" }}
                />

            </div>

            {/* FILE PREVIEW */}
            {file && <FileCard name={file.name} />}

            {files && files.length > 0 && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                    gap: "10px",
                    marginTop: "10px"
                }}>
                    {files.map((f, i) => (
                        <FileCard key={i} name={f.name} />
                    ))}
                </div>
            )}

        </div>
    );
}


// =============================
// FILE CARD
// =============================
function FileCard({ name }) {
    return (
        <div style={{
            padding: "10px",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
        }}>
            📄 {name}
        </div>
    );
}
