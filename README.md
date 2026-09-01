# Telegram Niche Poster — Vercel edition

This version is designed for manual START/STOP use. It does **not** run a 24/7 background worker. The browser dashboard starts one serverless request at a time and waits 3 minutes before the next request.

## Deploy
1. Upload this folder to GitHub.
2. Import the GitHub repo into Vercel.
3. Add Environment Variable `BOT_TOKEN` with your Telegram BotFather token.
4. Deploy.
5. Open the deployed URL.
6. Click **Check Bot**.
7. Add only groups/channels where the bot is allowed to post.
8. Set your niche keywords and post text.
9. Click **START**. Click **STOP** whenever you want.

## Important
The Telegram Bot API cannot search the entire public Telegram ecosystem or autonomously join arbitrary public groups. Targets must be added/approved by you and the bot must have permission to post there.

The 3-minute cycle runs while the dashboard page remains open. Closing/suspending the browser stops future cycles.
