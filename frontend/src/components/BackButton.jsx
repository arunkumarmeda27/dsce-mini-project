import { useNavigate } from "react-router-dom";

export default function BackButton() {

    const navigate = useNavigate();

    return (

        <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 px-4 py-2">
            Back
        </button>

    );

}