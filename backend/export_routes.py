from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from firebase_config import db
from auth_middleware import verify_user
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import pandas as pd
import tempfile

router = APIRouter()


# =====================================
# COLLECT GROUP DATA
# =====================================

def collect_groups(branch):

    groups = db.collection("groups") \
        .where("branch", "==", branch) \
        .stream()

    rows = []

    for g in groups:

        group = g.to_dict()

        members = []
        usns = []
        leader = ""

        for uid in group.get("members", []):

            user_doc = db.collection("users").document(uid).get()

            if user_doc.exists:

                user = user_doc.to_dict()

                members.append(user.get("name"))
                usns.append(user.get("usn"))

                if uid == group.get("leaderId"):
                    leader = user.get("name")

        guide_name = "Not Assigned"

        if group.get("guideId"):

            guide_doc = db.collection("users").document(group["guideId"]).get()

            if guide_doc.exists:
                guide_name = guide_doc.to_dict().get("name")

        rows.append({
            "Group ID": g.id,
            "Project Name": group.get("projectName"),
            "Domain": group.get("domain"),
            "Leader": leader,
            "Members": ", ".join(members),
            "USNs": ", ".join(usns),
            "Guide": guide_name
        })

    return rows


# =====================================
# EXPORT EXCEL
# =====================================

@router.get("/export/excel")
def export_excel(admin=Depends(verify_user)):

    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    data = collect_groups(admin["branch"])

    df = pd.DataFrame(data)

    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")

    df.to_excel(temp.name, index=False)

    return FileResponse(
        temp.name,
        filename="group_report.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# =====================================
# EXPORT PDF
# =====================================

@router.get("/export/pdf")
def export_pdf(admin=Depends(verify_user)):

    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    data = collect_groups(admin["branch"])

    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")

    c = canvas.Canvas(temp.name, pagesize=letter)

    y = 750
    c.setFont("Helvetica", 10)

    c.drawString(200, 780, "DSCE Mini Project Groups Report")

    y -= 40

    for row in data:

        text = (
            f"{row['Group ID']} | "
            f"{row['Project Name']} | "
            f"{row['Domain']} | "
            f"Leader: {row['Leader']} | "
            f"Guide: {row['Guide']}"
        )

        c.drawString(40, y, text)

        y -= 20

        if y < 100:
            c.showPage()
            y = 750

    c.save()

    return FileResponse(
        temp.name,
        filename="group_report.pdf",
        media_type="application/pdf"
    )