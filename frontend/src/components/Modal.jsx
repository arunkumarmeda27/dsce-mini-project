import { useEffect } from "react";

export default function Modal({ title, message, onClose }) {

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
        }}>

            <div style={{
                background: "white",
                padding: "25px",
                borderRadius: "12px",
                width: "350px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                textAlign: "center",
                animation: "fadeIn 0.3s ease"
            }}>

                <h3 style={{ color: "#1565C0" }}>{title}</h3>

                <p style={{ margin: "15px 0", color: "#555" }}>
                    {message}
                </p>

                <button
                    className="btn-primary"
                    onClick={onClose}
                    style={{ width: "100%" }}
                >
                    OK
                </button>

            </div>

        </div>
    );
}
