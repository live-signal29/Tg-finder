export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'POST only' });
  const token = process.env.BOT_TOKEN;
  if (!token || token === 'YOUR_BOT_TOKEN_HERE') return res.status(500).json({ ok:false, error:'BOT_TOKEN is not configured in Vercel Environment Variables.' });
  try {
    const body = req.body || {};
    const chatId = String(body.chatId || '').trim();
    const text = String(body.text || '').trim();
    if (!chatId || !text) return res.status(400).json({ ok:false, error:'chatId and text are required.' });
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview:false })
    });
    const data = await r.json();
    if (!data.ok) return res.status(400).json({ ok:false, error:data.description || 'Telegram rejected the message.' });
    return res.status(200).json({ ok:true, message_id:data.result?.message_id, chat:data.result?.chat });
  } catch (e) { return res.status(500).json({ ok:false, error:e?.message || String(e) }); }
}
