from fastapi import APIRouter, HTTPException, Request
from firebase_admin import auth as firebase_auth
from firebase_config import db

router = APIRouter()


# ==================================
# VERIFY USER TOKEN (LOGIN CHECK)
# ==================================
@router.get("/verify")
async def verify_user(request: Request):

    try:
        # 🔥 Get token from header
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token missing")

        token = auth_header.split(" ")[1]

        # 🔥 Verify Firebase token
        decoded_token = firebase_auth.verify_id_token(token)

        uid = decoded_token.get("uid")

        # 🔥 Get user from Firestore
        user_doc = db.collection("users").document(uid).get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = user_doc.to_dict()

        # 🔥 CHECK APPROVAL
        if not user_data.get("approved"):
            raise HTTPException(
                status_code=403,
                detail="Wait for admin approval"
            )

        return {
            "uid": uid,
            "name": user_data.get("name"),
            "email": user_data.get("email"),
            "role": user_data.get("role"),
            "branch": user_data.get("branch"),
            "approved": user_data.get("approved")
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Auth error:", e)
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================================
# LOGIN SECURITY ALERT
# ==================================
from email_service import send_email
from datetime import datetime
import os

@router.post("/login-alert")
async def login_alert(request: Request):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token missing")

        token = auth_header.split(" ")[1]
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        
        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists:
            return {"message": "User not found, no email sent"}
            
        user_data = user_doc.to_dict()
        email = user_data.get("email")
        name = user_data.get("name", "User")
        
        if email:
            # Client IP
            forwarded_for = request.headers.get("x-forwarded-for")
            ip_address = forwarded_for.split(",")[0] if forwarded_for else request.client.host
            login_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            subject = "Security Alert: New Login Detected"
            body = f"""
            <div style='font-family:sans-serif;line-height:1.6;color:#333;max-width:600px;margin:auto;'>
                <h2 style='color:#1565C0;'>New Login Detected</h2>
                <p>Hello {name},</p>
                <p>We noticed a successful login to your DSCE Mini Project Portal account.</p>
                <div style='background:#f4f7ff;padding:15px;border-radius:8px;margin:20px 0;'>
                    <p style='margin:0;'><strong>Time:</strong> {login_time}</p>
                    <p style='margin:5px 0 0 0;'><strong>IP Address:</strong> {ip_address}</p>
                </div>
                <p>If this was you, no further action is required.</p>
                <p style='color:red;'>⚠️ If you did not authorize this login, please reset your password immediately and contact an administrator.</p>
                <hr style='border:none;border-top:1px solid #eee;margin:20px 0;'>
                <p style='color:#888;font-size:12px;'>— This is an automated security message.</p>
            </div>
            """
            send_email(email, subject, body)
            return {"message": "Login alert sent successfully"}
            
    except Exception as e:
        print("Login alert error:", e)
        return {"message": "Silently failed"}