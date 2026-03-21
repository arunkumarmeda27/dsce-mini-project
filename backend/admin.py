from fastapi import APIRouter
from firebase_config import db

router = APIRouter()

@router.get("/admin/users")

def get_users():

    users = db.collection("users").stream()

    return [u.to_dict() for u in users]

@router.post("/admin/approve")

def approve(data:dict):

    db.collection("approved").add(data)

    return {"message":"Approved"}