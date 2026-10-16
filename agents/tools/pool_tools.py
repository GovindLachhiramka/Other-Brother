from google.cloud import firestore

from tools.firestore_tools import _get_db

POOL_DOC = ("pool", "main")
NEW_WORKER_LIMIT = 500


def _limit_for(trust_score: int) -> int:
    if trust_score >= 71:
        return 2000
    if trust_score >= 41:
        return 1000
    return NEW_WORKER_LIMIT


def get_pool_balance() -> dict:
    """Returns the current balance of the shared community pool."""
    db = _get_db()
    doc = db.collection(*POOL_DOC[:1]).document(POOL_DOC[1]).get()
    balance = doc.to_dict().get("balance", 0) if doc.exists else 0
    return {"balance": balance}


def contribute_to_pool(worker_id: str, amount: int) -> dict:
    """Adds a simulated contribution to the pool (no real money moves)."""
    if amount <= 0:
        return {"done": False, "reason": "Amount must be positive."}
    db = _get_db()
    db.collection("pool").document("main").set(
        {"balance": firestore.Increment(amount)}, merge=True
    )
    db.collection("pool_ledger").add(
        {
            "type": "contribution",
            "worker_id": worker_id,
            "amount": amount,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    return {"done": True, "contributed": amount}


def request_from_pool(worker_id: str, amount: int, urgency: str, trust_score: int) -> dict:
    """Approves or rejects a pool request based on trust-score limit and pool balance.

    urgency is one of: urgent, normal. Simulated money only.
    """
    db = _get_db()
    worker = db.collection("workers").document(worker_id).get()
    if not worker.exists or worker.to_dict().get("status") != "approved":
        return {"approved": False, "reason": "Worker is not approved."}

    open_loans = (
        db.collection("pool_requests")
        .where("worker_id", "==", worker_id)
        .where("status", "==", "approved")
        .limit(1)
        .get()
    )
    if len(open_loans) > 0:
        return {"approved": False, "reason": "Repay your current request first."}

    limit = _limit_for(trust_score)
    if amount > limit:
        return {"approved": False, "reason": f"Your limit is Rs {limit} at this trust score."}

    pool = db.collection("pool").document("main").get()
    balance = pool.to_dict().get("balance", 0) if pool.exists else 0
    if amount > balance:
        return {"approved": False, "reason": "Pool balance is too low right now."}

    db.collection("pool").document("main").update({"balance": firestore.Increment(-amount)})
    req = db.collection("pool_requests").document()
    req.set(
        {
            "worker_id": worker_id,
            "amount": amount,
            "urgency": urgency,
            "status": "approved",
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    return {"approved": True, "request_id": req.id, "amount": amount}


def repay_pool(request_id: str) -> dict:
    """Marks a pool request as repaid and returns the money to the pool."""
    db = _get_db()
    ref = db.collection("pool_requests").document(request_id)
    doc = ref.get()
    if not doc.exists:
        return {"repaid": False, "reason": "Request not found."}
    data = doc.to_dict()
    if data.get("status") != "approved":
        return {"repaid": False, "reason": "Request is not open."}
    ref.update({"status": "repaid"})
    db.collection("pool").document("main").update(
        {"balance": firestore.Increment(data["amount"])}
    )
    return {"repaid": True, "amount": data["amount"]}


def record_help(helper_id: str, receiver_id: str, help_type: str) -> dict:
    """Records a confirmed peer help and gives the helper points.

    help_type is one of: urgent, money, item, small.
    """
    if helper_id == receiver_id:
        return {"recorded": False, "reason": "Cannot help yourself."}
    points = {"urgent": 3, "money": 2, "item": 2, "small": 1}.get(help_type)
    if points is None:
        return {"recorded": False, "reason": "Unknown help type."}

    db = _get_db()
    repeats = (
        db.collection("help_events")
        .where("helper_id", "==", helper_id)
        .where("receiver_id", "==", receiver_id)
        .get()
    )
    if len(repeats) >= 3:
        return {"recorded": False, "reason": "Same pair helped too often, flagged."}

    db.collection("help_events").add(
        {
            "helper_id": helper_id,
            "receiver_id": receiver_id,
            "help_type": help_type,
            "points": points,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    db.collection("workers").document(helper_id).update(
        {"helper_points": firestore.Increment(points)}
    )
    return {"recorded": True, "points": points}