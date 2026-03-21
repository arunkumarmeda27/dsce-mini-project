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