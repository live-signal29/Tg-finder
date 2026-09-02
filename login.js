// Run this ONCE on your own computer/phone (Termux), NOT on Vercel.
// It logs into Telegram as a real user account and prints a session
// string. Save that string as the TG_SESSION env variable in Vercel.
// Never share this string with anyone — it is equivalent to your
// Telegram login.

import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";

const apiId = Number(process.env.TG_API_ID || "REPLACE_WITH_YOUR_API_ID");
const apiHash = process.env.TG_API_HASH || "REPLACE_WITH_YOUR_API_HASH";

const stringSession = new StringSession("");

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Apna phone number (+92...) daalein: "),
    password: async () => await input.text("Agar 2FA password set hai to daalein (warna Enter): "),
    phoneCode: async () => await input.text("Telegram se aya hua code daalein: "),
    onError: (err) => console.log(err),
  });

  console.log("\nLogin ho gaya!\n");
  console.log("Ye session string ko copy karke Vercel env variable TG_SESSION mein daal dein:\n");
  console.log(client.session.save());
  console.log("\nIse kisi ke saath share mat karein.\n");

  await client.disconnect();
  process.exit(0);
})();
