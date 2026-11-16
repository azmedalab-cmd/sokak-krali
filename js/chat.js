// chat.js — sohbet (Enter), /komutlar, yapay zekâ arkadaş "Rıza" (Claude 'sample' yeteneği; yoksa kural tabanlı), parti odası ('room': aynı kodla oyuncular birbirini görür ve yazışır)
var Chat={open:false,log:[],turns:[],busy:false,sample:null,room:null,named:null,ghosts:{},lastMsg:'',lastTs:0,frame:0,uid:'',refreshT:0};
function initChat(){
  Chat.uid=makeCode(); const el=document.getElementById('chat');
  el.innerHTML='<div class="log"></div><div class="inp"><input id="chatinput" maxlength="160" placeholder="'+T('chatHint')+'" autocomplete="off"><button id="chatsend">'+T('send')+'</button></div>';
  el.querySelector('#chatsend').addEventListener('click',sendChat);
  const inp=el.querySelector('#chatinput'); inp.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Enter') sendChat(); if(e.key==='Escape'||e.code==='Escape') toggleChat(false); }); inp.addEventListener('keyup',e=>e.stopPropagation());
  if(typeof claude!=='undefined' && claude && claude.use){ try{ claude.use('sample').then(s=>{ Chat.sample=s; }).catch(()=>{}); }catch(e){} }
  if(MENU.mode==='ai') spawnAIFriend();
  addLine('Sistem',({tr:'Enter: sohbet · /yardım ile çete komutları',en:'Enter: chat · /help for crew commands',de:'Enter: Chat · /help für Gang-Befehle',uk:'Enter: чат · /help для команд банди',es:'Enter: chat · /help para órdenes de la banda'})[S.lang]||'Enter: sohbet · /yardım ile çete komutları',true);
}
function toggleChat(force){ Chat.open=force!==undefined?force:!Chat.open; const el=document.getElementById('chat'); el.classList.toggle('open',Chat.open); S.chatOpen=Chat.open; renderChatLog(); if(Chat.open){ setTimeout(()=>{ const i=document.getElementById('chatinput'); if(i) i.focus(); },30); S.keys={}; S.mouse.down=false; S.mouse.rdown=false; } else { const i=document.getElementById('chatinput'); if(i) i.blur(); } }
function addLine(who,text,sys){ Chat.log.push({who,text,sys,t:S.time}); if(Chat.log.length>60) Chat.log.shift(); renderChatLog(); }
function renderChatLog(){ const lg=document.querySelector('#chat .log'); if(!lg) return; const rows=Chat.open?Chat.log.slice(-14):Chat.log.filter(l=>S.time-l.t<12).slice(-5); lg.innerHTML=rows.map(l=>'<div class="'+(l.sys?'sys':'')+'"><b>'+esc(l.who)+':</b> '+esc(l.text)+'</div>').join(''); lg.scrollTop=lg.scrollHeight; }
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function sendChat(){
  const inp=document.getElementById('chatinput'); const t=(inp.value||'').trim(); if(!t) return; inp.value='';
  if(t.startsWith('/')){ handleCommand(t); return; }
  addLine(S.playerName||(S.lang==='en'?'You':'Sen'),t); Chat.lastMsg=t; Chat.lastTs=Date.now();
  if(S.ai) aiRespond(t);
}
function handleCommand(t){
  const parts=t.slice(1).toLowerCase().split(/\s+/), cmd=parts[0], arg=parts[1];
  const C=S.crewCfg; const ok=m=>addLine('Çete',m,true);
  if(cmd==='yardım'||cmd==='help'||cmd==='yardim'){ addLine('Sistem','/saldır · /koru · /dur · /takip · /silah ak47 · /zırh · /araç 50 · /moto · /işaret · /dağıl',true); return; }
  if(cmd==='saldır'||cmd==='saldir'||cmd==='attack'){ C.aggressive=true; C.hold=false; ok('Herkese saldırıyoruz!'); applyCrewCfg(); return; }
  if(cmd==='koru'||cmd==='savun'||cmd==='defend'){ C.aggressive=false; C.hold=false; ok('Seni koruyoruz, sadece saldırana ateş.'); return; }
  if(cmd==='dur'||cmd==='bekle'||cmd==='hold'){ C.hold=true; ok('Burada bekliyoruz.'); return; }
  if(cmd==='takip'||cmd==='follow'){ C.hold=false; ok('Peşindeyiz patron.'); return; }
  if(cmd==='silah'||cmd==='weapon'){ if(arg&&WEAPONS[arg]&&!WEAPONS[arg].melee){ C.weapon=arg; applyCrewCfg(); ok('Herkes '+WEAPONS[arg].name+' aldı.'); } else addLine('Sistem','Silah kodu: mp5, ak47, uzi, pump, m4, glock, deagle, m249...',true); return; }
  if(cmd==='zırh'||cmd==='zirh'||cmd==='armor'){ buyCrewArmor(); return; }
  if(cmd==='araç'||cmd==='arac'||cmd==='car'){ const n=parseInt(arg); if(!isNaN(n)){ C.vehiclePct=clamp(n,0,100); C.vehicleType='car'; ok('Çetenin %'+C.vehiclePct+'\'i arabayla geliyor.'); } else addLine('Sistem','/araç 0-100',true); return; }
  if(cmd==='moto'||cmd==='motor'){ const n=parseInt(arg); C.vehiclePct=isNaN(n)?50:clamp(n,0,100); C.vehicleType='moto'; ok('Çetenin %'+C.vehiclePct+'\'i motosikletle geliyor.'); return; }
  if(cmd==='işaret'||cmd==='isaret'||cmd==='mark'){ markLookTarget(); return; }
  if(cmd==='dağıl'||cmd==='dagil'||cmd==='disband'){ for(const p of S.crew){ if(p.ai) continue; p.state='walk'; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); } S.crew=S.crew.filter(p=>p.ai); ok('Çete dağıldı.'); return; }
  addLine('Sistem','Bilinmeyen komut. /yardım',true);
}
// ---- Yapay zekâ arkadaş: Rıza ----
function spawnAIFriend(){
  if(S.ai&&S.ai.alive) return; const n=randomNodeNear(Player.pos.x,Player.pos.z,3,8);
  const p=spawnPed(n,{gang:true,look:{skin:pick(SKINS),shirt:0xf0e0c0,pants:0x2a2a2a,hair:0x111111,jacket:0xd9771e,cap:0x222222,shades:true,beard:true},noThug:true});
  p.state='crew'; p.armed='ak47'; setHumanWeapon(p.mesh,'ak47'); p.health=400; p.maxHealth=400; p.ai=true; p.aiName='Rıza'; p.thug=false; p.angry=false; S.crew.push(p); S.ai=p;
  p.mesh.add(box(0.5,0.08,0.5,new THREE.MeshBasicMaterial({color:0xd9771e}),0,2.1,0));
  addLine('Rıza','Selam patron. Ben Rıza, sağ kolun. Ne lazımsa yaz: saldır, koru, dur, silah, araba...');
}
var AI_FALLBACK=[['saldır','Tamam patron, hepsini biçiyoruz! [SALDIR]'],['koru','Arkandayız, kimse yaklaşamaz. [KORU]'],['dur','Burada bekliyoruz. [DUR]'],['bekle','Tamam, kıpırdamıyoruz. [DUR]'],['takip','Peşindeyiz. [TAKIP]'],['gel','Geliyoruz patron. [TAKIP]'],['ak','AK-47 dağıtıyorum çocuklara. [SILAH:ak47]'],['mp5','MP5 iyi seçim. [SILAH:mp5]'],['pompalı','Pompalılar hazır. [SILAH:pump]'],['uzi','Uzi\'ler çıktı. [SILAH:uzi]'],['zırh','Zırhları alıyoruz. [ZIRH]'],['araba','Yarımız arabayla geliyor. [ARAC:50]'],['motor','Motorlarla geliyoruz. [MOTO:50]'],['polis','Polis mi? Aranma yıldızın var, bir süre saklan patron.'],['para','Para lazımsa görev halkasına gidelim ya da bir VIP soyalım.'],['selam','Selam patron, keyfin yerinde mi?'],['nasıl','İyiyim, sokaklar sakin. Sen söyle.'],['kartel','Kartellerle aran iyi olsun, itibar düşerse motorlu tetikçi yollarlar.'],['kim','Ben Rıza, bu mahallede büyüdüm. Senin sağ kolunum.']];
function aiFallback(text){ const t=text.toLowerCase(); for(const [k,r] of AI_FALLBACK) if(t.includes(k)) return r; return pick(['Anladım patron.','Hallederiz.','Ne diyorsan o.','Dikkatli ol, bu şehir tekin değil.','Haha, iyi dedin.','Çocuklar hazır, emrini bekliyoruz.']); }
function gameStateForAI(){ const c=S.cartel&&typeof cartelById==='function'?cartelById(S.cartel).name:'yok'; const here=typeof cartelAt==='function'?cartelAt(Player.pos.x,Player.pos.z):null; return 'Para $'+S.money+', aranma '+S.wanted+' yıldız, nefret '+Math.floor(S.hate)+', çete '+S.crew.length+' kişi, kartel üyeliği: '+c+', bulunduğu bölge: '+(here?here.name:'tarafsız')+', araçta: '+(Player.car?'evet':'hayır')+', çete silahı: '+S.crewCfg.weapon+', saldırgan mod: '+(S.crewCfg.aggressive?'açık':'kapalı')+', bekleme: '+(S.crewCfg.hold?'evet':'hayır')+'.'; }
async function aiRespond(text){
  if(Chat.busy) return; Chat.busy=true;
  const rules='Sen "Rıza"sın: "Sokak Kralı" adlı GTA tarzı bir oyunda oyuncunun çetesinden en yakın arkadaşı ve sağ kolusun. Türkçe, kısa (en fazla iki cümle), sokak ağzıyla ama samimi ve esprili konuş; oyuncuya "patron" de. Oyuncu çeteye dair bir istek belirtirse cevabının SONUNA köşeli parantez içinde tam olarak şu komutlardan uygun olanı ekle: [SALDIR] (çete yakındaki herkese saldırsın), [KORU] (yalnız savunma), [DUR] (beklesinler), [TAKIP] (peşinden gelsinler), [SILAH:ak47] (seçenekler: ak47, mp5, uzi, pump, m4, glock, deagle, m249), [ZIRH] (çeteye zırh al), [ARAC:50] (çetenin yüzde kaçı arabayla gelsin), [MOTO:50] (yüzde kaçı motosikletle). Komut gerekmiyorsa ekleme. Oyun durumu: '+gameStateForAI();
  Chat.turns.push({role:'user',content:text}); if(Chat.turns.length>10) Chat.turns.splice(0,Chat.turns.length-10);
  let reply=null;
  if(Chat.sample){ addLine('Rıza',T('thinking'),true); try{ const r=await Chat.sample([{role:'user',content:rules},...Chat.turns],{cache:false,modelTier:'quick'}); reply=r&&r.text; }catch(e){ reply=null; if(e&&e.code==='not_granted') Chat.sample=null; } Chat.log=Chat.log.filter(l=>!(l.sys&&l.text===T('thinking'))); }
  if(!reply) reply=aiFallback(text);
  Chat.turns.push({role:'assistant',content:reply});
  const clean=applyAICommands(reply); addLine('Rıza',clean); if(S.ai&&S.ai.alive){ S.subtitle={text:'Rıza: '+clean.slice(0,90),t:3}; } Chat.busy=false;
}
function applyAICommands(text){
  const C=S.crewCfg; let changed=false;
  const clean=String(text).replace(/\[(SALDIR|KORU|DUR|TAKIP|ZIRH|SILAH:([a-z0-9]+)|ARAC:(\d+)|MOTO:(\d+))\]/gi,(m,cmd,w,pct,mpct)=>{ const c=cmd.toUpperCase(); changed=true;
    if(c==='SALDIR'){ C.aggressive=true; C.hold=false; } else if(c==='KORU'){ C.aggressive=false; C.hold=false; } else if(c==='DUR') C.hold=true; else if(c==='TAKIP') C.hold=false; else if(c==='ZIRH') buyCrewArmor(); else if(c.startsWith('SILAH:')){ const id=w.toLowerCase(); if(WEAPONS[id]&&!WEAPONS[id].melee) C.weapon=id; } else if(c.startsWith('ARAC:')){ C.vehiclePct=clamp(parseInt(pct)||0,0,100); C.vehicleType='car'; } else if(c.startsWith('MOTO:')){ C.vehiclePct=clamp(parseInt(mpct)||0,0,100); C.vehicleType='moto'; } return ''; }).trim();
  if(changed) applyCrewCfg(); return clean||'Tamam patron.';
}
function updateChat(dt){
  Chat.refreshT-=dt; if(Chat.refreshT<=0){ Chat.refreshT=1; if(!Chat.open) renderChatLog(); }
  if(MENU.mode==='ai' && (!S.ai||!S.ai.alive)){ S.aiRespawnT=(S.aiRespawnT===undefined?25:S.aiRespawnT)-dt; if(S.aiRespawnT<=0 && !S.dead){ S.aiRespawnT=25; spawnAIFriend(); addLine('Rıza','Hastaneden çıktım patron, yine buradayım.'); } }
}
// ---- Parti odası ----
function setPartyLabel(n){ const el=document.getElementById('party'); if(el) el.textContent=T('partyCode')+': '+MENU.code.toUpperCase()+' · '+n; }
function initParty(){
  if(MENU.mode!=='party') return; const el=document.getElementById('party'); el.hidden=false; setPartyLabel(1); S.lastHitTs=Date.now();
  if(!(typeof claude!=='undefined' && claude && claude.use)){ addLine('Sistem','Parti kodu '+MENU.code.toUpperCase()+': aynı kodu giren arkadaşın aynı şehri görür. Canlı görüşme claude.ai artifact sayfasında çalışır.',true); return; }
  try{ claude.use('room').then(async room=>{ if(!room){ addLine('Sistem','Oda bağlantısı yok; parti kodu yalnız aynı haritayı verir.',true); return; } Chat.room=room;
    try{ Chat.named=await room.join(MENU.code); }catch(e){ addLine('Sistem','Odaya girilemedi: '+(e&&(e.code||e.message)||'hata'),true); return; }
    const onP=ev=>{ try{ const peers=Array.isArray(ev)?ev:((ev&&(ev.peers||ev.all))||[]); updatePeers(peers); }catch(e){} };
    if(Chat.named.onPeers) Chat.named.onPeers(onP);
    if(Chat.named.peers){ try{ const p=Chat.named.peers(); if(p&&p.then) p.then(onP); else if(p) onP(p); }catch(e){} }
    addLine('Sistem','Partiye bağlandın: '+MENU.code.toUpperCase()+' · arkadaşın aynı kodu girince seni görür',true);
  }).catch(()=>{}); }catch(e){}
}
function peerId(p){ return String(p.peer||p.id||p.peerId||p.key||(p.presence&&p.presence.uid)||'x'); }
function updatePeers(peers){
  const seen={}; let n=0;
  for(const p of peers){ if(!p) continue; const pr=p.presence||p.state||{}; if(p.isMe||p.me||p.self||(pr.uid&&pr.uid===Chat.uid)) continue; const id=peerId(p); seen[id]=true; n++; if(typeof pr.x!=='number') continue;
    let g=Chat.ghosts[id]; if(!g){ g={mesh:makeHuman({skin:pick(SKINS),shirt:0xffffff,pants:0x1a3a5a,hair:0x222222,jacket:0x1ac8ff,cap:0x1ac8ff}),name:pr.name||'Oyuncu',lastTs:0,target:null}; g.mesh.add(box(0.6,0.08,0.6,new THREE.MeshBasicMaterial({color:0x1ac8ff}),0,2.1,0)); setHumanWeapon(g.mesh,'glock'); g.mesh.position.set(pr.x,0,pr.z); S.scene.add(g.mesh); Chat.ghosts[id]=g; addLine('Sistem',(pr.name||'Bir oyuncu')+' partiye katıldı',true); }
    g.target={x:pr.x,z:pr.z,h:pr.h||0,car:!!pr.car}; g.name=pr.name||g.name;
    if(pr.gang && pr.gang.name && typeof ensureGangForHuman==='function') ensureGangForHuman(pr.gang.name);
    const tagText=(pr.gang&&pr.gang.symbol?pr.gang.symbol+' ':'')+g.name; if(g.tagText!==tagText){ g.tagText=tagText; setTag(g.mesh,tagText,pr.gang&&pr.gang.color!==undefined?hex(pr.gang.color):'#1ac8ff',true); }
    for(const hh of (pr.hits||[])){ if(hh && hh.to===S.playerName && hh.ts>(S.lastHitTs||0)){ S.lastHitTs=hh.ts; if(typeof receiveHit==='function') receiveHit(g.name); } }
    if(pr.msg && pr.ts && pr.ts>g.lastTs){ if(g.lastTs) { addLine(g.name,String(pr.msg).slice(0,160)); S.subtitle={text:g.name+': '+String(pr.msg).slice(0,80),t:3}; } g.lastTs=pr.ts; }
  }
  for(const id in Chat.ghosts) if(!seen[id]) removeGhost(id);
  setPartyLabel(n+1);
}
function removeGhost(id){ const g=Chat.ghosts[id]; if(g){ S.scene.remove(g.mesh); delete Chat.ghosts[id]; addLine('Sistem',g.name+' ayrıldı',true); } }
function updateParty(dt){
  for(const k in Chat.ghosts){ const g=Chat.ghosts[k]; if(!g.target) continue; const m=g.mesh; const dx=g.target.x-m.position.x, dz=g.target.z-m.position.z; const d=Math.hypot(dx,dz); const sp=Math.min(1,dt*6); m.position.x+=dx*sp; m.position.z+=dz*sp; m.rotation.y=lerpAngle(m.rotation.y,g.target.h,sp); m.visible=!g.target.car; animateHuman(m,d>0.3?Math.min(9,d*6):0,dt,false); }
  if(!Chat.named) return; Chat.frame++; if(Chat.frame%4!==0) return;
  const pp=Player.car?Player.car.pos:Player.pos; const h=Player.car?Player.car.heading:Player.facing;
  try{ const r=Chat.named.presence({uid:Chat.uid,x:+pp.x.toFixed(1),z:+pp.z.toFixed(1),h:+h.toFixed(2),car:!!Player.car,name:S.playerName||'Oyuncu',msg:Chat.lastMsg||null,ts:Chat.lastTs||null,gang:S.gang?{name:S.gang.name,color:S.gang.color,symbol:S.gang.symbol}:null,hits:(Chat.hits||[]).slice(-3)}); if(r&&r.catch) r.catch(()=>{}); }catch(e){}
}
