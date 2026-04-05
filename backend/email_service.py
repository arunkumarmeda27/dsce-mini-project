import urllib.request
import json
import ssl
import os
import threading
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "").strip()
SENDER_EMAIL = "medaarun390@gmail.com"
SENDER_NAME = "DSCE Project Portal"


def send_email_sync(to, subject, body):

    # ============================================
    # GUARD: don't attempt if API key is missing
    # ============================================
    if not BREVO_API_KEY:
        print(f"⚠️  BREVO_API_KEY not set — skipping email to {to}")
        return

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

    # Allow self-signed but still validate Brevo's cert properly
    ctx = ssl.create_default_context()

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
            res_body = response.read().decode("utf-8")
            print(f"✅ Email sent to {to} | subject: '{subject}' | response: {res_body[:80]}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if hasattr(e, "read") else str(e)
        print(f"❌ Brevo HTTP error for {to}: {e.code} — {error_body}")
    except urllib.error.URLError as e:
        print(f"❌ Brevo URL error for {to}: {e.reason}")
    except Exception as e:
        print(f"❌ Unexpected email error for {to}: {e}")


def send_email(to: str, subject: str, body: str):
    """
    Fire-and-forget email via background thread.
    Safe for FastAPI + Gunicorn/uvicorn workers.
    """
    if not to or "@" not in to:
        print(f"⚠️  Invalid recipient email: '{to}' — skipping")
        return

    t = threading.Thread(target=send_email_sync, args=(to, subject, body), daemon=True)
    t.start()