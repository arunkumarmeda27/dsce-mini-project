import { useLocation } from "react-router-dom";

export default function Preloader() {

    const location = useLocation();
    const path = location.pathname;

    let layoutType = "dashboard";
    if (path.includes("manage") || path.includes("approvals") || path.includes("status")) {
        layoutType = "table";
    } else if (path.includes("create") || path.includes("upload") || path.includes("profile") || path === "/") {
        layoutType = "form";
    }

    return (
        <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
            
            {/* SKELETON HEADER */}
            <div style={{
                position: "fixed",
                top: 0, left: 0, right: 0,
                height: "60px",
                background: "white",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                zIndex: 1000
            }}>
                <div className="skeleton-pulse" style={{ width: "40px", height: "40px", borderRadius: "50%" }}></div>
                <div className="skeleton-pulse" style={{ width: "150px", height: "20px", marginLeft: "10px", borderRadius: "4px" }}></div>
                <div className="skeleton-pulse" style={{ width: "35px", height: "35px", borderRadius: "50%", marginLeft: "auto" }}></div>
            </div>

            {/* SKELETON SIDEBAR (Desktop only visual) */}
            <div className="skeleton-sidebar" style={{
                width: "230px",
                height: "100vh",
                background: "#F5F9FF",
                borderRight: "1px solid #eee",
                padding: "80px 15px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "15px"
            }}>
                <div className="skeleton-pulse" style={{ width: "100%", height: "40px", borderRadius: "8px" }}></div>
                <div className="skeleton-pulse" style={{ width: "100%", height: "40px", borderRadius: "8px" }}></div>
                <div className="skeleton-pulse" style={{ width: "100%", height: "40px", borderRadius: "8px" }}></div>
                <div className="skeleton-pulse" style={{ width: "70%", height: "20px", borderRadius: "4px", marginTop: "20px" }}></div>
                <div className="skeleton-pulse" style={{ width: "100%", height: "40px", borderRadius: "8px" }}></div>
            </div>

            {/* SKELETON MAIN CONTENT */}
            <div className="skeleton-main" style={{
                flex: 1,
                marginTop: "60px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
            }}>
                
                {/* CONDITIONAL RENDER BASED ON URL */}

                {layoutType === "dashboard" && (
                    <>
                        {/* Top Row Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                            <div className="skeleton-card" style={{ background: "white", height: "180px", borderRadius: "14px", padding: "20px" }}>
                                <div className="skeleton-pulse" style={{ width: "40%", height: "24px", borderRadius: "4px", marginBottom: "20px" }}></div>
                                <div className="skeleton-pulse" style={{ width: "80%", height: "14px", borderRadius: "4px", marginBottom: "10px" }}></div>
                                <div className="skeleton-pulse" style={{ width: "90%", height: "14px", borderRadius: "4px", marginBottom: "10px" }}></div>
                                <div className="skeleton-pulse" style={{ width: "70%", height: "14px", borderRadius: "4px" }}></div>
                            </div>
                            
                            <div className="skeleton-card" style={{ background: "white", height: "180px", borderRadius: "14px", padding: "20px" }}>
                                <div className="skeleton-pulse" style={{ width: "50%", height: "24px", borderRadius: "4px", marginBottom: "20px" }}></div>
                                <div className="skeleton-pulse" style={{ width: "100%", height: "40px", borderRadius: "6px", marginBottom: "10px" }}></div>
                                <div className="skeleton-pulse" style={{ width: "100%", height: "40px", borderRadius: "6px" }}></div>
                            </div>
                        </div>

                        {/* Big Bottom Card */}
                        <div className="skeleton-card" style={{ background: "white", flex: 1, minHeight: "300px", borderRadius: "14px", padding: "20px" }}>
                            <div className="skeleton-pulse" style={{ width: "30%", height: "28px", borderRadius: "4px", marginBottom: "25px" }}></div>
                            <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                                <div className="skeleton-pulse" style={{ width: "25%", height: "60px", borderRadius: "10px" }}></div>
                                <div className="skeleton-pulse" style={{ width: "25%", height: "60px", borderRadius: "10px" }}></div>
                                <div className="skeleton-pulse" style={{ width: "25%", height: "60px", borderRadius: "10px" }}></div>
                                <div className="skeleton-pulse" style={{ width: "25%", height: "60px", borderRadius: "10px" }}></div>
                            </div>
                            <div className="skeleton-pulse" style={{ width: "100%", height: "120px", borderRadius: "10px" }}></div>
                        </div>
                    </>
                )}

                {layoutType === "table" && (
                    <div className="skeleton-card" style={{ background: "white", flex: 1, minHeight: "500px", borderRadius: "14px", padding: "30px" }}>
                        <div className="skeleton-pulse" style={{ width: "200px", height: "30px", borderRadius: "6px", marginBottom: "30px" }}></div>
                        <div className="skeleton-pulse" style={{ width: "100%", height: "40px", borderRadius: "6px", marginBottom: "15px" }}></div>
                        <div className="skeleton-pulse" style={{ width: "100%", height: "60px", borderRadius: "6px", marginBottom: "10px" }}></div>
                        <div className="skeleton-pulse" style={{ width: "100%", height: "60px", borderRadius: "6px", marginBottom: "10px" }}></div>
                        <div className="skeleton-pulse" style={{ width: "100%", height: "60px", borderRadius: "6px", marginBottom: "10px" }}></div>
                        <div className="skeleton-pulse" style={{ width: "100%", height: "60px", borderRadius: "6px", marginBottom: "10px" }}></div>
                    </div>
                )}

                {layoutType === "form" && (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <div className="skeleton-card" style={{ background: "white", width: "100%", maxWidth: "500px", borderRadius: "14px", padding: "30px" }}>
                            <div className="skeleton-pulse" style={{ width: "180px", height: "30px", borderRadius: "6px", marginBottom: "30px", margin: "0 auto" }}></div>
                            
                            <div className="skeleton-pulse" style={{ width: "30%", height: "14px", borderRadius: "4px", marginBottom: "8px" }}></div>
                            <div className="skeleton-pulse" style={{ width: "100%", height: "45px", borderRadius: "8px", marginBottom: "20px" }}></div>

                            <div className="skeleton-pulse" style={{ width: "20%", height: "14px", borderRadius: "4px", marginBottom: "8px" }}></div>
                            <div className="skeleton-pulse" style={{ width: "100%", height: "45px", borderRadius: "8px", marginBottom: "20px" }}></div>

                            <div className="skeleton-pulse" style={{ width: "40%", height: "14px", borderRadius: "4px", marginBottom: "8px" }}></div>
                            <div className="skeleton-pulse" style={{ width: "100%", height: "45px", borderRadius: "8px", marginBottom: "30px" }}></div>

                            <div className="skeleton-pulse" style={{ width: "100%", height: "50px", borderRadius: "8px" }}></div>
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
}
