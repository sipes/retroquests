// Meta base pixel, optional and consent-gated. Never include account or save data.
(() => {
  'use strict';
  const PIXEL_ID = '2275341449930487';
  const KEY = 'rq_meta_consent_v1';
  const { location } = window;
  // Pixel SDK captures the page URL. Do not load on auth/private URLs or unknown
  // query/fragment values, which may contain a sign-in token or customer data.
  if (!['/', '/index.html'].includes(location.pathname) || location.hash) return;
  const allowedParams = new Set(['fbclid','utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id']);
  if ([...new URLSearchParams(location.search).keys()].some(k => !allowedParams.has(k))) return;
  if (navigator.globalPrivacyControl === true) return;
  let choice = null;
  try { choice = window.localStorage.getItem(KEY); } catch { /* No implicit consent. */ }
  let loaded = false;
  function loadPixel() {
    if (loaded) { window.fbq('consent','grant'); return; }
    loaded = true;
    // Meta's standard queue/bootstrap, with init and PageView after consent.
    const n = window.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    n('consent','grant');
    n('set','autoConfig',false,PIXEL_ID);
    n('init',PIXEL_ID);
    n('track','PageView');
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
  function store(value) {
    choice = value;
    try { window.localStorage.setItem(KEY, value); } catch { /* Session-only choice. */ }
  }
  function clearPixelCookies() {
    for (const name of ['_fbp','_fbc']) {
      for (const domain of ['', '; domain=' + location.hostname, '; domain=.' + location.hostname]) {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax';
      }
    }
  }
  function mount() {
    const style = document.createElement('style');
    style.textContent = '#rqMetaConsent{position:fixed;inset:auto 12px 12px;z-index:90;margin:auto;max-width:640px;padding:16px;background:#1c1735;color:#f2eeff;border:2px solid #55ffff;border-radius:4px;box-shadow:0 4px 24px #0008;font:15px/1.4 system-ui,sans-serif;max-height:70svh;overflow:auto}#rqMetaConsent p{margin:0 0 12px}#rqMetaConsent .rq-meta-actions{display:flex;gap:12px;flex-wrap:wrap}#rqMetaConsent button{background:#251f45;color:#f2eeff;border:1px solid #55ffff;border-radius:3px;padding:10px 14px;min-height:44px;font:inherit;cursor:pointer}#rqMetaSettings{margin-left:12px;background:transparent;color:inherit;border:1px solid currentColor;padding:6px 10px;font:inherit;min-height:44px;cursor:pointer}#rqMetaConsent button:focus-visible,#rqMetaSettings:focus-visible{outline:2px solid #ffff55;outline-offset:3px}';
    document.head.appendChild(style);
    const panel = document.createElement('section');
    panel.id = 'rqMetaConsent';
    panel.setAttribute('role','region');
    panel.setAttribute('aria-label','Optional advertising cookies');
    const text = document.createElement('p');
    text.textContent = 'Allow optional Meta advertising cookies? They measure visits and ad performance and share page-visit and browser/device data with Meta. You can play without them and change your choice in Advertising cookies.';
    panel.appendChild(text);
    const actions = document.createElement('div'); actions.className = 'rq-meta-actions';
    const reject = document.createElement('button'); reject.id='rqMetaReject'; reject.type='button'; reject.textContent='Reject';
    const allow = document.createElement('button'); allow.id='rqMetaAllow'; allow.type='button'; allow.textContent='Allow';
    reject.addEventListener('click', () => {
      store('denied');
      if (window.fbq) window.fbq('consent','revoke');
      clearPixelCookies();
      panel.hidden = true;
      // Do not reload: that could discard unacknowledged gameplay progress.
    });
    allow.addEventListener('click', () => { store('granted'); loadPixel(); panel.hidden=true; });
    actions.appendChild(reject); actions.appendChild(allow); panel.appendChild(actions);
    panel.hidden = choice === 'granted' || choice === 'denied';
    document.body.appendChild(panel);
    const settings = document.createElement('button');
    settings.id='rqMetaSettings'; settings.type='button'; settings.textContent='Advertising cookies';
    settings.addEventListener('click', () => { panel.hidden=false; reject.focus(); });
    const footer = document.querySelector ? document.querySelector('.foot') : null;
    (footer || document.body).appendChild(settings);
    if (choice === 'granted') loadPixel();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
