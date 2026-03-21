import os
import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(BASE_DIR, "serviceAccountKey.json")

if not firebase_admin._apps:
    import json
    
    # 1. Check if we are on Render (it provides FIREBASE_CREDENTIALS as an env var)
    firebase_cred_json = os.environ.get("FIREBASE_CREDENTIALS")
    
    if firebase_cred_json:
        cred_dict = json.loads(firebase_cred_json)
        cred = credentials.Certificate(cred_dict)
    else:
        # 2. Fallback to local file for development
        cred = credentials.Certificate(cred_path)
        
    firebase_admin.initialize_app(cred)

db = firestore.client()