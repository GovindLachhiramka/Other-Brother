from google.adk.agents import Agent

from tools.firestore_tools import _get_db


def get_worker_history(worker_id: str) -> dict:
    """Fetches a worker's trust score and past trust events from Firestore."""
    db = _get_db()
    doc = db.collection("workers").document(worker_id).get()
    if not doc.exists:
        return {"found": False, "reason": "Worker not found."}
    data = doc.to_dict()
    events = [
        e.to_dict()
        for e in db.collection("workers")
        .document(worker_id)
        .collection("trust_events")
        .limit(20)
        .stream()
    ]
    return {
        "found": True,
        "trust_score": data.get("trust_score", 50),
        "company": data.get("company"),
        "events": events,
    }


def update_trust_score(worker_id: str, change: int, reason: str) -> dict:
    """Changes a worker's trust score (keeps it between 0 and 100) and logs why."""
    db = _get_db()
    ref = db.collection("workers").document(worker_id)
    doc = ref.get()
    if not doc.exists:
        return {"updated": False, "reason": "Worker not found."}
    old = doc.to_dict().get("trust_score", 50)
    new = max(0, min(100, old + change))
    ref.update({"trust_score": new})
    ref.collection("trust_events").add({"change": change, "reason": reason})
    return {"updated": True, "old_score": old, "new_score": new}


root_agent = Agent(
    name="trust_risk_agent",
    model="gemini-2.5-flash",
    description="Scores worker trust and flags fraud risk with plain-language reasons.",
    instruction=(
        "You are the Trust and Risk Agent. For a worker_id, call get_worker_history. "
        "Give the score and a short, plain-language reason a judge can understand, "
        "based only on the real events returned. "
        "Raise the score for on-time repayments and verified help. "
        "Lower it for late repayments, suspicious claims or fake help. "
        "Use update_trust_score to apply changes, always with a clear reason. "
        "Never invent history that is not in the data."
    ),
    tools=[get_worker_history, update_trust_score],
)