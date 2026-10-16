import os

import firebase_admin
from firebase_admin import auth as fb_auth

from tools.firestore_tools import _get_db


def _init():
    if not firebase_admin._apps:
        firebase_admin.initialize_app(options={"projectId": os.getenv("GOOGLE_CLOUD_PROJECT")})


def _last10(phone: str) -> str:
    digits = "".join(c for c in (phone or "") if c.isdigit())
    return digits[-10:]


def verify_token(token: str) -> dict:
    """Checks the Firebase login token and returns the user's uid and phone."""
    # Demo shortcut for Swagger testing: "demo:9000000001". Works only when DEMO_MODE=true.
    if os.getenv("DEMO_MODE", "").lower() == "true" and token.startswith("demo:"):
        phone = _last10(token[5:])
        return {"ok": True, "uid": "demo-" + phone, "phone": phone}
    try:
        _init()
        decoded = fb_auth.verify_id_token(token)
    except Exception:
        return {"ok": False, "reason": "Invalid or expired login."}
    phone = _last10(decoded.get("phone_number"))
    if not phone:
        return {"ok": False, "reason": "No phone number in this login."}
    return {"ok": True, "uid": decoded["uid"], "phone": phone}


def get_login_state(uid: str, phone: str) -> dict:
    """Tells the app which screen to show: approved, awaiting_company, rejected or not_registered."""
    db = _get_db()

    snap = db.collection("workers").document(uid).get()
    if not snap.exists:
        found = db.collection("workers").where("phone", "==", phone).limit(1).get()
        snap = found[0] if found else None

    if snap is not None and snap.exists:
        d = snap.to_dict()
        if d.get("status") == "approved":
            return {
                "state": "approved",
                "worker_id": snap.id,
                "name": d.get("name"),
                "company": d.get("company"),
                "trust_score": d.get("trust_score"),
                "helper_points": d.get("helper_points", 0),
                "gender": d.get("gender", "other"),
            }
        return {"state": "rejected", "reason": "Account is not active."}

    reqs = db.collection("company_verifications").where("phone", "==", phone).limit(1).get()
    if len(reqs) > 0:
        r = reqs[0].to_dict()
        status = r.get("status")
        if status == "pending":
            return {"state": "awaiting_company", "request_id": reqs[0].id, "company": r.get("company")}
        if status == "rejected":
            return {"state": "rejected", "reason": "Company did not confirm this worker."}

    return {"state": "not_registered"}