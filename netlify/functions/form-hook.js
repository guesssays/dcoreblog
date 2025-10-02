// netlify/functions/form-hook.js
export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }
    const data = JSON.parse(event.body || "{}");

    const {
      name, phone, messenger, email, company, topic,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      page_url, source, message
    } = data;

    const lines = [
      "🆕 <b>Новая форма на Decor Blog</b>",
      name ? `👤 <b>Имя:</b> ${name}` : null,
      phone ? `📞 <b>Телефон:</b> ${phone}` : null,
      email ? `✉️ <b>Email:</b> ${email}` : null,
      company ? `🏢 <b>Компания:</b> ${company}` : null,
      messenger ? `💬 <b>Мессенджер:</b> ${messenger}` : null,
      topic ? `📝 <b>Тема:</b> ${topic}` : null,
      message ? `📄 <b>Сообщение:</b> ${message}` : null,
      source ? `🔗 <b>Источник:</b> ${source}` : null,
      page_url ? `🌐 <b>Страница:</b> ${page_url}` : null,
      (utm_source || utm_medium || utm_campaign || utm_term || utm_content) ? "— — — — — — —" : null,
      utm_source ? `utm_source: ${utm_source}` : null,
      utm_medium ? `utm_medium: ${utm_medium}` : null,
      utm_campaign ? `utm_campaign: ${utm_campaign}` : null,
      utm_content ? `utm_content: ${utm_content}` : null,
      utm_term ? `utm_term: ${utm_term}` : null
    ].filter(Boolean).join("%0A");

    const BOT  = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT = process.env.TELEGRAM_CHAT_ID;
    if (!BOT || !CHAT) {
      return { statusCode: 500, body: "Missing Telegram env vars" };
    }

    const url = `https://api.telegram.org/bot${BOT}/sendMessage?chat_id=${CHAT}&parse_mode=HTML&text=${lines}`;
    await fetch(url);

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}
