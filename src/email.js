// Emails sent through the Mailtrap API.
// MAILTRAP_INBOX_ID set  -> goes to your Mailtrap test inbox (nobody real receives it).
// MAILTRAP_INBOX_ID unset -> real delivery; needs a sending domain verified in Mailtrap.
// No MAILTRAP_TOKEN       -> printed to the log only (local testing).

export async function sendEmail(env, { to, toName, subject, text, html, category }) {
  const payload = {
    from: { email: env.MAIL_FROM_EMAIL, name: env.MAIL_FROM_NAME || env.SITE_NAME },
    to: [{ email: to, name: toName || undefined }],
    subject, text, html, category
  };
  if (!env.MAILTRAP_TOKEN) {
    console.log(`[email:${category}] to=${to} subject="${subject}"\n${text}`);
    return { logged: true };
  }
  const endpoint = env.MAILTRAP_INBOX_ID
    ? `https://sandbox.api.mailtrap.io/api/send/${env.MAILTRAP_INBOX_ID}`
    : 'https://send.api.mailtrap.io/api/send';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.MAILTRAP_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Mailtrap ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json().catch(() => ({}));
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (cents, cur) => new Intl.NumberFormat('en-US', { style: 'currency', currency: String(cur || 'usd').toUpperCase() }).format(cents / 100);

function layout(env, heading, bodyHtml, button) {
  const site = esc(env.SITE_NAME || 'Retro Quest Arcade');
  const btn = button ? `<tr><td style="padding:8px 0 24px"><a href="${esc(button.href)}" style="display:inline-block;background:#ff55ff;color:#1a0020;font-weight:700;text-decoration:none;padding:12px 22px;border:2px solid #1a0020;font-family:Courier New,monospace;font-size:16px">${esc(button.label)}</a></td></tr>` : '';
  return `<!doctype html><html><body style="margin:0;background:#120f22;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border:4px double #aa0000;outline:3px solid #0000aa" cellspacing="0" cellpadding="0">
<tr><td style="background:#1c1735;padding:14px 20px;font-family:Courier New,monospace;font-weight:700;font-size:18px;color:#ff55ff;letter-spacing:1px">RETRO<span style="color:#55ffff">QUEST</span></td></tr>
<tr><td style="padding:22px 20px 0">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="font-family:Courier New,monospace;font-size:22px;font-weight:700;color:#000;padding-bottom:12px">${esc(heading)}</td></tr>
<tr><td style="font-size:15px;line-height:1.55;color:#222;padding-bottom:16px">${bodyHtml}</td></tr>
${btn}
</table></td></tr>
<tr><td style="padding:14px 20px;border-top:1px solid #ddd;font-size:12px;color:#666">${site} · You're receiving this because of activity on your account.</td></tr>
</table></td></tr></table></body></html>`;
}

export const emails = {
  welcome(env, user, link) {
    const site = env.SITE_NAME || 'Retro Quest Arcade';
    return {
      subject: `Welcome to ${site}`,
      text: `Hi ${user.name},\n\nYour free account is ready and scene 1 of every game is unlocked.\n\nConfirm your email and sign in on any device with this link (valid for 30 minutes):\n${link}\n\nSave often. This is that kind of game.\n\n${site}`,
      html: layout(env, `Welcome, ${user.name}`, `Your free account is ready and scene 1 of every game is unlocked.<br><br>Use the button to confirm your email. It also signs you in, so you can use it on your phone or another computer. The link works for 30 minutes.`, { href: link, label: 'Confirm and sign in' })
    };
  },
  login(env, user, link, minutes) {
    const site = env.SITE_NAME || 'Retro Quest Arcade';
    return {
      subject: `Your ${site} sign-in link`,
      text: `Hi ${user.name},\n\nUse this link to sign in (valid for ${minutes} minutes, works once):\n${link}\n\nIf you didn't ask for this, ignore this email. Your account is safe.\n\n${site}`,
      html: layout(env, 'Sign in', `Hi ${esc(user.name)}, tap the button to sign in. The link works once, for ${minutes} minutes.<br><br>If you didn't ask for this, ignore this email. Your account is safe.`, { href: link, label: 'Sign in' })
    };
  },
  receipt(env, user, product, amount, currency) {
    const site = env.SITE_NAME || 'Retro Quest Arcade';
    const price = money(amount, currency);
    return {
      subject: `Receipt: ${product.name}`,
      text: `Hi ${user.name},\n\nThanks for your purchase.\n\n${product.name}  ${price}\n\nIt's unlocked on your account now, on every device you sign in to. Stripe sends a separate payment receipt.\n\n${site}`,
      html: layout(env, 'Thanks for your purchase', `<table role="presentation" width="100%" style="border-collapse:collapse;font-size:15px"><tr><td style="padding:8px 0;border-bottom:1px solid #ddd">${esc(product.name)}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #ddd;font-weight:700">${esc(price)}</td></tr></table><br>It's unlocked on your account now, on every device you sign in to. Stripe sends a separate payment receipt.`)
    };
  }
};
