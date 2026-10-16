import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AGENTS_DIR = os.path.join(BASE_DIR, "agents")
sys.path.insert(0, AGENTS_DIR)

from dotenv import load_dotenv

load_dotenv(os.path.join(AGENTS_DIR, ".env"))

from fastapi import Depends, FastAPI, Header, HTTPException
from google.adk.cli.fast_api import get_fast_api_app
from pydantic import BaseModel

from tools.firestore_tools import _get_db
from tools.registration import decide_registration, get_registration_status, run_registration
from tools.auth_tools import get_login_state, verify_token

app: FastAPI = get_fast_api_app(
    agents_dir=AGENTS_DIR,
    allow_origins=["*"],  # demo only. Deploy ke baad frontend URL daalna
    web=False,
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegisterRequest(BaseModel):
    phone: str
    device_id: str
    upi_id: str
    upi_name: str
    platform_name: str
    company: str
    partner_id: str
    id_uri: str = ""
    selfie_uri: str = ""
    licence_uri: str = ""
    rc_uri: str = ""
    uid: str = ""
    email: str = ""
    gender: str = ""


@app.get("/health")
def health():
    return {"status": "ok", "app": "Other/Brother"}


# ---------- Registration ----------
@app.post("/register")
def register(body: RegisterRequest):
    return run_registration(**body.model_dump())


@app.get("/register/status/{request_id}")
def register_status(request_id: str):
    result = get_registration_status(request_id)
    if not result.get("found"):
        raise HTTPException(status_code=404, detail=result["reason"])
    return result


# ---------- Company portal (demo: no login, v2 adds company auth) ----------
@app.get("/company/pending")
def company_pending(company: str):
    docs = (
        _get_db()
        .collection("company_verifications")
        .where("company", "==", company)
        .where("status", "==", "pending")
        .get()
    )
    return [
        {
            "id": d.id,
            "worker_name": d.to_dict().get("worker_name"),
            "partner_id": d.to_dict().get("partner_id"),
            "id_last4": d.to_dict().get("id_last4"),
            "vehicle_number": d.to_dict().get("vehicle_number"),
            "created_at": d.to_dict().get("created_at"),
        }
        for d in docs
    ]


@app.post("/company/decision/{request_id}")
def company_decision(request_id: str, confirm: bool, manager: str):
    result = decide_registration(request_id, confirm, manager)
    if not result.get("ok"):
        raise HTTPException(status_code=400, detail=result["reason"])
    return result


@app.get("/company/status/{request_id}")
def company_status(request_id: str):
    result = get_registration_status(request_id)
    if not result.get("found"):
        raise HTTPException(status_code=404, detail=result["reason"])
    return {"status": result["status"]}


# ---------- Worker ----------
def current_user(authorization: str = Header(default="")):
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Login required")
    result = verify_token(token)
    if not result["ok"]:
        raise HTTPException(status_code=401, detail=result["reason"])
    return result


@app.get("/auth/me")
def auth_me(user=Depends(current_user)):
    """Call this right after login. The state decides which screen the app shows."""
    return get_login_state(user["uid"], user["phone"])


@app.get("/worker/{worker_id}")
def worker(worker_id: str, user=Depends(current_user)):
    state = get_login_state(user["uid"], user["phone"])
    if state.get("state") != "approved" or state.get("worker_id") != worker_id:
        raise HTTPException(status_code=403, detail="You can only view your own profile.")
    return state

from api.routes import router

app.include_router(router)

from api.peer_routes import peer_router

app.include_router(peer_router)

from api.support_routes import support_router

app.include_router(support_router)