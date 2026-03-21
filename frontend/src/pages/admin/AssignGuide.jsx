import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useState } from "react";

export default function AssignGuide() {

    const [assigned, setAssigned] = useState(false);

    const assignGuide = () => {

        setAssigned(true);

    };

    return (

        <div>

            <Header />
            <Sidebar role="admin" />

            <div className="main">

                <div className="card">

                    <h2>Pending Group</h2>

                    <p>Group: Smart Water Monitoring</p>

                    <select className="input">
                        <option>Dr. Guide 1</option>
                        <option>Dr. Guide 2</option>
                    </select>

                    <button
                        className="btn-primary"
                        onClick={assignGuide}
                    >
                        Assign Guide
                    </button>

                    {assigned && (
                        <p>Guide assigned successfully.</p>
                    )}

                </div>

            </div>

        </div>

    );

}
