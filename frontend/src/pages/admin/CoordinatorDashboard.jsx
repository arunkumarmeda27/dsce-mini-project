import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

export default function CoordinatorDashboard() {

    const navigate = useNavigate();

    return (

        <div>

            <Header />
            <Sidebar role="admin" />

            <div className="main">

                <div className="card">

                    <h2>Branch Project Coordinator Panel</h2>

                    <button
                        className="btn-primary"
                        onClick={() => navigate("/assign-guide")}
                    >
                        View Pending Groups
                    </button>

                </div>

            </div>

        </div>

    );

}
