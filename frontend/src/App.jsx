import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* ================= AUTH PAGES ================= */
import Login from "./pages/Login";
import Signup from "./pages/Signup";

/* ================= STUDENT PAGES ================= */
import CompleteProfile from "./pages/CompleteProfile";
import StudentDashboard from "./pages/student/StudentDashboard";
import CreateGroup from "./pages/student/CreateGroup";
import GroupStatus from "./pages/student/GroupStatus";
import UploadProject from "./pages/student/UploadProject";

/* ================= ADMIN PAGES ================= */
import AdminDashboard from "./pages/admin/AdminDashboard";
import Approvals from "./pages/admin/Approvals";
import ManageGroups from "./pages/admin/ManageGroups";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageGuides from "./pages/admin/ManageGuides";

/* ================= GUIDE PAGES ================= */
import GuideDashboard from "./pages/guide/GuideDashboard";
import ViewFiles from "./pages/guide/ViewFiles";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ==============================================
// KEEPALIVE: ping backend on load so Render
// wakes up BEFORE the user even tries to login
// ==============================================
function BackendKeepAlive() {
    useEffect(() => {
        fetch(`${BASE_URL}/health`, { method: "GET" })
            .then(() => console.log("✅ Backend warmed up"))
            .catch(() => console.warn("⚠ Backend ping failed — may be cold starting"));
    }, []);
    return null;
}

// ==============================================
// FULL-SCREEN SPLASH while Firebase resolves
// ==============================================
function AuthSplash() {
    return (
        <div style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f4f7ff",
            gap: "16px"
        }}>
            <div style={{
                width: "44px",
                height: "44px",
                border: "4px solid #e0e6fd",
                borderTop: "4px solid #1565C0",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
            }} />
            <p style={{ color: "#1565C0", fontWeight: 600, fontSize: "15px", margin: 0 }}>
                Loading DSCE Portal...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ==============================================
// PROTECTED ROUTE — handles auth + approval
// ==============================================
function ProtectedRoute({ children }) {
    const { user, authLoading, refreshAuth } = useAuth();

    if (authLoading) return <AuthSplash />;

    // Not logged in -> Login
    if (!user) return <Navigate to="/" replace />;

    // Logged in but not approved -> Approval Splash
    if (user.role !== "admin" && !user.approved) {
        return (
            <div style={{
                height: "100vh",
                background: "#f8faff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "20px"
            }}>
                <div style={{
                    fontSize: "60px",
                    marginBottom: "20px"
                }}>⏳</div>
                <h2 style={{ color: "#1565C0", margin: "0 0 10px 0" }}>Pending Admin Approval</h2>
                <p style={{ color: "#666", maxWidth: "400px", lineHeight: "1.6", marginBottom: "25px" }}>
                    Your account has been created successfully. For security reasons, a college admin must verify your profile before you can access the dashboard.
                </p>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button 
                        onClick={() => refreshAuth()}
                        style={{
                            padding: "12px 24px",
                            background: "#1565C0",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        🔄 Check Status
                    </button>
                    <button 
                        onClick={() => auth.signOut()}
                        style={{
                            padding: "12px 24px",
                            background: "white",
                            color: "#1565C0",
                            border: "1px solid #1565C0",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Logout
                    </button>
                </div>
                <p style={{ marginTop: "30px", fontSize: "12px", color: "#999" }}>
                    Average approval time: 24-48 hours.
                </p>
            </div>
        );
    }

    return children;
}

// ==============================================
// PUBLIC ROUTE — redirects if already logged in
// ==============================================
function PublicRoute({ children }) {
    const { user, authLoading } = useAuth();

    if (authLoading) return <AuthSplash />;

    if (user) {
        // Redirection logic based on database role (Single Source of Truth)
        if (user.role === "admin") return <Navigate to="/admin" replace />;
        if (user.role === "guide") return <Navigate to="/guide" replace />;
        
        // If user exists but role is missing -> Complete Profile
        if (!user.role) return <Navigate to="/complete-profile" replace />;
        
        // Default for students
        return <Navigate to="/student" replace />;
    }

    return children;
}

// ==============================================
// ROUTES
// ==============================================
function AppRoutes() {
    return (
        <Routes>

            {/* ================= AUTH ================= */}
            <Route path="/" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />

            <Route path="/signup" element={
                <PublicRoute>
                    <Signup />
                </PublicRoute>
            } />

            {/* ================= PROFILE ================= */}
            <Route path="/complete-profile" element={
                <ProtectedRoute>
                    <CompleteProfile />
                </ProtectedRoute>
            } />

            {/* ================= STUDENT ================= */}
            <Route path="/student" element={
                <ProtectedRoute>
                    <StudentDashboard />
                </ProtectedRoute>
            } />

            <Route path="/create-group" element={
                <ProtectedRoute>
                    <CreateGroup />
                </ProtectedRoute>
            } />

            <Route path="/group-status" element={
                <ProtectedRoute>
                    <GroupStatus />
                </ProtectedRoute>
            } />

            <Route path="/upload" element={
                <ProtectedRoute>
                    <UploadProject />
                </ProtectedRoute>
            } />

            {/* ================= ADMIN ================= */}
            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminDashboard />
                </ProtectedRoute>
            } />

            <Route path="/approvals" element={
                <ProtectedRoute>
                    <Approvals />
                </ProtectedRoute>
            } />

            <Route path="/manage-groups" element={
                <ProtectedRoute>
                    <ManageGroups />
                </ProtectedRoute>
            } />

            <Route path="/manage-students" element={
                <ProtectedRoute>
                    <ManageStudents />
                </ProtectedRoute>
            } />

            <Route path="/manage-guides" element={
                <ProtectedRoute>
                    <ManageGuides />
                </ProtectedRoute>
            } />

            {/* ================= GUIDE ================= */}
            <Route path="/guide" element={
                <ProtectedRoute>
                    <GuideDashboard />
                </ProtectedRoute>
            } />

            <Route path="/guide/view-files" element={
                <ProtectedRoute>
                    <ViewFiles />
                </ProtectedRoute>
            } />

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
    );
}

// ==============================================
// ROOT APP
// ==============================================
export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <BackendKeepAlive />
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}
