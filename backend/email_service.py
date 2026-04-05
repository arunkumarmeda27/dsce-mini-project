import os
import urllib.request
import urllib.parse
import json
import ssl
from dotenv import load_dotenv

load_dotenv()

# ===============================
# BREVO EMAIL API CONFIG
# ===============================
BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "").strip()
SENDER_EMAIL = "medaarun390@gmail.com"
SENDER_NAME = "DSCE Mini Project Portal"


def send_email_sync(to: str, subject: str, body: str):
    """Sends email synchronously using Brevo API."""
    
    if not BREVO_API_KEY:
        print("❌ [EmailSync] BREVO_API_KEY is not set.")
        return

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }

    payload = {
        "sender": {"name": SENDER_NAME, "email": SENDER_EMAIL},
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": body
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")

        context = ssl.create_default_context()
        with urllib.request.urlopen(req, context=context, timeout=15) as response:
            status = response.getcode()
            response_body = response.read().decode("utf-8")
            print(f"✅ [EmailSync] Brevo Success ({status}) for {to}")
            return True

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"❌ [EmailSync] Brevo HTTP error for {to}: {e.code} — {error_body}")
    except urllib.error.URLError as e:
        print(f"❌ [EmailSync] Brevo URL error for {to}: {e.reason}")
    except Exception as e:
        print(f"❌ [EmailSync] Unexpected error for {to}: {e}")
    
    return False


def send_email(to: str, subject: str, body: str):
    """
    Sends an email directly. Synchronous for now to ensure 
    Render workers don't kill the task prematurely.
    """
    if not to or "@" not in to:
        print(f"⚠️  [EmailService] Invalid recipient: '{to}'")
        return

    print(f"📧 [EmailService] Attempting to send to {to}...")
    send_email_sync(to, subject, body)