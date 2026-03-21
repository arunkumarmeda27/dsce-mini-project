from firebase_admin import credentials, firestore, auth
import firebase_admin

# Load Firebase Admin SDK
cred = credentials.Certificate("firebase.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

branches = {
    "aiml": "Artificial Intelligence & Machine Learning",
    "aero": "Aeronautical Engineering",
    "auto": "Automobile Engineering",
    "bt": "Biotechnology",
    "ch": "Chemical Engineering",
    "ce": "Civil Engineering",
    "cse": "Computer Science and Engineering",
    "csecyber": "CSE (Cyber Security)",
    "cseds": "CSE (Data Science)",
    "cseiocyber": "CSE (IoT & Cyber Security)",
    "csd": "Computer Science and Design",
    "eee": "Electrical & Electronics Engineering",
    "ece": "Electronics & Communication Engineering",
    "ise": "Information Science and Engineering",
    "eie": "Electronics & Instrumentation Engineering",
    "me": "Mechanical Engineering",
    "mee": "Medical Electronics Engineering",
    "ete": "Electronics & Telecommunication Engineering",
    "ra": "Robotics and Artificial Intelligence"
}

for code, name in branches.items():

    email = f"admin.{code}@dsce.edu.in"
    password = f"{code}admin123"

    try:
        user = auth.create_user(
            email=email,
            password=password
        )

        db.collection("users").document(user.uid).set({
            "uid": user.uid,
            "name": f"{name} Admin",
            "email": email,
            "role": "admin",
            "branch": code.upper(),
            "approved": True
        })

        print(f"Created admin for {name}")

    except Exception as e:
        print(f"Error creating {name}: {e}")