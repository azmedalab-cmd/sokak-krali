// gangs.js — çete kimliği (isim, renk, sembol), otomatik NPC çeteleri (her insan çetesi için bir tane daha), ittifaklar, isim/sembol etiketleri
var GANG_SYMBOLS=['☠','★','♠','⚡','🔥','🐍','🦅','👑','💀','🗡','🐺','♛','☢','✠','⚔','🦂'];
var GANG_COLORS=[0x2d7a4f,0xc0392b,0x2980b9,0x8e44ad,0xf39c12,0x16a085,0xe91e63,0xf4f4f4,0x151515,0xff5722,0x9acd32,0x00bcd4];
var NPC_GANG_NAMES=['Kara Kurtlar','Demir Yumruk','Sokak Çakalları','Gece Akbabaları','Kızıl Ejderler','Beton Kralları','Mavi Şeytanlar','Son Nefes','Kuzgunlar','Yıldırım Kardeşliği','Çelik Pençe','Kör Kurşun','Asfalt Aslanları','Kül Kardeşler'];
S.gang=null; S.npcGangs=[]; S.gangAlly={}; S.humanGangs={};
var CREW_MAX=75;
function stoast(t){ if(typeof H!=='undefined' && H.toasts) toast(t); }
// --- etiketler: kafa üstü isim / sembol (canvas sprite) ---
function makeTag(text,color,big){
  const cv=document.createElement('canvas'); cv.width=256; cv.height=64; const g=cv.getContext('2d');
  g.font='bold '+(big?44:34)+'px system-ui,Segoe UI Emoji,Apple Color Emoji,sans-serif'; g.textAlign='center'; g.textBaseline='middle';
  g.shadowColor='rgba(0,0,0,0.9)'; g.shadowBlur=6; g.lineWidth=5; g.strokeStyle='rgba(0,0,0,0.8)'; g.strokeText(text,128,34); g.fillStyle=color||'#fff'; g.fillText(text,128,34);
  const tex=new THREE.CanvasTexture(cv); tex.minFilter=THREE.LinearFilter; const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:true,depthWrite:false})); sp.scale.set(big?2.2:1.6,big?0.55:0.4,1); sp.position.y=2.3; sp.userData.tag=true; return sp;
}
function setTag(mesh,text,color,big){ if(mesh.userData.tagSprite){ mesh.remove(mesh.userData.tagSprite); mesh.userData.tagSprite=null; } if(!text) return; const sp=makeTag(text,color,big); mesh.add(sp); mesh.userData.tagSprite=sp; }
function hex(c){ return '#'+(c>>>0).toString(16).padStart(6,'0'); }
// --- NPC çeteleri: tohumdan üretilir; her insan çetesi için (adından türeyen) bir tane daha eklenir ---
function initGangs(){
  S.npcGangs=[]; const rng=mulberry32((S.seed||1)+77); const names=NPC_GANG_NAMES.slice(), syms=GANG_SYMBOLS.slice(), cols=GANG_COLORS.slice();
  for(let k=0;k<4;k++){ const name=names.splice(Math.floor(rng()*names.length),1)[0]; const symbol=syms.splice(Math.floor(rng()*syms.length),1)[0]; const color=cols.splice(Math.floor(rng()*cols.length),1)[0]; S.npcGangs.push({id:'g'+k,name,symbol,color,i:Math.floor(rng()*CITY.N),j:Math.floor(rng()*CITY.N)}); }
  if(S.gang) ensureGangForHuman(S.gang.name);
}
function ensureGangForHuman(hname){
  if(!hname||S.humanGangs[hname]) return; S.humanGangs[hname]=true; const rng=mulberry32(seedFromString('npcgang-'+hname.toLowerCase()));
  const used=S.npcGangs.map(g=>g.name); const names=NPC_GANG_NAMES.filter(n=>!used.includes(n)); const name=names.length?names[Math.floor(rng()*names.length)]:('Çete '+(S.npcGangs.length+1));
  const g={id:'h'+S.npcGangs.length,name,symbol:GANG_SYMBOLS[Math.floor(rng()*GANG_SYMBOLS.length)],color:GANG_COLORS[Math.floor(rng()*GANG_COLORS.length)],i:Math.floor(rng()*CITY.N),j:Math.floor(rng()*CITY.N),forHuman:hname};
  S.npcGangs.push(g); if(MENU.started) stoast('Yeni NPC çetesi şehre indi: '+g.symbol+' '+g.name);
}
function gangById(id){ return S.npcGangs.find(g=>g.id===id); }
function gangNear(x,z){ if(!S.npcGangs.length) return null; const i=x/CITY.P, j=z/CITY.P; let best=null,bd=1e9; for(const g of S.npcGangs){ const d=Math.hypot(g.i+0.5-i,g.j+0.5-j); if(d<bd){ bd=d; best=g; } } return best; }
function applyGangLook(p,g){ if(!g) return; p.gangId=g.id; p.mesh.userData.torso.material=matLambert(g.color); setTag(p.mesh,g.symbol,hex(g.color)); }
function isHostileGangPed(p){ return !!(p.gangId && !S.gangAlly[p.gangId] && p.state!=='crew' && p.alive); }
// Çete üyelerinin gördüğü düşman çete üyeleri (yaya da olsalar otomatik saldırırlar)
function gangHostiles(){
  const out=[]; if(!S.crew.length) return out; const pp=Player.car?Player.car.pos:Player.pos;
  for(const p of S.peds){ if(!isHostileGangPed(p) || p.riding) continue; if(dist2D(p.pos,pp)<26) out.push({pos:p.pos,type:'ped',ref:p,passive:p.state!=='fight'}); } // yalnız oyuncunun yakınındakiler; kavgaya girmemiş olanlar 'passive': çete peşinden koşmaz, görüş hattından ateş eder
  return out;
}
function offerAlliance(g){
  if(S.gangAlly[g.id]){ stoast(g.name+' zaten müttefik'); return; } const cost=price(2000); if(S.money<cost){ stoast('İttifak hediyesi için $'+cost+' gerekli'); return; }
  S.money-=cost; if(Math.random()<0.6){ S.gangAlly[g.id]=true; stoast(g.symbol+' '+g.name+' ittifakı kabul etti'); S.subtitle={text:g.name+': Bundan sonra sırt sırtayız.',t:3}; } else { stoast(g.name+' teklifi reddetti, para gitti'); S.subtitle={text:g.name+': Paranı al, bölgemizden uzak dur.',t:3}; }
}
function breakAlliance(g){ delete S.gangAlly[g.id]; stoast(g.name+' ile ittifak bozuldu'); }
// --- oyuncu çetesi ---
function saveGang(name,color,symbol){ name=(name||'').trim().slice(0,18); if(!name){ stoast('Çeteye bir isim ver'); return false; } S.gang={name,color,symbol}; ensureGangForHuman(name); applyGangToCrew(); stoast(symbol+' '+name+' kuruldu'); return true; }
function applyGangToCrew(){ for(const p of S.crew){ if(!p.alive) continue; if(S.gang){ p.mesh.userData.torso.material=matLambert(S.gang.color); setTag(p.mesh,p.ai?S.gang.symbol+' Rıza':S.gang.symbol,hex(S.gang.color)); } else { p.mesh.userData.torso.material=matLambert(0x2d7a4f); setTag(p.mesh,null); } } }
function crewJoinLook(p){ p.gangId=null; if(S.gang){ p.mesh.userData.torso.material=matLambert(S.gang.color); setTag(p.mesh,S.gang.symbol,hex(S.gang.color)); } else { p.mesh.userData.torso.material=matLambert(0x2d7a4f); setTag(p.mesh,null); } }
var GangForm={open:false,color:0x2d7a4f,symbol:'☠'};
function openGangForm(){
  GangForm.open=true; const el=document.getElementById('gangform'); el.hidden=false; const g=S.gang||{name:'',color:GangForm.color,symbol:GangForm.symbol}; GangForm.color=g.color; GangForm.symbol=g.symbol;
  const render=()=>{ el.innerHTML='<h3>ÇETE KUR / DÜZENLE</h3><label>İsim</label><input id="gname" maxlength="18" value="'+(g.name||'').replace(/"/g,'&quot;')+'" placeholder="Çetenin adı"><label>Renk</label><div class="sw">'+GANG_COLORS.map(c=>'<span class="'+(c===GangForm.color?'on':'')+'" data-c="'+c+'" style="background:'+hex(c)+'"></span>').join('')+'</div><label>Sembol</label><div class="sy">'+GANG_SYMBOLS.map(s=>'<span class="'+(s===GangForm.symbol?'on':'')+'" data-s="'+s+'">'+s+'</span>').join('')+'</div><div class="prev" style="color:'+hex(GangForm.color)+'">'+GangForm.symbol+' '+((document.getElementById('gname')||{}).value||g.name||'...')+'</div><div class="btns"><button id="gsave">KAYDET</button><button id="gcancel">VAZGEÇ</button></div>';
    el.querySelectorAll('.sw span').forEach(s=>s.addEventListener('click',()=>{ GangForm.color=+s.dataset.c; g.name=document.getElementById('gname').value; render(); }));
    el.querySelectorAll('.sy span').forEach(s=>s.addEventListener('click',()=>{ GangForm.symbol=s.dataset.s; g.name=document.getElementById('gname').value; render(); }));
    const inp=document.getElementById('gname'); inp.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Enter') document.getElementById('gsave').click(); if(e.key==='Escape') closeGangForm(); }); inp.addEventListener('keyup',e=>e.stopPropagation()); inp.addEventListener('input',()=>{ el.querySelector('.prev').textContent=GangForm.symbol+' '+(inp.value||'...'); });
    document.getElementById('gsave').addEventListener('click',()=>{ if(saveGang(inp.value,GangForm.color,GangForm.symbol)){ closeGangForm(); if(typeof savePrefs==='function'){ MENU.gang=S.gang; savePrefs(); } if(!MENU.started && typeof renderMenu==='function') renderMenu(); } });
    document.getElementById('gcancel').addEventListener('click',closeGangForm);
    setTimeout(()=>inp.focus(),30);
  };
  render(); if(MENU.started){ S.keys={}; S.mouse.down=false; S.mouse.rdown=false; }
}
function closeGangForm(){ GangForm.open=false; document.getElementById('gangform').hidden=true; if(typeof CrewUI!=='undefined' && CrewUI.open) renderCrewCfg(); }
function updateGangs(dt){
  // düşman çete üyeleri çetene ateş açar (çete üyesini vurunca ya da yakın görünce)
  S.gangScanT=(S.gangScanT||0)-dt; if(S.gangScanT>0) return; S.gangScanT=1.5; if(S.feared) return;
  for(const p of S.peds){ if(!isHostileGangPed(p) || p.riding || p.state!=='walk' || !p.armed) continue; for(const c of S.crew){ if(c.alive && !c.riding && dist2D(c.pos,p.pos)<14 && hasLOS(p.pos.clone().setY(1.5),c.pos.clone().setY(1.2))){ startFight(p); if(p.sayT<=0 && dist2D(p.pos,Player.pos)<30){ pedSay(p,pick([gangById(p.gangId).name+' bölgesine girdiniz!','Düşman çete! Vurun!','Burası bizim sokak!'])); p.sayT=8; } break; } } }
}
