import math
import os
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore
from pydantic import BaseModel

from api.routes import _worker, current_user
from tools.firestore_tools import _get_db
from tools.pool_tools import _limit_for, record_help

peer_router = APIRouter(prefix="/peer")

KINDS = {"money": "money", "item": "item", "medicine": "urgent", "other": "small"}
EXPIRY_MIN = 30
RADIUS_KM = 5.0
MAX_BONUS_PCT = 0.20
MIN_REPAY_DAYS = 1
MAX_REPAY_DAYS = 30
OVERDUE_PENALTY = 5
OVERDUE_PENALTY = 5
DISPUTE_AFTER_HOURS = float(os.getenv("DISPUTE_AFTER_HOURS", "24"))
DISPUTE_PENALTY = 10
IST = timezone(timedelta(hours=5, minutes=30))


def _km(lat1, lng1, lat2, lng2) -> float:
    p = math.pi / 180
    a = (
        0.5
        - math.cos((lat2 - lat1) * p) / 2
        + math.cos(lat1 * p) * math.cos(lat2 * p) * (1 - math.cos((lng2 - lng1) * p)) / 2
    )
    return 12742 * math.asin(math.sqrt(a))


def _expired(d: dict) -> bool:
    created = d.get("created_at")
    return bool(created) and datetime.now(timezone.utc) - created > timedelta(minutes=EXPIRY_MIN)


def _public(doc_id: str, d: dict) -> dict:
    out = dict(d)
    out.pop("requester_upi", None)
    out.pop("declined_by", None)
    out.pop("lat", None)
    out.pop("lng", None)
    out["repay_amount"] = out.get("amount", 0) + out.get("bonus", 0)
    return {"id": doc_id, **out}


def _change_trust(db, worker_id: str, change: int, reason: str):
    ref = db.collection("workers").document(worker_id)
    score = (ref.get().to_dict() or {}).get("trust_score", 50)
    score = max(0, min(100, score + change))
    ref.update({"trust_score": score})
    ref.collection("trust_events").add({"change": change, "reason": reason})


def _sync_overdue(db, doc_id: str, d: dict) -> dict:
    """If the repay date has passed and it is not repaid, mark overdue once and lower trust."""
    if (
        d.get("status") == "completed"
        and d.get("kind") == "money"
        and d.get("repay_by")
        and datetime.now(timezone.utc) > d["repay_by"]
    ):
        db.collection("peer_requests").document(doc_id).update({"status": "overdue"})
        _change_trust(db, d["requester_id"], -OVERDUE_PENALTY, "Did not repay a nearby worker on time")
        d["status"] = "overdue"
    return d


def _is_active(d: dict) -> bool:
    s = d["status"]
    if s == "open":
        return not _expired(d)
    if s in ("accepted", "funded", "overdue"):
        return True
    if s == "completed" and d.get("kind") == "money" and d.get("repay_by"):
        return True  # money still to be repaid
    return False


class PeerReq(BaseModel):
    kind: str  # money, item, medicine, other
    amount: int = 0
    urgency: str = "normal"  # normal or urgent
    note: str = ""
    repay_by: str | None = None  # YYYY-MM-DD, required for money
    lat: float
    lng: float


@peer_router.post("/request")
def create(body: PeerReq, user=Depends(current_user)):
    w = _worker(user)
    if body.kind not in KINDS:
        raise HTTPException(400, f"kind must be one of {sorted(KINDS)}")
    repay_dt = None
    if body.kind == "money":
        limit = _limit_for(w["trust_score"])
        if body.amount <= 0 or body.amount > limit:
            raise HTTPException(400, f"Amount must be between 1 and {limit} for your trust score.")
        if not body.repay_by:
            raise HTTPException(400, "Choose a repay date (repay_by, YYYY-MM-DD).")
        try:
            day = date.fromisoformat(body.repay_by)
        except ValueError:
            raise HTTPException(400, "repay_by must look like 2026-10-20.")
        today = datetime.now(IST).date()
        if day < today + timedelta(days=MIN_REPAY_DAYS) or day > today + timedelta(days=MAX_REPAY_DAYS):
            raise HTTPException(400, f"Repay date must be {MIN_REPAY_DAYS} to {MAX_REPAY_DAYS} days from today.")
        repay_dt = datetime(day.year, day.month, day.day, 23, 59, 59, tzinfo=IST)
    db = _get_db()
    mine = db.collection("peer_requests").where("requester_id", "==", w["worker_id"]).get()
    for m in mine:
        if _is_active(m.to_dict()):
            raise HTTPException(400, "You already have an active request. Finish, repay or cancel it first.")
    wdoc = db.collection("workers").document(w["worker_id"]).get()
    upi = (wdoc.to_dict() or {}).get("upi_id")
    ref = db.collection("peer_requests").document()
    ref.set(
        {
            "requester_id": w["worker_id"],
            "requester_name": w["name"],
            "requester_trust": w["trust_score"],
            "requester_upi": upi,
            "kind": body.kind,
            "amount": body.amount,
            "bonus": 0,
            "repay_by": repay_dt,
            "urgency": body.urgency,
            "note": body.note,
            "lat": body.lat,
            "lng": body.lng,
            "status": "open",
            "declined_by": [],
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    return {"request_id": ref.id, "status": "open", "expires_in_minutes": EXPIRY_MIN}


@peer_router.get("/nearby")
def nearby(lat: float, lng: float, radius_km: float = RADIUS_KM, user=Depends(current_user)):
    """Open requests from other workers near me. Urgent first, then bigger bonus, then closer."""
    w = _worker(user)
    out = []
    for doc in _get_db().collection("peer_requests").where("status", "==", "open").get():
        d = doc.to_dict()
        if d["requester_id"] == w["worker_id"] or w["worker_id"] in d.get("declined_by", []) or _expired(d):
            continue
        dist = _km(lat, lng, d["lat"], d["lng"])
        if dist <= radius_km:
            item = _public(doc.id, d)
            item["distance_km"] = round(dist, 1)
            out.append(item)
    out.sort(key=lambda x: (x["urgency"] != "urgent", -x.get("bonus", 0), x["distance_km"]))
    return out


@peer_router.get("/mine")
def mine(user=Depends(current_user)):
    w = _worker(user)
    db = _get_db()
    out = []
    for doc in db.collection("peer_requests").where("requester_id", "==", w["worker_id"]).get():
        d = _sync_overdue(db, doc.id, doc.to_dict())
        item = _public(doc.id, d)
        if item["status"] == "open" and _expired(item):
            item["status"] = "expired"
        out.append(item)
    return out


@peer_router.get("/helping")
def helping(user=Depends(current_user)):
    """Requests I accepted, with the requester's UPI so I can pay."""
    w = _worker(user)
    db = _get_db()
    out = []
    for doc in db.collection("peer_requests").where("helper_id", "==", w["worker_id"]).get():
        d = _sync_overdue(db, doc.id, doc.to_dict())
        d.pop("declined_by", None)
        d.pop("lat", None)
        d.pop("lng", None)
        d["repay_amount"] = d.get("amount", 0) + d.get("bonus", 0)
        out.append({"id": doc.id, **d})
    return out


@firestore.transactional
def _accept_txn(txn, ref, helper):
    snap = ref.get(transaction=txn)
    if not snap.exists:
        raise HTTPException(404, "Request not found.")
    d = snap.to_dict()
    if d["status"] != "open":
        raise HTTPException(409, "Someone else already accepted this request.")
    if _expired(d):
        raise HTTPException(410, "This request has expired.")
    if d["requester_id"] == helper["worker_id"]:
        raise HTTPException(400, "You cannot accept your own request.")
    txn.update(
        ref,
        {
            "status": "accepted",
            "helper_id": helper["worker_id"],
            "helper_name": helper["name"],
            "helper_trust": helper["trust_score"],
            "helper_upi": helper.get("upi_id"),
            "accepted_at": firestore.SERVER_TIMESTAMP,
        },
    )
    return d


@peer_router.post("/{request_id}/accept")
def accept(request_id: str, user=Depends(current_user)):
    w = _worker(user)
    db = _get_db()
    hdoc = db.collection("workers").document(w["worker_id"]).get()
    helper = {**w, "upi_id": (hdoc.to_dict() or {}).get("upi_id")}
    ref = db.collection("peer_requests").document(request_id)
    d = _accept_txn(db.transaction(), ref, helper)
    return {
        "status": "accepted",
        "requester_name": d["requester_name"],
        "requester_upi": d["requester_upi"],
        "amount": d["amount"],
        "bonus": d.get("bonus", 0),
        "repay_amount": d["amount"] + d.get("bonus", 0),
        "repay_by": d.get("repay_by"),
        "kind": d["kind"],
        "note": d["note"],
    }


@peer_router.post("/{request_id}/decline")
def decline(request_id: str, user=Depends(current_user)):
    w = _worker(user)
    ref = _get_db().collection("peer_requests").document(request_id)
    if not ref.get().exists:
        raise HTTPException(404, "Request not found.")
    ref.update({"declined_by": firestore.ArrayUnion([w["worker_id"]])})
    return {"declined": True}


class BoostReq(BaseModel):
    bonus: int


@peer_router.post("/{request_id}/boost")
def boost(request_id: str, body: BoostReq, user=Depends(current_user)):
    w = _worker(user)
    ref = _get_db().collection("peer_requests").document(request_id)
    snap = ref.get()
    if not snap.exists or snap.to_dict()["requester_id"] != w["worker_id"]:
        raise HTTPException(404, "Request not found.")
    d = snap.to_dict()
    if d["kind"] != "money":
        raise HTTPException(400, "Bonus is only for money requests.")
    if d["status"] != "open" or _expired(d):
        raise HTTPException(400, "Only an open request can be boosted.")
    cap = int(d["amount"] * MAX_BONUS_PCT)
    current = d.get("bonus", 0)
    if body.bonus <= current:
        raise HTTPException(400, f"Bonus must be more than your current bonus (Rs {current}).")
    if body.bonus > cap:
        raise HTTPException(400, f"Bonus can be at most Rs {cap} for this request.")
    ref.update({"bonus": body.bonus, "declined_by": [], "created_at": firestore.SERVER_TIMESTAMP})
    return {"status": "open", "bonus": body.bonus, "expires_in_minutes": EXPIRY_MIN}


@peer_router.post("/{request_id}/mark-paid")
def mark_paid(request_id: str, user=Depends(current_user)):
    """The HELPER says: I sent the money by UPI."""
    w = _worker(user)
    ref = _get_db().collection("peer_requests").document(request_id)
    snap = ref.get()
    if not snap.exists or snap.to_dict().get("helper_id") != w["worker_id"]:
        raise HTTPException(404, "Request not found.")
    d = snap.to_dict()
    if d["kind"] != "money":
        raise HTTPException(400, "Only money requests need a payment step.")
    if d["status"] != "accepted":
        raise HTTPException(400, "Payment can only be marked after you accept.")
    ref.update({"status": "funded", "paid_at": firestore.SERVER_TIMESTAMP})
    return {"status": "funded"}


@peer_router.post("/{request_id}/complete")
def complete(request_id: str, user=Depends(current_user)):
    """The person who RECEIVED help confirms. The helper gets points and trust."""
    w = _worker(user)
    db = _get_db()
    ref = db.collection("peer_requests").document(request_id)
    snap = ref.get()
    if not snap.exists or snap.to_dict()["requester_id"] != w["worker_id"]:
        raise HTTPException(404, "Request not found.")
    d = snap.to_dict()
    needed = "funded" if d["kind"] == "money" else "accepted"
    if d["status"] != needed:
        if d["kind"] == "money" and d["status"] == "accepted":
            raise HTTPException(400, "The helper has not marked the payment as sent yet.")
        raise HTTPException(400, "Nobody has accepted this request yet.")
    help_type = "urgent" if d["urgency"] == "urgent" else KINDS[d["kind"]]
    result = record_help(d["helper_id"], w["worker_id"], help_type)
    if not result.get("recorded"):
        raise HTTPException(400, result.get("reason", "Could not record help."))
    _change_trust(db, d["helper_id"], 2, "Helped a nearby worker, confirmed by them")
    ref.update({"status": "completed", "completed_at": firestore.SERVER_TIMESTAMP})
    return {
        "status": "completed",
        "helper_points_given": result["points"],
        "repay_amount": d["amount"] + d.get("bonus", 0) if d["kind"] == "money" else 0,
        "repay_by": d.get("repay_by"),
        "helper_upi": d.get("helper_upi"),
    }


@peer_router.post("/{request_id}/mark-repaid")
def mark_repaid(request_id: str, user=Depends(current_user)):
    """The HELPER says: I got my money back."""
    w = _worker(user)
    db = _get_db()
    ref = db.collection("peer_requests").document(request_id)
    snap = ref.get()
    if not snap.exists or snap.to_dict().get("helper_id") != w["worker_id"]:
        raise HTTPException(404, "Request not found.")
    d = snap.to_dict()
    if d["kind"] != "money" or d["status"] not in ("completed", "overdue"):
        raise HTTPException(400, "Nothing to repay on this request.")
    if d["status"] == "completed":
        _change_trust(db, d["requester_id"], 1, "Repaid a nearby worker on time")
    ref.update({"status": "repaid", "repaid_at": firestore.SERVER_TIMESTAMP})
    return {"status": "repaid"}


@peer_router.post("/{request_id}/cancel")
def cancel(request_id: str, user=Depends(current_user)):
    w = _worker(user)
    ref = _get_db().collection("peer_requests").document(request_id)
    snap = ref.get()
    if not snap.exists or snap.to_dict()["requester_id"] != w["worker_id"]:
        raise HTTPException(404, "Request not found.")
    d = snap.to_dict()
    allowed = ("open",) if d["kind"] == "money" else ("open", "accepted")
    if d["status"] not in allowed:
        raise HTTPException(400, "This request can no longer be cancelled.")
    ref.update({"status": "cancelled"})
    return {"status": "cancelled"}

@peer_router.post("/{request_id}/dispute")
def dispute(request_id: str, user=Depends(current_user)):
    """The HELPER says: I sent the money but the requester never confirmed."""
    w = _worker(user)
    db = _get_db()
    ref = db.collection("peer_requests").document(request_id)
    snap = ref.get()
    if not snap.exists or snap.to_dict().get("helper_id") != w["worker_id"]:
        raise HTTPException(404, "Request not found.")
    d = snap.to_dict()
    if d["kind"] != "money" or d["status"] != "funded":
        raise HTTPException(400, "Dispute is only possible after you marked the money as sent.")
    paid = d.get("paid_at")
    if not paid:
        raise HTTPException(400, "Payment time is missing.")
    wait = timedelta(hours=DISPUTE_AFTER_HOURS)
    if datetime.now(timezone.utc) - paid < wait:
        left = paid + wait - datetime.now(timezone.utc)
        mins = int(left.total_seconds() // 60) + 1
        raise HTTPException(400, f"Give the requester time to confirm. You can raise a dispute in {mins} minutes.")

    help_type = "urgent" if d["urgency"] == "urgent" else KINDS[d["kind"]]
    result = record_help(d["helper_id"], d["requester_id"], help_type)
    points = result.get("points", 0) if result.get("recorded") else 0
    _change_trust(db, d["helper_id"], 2, "Helped a nearby worker (requester did not confirm)")
    _change_trust(db, d["requester_id"], -DISPUTE_PENALTY, "Received help but did not confirm it")
    ref.update({"status": "disputed", "disputed_at": firestore.SERVER_TIMESTAMP})
    return {"status": "disputed", "helper_points_given": points}