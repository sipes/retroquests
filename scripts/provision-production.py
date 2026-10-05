#!/usr/bin/env python3
"""Scoped production provisioning. Secrets are read privately, never logged."""
import json, os, pathlib, urllib.request, urllib.parse, subprocess, sys, shlex
ROOT=pathlib.Path(__file__).resolve().parents[1]
ACCOUNT='ca4cf884ed842501d2454dfa44bdb78f'
ZONE='b6dcbf9888f0f8ac47bf997b7b147bc9'
PRIVATE=pathlib.Path('/opt/hermes-data/hermes/profiles/nicolaas/secrets/retroquests-production')
EVIDENCE=ROOT/'evidence/production-v5'
def dotenv(path):
 out={}
 for line in pathlib.Path(path).read_text().splitlines():
  if not line.strip() or line.lstrip().startswith('#') or '=' not in line: continue
  k,v=line.removeprefix('export ').split('=',1)
  try: out[k.strip()]=shlex.split(v)[0]
  except (ValueError,IndexError): pass
 return out
secrets=dotenv('/opt/hermes-data/hermes/.env')
token=secrets['CLOUDFLARE_RETROQUESTS_API_TOKEN']
def api(path,method='GET',data=None):
 req=urllib.request.Request('https://api.cloudflare.com/client/v4/'+path,data=json.dumps(data).encode() if data is not None else None,method=method,headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=60) as r: result=json.load(r)
 if not result.get('success'): raise RuntimeError('Cloudflare request failed')
 return result['result']
def record(name,data):
 EVIDENCE.mkdir(parents=True,exist_ok=True);(EVIDENCE/(name+'.json')).write_text(json.dumps(data,indent=2)+'\n')
def private(name,data):
 PRIVATE.mkdir(mode=0o700,parents=True,exist_ok=True)
 p=PRIVATE/name
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'w') as f: json.dump(data,f)
def provision():
 base='accounts/'+ACCOUNT
 dbs=api(base+'/d1/database');matches=[x for x in dbs if x['name']=='retroquests-production-db']
 db=matches[0] if matches else api(base+'/d1/database','POST',{'name':'retroquests-production-db'})
 db=api(base+'/d1/database/'+db['uuid']);record('d1-resource',db)
 widgets=api(base+'/challenges/widgets');matches=[x for x in widgets if x['name']=='Retro Quests Production']
 w=matches[0] if matches else api(base+'/challenges/widgets','POST',{'name':'Retro Quests Production','domains':['retroquests.app'],'mode':'managed'})
 w=api(base+'/challenges/widgets/'+w['sitekey'])
 p=PRIVATE/'turnstile.json'
 if not p.exists(): private('turnstile.json',{'TURNSTILE_SECRET':w['secret']})
 record('turnstile-resource',{k:v for k,v in w.items() if k!='secret'})
 config={'name':'retroquests-production','main':'src/index.js','compatibility_date':'2026-09-01','account_id':ACCOUNT,'workers_dev':False,'preview_urls':False,'assets':{'directory':'./public','binding':'ASSETS','run_worker_first':True,'not_found_handling':'none'},'routes':[{'pattern':'retroquests.app','custom_domain':True}],'d1_databases':[{'binding':'DB','database_name':'retroquests-production-db','database_id':db['uuid'],'migrations_dir':'migrations'}],'vars':{'SITE_NAME':'Retro Quests','MAIL_FROM_NAME':'Retro Quests','MAIL_FROM_EMAIL':'noreply@strategico.co.za','ADMIN_EMAILS':'cp@strategico.co.za','CURRENCY':'usd','STRIPE_AUTOMATIC_TAX':'0','DEV_MODE':'0','CONTENT_APPROVED':'1','PROVIDER_APPROVED':'1','RELEASE_APPROVED':'0','TURNSTILE_HOSTNAME':'retroquests.app','TURNSTILE_SITE_KEY':w['sitekey'],'STRIPE_PRICE_PORT_LUCKY':'price_1UNArtEKHBH8mBfWqkjQF8Fn','STRIPE_PRICE_PORT_LUCKY_WALKTHROUGH':'price_1UNArwEKHBH8mBfWmyqk0PE8'}}
 (ROOT/'wrangler.production.json').write_text(json.dumps(config,indent=2)+'\n')
 print('Dedicated D1 and Turnstile provisioned and GET-readback verified; production config prepared; sales disabled.')
def wrangler(args,input=None):
 env=os.environ.copy();env['CLOUDFLARE_API_TOKEN']=token;env['CLOUDFLARE_ACCOUNT_ID']=ACCOUNT
 r=subprocess.run([str(ROOT/'node_modules/.bin/wrangler'),*args,'--config',str(ROOT/'wrangler.production.json')],cwd=ROOT,env=env,input=input,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 # Only known non-secret Wrangler commands are emitted.
 if input is None: print(r.stdout)
 else: print('Native secret installation '+('succeeded' if r.returncode==0 else 'failed'))
 if r.returncode: raise RuntimeError('Wrangler failed')
 return r.stdout
def stripe(path,method='GET',data=None):
 req=urllib.request.Request('https://api.stripe.com/v1/'+path,data=urllib.parse.urlencode(data).encode() if data is not None else None,method=method,headers={'Authorization':'Bearer '+secrets['STRIPE_LIVE_SECRET_KEY'],'Stripe-Version':'2024-06-20','Content-Type':'application/x-www-form-urlencoded'})
 with urllib.request.urlopen(req,timeout=60) as r: return json.load(r)
def webhook():
 url='https://retroquests.app/api/stripe/webhook'
 events=['checkout.session.completed','checkout.session.async_payment_succeeded','charge.refunded','charge.dispute.created','charge.dispute.updated','charge.dispute.closed','charge.dispute.funds_withdrawn','charge.dispute.funds_reinstated']
 account=stripe('account');assert account['id']=='acct_1Odv2HEKHBH8mBfW'
 endpoints=stripe('webhook_endpoints?limit=100');assert not endpoints['has_more']
 matches=[x for x in endpoints['data'] if x['url']==url]
 assert len(matches)<=1
 if matches:
  ep=matches[0]
  assert (PRIVATE/'stripe-webhook.json').exists(), 'Existing endpoint secret unavailable; do not rotate blindly'
 else:
  payload={'url':url,'api_version':'2024-06-20','description':'Retro Quests production testing','metadata[application]':'retroquests'}
  payload.update({'enabled_events['+str(i)+']':x for i,x in enumerate(events)})
  ep=stripe('webhook_endpoints','POST',payload)
  private('stripe-webhook.json',{'endpoint_id':ep['id'],'STRIPE_WEBHOOK_SECRET':ep['secret']})
 ep=stripe('webhook_endpoints/'+ep['id']);assert ep['livemode'] and ep['status']=='enabled' and ep['api_version']=='2024-06-20' and sorted(ep['enabled_events'])==sorted(events)
 record('stripe-webhook-resource',{k:ep[k] for k in ['id','url','api_version','livemode','status','enabled_events']})
 print('Dedicated live Stripe webhook created/reused and GET-readback verified; secret retained protected; no charge or Checkout created.')
def install_secrets():
 mail=dotenv('/opt/hermes-data/hermes/profiles/nicolaas/secrets/naisapps-mailtrap.env')
 values={'STRIPE_SECRET_KEY':secrets['STRIPE_LIVE_SECRET_KEY'],'STRIPE_WEBHOOK_SECRET':json.loads((PRIVATE/'stripe-webhook.json').read_text())['STRIPE_WEBHOOK_SECRET'],'TURNSTILE_SECRET':json.loads((PRIVATE/'turnstile.json').read_text())['TURNSTILE_SECRET'],'MAILTRAP_TOKEN':mail['MAILTRAP_API_TOKEN']}
 for name,value in values.items(): wrangler(['secret','put',name],value+'\n')
 items=api('accounts/'+ACCOUNT+'/workers/scripts/retroquests-production/secrets');assert set(values)<=set(x['name'] for x in items);record('native-secret-names',items)
def readback():
 base='accounts/'+ACCOUNT
 record('worker-settings',api(base+'/workers/scripts/retroquests-production/settings'))
 record('custom-domains',api(base+'/workers/domains'))
 config=json.loads((ROOT/'wrangler.production.json').read_text());db=config['d1_databases'][0]['database_id']
 result=api(base+'/d1/database/'+db+'/query','POST',{'sql':'SELECT (SELECT count(*) FROM users) users,(SELECT count(*) FROM saves) saves,(SELECT count(*) FROM entitlements) entitlements,(SELECT count(*) FROM purchases) purchases;'});record('production-data-counts',result)
 print('Worker/domain/D1 GET/query readbacks saved.')
if __name__=='__main__':
 try:
  if sys.argv[1]=='resources': provision()
  elif sys.argv[1]=='migrate': wrangler(['d1','migrations','apply','retroquests-production-db','--remote'])
  elif sys.argv[1]=='deploy': wrangler(['deploy'])
  elif sys.argv[1]=='dry-run': wrangler(['deploy','--dry-run'])
  elif sys.argv[1]=='webhook': webhook()
  elif sys.argv[1]=='secrets': install_secrets()
  elif sys.argv[1]=='readback': readback()
 except Exception as e:
  print('Operation failed: '+type(e).__name__,file=sys.stderr);sys.exit(1)
