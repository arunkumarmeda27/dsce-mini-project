import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function ChangePassword() {

    return (

        <div>

            <Header />

            <div className="main">

                <div className="card">

                    <h2>Change Password</h2>

                    <label>Old Password</label>

                    <input type="password" className="input" />

                    <label>New Password</label>

                    <input type="password" className="input" />

                    <label>Confirm Password</label>

                    <input type="password" className="input" />

                    <button className="btn-primary">
                        Update Password
                    </button>

                </div>

            </div>

        </div>

    );

}