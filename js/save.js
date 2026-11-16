// save.js — tarayıcıda kalıcı kayıt: envanter, para, konum, çete, araçlar, kuvvetler, hileler (localStorage)
var SAVE_KEY='sokakkrali_save_v1';
function saveGame(){
  if(S.dead||S.busted||(typeof MENU!=='undefined'&&!MENU.started)) return false;
  try{
    const ammo={}; for(const id in WEAPONS) if(Player.owned[id] && !WEAPONS[id].melee) ammo[id]=WEAPONS[id].cur;
    const d={ v:1, t:Date.now(), money:S.money, health:Player.health, armor:Player.armor, pos:[Player.pos.x,Player.pos.z], wid:Player.wid, owned:Object.keys(Player.owned), ammo,
      garage:S.garage, hate:S.hate, bribeP:S.bribePolice, bribeS:S.bribeSwat, crew:S.crew.length, allies:S.allies.map(a=>a.kind), hitmen:(S.hitmen||[]).length, rep:S.rep, cartel:S.cartel, dayTime:S.dayTime, fp:Player.fp, stats:S.stats,
      cfg:S.crewCfg, gang:S.gang, gangAlly:S.gangAlly, humanGangs:Object.keys(S.humanGangs||{}), look:S.look, cartelBonus:S.cartelBonus||0, repBonus:!!S.repBonus, feared:!!S.feared, maxArmor:Player.maxArmor||100, flags:{god:!!S.godMode,inf:!!S.infAmmo,noWanted:!!S.noWanted,superJump:!!S.superJump,speedFreak:!!S.speedFreak,noThugs:!!S.noThugs} };
    localStorage.setItem(SAVE_KEY,JSON.stringify(d)); return true;
  }catch(e){ return false; }
}
function loadGame(){
  let d; try{ const raw=localStorage.getItem(SAVE_KEY); if(!raw) return false; d=JSON.parse(raw); }catch(e){ return false; }
  try{
    S.money=d.money||S.money; Player.health=clamp(d.health||100,1,100); Player.armor=d.armor||0;
    if(d.pos && d.pos[0]>CITY.lo && d.pos[0]<CITY.hi && d.pos[1]>CITY.lo && d.pos[1]<CITY.hi){ Player.pos.set(d.pos[0],0,d.pos[1]); if(pointInObstacle(Player.pos.x,Player.pos.z,0.5)){ const n=nearestNode(Player.pos.x,Player.pos.z); Player.pos.set(n.x,0,n.z); } Player.mesh.position.copy(Player.pos); }
    for(const id of d.owned||[]) if(WEAPONS[id]) Player.owned[id]=true;
    for(const id in d.ammo||{}) if(WEAPONS[id]) WEAPONS[id].cur=d.ammo[id];
    if(d.wid && Player.owned[d.wid]) equip(d.wid);
    S.garage=(d.garage||[]).filter(t=>CAR_TYPES[t]); S.hate=d.hate||0; S.bribePolice=d.bribeP||0; S.bribeSwat=d.bribeS||0; if(d.dayTime!==undefined) S.dayTime=d.dayTime; Player.fp=!!d.fp; if(d.stats) S.stats=d.stats;
    const f=d.flags||{}; S.godMode=f.god; S.infAmmo=f.inf; S.noWanted=f.noWanted; S.superJump=f.superJump; S.speedFreak=f.speedFreak; S.noThugs=f.noThugs;
    if(d.look && S.look){ Object.assign(S.look,d.look); if(typeof rebuildPlayerMesh==='function') rebuildPlayerMesh(); }
    if(d.gang && d.gang.name){ S.gang=d.gang; if(typeof ensureGangForHuman==='function') ensureGangForHuman(d.gang.name); } S.gangAlly=d.gangAlly||{}; for(const nm of d.humanGangs||[]) if(typeof ensureGangForHuman==='function') ensureGangForHuman(nm);
    S.cartelBonus=d.cartelBonus||0; S.repBonus=!!d.repBonus; S.feared=!!d.feared; Player.maxArmor=d.maxArmor||100; if(d.stats){ S.stats.swatKills=S.stats.swatKills||0; S.stats.tanks=S.stats.tanks||0; }
    if(d.crew>0 && typeof spawnCrewMen==='function') spawnCrewMen(Math.min(typeof CREW_MAX!=='undefined'?CREW_MAX:75,d.crew));
    for(const kind of d.allies||[]) if(typeof spawnAllyVehicle==='function') spawnAllyVehicle(kind);
    for(let i=0;i<(d.hitmen||0);i++) if(typeof hireHitman==='function') hireHitman(true);
    if(d.rep) S.rep=Object.assign({north:0,east:0,west:0,center:0,south:0},d.rep); if(d.cartel){ S.cartel=d.cartel; }
    if(d.cfg && S.crewCfg){ Object.assign(S.crewCfg,d.cfg); S.crewCfg.hold=false; }
    S.weaponShowT=0; return true;
  }catch(e){ console.warn('kayıt yüklenemedi',e); return false; }
}
function resetSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} S.noSave=true; toast('Kayıt silindi, sayfayı yenile'); }
// TAM SIFIRLAMA: kayıt, para, silahlar, çete, ordu, suikastçılar, kartel, araçlar, hileler, aranma, nefret — her şey ilk güne döner
function fullReset(){
  try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
  if(Player.car) exitCar();
  for(const k in WEAPONS) WEAPONS[k].cur=WEAPONS[k].melee?Infinity:0; Player.owned={fist:true,glock:true}; WEAPONS.glock.cur=WEAPONS.glock.ammo; Player.lastIn={}; equip('glock');
  Player.health=Player.maxHealth; Player.armor=0; Player.fp=false; Player.hurtT=0; const hp=S.places.hospital; Player.pos.set(hp.x,0,hp.z+6); Player.mesh.position.copy(Player.pos);
  S.money=250; S.heat=0; S.wanted=0; S.lastCrime=-100; S.hate=0; S.bribePolice=0; S.bribeSwat=0; S.rep={north:0,east:0,west:0,center:0,south:0}; S.cartel=null; S.gang=null; S.gangAlly={}; S.cartelBonus=0; S.repBonus=false; S.feared=false; S.cartelPts=0; Player.maxArmor=100; for(const t of S.enemyTanks||[]) S.scene.remove(t.mesh); S.enemyTanks=[]; S.invite=null; S.bossMission=null; S.bossEvent=null; S.lastTerritory=null; S.waypoint=null; if(S.wpBeacon) S.wpBeacon.visible=false;
  S.godMode=false; S.infAmmo=false; S.noWanted=false; S.superJump=false; S.speedFreak=false; S.noThugs=false; S.slowCheat=false; S.slow=1; S.fastClock=false; S.dayTime=0.3; S.stats={kills:0,copKills:0,swatKills:0,tanks:0};
  if(typeof abortMission==='function') abortMission(); if(typeof clearObjective==='function') clearObjective();
  // insanlar: çete, patron, korumalar, kartel üyeleri, sürücüler; polisler
  for(let i=S.peds.length-1;i>=0;i--){ const p=S.peds[i]; if(p.state==='crew'||p.boss||p.guardOf||p.cartel||p.riding||p.mission||p.vip||p.state==='mechanic'||p.state==='driving'){ S.scene.remove(p.mesh); S.peds.splice(i,1); } }
  S.crew=[]; S.boss=null; S.vip=null; S.mechanic=null; delete S.places.boss;
  for(const c of S.cops) S.scene.remove(c.mesh); S.cops.length=0;
  // kuvvetler, helikopterler, suikastçılar
  for(const a of S.allies){ if(a.kind==='heli'){ removeHeliUnit(a); S.allyHeli=null; } else if(a.kind!=='policecar'){ S.scene.remove(a.mesh); } } S.allies=[]; S.allyHeli=null;
  if(S.heli) removeHeli();
  for(const h of S.hitmen) S.scene.remove(h.mesh); S.hitmen=[];
  // araçlar: sahip olunanlar, şoförlü, dost, baskın, polis takibi
  for(let i=S.cars.length-1;i>=0;i--){ const c=S.cars[i]; if(c.owned||c.ally||c.hitSquad||c.mission||c.chase||c.driverNpc||c.mechanic) removeCarAt(i); }
  S.garage=[]; S.projectiles.forEach(p=>S.scene.remove(p.mesh)); S.projectiles=[]; S.fires=[];
  S.weaponShowT=0; S.cheatBuf=''; saveGame();
  if(typeof flashMessage==='function') flashMessage('HER ŞEY SIFIRLANDI','İlk gün: 250 $, yumruk ve Glock 17. Kayıt temizlendi.',false); playTone(180,1.0,0.25,'sawtooth',40);
}
function autosave(dt){ if(S.noSave) return; S.saveT=(S.saveT||0)-dt; if(S.saveT<=0){ S.saveT=8; saveGame(); } }
window.addEventListener('beforeunload',()=>{ if(!S.noSave) saveGame(); });
document.addEventListener('visibilitychange',()=>{ if(document.hidden && !S.noSave) saveGame(); });
