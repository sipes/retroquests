# Retro Quest Arcade: setup guide

This folder is the whole platform: the game, player accounts, Stripe payments, Mailtrap emails and an admin page. It runs on Cloudflare.

You'll do this once. It takes about an hour, most of it creating accounts. Every command below is typed into **PowerShell** inside this folder.

---

## 1. Install Node.js (5 minutes)

1. Go to **nodejs.org** and download the **LTS** version for Windows. Install it with the default options.
2. Unzip `retro-quest-platform.zip` somewhere easy, for example `Documents\retro-quest`.
3. Open that folder in File Explorer. Click the address bar, type `powershell` and press Enter. A blue window opens in the right folder.
4. Type this and press Enter:

```
npm install
```

## 2. Cloudflare: put the site online (15 minutes)

1. Log in to Cloudflare (a browser window opens; create a free account if you don't have one):

```
npx wrangler login
```

2. Create the database:

```
npx wrangler d1 create retro-quest-db
```

3. The command prints a `database_id` (a long code like `a1b2c3d4-...`). Open `wrangler.jsonc` in Notepad, replace `REPLACE_WITH_YOUR_DATABASE_ID` with it, and save.

4. Create the tables, then publish:

```
npm run db:migrate
npm run deploy
```

5. The deploy prints your web address, something like `https://retro-quest.yourname.workers.dev`. Open it. The game works, and sign-up works too, but emails and payments come next.

## 3. Mailtrap: emails (15 minutes)

The platform sends three emails: welcome (with a confirm link), sign-in links, and purchase receipts.

**For testing, send to your Mailtrap test inbox** (nobody real gets them):

1. In Mailtrap, go to **Email Testing → Inboxes** and open your inbox. The number at the end of the page address is the **inbox ID**.
2. Go to **Settings → API Tokens** and copy a token that has access to that inbox.
3. Save both as secrets (paste when asked):

```
npx wrangler secret put MAILTRAP_TOKEN
npx wrangler secret put MAILTRAP_INBOX_ID
```

**When you go live**, you need a domain (see step 6):

1. In Mailtrap, go to **Sending Domains**, add your domain and add the DNS records it shows (in Cloudflare if your domain is there).
2. Create an API token for **Email Sending** and save it: `npx wrangler secret put MAILTRAP_TOKEN`
3. Stop using the test inbox: `npx wrangler secret delete MAILTRAP_INBOX_ID`
4. In `wrangler.jsonc`, change `MAIL_FROM_EMAIL` to an address on your domain, for example `hello@yourdomain.com`. Then `npm run deploy`.

## 4. Stripe: payments (20 minutes)

Open your Stripe account under the Florida LLC. Stay in **Test mode** (toggle at the top) until everything works.

1. **Developers → API keys**: copy the **Secret key** (starts with `sk_test_`).

```
npx wrangler secret put STRIPE_SECRET_KEY
```

2. **Developers → Webhooks → Add endpoint**:
   - Endpoint URL: your web address + `/api/stripe/webhook`, for example `https://retro-quest.yourname.workers.dev/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`
   - After saving, reveal the **Signing secret** (starts with `whsec_`):

```
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

3. Test a purchase in the game with card number **4242 4242 4242 4242**, any future date, any 3 digits. You should land back in the game with it unlocked, and get a receipt in Mailtrap.

**Going live:** switch Stripe to live mode, repeat steps 1 and 2 with the live key and a live webhook, and save both secrets again.

**Sales tax / VAT:** Stripe doesn't collect tax unless you turn on Stripe Tax. If you enable it in the Stripe dashboard, set `STRIPE_AUTOMATIC_TAX` to `"1"` in `wrangler.jsonc` and deploy. Check your tax obligations with an accountant.

## 5. Admin page

`ADMIN_EMAILS` in `wrangler.jsonc` is set to `cp@strategico.co.za`. Sign up in the game with that email, then choose **Admin** from the menu under your name (or go to `/admin.html`).

The admin page shows players, sales and revenue. For any player you can give or remove a product, email them a sign-in link, sign them out everywhere, or reset their saved game. To add another admin, add their email, separated by a comma, and deploy.

## 6. Your own domain (when ready)

Buy a domain (Cloudflare → **Domain Registration** is simplest), then in Cloudflare go to **Workers & Pages → retro-quest → Settings → Domains & Routes → Add custom domain**. Use the new address in the Stripe webhook too.

---

## Everyday tasks

| To do this | Run |
| --- | --- |
| Publish changes | `npm run deploy` |
| Watch live errors and email/payment logs | `npm run logs` |
| Test on your own computer (fake payments, emails printed) | copy `.dev.vars.example` to `.dev.vars`, then `npm run dev` and open http://localhost:8787 |
| Change prices or product names | edit `src/catalog.js`, then deploy |

## How it works

- **Accounts:** no passwords. Sign-up starts playing straight away and emails a confirm link. On a new device, players ask for a sign-in link by email. Sessions last 180 days.
- **Saves:** stored on the server, so progress follows the player between phone and computer.
- **Payments:** Stripe Checkout. The product unlocks only when Stripe's signed webhook confirms payment. Refunds in Stripe remove the product automatically.
- **Hints:** the walkthrough text lives on the server and is sent only to players who bought it, one level at a time.
- **Privacy:** players can delete their account from the menu. Purchase records stay for accounting, without personal details.

## Known limits

- The paid scenes are inside the game file, so a technical player could unlock them by editing the code. The hints are protected. Serving paid scenes from the server is a later step.
- There's no bot protection on sign-up yet. Cloudflare Turnstile is the next thing to add if fake sign-ups appear.
