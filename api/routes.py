import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.cloud import storage
from pydantic import BaseModel

from tools.auth_tools import get_login_state, verify_token
from tools.claims_tools import assess_and_file_claim
from tools.firestore_tools import _get_db
from tools.pool_tools import (
    contribute_to_pool,
    get_pool_balance,
    record_help,
    repay_pool,
    request_from_pool,
)
from tools.scheme_rules import add_mock_income, check_scheme_eligibility, file_contribution

router = APIRouter()
bearer = HTTPBearer(auto_error=False)

BUCKET = os.getenv("BUCKET", "buildercup-docs-ob")
UPLOAD_KINDS = {"id", "licence", "rc", "selfie", "claim_photo", "claim_voice"}
MAX_BYTES = 8 * 1024 * 1024


def current_user(cred: HTTPAuthorizationCredentials = Depends(bearer)):
    if cred is None or not cred.credentials:
        raise HTTPException(status_code=401, detail="Login required")
    result = verify_token(cred.credentials)
    if not result["ok"]:
        raise HTTPException(status_code=401, detail=result["reason"])
    return result


def _worker(user) -> dict:
    state = get_login_state(user["uid"], user["phone"])
    if state.get("state") != "approved":
        raise HTTPException(status_code=403, detail="Only approved workers can do this.")
    return state


# ---------------- Upload (camera photos, voice notes) ----------------
@router.post("/upload")
async def upload(kind: str = Form(...), file: UploadFile = File(...), user=Depends(current_user)):
    if kind not in UPLOAD_KINDS:
        raise HTTPException(status_code=400, detail=f"kind must be one of {sorted(UPLOAD_KINDS)}")
    ctype = file.content_type or ""
    if not (ctype.startswith("image/") or ctype.startswith("audio/")):
        raise HTTPException(status_code=400, detail="Only image or audio files are allowed.")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 8 MB).")
    default_ext = ".jpg" if ctype.startswith("image/") else ".webm"
    ext = os.path.splitext(file.filename or "")[1].lower() or default_ext
    path = f"uploads/{user['phone']}/{kind}-{uuid.uuid4().hex[:8]}{ext}"
    blob = storage.Client(project=os.getenv("GOOGLE_CLOUD_PROJECT")).bucket(BUCKET).blob(path)
    blob.upload_from_string(data, content_type=ctype)
    return {"uri": f"gs://{BUCKET}/{path}"}


# ---------------- Claims ----------------
class ClaimReq(BaseModel):
    photo_uri: str
    voice_uri: str = ""
    note: str = ""


def _own_upload(uri: str, user) -> bool:
    return uri.startswith(f"gs://{BUCKET}/uploads/{user['phone']}/")


@router.post("/claims")
def new_claim(body: ClaimReq, user=Depends(current_user)):
    w = _worker(user)
    if not _own_upload(body.photo_uri, user) or (body.voice_uri and not _own_upload(body.voice_uri, user)):
        raise HTTPException(status_code=400, detail="Use files you uploaded through /upload.")
    return assess_and_file_claim(w["worker_id"], body.photo_uri, body.voice_uri, body.note)


@router.get("/claims")
def my_claims(user=Depends(current_user)):
    w = _worker(user)
    docs = _get_db().collection("claims").where("worker_id", "==", w["worker_id"]).get()
    return [{"id": d.id, **d.to_dict()} for d in docs]


@router.get("/claims/{claim_id}")
def claim_detail(claim_id: str, user=Depends(current_user)):
    w = _worker(user)
    doc = _get_db().collection("claims").document(claim_id).get()
    if not doc.exists or doc.to_dict().get("worker_id") != w["worker_id"]:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"id": doc.id, **doc.to_dict()}


# ---------------- Community pool ----------------
class AmountReq(BaseModel):
    amount: int


class PoolReq(BaseModel):
    amount: int
    urgency: str = "normal"


@router.get("/pool")
def pool(user=Depends(current_user)):
    _worker(user)
    return get_pool_balance()


@router.post("/pool/contribute")
def pool_contribute(body: AmountReq, user=Depends(current_user)):
    w = _worker(user)
    return contribute_to_pool(w["worker_id"], body.amount)


@router.post("/pool/request")
def pool_request(body: PoolReq, user=Depends(current_user)):
    w = _worker(user)
    # trust score server se aata hai, client se nahi (cheating rokne ke liye)
    return request_from_pool(w["worker_id"], body.amount, body.urgency, w["trust_score"])


@router.get("/pool/requests")
def my_pool_requests(user=Depends(current_user)):
    w = _worker(user)
    docs = _get_db().collection("pool_requests").where("worker_id", "==", w["worker_id"]).get()
    return [{"id": d.id, **d.to_dict()} for d in docs]


@router.post("/pool/repay/{request_id}")
def pool_repay(request_id: str, user=Depends(current_user)):
    w = _worker(user)
    db = _get_db()
    doc = db.collection("pool_requests").document(request_id).get()
    if not doc.exists or doc.to_dict().get("worker_id") != w["worker_id"]:
        raise HTTPException(status_code=404, detail="Request not found")
    result = repay_pool(request_id)
    if result.get("repaid"):
        ref = db.collection("workers").document(w["worker_id"])
        score = min(100, (ref.get().to_dict().get("trust_score", 50)) + 3)
        ref.update({"trust_score": score})
        ref.collection("trust_events").add({"change": 3, "reason": "Repaid pool request on time"})
        result["new_trust_score"] = score
    return result


# ---------------- Helping others ----------------
class HelpConfirm(BaseModel):
    helper_id: str
    help_type: str  # urgent, money, item, small


@router.post("/help/confirm")
def help_confirm(body: HelpConfirm, user=Depends(current_user)):
    """The person who RECEIVED help confirms it. The helper gets points."""
    w = _worker(user)
    return record_help(body.helper_id, w["worker_id"], body.help_type)


@router.get("/leaderboard")
def leaderboard(user=Depends(current_user)):
    _worker(user)
    docs = (
        _get_db()
        .collection("workers")
        .order_by("helper_points", direction="DESCENDING")
        .limit(10)
        .get()
    )
    return [
        {
            "worker_id": d.id,
            "name": d.to_dict().get("name"),
            "helper_points": d.to_dict().get("helper_points", 0),
            "gender": d.to_dict().get("gender", "other"),
        }
        for d in docs
    ]


# ---------------- Trust score ----------------
@router.get("/trust/me")
def trust_me(user=Depends(current_user)):
    w = _worker(user)
    events = (
        _get_db().collection("workers").document(w["worker_id"]).collection("trust_events").limit(20).get()
    )
    return {"trust_score": w["trust_score"], "events": [e.to_dict() for e in events]}


# ---------------- Income and compliance ----------------
class IncomeReq(BaseModel):
    month: str  # YYYY-MM
    platform: str
    amount: int


@router.post("/income")
def add_income(body: IncomeReq, user=Depends(current_user)):
    w = _worker(user)
    return add_mock_income(w["worker_id"], body.month, body.platform, body.amount)


@router.get("/compliance/status")
def compliance_status(month: str, user=Depends(current_user)):
    w = _worker(user)
    return check_scheme_eligibility(w["worker_id"], month)


@router.post("/compliance/run")
def compliance_run(month: str, user=Depends(current_user)):
    w = _worker(user)
    check = check_scheme_eligibility(w["worker_id"], month)
    results = [file_contribution(w["worker_id"], e["scheme"], month) for e in check["eligible"]]
    return {"income": check["income"], "results": results}