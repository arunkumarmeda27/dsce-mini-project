import smtplib
from email.mime.text import MIMEText

EMAIL = "medaarun390@gmail.com"
PASSWORD = "zelpssjxpaebmugh"   # ← THIS IS FIX

def send_email(to, subject, body):

    msg = MIMEText(body, "html")
    msg["Subject"] = subject
    msg["From"] = EMAIL
    msg["To"] = to

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(EMAIL, PASSWORD)
    server.send_message(msg)
    server.quit()