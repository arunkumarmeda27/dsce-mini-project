import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ role }) {

    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path ? "sidebar-item active" : "sidebar-item";

    const go = (path) => navigate(path);

    return (

        <div className="sidebar">

            {/* ================= DASHBOARD ================= */}
            <div
                className={isActive(`/${role}`)}
                onClick={() => go(`/${role}`)}
            >
                Dashboard
            </div>


            {/* ================= STUDENT MENU ================= */}
            {role === "student" && (

                <>
                    <div className="sidebar-section">
                        Student Menu
                    </div>

                    <div
                        className={isActive("/create-group")}
                        onClick={() => go("/create-group")}
                    >
                        Create Group
                    </div>

                    <div
                        className={isActive("/group-status")}
                        onClick={() => go("/group-status")}
                    >
                        Group Status
                    </div>

                    <div
                        className={isActive("/upload")}
                        onClick={() => go("/upload")}
                    >
                        Upload Project
                    </div>
                </>

            )}


            {/* ================= ADMIN MENU ================= */}
            {role === "admin" && (

                <>
                    <div className="sidebar-section">
                        Admin Controls
                    </div>

                    <div
                        className={isActive("/approvals")}
                        onClick={() => go("/approvals")}
                    >
                        Approve Users
                    </div>

                    <div
                        className={isActive("/manage-students")}
                        onClick={() => go("/manage-students")}
                    >
                        Manage Students
                    </div>

                    <div
                        className={isActive("/manage-guides")}
                        onClick={() => go("/manage-guides")}
                    >
                        Manage Guides
                    </div>

                    <div
                        className={isActive("/manage-groups")}
                        onClick={() => go("/manage-groups")}
                    >
                        Manage Groups
                    </div>
                </>

            )}


            {/* ================= GUIDE MENU ================= */}
            {role === "guide" && (

                <>
                    <div className="sidebar-section">
                        Guide Panel
                    </div>

                    <div
                        className={isActive("/guide")}
                        onClick={() => go("/guide")}
                    >
                        My Projects
                    </div>
                </>

            )}

        </div>

    );

}