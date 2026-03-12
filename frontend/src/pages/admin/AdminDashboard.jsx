import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { auth } from "../../firebase/config";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {

    const [adminInfo, setAdminInfo] = useState({
        email: "",
        branch: "",
        role: ""
    });

    const [pendingUsers, setPendingUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [guides, setGuides] = useState([]);
    const [groups, setGroups] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    const [chartData, setChartData] = useState([]);
    const [domainStats, setDomainStats] = useState([]);

    useEffect(() => {

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

        loadData();

    }, []);

    const loadData = async () => {

        try {

            const pending = await api.getPendingUsers();
            const students = await api.getStudents();
            const guides = await api.getGuides();
            const groups = await api.getBranchGroups();
            const submissions = await api.getAllSubmissions();

            setPendingUsers(pending);
            setStudents(students);
            setGuides(guides);
            setGroups(groups);
            setSubmissions(submissions);

            setChartData([
                { name: "Students", value: students.length },
                { name: "Guides", value: guides.length },
                { name: "Groups", value: groups.length },
                { name: "Pending", value: pending.length }
            ]);

            calculateDomainStats(groups);

        } catch (err) {

            console.error(err);
            alert("Failed to load dashboard data");

        }

    };

    const calculateDomainStats = (groups) => {

        const stats = {};

        groups.forEach(g => {

            const domain = g.domain || "Other";

            if (!stats[domain]) stats[domain] = 0;

            stats[domain]++;

        });

        const formatted = Object.entries(stats).map(([domain, count]) => ({
            domain,
            count
        }));

        setDomainStats(formatted);

    };


    // =========================
    // EXPORT EXCEL
    // =========================
    const exportExcel = async () => {

        const token = localStorage.getItem("token");

        const res = await fetch(
            "http://127.0.0.1:8000/export/excel",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "DSCE_Group_Report.xlsx";
        a.click();

    };


    // =========================
    // EXPORT PDF
    // =========================
    const exportPDF = async () => {

        const token = localStorage.getItem("token");

        const res = await fetch(
            "http://127.0.0.1:8000/export/pdf",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "DSCE_Group_Report.pdf";
        a.click();

    };

    return (

        <div>

            <Header />
            <Sidebar role="admin" />

            <div className="main">

                {/* ADMIN INFO */}

                <div className="card">

                    <h2 style={{ color: "#0B3D91" }}>
                        Admin Dashboard
                    </h2>

                    <p><strong>Email:</strong> {adminInfo.email}</p>
                    <p><strong>Branch:</strong> {adminInfo.branch}</p>
                    <p><strong>Role:</strong> {adminInfo.role}</p>

                </div>


                {/* EXPORT */}

                <div className="card">

                    <h3 style={{ color: "#0B3D91" }}>
                        Export Group Reports
                    </h3>

                    <button className="btn-primary" onClick={exportExcel}>
                        Export Excel
                    </button>

                    <button
                        className="btn-accent"
                        style={{ marginLeft: "10px" }}
                        onClick={exportPDF}
                    >
                        Export PDF
                    </button>

                </div>


                {/* ANALYTICS */}

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: "15px",
                    marginBottom: "20px"
                }}>

                    <div className="card">
                        <h3>Total Students</h3>
                        <h2>{students.length}</h2>
                    </div>

                    <div className="card">
                        <h3>Total Guides</h3>
                        <h2>{guides.length}</h2>
                    </div>

                    <div className="card">
                        <h3>Total Groups</h3>
                        <h2>{groups.length}</h2>
                    </div>

                    <div className="card">
                        <h3>Pending Approvals</h3>
                        <h2>{pendingUsers.length}</h2>
                    </div>

                </div>


                {/* ANALYTICS CHART */}

                <div className="card">

                    <h3 style={{ color: "#0B3D91" }}>
                        System Analytics
                    </h3>

                    <ResponsiveContainer width="100%" height={300}>

                        <BarChart data={chartData}>

                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />

                            <Bar dataKey="value" fill="#0B3D91" />

                        </BarChart>

                    </ResponsiveContainer>

                </div>


                {/* DOMAIN CHART */}

                <div className="card">

                    <h3 style={{ color: "#0B3D91" }}>
                        Project Domain Statistics
                    </h3>

                    <ResponsiveContainer width="100%" height={300}>

                        <BarChart data={domainStats}>

                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="domain" />
                            <YAxis />
                            <Tooltip />

                            <Bar dataKey="count" fill="#FFC107" />

                        </BarChart>

                    </ResponsiveContainer>

                </div>


                {/* PROJECT SUBMISSIONS */}

                <div className="card">

                    <h3 style={{ color: "#0B3D91" }}>
                        Project Submissions
                    </h3>

                    {submissions.length === 0 && (
                        <p>No submissions yet</p>
                    )}

                    {submissions.map(sub => (

                        <div
                            key={sub.id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "15px",
                                marginTop: "15px",
                                borderRadius: "8px"
                            }}
                        >

                            <p><strong>Group:</strong> {sub.groupId}</p>

                            <p><strong>Status:</strong> {sub.status}</p>

                            <div>

                                {sub.reportUrl && (
                                    <a href={sub.reportUrl} target="_blank">
                                        Download Report
                                    </a>
                                )}

                                <br />

                                {sub.pptUrl && (
                                    <a href={sub.pptUrl} target="_blank">
                                        Download PPT
                                    </a>
                                )}

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}