import json
import os

from google import genai
from google.cloud import storage
from google.genai import types

MODEL = "gemini-2.5-flash"


_genai_client = None


def _client():
    global _genai_client
    if _genai_client is None:
        _genai_client = genai.Client(
            vertexai=True,
            project=os.getenv("GOOGLE_CLOUD_PROJECT"),
            location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
        )
    return _genai_client

def _sniff_mime(data: bytes, uri: str) -> str:
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    low = uri.lower()
    if low.endswith(".png"):
        return "image/png"
    if low.endswith(".webp"):
        return "image/webp"
    return "image/jpeg"


def _image_part(gcs_uri: str):
    """Downloads the photo from Cloud Storage and sends the real bytes to Gemini."""
    bucket_name, _, path = gcs_uri[len("gs://"):].partition("/")
    client = storage.Client(project=os.getenv("GOOGLE_CLOUD_PROJECT"))
    data = client.bucket(bucket_name).blob(path).download_as_bytes(timeout=60)
    return types.Part.from_bytes(data=data, mime_type=_sniff_mime(data, gcs_uri))


# ---------- DEMO MODE (mock://) ----------
def _demo_on() -> bool:
    return os.getenv("DEMO_MODE", "").lower() == "true"


def _mock_doc(uri: str) -> dict:
    parts = uri[len("mock://"):].split("/")
    if len(parts) < 4:
        return {"readable": False, "reason": "Bad mock URI."}
    _, name, number, expiry = parts[:4]
    return {
        "name": name,
        "doc_number": number,
        "dob": "1995-01-01",
        "expiry": None if expiry.lower() == "none" else expiry,
        "looks_edited": "edited" in uri.lower(),
        "readable": True,
    }


def read_document(gcs_uri: str, doc_type: str) -> dict:
    """Reads a document photo stored in Cloud Storage (gs://...).

    doc_type is one of: id, licence, rc.
    Returns name, document number, date of birth, expiry and whether it looks edited.
    """
    if gcs_uri.startswith("mock://"):
        if not _demo_on():
            return {"readable": False, "reason": "Mock documents are disabled."}
        return _mock_doc(gcs_uri)

    prompt = (
        f"This is a photo of an Indian {doc_type} document (for example an Aadhaar card, PAN, "
        "driving licence or vehicle RC). Extract the data and reply ONLY with JSON using keys: "
        "name, doc_number, dob, expiry, looks_edited (true or false), readable (true or false). "
        "An Aadhaar number may be masked, with the first digits shown as X or *. That is normal. "
        "Return only the digits and X characters you can actually see, exactly as printed. "
        "Never invent, guess or complete digits. If the last four digits are not clearly visible, "
        "return null for doc_number. For an rc document, name is the owner and doc_number "
        "is the vehicle registration number. Set looks_edited to true ONLY if you see clear signs of "
        "tampering such as mismatched fonts or pasted text. Use null for anything not visible. Do not guess."
    )
    try:
        resp = _client().models.generate_content(
            model=MODEL,
            contents=[_image_part(gcs_uri), prompt],
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        data = json.loads(resp.text)
        if isinstance(data, list) and data:
            data = data[0]
    except Exception as e:
        print(f"[read_document] FAILED for {gcs_uri}: {type(e).__name__}: {e}")
        return {"readable": False, "reason": "Could not read the document."}

    # If Gemini found a name and a number, the document is readable.
    if data.get("name") and data.get("doc_number"):
        data["readable"] = True
    return data


def match_face(id_photo_uri: str, selfie_uri: str) -> dict:
    """Compares the face on the ID with a live selfie, both in Cloud Storage."""
    if id_photo_uri.startswith("mock://") or selfie_uri.startswith("mock://"):
        if not _demo_on():
            return {"passed": False, "reason": "Mock photos are disabled."}
        try:
            id_name = id_photo_uri[len("mock://"):].split("/")[1].strip().lower()
            selfie_name = selfie_uri[len("mock://"):].split("/")[1].strip().lower()
        except IndexError:
            return {"passed": False, "reason": "Bad mock URI."}
        ok = id_name == selfie_name
        return {
            "passed": ok,
            "confidence": 96 if ok else 12,
            "reason": "Face matches the ID photo." if ok else "Selfie does not match the ID photo.",
        }

    prompt = (
        "Image 1 is a government ID photo. Image 2 is a live selfie. "
        "Decide if both show the same person. Reply ONLY with JSON: "
        "same_person (true or false), confidence (0-100), reason (one short sentence). "
        "Be strict: if unsure, say false."
    )
    try:
        resp = _client().models.generate_content(
            model=MODEL,
            contents=[_image_part(id_photo_uri), _image_part(selfie_uri), prompt],
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        data = json.loads(resp.text)
        if isinstance(data, list) and data:
            data = data[0]
    except Exception as e:
        print(f"[match_face] FAILED: {type(e).__name__}: {e}")
        return {"passed": False, "reason": "Could not compare faces."}
    passed = bool(data.get("same_person")) and int(data.get("confidence", 0)) >= 85
    return {
        "passed": passed,
        "confidence": data.get("confidence"),
        "reason": data.get("reason"),
    }