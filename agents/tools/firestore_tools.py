import hashlib
import os

from google.cloud import firestore

_db = None


def _get_db():
    global _db
    if _db is None:
        _db = firestore.Client(project=os.getenv("GOOGLE_CLOUD_PROJECT"))
    return _db


def _hash(value: str) -> str:
    return hashlib.sha256(value.strip().lower().encode()).hexdigest()


def check_duplicate(id_number: str, phone: str, device_id: str) -> dict:
    """Checks if this ID, phone or device already has a registered worker.

    Returns passed=True only when no duplicate is found.
    """
    db = _get_db()
    checks = {
        "id_hash": _hash(id_number),
        "phone": phone.strip(),
        "device_id": device_id.strip(),
    }
    for field, value in checks.items():
        found = db.collection("workers").where(field, "==", value).limit(1).get()
        if len(found) > 0:
            return {
                "passed": False,
                "reason": f"An account already exists with this {field}.",
            }
    return {"passed": True, "reason": "No duplicate found."}


def save_worker(
    name: str,
    phone: str,
    id_number: str,
    device_id: str,
    vehicle_number: str,
    upi_id: str,
    company: str,
    partner_id: str,
) -> dict:
    """Saves an approved worker to Firestore. Call only after every layer has passed."""
    db = _get_db()
    doc = db.collection("workers").document()
    doc.set(
        {
            "name": name,
            "phone": phone.strip(),
            "id_hash": _hash(id_number),
            "id_last4": id_number.strip()[-4:],
            "device_id": device_id.strip(),
            "vehicle_number": vehicle_number,
            "upi_id": upi_id,
            "company": company,
            "partner_id": partner_id,
            "status": "approved",
            "trust_score": 50,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    return {"saved": True, "worker_id": doc.id}


def request_company_confirmation(worker_name: str, company: str, partner_id: str) -> dict:
    """Creates a pending confirmation request that the company must approve (Layer 6)."""
    db = _get_db()
    doc = db.collection("company_verifications").document()
    doc.set(
        {
            "worker_name": worker_name,
            "company": company,
            "partner_id": partner_id,
            "status": "pending",
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    return {"request_id": doc.id, "status": "pending"}

def check_company_status(request_id: str) -> dict:
    """Returns the company's decision: pending, confirmed or rejected."""
    db = _get_db()
    doc = db.collection("company_verifications").document(request_id).get()
    if not doc.exists:
        return {"found": False, "reason": "Request not found."}
    return {"found": True, "status": doc.to_dict().get("status")}
