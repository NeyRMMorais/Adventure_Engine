# Adventure Engine

Adventure Engine is an AI-powered choose-your-own-adventure web app. It uses a React frontend, a Node/Express server, and Gemini models to generate story scenes and scene artwork.

The live app is deployed through Google AI Studio / Cloud Run. GitHub is the source of truth for code and backlog.

## What It Does

- Protects the app behind a PIN login.
- Generates interactive adventure scenes with Gemini.
- Generates scene images, with SVG fallback behavior when image generation is unavailable.
- Tracks inventory, quest status, health, choices, and scene history in the browser.
- Supports English and Brazilian Portuguese story output.

## Architecture

```text
Browser React app
  -> Node/Express server
  -> Gemini API
  -> Cloud Run hosting
```

The browser renders the game UI and sends player choices to the server. The server keeps the Gemini API key private, validates incoming requests, calls Gemini, and returns the next scene.

## Local Setup

Prerequisite: Node.js.

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create a local environment file from `.env.example`.

3. Configure the required values:

   ```env
   GEMINI_API_KEY="your Gemini API key"
   APP_PIN="17081986"
   AUTH_SECRET="use a long random value"
   APP_URL="http://localhost:3000"
   ```

4. Start the local app:

   ```powershell
   npm run dev
   ```

The app runs on `http://localhost:3000` by default.

## Commands

```powershell
npm run dev
npm run lint
npm run build
npm start
```

- `npm run dev`: starts the local development server.
- `npm run lint`: runs TypeScript typechecking.
- `npm run build`: builds the frontend and server bundle.
- `npm start`: starts the built production server from `dist/server.cjs`.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Server-side key for Gemini text and image generation. |
| `APP_PIN` | Yes | PIN used to unlock the app UI and protected APIs. |
| `AUTH_SECRET` | Yes | Secret used to sign the HttpOnly auth cookie. Use a long random value in production. |
| `APP_URL` | No | Hosted app URL. AI Studio may provide this automatically. |

## Security Notes

- The Gemini API key stays on the server and is not exposed to the browser.
- The app uses a PIN gate backed by a signed HttpOnly cookie.
- Adventure APIs require authentication.
- Server-side request validation bounds user-controlled config, state, history, inventory, and image prompts.
- Basic rate limits protect login, adventure, and image routes.
- Security headers are set by the Express server.

## Deployment

The deployment flow is:

```text
local code -> GitHub main -> AI Studio / Cloud Run publish
```

Before publishing, confirm GitHub Actions CI is passing on `main`.

Production secrets must be configured in AI Studio or Cloud Run:

```env
GEMINI_API_KEY="your Gemini API key"
APP_PIN="17081986"
AUTH_SECRET="use a long random value"
```

Deployment is intentional: pushing to GitHub saves the source code, but the live Cloud Run service only changes after AI Studio / Cloud Run publishes a new revision.

For cost control, keep Cloud Run minimum instances at `0` when always-on capacity is not needed.

## Live Smoke Test

After deployment:

1. Open the live app URL.
2. Confirm the PIN screen appears.
3. Confirm an incorrect PIN is rejected.
4. Log in with the configured PIN.
5. Start an adventure.
6. Select a next choice.
7. Confirm image generation or fallback behavior works.
8. Use logout/lock and confirm the app returns to the PIN screen.

## Project Backlog

Backlog is managed in GitHub Issues:

<https://github.com/NeyRMMorais/Adventure_Engine/issues>
