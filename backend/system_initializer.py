from firebase_config import db
from firebase_admin import auth
from branch_config import BRANCHES

def create_branch_admins():

    for code, name in BRANCHES.items():

        email = f"admin.{code.lower()}@dsce.edu.in"
        password = f"{code.lower()}admin123"

        try:
            user = auth.get_user_by_email(email)
            uid = user.uid
        except:
            user = auth.create_user(
                email=email,
                password=password
            )
            uid = user.uid

        db.collection("users").document(uid).set({
            "uid": uid,
            "name": f"{name} Coordinator",
            "email": email,
            "role": "admin",
            "branch": code,
            "approved": True
        })

    print("All branch coordinators created successfully")