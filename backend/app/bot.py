import asyncio
import os
from pathlib import Path

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes


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
        if key and key not in os.environ:
            os.environ[key] = value


load_local_env()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
APP_NAME = os.getenv("APP_NAME", "Signal Control")
MINI_APP_URL = os.getenv("MINI_APP_URL", "")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_message:
        return

    if MINI_APP_URL:
        keyboard = InlineKeyboardMarkup(
            [
                [
                    InlineKeyboardButton(
                        text=f"Open {APP_NAME}",
                        web_app=WebAppInfo(url=MINI_APP_URL),
                    )
                ]
            ]
        )
        text = f"{APP_NAME} is ready.\nTap the button below to open the Mini App."
    else:
        keyboard = None
        text = (
            f"{APP_NAME} bot is running.\n"
            "Set MINI_APP_URL in backend/.env to send the Mini App button."
        )

    await update.effective_message.reply_text(
        text=text,
        reply_markup=keyboard,
    )


def build_application() -> Application:
    if not BOT_TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is missing in backend/.env")

    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    return application


async def main() -> None:
    application = build_application()
    await application.initialize()
    await application.start()
    await application.updater.start_polling(drop_pending_updates=True)
    try:
        await asyncio.Event().wait()
    finally:
        await application.updater.stop()
        await application.stop()
        await application.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
