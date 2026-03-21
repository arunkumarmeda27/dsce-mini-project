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
    onSnapshot,
    orderBy
} from "firebase/firestore";

export default function Header() {

    const nav = useNavigate();

    const [userName, setUserName] = useState("User");
    const [uid, setUid] = useState(null);

    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);

    // =========================
    // GET USER INFO
    // =========================
    useEffect(() => {

        const name = localStorage.getItem("name");
        const id = localStorage.getItem("uid");

        if (name) setUserName(name);
        if (id) {
            setUid(id);
            startNotifications(id);
        }

    }, []);

    // =========================
    // REALTIME NOTIFICATIONS
    // =========================
    const startNotifications = (uid) => {

        const q = query(
            collection(db, "notifications"),
            where("userId", "==", uid),
            orderBy("createdAt", "desc")
        );

        onSnapshot(q, (snapshot) => {

            const list = [];

            snapshot.forEach(doc => {
                list.push({ id: doc.id, ...doc.data() });
            });

            setNotifications(list);

        });
    };

    // =========================
    // LOGOUT
    // =========================
    const logout = async () => {

        try {
            await signOut(auth);
            localStorage.clear();
            window.location.href = "/";
        } catch {
            alert("Logout failed");
        }
    };

    return (

        <div style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            height: "70px",
            background: "#fff",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
        }}>

            {/* LEFT */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px"
            }}>
                <img src={logo} alt="logo" style={{ height: "42px" }} />

                <div>
                    <div style={{
                        fontWeight: "600",
                        fontSize: "15px",
                        color: "#1565C0"
                    }}>
                        DSCE Project Portal
                    </div>

                    <div style={{
                        fontSize: "11px",
                        color: "#777"
                    }}>
                        Mini Project Management
                    </div>
                </div>
            </div>


            {/* RIGHT */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "20px"
            }}>

                {/* 🔔 NOTIFICATION */}
                <div style={{ position: "relative" }}>

                    <div
                        onClick={() => setOpen(!open)}
                        style={{
                            cursor: "pointer",
                            fontSize: "20px",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            transition: "0.2s"
                        }}
                        onMouseEnter={(e) =>
                            e.currentTarget.style.background = "#F5F7FA"
                        }
                        onMouseLeave={(e) =>
                            e.currentTarget.style.background = "transparent"
                        }
                    >
                        🔔

                        {notifications.length > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "0px",
                                right: "0px",
                                background: "#D32F2F",
                                color: "white",
                                fontSize: "10px",
                                padding: "2px 6px",
                                borderRadius: "50%"
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
                            top: "40px",
                            width: "320px",
                            maxHeight: "400px",
                            overflowY: "auto",
                            background: "white",
                            borderRadius: "10px",
                            boxShadow: "0 6px 25px rgba(0,0,0,0.2)",
                            padding: "10px"
                        }}>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                <h4 style={{ margin: 0 }}>
                                    Notifications
                                </h4>

                                {notifications.length > 0 && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await api.clearNotifications();
                                            } catch (e) {
                                                console.error("Failed to clear notifications:", e);
                                            }
                                        }}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            color: "#1565C0",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            textDecoration: "underline"
                                        }}
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {notifications.length === 0 && (
                                <p style={{ color: "gray" }}>
                                    No notifications
                                </p>
                            )}

                            {notifications.map(n => (
                                <div key={n.id} style={{
                                    padding: "10px",
                                    marginBottom: "8px",
                                    borderRadius: "8px",
                                    background: "#F5F9FF",
                                    borderLeft: "4px solid #1565C0"
                                }}>
                                    <strong>{n.title || "Notification"}</strong>
                                    <p style={{ margin: "4px 0" }}>
                                        {n.message}
                                    </p>
                                </div>
                            ))}

                        </div>
                    )}

                </div>


                {/* USER NAME */}
                <div style={{
                    fontWeight: "500",
                    color: "#333"
                }}>
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
                        transition: "0.2s"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "#1565C0";
                        e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = "black";
                    }}
                >
                    Logout
                </button>

            </div>

        </div>
    );
}