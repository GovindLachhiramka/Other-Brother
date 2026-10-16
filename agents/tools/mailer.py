import os
import smtplib
import ssl
from email.message import EmailMessage


def send_email(to: str, subject: str, body: str, html: str = "") -> bool:
    """Sends a mail through Gmail. Never raises, so a mail problem cannot break approval."""
    user = os.getenv("SMTP_USER", "").strip()
    pwd = os.getenv("SMTP_APP_PASSWORD", "").replace(" ", "").strip()
    if not to:
        print("[mail] skipped: no recipient")
        return False
    if not (user and pwd):
        print("[mail] skipped: SMTP_USER or SMTP_APP_PASSWORD not set")
        return False
    msg = EmailMessage()
    msg["From"] = f"Other/Brother <{user}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    if html:
        msg.add_alternative(html, subtype="html")
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as s:
            s.ehlo()
            s.starttls(context=ssl.create_default_context())
            s.ehlo()
            s.login(user, pwd)
            s.send_message(msg)
        print(f"[mail] sent to {to}")
        return True
    except Exception as e:
        print(f"[mail] FAILED to {to}: {type(e).__name__}: {e}")
        return False