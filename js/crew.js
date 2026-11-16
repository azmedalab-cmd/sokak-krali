// crew.js — teslim olma, çeteye alma (G), koruma yapay zekâsı, rüşvetli polis muhafızları, nefret sistemi, çete savaşı
S.crew=[]; S.hate=0; S.bribePolice=0; S.bribeSwat=0;
function getHostiles(){
  const out=[];
  if(S.wanted>0) for(const c of S.cops) if(c.alive && c.state==='hunt') out.push({pos:c.pos,type:'cop',ref:c});
  for(const p of S.peds) if(p.alive && p.state==='fight') out.push({pos:p.pos,type:'ped',ref:p});
  if(S.heli && S.heli.alive) out.push({pos:S.heli.pos,type:'heli',ref:S.heli});
  for(const t of S.enemyTanks||[]) if(t.alive) out.push({pos:t.pos,type:'etank',ref:t});
  for(const c of S.cars) if(c.police && c.chase && !c.dead) out.push({pos:c.pos,type:'car',ref:c});
  if(typeof crewExtraHostiles==='function'){ if(S._exhT!==S.time){ S._exhT=S.time; S._exh=crewExtraHostiles(); } for(const h of S._exh) if(!out.some(o=>o.ref===h.ref)) out.push(h); }
  return out;
}
function nearestHostile(pos,maxD){ let best=null,bd=maxD; for(const h of getHostiles()){ const d=dist2D(h.pos,pos); if(d<bd){bd=d;best=h;} } return best; }
// Dost birimin (çete üyesi, muhafız) düşmana ateşi
function shootEntity(e,w,t,acc){
  const muzzle=new THREE.Vector3(); e.mesh.userData.muzzle.getWorldPosition(muzzle);
  const d=dist2D(e.pos,t.pos); const hit=Math.random()<clamp((acc||0.6)-d/70,0.1,acc||0.6);
  const tgt=t.pos.clone(); if(t.type!=='heli') tgt.y=1.1; if(!hit){ tgt.x+=rand(-2,2); tgt.y+=rand(-0.5,1.2); tgt.z+=rand(-2,2); }
  addTracer(muzzle,tgt); addFlash(muzzle); playWeaponSound(w,clamp(1-d/60,0.15,0.6)); addParticles(tgt,0xaaaaaa,1);
  if(hit){ if(t.type==='cop'){ damageCop(t.ref,w.dmg*0.8,'crew'); addBloodHit(tgt); } else if(t.type==='ped'){ damagePed(t.ref,w.dmg*0.8,'crew'); addBloodHit(tgt); } else if(t.type==='heli') damageHeli(w.dmg); else if(t.type==='etank') damageEnemyTank(t.ref,w.dmg*0.12,'crew'); else if(t.type==='car') damageCar(t.ref,w.dmg*0.2,'crew'); }
}
// Oyuncu silahla nişan alınca ortadaki yayayı teslim olmaya zorla
function updateAimTarget(){
  _rc.setFromCamera({x:0,y:0},S.camera); const ray=_rc.ray; let best=null,bs=1e9;
  for(const p of S.peds){
    if(!p.alive || p.state==='crew' || p.state==='fight' || p.state==='mechanic') continue;
    const d=dist2D(p.pos,Player.pos); if(d>16 || d<0.5) continue;
    const chest=p.pos.clone().setY(1.2); if(ray.direction.dot(chest.clone().sub(ray.origin))<0) continue;
    const rd=ray.distanceToPoint(chest), tol=0.7+d*0.08; if(rd<tol && rd/tol<bs && hasLOS(Player.pos.clone().setY(1.5),chest)){ bs=rd/tol; best=p; }
  }
  if(best){ const p=best; if(p.state!=='surrender'){ p.state='surrender'; if(p.sayT<=0){ pedSay(p,pick(['Vurma! Ne istiyorsan al!','Tamam tamam, ellerim yukarıda!','Lütfen yapma!'])); p.sayT=6; } } p.surrenderT=3; S.aimedPed=p; return; }
  S.aimedPed=null;
}
// Baktığın hedef (nişan almadan da): suikastçı ve bilgi için
function updateLookTarget(){
  if(Player.car){ S.lookTarget=null; return; }
  _rc.setFromCamera({x:0,y:0},S.camera); const ray=_rc.ray; let best=null,bs=1e9;
  const cand=S.peds.filter(p=>p.alive&&p.state!=='crew'&&p.state!=='mechanic').map(p=>({type:'ped',ref:p,pos:p.pos})).concat(S.cops.filter(c=>c.alive&&!c.loyal).map(c=>({type:'cop',ref:c,pos:c.pos})));
  for(const t of cand){ const d=dist2D(t.pos,Player.pos); if(d>30||d<0.5) continue; const chest=t.pos.clone().setY(1.2); if(ray.direction.dot(chest.clone().sub(ray.origin))<0) continue; const rd=ray.distanceToPoint(chest), tol=0.6+d*0.07; if(rd<tol && rd/tol<bs){ bs=rd/tol; best=t; } }
  S.lookTarget=best;
}
// Gasp (T): teslim olmuş kişiden para al
function tryRob(){
  const p=S.aimedPed;
  if(!p||!p.alive||p.state!=='surrender'){ toast('Önce birine silahla nişan al (sağ tık), sonra T'); return; }
  if(p.robbed){ pedSay(p,pick(['Hiç param kalmadı!','Zaten her şeyimi aldın!'])); return; }
  const amt=Math.round((p.vip?p.vip.money*0.5:(p.gang?randi(60,400):randi(10,220)))/(S.diff||1)); S.money+=amt; p.robbed=true;
  pedSay(p,pick(['Al, al, hepsi bu!','Lütfen vurma, işte param!','Çoluk çocuğum var...','Tamam tamam, cüzdanım senin!']));
  toast('+$'+amt+' gasp edildi'); playTone(880,0.12,0.2,'square',1320); addHate(p.vip?0.4:0.2); if(copNear(40)) crime('steal');
  if(p.vip) vipAlarm(p);
  if(p.armed && Math.random()<0.5){ spawnPickup('weapon',p.pos.x+rand(-1,1),p.pos.z+rand(-1,1),true,p.armed); p.armed=null; setHumanWeapon(p.mesh,null); toast('Silahını da bıraktı'); }
  p.state='walk'; p.surrenderT=0; startFlee(p,Player.pos,8); S.aimedPed=null;
}
function tryRecruit(){
  const p=S.aimedPed;
  if(!p||!p.alive||p.state!=='surrender'){ toast('Önce birine silahla nişan al (sağ tık), sonra G'); return; }
  if(S.crew.length>=CREW_MAX){ toast('Çete dolu (en fazla '+CREW_MAX+')'); return; }
  const fee=(S.diff||1)>1?150*S.diff:0; if(fee && S.money<fee){ toast('Katılım ücreti $'+fee+' — paran yetmiyor'); return; }
  if(Math.random()<0.75){
    if(fee) S.money-=fee; p.state='crew'; p.gang=true; p.angry=false; p.armed=(S.crewCfg&&S.crewCfg.weapon!=='mixed')?S.crewCfg.weapon:'mp5'; setHumanWeapon(p.mesh,p.armed); p.health=(S.crewCfg&&S.crewCfg.armor)?180:100; p.shootT=0.5; S.crew.push(p);
    if(typeof crewJoinLook==='function') crewJoinLook(p); else p.mesh.userData.torso.material=matLambert(0x2d7a4f);
    pedSay(p,pick(['Tamam, seninleyim patron.','Varım. Nereye gidiyoruz?','Ben de bıkmıştım bu hayattan, varım.'])); toast('Çeteye katıldı! Çete: '+S.crew.length); playTone(700,0.15,0.15,'square',1000);
  } else { p.state='walk'; p.surrenderT=0; pedSay(p,pick(['Hayır! Beni rahat bırak!','Asla! Polis! Polis!','Deli misin, çekil!'])); startFlee(p,Player.pos,6); }
  S.aimedPed=null;
}
function followSlot(idx,r){ const pp=Player.car?Player.car.pos:Player.pos; const ring=Math.floor(idx/8), a=(idx%8)/8*Math.PI*2+ring*0.4+S.time*0.05; const rr=r+ring*2.4; return {x:pp.x+Math.cos(a)*rr, z:pp.z+Math.sin(a)*rr}; }
// Kaldırım takibi: yaya çete üyeleri diğer NPC'ler gibi kaldırım düğüm ağında yürür, oyuncuya en yakın kaldırım noktasına gelir, yakınsa bekler
function sidewalkFollow(e,dt,idx){
  const pp=Player.car?Player.car.pos:Player.pos; let d=dist2D(e.pos,pp);
  if(d>80){ const n=randomNodeNear(pp.x,pp.z,4,12); e.pos.set(n.x,0,n.z); e.wnode=n; e.wtarget=n; e.wprev=null; collideWorld(e.pos,0.3); d=dist2D(e.pos,pp); }
  if(!e.woff) e.woff={x:rand(-0.9,0.9),z:rand(-0.9,0.9),stop:4+(idx%6)*1.1};
  if(d>30){ e.stuckT=(e.stuckT||0)+dt; if(e.bestD===undefined||d<e.bestD-2){ e.bestD=d; e.stuckT=0; } if(e.stuckT>10){ const n=randomNodeNear(pp.x,pp.z,6,16); e.pos.set(n.x,0,n.z); e.wnode=n; e.wtarget=n; e.wprev=null; e.stuckT=0; e.bestD=undefined; d=dist2D(e.pos,pp); } } else { e.stuckT=0; e.bestD=undefined; }
  if(!e.wtarget || dist2D(e.pos,e.wtarget)>14){ e.wnode=nearestNode(e.pos.x,e.pos.z); e.wtarget=e.wnode; e.wprev=null; }
  if(S._crewGoalT!==S.time){ S._crewGoalT=S.time; S._crewGoal=nearestNode(pp.x,pp.z); } const goal=S._crewGoal;
  // kaldırımın sonuna (oyuncuya en yakın düğüme) varınca oyuncu kaldırım dışındaysa doğrudan yanına yürür; oyuncu başka düğüme geçince yeniden kaldırımdan yol alır
  if(e.wGoal!==goal){ e.wArrived=false; e.wGoal=goal; if(!e.wtarget || dist2D(e.pos,e.wtarget)>14){ e.wnode=nearestNode(e.pos.x,e.pos.z); e.wtarget=e.wnode; e.wprev=null; } e.wL=undefined; }
  if(!e.wArrived && d<22 && dist2D(pp,goal)<3.5 && hasLOS(e.pos.clone().setY(1.2),pp.clone().setY(1.2))) e.wArrived=true; // oyuncu kaldırımdaysa ve yakınsa (karşı kaldırım dahil) doğrudan yanına gel
  if(e.wArrived){ if(d>e.woff.stop+1.5){ const ddx=pp.x-e.pos.x, ddz=pp.z-e.pos.z, LL=Math.hypot(ddx,ddz)||1; e.pos.x+=ddx/LL*2.2*dt; e.pos.z+=ddz/LL*2.2*dt; e.facing=lerpAngle(e.facing,Math.atan2(ddx,ddz),Math.min(1,dt*8)); if(collideWorld(e.pos,0.3)){ e.pos.x+=-ddz/LL*2*dt; e.pos.z+=ddx/LL*2*dt; } return {spd:2.2}; } e.facing=lerpAngle(e.facing,Math.atan2(pp.x-e.pos.x,pp.z-e.pos.z),Math.min(1,dt*3)); return {spd:0}; }
  const moving=Player.car?Math.abs(Player.car.speed)>1.5:Player.moving;
  if(d<e.woff.stop && (!moving || d<2.5)){ e.facing=lerpAngle(e.facing,Math.atan2(pp.x-e.pos.x,pp.z-e.pos.z),Math.min(1,dt*3)); return {spd:0}; }
  const t=e.wtarget; const tx=t.x+e.woff.x, tz=t.z+e.woff.z; const dx=tx-e.pos.x, dz=tz-e.pos.z, L=Math.hypot(dx,dz);
  // ilerleme kontrolü: 2 sn boyunca hedefe yaklaşamıyorsa ofseti sıfırla ve düğümü yenile; 6 sn sürerse oyuncunun yanına ışınla
  if(e.wL===undefined || L<e.wL-0.05){ e.wL=L; e.wStuck=0; } else { e.wStuck=(e.wStuck||0)+dt; if(e.wStuck>2){ e.woff.x=0; e.woff.z=0; e.wnode=nearestNode(e.pos.x,e.pos.z); e.wtarget=e.wnode; e.wprev=null; e.wL=undefined; if(e.wStuck>6){ const n=randomNodeNear(pp.x,pp.z,5,14); e.pos.set(n.x,0,n.z); e.wnode=n; e.wtarget=n; e.wStuck=0; } return {spd:0}; } }
  if(L<1.2){ e.wL=undefined; if(t===goal){ e.wArrived=true; return {spd:0}; } let best=null,bd=1e9; for(const n of t.nb){ const dd=dist2D(n,goal)+(n===e.wprev?6:0); if(dd<bd){ bd=dd; best=n; } } e.wprev=e.wnode; e.wnode=t; e.wtarget=best||t; e.wL=undefined; return {spd:0}; }
  const spd=d>26?8:(d>16?5.5:(d>8?3.2:2.0)); e.pos.x+=dx/L*spd*dt; e.pos.z+=dz/L*spd*dt; e.facing=lerpAngle(e.facing,Math.atan2(dx,dz),Math.min(1,dt*8));
  if(collideWorld(e.pos,0.3)){ e.pos.x+=-dz/L*spd*dt; e.pos.z+=dx/L*spd*dt; }
  return {spd};
}
function allyStep(e,dt,idx,radius,runSpd,acc,hold,sidewalk){
  const pp=Player.car?Player.car.pos:Player.pos; const w=WEAPONS[e.armed];
  let host=nearestHostile(e.pos,40); if(host && host.passive && dist2D(e.pos,host.pos)>30) host=null;
  if(host && !S.dead && hasLOS(e.pos.clone().setY(1.5), host.pos.clone().setY(host.type==='heli'?host.pos.y:1.2))){
    e.facing=Math.atan2(host.pos.x-e.pos.x,host.pos.z-e.pos.z)+aimOff(e.mesh); let spd=0;
    if(e.type==='ped' && (e.sayT||0)<=0 && Math.random()<dt*0.25){ pedSay(e,pick(['Patron, arkandayız!','Vur şunu!','Sağ tarafta düşman!','Bunlar bizim bölgeye giremez!','Kapak olsun!'])); e.sayT=12; }
    const d=dist2D(e.pos,host.pos);
    if(d>22 && host.type!=='heli' && !host.passive){ const dir=new THREE.Vector3(host.pos.x-e.pos.x,0,host.pos.z-e.pos.z).normalize(); e.pos.addScaledVector(dir,4*dt); spd=4; }
    e.shootT-=dt; if(e.shootT<=0){ e.shootT=w.auto?0.28:0.8; shootEntity(e,w,host,acc); }
    collideWorld(e.pos,0.3); return {spd,aim:true};
  }
  if(hold){ e.facing=lerpAngle(e.facing,Math.atan2(pp.x-e.pos.x,pp.z-e.pos.z),Math.min(1,dt*4)); return {spd:0}; }
  if(sidewalk) return sidewalkFollow(e,dt,idx);
  if(dist2D(e.pos,pp)>75){ e.pos.set(pp.x+rand(-5,5),0,pp.z+rand(-5,5)); collideWorld(e.pos,0.3); }
  const slot=followSlot(idx,radius); const d=dist2D(e.pos,slot);
  if(d>1.5){ const spd=d>9?runSpd:3; const dir=new THREE.Vector3(slot.x-e.pos.x,0,slot.z-e.pos.z).normalize(); e.pos.addScaledVector(dir,spd*dt); e.facing=lerpAngle(e.facing,Math.atan2(dir.x,dir.z),Math.min(1,dt*8)); if(collideWorld(e.pos,0.3)){ e.pos.x+=-dir.z*spd*dt; e.pos.z+=dir.x*spd*dt; } return {spd}; }
  e.facing=lerpAngle(e.facing,Math.atan2(pp.x-e.pos.x,pp.z-e.pos.z),Math.min(1,dt*4)); return {spd:0};
}
function updateCrewMember(p,dt){
  if(p.riding){ p.pos.copy(p.riding.pos); if(!p.riding.dead && !S.dead && p.armed && WEAPONS[p.armed] && !WEAPONS[p.armed].melee){ const host=nearestHostile(p.pos,38); if(host && dist2D(host.pos,p.pos)>3){ p.shootT-=dt; if(p.shootT<=0){ p.shootT=WEAPONS[p.armed].auto?0.35:0.9; shootEntity(p,WEAPONS[p.armed],host,0.4); } } } return {spd:0}; }
  return allyStep(p,dt,S.crew.indexOf(p),3.2,7,0.6,!!(S.crewCfg&&S.crewCfg.hold),!(S.crewCfg&&S.crewCfg.walk==='escort'));
}
function updateGuard(c,dt){ return allyStep(c,dt,S.cops.filter(x=>x.loyal&&x.alive).indexOf(c)+4,5,6,c.swat?0.75:0.6); }
function addHate(n){ S.hate=Math.min(5.95,S.hate+n); }
function updateCrewSystem(dt){
  S.crew=S.crew.filter(p=>p.alive && p.state==='crew');
  S.hate=Math.max(0,S.hate-dt*0.006);
  const pp=Player.car?Player.car.pos:Player.pos;
  if(S.crew.length>=3 && !S.dead && !S.feared) for(const p of S.peds){ if(p.alive && p.gang && p.state!=='crew' && p.state!=='fight' && p.armed && !(p.gangId&&S.gangAlly[p.gangId]) && dist2D(p.pos,pp)<15 && hasLOS(p.pos.clone().setY(1.5),pp.clone().setY(1.2))){ startFight(p); if(p.sayT<=0){ pedSay(p,'Bu bizim bölgemiz! Saldırın!'); p.sayT=6; } } }
  S.guardT=(S.guardT||0)-dt;
  if(S.guardT<=0 && !S.dead && !S.busted){ S.guardT=3;
    const wantP=Math.round(S.bribePolice/25), wantS=Math.round(S.bribeSwat/25);
    const haveP=S.cops.filter(c=>c.alive&&c.loyal&&!c.swat).length, haveS=S.cops.filter(c=>c.alive&&c.loyal&&c.swat).length;
    if(haveP<wantP){ const n=randomNodeNear(pp.x,pp.z,12,35); spawnCop(n.x,n.z,{loyal:true,swat:false}); }
    if(haveS<wantS){ const n=randomNodeNear(pp.x,pp.z,12,35); spawnCop(n.x,n.z,{loyal:true,swat:true}); }
  }
}
