// main.js — efektler, toplanabilirler, aranma sistemi, HUD, mini harita, oyun döngüsü
var _sph=null;
function sph(){ if(!_sph) _sph=new THREE.SphereGeometry(1,6,4); return _sph; }
function addTracer(a,b){ const geo=new THREE.BufferGeometry().setFromPoints([a,b]); const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xffe08a,transparent:true,opacity:0.95})); S.scene.add(l); S.effects.push({obj:l,t:0,life:0.07,kind:'tracer'}); }
function addFlash(p){ const m=new THREE.Mesh(sph(),new THREE.MeshBasicMaterial({color:0xffcc55,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending})); m.scale.set(0.25,0.25,0.5); m.position.copy(p); S.scene.add(m); S.effects.push({obj:m,t:0,life:0.05,kind:'flash'});
  if(!S.flashLight){ S.flashLight=new THREE.PointLight(0xffc060,0,12,2); S.scene.add(S.flashLight); } S.flashLight.position.copy(p); S.flashLight.intensity=3; }
function addShell(p){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.02,0.05),new THREE.MeshBasicMaterial({color:0xd4b05a})); m.position.copy(p); S.scene.add(m); const r=camRight(); S.effects.push({obj:m,t:0,life:1.0,kind:'part',vel:new THREE.Vector3(r.x*2+rand(-0.5,0.5),rand(2,3.5),r.z*2+rand(-0.5,0.5))}); }
function attachHeadlight(car){ if(!S.headlight){ S.headlight=new THREE.SpotLight(0xfff2c8,0,70,0.55,0.4,1); S.headlight.position.set(0,1.0,1.6); } car.mesh.add(S.headlight); car.mesh.add(S.headlight.target); S.headlight.target.position.set(0,0.2,40); }
function detachHeadlight(){ if(S.headlight&&S.headlight.parent){ S.headlight.parent.remove(S.headlight.target); S.headlight.parent.remove(S.headlight); } }
function addParticles(p,color,n,big){ for(let i=0;i<n;i++){ const m=new THREE.Mesh(sph(),new THREE.MeshBasicMaterial({color})); m.scale.setScalar(big?rand(0.2,0.5):0.08); m.position.copy(p); S.scene.add(m); S.effects.push({obj:m,t:0,life:big?1.0:0.6,kind:'part',vel:new THREE.Vector3(rand(-3,3),rand(2,6),rand(-3,3)).multiplyScalar(big?2:1)}); } }
function addFlame(p,vel,life){ const m=new THREE.Mesh(sph(),new THREE.MeshBasicMaterial({color:Math.random()<0.5?0xff7a1a:0xffc040,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false})); m.scale.setScalar(rand(0.15,0.3)); m.position.copy(p); S.scene.add(m); S.effects.push({obj:m,t:0,life:life||0.5,kind:'flame',vel}); }
var _bloodGeo=null;
function bloodDecal(x,z,size,life){ if(!_bloodGeo) _bloodGeo=new THREE.CircleGeometry(1,12); const m=new THREE.Mesh(_bloodGeo,new THREE.MeshBasicMaterial({color:Math.random()<0.5?0x5a0a0a:0x6e0f0f,transparent:true,opacity:0.85,depthWrite:false})); m.rotation.x=-Math.PI/2; m.rotation.z=rand(0,6); m.position.set(x,0.27+Math.random()*0.01,z); m.scale.set(size*rand(0.8,1.2),size*rand(0.6,1.1),1); S.scene.add(m); S.effects.push({obj:m,t:0,life:life||30,kind:'blood'}); }
function addBlood(p,big){ const n=big?4:2; bloodDecal(p.x+rand(-0.3,0.3),p.z+rand(-0.3,0.3),big?1.6:1.0,40); for(let i=0;i<n*3;i++) bloodDecal(p.x+rand(-2,2)*(big?1.5:1),p.z+rand(-2,2)*(big?1.5:1),rand(0.12,0.35),30); for(let i=0;i<(big?34:16);i++){ const m=new THREE.Mesh(sph(),new THREE.MeshBasicMaterial({color:0x8a0f0f})); m.scale.setScalar(rand(0.04,0.1)); m.position.copy(p).setY(1); S.scene.add(m); S.effects.push({obj:m,t:0,life:0.8,kind:'part',vel:new THREE.Vector3(rand(-3,3),rand(1,5),rand(-3,3)).multiplyScalar(big?1.6:1)}); } }
function addBloodHit(p){ for(let i=0;i<7;i++){ const m=new THREE.Mesh(sph(),new THREE.MeshBasicMaterial({color:Math.random()<0.5?0x9a1212:0x6e0a0a})); m.scale.setScalar(rand(0.03,0.08)); m.position.copy(p); S.scene.add(m); S.effects.push({obj:m,t:0,life:0.6,kind:'part',vel:new THREE.Vector3(rand(-2.5,2.5),rand(0.5,3),rand(-2.5,2.5))}); } if(Math.random()<0.6) bloodDecal(p.x+rand(-0.5,0.5),p.z+rand(-0.5,0.5),rand(0.1,0.25),20); }
function addSmoke(p){ const m=new THREE.Mesh(sph(),new THREE.MeshLambertMaterial({color:0x222222,transparent:true,opacity:0.5})); m.scale.setScalar(0.4); m.position.copy(p); S.scene.add(m); S.effects.push({obj:m,t:0,life:1.3,kind:'smoke',vel:new THREE.Vector3(rand(-0.3,0.3),2,rand(-0.3,0.3))}); }
function addExplosion(p){
  const m=new THREE.Mesh(sph(),new THREE.MeshBasicMaterial({color:0xff7a1a,transparent:true,opacity:0.95})); m.position.copy(p); S.scene.add(m); S.effects.push({obj:m,t:0,life:0.55,kind:'fire'});
  addParticles(p,0xffb03a,22,true); for(let i=0;i<10;i++) addSmoke(p.clone().add(new THREE.Vector3(rand(-1.5,1.5),rand(0,2),rand(-1.5,1.5))));
  panicPeds(p,35);
}
function updateEffects(dt){
  if(S.flashLight) S.flashLight.intensity=Math.max(0,S.flashLight.intensity-dt*40);
  for(let i=S.effects.length-1;i>=0;i--){
    const e=S.effects[i]; e.t+=dt; const k=e.t/e.life;
    if(e.kind==='part'){ e.obj.position.addScaledVector(e.vel,dt); e.vel.y-=12*dt; if(e.obj.position.y<0.05) e.obj.position.y=0.05; }
    else if(e.kind==='smoke'){ e.obj.position.addScaledVector(e.vel,dt); e.obj.scale.addScalar(dt*1.6); e.obj.material.opacity=0.5*(1-k); }
    else if(e.kind==='blood'){ if(e.t<1.2) e.obj.scale.addScalar(dt*0.6); e.obj.material.opacity=e.t>20?0.85*(1-(e.t-20)/10):0.85; }
    else if(e.kind==='flame'){ e.obj.position.addScaledVector(e.vel,dt); e.vel.y+=3*dt; e.vel.multiplyScalar(1-dt*2); e.obj.scale.addScalar(dt*1.2); e.obj.material.opacity=0.9*(1-k); }
    else if(e.kind==='fire'){ e.obj.scale.setScalar(1+k*7); e.obj.material.opacity=0.95*(1-k); }
    else if(e.kind==='tracer'){ e.obj.material.opacity=1-k; }
    if(e.t>=e.life){ S.scene.remove(e.obj); if(e.kind==='tracer') e.obj.geometry.dispose(); e.obj.material.dispose(); S.effects.splice(i,1); }
  }
}

// ---- Toplanabilirler ----
var PICKUP_COLORS={ health:'#ff4040', ammo:'#c8a84a', money:'#3bff6b', armor:'#3b8bff', weapon:'#ffffff' };
var STREET_WEAPONS=['knife','bat','uzi','pump','deagle','mp5','ak47','revolver','tec9','machete','sawed','m4','knuckles','hammer','crowbar','axe','beretta','usp','mac10','skorpion','ump45','huntsg','ksg','galil','sks','famas','mosin','grenade','molotov','chainsaw','sword','fiveseven'];
function spawnPickup(type,x,z,temp,wid){
  const m=makePickupMesh(type,wid); m.position.set(x,0.6,z); m.rotation.y=rand(0,3); S.scene.add(m);
  S.pickups.push({type,wid,mesh:m,x,z,temp:!!temp,taken:false,respawn:0,seed:rand(0,6),life:0});
}
function initPickups(){ for(let i=0;i<40;i++){ const n=pick(S.nodes); const r=Math.random(); const t=r<0.26?'health':r<0.5?'ammo':r<0.72?'money':r<0.84?'armor':'weapon'; spawnPickup(t, n.x+rand(-1,1), n.z+rand(-1,1), false, t==='weapon'?pick(STREET_WEAPONS):undefined); } }
function updatePickups(dt){
  const pp=Player.car?Player.car.pos:Player.pos, reach=Player.car?2.8:1.5;
  for(let i=S.pickups.length-1;i>=0;i--){
    const p=S.pickups[i];
    if(p.taken){ p.respawn-=dt; if(p.respawn<=0){ p.taken=false; p.mesh.visible=true; } continue; }
    if(p.temp){ p.life+=dt; if(p.life>75){ S.scene.remove(p.mesh); S.pickups.splice(i,1); continue; } }
    p.mesh.rotation.y+=dt*1.6; p.mesh.position.y=0.6+Math.sin(S.time*3+p.seed)*0.12;
    if(dist2D(p.mesh.position,pp)<reach && !S.dead && !S.busted){
      if(p.type==='health'){ Player.health=Math.min(Player.maxHealth,Player.health+50); toast('Sağlık +50'); }
      else if(p.type==='ammo'){ let n=0; for(const id in WEAPONS){ const w=WEAPONS[id]; if(Player.owned[id] && !w.melee){ w.cur+=Math.ceil(w.pack/2); n++; } } toast(n?'Mühimmat alındı':'Mermi: silahın yok'); }
      else if(p.type==='armor'){ Player.armor=Math.min(Player.maxArmor||100,Player.armor+50); toast('Zırh +50'); }
      else if(p.type==='weapon'){ giveWeapon(p.wid, p.temp?Math.ceil(WEAPONS[p.wid].ammo*0.5):undefined); }
      else { const a=reward(randi(20,90)); S.money+=a; toast('+$'+a); }
      playTone(880,0.12,0.2,'square',1320);
      if(p.temp){ S.scene.remove(p.mesh); S.pickups.splice(i,1); }
      else { p.taken=true; p.respawn=60; p.mesh.visible=false; }
    }
  }
}

// ---- Suç ve aranma yıldızları ----
function crime(kind){
  if(S.noWanted) return;
  const add={murder:S.heat<1?1:0.5, copKill:1.2, shot:0.25, shotNearCop:0.4, steal:0.6}[kind]||0;
  S.heat=Math.min(5.95,S.heat+add); S.lastCrime=S.time; updateWanted();
}
function updateWanted(){ const w=Math.min(5,Math.floor(S.heat)); if(w>S.wanted) playTone(1200,0.25,0.15,'square',600); S.wanted=w; }
function wantedDecay(dt){
  if(S.time-S.lastCrime<7 || S.heat<=0) return;
  const hidden=!copNear(70); S.heat=Math.max(0,S.heat-dt*(hidden?0.11:0.035)); updateWanted();
}

// ---- Ölüm / tutuklanma ----
function bigMessage(t,sub){ const o=document.getElementById('overlay2'); o.hidden=false; o.classList.remove('ok'); o.querySelector('h2').textContent=t; o.querySelector('p').textContent=sub; S.flashT=0; }
function abortMission(){ const m=S.mission; if(!m) return; if(m.car) m.car.mission=false; if(m.ped) m.ped.mission=false; clearObjective(); S.mission=null; }
function playerDie(){
  S.dead=true; Player.deadT=0; if(Player.car) exitCar(); Player.mesh.visible=true; abortMission();
  S.slow=0.3; document.getElementById('game').classList.add('wasted');
  bigMessage('ÖLDÜN','Hastanede uyanıyorsun...'); playTone(220,1.4,0.3,'sawtooth',50);
  setTimeout(()=>respawn('hospital'),4000);
}
function playerBusted(){
  if(S.dead||S.busted) return; S.busted=true; S.keys={}; abortMission();
  S.slow=0.4; document.getElementById('game').classList.add('wasted');
  bigMessage('TUTUKLANDIN','Rüşvet verip serbest kalıyorsun...'); playTone(500,0.5,0.2,'square',300);
  setTimeout(()=>respawn('police'),4000);
}
function respawn(where){
  const pl=S.places[where]||S.places.hospital; Player.pos.set(pl.x,0,pl.z); Player.vy=0;
  Player.mesh.rotation.x=0; Player.mesh.position.copy(Player.pos); Player.health=Player.maxHealth; Player.hurtT=0; Player.armor=0;
  S.money=Math.max(0,Math.floor(S.money*(S.diff>1?0.7:0.85))-(S.diff>1?500*S.diff:0)); S.heat=0; S.wanted=0; S.lastCrime=-100; S.slow=1; document.getElementById('game').classList.remove('wasted');
  for(const c of S.cops) S.scene.remove(c.mesh); S.cops.length=0;
  for(const c of S.cars) if(c.chase){ c.chase=false; c.ai=true; setTrafficFromPose(c); }
  if(S.heli) removeHeli();
  S.dead=false; S.busted=false; document.getElementById('overlay2').hidden=true;
}

// ---- HUD ----
var H={};
function drawWeaponIcon(cv,id){
  const g=cv.getContext('2d'); g.clearRect(0,0,cv.width,cv.height); const w=WEAPONS[id]; const p=(typeof GUN_PARAMS!=='undefined')?GUN_PARAMS[id]:null;
  g.save(); g.translate(cv.width/2,cv.height/2); g.fillStyle='#f2efe6';
  if(!p){ if(w.cat==='thrown'){ g.beginPath(); g.arc(0,3,10,0,Math.PI*2); g.fill(); g.fillRect(-3,-15,6,7); } else { g.rotate(-0.55); g.fillRect(-30,-3,60,6); g.fillRect(16,-7,14,14); } g.restore(); return; }
  const stockL=(p.stock==='wood'||p.stock==='metal')?0.3:(p.stock==='folded'?0.22:0); const total=stockL+p.recv[2]+p.barrel[1]+(p.suppressor?0.16:0); const k=84/Math.max(0.3,total);
  const x0=-42+stockL*k, rh=Math.max(6,p.recv[1]*k*0.9), rl=p.recv[2]*k;
  if(stockL) g.fillRect(-42,-rh*0.3,stockL*k+2,p.stock==='folded'?3:rh*0.6);
  g.fillRect(x0,-rh/2,rl,rh);
  const bx=x0+rl, bl=(p.barrel[1]+(p.suppressor?0.16:0))*k; g.fillRect(bx,-rh/2+1,bl,p.suppressor?5:Math.max(2,p.barrel[0]*k*2));
  if(p.guard) g.fillRect(bx,-rh/2,Math.min(bl,(p.guardLen||0.18)*k),rh*0.7);
  g.fillRect(x0+rl*0.12,rh/2,Math.max(4,rl*0.16),rh*0.9);
  if(p.mag) g.fillRect(x0+rl*0.5,rh/2,Math.max(4,p.mag[2]*k),Math.min(16,p.mag[1]*k*0.8));
  if(p.drum){ g.beginPath(); g.arc(x0+rl*0.6,rh/2+4,6,0,Math.PI*2); g.fill(); }
  if(p.scope) g.fillRect(x0+rl*0.2,-rh/2-5,rl*0.6,4);
  if(p.cylinder){ g.beginPath(); g.arc(x0+rl*0.5,0,rh*0.6,0,Math.PI*2); g.fill(); }
  g.restore();
}
function toast(t){ const d=document.createElement('div'); d.className='toast'; d.textContent=t; H.toasts.appendChild(d); setTimeout(()=>d.remove(),2200); }
function updateHUD(){
  const w=WEAPONS[Player.wid], evading=S.wanted>0 && S.time-S.lastCrime>7 && (Math.floor(S.time*2)%2===0);
  for(let i=0;i<5;i++){ H.stars[i].classList.toggle('on',i<S.wanted && !evading); H.stars[i].classList.toggle('dim',i<S.wanted && evading); }
  H.money.textContent='$'+S.money; H.wcat.textContent=(typeof WCAT_L!=='undefined'&&WCAT_L[S.lang])?WCAT_L[S.lang][w.cat]:WCAT_NAMES[w.cat]; if(H.wiconId!==Player.wid && H.wicon){ H.wiconId=Player.wid; drawWeaponIcon(H.wicon,Player.wid); } H.wname.textContent=w.name; H.wammo.textContent=w.melee?'':(S.infAmmo?'∞':w.cur);
  S.weaponShowT=Math.max(0,(S.weaponShowT||0)-S.dt); H.wlist.hidden=!(S.weaponShowT>0);
  if(S.weaponShowT>0){ const html=ownedIn(w.cat).map(id=>'<span class="'+(id===Player.wid?'cur':'')+'">'+WEAPONS[id].name+'</span>').join(''); if(html!==H.wlistHtml){ H.wlist.innerHTML=html; H.wlistHtml=html; } }
  H.hbar.style.width=Math.max(0,Player.health)+'%'; H.hbar.classList.toggle('low',Player.health<30);
  H.abar.style.width=Math.max(0,Player.armor)/(Player.maxArmor||100)*100+'%';
  H.hurt.style.opacity=Player.hurtT>0?0.45:0;
  let hint='';
  if(Player.car) hint=(Player.car.driverNpc?T('hintCarDriver'):T('hintCar'))+' · '+Math.round(Math.abs(Player.car.speed)*3.6)+' km/h';
  else { for(const c of S.cars){ if(!c.dead && dist2D(c.pos,Player.pos)-(c.spec.r||1.7)<2.6){ hint=T('hintEnter'); break; } } }
  if(S.aimedPed && !Player.car) hint=T('hintRecruit');
  else if(S.lookTarget && S.hitmen.length && !Player.car) hint='K: Suikastçı vursun ('+(S.lookTarget.type==='cop'?'polis':(S.lookTarget.ref.vip?S.lookTarget.ref.vip.name:'yaya'))+')';
  else if(S.lookTarget && S.lookTarget.ref.vip && !Player.car) hint='Önemli kişi: '+S.lookTarget.ref.vip.name+' (koruma: '+S.lookTarget.ref.guards.filter(g=>g.alive).length+')';
  else if(S.lookTarget && S.crew.length && !Player.car && !Player.aiming) hint=T('hintMark');
  if(!Player.car && !hint){ for(const c of S.cars){ if(!c.dead && c.driverNpc && dist2D(c.pos,Player.pos)-(c.spec.r||1.7)<2.6){ hint=T('hintEnterDriver'); break; } } }
  if(!Player.car && !hint && !Player.aiming){ for(const p of S.peds){ if(p.alive && (p.state==='walk'||p.state==='idle'||p.state==='chat') && dist2D(p.pos,Player.pos)<2.4){ hint=T('hintTalk'); break; } } }
  if(S.freeMouse) hint=T('freeMouse')+(hint?'  •  '+hint:'');
  H.hint.textContent=hint;
  const hl=Math.floor(S.hate); for(let i=0;i<5;i++) H.hate[i].classList.toggle('on',i<hl);
  const guards=S.cops.filter(c=>c.alive&&c.loyal).length, army=S.allies.length;
  const cinfo=(S.cartel||Object.values(S.rep).some(v=>v!==0))?'  ['+cartelInfo()+']':'';
  H.crew.textContent=cinfo+(S.crew.length?'  '+(S.gang?S.gang.symbol+' '+S.gang.name:T('crew'))+': '+S.crew.length+'/'+(typeof CREW_MAX!=='undefined'?CREW_MAX:75):'')+(S.cartelPts?'  KP '+S.cartelPts:'')+(S.feared?'  ☠ KORKULAN':'')+(guards?'  '+T('guards')+': '+guards:'')+(army?'  '+T('army')+': '+army:'')+(S.bribePolice||S.bribeSwat?'  '+T('bribe')+': P%'+S.bribePolice+' S%'+S.bribeSwat:'');
  H.cross.hidden=!!Player.car && !Player.aiming;
  const m=S.mission; H.mission.hidden=!m; if(m){ H.mtitle.textContent=m.title; H.mobj.textContent=m.obj; H.mtime.textContent=Math.ceil(m.timer)+' sn'; }
  const rs=typeof Radio!=='undefined' && Radio.showT>0; H.radio.hidden=!rs; if(rs) H.radio.textContent='♪ '+radioName();
  if(S.subtitle){ S.subtitle.t-=S.dt; H.sub.textContent=S.subtitle.text; H.sub.hidden=false; if(S.subtitle.t<=0) S.subtitle=null; } else H.sub.hidden=true;
}
function drawMinimap(){
  const g=H.mmctx, W=H.mm.width, s=0.7, P=CITY.P, N=CITY.N, R=CITY.R; const pp=Player.car?Player.car.pos:Player.pos;
  const X=x=>W/2+(x-pp.x)*s, Z=z=>W/2+(z-pp.z)*s;
  g.fillStyle='#223322'; g.fillRect(0,0,W,W);
  g.fillStyle='#4b5157'; for(let i=0;i<N;i++) for(let j=0;j<N;j++) g.fillRect(X(i*P+R/2),Z(j*P+R/2),(P-R)*s,(P-R)*s);
  g.fillStyle='#2e2e33'; for(let i=0;i<=N;i++){ g.fillRect(X(i*P)-R*s/2,0,R*s,W); g.fillRect(0,Z(i*P)-R*s/2,W,R*s); }
  const pk=S.places.park; g.fillStyle='#3f8a3a'; g.fillRect(X(pk.x-20),Z(pk.z-20),40*s,40*s);
  for(const [k,col] of [['hospital','#ff4040'],['police','#4a7dff'],['gunshop','#3bff6b'],['spray','#ff5fd2'],['job','#ffd23b']]){ const p=S.places[k]; if(!p) continue; g.fillStyle=col; g.fillRect(X(p.x)-4,Z(p.z)-4,8,8); }
  if(S.objTarget){ const t=S.objTarget; g.fillStyle='#ffd23b'; g.beginPath(); g.arc(X(t.x),Z(t.z),5+2*Math.sin(S.time*6),0,Math.PI*2); g.fill(); }
  if(S.waypoint){ g.fillStyle='#40c8ff'; g.beginPath(); g.arc(X(S.waypoint.x),Z(S.waypoint.z),5,0,Math.PI*2); g.fill(); }
  if(S.vip&&S.vip.alive){ g.fillStyle='#ffd23b'; g.font='bold 12px sans-serif'; g.fillText('★',X(S.vip.pos.x)-5,Z(S.vip.pos.z)+5); }
  g.fillStyle='#ff2a7a'; for(const h of S.hitmen) g.fillRect(X(h.pos.x)-2,Z(h.pos.z)-2,4,4);
  if(S.heli){ g.fillStyle='#ff8a2a'; g.fillRect(X(S.heli.pos.x)-4,Z(S.heli.pos.z)-4,8,8); }
  g.fillStyle='#ff3030'; for(const t of S.enemyTanks||[]) if(t.alive) g.fillRect(X(t.pos.x)-4,Z(t.pos.z)-4,8,8);
  for(const p of S.pickups) if(!p.taken){ g.fillStyle=PICKUP_COLORS[p.type]; g.fillRect(X(p.x)-1.5,Z(p.z)-1.5,3,3); }
  for(const p of S.peds) if(p.alive){ g.fillStyle=p.state==='crew'?'#3bff6b':(p.state==='fight'||p.state==='bossattack'||p.state==='rob')?'#ff3030':p.cartel?'#'+cartelById(p.cartel).color.toString(16).padStart(6,'0'):((p.gangId&&typeof gangById==='function'&&gangById(p.gangId))?hex(gangById(p.gangId).color):(p.gang?'#c070ff':'#e8e8e8')); const sz=p.gang||p.state==='crew'?3:2; g.fillRect(X(p.pos.x)-1,Z(p.pos.z)-1,sz,sz); }
  for(const c of S.cars){ g.fillStyle=c.dead?'#111':(c.ally?'#8dff8d':(c.police?'#4aa3ff':'#b8b8b8')); const sz=c.police&&(c.chase||c.ally)?6:4; g.fillRect(X(c.pos.x)-sz/2,Z(c.pos.z)-sz/2,sz,sz); }
  for(const c of S.cops) if(c.alive){ g.fillStyle=c.loyal?'#8dff8d':'#4aa3ff'; g.fillRect(X(c.pos.x)-1.5,Z(c.pos.z)-1.5,3,3); }
  g.fillStyle='#8dff8d'; for(const a of S.allies) if(a.pos && a.kind!=='policecar') g.fillRect(X(a.pos.x)-3,Z(a.pos.z)-3,6,6);
  const a=Player.car?Player.car.heading:Player.facing; g.save(); g.translate(W/2,W/2); g.rotate(-a); g.fillStyle='#fff'; g.beginPath(); g.moveTo(0,-7); g.lineTo(5,5); g.lineTo(-5,5); g.closePath(); g.fill(); g.restore();
}

// ---- Başlat ----
function onKey(code){
  if(S.dead||S.busted) return;
  if(typeof Chat!=='undefined' && Chat.open) return;
  if(typeof GangForm!=='undefined' && GangForm.open) return;
  if(typeof AvatarUI!=='undefined' && AvatarUI.open){ avatarKey(code); return; }
  if(typeof CrewUI!=='undefined' && CrewUI.open){ crewKey(code); return; }
  if(ShopUI.open){ shopKey(code); return; }
  if(BigMap.open && (code==='Escape'||code==='KeyM')){ toggleBigMap(); return; }
  if(code==='Escape'){ if(S.paused) returnToMenu(); else if(S.dragMode) pauseGame(); return; } // açık pencere yoksa: duraklat; duraklatmadayken: ana menü
  if(code==='KeyP') toggleShop();
  if((code==='Enter'||code==='NumpadEnter') && !S.paused && !BigMap.open && typeof toggleChat==='function') toggleChat(true);
  if(code==='KeyC' && !BigMap.open && typeof toggleCrewCfg==='function') toggleCrewCfg();
  if(code==='KeyX' && typeof markLookTarget==='function') markLookTarget();
  if(code==='KeyU' && !BigMap.open && typeof openAvatar==='function') openAvatar();
  if(code==='KeyM') toggleBigMap();
  if(code==='KeyG') tryRecruit();
  if(code==='KeyT') tryRob();
  if(code==='KeyK') hitmanStrike();
  if(code==='KeyY'){ answerInvite(true); }
  if(code==='KeyN'){ if(!answerInvite(false)) cycleSeat(); }
  if(code==='KeyE'){ let near=false; if(!Player.car) for(const c of S.cars){ if(!c.dead && dist2D(c.pos,Player.pos)-(c.spec.r||1.7)<2.6){ near=true; break; } } if(Player.car||near) tryEnterCar(!!S.keys.ShiftLeft); else talkToPed(); }
  if(code==='KeyF') toggleView();
  if(code==='KeyR') radioNext();
  if(code==='KeyH') hornCar();
  if(code==='Tab') switchCategory(1);
  if(code.startsWith('Digit')){ const n=+code[5]; if(S.shopOpen){ shopBuy(n===0?9:n-1); } else if(n>=1&&n<=8) selectCategory(n-1); }
  if(code==='WheelUp') switchModel(-1); if(code==='WheelDown'||code==='KeyQ') switchModel(1);
}
function init(){
  const r=new THREE.WebGLRenderer({antialias:true}); r.setPixelRatio(Math.min(window.devicePixelRatio,1.5)); r.shadowMap.enabled=true; r.shadowMap.type=THREE.PCFSoftShadowMap;
  r.outputEncoding=THREE.sRGBEncoding; r.toneMapping=THREE.ACESFilmicToneMapping; r.toneMappingExposure=0.82;
  document.getElementById('game').appendChild(r.domElement); S.renderer=r;
  S.scene=new THREE.Scene(); S.camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.1,900);
  const resize=()=>{ r.setSize(innerWidth,innerHeight); S.camera.aspect=innerWidth/innerHeight; S.camera.updateProjectionMatrix(); if(typeof resizeFX==='function') resizeFX(r); }; window.addEventListener('resize',resize); resize();
  loadPrefs(); renderMenu(); document.getElementById('overlay').hidden=true;
  if(typeof initTouch==='function') initTouch();
}
function price(p){ return Math.round(p*(S.diff||1)); }
function reward(r){ return Math.round(r/(S.diff||1)); }
function startGame(){
  const r=S.renderer; const origRandom=Math.random; Math.random=mulberry32(S.seed||1); buildWorld(); Math.random=origRandom; if(typeof initGangs==='function') initGangs();
  initPlayer(); initPickups(); initMissions(); initShopUI(); for(let i=0;i<16;i++) spawnCar();
  S.money=S.diff===3?60:S.diff===2?120:250;
  S.wpBeacon=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,60,10,1,true), new THREE.MeshBasicMaterial({color:0x40c8ff,transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})); S.wpBeacon.visible=false; S.scene.add(S.wpBeacon);
  if(loadGame()) setTimeout(()=>toast('Kayıt yüklendi'),500); if(typeof applyGangToCrew==='function') applyGangToCrew();
  document.getElementById('overlay').hidden=false; if(typeof initChat==='function') initChat(); if(typeof initParty==='function') initParty();
  S.yaw=Math.PI; initInput(r.domElement); S.keyHandlers.push(onKey);
  H={ stars:[...document.querySelectorAll('#stars span')], money:document.getElementById('money'), wcat:document.getElementById('wcat'), wname:document.getElementById('wname'), wammo:document.getElementById('wammo'), wlist:document.getElementById('wlist'), hbar:document.getElementById('hbar'), abar:document.getElementById('abar'), hint:document.getElementById('hint'), hurt:document.getElementById('hurt'), toasts:document.getElementById('toasts'), cross:document.getElementById('crosshair'), mm:document.getElementById('minimap'), wicon:document.getElementById('wicon'),
    mission:document.getElementById('mission'), mtitle:document.getElementById('mtitle'), mobj:document.getElementById('mobj'), mtime:document.getElementById('mtime'), radio:document.getElementById('radio'), sub:document.getElementById('subtitle'),
    hate:[...document.querySelectorAll('#hate span')], crew:document.getElementById('crewinfo') };
  H.mmctx=H.mm.getContext('2d');
  const clock=new THREE.Clock(); S.slow=1;
  S.tick=function(dt){
    dt*=S.slow||1; S.dt=dt; S.time+=dt; flushPendingKey();
    if(ShopUI.open || (typeof CrewUI!=='undefined'&&CrewUI.open) || (typeof Chat!=='undefined'&&Chat.open)){ S.mouse.down=false; S.mouse.rdown=false; }
    updatePlayer(dt); updateCars(dt); updatePeds(dt); updateBrawls(dt); updateCops(dt); updateHeli(dt); updateProjectiles(dt); updateCrewSystem(dt); if(typeof updateMilitary==='function') updateMilitary(dt); if(typeof updateGangs==='function') updateGangs(dt); if(typeof updateCrewVehicles==='function') updateCrewVehicles(dt); if(typeof updateChat==='function') updateChat(dt); if(typeof updateParty==='function') updateParty(dt); updateAllies(dt); updateMechanic(dt); updateHitmen(dt); updateCartels(dt); updatePickups(dt); updateMissions(dt); updateEffects(dt); wantedDecay(dt); autosave(dt);
    if(S.wpBeacon && S.waypoint){ S.wpBeacon.visible=true; S.wpBeacon.position.set(S.waypoint.x,30,S.waypoint.z); if(!Player.car && dist2D(Player.pos,S.waypoint)<4){ S.waypoint=null; S.wpBeacon.visible=false; } }
    if(BigMap.open && (S.frame=(S.frame||0)+1)%8===0) drawBigMap();
    sirenUpdate(S.cars.some(c=>c.police&&c.chase&&!c.dead&&dist2D(c.pos,Player.pos)<120),dt);
    engineUpdate(!!Player.car && !S.dead, Player.car?Player.car.speed:0, dt); radioUpdate(dt);
    updateDayNight(dt); updateTrafficLights(dt); ambientUpdate(dt); if(S.headlight) S.headlight.intensity=(Player.car?1:0)*(0.2+1.6*(S.night||0));
    updateCamera(dt); S.sky.position.copy(S.camera.position); updateHUD(); drawMinimap(); if(Touch.on && Touch.tick) Touch.tick();
  };
  function loop(){
    requestAnimationFrame(loop); const dt=Math.min(0.05,clock.getDelta());
    if(!S.paused) S.tick(dt);
    if(S.fx && typeof FX!=='undefined' && FX.ready) renderFX(r); else { r.setRenderTarget(null); r.render(S.scene,S.camera); }
  }
  if(typeof initFX==='function'){ try{ initFX(r); }catch(e){ console.warn('FX yok',e); S.fx=false; } }

  updateCamera(0); loop();
}
window.addEventListener('load',init);
