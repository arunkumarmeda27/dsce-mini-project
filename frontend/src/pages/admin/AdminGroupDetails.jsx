import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminGroupDetails() {

    const navigate = useNavigate();

    const [projectName, setProjectName] =
        useState("Smart Water Monitoring");

    const [domain, setDomain] =
        useState("IoT");

    const saveChanges = () => {

        alert("Group updated successfully");

    };

    return (

        <div>

            <Header />

            <Sidebar role="admin" />

            <div className="main">

                <div className="card">

                    <h2>Edit Group Details</h2>

                    <label>Project Name</label>

                    <input
                        className="input"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />

                    <label>Domain</label>

                    <input
                        className="input"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                    />

                    <button
                        className="btn-primary"
                        onClick={saveChanges}
                    >
                        Save
                    </button>

                    <button
                        className="btn-accent"
                        style={{ marginLeft: "10px" }}
                        onClick={() => navigate("/manage-groups")}
                    >
                        Back
                    </button>

                </div>

            </div>

        </div>

    );

}