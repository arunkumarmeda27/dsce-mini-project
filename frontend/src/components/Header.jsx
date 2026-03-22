import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import logo from "../assets/dsce-logo.png";
import { api } from "../services/api";

import { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";

export default function Header() {

    const nav = useNavigate();

    const [userName, setUserName] = useState("User");
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const name = localStorage.getItem("name");
        const id = localStorage.getItem("uid");
        if (name) setUserName(name);
        if (id) startNotifications(id);
    }, []);

    const startNotifications = (uid) => {
        // Query 1: notifications stored with userId field (from send-notification routes)
        const q1 = query(
            collection(db, "notifications"),
            where("userId", "==", uid)
        );
        // Query 2: notifications stored with users array (from create_notification helper)
        const q2 = query(
            collection(db, "notifications"),
            where("users", "array-contains", uid)
        );
        const seen = new Set();
        const merge = (snapshot) => {
            snapshot.forEach(doc => {
                if (!seen.has(doc.id)) {
                    seen.add(doc.id);
                }
            });
        };
        let list1 = [];
        let list2 = [];
        const update = () => {
            const merged = [];
            const ids = new Set();
            [...list1, ...list2].forEach(n => {
                if (!ids.has(n.id)) { ids.add(n.id); merged.push(n); }
            });
            setNotifications(merged);
        };
        onSnapshot(q1, (snapshot) => {
            list1 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            update();
        });
        onSnapshot(q2, (snapshot) => {
            list2 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            update();
        });
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.clear();
            document.body.classList.remove("sidebar-open");
            window.location.href = "/";
        } catch {
            alert("Logout failed");
        }
    };

    const toggleSidebar = () => {
        document.body.classList.toggle("sidebar-open");
    };

    return (
        <div className="app-header">

            {/* LEFT */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <button className="mobile-toggle" onClick={toggleSidebar}>
                    ☰
                </button>
                <img src={logo} alt="logo" style={{ height: "40px", flexShrink: 0 }} />
                <div className="header-title">
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#1565C0", whiteSpace: "nowrap" }}>
                        DSCE Project Portal
                    </div>
                    <div style={{ fontSize: "11px", color: "#777", whiteSpace: "nowrap" }}>
                        Mini Project Management
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>

                {/* NOTIFICATION BELL */}
                <div style={{ position: "relative" }}>
                    <div
                        onClick={() => setOpen(!open)}
                        style={{ cursor: "pointer", fontSize: "20px", padding: "6px 8px", borderRadius: "8px", position: "relative" }}
                    >
                        🔔
                        {notifications.length > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "0px", right: "0px",
                                background: "#D32F2F",
                                color: "white",
                                fontSize: "10px",
                                padding: "2px 5px",
                                borderRadius: "50%",
                                lineHeight: 1
                            }}>
                                {notifications.length}
                            </span>
                        )}
                    </div>

                    {/* DROPDOWN */}
                    {open && (
                        <div style={{
                            position: "absolute",
                            right: 0,
                            top: "45px",
                            width: "300px",
                            maxWidth: "90vw",
                            maxHeight: "400px",
                            overflowY: "auto",
                            background: "white",
                            borderRadius: "10px",
                            boxShadow: "0 6px 25px rgba(0,0,0,0.2)",
                            padding: "12px",
                            zIndex: 10000
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                <h4 style={{ margin: 0 }}>Notifications</h4>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={async () => {
                                            try { await api.clearNotifications(); } catch (e) { console.error(e); }
                                        }}
                                        style={{ background: "transparent", border: "none", color: "#1565C0", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                            {notifications.length === 0 && <p style={{ color: "gray" }}>No notifications</p>}
                            {notifications.map(n => (
                                <div key={n.id} style={{ padding: "10px", marginBottom: "8px", borderRadius: "8px", background: "#F5F9FF", borderLeft: "4px solid #1565C0" }}>
                                    <strong>{n.title || "Notification"}</strong>
                                    <p style={{ margin: "4px 0", fontSize: "13px" }}>{n.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* USER NAME - hidden on very small screens */}
                <div className="header-username" style={{ fontWeight: "500", color: "#333", whiteSpace: "nowrap" }}>
                    {userName}
                </div>

                {/* LOGOUT */}
                <button
                    onClick={logout}
                    style={{
                        border: "1px solid #ddd",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: "transparent",
                        whiteSpace: "nowrap",
                        fontSize: "13px"
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
