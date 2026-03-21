from fastapi import APIRouter, Depends, HTTPException
from firebase_config import db
from auth_middleware import verify_user
from firebase_admin import firestore
from email_service import send_email

router = APIRouter()


@router.post("/send-notification/{group_id}")
def send_notification(group_id: str, data: dict, admin=Depends(verify_user)):

    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    group_doc = db.collection("groups").document(group_id).get()

    if not group_doc.exists:
        raise HTTPException(status_code=404, detail="Group not found")

    group = group_doc.to_dict()

    users = group.get("members", [])

    # include guide
    if group.get("guideId"):
        users.append(group["guideId"])

    title = data.get("title", "Notification")
    message = data.get("message")

    # SAVE IN FIRESTORE
    db.collection("notifications").add({
        "title": title,
        "message": message,
        "users": users,
        "groupId": group_id,
        "createdAt": firestore.SERVER_TIMESTAMP
    })

    # 🔥 SEND EMAIL
    for uid in users:
        user_doc = db.collection("users").document(uid).get()

        if user_doc.exists:
            user_data = user_doc.to_dict()

            try:
                send_email(
                    user_data["email"],
                    title,
                    message
                )
            except:
                pass

    return {"message": "Notification sent"}