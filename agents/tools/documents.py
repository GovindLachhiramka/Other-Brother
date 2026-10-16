from difflib import SequenceMatcher


def _norm(s: str) -> str:
    return " ".join((s or "").lower().replace(".", " ").split())


def _tok_eq(x: str, y: str) -> bool:
    """Tokens match if equal, or one is the initial of the other (R = Ravi)."""
    return x == y or (len(x) == 1 and y.startswith(x)) or (len(y) == 1 and x.startswith(y))


def _names_close(a: str, b: str) -> bool:
    a, b = _norm(a), _norm(b)
    if not a or not b:
        return False
    if SequenceMatcher(None, a, b).ratio() >= 0.85:
        return True
    short, long_ = sorted((a.split(), b.split()), key=len)
    if len(short) < 2:
        return False
    i = 0
    for token in long_:
        if i < len(short) and _tok_eq(short[i], token):
            i += 1
    return i == len(short)


def match_names(id_name: str, dl_name: str, upi_name: str, platform_name: str) -> dict:
    """Checks that names on ID, licence, UPI and platform profile belong to the same person.

    Returns pass/fail with a reason. Initials and small spelling differences are allowed.
    """
    names = {
        "licence": dl_name,
        "upi": upi_name,
        "platform": platform_name,
    }
    for label, value in names.items():
        if not _names_close(id_name, value):
            return {
                "passed": False,
                "reason": f"Name on {label} ('{value}') does not match ID ('{id_name}').",
            }
    return {"passed": True, "reason": "All names match."}