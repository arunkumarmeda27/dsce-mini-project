import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { auth } from "../../firebase/config";
import Preloader from "../../components/Preloader";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function AdminDashboard() {

    const [adminInfo, setAdminInfo] = useState({});
    const [pendingUsers, setPendingUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [guides, setGuides] = useState([]);
    const [groups, setGroups] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [domainStats, setDomainStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadData();

        const user = auth.currentUser;

        if (user) {
            const email = user.email || "";
            let branch = "";

            if (email.includes("admin.")) {
                const parts = email.split(".");
                branch = parts[1]?.split("@")[0]?.toUpperCase();
            }

            setAdminInfo({
                email,
                branch,
                role: "Branch Coordinator"
            });
        }

    }, []);

    const loadData = async () => {

        setLoading(true);

        try {

            const [pending, studentList, guideList, groupList] = await Promise.all([
                api.getPendingUsers(),
                api.getStudents(),
                api.getGuides(),
                api.getBranchGroups()
            ]);

            setPendingUsers(pending || []);
            setStudents(studentList || []);
            setGuides(guideList || []);
            setGroups(groupList || []);

            setChartData([
                { name: "Students", value: studentList.length },
                { name: "Guides", value: guideList.length },
                { name: "Groups", value: groupList.length },
                { name: "Pending", value: pending.length }
            ]);

            calculateDomainStats(groupList);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }

    };

    const calculateDomainStats = (groups) => {

        const stats = {};

        groups.forEach(g => {
            const domain = g.domain || "Other";
            stats[domain] = (stats[domain] || 0) + 1;
        });

        setDomainStats(
            Object.entries(stats).map(([domain, count]) => ({
                domain,
                count
            }))
        );
    };

    const downloadFile = async (type) => {

        try {

            const token = localStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/groups/export/${type}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) return;

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `DSCE_Report.${type === "excel" ? "xlsx" : "pdf"}`;
            a.click();

        } catch {
            console.log("Export error");
        }

    };

    // 🔥 PRELOADER
    if (loading) return <Preloader />;

    return (

        <div>

            <Header />
            <Sidebar role="admin" />

            <div className="main">

                {/* PROFILE */}
                <div className="card">
                    <h2 style={{ color: "#1565C0" }}>Admin Dashboard</h2>
                    <p><b>Email:</b> {adminInfo.email}</p>
                    <p><b>Branch:</b> {adminInfo.branch}</p>
                </div>

                {/* 🔥 MANUAL REFRESH BUTTON */}
                <div className="card">
                    <button className="btn-primary" onClick={loadData}>
                        🔄 Refresh Data
                    </button>
                </div>

                {/* EXPORT */}
                <div className="card">
                    <h3>Export Reports</h3>

                    <button
                        className="btn-primary"
                        onClick={() => downloadFile("excel")}
                    >
                        Export Excel
                    </button>

                    <button
                        className="btn-accent"
                        style={{ marginLeft: "10px" }}
                        onClick={() => downloadFile("pdf")}
                    >
                        Export PDF
                    </button>
                </div>

                {/* STATS */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                    gap: "15px"
                }}>
                    <StatCard title="Students" value={students.length} />
                    <StatCard title="Guides" value={guides.length} />
                    <StatCard title="Groups" value={groups.length} />
                    <StatCard title="Pending" value={pendingUsers.length} />
                </div>

                {/* MAIN CHART */}
                <div className="card">
                    <h3>System Analytics</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#1565C0" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* DOMAIN CHART */}
                <div className="card">
                    <h3>Domain Statistics</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={domainStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="domain" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#2E7D32" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>

        </div>
    );

}

// ===============================
// STAT CARD COMPONENT
// ===============================
function StatCard({ title, value }) {

    return (
        <div className="card" style={{
            textAlign: "center",
            padding: "20px"
        }}>
            <h4 style={{ color: "#666" }}>{title}</h4>
            <h2 style={{ color: "#1565C0" }}>{value}</h2>
        </div>
    );

}
