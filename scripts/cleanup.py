import sys

from google.cloud import firestore

db = firestore.Client(project="buildercup")
APPLY = "--yes" in sys.argv

KEEP_WORKERS = {"ravi", "priya", "amit", "suresh", "meena", "imran"}
KEEP_REQUESTS = {"cv_demo_1", "cv_demo_2"}

extra = [a.split("=", 1)[1] for a in sys.argv if a.startswith("--keep-worker=")]
KEEP_WORKERS |= set(extra)

# 1. Workers to delete
del_workers = [d for d in db.collection("workers").stream() if d.id not in KEEP_WORKERS]
del_ids = {d.id for d in del_workers}

# 2. Registration requests to delete (everything except the 2 demo ones)
del_requests = [d for d in db.collection("company_verifications").stream() if d.id not in KEEP_REQUESTS]

# 3. Failed attempts and blocks
del_attempts = list(db.collection("registration_attempts").stream())

# 4. Data that belongs to deleted workers
related = []
for coll, field in (
    ("claims", "worker_id"),
    ("pool_requests", "worker_id"),
    ("income_records", "worker_id"),
    ("filings", "worker_id"),
    ("support_tickets", "worker_id"),
    ("peer_requests", "requester_id"),
    ("peer_requests", "helper_id"),
    ("help_events", "helper_id"),
    ("help_events", "receiver_id"),
):
    for d in db.collection(coll).stream():
        if d.to_dict().get(field) in del_ids:
            related.append((coll, d))

print("Workers to delete:")
for d in del_workers:
    x = d.to_dict()
    print("  ", d.id, "|", x.get("name"), "|", x.get("phone"))
print(f"Registration requests to delete: {len(del_requests)}")
print(f"Failed attempts / blocks to delete: {len(del_attempts)}")
print(f"Related records to delete: {len(related)}")
print("Keeping workers:", sorted(KEEP_WORKERS))

if not APPLY:
    print("\nDRY RUN. Nothing deleted. Run again with --yes to delete.")
    sys.exit(0)

for d in del_workers:
    db.recursive_delete(d.reference)  # also removes the trust_events subcollection
for d in del_requests:
    d.reference.delete()
for d in del_attempts:
    d.reference.delete()
seen = set()
for coll, d in related:
    if (coll, d.id) not in seen:
        d.reference.delete()
        seen.add((coll, d.id))
print("\nDeleted. Done.")
