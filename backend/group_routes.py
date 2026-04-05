from fastapi import APIRouter, Depends, HTTPException
from firebase_config import db
from firebase_admin import firestore
from auth_middleware import verify_user
from pydantic import BaseModel
from google.cloud.firestore_v1.base_query import FieldFilter
import os
from fastapi.responses import FileResponse, StreamingResponse
from email_service import send_email
from fastapi import UploadFile, File
from typing import List
import io
from openpyxl import Workbook
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from notification_service import create_notification

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ===============================
# MODELS
# ===============================
class CreateGroup(BaseModel):
    projectName: str
    domain: str
    members: list

# ===============================
# ELIGIBLE STUDENTS
# ===============================
@router.get("/eligible-students")
def get_eligible_students(user=Depends(verify_user)):
    students = db.collection("users") \
        .where("role", "==", "student") \
        .where("branch", "==", user["branch"]) \
        .where("approved", "==", True) \
        .stream()
    groups = db.collection("groups").stream()
    assigned = set()
    for g in groups:
        for m in g.to_dict().get("members", []):
            assigned.add(m)
    result = []
    for s in students:
        data = s.to_dict()
        if data["uid"] != user["uid"] and data["uid"] not in assigned:
            result.append({
                "uid": data["uid"],
                "name": data["name"],
                "usn": data["usn"]
            })
    return result


# ===============================
# CREATE GROUP
# ===============================

@router.post("/create-group")
def create_group(data: CreateGroup, user=Depends(verify_user)):
    if len(data.members) != 3:
        raise HTTPException(status_code=400, detail="Select exactly 3 members")
    all_members = [user["uid"]] + data.members
    # CHECK DUPLICATE MEMBERS
    for member in all_members:
        existing = db.collection("groups") \
            .where("members", "array_contains", member) \
            .stream()
        for _ in existing:
            raise HTTPException(
                status_code=400,
                detail="Member already in another group"
            )
    branch = user["branch"]
    joining_year = user.get("joiningYear")

    if not joining_year:
        raise HTTPException(status_code=400, detail="Joining year missing. Please complete your profile.")

    existing_groups = db.collection("groups") \
        .where("branch", "==", branch) \
        .where("joiningYear", "==", joining_year) \
        .stream()
    count = sum(1 for _ in existing_groups)
    group_id = f"{branch}{joining_year[-2:]}G{str(count+1).zfill(3)}"
    db.collection("groups").document(group_id).set({
        "groupId": group_id,
        "projectName": data.projectName,
        "domain": data.domain,
        "leaderId": user["uid"],
        "members": all_members,
        "branch": branch,
        "joiningYear": joining_year,
        "guideId": None,
        "status": "CREATED",
        "createdAt": firestore.SERVER_TIMESTAMP
    })

    # EMAIL — with full group details
    # Build members list for the email
    member_details = []
    leader_name = None
    for uid in all_members:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            u = user_doc.to_dict()
            name = u.get("name", "Unknown")
            usn = u.get("usn", "N/A")
            is_leader = uid == user["uid"]
            if is_leader:
                leader_name = name
            member_details.append(f"<li><b>{name}</b> ({usn}){' 👑 <i>Leader</i>' if is_leader else ''}</li>")

    members_html = "<ul>" + "".join(member_details) + "</ul>"

    for uid in all_members:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            u = user_doc.to_dict()
            email_target = u.get("email") or u.get("googleEmail")
            if email_target:
                send_email(
                    email_target,
                    f"Group Created – {data.projectName}",
                    f"""Hello {u.get('name')},<br><br>
                    Your mini project group has been successfully created!<br><br>
                    <b>Group ID:</b> {group_id}<br>
                    <b>Project Name:</b> {data.projectName}<br>
                    <b>Domain:</b> {data.domain}<br>
                    <b>Leader:</b> {leader_name}<br><br>
                    <b>Group Members:</b>{members_html}
                    A guide will be assigned by the admin soon. You will receive a notification once assigned.<br><br>
                    Best Regards,<br>DSCE Mini Project Portal"""
                )

    create_notification(
        all_members,
        "👥 Group Created",
        f"You have been added to group '{data.projectName}'",
        []
    )
    return {"message": "Group created", "groupId": group_id}

# ===============================
# MY GROUP (FIXED 🔥)
# ===============================
@router.get("/my-group")
def my_group(user=Depends(verify_user)):

    groups = db.collection("groups") \
        .where("members", "array_contains", user["uid"]) \
        .stream()

    for g in groups:

        data = g.to_dict()

        # MEMBERS
        members = []

        for uid in data.get("members", []):
            udoc = db.collection("users").document(uid).get()

            if udoc.exists:
                u = udoc.to_dict()

                members.append({
                    "uid": u["uid"],
                    "name": u["name"],
                    "usn": u.get("usn")
                })

        # GUIDE
        guide_name = "Not Assigned"
        guide_id = data.get("guideId")

        if guide_id:
            gdoc = db.collection("users").document(guide_id).get()

            if gdoc.exists:
                guide_name = gdoc.to_dict().get("name")

        # STATUS FIX
        status = data.get("status")

        if not guide_id:
            status = "CREATED"

        return {
            "groupId": data["groupId"],
            "projectName": data["projectName"],
            "domain": data["domain"],
            "leaderId": data["leaderId"],
            "members": members,
            "guideName": guide_name,
            "guideId": guide_id,   # 🔥 IMPORTANT ADD
            "status": status
        }

    return {}
# ===============================
# ASSIGN GUIDE (NEW 🔥)
# ===============================

@router.put("/assign-guide/{group_id}")
def assign_guide(group_id: str, guide_id: str | None = None, admin=Depends(verify_user)):

    print("🔥 ASSIGN GUIDE API HIT")

    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    group_ref = db.collection("groups").document(group_id)
    group_doc = group_ref.get()

    if not group_doc.exists:
        raise HTTPException(status_code=404, detail="Group not found")

    # REMOVE GUIDE
    if not guide_id:
        group_ref.update({
            "guideId": None,
            "status": "CREATED"
        })
        return {"message": "Guide removed"}

    # ASSIGN GUIDE
    group_ref.update({
        "guideId": guide_id,
        "status": "GUIDE_ASSIGNED"
    })

    # ==========================
    # 📧 SEND ASSIGNMENT EMAILS
    # ==========================
    guide_doc = db.collection("users").document(guide_id).get()
    guide_data = guide_doc.to_dict() if guide_doc.exists else {}
    
    # 1. Email Guide
    guide_email = guide_data.get("email") or guide_data.get("googleEmail")
    if guide_email:
        send_email(
            guide_email, 
            "New Group Assignment", 
            f"Hello {guide_data.get('name', 'Guide')},<br><br>You have been assigned to supervise group <b>{group_id}</b>."
        )
        
    # 2. Email Students
    data = group_doc.to_dict()
    for uid in data.get("members", []):
        udoc = db.collection("users").document(uid).get()
        if udoc.exists:
            u = udoc.to_dict()
            student_email = u.get("email") or u.get("googleEmail")
            if student_email:
                send_email(
                    student_email, 
                    "Guide Assigned", 
                    f"Hello {u.get('name')},<br><br>Guide <b>{guide_data.get('name', 'assigned')}</b> has been assigned to your group <b>{group_id}</b>."
                )

    create_notification(
        [guide_id],
        "📌 New Group Assigned",
        f"You have been assigned to supervise group {group_id}",
        []
    )
    
    create_notification(
        data.get("members", []),
        "📌 Guide Assigned",
        f"Guide {guide_data.get('name', 'assigned')} has been assigned to your group {group_id}.",
        []
    )

    return {"message": "Guide assigned successfully"}
# ===============================
# BRANCH GROUPS (FIXED 🔥)
# ===============================
@router.get("/branch-groups")
def branch_groups(admin=Depends(verify_user)):

    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    groups = db.collection("groups") \
        .where("branch", "==", admin["branch"]) \
        .stream()

    result = []

    for g in groups:

        data = g.to_dict()

        # ==========================
        # MEMBERS (FULL DETAILS)
        # ==========================
        members = []

        for uid in data.get("members", []):

            user_doc = db.collection("users").document(uid).get()

            if user_doc.exists:
                u = user_doc.to_dict()

                members.append({
                    "uid": u.get("uid"),
                    "name": u.get("name"),
                    "usn": u.get("usn")
                })

        # ==========================
        # GUIDE NAME
        # ==========================
        guideName = None

        if data.get("guideId"):

            guide_doc = db.collection("users").document(data["guideId"]).get()

            if guide_doc.exists:
                guideName = guide_doc.to_dict().get("name")

        # ==========================
        # STATUS FIX
        # ==========================
        status = data.get("status")

        if not data.get("guideId"):
            status = "CREATED"

        # ==========================
        # FINAL RESPONSE
        # ==========================
        result.append({
            "groupId": data.get("groupId"),
            "projectName": data.get("projectName"),
            "domain": data.get("domain"),
            "members": members,
            "guideId": data.get("guideId"),
            "guideName": guideName,
            "status": status
        })

    return result


# ===============================
# FILE DOWNLOAD
# ===============================
@router.get("/files/{filename}")
def download_file(filename: str):
    path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, filename=filename)


# ===============================
# DELETE GROUP (ADMIN)
# ===============================
@router.delete("/delete-group/{group_id}")
def delete_group(group_id: str, admin=Depends(verify_user)):
    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    group_ref = db.collection("groups").document(group_id)
    group_doc = group_ref.get()

    if not group_doc.exists:
        raise HTTPException(status_code=404, detail="Group not found")

    group_data = group_doc.to_dict()
    all_members = group_data.get("members", [])
    project_name = group_data.get("projectName", group_id)

    # 🔔 Notify all members before deleting
    create_notification(
        all_members,
        "🗑️ Group Deleted",
        f"Your group '{project_name}' ({group_id}) has been deleted by the admin.",
        []
    )

    # 📧 Email all members
    for uid in all_members:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            u = user_doc.to_dict()
            email_target = u.get("email") or u.get("googleEmail")
            if email_target:
                try:
                    send_email(
                        email_target,
                        f"Group Deleted – {project_name}",
                        f"""Hello {u.get('name')},<br><br>
                        Your mini project group <b>{group_id}</b> (<i>{project_name}</i>) has been <b>deleted</b> by the admin.<br><br>
                        If you have any questions, please contact your branch admin.<br><br>
                        Best Regards,<br>DSCE Mini Project Portal"""
                    )
                except Exception as e:
                    print("Email error during group deletion:", e)

    # 🗑️ Delete the group
    group_ref.delete()

    return {"message": "Group deleted successfully"}

# ===============================
# GET GUIDE SUBMISSIONS (ALL GROUPS)
# ===============================

@router.get("/guide-submissions")
def get_guide_submissions(user=Depends(verify_user)):
    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Guide only")
    groups = db.collection("groups") \
        .where("guideId", "==", user["uid"]) \
        .stream()
    group_ids = [g.to_dict()["groupId"] for g in groups]
    submissions = db.collection("project_submissions").stream()
    result = []
    for s in submissions:
        data = s.to_dict()
        if data.get("groupId") in group_ids:
            result.append({
                "id": s.id,
                "groupId": data.get("groupId"),
                "reportUrl": data.get("reportUrl"),
                "pptUrl": data.get("pptUrl"),
                "images": data.get("images", []),
                "status": data.get("status"),
                "comment": data.get("guideComment")
            })
    return result


# ===============================
# REVIEW SUBMISSION
# ===============================

@router.put("/review-submission/{submission_id}")
def review_submission(submission_id: str, data: dict, user=Depends(verify_user)):
    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Guide only")
    ref = db.collection("project_submissions").document(submission_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Submission not found")
    ref.update({
        "status": data.get("decision"),
        "guideComment": data.get("comment")
    })
    
    submission_data = doc.to_dict()
    group_id = submission_data.get("groupId")
    decision = data.get("decision", "REVIEWED")
    comment = data.get("comment", "")

    if group_id:
        group_doc = db.collection("groups").document(group_id).get()
        if group_doc.exists:
            group_data = group_doc.to_dict()
            member_ids = group_data.get("members", [])

            # Notify + email all members
            create_notification(
                member_ids,
                "📊 Project Review Update",
                f"Your submission for group <b>{group_id}</b> has been marked as <b>{decision}</b> by your guide."
                + (f"<br><br><b>Guide Comment:</b> {comment}" if comment else ""),
            )

    return {"message": "Review updated"}



@router.post("/upload-project/{group_id}")
def upload_project(
    group_id: str,
    report: UploadFile = File(None),
    ppt: UploadFile = File(None),
    images: List[UploadFile] = File([]),
    user=Depends(verify_user)
):

    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    saved_files = {}

    # ===============================
    # REPORT
    # ===============================
    if report:
        report_path = f"{group_id}_report_{report.filename}"
        with open(os.path.join(UPLOAD_FOLDER, report_path), "wb") as f:
            f.write(report.file.read())

        saved_files["reportUrl"] = f"/groups/files/{report_path}"

    # ===============================
    # PPT
    # ===============================
    if ppt:
        ppt_path = f"{group_id}_ppt_{ppt.filename}"
        with open(os.path.join(UPLOAD_FOLDER, ppt_path), "wb") as f:
            f.write(ppt.file.read())

        saved_files["pptUrl"] = f"/groups/files/{ppt_path}"

    # ===============================
    # IMAGES
    # ===============================
    image_urls = []

    for img in images:
        img_path = f"{group_id}_img_{img.filename}"
        with open(os.path.join(UPLOAD_FOLDER, img_path), "wb") as f:
            f.write(img.file.read())

        image_urls.append(f"/groups/files/{img_path}")

    saved_files["images"] = image_urls

    # ===============================
    # SAVE IN DB (FIXED 🔥)
    # ===============================
    db.collection("project_submissions").add({
        "groupId": group_id,
        "status": "SUBMITTED",
        **saved_files,
        "createdAt": firestore.SERVER_TIMESTAMP
    })

    # ===============================
    # UPDATE GROUP STATUS
    # ===============================
    db.collection("groups").document(group_id).update({
        "status": "SUBMITTED"
    })

    group_doc = db.collection("groups").document(group_id).get()
    if group_doc.exists:
        group_data = group_doc.to_dict()
        member_ids = group_data.get("members", [])
        guide_id_assigned = group_data.get("guideId")

        # Notify + email all members
        create_notification(
            member_ids,
            "📤 Project Submitted",
            f"Your group <b>{group_id}</b> has successfully submitted the project files. Your guide will review it soon.",
        )

        # Also email the guide if assigned
        if guide_id_assigned:
            create_notification(
                [guide_id_assigned],
                "📥 New Project Submission",
                f"Group <b>{group_id}</b> has submitted their project files. Please log in to review.",
            )

    return {"message": "Project uploaded"}
# ===============================
# GUIDE GROUPS (FIXED 🔥)
# ===============================
@router.get("/guide-groups")
def guide_groups(user=Depends(verify_user)):

    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Guide only")

    groups = db.collection("groups") \
        .where("guideId", "==", user["uid"]) \
        .stream()

    result = []

    for g in groups:

        data = g.to_dict()

        members = []

        # ==========================
        # MEMBERS FIXED 🔥
        # ==========================
        for uid in data.get("members", []):

            user_doc = db.collection("users").document(uid).get()

            if user_doc.exists:
                u = user_doc.to_dict()

                members.append({
                    "uid": u.get("uid"),
                    "name": u.get("name"),
                    "usn": u.get("usn")
                })

        result.append({
            "groupId": data.get("groupId"),
            "projectName": data.get("projectName"),
            "domain": data.get("domain"),
            "status": data.get("status"),
            "members": members
        })

    return result
  # ===============================
# GUIDE ACCEPT / REJECT
# ===============================
@router.put("/guide-decision/{group_id}")
def guide_decision(group_id: str, decision: str, user=Depends(verify_user)):

    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Guide only")

    group_ref = db.collection("groups").document(group_id)
    group_doc = group_ref.get()

    if not group_doc.exists:
        raise HTTPException(status_code=404, detail="Group not found")

    data = group_doc.to_dict()

    # Ensure this guide is assigned
    if data.get("guideId") != user["uid"]:
        raise HTTPException(status_code=403, detail="Not your group")

    # ===============================
    # ACCEPT
    # ===============================
    if decision == "ACCEPT":
        group_ref.update({
            "guideId": user["uid"],
            "status": "GUIDE_ACCEPTED"
        })

        # Notify + email all members
        create_notification(
            data.get("members", []),
            "✅ Guide Accepted Your Group",
            f"Your guide <b>{user.get('name', 'Guide')}</b> has <b>accepted</b> your group (<b>{group_id}</b>). You can now proceed with your mini project!",
        )
        return {"message": "Group accepted"}

    # ===============================
    # REJECT
    # ===============================
    if decision == "REJECT":
        group_ref.update({
            "guideId": None,
            "status": "CREATED"
        })

        # Notify + email all members
        create_notification(
            data.get("members", []),
            "❌ Guide Rejected Your Group",
            f"Your guide has <b>rejected</b> your group (<b>{group_id}</b>). The admin will reassign a new guide soon.",
        )
        return {"message": "Group rejected"}

    raise HTTPException(status_code=400, detail="Invalid decision")

# ===============================
# SEND NOTIFICATION (ADMIN)
# ===============================
@router.post("/send-notification/{group_id}")
def send_notification(group_id: str, target: str, message: str, admin=Depends(verify_user)):

    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    group_ref = db.collection("groups").document(group_id)
    group_doc = group_ref.get()

    if not group_doc.exists:
        raise HTTPException(status_code=404, detail="Group not found")

    data = group_doc.to_dict()

    users_to_notify = []

    # 🔥 STUDENTS
    if target == "students":
        users_to_notify = data.get("members", [])

    # 🔥 GUIDE
    elif target == "guide":
        if data.get("guideId"):
            users_to_notify = [data.get("guideId")]

    else:
        raise HTTPException(status_code=400, detail="Invalid target")

    for uid in users_to_notify:

        # 🔥 GET USER BY UID (IMPORTANT FIX)
        user_docs = db.collection("users") \
            .where("uid", "==", uid) \
            .stream()

        for u in user_docs:

            user_data = u.to_dict()

            # ==========================
            # 🔔 SAVE NOTIFICATION
            # ==========================
            db.collection("notifications").add({
                "userId": uid,
                "message": message,
                "groupId": group_id,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "read": False
            })

            # ==========================
            # 📧 SEND EMAIL
            # ==========================
            email_target = user_data.get("email") or user_data.get("googleEmail")
            if email_target:
                send_email(
                    email_target,
                    "DSCE Project Notification",
                    message
                )

    return {"message": "Notification sent"}


# ===============================
# SEND NOTIFICATION (GUIDE)
# ===============================
@router.post("/guide-send-notification/{group_id}")
def guide_send_notification(group_id: str, message: str, user=Depends(verify_user)):

    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Guides only")

    group_ref = db.collection("groups").document(group_id)
    group_doc = group_ref.get()

    if not group_doc.exists:
        raise HTTPException(status_code=404, detail="Group not found")

    data = group_doc.to_dict()

    if data.get("guideId") != user["uid"]:
        raise HTTPException(status_code=403, detail="Not your assigned group")

    users_to_notify = data.get("members", [])

    for uid in users_to_notify:

        user_docs = db.collection("users").where("uid", "==", uid).stream()

        for u in user_docs:
            user_data = u.to_dict()

            # 🔔 SAVE NOTIFICATION
            db.collection("notifications").add({
                "userId": uid,
                "title": "Message from Guide",
                "message": message,
                "groupId": group_id,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "read": False
            })

            # 📧 SEND EMAIL
            email_target = user_data.get("email") or user_data.get("googleEmail")
            if email_target:
                send_email(
                    email_target,
                    "DSCE Project Notification via Guide",
                    message
                )

    return {"message": "Notification sent successfully"}


# ===============================
# HELPERS
# ===============================
def fetch_member_details(members_uids):
    details = []
    for uid in members_uids:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            u = user_doc.to_dict()
            name = u.get("name", "Unknown")
            usn = u.get("usn", "N/A")
            details.append(f"{name} ({usn})")
    return details


# ===============================
# EXPORT EXCEL
# ===============================
@router.get("/export/excel")
def export_excel(user=Depends(verify_user)):

    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Only guides allowed")

    groups = db.collection("groups") \
        .where("guideId", "==", user["uid"]) \
        .stream()

    wb = Workbook()
    ws = wb.active
    ws.title = "Groups"

    # HEADERS
    ws.append(["Group ID", "Project", "Domain", "Status", "Members"])

    for g in groups:
        data = g.to_dict()

        members_details = fetch_member_details(data.get("members", []))
        members_str = ", ".join(members_details)

        ws.append([
            data.get("groupId"),
            data.get("projectName"),
            data.get("domain"),
            data.get("status"),
            members_str
        ])

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)

    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=groups.xlsx"}
    )


# ===============================
# EXPORT PDF
# ===============================
@router.get("/export/pdf")
def export_pdf(user=Depends(verify_user)):

    if user["role"] != "guide":
        raise HTTPException(status_code=403, detail="Only guides allowed")

    groups = db.collection("groups") \
        .where("guideId", "==", user["uid"]) \
        .stream()

    buffer = io.BytesIO()

    # Landscape for wider table
    doc = SimpleDocTemplate(buffer, pagesize=(842, 595), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    title_style = styles["Title"]
    title_style.textColor = colors.HexColor("#1565C0")
    
    normal_style = styles["Normal"]
    normal_style.fontSize = 10
    normal_style.leading = 14

    # Fetch Guide Name
    guide_doc = db.collection("users").document(user["uid"]).get()
    guide_name = guide_doc.to_dict().get("name", "Unknown") if guide_doc.exists else "Unknown"

    content = []
    content.append(Paragraph(f"Guide Groups Report: {guide_name}", title_style))
    content.append(Spacer(1, 20))

    # Table Header
    table_data = [
        ["Group ID", "Project Name", "Domain", "Status", "Members"]
    ]

    for g in groups:
        data = g.to_dict()

        members_list = fetch_member_details(data.get("members", []))
        members_para = Paragraph("<br/>".join(members_list), normal_style)

        table_data.append([
            Paragraph(data.get("groupId", "N/A"), normal_style),
            Paragraph(data.get("projectName", "N/A"), normal_style),
            Paragraph(data.get("domain", "N/A"), normal_style),
            Paragraph(data.get("status", "N/A"), normal_style),
            members_para
        ])

    col_widths = [80, 200, 150, 100, 200]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1565C0")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F5F9FF")),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#DDDDDD")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9F9F9")]),
        ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.HexColor("#DDDDDD")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#1565C0")),
    ]))

    content.append(t)
    doc.build(content)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=groups.pdf"}
    )