export default async function handler(req, res) {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    return res.status(200).json({ ok: false, error: "BOT_TOKEN env variable missing hai." });
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const d = await r.json();
    if (!d.ok) {
      return res.status(200).json({ ok: false, error: d.description || "Bot token invalid." });
    }
    return res.status(200).json({ ok: true, bot: d.result });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e?.message || String(e) });
  }
}
