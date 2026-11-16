// heli.js — helikopter birimi: polis (4+ yıldız) ve satın alınan dost helikopter
function makeHeliMesh(ally){
  const g=new THREE.Group(); const body=new THREE.MeshPhongMaterial({color:ally?0x2d5a3a:0x1b3a6b,shininess:60}), white=new THREE.MeshPhongMaterial({color:ally?0xd8f0d8:0xf2f2f2}), dark=new THREE.MeshPhongMaterial({color:0x222222});
  const mk=(geo,mat,x,y,z)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; g.add(m); return m; };
  mk(new THREE.BoxGeometry(2.0,1.5,4.2),body,0,0,0); mk(new THREE.BoxGeometry(2.04,0.3,4.24),white,0,0.1,0);
  mk(new THREE.BoxGeometry(1.6,0.9,1.6),new THREE.MeshPhongMaterial({color:0x182636,shininess:140,specular:0xbbccdd}),0,0.25,2.2);
  mk(new THREE.BoxGeometry(0.5,0.5,4.6),body,0,0.4,-4.2); mk(new THREE.BoxGeometry(0.1,1.3,0.9),body,0,1.1,-6.2);
  mk(new THREE.CylinderGeometry(0.2,0.2,0.6,8),dark,0,0.95,0);
  for(const x of [-0.85,0.85]){ mk(new THREE.BoxGeometry(0.12,0.12,3.6),dark,x,-1.15,0.2); mk(new THREE.BoxGeometry(0.08,0.5,0.08),dark,x,-0.95,-1.0); mk(new THREE.BoxGeometry(0.08,0.5,0.08),dark,x,-0.95,1.2); }
  const rotor=new THREE.Group(); rotor.position.y=1.25; for(const r of [0,Math.PI/2]){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.05,11.5),dark); b.rotation.y=r; rotor.add(b); } g.add(rotor);
  const tail=new THREE.Group(); tail.position.set(0.35,1.1,-6.25); for(const r of [0,Math.PI/2]){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.05,1.7,0.15),dark); b.rotation.x=r; tail.add(b); } g.add(tail);
  const spot=new THREE.SpotLight(ally?0xd0ffd0:0xfff2c8,3,110,0.32,0.5,1); spot.position.set(0,-0.8,1.6); g.add(spot); S.scene.add(spot.target);
  mk(new THREE.SphereGeometry(0.3,8,6),new THREE.MeshBasicMaterial({color:0xfff6d0}),0,-0.8,1.6);
  const muzzle=new THREE.Object3D(); muzzle.position.set(0,-0.9,1.6); g.add(muzzle);
  g.userData.rotor=rotor; g.userData.tail=tail; g.userData.spot=spot; g.userData.muzzle=muzzle;
  return g;
}
function newHeliUnit(ally,x,z){
  const g=makeHeliMesh(ally); g.userData.entity={type:ally?'allyheli':'heli'}; g.position.set(x,45,z); S.scene.add(g);
  return {mesh:g,pos:g.position.clone(),alive:true,health:ally?450:320,shootT:3,rotor:g.userData.rotor,tail:g.userData.tail,spot:g.userData.spot,ang:Math.random()*6,vy:0,leaveT:0,smokeT:0,ally};
}
function removeHeliUnit(h){ S.scene.remove(h.mesh); S.scene.remove(h.spot.target); }
// Ortak helikopter adımı: düşme, ayrılma, yörünge; shootFn ateş kararını verir. Döner: true=silindi
function updateHeliUnit(h,dt,center,active,shootFn){
  if(!h.alive){
    h.vy-=9*dt; h.pos.y+=h.vy*dt; h.pos.x+=3*dt; h.mesh.rotation.z+=dt*1.6; h.mesh.rotation.x+=dt*0.4; h.rotor.rotation.y+=dt*8;
    h.smokeT-=dt; if(h.smokeT<=0){ h.smokeT=0.08; addSmoke(h.pos.clone()); }
    h.mesh.position.copy(h.pos);
    if(h.pos.y<=1.5){ const p=h.pos.clone().setY(1); explodeAt(p,9,90,h.ally?'blast':'player'); addExplosion(p.clone().add(new THREE.Vector3(2,0,1))); removeHeliUnit(h); return true; }
    return false;
  }
  if(!active){ h.pos.y+=9*dt; h.pos.x+=12*dt; h.leaveT+=dt; if(h.leaveT>9){ removeHeliUnit(h); return true; } }
  else {
    h.ang+=dt*0.35; const tx=center.x+Math.cos(h.ang)*20, tz=center.z+Math.sin(h.ang)*20;
    h.pos.x+=(tx-h.pos.x)*Math.min(1,dt*1.1); h.pos.z+=(tz-h.pos.z)*Math.min(1,dt*1.1); h.pos.y+=(28-h.pos.y)*Math.min(1,dt);
    h.shootT-=dt; if(h.shootT<=0){ h.shootT=rand(0.5,1.2); shootFn(h); }
  }
  h.mesh.position.copy(h.pos); h.mesh.rotation.y=Math.atan2(center.x-h.pos.x,center.z-h.pos.z); h.mesh.rotation.z=0.12; h.mesh.rotation.x=0.08;
  h.rotor.rotation.y+=dt*28; h.tail.rotation.x+=dt*34;
  h.spot.target.position.set(center.x,0,center.z);
  return false;
}
// ---- Polis helikopteri ----
function spawnHeli(){ const pp=Player.car?Player.car.pos:Player.pos; S.heli=newHeliUnit(false,pp.x+60,pp.z+60); toast('Polis helikopteri geldi!'); }
function removeHeli(){ if(!S.heli) return; removeHeliUnit(S.heli); S.heli=null; heliSound(false,0.1); }
function updateHeli(dt){
  const pp=Player.car?Player.car.pos:Player.pos;
  const want=S.wanted>=4 && !S.dead && !S.busted;
  if(!S.heli){ if(want){ S.heliT=(S.heliT||0)+dt; if(S.heliT>5){ spawnHeli(); S.heliT=0; } } else S.heliT=0; }
  else { const h=S.heli; if(updateHeliUnit(h,dt,pp,want,heliShoot)){ S.heli=null; } else heliSound(dist2D(h.pos,pp)<110,dt); }
  if(S.allyHeli){ const h=S.allyHeli; const gone=updateHeliUnit(h,dt,pp,!S.dead,allyHeliShoot); if(gone){ S.allyHeli=null; S.allies=S.allies.filter(a=>a.kind!=='heli'); } }
}
function heliShoot(h){
  const pp=Player.car?Player.car.pos:Player.pos; const from=h.pos.clone().add(new THREE.Vector3(0,-0.9,1.6)); const hit=Math.random()<0.3;
  const tgt=pp.clone().setY(1.0); if(!hit){ tgt.x+=rand(-3.5,3.5); tgt.z+=rand(-3.5,3.5); }
  addTracer(from,tgt); playNoise(0.1,0.25,1400); addParticles(tgt,0xaaaaaa,2);
  if(hit){ if(Player.car) damageCar(Player.car,8,'cop'); else damagePlayer(rand(5,9)); }
}
function allyHeliShoot(h){
  const t=nearestHostile(h.pos,90); if(!t) return;
  const from=h.pos.clone().add(new THREE.Vector3(0,-0.9,1.6)); const hit=Math.random()<0.55;
  const tgt=t.pos.clone(); if(t.type!=='heli') tgt.y=1.0; if(!hit){ tgt.x+=rand(-2,2); tgt.z+=rand(-2,2); }
  addTracer(from,tgt); playNoise(0.1,0.25,1400); addParticles(tgt,0xaaaaaa,2);
  if(hit){ if(t.type==='cop') damageCop(t.ref,35,'crew'); else if(t.type==='ped') damagePed(t.ref,35,'crew'); else if(t.type==='heli') damageHeli(40); else if(t.type==='car') damageCar(t.ref,20,'crew'); }
}
function damageHeli(d){
  const h=S.heli; if(!h||!h.alive) return; h.health-=d;
  if(h.health<=0){ h.alive=false; h.vy=2; crime('copKill'); toast('Helikopter düşürüldü!'); S.money+=500; }
}
var heliOsc=null, heliGain=null;
function heliSound(active,dt){
  if(!AC) return;
  if(!heliOsc){ heliOsc=AC.createOscillator(); heliOsc.type='square'; heliOsc.frequency.value=17; const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=220; heliGain=AC.createGain(); heliGain.gain.value=0; heliOsc.connect(f); f.connect(heliGain); heliGain.connect(AC.destination); heliOsc.start(); }
  const t=active?0.07:0; heliGain.gain.value+=(t-heliGain.gain.value)*Math.min(1,dt*3);
}
