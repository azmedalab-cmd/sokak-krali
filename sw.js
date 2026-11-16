// sw.js — çevrimdışı çalışma için önbellek (PWA). Sürüm numarasını her yayında artır: eski önbellek silinir.
const CACHE='sokakkrali-v20';
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./js/vendor/three.min.js',
  './js/core.js','./js/fx.js','./js/lang.js','./js/menu.js','./js/world.js','./js/weapons.js','./js/player.js','./js/vehicles.js','./js/npcs.js','./js/avatar.js','./js/heli.js','./js/projectiles.js','./js/crew.js','./js/crewcfg.js','./js/allies.js','./js/military.js','./js/hitman.js','./js/cartel.js','./js/gangs.js','./js/missions.js','./js/radio.js','./js/shop.js','./js/save.js','./js/chat.js','./js/touch.js','./js/main.js'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
// Ağ varsa ağdan al ve önbelleği tazele; yoksa önbellekten ver
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET') return; const url=new URL(e.request.url); if(url.origin!==location.origin && !url.hostname.endsWith('cdnjs.cloudflare.com') && !url.hostname.endsWith('googleapis.com') && !url.hostname.endsWith('gstatic.com')) return;
  e.respondWith(fetch(new Request(e.request,{cache:'no-cache'})).then(r=>{ if(r && r.ok){ const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); } return r; }).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html')))); });
