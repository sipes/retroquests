// Stripe Checkout over plain HTTPS (no SDK needed in Workers).

function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

export async function createCheckout(env, { product, sku, user, successUrl, cancelUrl }) {
  const params = {
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: user.id,
    metadata: { user_id: user.id, sku },
    payment_intent_data: { metadata: { user_id: user.id, sku } },
    line_items: { 0: {
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: product.price_cents,
        product_data: { name: product.name, description: product.description, metadata: { sku } },
        tax_behavior: 'exclusive'
      }
    } },
    allow_promotion_codes: 'false',
    automatic_tax: { enabled: 'false' }
  };
  if (user.stripe_customer_id) params.customer = user.stripe_customer_id;
  else { params.customer_email = user.email; params.customer_creation = 'always'; }


  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: form(params)
  });
  const data = await res.json();
  if (!res.ok) {

    throw Object.assign(new Error('The payment page could not be opened. Please try again.'), { status: 502 });
  }
  return data;
}

// Verifies the Stripe-Signature header (HMAC-SHA256 of "timestamp.payload").
export async function verifyStripeSignature(payload, header, secret, toleranceSeconds = 300) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map(p => p.split('=')).filter(p => p.length === 2).map(([k, v]) => [k.trim(), v]));
  const t = Number(parts.t);
  const sigs = header.split(',').filter(p => p.startsWith('v1=')).map(p => p.slice(3));
  if (!t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - t) > toleranceSeconds) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`));
  const expected = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('');
  return sigs.some(s => timingSafeEqual(s, expected));
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
