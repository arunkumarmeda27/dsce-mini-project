import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {

    const navigate = useNavigate();

    const [role, setRole] = useState("student");

    const signup = () => {

        alert("Signup request sent to Admin for approval");
        navigate("/otp");

    };

    return (

        <div className="flex items-center justify-center h-screen">

            <div className="glass p-8 w-96 glow">

                <h1 className="text-3xl text-cyan-400 mb-4">
                    Signup
                </h1>

                <select
                    className="w-full p-2 mb-4 bg-black border border-cyan-500"
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="student">Student</option>
                    <option value="guide">Guide</option>
                </select>

                <input
                    className="w-full p-2 mb-4 bg-black border border-cyan-500"
                    placeholder="Name"
                />

                <input
                    className="w-full p-2 mb-4 bg-black border border-cyan-500"
                    placeholder="Email"
                />

                <input
                    type="password"
                    className="w-full p-2 mb-4 bg-black border border-cyan-500"
                    placeholder="Password"
                />

                <button
                    onClick={signup}
                    className="w-full bg-cyan-500 p-2 hover:bg-cyan-400"
                >
                    Signup
                </button>

            </div>

        </div>

    );

}