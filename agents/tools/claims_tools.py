from google.cloud import firestore

from tools.firestore_tools import _get_db


def create_claim(
    worker_id: str,
    description: str,
    damage_summary: str,
    estimated_amount: int,
    fraud_risk: str,
) -> dict:
    """Creates a claim in Firestore after the photo and voice note are assessed.

    fraud_risk must be one of: low, medium, high.
    """
    db = _get_db()
    worker = db.collection("workers").document(worker_id).get()
    if not worker.exists:
        return {"created": False, "reason": "Worker not found."}
    if worker.to_dict().get("status") != "approved":
        return {"created": False, "reason": "Worker is not approved."}
    if fraud_risk == "high":
        return {"created": False, "reason": "Claim blocked: high fraud risk."}

    doc = db.collection("claims").document()
    doc.set(
        {
            "worker_id": worker_id,
            "description": description,
            "damage_summary": damage_summary,
            "estimated_amount": estimated_amount,
            "fraud_risk": fraud_risk,
            "status": "submitted",
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    return {"created": True, "claim_id": doc.id, "status": "submitted"}


def get_claim_status(claim_id: str) -> dict:
    """Returns the current status of a claim."""
    db = _get_db()
    doc = db.collection("claims").document(claim_id).get()
    if not doc.exists:
        return {"found": False, "reason": "Claim not found."}
    data = doc.to_dict()
    return {
        "found": True,
        "status": data.get("status"),
        "estimated_amount": data.get("estimated_amount"),
        "fraud_risk": data.get("fraud_risk"),
    }


def update_claim_status(claim_id: str, status: str) -> dict:
    """Moves a claim to: submitted, under_review, approved or garage_confirmed.

    This is a mock insurer step for the demo.
    """
    allowed = {"submitted", "under_review", "approved", "garage_confirmed"}
    if status not in allowed:
        return {"updated": False, "reason": f"Status must be one of {sorted(allowed)}."}
    db = _get_db()
    ref = db.collection("claims").document(claim_id)
    if not ref.get().exists:
        return {"updated": False, "reason": "Claim not found."}
    ref.update({"status": status})
    return {"updated": True, "status": status}


import json

from google.genai import types

from tools.vision_tools import MODEL, _client, _image_part


def _audio_part(uri: str):
    low = uri.lower()
    if low.endswith(".mp3"):
        mime = "audio/mpeg"
    elif low.endswith(".wav"):
        mime = "audio/wav"
    elif low.endswith(".ogg"):
        mime = "audio/ogg"
    elif low.endswith(".m4a") or low.endswith(".mp4"):
        mime = "audio/mp4"
    else:
        mime = "audio/webm"
    return types.Part.from_uri(file_uri=uri, mime_type=mime)


def assess_and_file_claim(worker_id: str, photo_uri: str, voice_uri: str = "", note: str = "") -> dict:
    """Gemini looks at the accident photo (and voice note), then files the claim."""
    prompt = (
        "You are an insurance claims assessor for delivery workers in India. "
        "Look at the vehicle photo and, if given, listen to the voice note. "
        "Reply ONLY with JSON using keys: is_accident_photo (true or false), "
        "description (what the worker says happened, in English), "
        "damage_summary (visible damage only), estimated_amount_inr (integer repair estimate), "
        "fraud_risk (low, medium or high), fraud_reason (one short sentence). "
        "Fraud signs: photo does not match the story, old or reused-looking damage, "
        "contradictions. Never invent damage that is not visible. "
        f"Worker note: {note}"
    )
    parts = [_image_part(photo_uri)]
    if voice_uri:
        parts.append(_audio_part(voice_uri))
    parts.append(prompt)
    try:
        resp = _client().models.generate_content(
            model=MODEL,
            contents=parts,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        data = json.loads(resp.text)
    except Exception:
        return {"created": False, "reason": "Could not assess the photo. Please try again."}

    if not data.get("is_accident_photo"):
        return {"created": False, "reason": "The photo does not show vehicle damage."}

    risk = str(data.get("fraud_risk", "medium")).lower()
    if risk not in {"low", "medium", "high"}:
        risk = "medium"
    amount = int(data.get("estimated_amount_inr") or 0)
    summary = data.get("damage_summary", "")

    result = create_claim(worker_id, data.get("description") or note, summary, amount, risk)
    if result.get("created"):
        _get_db().collection("claims").document(result["claim_id"]).update(
            {"photo_uri": photo_uri, "voice_uri": voice_uri, "fraud_reason": data.get("fraud_reason")}
        )
        result.update(
            {
                "damage_summary": summary,
                "estimated_amount": amount,
                "fraud_risk": risk,
                "fraud_reason": data.get("fraud_reason"),
            }
        )
    return result