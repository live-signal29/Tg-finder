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
7. Click **START**. A prompt will ask which kind of public groups to find (e.g. "trading learning, signal"). It searches Telegram, shows the results in the Group Search list, automatically joins the public ones (via your MTProto user account), adds them as posting targets, then begins the posting cycle. A visible countdown shows time until the next post, and the run automatically stops after 15 posts (or click **STOP** any time).
8. You can also use **Group Search** manually at any time: type a keyword, click Search, select groups, and click "Add Selected as Targets" without starting the posting cycle.
9. For a bot to actually post in a joined group, the bot must additionally be added there with permission to send messages — joining with the user account does not grant the bot posting rights automatically. Group admins may also need to approve the bot depending on the group's settings.

## Generating TG_SESSION (one-time, local only)
Run this on your own computer or phone (Termux), never on Vercel:
```bash
npm install telegram input
TG_API_ID=xxxxx TG_API_HASH=xxxxxxxxxxxx node login.js
```
Follow the phone number / OTP prompts. Copy the printed session string into Vercel's `TG_SESSION` environment variable. Never share this string — it grants full access to that Telegram account.

## Important — read before use
- Auto-join uses your own Telegram account (the one linked via TG_SESSION) to join public groups, exactly as if you tapped "Join" yourself. Joining many groups quickly can trigger Telegram's spam/flood protections on that account — the tool waits between joins, but keep searches to a reasonable number of groups per session (avoid running back-to-back searches repeatedly in a short time).
- The Bot API cannot post to a group/channel unless the bot has been added there with permission to send messages. Auto-join only makes your user account a member — it does not grant the bot posting rights, and some groups require admin approval for bots.
- This tool must only be used to post to groups/channels you manage or where you have obtained the admins' permission to post. Do not use it to message individual members of groups directly, or to contact people who did not request contact from you — this violates Telegram's Terms of Service and can get your account/bot banned or reported as spam.
- The 3-minute cycle and countdown run while the dashboard page remains open. Closing/suspending the browser stops future cycles.
