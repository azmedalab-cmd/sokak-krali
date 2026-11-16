// cartel.js — üç kartel: bölge, üyeler, patron, itibar (-100..100), baskın ekipleri, davet (Y/N), üyelik, patron koruma, kiralık katil görevi
var CARTELS=[
  {id:'north',name:'Kuzey Karteli',color:0x8a1a1a,boss:'Don Vito',inArea:(i,j)=>i<=2&&j<=2,base:{i:1,j:1},fedora:0x111111,tie:0xb01030},
  {id:'east',name:'Doğu Karteli',color:0x1a3a8a,boss:'Salvatore',inArea:(i,j)=>i>=4&&j<=2,base:{i:5,j:1},fedora:0x1a2a4a,tie:0x1a3a8a},
  {id:'west',name:'Batı Karteli',color:0x8a6a1a,boss:'Kara Memo',inArea:(i,j)=>i<=1&&j>=3&&j<=4,base:{i:0,j:3},fedora:0x3a2a10,tie:0xc8a84a},
  {id:'center',name:'Merkez Karteli',color:0x5a1a7a,boss:'Doktor',inArea:(i,j)=>i>=2&&i<=4&&j>=3&&j<=4,base:{i:4,j:4},fedora:0x2a1030,tie:0x7a2a9a},
  {id:'south',name:'Güney Karteli',color:0x2a7a2a,boss:'El Jefe',inArea:(i,j)=>j>=5,base:{i:3,j:6},fedora:0x1a3a1a,tie:0x2a7a2a}
];
S.rep={north:0,east:0,west:0,center:0,south:0}; S.cartel=null; S.invite=null; S.bossMission=null; S.bossEvent=null;
function cartelAt(x,z){ const i=Math.floor(x/CITY.P), j=Math.floor(z/CITY.P); for(const c of CARTELS) if(c.inArea(i,j)) return c; return null; }
function cartelById(id){ return CARTELS.find(c=>c.id===id); }
function repLabel(r){ return r>=40?'Dost':r<=-40?'Düşman':r>=20?'Sıcak':r<=-20?'Gergin':'Nötr'; }
function addRep(id,n){ S.rep[id]=clamp((S.rep[id]||0)+n,-100,100); }
function cartelLook(c){ return {skin:pick(SKINS),shirt:0x111111,pants:0x1a1a1a,hair:0x111111,jacket:c.color,cap:c.color,female:false,hairStyle:'short',shades:Math.random()<0.5}; }
// Patron: eski usul mafya: fötr şapka, çizgili takım, beyaz gömlek, kravat, puro, güneş gözlüğü, bıyık
function bossLook(c){ return {skin:pick(SKINS),shirt:0xf4f4f4,pants:0x15151a,hair:0x222222,jacket:0x15151a,pinstripe:true,mafia:true,fedora:c.fedora,tie:c.tie,cigar:true,mustache:true,shoes:0x2a1a0a}; }
function guardLook(c){ return {skin:pick(SKINS),shirt:0xf4f4f4,pants:0x111111,hair:0x111111,jacket:0x1a1a1f,mafia:true,tie:c.tie,shades:true}; }
function spawnCartelMember(c,node,opts){
  opts=opts||{}; const p=spawnPed(node,{gang:true,look:cartelLook(c),noThug:true});
  p.cartel=c.id; p.armed=opts.armed||pick(['uzi','mac10','ak47','glock','mp5','deagle']); setHumanWeapon(p.mesh,p.armed); p.health=70; return p;
}
// Bölgede dolaşan kartel üyeleri; itibara göre tavır
function updateCartels(dt){
  const pp=Player.car?Player.car.pos:Player.pos; const here=cartelAt(pp.x,pp.z);
  if(here!==S.lastTerritory){ S.lastTerritory=here; if(here && !S.dead) toast(here.name+' bölgesi — '+repLabel(S.rep[here.id])); }
  S.cartelSpawnT=(S.cartelSpawnT||0)-dt;
  if(here && S.cartelSpawnT<=0){ S.cartelSpawnT=4; const n=S.peds.filter(p=>p.alive&&p.cartel===here.id).length; if(n<6){ const nd=randomNodeNear(pp.x,pp.z,40,120); if(cartelAt(nd.x,nd.z)===here) spawnCartelMember(here,nd); } }
  // Düşman kartel: baskın ekipleri
  S.raidT=(S.raidT||0)-dt;
  if(S.raidT<=0 && !S.dead && !S.busted){ S.raidT=rand(50,90); const hostile=CARTELS.filter(c=>S.rep[c.id]<=-40 && c.id!==S.cartel); if(hostile.length) sendHitSquad(pick(hostile)); }
  // Dost kartel: yakındaki üyeler düşmanlarına saldırır
  if(here && S.rep[here.id]>=40){ const host=nearestHostile(pp,30); if(host) for(const p of S.peds) if(p.alive&&p.cartel===here.id&&p.state==='walk'&&dist2D(p.pos,pp)<30){ p.state='helper'; p.helpT=12; } }
  // Davet
  if(!S.cartel && !S.invite && here && S.rep[here.id]>=20 && Math.random()<dt*0.04){ const m=S.peds.find(p=>p.alive&&p.cartel===here.id&&p.state==='walk'&&dist2D(p.pos,pp)<25); if(m) startInvite(m,here); }
  if(S.invite){ S.invite.t-=dt; const m=S.invite.ped; if(!m.alive||S.invite.t<=0||dist2D(m.pos,pp)>20){ if(m.alive){ m.state='walk'; } S.invite=null; } else { m.state='invite'; m.facing=Math.atan2(pp.x-m.pos.x,pp.z-m.pos.z); } }
  // Patron olayları
  if(S.cartel){ S.bossEventT=(S.bossEventT||rand(60,120))-dt; if(S.bossEventT<=0 && !S.bossEvent && !S.bossMission){ S.bossEventT=rand(120,200); startBossAttack(); } updateBossEvent(dt); updateBossMission(dt); ensureBoss(); }
}
function startInvite(m,c){ S.invite={ped:m,cartel:c.id,t:12}; m.state='invite'; pedSay(m,'Dur bakalım. '+c.boss+' seni ekibe istiyor. Katılıyor musun? (Y: evet, N: hayır)'); S.subtitle.t=6; }
function answerInvite(yes){
  const inv=S.invite; if(!inv) return false; const c=cartelById(inv.cartel), m=inv.ped; S.invite=null;
  if(yes){ S.cartel=c.id; addRep(c.id,40); for(const o of CARTELS) if(o.id!==c.id) addRep(o.id,-15); if(m.alive){ m.state='walk'; pedSay(m,'Hoş geldin. Patron bizim bölgede, üs binasında. E ile konuş.'); } toast(c.name+' üyesisin! Patron: '+c.boss); flashMessage(c.name.toUpperCase(),'Aileye hoş geldin. Patronu koru, işlerini yap.',true); ensureBoss(); }
  else { addRep(c.id,-10); if(m.alive){ m.state='walk'; pedSay(m,pick(['Pişman olacaksın.','Bizi reddeden uzun yaşamaz.','Nasıl istersen.'])); startFlee(m,Player.pos,4); } toast('Teklifi reddettin: '+c.name+' itibarı düştü'); }
  return true;
}
function leaveCartel(why){ if(!S.cartel) return; const c=cartelById(S.cartel); S.cartel=null; addRep(c.id,-60); if(S.boss&&S.boss.alive){ S.boss.boss=null; } S.boss=null; S.bossMission=null; S.bossEvent=null; toast(c.name+' ile yolların ayrıldı'+(why?': '+why:'')); }
// Patron: üs bloğunun önünde, 4 korumayla bekler
function ensureBoss(){
  if(!S.cartel) return; const c=cartelById(S.cartel);
  if(S.boss && S.boss.alive && S.boss.boss===c.id) return;
  const bx=Math.min(c.base.i,CITY.N-1)*CITY.P+CITY.P/2, bz=Math.min(c.base.j,CITY.N-1)*CITY.P+CITY.P/2+22; const n=nearestNode(bx,bz);
  const p=spawnPed(n,{gang:true,look:bossLook(c),noThug:true}); p.state='idle'; p.idleT=1e9; p.boss=c.id; p.cartel=c.id; p.health=150; p.armed='deagle'; setHumanWeapon(p.mesh,'deagle'); p.guards=[]; p.vip={t:3,name:c.boss,money:0,heat:0}; p.pos.set(bx,0,bz); collideWorld(p.pos,0.3); p.mesh.scale.setScalar(1.08);
  p.mesh.add(box(0.5,0.08,0.5,new THREE.MeshBasicMaterial({color:c.color}),0,2.25,0));
  for(let i=0;i<4;i++){ const g=spawnPed(n,{gang:true,look:guardLook(c),noThug:true}); g.cartel=c.id; g.armed=pick(['ak47','mp5','thompson']); setHumanWeapon(g.mesh,g.armed); g.health=90; g.state='bodyguard'; g.guardOf=p; g.pos.set(bx+rand(-3,3),0,bz+rand(-3,3)); p.guards.push(g); }
  S.boss=p; S.places.boss={x:bx,z:bz};
}
// Patrona saldırı olayı
function startBossAttack(){
  const b=S.boss; if(!b||!b.alive) return; const c=cartelById(S.cartel); const rival=pick(CARTELS.filter(x=>x.id!==c.id));
  const n=randomNodeNear(b.pos.x,b.pos.z,45,80); const attackers=[];
  for(let i=0;i<4;i++){ const a=spawnCartelMember(rival,n,{armed:pick(['uzi','ak47','mac10'])}); a.state='bossattack'; a.target=b; attackers.push(a); }
  S.bossEvent={attackers,t:0}; flashMessage('PATRON SALDIRI ALTINDA','Üs bölgesine koş ve '+rival.name+' tetikçilerini durdur!',false); setObjective(b.pos.x,b.pos.z);
}
function updateBossEvent(dt){
  const ev=S.bossEvent; if(!ev) return; ev.t+=dt; const b=S.boss;
  if(!b||!b.alive){ S.bossEvent=null; clearObjective(); flashMessage('PATRON ÖLDÜ','Kartel dağıldı.',false); leaveCartel('patron öldü'); return; }
  const alive=ev.attackers.filter(a=>a.alive); if(!alive.length){ S.bossEvent=null; clearObjective(); addRep(S.cartel,15); S.money+=2000; flashMessage('PATRON KURTARILDI','+$2000, itibar +15',true); return; }
  if(ev.t>150){ S.bossEvent=null; clearObjective(); for(const a of alive){ a.state='walk'; } }
}
// Kiralık katil görevi: patrondan susturuculu tabanca ve birkaç mermi
function startBossMission(){
  if(S.bossMission){ toast('Zaten bir işin var'); return; } if(S.bossEvent){ toast('Önce saldırıyı püskürt'); return; }
  const c=cartelById(S.cartel); const rival=pick(CARTELS.filter(x=>x.id!==c.id)); const n=randomNodeNear(Player.pos.x,Player.pos.z,100,190);
  const t=spawnCartelMember(rival,n,{armed:'glock'}); t.mission=true; t.health=80;
  if(!Player.owned.silenced){ Player.owned.silenced=true; WEAPONS.silenced.cur=0; } WEAPONS.silenced.cur+=8; equip('silenced');
  S.bossMission={target:t,t:0,wanted0:S.wanted}; S.subtitle={text:c.boss+': '+rival.name+'\'nden bir hain var. Sessizce hallet. Susturuculu tabanca ve 8 mermi al. Polise yakalanma.',t:6};
  flashMessage('KİRALIK KATİL','Hedefi sessizce öldür. Fark edilme.',true); setObjective(t.pos.x,t.pos.z);
}
function updateBossMission(dt){
  const m=S.bossMission; if(!m) return; m.t+=dt; const t=m.target;
  if(!t.alive){ S.bossMission=null; clearObjective(); t.mission=false; addRep(S.cartel,25); S.money+=3000; flashMessage('İŞ TAMAM','+$3000, itibar +25',true); return; }
  setObjective(t.pos.x,t.pos.z);
  if(S.wanted>0 && S.wanted>m.wanted0){ S.bossMission=null; clearObjective(); t.mission=false; addRep(S.cartel,-10); flashMessage('GÖREV BAŞARISIZ','Fark edildin; patron memnun değil.',false); }
  if(m.t>240){ S.bossMission=null; clearObjective(); t.mission=false; flashMessage('GÖREV BAŞARISIZ','Çok geç kaldın.',false); }
}
// Baskın ekibi: motosikletli ikili (sürücü + tetikçi) ya da yaya üçlü
function sendHitSquad(c){
  const pp=Player.car?Player.car.pos:Player.pos;
  if(Math.random()<0.6){ let car=null; for(let t=0;t<15;t++){ car=spawnCar({type:'moto',chase:true,noDriver:true}); const d=dist2D(car.pos,pp); if(d>70&&d<160) break; removeCarAt(S.cars.indexOf(car)); car=null; }
    if(car){ const r=spawnCartelMember(c,nearestNode(car.pos.x,car.pos.z),{armed:'uzi'}); r.state='driving'; r.riding=car; car.riderNpc=r; car.hitSquad=c.id; car.police=false; car.shootT=1; toast(c.name+' motosikletli tetikçi gönderdi!'); return; } }
  const n=randomNodeNear(pp.x,pp.z,35,65); for(let i=0;i<3;i++){ const a=spawnCartelMember(c,n,{armed:pick(['uzi','ak47','mac10'])}); a.hunter=true; startFight(a); } toast(c.name+' peşinde: tetikçiler geliyor!');
}
function hitSquadStep(car,dt){
  const pp=Player.car?Player.car.pos:Player.pos; const r=car.riderNpc; if(!r||!r.alive){ car.chase=false; car.hitSquad=null; car.ai=true; setTrafficFromPose(car); return 0; }
  const d=dist2D(car.pos,pp); car.shootT-=dt;
  if(car.shootT<=0 && d<35 && hasLOS(car.pos.clone().setY(1.3),pp.clone().setY(1.2))){ car.shootT=0.7; npcShoot(r,WEAPONS[r.armed]||WEAPONS.uzi,0.4); }
  if(d>200){ car.chase=false; car.hitSquad=null; car.ai=true; setTrafficFromPose(car); return 0; }
  const desired=Math.atan2(pp.x-car.pos.x,pp.z-car.pos.z); car.heading=lerpAngle(car.heading,desired,Math.min(1,dt*2.6));
  return d>12?22:6;
}
function onCartelPedKilled(p,src){
  if(!p.cartel) return; const c=cartelById(p.cartel);
  if(src==='player'||src==='crew'||src==='hitman'){ if(p.boss){ addRep(c.id,-100); if(S.cartel===c.id) leaveCartel('patronu öldürdün'); toast(c.boss+' öldü: '+c.name+' artık düşmanın'); for(let i=0;i<8;i++) spawnPickup('money',p.pos.x+rand(-2,2),p.pos.z+rand(-2,2),true); }
    else { addRep(c.id,-10); for(const o of CARTELS) if(o.id!==c.id && S.cartel===o.id) addRep(o.id,3); if(S.rep[c.id]<=-40 && Math.random()<0.3) toast(c.name+' intikam yemini etti'); } }
}
function cartelInfo(){ return CARTELS.map(c=>c.name.split(' ')[0].slice(0,3)+' '+(S.rep[c.id]>0?'+':'')+(S.rep[c.id]||0)+(S.cartel===c.id?'★':'')).join(' · '); }
