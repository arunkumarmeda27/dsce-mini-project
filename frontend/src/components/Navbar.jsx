import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import BackButton from "./BackButton";

export default function Navbar() {

    const nav = useNavigate();

    return (

        <div className="glass p-4 flex justify-between items-center">

            <div className="flex items-center gap-3">

                <img
                    src="/src/assets/dsce-logo.png"
                    className="h-10"
                />

                <h1 className="text-yellow-400 text-xl font-bold">
                    DSCE Project System
                </h1>

            </div>

            <div className="flex gap-2">

                <BackButton />
                <ThemeToggle />

                <button
                    onClick={() => nav("/")}
                    className="btn w-auto px-4">
                    Logout
                </button>

            </div>

        </div>

    );

}
