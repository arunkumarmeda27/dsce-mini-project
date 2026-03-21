from fastapi import APIRouter
from firebase_config import db

router = APIRouter()

@router.get("/guide/groups")

def guide_groups():

    groups = db.collection("groups").stream()

    return [g.to_dict() for g in groups]