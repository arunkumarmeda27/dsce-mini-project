from reportlab.pdfgen import canvas
from firebase_config import db

def export_groups_pdf():

    c = canvas.Canvas("groups.pdf")

    groups = db.collection("groups").stream()

    y = 800

    for g in groups:

        text = str(g.to_dict())

        c.drawString(50, y, text)

        y -= 20

    c.save()

    return "groups.pdf"