import re
import sys

from google.cloud import firestore, storage

PHONE = next((a for a in sys.argv[1:] if a.isdigit()), "8792366344")
APPLY = "--yes" in sys.argv
BUCKET = "buildercup-docs-ob"

db = firestore.Client(project="buildercup")
digits = re.sub(r"\D", "", PHONE)[-10:]

workers = [d for d in db.collection("workers").where("phone", "==", digits).stream()]
wids = {d.id for d in workers}
reqs = [d for d in db.collection("company_verifications").where("phone", "==", digits).stream()]
attempts = [d for d in db.collection("registration_attempts").stream() if digits in d.id]

related = []
for coll, field in (
    ("claims", "worker_id"), ("pool_requests", "worker_id"), ("income_records", "worker_id"),
    ("filings", "worker_id"), ("support_tickets", "worker_id"),
    ("peer_requests", "requester_id"), ("peer_requests", "helper_id"),
    ("help_events", "helper_id"), ("help_events", "receiver_id"),
):
    for d in db.collection(coll).stream():
        if d.to_dict().get(field) in wids:
            related.append(d)

blobs = list(storage.Client(project="buildercup").list_blobs(BUCKET, prefix=f"uploads/{digits}/"))

print("Phone:", digits)
print("Workers:", [(d.id, d.to_dict().get("name")) for d in workers])
print("Registration requests:", [(d.id, d.to_dict().get("status")) for d in reqs])
print("Failed attempts / blocks:", len(attempts))
print("Related records (claims, requests...):", len(related))
print("Uploaded images:", len(blobs))
for b in blobs:
    print("   ", b.name)

if not APPLY:
    print("\nDRY RUN. Nothing deleted. Run again with --yes to delete.")
    sys.exit(0)

for d in workers:
    db.recursive_delete(d.reference)
for d in reqs + attempts:
    d.reference.delete()
done = set()
for d in related:
    if d.reference.path not in done:
        d.reference.delete()
        done.add(d.reference.path)
for b in blobs:
    b.delete()
print("\nDeleted. Done.")
