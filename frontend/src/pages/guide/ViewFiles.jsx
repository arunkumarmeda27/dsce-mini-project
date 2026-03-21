import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Preloader from "../../components/Preloader";

const BASE_URL = "http://127.0.0.1:8000";

export default function ViewFiles() {

    const { groupId } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {

        try {

            const res = await fetch(`${BASE_URL}/groups/submission/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });

            const result = await res.json();

            if (res.ok) {
                setData(result);
            }

        } catch {
            console.log("Error loading files");
        }

        setLoading(false);
    };

    if (loading) return <Preloader />;

    return (

        <div>

            <Header />
            <Sidebar role="guide" />

            <div className="main">

                <div style={card}>

                    <h2 style={{ color: "#1565C0" }}>
                        📂 Project Files
                    </h2>

                    <p><b>Group:</b> {groupId}</p>

                </div>

                {!data ? (

                    <div style={card}>
                        <p>No files uploaded</p>
                    </div>

                ) : (

                    <>

                        {/* REPORT */}
                        {data.reportUrl && (
                            <div style={card}>

                                <h3>📄 Report Preview</h3>

                                <iframe
                                    src={`${BASE_URL}${data.reportUrl}`}
                                    width="100%"
                                    height="400px"
                                    style={{
                                        borderRadius: "10px",
                                        border: "1px solid #ddd"
                                    }}
                                />

                                <a
                                    href={`${BASE_URL}${data.reportUrl}`}
                                    target="_blank"
                                    download
                                >
                                    <button className="btn-primary"
                                        style={{ marginTop: "10px" }}>
                                        Download Report
                                    </button>
                                </a>

                            </div>
                        )}

                        {/* PPT */}
                        {data.pptUrl && (
                            <div style={card}>

                                <h3>📊 Presentation</h3>

                                <a
                                    href={`${BASE_URL}${data.pptUrl}`}
                                    target="_blank"
                                >
                                    <button className="btn-primary">
                                        Open / Download PPT
                                    </button>
                                </a>

                            </div>
                        )}

                        {/* IMAGES */}
                        {data.images?.length > 0 && (
                            <div style={card}>

                                <h3>🖼 Project Images</h3>

                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                                    gap: "15px",
                                    marginTop: "10px"
                                }}>

                                    {data.images.map((img, i) => (

                                        <div key={i} style={{
                                            borderRadius: "10px",
                                            overflow: "hidden",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                                        }}>

                                            <img
                                                src={`${BASE_URL}${img}`}
                                                alt="project"
                                                style={{
                                                    width: "100%",
                                                    height: "180px",
                                                    objectFit: "cover"
                                                }}
                                            />

                                            <a
                                                href={`${BASE_URL}${img}`}
                                                target="_blank"
                                            >
                                                <button
                                                    style={{
                                                        width: "100%",
                                                        padding: "8px",
                                                        background: "#1565C0",
                                                        color: "white",
                                                        border: "none",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </a>

                                        </div>

                                    ))}

                                </div>

                            </div>
                        )}

                    </>

                )}

            </div>

        </div>
    );
}


// ================= STYLES =================
const card = {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 6px 25px rgba(0,0,0,0.06)",
    marginBottom: "20px"
};