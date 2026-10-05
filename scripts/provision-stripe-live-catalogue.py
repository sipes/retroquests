#!/usr/bin/env python3
"""Approved Retro Quests catalogue only; never outputs credentials or Checkout URLs."""
import json
import os
import re
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path

ACCOUNT = 'acct_1Odv2HEKHBH8mBfW'
ROOT_ENV = Path('/opt/hermes-data/hermes/.env')

def main():
    key = None
    for line in ROOT_ENV.read_text().splitlines():
        match = re.match(r'^\s*(?:export\s+)?STRIPE_LIVE_SECRET_KEY\s*=\s*(.*?)\s*$', line)
        if match:
            key = match.group(1).strip('\"\'')
    if not key or not key.startswith('sk_live_'):
        raise RuntimeError('Approved live key missing or invalid')

    def api(path, data=None, idem=None):
        headers = {'Authorization': 'Bearer ' + key}
        if idem:
            headers['Idempotency-Key'] = idem
        body = None if data is None else urllib.parse.urlencode(data).encode()
        req = urllib.request.Request('https://api.stripe.com/v1/' + path, data=body, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=45) as res:
                return json.load(res)
        except urllib.error.HTTPError as exc:
            raise RuntimeError('Stripe request failed HTTP ' + str(exc.code)) from None

    def listing(kind, query=''):
        result = []
        cursor = ''
        while True:
            page = api(kind + '?limit=100' + query + cursor)
            result.extend(page['data'])
            if not page['has_more']:
                return result
            cursor = '&starting_after=' + page['data'][-1]['id']

    account = api('account')
    if account['id'] != ACCOUNT or not account['charges_enabled'] or not account['payouts_enabled']:
        raise RuntimeError('Merchant verification failed')
    products = listing('products')
    # Enumerate before mutating: do not touch other applications or ambiguous matches.
    plan = []
    for sku, title, amount in [('port-lucky', 'Port Lucky', 799), ('port-lucky-walkthrough', 'Port Lucky Walkthrough', 199)]:
        name = 'Retro Quests — ' + title
        matches = [p for p in products if p.get('name') == name or (p.get('metadata', {}).get('application') == 'retroquests' and p.get('metadata', {}).get('sku') == sku)]
        if len(matches) > 1:
            raise RuntimeError('Ambiguous existing Retro Quests product: ' + sku)
        p = matches[0] if matches else None
        if p and (not p.get('active') or p.get('metadata', {}).get('application') != 'retroquests' or p.get('metadata', {}).get('sku') != sku):
            raise RuntimeError('Existing catalogue requires review: ' + sku)
        prices = listing('prices', '&product=' + p['id']) if p else []
        exact = [q for q in prices if q.get('active') and q.get('currency') == 'usd' and q.get('unit_amount') == amount and q.get('type') == 'one_time' and q.get('billing_scheme') == 'per_unit' and q.get('tax_behavior') == 'exclusive' and q.get('livemode')]
        if len(exact) > 1:
            raise RuntimeError('Ambiguous existing price: ' + sku)
        plan.append((sku, name, amount, p, exact[0] if exact else None))
    evidence = {'account_id': ACCOUNT, 'livemode': True, 'charges_enabled': True, 'payouts_enabled': True, 'catalogue': []}
    for sku, name, amount, p, q in plan:
        if not p:
            p = api('products', {'name': name, 'active': 'true', 'metadata[application]': 'retroquests', 'metadata[sku]': sku}, 'retroquests-live-product-v1-' + sku)
        p = api('products/' + p['id'])
        if not p.get('livemode') or p.get('metadata', {}).get('sku') != sku or p.get('metadata', {}).get('application') != 'retroquests':
            raise RuntimeError('Product readback failed')
        if not q:
            q = api('prices', {'product': p['id'], 'currency': 'usd', 'unit_amount': amount, 'tax_behavior': 'exclusive', 'metadata[application]': 'retroquests', 'metadata[sku]': sku}, 'retroquests-live-price-v1-' + sku)
        q = api('prices/' + q['id'])
        if not (q.get('livemode') and q.get('active') and q.get('currency') == 'usd' and q.get('unit_amount') == amount and q.get('product') == p['id'] and q.get('type') == 'one_time'):
            raise RuntimeError('Price readback failed')
        evidence['catalogue'].append({'sku': sku, 'product_id': p['id'], 'price_id': q['id'], 'name': p['name'], 'currency': q['currency'], 'unit_amount': q['unit_amount'], 'type': q['type'], 'tax_behavior': q['tax_behavior'], 'livemode': q['livemode'], 'active': q['active']})
    output = Path('evidence/stripe-live/provider-catalogue-readback.json')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(evidence, indent=2) + '\n')
    print(json.dumps(evidence, indent=2))

if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        # Never show request objects, provider bodies or environment values.
        print('FAILED:', type(exc).__name__, str(exc) if isinstance(exc, RuntimeError) else 'See secure operator context')
        raise SystemExit(1)
