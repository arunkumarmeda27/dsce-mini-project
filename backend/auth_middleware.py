from fastapi import Header, HTTPException
from firebase_admin import auth as firebase_auth
from firebase_config import db


def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization missing or invalid")
    
    token = authorization.split(" ")[1]
    try:
        return firebase_auth.verify_id_token(token, clock_skew_seconds=60)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def verify_user(authorization: str = Header(None)):

    # ===============================
    # CHECK HEADER
    # ===============================
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format"
        )

    token = authorization.split(" ")[1]

    try:

        # ===============================
        # VERIFY FIREBASE TOKEN
        # ===============================
        decoded_token = firebase_auth.verify_id_token(
            token,
            clock_skew_seconds=60
        )

        uid = decoded_token.get("uid")

        if not uid:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        # ===============================
        # GET USER FROM FIRESTORE
        # ===============================
        user_doc = db.collection("users").document(uid).get()

        if not user_doc.exists:
            raise HTTPException(
                status_code=404,
                detail="User not found in database"
            )

        user_data = user_doc.to_dict()

        # ===============================
        # CHECK APPROVAL
        # ===============================
        if not user_data.get("approved"):
            raise HTTPException(
                status_code=403,
                detail="Wait for admin approval"
            )

        # ===============================
        # RETURN CLEAN USER OBJECT
        # ===============================
        joining_year = user_data.get("joiningYear")

        # Compute on the fly if missing (backward compat for existing users)
        if not joining_year and user_data.get("usn"):
            import re
            match = re.search(r'(\d{2})', user_data.get("usn", ""))
            joining_year = "20" + match.group(1) if match else None

        return {
            "uid": uid,
            "name": user_data.get("name"),
            "email": user_data.get("email"),
            "googleEmail": user_data.get("googleEmail"),
            "role": user_data.get("role"),
            "usn": user_data.get("usn"),
            "branch": user_data.get("branch"),
            "joiningYear": joining_year,
            "approved": user_data.get("approved")
        }

    except HTTPException:
        raise

    except Exception as e:

        print("Auth Error:", str(e))

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )