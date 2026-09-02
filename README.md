# Telegram Niche Poster — Fresh Setup (A to Z)

This is a clean rebuild. Follow every step in order — do not skip the diagnostics step, it tells you exactly what's missing before you waste time debugging.

## Part 1 — Create a new Bot (if you don't already have one)
1. Open Telegram, search for **@BotFather**.
2. Send `/newbot`, follow the prompts (choose a name and a username ending in "bot").
3. BotFather gives you a token like `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`. Save it — this is `BOT_TOKEN`.
4. Get your own numeric Telegram user ID (for `ADMIN_USER_ID`): message **@userinfobot** on Telegram, it replies with your ID instantly.

## Part 2 — Get API_ID and API_HASH (for group search)
1. Go to https://my.telegram.org on any browser, log in with your phone number.
2. Go to **API Development Tools**.
3. Create an app (any name/platform is fine). You'll get:
   - `api_id` (a number) → this is `TG_API_ID`
   - `api_hash` (a long string) → this is `TG_API_HASH`

## Part 3 — Generate TG_SESSION (one-time, local only — never on Vercel)
This step logs a real Telegram account (yours) into a script so it can search public groups.

On your phone (Termux) or computer:
```bash
mkdir tgbot && cd tgbot
npm init -y
npm install telegram input
```
Copy `login.js` (included in this project) into that folder, then run:
```bash
TG_API_ID=your_api_id TG_API_HASH=your_api_hash node login.js
```
- Enter your phone number (+countrycode...)
- Enter the OTP code Telegram sends you (digits only — do not paste anything with letters)
- If 2FA password is set, enter it, otherwise press Enter

At the end it prints a long session string. Copy it — this is `TG_SESSION`. Never share it.

## Part 4 — Deploy to Vercel
1. Upload this whole folder to a GitHub repository.
2. Go to vercel.com → New Project → import that GitHub repo.
3. Before or after the first deploy, go to **Settings → Environment Variables** and add all five, each with **Production** checked:
   - `BOT_TOKEN`
   - `ADMIN_USER_ID`
   - `TG_API_ID`
   - `TG_API_HASH`
   - `TG_SESSION`
4. Deploy (or Redeploy if you added variables after the first deploy — env variable changes require a redeploy to take effect).

## Part 5 — Verify everything before using it
1. Open the deployed URL. At the very top, a row of colored pills shows each environment variable's status (green = OK, red = MISSING). **All five should be green** before continuing.
   - If any are red: go back to Vercel → Settings → Environment Variables, check spelling of the variable name exactly (case-sensitive), confirm it's attached to Production, then Redeploy.
2. Click **Check Bot** — should show "Connected: @yourbotname".
3. Click **Test MTProto Session** — should show "OK — logged in as ...".
4. Only once both of the above pass, use Group Search or START.

## How the app works (updated flow)
1. **Group Search**: type ANY single keyword/niche (e.g. "trading"), click "Start Searching". You don't need to type every related word yourself — the app automatically cycles through a built-in pool of related finance/trading terms too (forex, signals, mt5, crypto, gold, xauusd, pips, scalping, etc.), searching one term every few seconds and merging new unique groups into the list, until you click "Stop". Broadcast channels are excluded — only groups with "members" show up. If zero groups are found, the status line will show the underlying error/reason from Telegram's API for that pass.
2. **Results persist**: results from every term (and every search session) accumulate in one list — nothing is cleared automatically. Use "Select All" / "Deselect All" or "Clear All Results" to manage the list yourself.
3. **Join Selected**: tick the groups you want, click "Join Selected & Add as Targets" — joins them one at a time (1.5s gap) using your own account (TG_SESSION), and adds each to Targets.
4. **Compose**: write your post text and optionally attach an image (sent as a photo with caption).
5. **Post to Targets**: "Post Now to All Targets" sends once immediately. "Start Auto-Posting" repeats automatically, one target every 3 minutes, up to 15 per run, with a visible countdown.
6. **History**: every join and post attempt (success or failure) is recorded with a timestamp. Click "Clear History" to wipe it whenever you like.

## Important notes
- Image size: Telegram photos should stay under a few MB; very large images may fail or time out.
- The Bot API can only post in a group if the bot has separately been added there with permission to send messages. Joining with your user account does not grant the bot posting rights — some groups also require admin approval for bots.
- Auto-join and continuous search use your own Telegram account. Avoid leaving "Start Searching" running for very long stretches or joining large numbers of groups quickly — Telegram's spam/flood protections can temporarily restrict the account.
- Use this only for groups you manage or have permission to post in. Do not use it to message individual members directly or contact people who haven't asked to be contacted.
- The search loop, countdown, and auto-posting cycle only run while the browser tab stays open.
