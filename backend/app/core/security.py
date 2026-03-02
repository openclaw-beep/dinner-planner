import html
import secrets
from collections.abc import Iterable


def generate_api_token() -> str:
    return secrets.token_urlsafe(32)


def mask_phone_number(phone_number: str) -> str:
    digits = "".join(ch for ch in phone_number if ch.isdigit())
    if len(digits) < 4:
        return "****"
    return f"***-***-{digits[-4:]}"


def sanitize_text(value: str, *, max_length: int) -> str:
    normalized = value.strip()
    if not normalized:
        return ""

    # Remove control characters except line breaks/tabs.
    filtered = "".join(ch for ch in normalized if ch >= " " or ch in {"\n", "\t"})
    escaped = html.escape(filtered, quote=False)
    return escaped[:max_length]


def compact_origins(origins: Iterable[str]) -> list[str]:
    return [origin for origin in {item.strip() for item in origins if item.strip()}]
