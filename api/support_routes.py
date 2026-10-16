from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore
from pydantic import BaseModel, Field

from api.routes import _worker, current_user
from tools.firestore_tools import _get_db

support_router = APIRouter()

CATEGORIES = {"claim", "pool", "nearby", "account", "other"}
MAX_OPEN = 5


class TicketReq(BaseModel):
    category: str
    message: str = Field(min_length=5, max_length=1000)


class ReplyReq(BaseModel):
    reply: str = Field(min_length=2, max_length=1000)
    resolve: bool = True


@support_router.post("/support")
def create_ticket(body: TicketReq, user=Depends(current_user)):
    w = _worker(user)
    if body.category not in CATEGORIES:
        raise HTTPException(400, f"category must be one of {sorted(CATEGORIES)}")
    db = _get_db()
    open_now = db.collection("support_tickets").where("worker_id", "==", w["worker_id"]).where("status", "==", "open").get()
    if len(open_now) >= MAX_OPEN:
        raise HTTPException(400, "You already have several open help requests. Please wait for a reply.")
    ref = db.collection("support_tickets").document()
    ref.set(
        {
            "worker_id": w["worker_id"],
            "worker_name": w["name"],
            "company": w["company"],
            "category": body.category,
            "message": body.message.strip(),
            "status": "open",
            "reply": None,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
    )
    return {"ticket_id": ref.id, "status": "open"}


@support_router.get("/support/mine")
def my_tickets(user=Depends(current_user)):
    w = _worker(user)
    docs = _get_db().collection("support_tickets").where("worker_id", "==", w["worker_id"]).get()
    out = []
    for d in docs:
        x = d.to_dict()
        out.append({"id": d.id, **{k: x.get(k) for k in ("category", "message", "status", "reply", "created_at", "replied_at")}})
    out.sort(key=lambda t: str(t.get("created_at")), reverse=True)
    return out


# ---------- Company portal side (demo: no login, same as the rest of /company) ----------
@support_router.get("/company/support")
def company_tickets(company: str, status: str = "open"):
    docs = _get_db().collection("support_tickets").where("company", "==", company).where("status", "==", status).get()
    out = []
    for d in docs:
        x = d.to_dict()
        out.append(
            {
                "id": d.id,
                "worker_name": x.get("worker_name"),
                "category": x.get("category"),
                "message": x.get("message"),
                "created_at": x.get("created_at"),
            }
        )
    out.sort(key=lambda t: str(t.get("created_at")))
    return out


@support_router.post("/company/support/{ticket_id}/reply")
def company_reply(ticket_id: str, body: ReplyReq, manager: str):
    ref = _get_db().collection("support_tickets").document(ticket_id)
    if not ref.get().exists:
        raise HTTPException(404, "Ticket not found.")
    ref.update(
        {
            "reply": body.reply.strip(),
            "replied_by": manager,
            "replied_at": firestore.SERVER_TIMESTAMP,
            "status": "resolved" if body.resolve else "open",
        }
    )
    return {"status": "resolved" if body.resolve else "open"}