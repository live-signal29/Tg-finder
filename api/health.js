// Simple diagnostic endpoint: shows which environment variables are
// present (true/false only — never reveals actual values) so setup
// mistakes are easy to spot without exposing secrets.

export default async function handler(req, res) {
  const vars = {
    BOT_TOKEN: !!process.env.BOT_TOKEN,
    ADMIN_USER_ID: !!process.env.ADMIN_USER_ID,
    TG_API_ID: !!process.env.TG_API_ID,
    TG_API_HASH: !!process.env.TG_API_HASH,
    TG_SESSION: !!process.env.TG_SESSION,
  };
  const allBotVarsOk = vars.BOT_TOKEN;
  const allSearchVarsOk = vars.TG_API_ID && vars.TG_API_HASH && vars.TG_SESSION;

  return res.status(200).json({
    ok: true,
    vars,
    botReady: allBotVarsOk,
    searchReady: allSearchVarsOk,
    message: allSearchVarsOk
      ? "Sab search-related env variables set hain."
      : "Kuch env variables missing hain — 'vars' object mein 'false' wale check karein.",
  });
}
