/* SJS Sports App — works without internet after the first visit */
const CACHE='sjs-sports-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 /* Firebase data and sign-in always go to the network (they have their own offline store) */
 if(/firestore\.googleapis|identitytoolkit|securetoken|googleapis\.com\/(identity|v1)|firebaseapp\.com\/__/.test(u.href))return;
 /* the app page: use the newest copy when online, the saved copy when offline */
 if(r.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/')){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
 /* fonts, Firebase scripts, icons: saved copy first, refreshed in the background */
 e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>hit);return hit||net}))});
