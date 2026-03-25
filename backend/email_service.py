import urllib.request
import json
import ssl
import os
import threading
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
SENDER_EMAIL = "medaarun390@gmail.com"
SENDER_NAME = "DSCE Project Portal"

def send_email_sync(to, subject, body):
    url = "https://api.brevo.com/v3/smtp/email"

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }

    data = {
        "sender": {"name": SENDER_NAME, "email": SENDER_EMAIL},
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": body
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers=headers,
        method="POST"
    )

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res_body = response.read().decode("utf-8")
            print(f"✅ Brevo email sent to {to}: {res_body}")
    except urllib.error.URLError as e:
        if hasattr(e, "read"):
            error_body = e.read().decode("utf-8")
            print(f"❌ Brevo failed for {to}: {error_body}")
        else:
            print(f"❌ Brevo failed for {to}: {e}")

def send_email(to, subject, body):
    threading.Thread(target=send_email_sync, args=(to, subject, body)).start()