import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

/* ================= AUTH CHECK ================= */
const isLoggedIn = () => {
  return localStorage.getItem("token");
};

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/" />;
};

/* ================= PUBLIC ROUTE ================= */
const PublicRoute = ({ children }) => {
  return isLoggedIn() ? <Navigate to="/student" /> : children;
};

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ================= AUTH ================= */}
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/signup" element={<Signup />} />

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
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>

    </BrowserRouter>

  );
}
