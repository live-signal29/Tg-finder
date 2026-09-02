export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST only" });
  }
  const token = process.env.BOT_TOKEN;
  if (!token) {
    return res.status(200).json({ ok: false, error: "BOT_TOKEN env variable missing hai." });
  }
  const { chatId, text } = req.body || {};
  if (!chatId || !text) {
    return res.status(400).json({ ok: false, error: "chatId and text are required." });
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const d = await r.json();
    if (!d.ok) {
      return res.status(200).json({ ok: false, error: d.description || "Send failed." });
    }
    return res.status(200).json({ ok: true, result: d.result });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e?.message || String(e) });
  }
}
