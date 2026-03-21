export default function StatusTimeline({ status }) {

    const steps = [
        { key: "CREATED", label: "Created" },
        { key: "GUIDE_ASSIGNED", label: "Guide Assigned" },
        { key: "GUIDE_ACCEPTED", label: "Accepted" },
        { key: "SUBMITTED", label: "Submitted" },
        { key: "APPROVED", label: "Approved" }
    ];

    const order = [
        "CREATED",
        "GUIDE_ASSIGNED",
        "GUIDE_ACCEPTED",
        "SUBMITTED",
        "APPROVED"
    ];

    const isCompleted = (stepKey) =>
        order.indexOf(stepKey) <= order.indexOf(status);

    const isRejected = status === "GUIDE_REJECTED";

    return (

        <div style={{ marginTop: "20px" }}>

            {/* PROGRESS BAR */}
            <div style={{
                position: "relative",
                height: "6px",
                background: "#ddd",
                borderRadius: "10px"
            }}>
                <div style={{
                    position: "absolute",
                    height: "6px",
                    width: `${(order.indexOf(status) / (steps.length - 1)) * 100}%`,
                    background: isRejected ? "#e53935" : "#2E7D32",
                    borderRadius: "10px"
                }} />
            </div>

            {/* STEPS */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "10px"
            }}>
                {steps.map((step, index) => {

                    const completed = isCompleted(step.key);

                    return (
                        <div key={step.key} style={{ textAlign: "center", width: "100%" }}>

                            <div style={{
                                margin: "0 auto",
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: isRejected
                                    ? "#e53935"
                                    : completed
                                        ? "#2E7D32"
                                        : "#ccc",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                {completed ? "✓" : index + 1}
                            </div>

                            <div style={{
                                marginTop: "6px",
                                fontSize: "12px"
                            }}>
                                {step.label}
                            </div>

                        </div>
                    );
                })}
            </div>

        </div>
    );
}
