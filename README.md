# Telegram Niche Poster — Vercel edition

This version is designed for manual START/STOP use. It does **not** run a 24/7 background worker. The browser dashboard starts one serverless request at a time and waits 3 minutes before the next request.

## Deploy
1. Upload this folder to GitHub.
2. Import the GitHub repo into Vercel.
3. Add Environment Variables:
   - `BOT_TOKEN` — your Telegram BotFather token (used for posting).
   - `TG_API_ID`, `TG_API_HASH` — from https://my.telegram.org (used for search).
   - `TG_SESSION` — a session string for a real Telegram user account, generated once locally with `login.js` (see below). Required for the group search feature only.
4. Deploy.
5. Open the deployed URL.
6. Click **Check Bot**.
7. Use **Group Search** to discover public groups/channels by keyword (up to 15 results shown), select the ones you want, and click **Add Selected as Targets**.
8. For each target you actually want to post to, make sure the bot is added to that group/channel with permission to send messages (search only finds the group — it does not grant posting rights).
9. Set your niche keywords and post text.
10. Click **START**. A visible countdown shows time until the next post. The run automatically stops after 15 posts, or click **STOP** any time.

## Generating TG_SESSION (one-time, local only)
Run this on your own computer or phone (Termux), never on Vercel:
```bash
npm install telegram input
TG_API_ID=xxxxx TG_API_HASH=xxxxxxxxxxxx node login.js
```
Follow the phone number / OTP prompts. Copy the printed session string into Vercel's `TG_SESSION` environment variable. Never share this string — it grants full access to that Telegram account.

## Important — read before use
- The Bot API cannot post to a group/channel unless the bot has been added there with permission to send messages. Group Search only finds and lists public groups; it does **not** join them or grant posting rights automatically.
- This tool must only be used to post to groups/channels you manage or where you have obtained the admins' permission to post. Do not use it to message individual members of groups directly, or to contact people who did not request contact from you — this violates Telegram's Terms of Service and can get your account/bot banned or reported as spam.
- The 3-minute cycle and countdown run while the dashboard page remains open. Closing/suspending the browser stops future cycles.
