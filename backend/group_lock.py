import time
from firebase_config import db

LOCK_TIME = 300

def lock_student(usn):

    db.collection("locks").document(usn).set({

        "locked": True,
        "time": time.time()

    })

def is_locked(usn):

    doc = db.collection("locks").document(usn).get()

    if doc.exists:

        data = doc.to_dict()

        if time.time() - data["time"] < LOCK_TIME:
            return True

        else:
            db.collection("locks").document(usn).delete()
            return False

    return False