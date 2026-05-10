import base64
import hashlib
import hmac
import json
import os
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel


def load_local_env() -> None:
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        current_value = os.environ.get(key, "")
        if key and not current_value.strip():
            os.environ[key] = value


load_local_env()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME", "")
APP_NAME = os.getenv("APP_NAME", "Signal Control")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
REGISTRATION_URL = os.getenv("REGISTRATION_URL", "")
FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"

app = FastAPI(title="Telegram Mini App API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def disable_frontend_cache(request: Request, call_next):
    response = await call_next(request)

    if request.method == "GET" and not request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    return response


class InitDataPayload(BaseModel):
    init_data: str


def parse_init_data(init_data: str) -> dict[str, Any]:
    parsed: dict[str, Any] = {}
    for key, value in parse_qsl(init_data, keep_blank_values=True):
        if key in {"user", "receiver", "chat"}:
            try:
                parsed[key] = json.loads(value)
            except json.JSONDecodeError:
                parsed[key] = value
        elif key == "signature":
            try:
                parsed[key] = base64.urlsafe_b64decode(value + "=" * (-len(value) % 4)).decode("utf-8")
            except Exception:
                parsed[key] = value
        else:
            parsed[key] = value
    return parsed


def build_data_check_string(init_data: str) -> tuple[str, str | None]:
    pairs = parse_qsl(init_data, keep_blank_values=True)
    received_hash = None
    lines: list[str] = []

    for key, value in pairs:
        if key == "hash":
            received_hash = value
            continue
        lines.append(f"{key}={value}")

    lines.sort()
    return "\n".join(lines), received_hash


def validate_telegram_init_data(init_data: str, bot_token: str) -> bool:
    if not init_data or not bot_token:
        return False

    data_check_string, received_hash = build_data_check_string(init_data)
    if not received_hash:
        return False

    secret_key = hmac.new(
        b"WebAppData",
        bot_token.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(calculated_hash, received_hash)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/config")
def config() -> dict[str, Any]:
    return {
        "appName": APP_NAME,
        "hasBotToken": bool(BOT_TOKEN),
        "frontendOrigin": FRONTEND_ORIGIN,
        "registrationUrl": REGISTRATION_URL,
    }


@app.post("/api/telegram/validate")
def validate(payload: InitDataPayload) -> dict[str, Any]:
    parsed = parse_init_data(payload.init_data)
    is_valid = validate_telegram_init_data(payload.init_data, BOT_TOKEN)

    return {
        "valid": is_valid,
        "parsed": parsed,
    }


def serve_frontend_file(file_path: Path) -> FileResponse:
    if not FRONTEND_DIST.exists():
        raise HTTPException(status_code=404, detail="Frontend build is missing.")

    if file_path.is_file():
        return FileResponse(file_path)

    index_path = FRONTEND_DIST / "index.html"
    if not index_path.is_file():
        raise HTTPException(status_code=404, detail="Frontend entry file is missing.")

    return FileResponse(index_path)


@app.get("/")
def frontend_index() -> FileResponse:
    return serve_frontend_file(FRONTEND_DIST / "index.html")


@app.get("/{full_path:path}")
def frontend_catchall(full_path: str) -> FileResponse:
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")

    return serve_frontend_file(FRONTEND_DIST / full_path)
