export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok:false, error:'GET only' });
  const token = process.env.BOT_TOKEN;
  if (!token || token === 'YOUR_BOT_TOKEN_HERE') return res.status(500).json({ ok:false, error:'BOT_TOKEN is not configured.' });
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await r.json();
    return res.status(data.ok ? 200 : 400).json(data.ok ? {ok:true, bot:data.result} : {ok:false,error:data.description});
  } catch (e) { return res.status(500).json({ok:false,error:e?.message || String(e)}); }
}
