// projectiles.js — roket, tank mermisi, bombaatar, el/boru bombası, molotof; yangın alanları; alan hasarlı patlama
S.projectiles=[]; S.fires=[];
var PROJ={ rocket:{speed:45,radius:7,dmg:130}, shell:{speed:70,radius:7,dmg:150}, launched:{speed:28,radius:6,dmg:90,arc:true,fuse:3,impact:true}, grenade:{speed:16,radius:6,dmg:100,arc:true,fuse:2.5}, pipe:{speed:14,radius:9,dmg:140,arc:true,fuse:3}, molotov:{speed:16,radius:0,dmg:0,arc:true,fuse:4,impact:true,fire:true} };
function fireProjectile(kind,from,dir,src){
  const K=PROJ[kind]; let mesh; const p={kind,pos:from.clone(),src,life:0,smokeT:0,start:from.clone(),K};
  if(K.arc){ mesh=kind==='molotov'?makeWeaponModel('molotov'):kind==='pipe'?makeWeaponModel('pipebomb'):new THREE.Mesh(new THREE.SphereGeometry(0.07,8,6),new THREE.MeshPhongMaterial({color:kind==='launched'?0x6a7a3a:0x3a4a2a})); p.vel=dir.clone().multiplyScalar(K.speed); p.vel.y+=kind==='launched'?2:5; }
  else { const g=new THREE.Group(); g.add(cyl(0.05,0.5,new THREE.MeshPhongMaterial({color:0x5a5a5a}),0,0,0), cyl(0.07,0.18,new THREE.MeshPhongMaterial({color:0x7a2a2a}),0,0,0.3,0.01)); const fl=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),new THREE.MeshBasicMaterial({color:0xffa030})); fl.position.z=-0.3; g.add(fl); mesh=g; p.vel=dir.clone().multiplyScalar(K.speed); mesh.lookAt(from.clone().add(dir)); playNoise(0.3,0.8,500); }
  mesh.position.copy(from); S.scene.add(mesh); p.mesh=mesh; S.projectiles.push(p);
}
function projHitsSomething(p,near){
  for(const c of S.cars){ if(!c.dead && dist2D(c.pos,p.pos)<near+1.4 && p.pos.y<2.5 && !(p.src==='player'&&Player.car===c)) return true; }
  for(const q of S.peds){ if(q.alive && dist2D(q.pos,p.pos)<near && p.pos.y<2.2) return true; }
  for(const q of S.cops){ if(q.alive && dist2D(q.pos,p.pos)<near && p.pos.y<2.2) return true; }
  if(S.heli && S.heli.alive && S.heli.pos.distanceTo(p.pos)<4) return true;
  if(p.src!=='tank') for(const t of S.enemyTanks||[]) if(t.alive && dist2D(t.pos,p.pos)<near+2.2 && p.pos.y<3.2) return true;
  if(S.allies) for(const a of S.allies){ if(a.pos && a.pos.distanceTo(p.pos)<3 && p.src!=='ally') return true; }
  if(p.src!=='player' && !Player.car && Player.pos.distanceTo(p.pos.clone().setY(0))<1.5) return true;
  return false;
}
function updateProjectiles(dt){
  for(let i=S.projectiles.length-1;i>=0;i--){
    const p=S.projectiles[i], K=p.K; p.life+=dt; let boom=false;
    if(K.arc){
      p.vel.y-=14*dt; p.pos.addScaledVector(p.vel,dt); let hit=false;
      if(p.pos.y<0.07){ p.pos.y=0.07; hit=true; if(!K.impact){ p.vel.y=-p.vel.y*0.35; p.vel.x*=0.6; p.vel.z*=0.6; } }
      if(pointInObstacle(p.pos.x,p.pos.z,0.1)){ hit=true; if(!K.impact){ p.vel.x=-p.vel.x*0.4; p.vel.z=-p.vel.z*0.4; p.pos.addScaledVector(p.vel,dt*2); } }
      if(K.impact && p.life>0.12 && (hit || projHitsSomething(p,1.2))) boom=true;
      p.mesh.position.copy(p.pos); p.mesh.rotation.x+=dt*8;
      if(p.life>=K.fuse) boom=true;
    } else {
      for(let s=0;s<3 && !boom;s++){
        p.pos.addScaledVector(p.vel,dt/3);
        if(p.pos.y<=0 || (p.pos.y<70 && pointInObstacle(p.pos.x,p.pos.z,0.2)) || p.pos.distanceTo(p.start)>160 || projHitsSomething(p,1.2)) boom=true;
      }
      p.mesh.position.copy(p.pos); p.smokeT-=dt; if(p.smokeT<=0){ p.smokeT=0.03; addSmoke(p.pos.clone()); }
    }
    if(boom){ S.scene.remove(p.mesh); S.projectiles.splice(i,1); if(K.fire) spawnFire(p.pos.clone().setY(0.1),p.src); else explodeAt(p.pos.clone(),K.radius,K.dmg,p.src); }
  }
  updateFires(dt);
}
function spawnFire(pos,src){ playNoise(0.3,0.5,900); S.fires.push({pos,life:7,t:0,src,partT:0}); panicPeds(pos,25); }
function updateFires(dt){
  for(let i=S.fires.length-1;i>=0;i--){
    const f=S.fires[i]; f.t+=dt; if(f.t>f.life){ S.fires.splice(i,1); continue; }
    f.partT-=dt; if(f.partT<=0){ f.partT=0.06; addFlame(f.pos.clone().add(new THREE.Vector3(rand(-2.5,2.5),0.1,rand(-2.5,2.5))),new THREE.Vector3(rand(-0.5,0.5),rand(2,4),rand(-0.5,0.5)),0.7); if(Math.random()<0.3) addSmoke(f.pos.clone().add(new THREE.Vector3(rand(-2,2),1.5,rand(-2,2)))); }
    for(const q of S.peds) if(q.alive && dist2D(q.pos,f.pos)<3.2) damagePed(q,14*dt,f.src==='player'?'player':'fire');
    for(const q of S.cops) if(q.alive && dist2D(q.pos,f.pos)<3.2) damageCop(q,14*dt,f.src==='player'?'player':'fire');
    for(const c of S.cars) if(!c.dead && dist2D(c.pos,f.pos)<3.8) damageCar(c,6*dt,f.src==='player'?'player':null);
    if(!S.dead && !Player.car && dist2D(Player.pos,f.pos)<3) damagePlayer(12*dt);
  }
}
function explodeAt(pos,radius,dmg,src){
  addExplosion(pos.clone().setY(Math.max(1,pos.y))); playNoise(0.7,1.0,350); panicPeds(pos,40);
  for(const q of S.peds) if(q.alive && dist2D(q.pos,pos)<radius) killPed(q,src==='player'?'player':'blast');
  for(const q of S.cops) if(q.alive && dist2D(q.pos,pos)<radius) damageCop(q,dmg,src==='player'?'player':'blast');
  for(const c of S.cars) if(!c.dead && dist2D(c.pos,pos)<radius+1.5) damageCar(c,dmg*0.7,src==='player'?'player':null);
  if(S.heli && S.heli.alive && S.heli.pos.distanceTo(pos)<radius+3) damageHeli(dmg*1.2);
  if(src!=='tank') for(const t of S.enemyTanks||[]) if(t.alive && dist2D(t.pos,pos)<radius+2.5) damageEnemyTank(t,dmg*1.1,src==='player'?'player':(src==='ally'?'ally':'blast'));
  if(S.allies && typeof damageAlly==='function') for(const a of S.allies) if(a.pos && a.pos.distanceTo(pos)<radius+2 && src!=='ally') damageAlly(a,dmg*0.6);
  if(!S.dead){ const d=Player.pos.distanceTo(pos.clone().setY(Player.pos.y)); if(Player.car){ if(dist2D(Player.car.pos,pos)<radius+1.5 && src!=='player') damageCar(Player.car,dmg*0.5,'blast'); } else if(d<radius) damagePlayer(dmg*(1-d/radius)*(src==='player'?0.6:0.9)); }
}
// Alev makinesi: koni içindeki her şeye hasar + alev parçacıkları
function flameAttack(from,dir,w){
  for(let i=0;i<3;i++){ const v=dir.clone().add(new THREE.Vector3(rand(-0.12,0.12),rand(-0.08,0.12),rand(-0.12,0.12))).normalize().multiplyScalar(rand(9,13)); addFlame(from.clone(),v,0.45); }
  const hit=(pos)=>{ const d=new THREE.Vector3().subVectors(pos,from); const L=d.length(); return L<w.range && d.normalize().dot(dir)>0.86; };
  for(const q of S.peds) if(q.alive && hit(q.pos.clone().setY(1))) damagePed(q,w.dmg,'player');
  for(const q of S.cops) if(q.alive && hit(q.pos.clone().setY(1))) damageCop(q,w.dmg,'player');
  for(const c of S.cars) if(!c.dead && c!==Player.car && hit(c.pos.clone().setY(1))) damageCar(c,w.dmg*0.6,'player');
}
