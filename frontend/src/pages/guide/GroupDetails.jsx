import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function GroupDetails() {

    const navigate = useNavigate();

    const [projectName, setProjectName] =
        useState("Smart Water Monitoring");

    const [domain, setDomain] =
        useState("IoT");

    const saveChanges = () => {

        alert("Project details updated successfully");

    };

    const approveProject = () => {

        alert("Project approved successfully");

    };

    const rejectProject = () => {

        alert("Project rejected");

    };

    return (

        <div>

            <Header />

            <Sidebar role="guide" />

            <div className="main">

                <div className="card">

                    <h2 style={{ color: "#0B3D91" }}>
                        Project Group Details
                    </h2>


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


                    <label>Guide Assigned</label>

                    <input
                        className="input"
                        value="Dr. Test Guide"
                        disabled
                    />


                    <label>Group Members</label>

                    <ul>

                        <li>1DS24IS027</li>
                        <li>1DS24IS028</li>
                        <li>1DS24IS029</li>

                    </ul>


                    <button
                        className="btn-primary"
                        onClick={saveChanges}
                    >
                        Save Changes
                    </button>


                    <button
                        className="btn-accent"
                        style={{ marginLeft: "10px" }}
                        onClick={approveProject}
                    >
                        Approve Project
                    </button>


                    <button
                        className="btn-accent"
                        style={{ marginLeft: "10px" }}
                        onClick={rejectProject}
                    >
                        Reject Project
                    </button>


                    <button
                        className="btn-accent"
                        style={{ marginLeft: "10px" }}
                        onClick={() => navigate("/guide")}
                    >
                        Back
                    </button>

                </div>

            </div>

        </div>

    );

}