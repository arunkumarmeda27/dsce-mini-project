from firebase_config import db
from email_service import send_email
from datetime import datetime


def create_notification(user_ids: list, title: str, message: str, emails: list):

    # 🔥 SAVE TO FIRESTORE
    db.collection("notifications").add({
        "users": user_ids,
        "title": title,
        "message": message,
        "createdAt": datetime.utcnow()
    })

    # 🔥 SEND EMAIL
    for email in emails:
        try:
            send_email(
                email,
                title,
                message
            )
        except Exception as e:
            print("Email failed:", e)