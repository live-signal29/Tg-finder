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

// Only real GROUPS (people with "members") — never broadcast channels ("subscribers").
function isRealGroup(c) {
  if (!c) return false;
  const cls = c.className || "";
  if (cls === "Chat") {
    if (c.deactivated) return false;
    return true;
  }
  if (cls === "Channel") {
    if (c.broadcast) return false;
    if (!c.megagroup) return false;
    if (c.left === true && c.username == null) return false;
    return true;
  }
  return false;
}

function toGroupObj(c) {
  return {
    id: c.id?.toString?.() || "",
    title: c.title || "",
    username: c.username ? `@${c.username}` : null,
    membersCount: c.participantsCount ?? null,
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

  // Source 1: contacts.search (title/username matches) — single call, higher limit.
  try {
    const r1 = await client.invoke(new Api.contacts.Search({ q: query, limit: 40 }));
    (r1.chats || []).filter(isRealGroup).forEach((c) => collected.set(c.id.toString(), c));
  } catch (e) {
    // ignore
  }

  // Source 2: messages.searchGlobal — paginate a few pages to try to reach 15+ groups.
  let offsetRate = 0;
  let offsetPeer = new Api.InputPeerEmpty();
  let offsetId = 0;
  const MAX_PAGES = 6;

  for (let page = 0; page < MAX_PAGES; page++) {
    if (collected.size >= 15) break;
    let r2;
    try {
      r2 = await client.invoke(
        new Api.messages.SearchGlobal({
          q: query,
          filter: new Api.InputMessagesFilterEmpty(),
          minDate: 0,
          maxDate: 0,
          offsetRate,
          offsetPeer,
          offsetId,
          limit: 40,
        })
      );
    } catch (e) {
      break; // stop paginating on any error, keep whatever we have
    }

    const before = collected.size;
    (r2.chats || []).filter(isRealGroup).forEach((c) => collected.set(c.id.toString(), c));

    const msgs = r2.messages || [];
    if (!msgs.length) break; // no more results

    const last = msgs[msgs.length - 1];
    offsetId = last.id || 0;
    offsetRate = r2.nextRate ?? last.date ?? offsetRate;
    try {
      offsetPeer = await client.getInputEntity(last.peerId);
    } catch (e) {
      break; // can't paginate further without a valid peer
    }

    if (collected.size === before) break; // this page added nothing new, stop
  }

  if (collected.size === 0) {
    return res.status(200).json({
      ok: true,
      count: 0,
      groups: [],
      note: "Koi public GROUP nahi mila is keyword ke liye (channels exclude kiye gaye hain). Doosra keyword try karein.",
    });
  }

  const groups = Array.from(collected.values())
    .sort((a, b) => (b.participantsCount || 0) - (a.participantsCount || 0))
    .slice(0, 40)
    .map(toGroupObj);

  return res.status(200).json({ ok: true, count: groups.length, groups });
}
