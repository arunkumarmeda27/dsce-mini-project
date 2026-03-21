import { useState } from "react";
import { api } from "../services/api";

export default function ChangePassword() {

    const [password, setPassword] = useState("");

    const updatePassword = async () => {

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        try {

            const res = await api.resetPassword(password);

            alert(res.message);

            setPassword("");

        } catch (error) {

            alert("Password update failed");

        }

    };

    return (

        <div className="card">

            <h3 style={{ color: "#0B3D91" }}>
                Change Password
            </h3>

            <input
                type="password"
                placeholder="New Password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                className="btn-primary"
                style={{ marginTop: "10px" }}
                onClick={updatePassword}
            >
                Update Password
            </button>

        </div>

    );
}