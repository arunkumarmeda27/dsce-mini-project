import urllib.request
import json
import ssl

RESEND_API_KEY = "re_QmijmnQx_73mySTHNnKEvjEM7KG8mHjew"

def send_email(to, subject, body):
    url = "https://api.resend.com/emails"
    
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    }
    
    data = {
        "from": "DSCE Portal <onboarding@resend.dev>",
        "to": [to],
        "subject": subject,
        "html": body
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    ctx = ssl.create_default_context()
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res_body = response.read().decode("utf-8")
            print("Resend Success:", res_body)
    except urllib.error.URLError as e:
        if hasattr(e, 'read'):
            print("Resend Failed:", e.read().decode('utf-8'))
        else:
            print("Resend Failed:", e)