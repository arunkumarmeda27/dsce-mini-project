import { useNavigate } from "react-router-dom";

export default function Header() {

    const nav = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        nav("/");
    };

    return (
        <div className="header">

            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>

                <img
                    src="/src/assets/dsce-logo.png"
                    height="45"
                    alt="DSCE Logo"
                />

                <div>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                        Dayananda Sagar College of Engineering
                    </div>
                    <div style={{ fontSize: "12px" }}>
                        Mini Project Management Portal
                    </div>
                </div>

            </div>

            <button
                className="btn-accent"
                onClick={logout}
            >
                Logout
            </button>

        </div>
    );
}