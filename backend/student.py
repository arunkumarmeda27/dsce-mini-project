from fastapi import APIRouter
from firebase_config import db

router = APIRouter()

@router.post("/student/group")

def create_group(data:dict):

    db.collection("groups").add(data)

    return {"message":"Group created"}