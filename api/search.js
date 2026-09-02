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

function isGroupLike(c) {
  if (!c) return false;
  const cls = c.className || "";
  if (cls !== "Chat" && cls !== "Channel") return false;
  if (c.deactivated) return false;
  if (c.left === true && c.username == null) return false;
  return true;
}

function toGroupObj(c) {
  return {
    id: c.id?.toString?.() || "",
    title: c.title || "",
    username: c.username ? `@${c.username}` : null,
    membersCount: c.participantsCount ?? null,
    isChannel: c.className === "Channel",
    isBroadcast: !!c.broadcast,
    isMegagroup: !!c.megagroup,
    link: c.username ? `https://t.me/${c.username}` : null,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "GET only" });
  }

  const query = String(req.query.q || "").trim();
  if (!query) {
    return res.status(400).json({ ok: false, error: "Query parameter q is required." });
  }

  let client;
  try {
    client = await getClient();
  } catch (e) {
    return res.status(200).json({ ok: false, error: e?.message || String(e) });
  }

  const collected = new Map();

  try {
    const r1 = await client.invoke(new Api.contacts.Search({ q: query, limit: 20 }));
    (r1.chats || []).filter(isGroupLike).forEach((c) => collected.set(c.id.toString(), c));
  } catch (e) {
    // ignore, try the other source
  }

  try {
    const r2 = await client.invoke(
      new Api.messages.SearchGlobal({
        q: query,
        filter: new Api.InputMessagesFilterEmpty(),
        minDate: 0,
        maxDate: 0,
        offsetRate: 0,
        offsetPeer: new Api.InputPeerEmpty(),
        offsetId: 0,
        limit: 30,
      })
    );
    (r2.chats || []).filter(isGroupLike).forEach((c) => collected.set(c.id.toString(), c));
  } catch (e) {
    // ignore
  }

  if (collected.size === 0) {
    return res.status(200).json({
      ok: true,
      count: 0,
      groups: [],
      note: "Koi public group nahi mila is keyword ke liye. Koi doosra ya zyada aam keyword try karein.",
    });
  }

  const groups = Array.from(collected.values())
    .sort((a, b) => (b.participantsCount || 0) - (a.participantsCount || 0))
    .slice(0, 15)
    .map(toGroupObj);

  return res.status(200).json({ ok: true, count: groups.length, groups });
}
