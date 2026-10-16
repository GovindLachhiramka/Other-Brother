import os
import re
from datetime import datetime, timedelta, timezone

from google.cloud import firestore

from tools.documents import match_names
from tools.firestore_tools import _get_db, _hash
from tools.mailer import send_email
from tools.vision_tools import match_face, read_document

APP_URL = os.getenv("APP_URL", "https://other-brother-web-288097280823.asia-south1.run.app")


def _mail_html(heading: str, name: str, lines: list, closing: str, button: str = "") -> str:
    paras = "".join(f'<p style="margin:0 0 14px">{ln}</p>' for ln in lines)
    btn = (
        f'<p style="text-align:center;margin:26px 0 8px"><a href="{APP_URL}/login" '
        f'style="background:#0F766E;color:#ffffff;padding:12px 26px;border-radius:8px;'
        f'text-decoration:none;font-weight:600;display:inline-block">{button}</a></p>'
        if button else ""
    )
    return f"""
<div style="background:#f6f6f6;padding:32px 12px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:480px;margin:auto;background:#ffffff;border-radius:16px;padding:32px 28px;color:#444;font-size:15px;line-height:1.6">
    <h1 style="text-align:center;margin:0 0 6px;font-size:24px;color:#1f2937">Other/Brother 🫶</h1>
    <h2 style="text-align:center;margin:0 0 22px;font-size:18px;color:#1f2937">{heading}</h2>
    <p style="margin:0 0 14px">Dear <b>{name}</b>,</p>
    {paras}
    {btn}
    <p style="text-align:center;color:#0F766E;font-style:italic;font-size:13px;margin:28px 0 6px">When an Other becomes a Brother.</p>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin:0">Other/Brother Family 🫶</p>
  </div>
</div>"""

MAX_ATTEMPTS = 3
BLOCK_HOURS = 24

# Mandatory documents. Examples: REQUIRED_DOCS=none  |  REQUIRED_DOCS=id  |  REQUIRED_DOCS=id,licence,rc
REQUIRED = {
    x.strip()
    for x in os.getenv("REQUIRED_DOCS", "none").split(",")
    if x.strip() and x.strip() != "none"
}

# Mock list for the demo. v2: real partner list with company API keys.
ALLOWED_COMPANIES = {
    "demo foods ltd",
    "zomato", "swiggy", "domino's", "pizza hut", "mcdonald's",
    "ekart", "delhivery", "amazon", "shadowfax", "ecom express", "dtdc",
    "blinkit", "zepto", "swiggy instamart", "bigbasket",
    "rapido", "uber", "ola", "indrive",
}


# ---------------- helpers ----------------
def _parse_date(value):
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%d.%m.%Y"):
        try:
            return datetime.strptime(str(value).strip(), fmt).date()
        except ValueError:
            continue
    return None


def _id_hash(number: str, name: str, dob: str) -> str:
    """Full number: hash the number. Masked number (XXXX XXXX 1234): add name and DOB so two people do not collide."""
    raw = str(number or "")
    digits = re.sub(r"\D", "", raw)
    if len(digits) == 12 and not re.search(r"[xX*]", raw):
        return _hash(digits)
    return _hash(f"{digits[-4:]}|{(name or '').lower().strip()}|{dob or ''}")


def _attempt_ref(db, phone: str):
    return db.collection("registration_attempts").document(re.sub(r"\W", "", phone) or "unknown")


def _blocked_message(db, phone: str):
    snap = _attempt_ref(db, phone).get()
    if not snap.exists:
        return None
    until = snap.to_dict().get("blocked_until")
    if until and until > datetime.now(timezone.utc):
        return f"Too many failed attempts. Try again after {until.strftime('%d %b %H:%M UTC')}."
    return None


def _fail(db, phone: str, layer: str, reason: str) -> dict:
    ref = _attempt_ref(db, phone)
    snap = ref.get()
    data = snap.to_dict() if snap.exists else {}
    now = datetime.now(timezone.utc)
    fails = data.get("fails", 0) + 1
    update = {"fails": fails, "last_reason": reason, "updated_at": now}
    attempts_left = max(0, MAX_ATTEMPTS - fails)
    if fails >= MAX_ATTEMPTS:
        update["blocked_until"] = now + timedelta(hours=BLOCK_HOURS)
        update["fails"] = 0
        attempts_left = 0
        reason += f" Phone blocked for {BLOCK_HOURS} hours."
    ref.set(update, merge=True)
    return {
        "status": "rejected",
        "failed_layer": layer,
        "reason": reason,
        "attempts_left": attempts_left,
    }


def _exists(db, collection: str, field: str, value: str) -> bool:
    return len(db.collection(collection).where(field, "==", value).limit(1).get()) > 0


# ---------------- main: registration ----------------
def run_registration(
    phone: str,
    device_id: str,
    upi_id: str,
    upi_name: str,
    platform_name: str,
    company: str,
    partner_id: str,
    selfie_uri: str = "",
    id_uri: str = "",
    licence_uri: str = "",
    rc_uri: str = "",
    uid: str = "",
    email: str = "",
    gender: str = "",
) -> dict:
    """Runs every registration check in order. One failure means rejected.

    URIs are Cloud Storage paths (gs://...). All documents are optional unless REQUIRED_DOCS says so.
    Without any ID photo, face match is skipped and the company confirmation is the proof.
    Returns status: rejected or awaiting_company.
    """
    db = _get_db()
    phone = phone.strip()

    email = email.strip().lower()
    if not re.fullmatch(r"[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}", email):
        return _fail(db, phone, "email", "Please enter a valid email address.")

    gender = gender.strip().lower()
    if gender not in ("female", "male", "other"):
        gender = "other"

    msg = _blocked_message(db, phone)
    if msg:
        return {"status": "rejected", "failed_layer": "blocked", "reason": msg, "attempts_left": 0}

    # Layer 0: company + partner id
    if company.strip().lower() not in ALLOWED_COMPANIES:
        return _fail(db, phone, "company", f"'{company}' is not a supported company.")
    if not partner_id.strip():
        return _fail(db, phone, "company", "Partner / Rider ID is required.")

    # Layer 1: mandatory documents (only if REQUIRED_DOCS says so)
    if "id" in REQUIRED and not id_uri:
        return _fail(db, phone, "documents", "Government ID is required.")
    if "licence" in REQUIRED and not licence_uri:
        return _fail(db, phone, "documents", "Driving licence is required.")
    if "rc" in REQUIRED and not rc_uri:
        return _fail(db, phone, "documents", "Vehicle RC is required.")

    # Layer 2: read only the documents that were given
    docs = []
    id_doc = dl_doc = rc_doc = None
    if id_uri:
        id_doc = read_document(id_uri, "id")
        docs.append(("Government ID", id_doc))
    if licence_uri:
        dl_doc = read_document(licence_uri, "licence")
        docs.append(("Driving licence", dl_doc))
    if rc_uri:
        rc_doc = read_document(rc_uri, "rc")
        docs.append(("Vehicle RC", rc_doc))

    for label, d in docs:
        if not d.get("readable"):
            return _fail(db, phone, "documents", f"{label} is not clearly readable. Upload a sharper photo.")
        if d.get("looks_edited"):
            return _fail(db, phone, "documents", f"{label} looks edited or tampered.")

    if id_doc:
        id_name, id_number = id_doc.get("name"), id_doc.get("doc_number")
        if not (id_name and id_number):
            return _fail(db, phone, "documents", "Name or number missing on the Government ID.")
    else:
        id_name, id_number = upi_name.strip(), ""

    today = datetime.now().date()
    dl_name = dl_number = None
    if dl_doc:
        dl_name, dl_number = dl_doc.get("name"), dl_doc.get("doc_number")
        if not (dl_name and dl_number):
            return _fail(db, phone, "documents", "Name or number missing on the driving licence.")
        dl_expiry = _parse_date(dl_doc.get("expiry"))
        if dl_expiry is None:
            return _fail(db, phone, "documents", "Licence expiry date could not be read.")
        if dl_expiry < today:
            return _fail(db, phone, "documents", "Driving licence has expired.")

    vehicle_number = ""
    if rc_doc:
        vehicle_number = rc_doc.get("doc_number") or ""
        if not vehicle_number:
            return _fail(db, phone, "documents", "Vehicle number missing on the RC.")
        if rc_doc.get("expiry"):
            rc_expiry = _parse_date(rc_doc.get("expiry"))
            if rc_expiry is None or rc_expiry < today:
                return _fail(db, phone, "documents", "Vehicle RC has expired or its date is unreadable.")

    # Layer 3: cross-match names (licence is compared only if given)
    names = match_names(id_name, dl_name or id_name, upi_name, platform_name)
    if not names["passed"]:
        return _fail(db, phone, "cross_match", names["reason"])

    # Layer 4: face match (selfie vs the photo on a document, only if a document photo was given)
    face_ref = id_uri or licence_uri
    verification = "document" if face_ref else "company_only"
    face = {"passed": True, "confidence": None}
    if face_ref:
        if not selfie_uri:
            return _fail(db, phone, "face_match", "Please take a live selfie so we can match it with your document.")
        face = match_face(face_ref, selfie_uri)
        if not face["passed"]:
            return _fail(db, phone, "face_match", face.get("reason") or "Face did not match.")

    # Layer 5: duplicates
    id_hash = _id_hash(id_number, id_name, id_doc.get("dob")) if id_doc else ""
    dl_hash = _hash(dl_number) if dl_number else ""

    dup_checks = [
        ("workers", "phone", phone, "phone number"),
        ("workers", "device_id", device_id.strip(), "device"),
    ]
    if id_hash:
        dup_checks.append(("workers", "id_hash", id_hash, "ID"))
    if dl_hash:
        dup_checks.append(("workers", "dl_hash", dl_hash, "driving licence"))
    for collection, field, value, label in dup_checks:
        if _exists(db, collection, field, value):
            return _fail(db, phone, "duplicate", f"An account already exists for this {label}.")

    pending_checks = [("phone", phone, "phone number")]
    if id_hash:
        pending_checks.append(("id_hash", id_hash, "ID"))
    for field, value, label in pending_checks:
        waiting = (
            db.collection("company_verifications")
            .where(field, "==", value)
            .where("status", "==", "pending")
            .limit(1)
            .get()
        )
        if len(waiting) > 0:
            return _fail(db, phone, "duplicate", f"A registration request is already waiting for this {label}.")

    # Layer 6: ask the company to confirm
    ref = db.collection("company_verifications").document()
    ref.set(
        {
            "uid": uid.strip(),
            "worker_name": id_name,
            "phone": phone,
            "email": email,
            "gender": gender,
            "id_hash": id_hash,
            "id_last4": re.sub(r"\D", "", str(id_number))[-4:] if id_number else "",
            "dl_hash": dl_hash,
            "device_id": device_id.strip(),
            "vehicle_number": vehicle_number,
            "upi_id": upi_id,
            "company": company.strip(),
            "partner_id": partner_id.strip(),
            "face_confidence": face.get("confidence"),
            "verification": verification,
            "status": "pending",
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    _attempt_ref(db, phone).set({"fails": 0}, merge=True)
    return {
        "status": "awaiting_company",
        "request_id": ref.id,
        "message": "All checks passed. Waiting for company confirmation.",
    }


# ---------------- company decision ----------------
def decide_registration(request_id: str, confirm: bool, manager: str) -> dict:
    """Company confirms or rejects a worker. Confirm creates the approved worker."""
    db = _get_db()
    ref = db.collection("company_verifications").document(request_id)
    snap = ref.get()
    if not snap.exists:
        return {"ok": False, "reason": "Request not found."}
    d = snap.to_dict()
    if d.get("status") != "pending":
        return {"ok": False, "reason": f"Request is already {d.get('status')}."}

    now_fields = {"confirmed_by": manager, "confirmed_at": firestore.SERVER_TIMESTAMP}

    if not confirm:
        ref.update({"status": "rejected", **now_fields})
        name = d.get("worker_name")
        company = d.get("company")
        send_email(
            d.get("email"),
            "Other/Brother: update on your registration",
            f"Dear {name},\n\n{company} could not confirm your registration this time. "
            "Please check your details with your company and register again.\n\nOther/Brother",
            _mail_html(
                "An update on your registration",
                name,
                [
                    f"<b>{company}</b> could not confirm your registration this time.",
                    "Please check your details with your company and register again. We are here to help.",
                ],
                "",
                "Register again",
            ),
        )
        return {"ok": True, "status": "rejected"}

    if d.get("id_hash") and _exists(db, "workers", "id_hash", d["id_hash"]):
        ref.update({"status": "rejected", "reject_reason": "Duplicate worker.", **now_fields})
        return {"ok": False, "reason": "A worker with this ID already exists."}

    uid = d.get("uid")
    worker_ref = db.collection("workers").document(uid) if uid else db.collection("workers").document()
    worker_ref.set(
        {
            "name": d.get("worker_name"),
            "phone": d.get("phone"),
            "email": d.get("email"),
            "gender": d.get("gender") or "other",
            "id_hash": d.get("id_hash"),
            "id_last4": d.get("id_last4"),
            "dl_hash": d.get("dl_hash"),
            "device_id": d.get("device_id"),
            "vehicle_number": d.get("vehicle_number"),
            "upi_id": d.get("upi_id"),
            "company": d.get("company"),
            "partner_id": d.get("partner_id"),
            "verification": d.get("verification"),
            "status": "approved",
            "trust_score": 50,
            "helper_points": 0,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    ref.update({"status": "confirmed", "worker_id": worker_ref.id, **now_fields})
    name = d.get("worker_name")
    company = d.get("company")
    send_email(
        d.get("email"),
        "🫶 Welcome to Other/Brother, you are approved!",
        f"Dear {name},\n\n{company} has confirmed your registration. "
        "You can now sign in to Other/Brother with your phone number.\n\nWhen an Other becomes a Brother.",
        _mail_html(
            f"You're In, {name.split()[0] if name else 'Brother'}!",
            name,
            [
                f"Your Other/Brother registration is complete! <b>{company}</b> has confirmed you. 🫶",
                "Instant accident claims, an emergency community pool, a transparent trust score "
                "and nearby brothers who help: everything is ready for you.",
                "Welcome to the family. 🌟",
            ],
            "",
            "Sign in now",
        ),
    )
    return {"ok": True, "status": "confirmed", "worker_id": worker_ref.id}


def get_registration_status(request_id: str) -> dict:
    """Returns pending, approved or rejected for a registration request."""
    db = _get_db()
    snap = db.collection("company_verifications").document(request_id).get()
    if not snap.exists:
        return {"found": False, "reason": "Request not found."}
    d = snap.to_dict()
    status = d.get("status")
    return {
        "found": True,
        "status": "approved" if status == "confirmed" else status,
        "worker_id": d.get("worker_id"),
    }