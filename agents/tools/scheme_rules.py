from google.cloud import firestore

from tools.firestore_tools import _get_db

# Mock scheme rules for the demo (v2: real government scheme APIs)
SCHEMES = {
    "eshram": {
        "name": "e-Shram Accident Cover",
        "min_monthly_income": 3000,
        "monthly_contribution": 0,
    },
    "pmjjby": {
        "name": "PM Jeevan Jyoti Bima",
        "min_monthly_income": 5000,
        "monthly_contribution": 36,
    },
    "pmsby": {
        "name": "PM Suraksha Bima",
        "min_monthly_income": 4000,
        "monthly_contribution": 20,
    },
}


def get_income(worker_id: str, month: str) -> dict:
    """Adds up a worker's income across all linked platforms for a month (YYYY-MM).

    Reads mock income records from Firestore.
    """
    db = _get_db()
    records = (
        db.collection("income_records")
        .where("worker_id", "==", worker_id)
        .where("month", "==", month)
        .get()
    )
    by_platform = {}
    for r in records:
        d = r.to_dict()
        by_platform[d["platform"]] = by_platform.get(d["platform"], 0) + d["amount"]
    return {"total": sum(by_platform.values()), "by_platform": by_platform}


def add_mock_income(worker_id: str, month: str, platform: str, amount: int) -> dict:
    """Adds a mock income record. Used only to prepare the demo."""
    db = _get_db()
    db.collection("income_records").add(
        {"worker_id": worker_id, "month": month, "platform": platform, "amount": amount}
    )
    return {"added": True}


def check_scheme_eligibility(worker_id: str, month: str) -> dict:
    """Checks which mock schemes the worker is eligible for, based on monthly income."""
    income = get_income(worker_id, month)["total"]
    eligible = []
    for key, s in SCHEMES.items():
        if income >= s["min_monthly_income"]:
            eligible.append(
                {
                    "scheme": key,
                    "name": s["name"],
                    "contribution": s["monthly_contribution"],
                }
            )
    return {"income": income, "eligible": eligible}


def file_contribution(worker_id: str, scheme: str, month: str) -> dict:
    """Files the monthly contribution for a scheme (mock, no real payment)."""
    if scheme not in SCHEMES:
        return {"filed": False, "reason": "Unknown scheme."}
    db = _get_db()
    check = check_scheme_eligibility(worker_id, month)
    if scheme not in [e["scheme"] for e in check["eligible"]]:
        return {"filed": False, "reason": "Income below scheme threshold."}

    existing = (
        db.collection("filings")
        .where("worker_id", "==", worker_id)
        .where("scheme", "==", scheme)
        .where("month", "==", month)
        .limit(1)
        .get()
    )
    if len(existing) > 0:
        return {"filed": False, "reason": "Already filed for this month."}

    db.collection("filings").add(
        {
            "worker_id": worker_id,
            "scheme": scheme,
            "month": month,
            "amount": SCHEMES[scheme]["monthly_contribution"],
            "status": "filed",
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    return {"filed": True, "scheme": SCHEMES[scheme]["name"], "month": month}