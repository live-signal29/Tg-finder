import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Api } from "telegram";

export default async function handler(req, res) {
  const apiId = Number(process.env.TG_API_ID);
  const apiHash = process.env.TG_API_HASH;
  const sessionStr = process.env.TG_SESSION;

  if (!apiId || !apiHash || !sessionStr) {
    return res.status(200).json({
      ok: false,
      error: "TG_API_ID, TG_API_HASH ya TG_SESSION Vercel env mein missing hai.",
      missing: {
        TG_API_ID: !apiId,
        TG_API_HASH: !apiHash,
        TG_SESSION: !sessionStr,
      },
    });
  }

  let client;
  try {
    client = new TelegramClient(new StringSession(sessionStr), apiId, apiHash, {
      connectionRetries: 2,
    });
    await client.connect();
    const me = await client.invoke(new Api.users.GetFullUser({ id: new Api.InputUserSelf() }));
    const user = me.users?.[0] || {};
    await client.disconnect();
    return res.status(200).json({
      ok: true,
      loggedInAs: {
        id: user.id?.toString?.(),
        firstName: user.firstName,
        username: user.username,
      },
    });
  } catch (e) {
    try {
      if (client) await client.disconnect();
    } catch (_) {}
    return res.status(200).json({ ok: false, error: e?.message || String(e) });
  }
}
