import pandas as pd
from firebase_config import db

def export_groups_excel():

    groups = db.collection("groups").stream()

    data = []

    for g in groups:
        data.append(g.to_dict())

    df = pd.DataFrame(data)

    df.to_excel("groups.xlsx", index=False)

    return "groups.xlsx"