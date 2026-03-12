import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ================= AUTH PAGES ================= */
import Login from "./pages/Login";
import Signup from "./pages/Signup";

/* ================= STUDENT PAGES ================= */
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

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ================= AUTH ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ================= STUDENT ================= */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/group-status" element={<GroupStatus />} />
        <Route path="/upload" element={<UploadProject />} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/manage-groups" element={<ManageGroups />} />
        <Route path="/manage-students" element={<ManageStudents />} />
        <Route path="/manage-guides" element={<ManageGuides />} />

        {/* ================= GUIDE ================= */}
        <Route path="/guide" element={<GuideDashboard />} />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>

    </BrowserRouter>

  );
}