export default function StatusTimeline({ status }) {

    const steps = [
        { key: "CREATED", label: "Group Created" },
        { key: "GUIDE_ASSIGNED", label: "Guide Assigned" },
        { key: "GUIDE_ACCEPTED", label: "Guide Accepted" },
        { key: "GUIDE_REJECTED", label: "Guide Rejected" }
    ];

    const getColor = (stepKey) => {

        if (status === "GUIDE_REJECTED" && stepKey === "GUIDE_REJECTED") {
            return "red";
        }

        const order = ["CREATED", "GUIDE_ASSIGNED", "GUIDE_ACCEPTED"];

        if (order.indexOf(stepKey) <= order.indexOf(status)) {
            return "green";
        }

        return "gray";
    };

    return (

        <div style={{ marginTop: "10px" }}>

            {steps.map(step => (

                <div
                    key={step.key}
                    style={{
                        padding: "6px 0",
                        fontWeight: "500",
                        color: getColor(step.key)
                    }}
                >

                    {step.label}

                </div>

            ))}

        </div>

    );

}