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

## How the app works
- **START**: asks what kind of public groups to find (e.g. "trading learning, signal"), searches Telegram, shows results, auto-joins the public ones using your account (TG_SESSION), adds them as posting targets, then posts to each target once every 3 minutes with a visible countdown. Stops automatically after 15 posts, or click STOP any time.
- **Group Search** (manual): search and review groups without starting the posting cycle. Select specific ones and click "Add Selected as Targets".
- **Manually Approve a Target**: directly add a chat ID/@username you already know the bot can post to.

## Important — read before use
- Auto-join uses your own Telegram account to join public groups, exactly as if you tapped "Join" yourself. Joining many groups quickly can trigger Telegram's spam/flood protections — the tool waits 1.5s between joins, but avoid running many searches back-to-back in a short time.
- The Bot API can only post in a group/channel if the bot has separately been added there with permission to send messages. Auto-join only makes your user account a member — it does not grant the bot posting rights, and some groups require admin approval for bots.
- Use this only for groups/channels you manage or have admin permission to post in. Do not use it to message individual members directly or contact people who haven't asked to be contacted — that violates Telegram's Terms of Service and risks your account/bot being banned.
- The 3-minute posting cycle and countdown run only while the browser tab stays open; closing it stops future posts until you reopen and press START again.
