export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST only" });
  }
  const token = process.env.BOT_TOKEN;
  if (!token) {
    return res.status(200).json({ ok: false, error: "BOT_TOKEN env variable missing hai." });
  }
  const { chatId, text, imageBase64 } = req.body || {};
  if (!chatId || (!text && !imageBase64)) {
    return res.status(400).json({ ok: false, error: "chatId and text or imageBase64 are required." });
  }

  try {
    if (imageBase64) {
      // Send as photo with caption via multipart form-data
      const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
      const buffer = Buffer.from(base64Data, "base64");
      const form = new FormData();
      form.append("chat_id", chatId);
      if (text) form.append("caption", text);
      form.append("photo", new Blob([buffer]), "image.jpg");

      const r = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: "POST",
        body: form,
      });
      const d = await r.json();
      if (!d.ok) return res.status(200).json({ ok: false, error: d.description || "Send failed." });
      return res.status(200).json({ ok: true, result: d.result });
    } else {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      const d = await r.json();
      if (!d.ok) return res.status(200).json({ ok: false, error: d.description || "Send failed." });
      return res.status(200).json({ ok: true, result: d.result });
    }
  } catch (e) {
    return res.status(200).json({ ok: false, error: e?.message || String(e) });
  }
}
