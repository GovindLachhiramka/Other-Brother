import hashlib

from google.cloud import firestore

PROJECT = "buildercup"
db = firestore.Client(project=PROJECT)


def h(v: str) -> str:
    return hashlib.sha256(v.strip().lower().encode()).hexdigest()


# id, name, phone, vehicle, upi, company, partner_id, trust, fake id number
WORKERS = [
    ("ravi", "Ravi Kumar", "9000000001", "KA01AB1234", "ravi@upi", "Swiggy", "RID-1001", 82, "100000000001"),
    ("priya", "Priya Nair", "9000000002", "KL07CD5678", "priya@upi", "Zomato", "RID-1002", 90, "100000000002"),
    ("amit", "Amit Singh", "9000000003", "DL03EF9012", "amit@upi", "Rapido", "RID-1003", 35, "100000000003"),
    ("suresh", "Suresh Patil", "9000000004", "MH12GH3456", "suresh@upi", "Ekart", "RID-1004", 60, "100000000004"),
    ("meena", "Meena Devi", "9000000005", "TN09JK7890", "meena@upi", "Blinkit", "RID-1005", 71, "100000000005"),
    ("imran", "Imran Khan", "9000000006", "UP32LM1357", "imran@upi", "Demo Foods Ltd", "RID-1006", 45, "100000000006"),
]

# worker, month, platform, amount
INCOME = [
    ("ravi", "Swiggy", 4500), ("ravi", "Rapido", 3200),
    ("priya", "Zomato", 6200), ("priya", "Blinkit", 2500),
    ("amit", "Rapido", 2200),
    ("suresh", "Ekart", 5400), ("suresh", "Delhivery", 1800),
    ("meena", "Blinkit", 4800), ("meena", "Zepto", 2100),
    ("imran", "Demo Foods Ltd", 3900), ("imran", "Swiggy", 1600),
]
MONTH = "2026-10"

# helper, receiver, type
HELP = [
    ("ravi", "amit", "urgent"), ("ravi", "imran", "money"), ("ravi", "meena", "item"),
    ("priya", "amit", "urgent"), ("priya", "suresh", "small"), ("meena", "imran", "money"),
]
POINTS = {"urgent": 3, "money": 2, "item": 2, "small": 1}

CLAIMS = [
    ("claim_ravi_1", "ravi", "Scooter slipped on wet road", "Front mudguard cracked, left mirror broken", 4500, "low", "approved"),
    ("claim_priya_1", "priya", "Bike hit by auto at signal", "Rear light and indicator damaged", 3200, "low", "under_review"),
    ("claim_suresh_1", "suresh", "Parcel van door dent", "Side panel dent", 6000, "low", "submitted"),
    ("claim_amit_1", "amit", "Fell near bridge", "Handle bent", 8000, "medium", "submitted"),
]


def main():
    # helper points from events
    helper_points = {}
    for helper, _, kind in HELP:
        helper_points[helper] = helper_points.get(helper, 0) + POINTS[kind]

    for wid, name, phone, vehicle, upi, company, partner, trust, idnum in WORKERS:
        db.collection("workers").document(wid).set(
            {
                "name": name,
                "phone": phone,
                "id_hash": h(idnum),
                "id_last4": idnum[-4:],
                "dl_hash": h("DL" + idnum),
                "device_id": f"demo-device-{wid}",
                "vehicle_number": vehicle,
                "upi_id": upi,
                "company": company,
                "partner_id": partner,
                "status": "approved",
                "trust_score": trust,
                "helper_points": helper_points.get(wid, 0),
                "created_at": firestore.SERVER_TIMESTAMP,
            }
        )

    for wid, platform, amount in INCOME:
        db.collection("income_records").document(f"{wid}_{MONTH}_{platform}".replace(" ", "_")).set(
            {"worker_id": wid, "month": MONTH, "platform": platform, "amount": amount}
        )

    db.collection("pool").document("main").set({"balance": 5000})

    for i, (helper, receiver, kind) in enumerate(HELP, start=1):
        db.collection("help_events").document(f"help_{i}").set(
            {
                "helper_id": helper,
                "receiver_id": receiver,
                "help_type": kind,
                "points": POINTS[kind],
                "created_at": firestore.SERVER_TIMESTAMP,
            }
        )

    for cid, wid, desc, damage, amount, risk, status in CLAIMS:
        db.collection("claims").document(cid).set(
            {
                "worker_id": wid,
                "description": desc,
                "damage_summary": damage,
                "estimated_amount": amount,
                "fraud_risk": risk,
                "status": status,
                "created_at": firestore.SERVER_TIMESTAMP,
            }
        )

    # Ravi ke trust events (explainable score)
    events = [
        (10, "5 repayments made on time"),
        (5, "Identity and vehicle verified"),
        (7, "Helped 3 workers, all confirmed by both sides"),
        (-0, "No fraud signals found"),
    ]
    for i, (change, reason) in enumerate(events, start=1):
        db.collection("workers").document("ravi").collection("trust_events").document(f"e{i}").set(
            {"change": change, "reason": reason}
        )

    # Company portal ke liye 2 pending requests
    pending = [
        ("cv_demo_1", "Kavita Rao", "9000000011", "RID-2001", "KA05NP2468", "200000000001"),
        ("cv_demo_2", "Rahul Verma", "9000000012", "RID-2002", "KA03QR1357", "200000000002"),
    ]
    for cid, name, phone, partner, vehicle, idnum in pending:
        db.collection("company_verifications").document(cid).set(
            {
                "uid": "",
                "worker_name": name,
                "phone": phone,
                "id_hash": h(idnum),
                "id_last4": idnum[-4:],
                "dl_hash": h("DL" + idnum),
                "device_id": f"demo-device-{cid}",
                "vehicle_number": vehicle,
                "upi_id": f"{name.split()[0].lower()}@upi",
                "company": "Demo Foods Ltd",
                "partner_id": partner,
                "status": "pending",
                "created_at": firestore.SERVER_TIMESTAMP,
            }
        )

    print("Seed done: 6 workers, 11 income records, pool 5000, 6 help events, 4 claims, 2 pending requests.")


if __name__ == "__main__":
    main()