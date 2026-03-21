import { useEffect } from "react";

export default function Toast({ message, type, onClose }) {

    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "12px 18px",
            borderRadius: "8px",
            color: "white",
            background:
                type === "success" ? "#2E7D32" :
                    type === "error" ? "#D32F2F" :
                        "#1565C0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 9999
        }}>
            {message}
        </div>
    );
}
