import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ role }) {

    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const go = (path) => navigate(path);

    const Item = ({ icon, label, path }) => {

        const active = isActive(path);

        return (
            <div
                onClick={() => go(path)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    marginBottom: "6px",
                    transition: "all 0.3s ease",
                    background: active ? "#1565C0" : "transparent",
                    color: active ? "white" : "#333",
                    boxShadow: active
                        ? "0 4px 12px rgba(21,101,192,0.4)"
                        : "none"
                }}
                onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "#F5F9FF";
                }}
                onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                }}
            >
                <span style={{ fontSize: "18px" }}>{icon}</span>
                <span style={{ fontWeight: "500" }}>{label}</span>
            </div>
        );
    };

    return (

        <div style={{
            width: "230px",
            height: "100vh",
            background: "linear-gradient(180deg,#ffffff,#F5F9FF)",
            borderRight: "1px solid #eee",
            padding: "20px 15px",
            position: "fixed",
            left: 0,
            top: 0
        }}>

            {/* TITLE */}
            <div style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1565C0",
                marginBottom: "25px"
            }}>
                🚀 Project Portal
            </div>

            {/* DASHBOARD */}
            <Item icon="📊" label="Dashboard" path={`/${role}`} />

            {/* STUDENT */}
            {role === "student" && (
                <>
                    <Section title="Student Panel" />

                    <Item icon="👥" label="Create Group" path="/create-group" />
                    <Item icon="📄" label="Group Status" path="/group-status" />
                    <Item icon="⬆" label="Upload Project" path="/upload" />
                </>
            )}

            {/* ADMIN */}
            {role === "admin" && (
                <>
                    <Section title="Admin Controls" />

                    <Item icon="✅" label="Approve Users" path="/approvals" />
                    <Item icon="🎓" label="Manage Students" path="/manage-students" />
                    <Item icon="🧑‍🏫" label="Manage Guides" path="/manage-guides" />
                    <Item icon="📁" label="Manage Groups" path="/manage-groups" />
                </>
            )}

            {/* GUIDE */}
            {role === "guide" && (
                <>
                    <Section title="Guide Panel" />

                    <Item icon="📚" label="My Projects" path="/guide" />
                </>
            )}

        </div>

    );
}


// =======================
// SECTION TITLE
// =======================
function Section({ title }) {

    return (
        <div style={{
            fontSize: "12px",
            color: "#888",
            marginTop: "20px",
            marginBottom: "10px",
            paddingLeft: "5px"
        }}>
            {title}
        </div>
    );
}