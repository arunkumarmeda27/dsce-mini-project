from firebase_config import db
from email_service import send_email
from datetime import datetime


def _get_email_for_uid(uid: str) -> str | None:
    """Look up a user's email from Firestore by UID."""
    doc = db.collection("users").document(uid).get()
    if doc.exists:
        u = doc.to_dict()
        return u.get("email") or u.get("googleEmail")
    return None


def create_notification(user_ids: list, title: str, message: str, emails: list = None):
    """
    Save notification to Firestore and email all affected users.

    `emails` param is kept for backward compat but ignored — we always
    look up the real email addresses from Firestore using user_ids.
    """

    # ================================
    # 1. SAVE TO FIRESTORE
    # ================================
    db.collection("notifications").add({
        "users": user_ids,
        "title": title,
        "message": message,
        "createdAt": datetime.utcnow()
    })

    # ================================
    # 2. SEND EMAIL TO EVERY USER
    # ================================
    for uid in user_ids:
        try:
            recipient_email = _get_email_for_uid(uid)
            if recipient_email:
                send_email(
                    recipient_email,
                    title,
                    f"<p>{message}</p><br><p style='color:#888;font-size:12px;'>— DSCE Mini Project Portal</p>"
                )
        except Exception as e:
            print(f"❌ Notification email failed for uid={uid}: {e}")