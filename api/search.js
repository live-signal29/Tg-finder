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
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "GET only" });
  }

  const query = String(req.query.q || "").trim();
  if (!query) {
    return res.status(400).json({ ok: false, error: "Query parameter q is required." });
  }

  try {
    const client = await getClient();

    // contacts.search: global search across Telegram for chats/users/channels matching the query.
    const result = await client.invoke(
      new Api.contacts.Search({
        q: query,
        limit: 20,
      })
    );

    const chats = (result.chats || []).filter(
      (c) => c.className === "Chat" || c.className === "Channel"
    );

    const groups = chats.slice(0, 15).map((c) => ({
      id: c.id?.toString?.() || "",
      title: c.title || "",
      username: c.username ? `@${c.username}` : null,
      membersCount: c.participantsCount ?? null,
      isChannel: c.className === "Channel",
      isBroadcast: !!c.broadcast, // true = channel (posts), false with Channel class = supergroup
      isMegagroup: !!c.megagroup,
      link: c.username ? `https://t.me/${c.username}` : null,
    }));

    return res.status(200).json({ ok: true, count: groups.length, groups });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
