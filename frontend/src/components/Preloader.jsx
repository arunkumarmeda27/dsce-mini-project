export default function Preloader() {

    return (

        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#F4F6F9",
                flexDirection: "column"
            }}
        >

            <div
                style={{
                    width: "60px",
                    height: "60px",
                    border: "6px solid #ddd",
                    borderTop: "6px solid #0B3D91",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }}
            />

            <p style={{ marginTop: "15px", color: "#0B3D91" }}>
                Loading Dashboard...
            </p>

            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>

        </div>
    );
}
