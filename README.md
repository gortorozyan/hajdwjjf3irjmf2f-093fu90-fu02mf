# Telegram Mini App Starter

Minimal starter for a Telegram Mini App with:

- `backend/`: Python FastAPI API
- `frontend/`: React + Vite client

The bot token should stay in local environment files and never be committed.

## 1. Backend setup

Create `backend/.env` from `backend/.env.example` and put your bot token there.

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
APP_NAME=Signal Control
FRONTEND_ORIGIN=http://localhost:5173
MINI_APP_URL=https://your-public-mini-app-url.example.com
```

Create a virtual environment and install dependencies:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Run the Telegram bot in a second terminal:

```powershell
cd backend
.venv\Scripts\activate
python -m app.bot
```

## 2. Frontend setup

Create `frontend/.env.local` from `frontend/.env.example`.

```env
VITE_API_BASE_URL=http://localhost:8000
```

Install dependencies and start Vite:

```powershell
cd frontend
npm install
npm run dev
```

## 3. Connect the Mini App to Telegram

In BotFather:

1. Open `/mybots`
2. Choose your bot
3. Open `Bot Settings` -> `Menu Button`
4. Set the URL to your hosted frontend

For local development, expose the frontend with a public HTTPS URL using a tunnel such as `ngrok` or `cloudflared`, then use that HTTPS URL in BotFather.

If you set `MINI_APP_URL` in `backend/.env`, the included bot also responds to `/start` with an inline button that opens the Mini App.

## 4. What this starter includes

- Telegram WebApp SDK integration on the client
- Theme-aware UI shell
- Backend endpoint to validate Telegram `initData`
- Separate env config for backend and frontend

## 5. Main API routes

- `GET /api/health`
- `GET /api/config`
- `POST /api/telegram/validate`

## 6. Production notes

- Host the frontend on HTTPS
- Keep `TELEGRAM_BOT_TOKEN` only on the server
- Restrict `FRONTEND_ORIGIN` to your real frontend domain
- Use the validation endpoint before trusting Telegram user/session data
