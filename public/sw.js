// Deliberately not an offline game/save promise. Only public icons/manifest.
const CACHE='retro-quest-static-v4';
const FILES=['/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png','/icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('retro-quest-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET'||u.origin!==location.origin||u.search||!FILES.includes(u.pathname))return;
 e.respondWith(fetch(e.request).catch(()=>caches.match(u.pathname)));
});
