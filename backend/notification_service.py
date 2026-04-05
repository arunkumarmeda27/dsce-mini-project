from firebase_config import db
from email_service import send_email
from datetime import datetime


def _get_email_for_uid(uid: str) -> str | None:
    """Look up a user's email from Firestore by UID."""
    try:
        doc = db.collection("users").document(uid).get()
        if doc.exists:
            u = doc.to_dict()
            email = u.get("email") or u.get("googleEmail")
            return email
    except Exception as e:
        print(f"❌ [Notification] Database error during UID lookup: {e}")
    return None


def create_notification(user_ids: list, title: str, message: str, emails: list = None):
    """
    Save notification to Firestore and email all affected users.
    Standardized acrossDSCE Mini Project Portal.
    """

    # ================================
    # 1. SAVE TO FIRESTORE (Shows in Dashboard)
    # ================================
    try:
        db.collection("notifications").add({
            "users": user_ids,
            "title": title,
            "message": message,
            "createdAt": datetime.utcnow()
        })
    except Exception as e:
        print(f"❌ [Notification] Firestore write failed: {e}")

    # ================================
    # 2. SEND EMAIL TO EVERY USER (Shows in Gmail)
    # ================================
    for uid in user_ids:
        try:
            print(f"🔍 [Notification] Processing UID: {uid}")
            recipient_email = _get_email_for_uid(uid)
            
            if recipient_email:
                print(f"📧 [Notification] Found email: {recipient_email}. Attempting delivery...")
                send_email(
                    recipient_email,
                    title,
                    f"<div style='font-family:sans-serif;line-height:1.6;color:#333;'>"
                    f"<h2>{title}</h2>"
                    f"<p>{message}</p>"
                    f"<hr style='border:none;border-top:1px solid #eee;margin:20px 0;'>"
                    f"<p style='color:#888;font-size:12px;'>— This is an automated message from the DSCE Mini Project Portal.</p>"
                    f"</div>"
                )
                print(f"✅ [Notification] Email sent to {recipient_email}")
            else:
                print(f"⚠️ [Notification] No email found in database for UID: {uid}")
        except Exception as e:
            print(f"❌ [Notification] Delivery error for UID {uid}: {e}")