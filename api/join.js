import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Api } from "telegram";

let cachedClient = null;

async function getClient() {
  if (cachedClient && cachedClient.connected) return cachedClient;

  const apiId = Number(process.env.TG_API_ID);
  const apiHash = process.env.TG_API_HASH;
  const sessionStr = process.env.TG_SESSION;

  if (!apiId || !apiHash || !sessionStr) {
    throw new Error(
      "TG_API_ID, TG_API_HASH aur TG_SESSION Vercel environment variables mein set karein."
    );
  }

  const client = new TelegramClient(new StringSession(sessionStr), apiId, apiHash, {
    connectionRetries: 3,
  });
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST only" });
  }

  const { username } = req.body || {};
  if (!username) {
    return res.status(400).json({ ok: false, error: "username is required" });
  }

  const clean = String(username).replace(/^@/, "");

  try {
    const client = await getClient();
    await client.invoke(
      new Api.channels.JoinChannel({
        channel: clean,
      })
    );
    return res.status(200).json({ ok: true, joined: clean });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
