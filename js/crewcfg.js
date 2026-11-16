// crewcfg.js — çete paneli (C): [1] çete ayarları (silah, saldırganlık, yaya/araç oranı, zırh, kimlik) · [2] NPC çeteleri ve ittifaklar · [3] kartel puanı, polis durumu, oyuncuya suikastçı gönderme; işaretleme (X)
S.crewCfg={weapon:'mp5',aggressive:false,attackMarked:true,attackHit:true,vehiclePct:0,vehicleType:'car',armor:false,hold:false,walk:'sidewalk'};
S.marked=[]; S.crewCars=[];
var CREW_WEAPONS=['mp5','ak47','uzi','pump','m4','glock','deagle','m249','mixed'];
var CrewUI={open:false,sel:0,tab:0};
var CREW_TABS=['1 ÇETE','2 ÇETELER','3 KARTEL'];
function crewRows(){ const C=S.crewCfg; const MAX=typeof CREW_MAX!=='undefined'?CREW_MAX:75;
  if(CrewUI.tab===1){ const rows=(S.npcGangs||[]).map(g=>({n:g.symbol+' '+g.name+(g.forHuman?'  (insan çetesi için eklendi)':''),v:S.gangAlly[g.id]?'İTTİFAK':'DÜŞMAN · Enter: ittifak $'+price(2000),f:()=>{ if(S.gangAlly[g.id]) breakAlliance(g); else offerAlliance(g); }}));
    if(!rows.length) rows.push({n:'Şehirde NPC çetesi yok',v:'-',f:()=>{}}); rows.push({n:'Not: ittifak olmayan çetelere çeten gördüğü an saldırır',v:'',f:()=>{}}); return rows; }
  if(CrewUI.tab===2){ const rows=[
    {n:cartelPtsInfo(),v:'',f:()=>{}},
    {n:'Polis durumu',v:S.cartelPts>2.5?'Polis kaçıyor, sadece SWAT':'Normal',f:()=>{}},
    {n:'Ordu',v:S.cartelPts>=4?'3+ yıldızda asker ve tank gelir':'Kartel puanı 4 olunca',f:()=>{}},
    {n:'Korkulan statüsü',v:S.feared?'AKTİF: kimse sataşmıyor':'Tank imha: '+(S.stats.tanks||0)+'/5',f:()=>{}} ];
    const peers=Object.values(Chat.ghosts||{}).map(g=>g.name).filter(Boolean);
    if(MENU.mode==='party'){ if(peers.length) for(const nm of peers) rows.push({n:'Suikastçı gönder → '+nm,v:'$'+price(1500),f:()=>sendPlayerHit(nm)}); else rows.push({n:'Suikastçı gönder',v:'partide başka oyuncu yok',f:()=>{}}); }
    else rows.push({n:'Suikastçı gönder (oyuncuya)',v:'yalnız parti modunda',f:()=>{}});
    return rows; }
  return [
  {n:'Çete kimliği',v:S.gang?S.gang.symbol+' '+S.gang.name+' · Enter: düzenle':'Yok · Enter: çete kur',f:()=>openGangForm()},
  {n:'Çete silahı',v:C.weapon==='mixed'?'Karışık':WEAPONS[C.weapon].name,f:d=>{ C.weapon=CREW_WEAPONS[(CREW_WEAPONS.indexOf(C.weapon)+d+CREW_WEAPONS.length)%CREW_WEAPONS.length]; applyCrewCfg(); }},
  {n:'Yakındaki herkese saldır',v:C.aggressive?'AÇIK':'KAPALI',f:()=>{ C.aggressive=!C.aggressive; }},
  {n:'İşaretlediğim hedefe saldır (X)',v:C.attackMarked?'AÇIK':'KAPALI',f:()=>{ C.attackMarked=!C.attackMarked; }},
  {n:'Vurduğum kişiye saldır',v:C.attackHit?'AÇIK':'KAPALI',f:()=>{ C.attackHit=!C.attackHit; }},
  {n:'Araçla gelen oran (kalanı yaya)',v:'%'+C.vehiclePct+' araç · %'+(100-C.vehiclePct)+' yaya',f:d=>{ const L=[0,25,50,75,100]; C.vehiclePct=L[(L.indexOf(C.vehiclePct)+d+L.length)%L.length]; }},
  {n:'Araç tipi',v:C.vehicleType==='car'?'Araba':'Motosiklet',f:()=>{ C.vehicleType=C.vehicleType==='car'?'moto':'car'; }},
  {n:'Yayalar nasıl gelsin',v:C.walk==='escort'?'Etrafımda koruma düzeni':'Kaldırımda yaya (NPC gibi)',f:()=>{ C.walk=C.walk==='escort'?'sidewalk':'escort'; }},
  {n:'Çeteye zırh al',v:C.armor?'ALINDI':'$'+price(200)+' × '+S.crew.length,f:()=>buyCrewArmor()},
  {n:'Çete',v:C.hold?'BEKLİYOR':'TAKİP EDİYOR',f:()=>{ C.hold=!C.hold; }},
  {n:'Üye sayısı',v:S.crew.length+' / '+MAX,f:()=>{}}
]; }
function toggleCrewCfg(){ CrewUI.open=!CrewUI.open; document.getElementById('crewcfg').hidden=!CrewUI.open; if(CrewUI.open) renderCrewCfg(); }
function renderCrewCfg(){ const rows=crewRows(); CrewUI.sel=clamp(CrewUI.sel,0,rows.length-1); const el=document.getElementById('crewcfg');
  el.innerHTML='<h3>'+T('crewCfg')+'</h3><div class="tabs">'+CREW_TABS.map((t,i)=>'<span class="'+(i===CrewUI.tab?'on':'')+'" data-t="'+i+'">'+t+'</span>').join('')+'</div>'+rows.map((r,i)=>'<div class="it '+(i===CrewUI.sel?'sel':'')+'" data-i="'+i+'"><span>'+r.n+'</span><span class="ctl"><button data-d="-1" type="button">◀</button><b>'+r.v+'</b><button data-d="1" type="button">▶</button></span></div>').join('')+'<p class="keys">1 2 3 sekme · ↑ ↓ seç · ← → / Enter değiştir · C / Esc kapat · Ctrl ile fareyi serbest bırakıp tıklayabilirsin</p><div class="btns"><button id="ccClose" type="button">KAPAT</button></div>';
  el.querySelectorAll('.tabs span').forEach(s=>s.addEventListener('click',()=>{ CrewUI.tab=+s.dataset.t; CrewUI.sel=0; renderCrewCfg(); }));
  el.querySelectorAll('.it').forEach(d=>d.addEventListener('click',e=>{ CrewUI.sel=+d.dataset.i; const b=e.target.closest('button'); if(b){ e.stopPropagation(); crewKey(+b.dataset.d<0?'ArrowLeft':'ArrowRight'); } else renderCrewCfg(); }));
  el.querySelector('#ccClose').addEventListener('click',()=>{ if(CrewUI.open) toggleCrewCfg(); });
}
function crewKey(code){ if(typeof GangForm!=='undefined' && GangForm.open) return; const rows=crewRows();
  if(code==='Digit1'||code==='Digit2'||code==='Digit3'){ CrewUI.tab=+code[5]-1; CrewUI.sel=0; }
  else if(code==='ArrowUp') CrewUI.sel--; else if(code==='ArrowDown') CrewUI.sel++; else if(code==='ArrowLeft') rows[CrewUI.sel].f(-1); else if(code==='ArrowRight'||code==='Enter'||code==='NumpadEnter') rows[CrewUI.sel].f(1); else if(code==='Escape'||code==='KeyC'){ toggleCrewCfg(); return; } renderCrewCfg(); }
function applyCrewCfg(){ const C=S.crewCfg; for(const p of S.crew){ if(!p.alive||p.ai) continue; const w=C.weapon==='mixed'?pick(CREW_WEAPONS.slice(0,8)):C.weapon; if(p.armed!==w){ p.armed=w; setHumanWeapon(p.mesh,w); } } }
function buyCrewArmor(){ const C=S.crewCfg; const n=S.crew.filter(p=>p.alive&&!p.armored).length; if(!n){ toast('Zırhsız çete üyesi yok'); return; } const cost=price(200)*n; if(S.money<cost){ toast('Zırh için $'+cost+' gerekli'); return; } S.money-=cost; for(const p of S.crew){ if(!p.alive||p.armored) continue; p.armored=true; p.health=Math.max(p.health,180); p.mesh.add(box(0.48,0.5,0.16,matLambert(0x2a2f36),0,1.26,0.06)); } C.armor=true; toast(n+' üyeye zırh alındı (-$'+cost+')'); }
function markLookTarget(){ const t=S.lookTarget; if(!t){ toast('Önce birine bak (yakın mesafe), sonra X'); return; } if(!S.marked.includes(t.ref)) S.marked.push(t.ref); t.ref.markedT=25; toast('Hedef işaretlendi: çete saldırıyor'); if(t.type==='ped') pedSay(t.ref,pick(['Ne?! Bana mı?','Durun, yapmayın!'])); }
function markEntity(ref){ if(!S.crewCfg.attackHit||!ref||!ref.alive) return; if(!S.marked.includes(ref)) S.marked.push(ref); ref.markedT=20; }
// getHostiles için ek hedefler: işaretliler, saldırgan modda yakındaki herkes, düşman çete üyeleri
function crewExtraHostiles(){
  const out=[]; const pp=Player.car?Player.car.pos:Player.pos; const C=S.crewCfg;
  S.marked=S.marked.filter(r=>r.alive && (r.markedT=(r.markedT||0)-S.dt)>0);
  if(C.attackMarked) for(const r of S.marked) out.push({pos:r.pos,type:r.type==='cop'?'cop':'ped',ref:r});
  if(C.aggressive){ for(const p of S.peds) if(p.alive && p.state!=='crew' && !p.riding && !p.boss && !(p.cartel&&S.cartel===p.cartel) && dist2D(p.pos,pp)<22) out.push({pos:p.pos,type:'ped',ref:p}); for(const c of S.cops) if(c.alive && !c.loyal && dist2D(c.pos,pp)<22) out.push({pos:c.pos,type:'cop',ref:c}); }
  if(typeof gangHostiles==='function') for(const h of gangHostiles()) out.push(h);
  return out;
}
// Araçlı koruma: çetenin bir kısmı dost arabalarla / motosikletlerle gelir (ilk binen sürer)
function updateCrewVehicles(dt){
  const C=S.crewCfg; S.crewCars=S.crewCars.filter(c=>!c.dead && S.cars.includes(c));
  const per=C.vehicleType==='moto'?2:3; const riders=S.crew.filter(p=>p.alive&&!p.ai).length; const want=Math.round(riders*C.vehiclePct/100/per);
  S.crewCarT=(S.crewCarT||0)-dt; if(S.crewCarT>0) return; S.crewCarT=2;
  if(S.crewCars.length<want){ const pp=Player.car?Player.car.pos:Player.pos; const lp=nearestLanePoint(pp); const c=spawnCar({type:C.vehicleType==='moto'?'moto':pick(['sedan','suv','muscle']),pos:lp,noDriver:true}); c.ai=false; c.ally=true; c.owned=true; c.crewCar=true; S.crewCars.push(c); S.allies.push({kind:'policecar',car:c,pos:c.pos,health:100,mesh:c.mesh});
    let k=0; for(const p of S.crew){ if(k>=per) break; if(p.alive&&!p.ai&&!p.riding){ p.riding=c; p.mesh.visible=false; c.riders.push(p); if(k===0) c.crewDriver=p; k++; } } }
  else if(S.crewCars.length>want){ const c=S.crewCars.pop(); for(const p of c.riders){ p.riding=null; p.mesh.visible=true; setSeated(p.mesh,false); p.pos.set(c.pos.x+rand(-2,2),0,c.pos.z+rand(-2,2)); } c.riders=[]; S.allies=S.allies.filter(a=>a.car!==c); removeCarAt(S.cars.indexOf(c)); }
}
// Parti: başka oyuncuya suikastçı gönder (presence ile iletilir); gelen suikast emrinde tetikçiler yanımızda belirir
function sendPlayerHit(name){ const cost=price(1500); if(S.money<cost){ toast('Suikastçı için $'+cost+' gerekli'); return; } S.money-=cost; Chat.hits=(Chat.hits||[]).concat([{to:name,ts:Date.now()}]).slice(-3); toast(name+' için suikastçı yola çıktı'); }
function receiveHit(from){ toast(from+' sana suikastçı gönderdi!'); S.subtitle={text:'Telsiz: '+from+' bir ekip yolladı. Dikkat!',t:3}; const pp=Player.car?Player.car.pos:Player.pos; const n=randomNodeNear(pp.x,pp.z,35,60);
  for(let i=0;i<3;i++){ const a=spawnPed(n,{gang:true,look:{skin:pick(SKINS),shirt:0x111111,pants:0x111111,hair:0x111111,jacket:0x1a1a1a,cap:0x111111,shades:true},noThug:true}); a.gangId=null; setTag(a.mesh,'☠ '+from,'#ff3b3b'); a.hunter=true; a.armed=pick(['uzi','ak47','mp5']); setHumanWeapon(a.mesh,a.armed); a.health=90; startFight(a); } }
