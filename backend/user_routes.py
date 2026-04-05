from fastapi import APIRouter, HTTPException, Depends

from firebase_admin import auth as firebase_auth

from firebase_config import db

from pydantic import BaseModel

import re

from branch_config import BRANCHES

from auth_middleware import verify_user, verify_token

from datetime import datetime

from email_service import send_email

router = APIRouter()

# ===============================
# 🔥 UNIVERSAL NOTIFICATION SYSTEM
# ===============================
def create_notification(user_ids, title, message, emails):

    db.collection("notifications").add({
        "users": user_ids,
        "title": title,
        "message": message,
        "createdAt": datetime.utcnow()
    })

    for email in emails:
        try:
            send_email(email, title, message)
        except Exception as e:
            print("Email failed:", e)

# ===============================
# MODELS
# ===============================
class RegisterUser(BaseModel):
    name: str
    email: str
    password: str
    role: str
    usn: str | None = None
    branch: str | None = None
    phone: str | None = None


class ResetPassword(BaseModel):
    newPassword: str


# ===============================
# HELPERS
# ===============================
def extract_year(usn: str):
    if not usn:
        return None
    match = re.search(r'(\d{2})', usn)
    return "20" + match.group(1) if match else None


def extract_branch(usn: str):
    if not usn:
        return None

    usn = usn.upper()

    if "IS" in usn:
        return "ISE"

    for code in BRANCHES:
        if code in usn:
            return code

    return None


# ===============================
# REGISTER USER (MANUAL)
# ===============================
@router.post("/register")
def register(user: RegisterUser):

    branch_code = None
    joining_year = None

    if user.role.lower() == "student":

        if not user.usn:
            raise HTTPException(status_code=400, detail="USN required")

        branch_code = extract_branch(user.usn)
        joining_year = extract_year(user.usn)

        if not branch_code:
            raise HTTPException(status_code=400, detail="Invalid USN")

    elif user.role.lower() == "guide":

        if not user.branch:
            raise HTTPException(status_code=400, detail="Branch required")

        branch_code = user.branch.upper()

        if branch_code not in BRANCHES:
            raise HTTPException(status_code=400, detail="Invalid branch")

    else:
        raise HTTPException(status_code=400, detail="Invalid role")

    # 🔥 prevent duplicate
    existing = db.collection("users") \
        .where("email", "==", user.email) \
        .stream()

    for _ in existing:
        raise HTTPException(400, "User already registered")

    firebase_user = firebase_auth.create_user(
        email=user.email,
        password=user.password
    )

    db.collection("users").document(firebase_user.uid).set({
        "uid": firebase_user.uid,
        "name": user.name,
        "email": user.email,
        "role": user.role.lower(),
        "branch": branch_code,
        "joiningYear": joining_year,
        "usn": user.usn,
        "phone": user.phone,
        "approved": False
    })

    try:
        send_email(
            user.email,
            "Welcome to DSCE Mini Project!",
            f"Hello {user.name},<br><br>Welcome to the DSCE Mini Project portal! Your profile has been successfully created and is currently pending admin approval.<br><br>You will receive another notification once your account is fully activated."
        )
    except Exception as e:
        print("Email error:", e)

    return {"message": "Registered. Await approval."}


# ===============================
# GOOGLE AUTO REGISTER
# ===============================
@router.post("/google-register")
@router.post("/google-register")
def google_register(token_data=Depends(verify_token)):

    uid = token_data["uid"]
    email = token_data.get("email")
    name = token_data.get("name", "User")

    # 🔥 STRICT CHECK
    if not email.endswith("@dsce.edu.in"):
        raise HTTPException(403, "Only DSCE email allowed")

    doc_ref = db.collection("users").document(uid)
    doc = doc_ref.get()

    if doc.exists:
        return doc.to_dict()

    doc_ref.set({
        "uid": uid,
        "name": name,
        "email": email,
        "role": None,
        "branch": None,
        "usn": None,
        "approved": False
    })

    # Welcome email for new Google sign-in users
    try:
        send_email(
            email,
            "Welcome to DSCE Mini Project Portal!",
            f"Hello {name},<br><br>Welcome to the DSCE Mini Project portal! "
            f"Your account has been created and is <b>pending admin approval</b>.<br><br>"
            f"You will receive another email once your account is fully activated.<br><br>"
            f"Best Regards,<br>DSCE Mini Project Portal"
        )
    except Exception as e:
        print("Welcome email error:", e)

    return {"message": "Google user created"}




# ===============================
# USER PROFILE
# ===============================
@router.get("/user-profile")
def get_user_profile(token_data=Depends(verify_token)):

    uid = token_data["uid"]
    user_doc = db.collection("users").document(uid).get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user = user_doc.to_dict()

    return {
        "uid": user.get("uid"),
        "name": user.get("name"),
        "email": user.get("email"),
        "usn": user.get("usn"),
        "branch": user.get("branch"),
        "role": user.get("role"),
        "approved": user.get("approved")
    }


# ===============================
# APPROVE USER
# ===============================
@router.put("/approve/{uid}")
def approve_user(uid: str, admin=Depends(verify_user)):

    if admin["role"] != "admin":
        raise HTTPException(403, "Admins only")

    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(404, "User not found")

    user_ref.update({"approved": True})

    data = user_doc.to_dict()

    try:
        send_email(
            data.get("email"),
            "Welcome to DSCE Mini Project!",
            f"Hello {data.get('name')},<br><br>Your account has been officially approved! Welcome to the DSCE Mini Project portal.<br><br>You can now log in and access your dashboard to manage your project groups and view important updates.<br><br>Best Regards,<br>Admin Team"
        )
    except Exception as e:
        print("Email error:", e)

    return {"message": "User approved"}


# ===============================
# RESET PASSWORD
# ===============================
@router.put("/reset-password")
def reset_password(data: ResetPassword, user=Depends(verify_user)):

    if len(data.newPassword) < 6:
        raise HTTPException(400, "Password too short")

    firebase_auth.update_user(
        user["uid"],
        password=data.newPassword
    )

    return {"message": "Password updated"}


# ===============================
# GET PENDING USERS
# ===============================
@router.get("/pending-users")
def get_pending_users(admin=Depends(verify_user)):
    if admin.get("role") != "admin":
        raise HTTPException(403, "Admins only")
        
    pending = db.collection("users").where("approved", "==", False).stream()
    result = []
    for p in pending:
        data = p.to_dict()
        if data.get("branch") == admin.get("branch"):
            result.append(data)
    return result

# ===============================
# GET STUDENTS
# ===============================
@router.get("/students")
def get_students(admin=Depends(verify_user)):
    if admin.get("role") != "admin":
        raise HTTPException(403, "Admins only")
        
    students = db.collection("users").where("role", "==", "student").where("approved", "==", True).stream()
    result = []
    for s in students:
        data = s.to_dict()
        if data.get("branch") == admin.get("branch"):
            result.append(data)
    return result

# ===============================
# GET GUIDES
# ===============================
@router.get("/guides")
def get_guides(admin=Depends(verify_user)):
    if admin.get("role") != "admin":
        raise HTTPException(403, "Admins only")
        
    guides = db.collection("users").where("role", "==", "guide").where("approved", "==", True).stream()
    result = []
    for g in guides:
        data = g.to_dict()
        if data.get("branch") == admin.get("branch"):
            result.append(data)
    return result

# ===============================
# DELETE USER
# ===============================
@router.delete("/delete-user/{uid}")
def delete_user(uid: str, admin=Depends(verify_user)):

    if admin["role"] != "admin":
        raise HTTPException(403, "Admins only")

    user_doc = db.collection("users").document(uid).get()
    if user_doc.exists:
        data = user_doc.to_dict()
        email = data.get("email") or data.get("googleEmail")
        if email:
            try:
                send_email(
                    email,
                    "Account Removed - DSCE Project Portal",
                    f"Hello {data.get('name', 'Student')},<br><br>Your account on the DSCE Mini Project Portal has been removed by the administrator. If you believe this is an error, please contact your branch coordinator.<br><br>Best Regards,<br>Admin Team"
                )
            except Exception as e:
                print("Failed to send removal email:", e)

    db.collection("users").document(uid).delete()
    firebase_auth.delete_user(uid)

    return {"message": "User deleted"}


# ===============================
# CLEAR NOTIFICATIONS
# ===============================
@router.delete("/clear-notifications")
def clear_notifications(user=Depends(verify_user)):
    docs = db.collection("notifications").where("userId", "==", user["uid"]).stream()
    for doc in docs:
        doc.reference.delete()
    return {"message": "Notifications cleared"}

# ===============================
# COMPLETE PROFILE (FIXED ✅)
# ===============================
@router.put("/complete-profile")
def complete_profile(data: dict, token_data=Depends(verify_token)):

    uid = token_data["uid"]

    if not data.get("role"):
        raise HTTPException(status_code=400, detail="Role required")

    if data["role"] == "student":
        if not data.get("usn") or not data.get("branch"):
            raise HTTPException(status_code=400, detail="USN & Branch required")

    if data["role"] == "guide":
        if not data.get("branch"):
            raise HTTPException(status_code=400, detail="Branch required")

    db.collection("users").document(uid).set({
        "uid": uid,
        "email": token_data.get("email"),
        "name": token_data.get("name", "User"),
        "role": data.get("role"),
        "branch": data.get("branch"),
        "usn": data.get("usn"),
        "joiningYear": extract_year(data.get("usn")) if data.get("usn") else None,
        "phone": data.get("phone"),
        "approved": False
    }, merge=True)

    return {"message": "Profile submitted successfully"}

@router.get("/test-email")
def test_email():
    import os
    api_key = os.environ.get("BREVO_API_KEY", "")
    if not api_key:
        return {
            "status": "ERROR",
            "reason": "BREVO_API_KEY is NOT set on this server. Add it in the Render dashboard under Environment Variables."
        }
    try:
        send_email(
            "medaarun390@gmail.com",
            "DSCE Email System Test",
            "<h2>Email working!</h2><p>Test from DSCE Portal backend on Render.</p>"
        )
        return {
            "status": "TRIGGERED",
            "message": "Email queued. Check medaarun390@gmail.com inbox (and spam).",
            "api_key_configured": True
        }
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}