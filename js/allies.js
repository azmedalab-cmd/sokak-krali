// allies.js — satın alınan kuvvetler (polis arabası, panzer, tank, helikopter), tamirci çağırma, araç satın alma
S.allies=[]; S.garage=[];
function nearestLanePoint(pos){ const P=CITY.P,N=CITY.N; const i=Math.round(pos.x/P), j=Math.round(pos.z/P);
  if(Math.abs(pos.x-i*P)<=Math.abs(pos.z-j*P)) return lanePoint('z',1,clamp(i,0,N),clamp(pos.z,5,CITY.size-5)); return lanePoint('x',1,clamp(j,0,N),clamp(pos.x,5,CITY.size-5)); }
function buyCar(type){
  const pp=Player.car?Player.car.pos:Player.pos; const lp=nearestLanePoint(pp);
  const c=spawnCar({type,pos:lp,heading:lp.x===Math.round(lp.x)?0:Math.PI/2,noDriver:true}); c.ai=false; c.parked=true; c.owned=true; c.speed=0; setTrafficFromPose(c); c.heading=c.axis==='z'?(c.dir>0?0:Math.PI):(c.dir>0?Math.PI/2:-Math.PI/2); c.mesh.rotation.y=c.heading;
  if(!S.garage.includes(type)) S.garage.push(type);
  toast(CAR_LABELS[type]+' teslim edildi (yakındaki yolda)'); playTone(700,0.2,0.15,'triangle',1000); return c;
}
var CAR_LABELS={sedan:'Sedan',hatch:'Hatchback',sports:'Spor Araba',pickup:'Pikap',van:'Van',suv:'SUV',coupe:'Coupe',muscle:'Muscle Car',limo:'Limuzin',truck:'Kamyon',bus:'Otobüs'};
function spawnAllyVehicle(kind){
  const pp=Player.car?Player.car.pos:Player.pos;
  if(kind==='heli'){ if(S.allyHeli){ toast('Zaten bir helikopterin var'); return false; } S.allyHeli=newHeliUnit(true,pp.x-50,pp.z-50); S.allyHeli.kind='heli'; S.allies.push(S.allyHeli); toast('Dost helikopter yolda'); return true; }
  if(kind==='policecar'){ const lp=nearestLanePoint(pp); const c=spawnCar({police:true,pos:lp}); c.ai=false; c.chase=false; c.ally=true; c.owned=true; const a={kind,car:c,pos:c.pos,health:100,mesh:c.mesh}; S.allies.push(a); toast('Rüşvetli polis arabası emrinde'); return true; }
  const a=makeArmor(kind); a.pos.set(pp.x+rand(-8,8),0,pp.z+rand(-8,8)); a.mesh.position.copy(a.pos); S.scene.add(a.mesh); S.allies.push(a); toast(kind==='tank'?'Tank emrinde!':'Panzer emrinde!'); return true;
}
function makeArmor(kind){
  const g=new THREE.Group(); const olive=new THREE.MeshPhongMaterial({color:kind==='tank'?0x4a5a3a:0x3a4a5a,shininess:30}), dark=new THREE.MeshPhongMaterial({color:0x1a1a1a});
  const mk=(geo,mat,x,y,z)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; g.add(m); return m; };
  if(kind==='tank'){ mk(new THREE.BoxGeometry(2.8,1.0,5.6),olive,0,1.0,0); mk(new THREE.BoxGeometry(3.4,0.5,5.8),olive,0,0.55,0); for(const x of [-1.5,1.5]) mk(new THREE.BoxGeometry(0.7,0.9,5.8),dark,x,0.6,0); }
  else { mk(new THREE.BoxGeometry(2.6,1.3,5.4),olive,0,1.15,0); mk(new THREE.BoxGeometry(2.7,0.4,5.2),olive,0,0.6,0.1); for(const z of [-1.8,0,1.8]) for(const x of [-1.3,1.3]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.35,12),dark); w.rotation.z=Math.PI/2; w.position.set(x,0.45,z); g.add(w); } }
  const turret=new THREE.Group(); turret.position.set(0,kind==='tank'?1.75:2.0,-0.3);
  const tm=new THREE.Mesh(kind==='tank'?new THREE.BoxGeometry(2.0,0.7,2.4):new THREE.CylinderGeometry(0.6,0.7,0.6,10),olive); tm.castShadow=true; turret.add(tm);
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(kind==='tank'?0.1:0.05,kind==='tank'?0.12:0.05,kind==='tank'?3.6:1.4,8),dark); barrel.rotation.x=Math.PI/2; barrel.position.set(0,0.1,kind==='tank'?2.6:1.1); turret.add(barrel);
  const muzzle=new THREE.Object3D(); muzzle.position.set(0,0.1,kind==='tank'?4.4:1.8); turret.add(muzzle);
  g.add(turret); g.userData.muzzle=muzzle; g.userData.entity={type:'ally'}; g.rotation.order='YXZ';
  const ug=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.1,0.5),new THREE.MeshBasicMaterial({color:0x3bff6b})); ug.position.y=kind==='tank'?2.4:2.6; g.add(ug);
  return {kind,mesh:g,turret,pos:new THREE.Vector3(),heading:0,speed:0,health:kind==='tank'?600:350,shootT:2,armed:kind==='tank'?'m249':'m249'};
}
function allyCarStep(c,dt){
  const pp=Player.car?Player.car.pos:Player.pos; const host=nearestHostile(c.pos,60); const tgt=host?host.pos:pp; const d=dist2D(c.pos,tgt);
  const desired=Math.atan2(tgt.x-c.pos.x,tgt.z-c.pos.z); c.heading=lerpAngle(c.heading,desired,Math.min(1,dt*2.4));
  if(host){ return host.type==='heli'?0:16; }
  if(dist2D(c.pos,pp)>140){ const lp=nearestLanePoint(pp); c.pos.copy(lp); }
  return d>12?14:0;
}
function updateAllies(dt){
  const pp=Player.car?Player.car.pos:Player.pos;
  for(let i=S.allies.length-1;i>=0;i--){
    const a=S.allies[i];
    if(a.kind==='policecar'){ if(a.car.dead){ S.allies.splice(i,1); } continue; }
    if(a.kind==='heli') continue;
    const host=nearestHostile(a.pos,70); const tgt=host?host.pos:pp; const d=dist2D(a.pos,tgt);
    const desired=Math.atan2(tgt.x-a.pos.x,tgt.z-a.pos.z); a.heading=lerpAngle(a.heading,desired,Math.min(1,dt*1.6));
    const want=host?(d>14?(a.kind==='tank'?7:9):0):(d>10?(a.kind==='tank'?8:10):0);
    a.speed+=clamp(want-a.speed,-10*dt,4*dt);
    a.pos.x+=Math.sin(a.heading)*a.speed*dt; a.pos.z+=Math.cos(a.heading)*a.speed*dt; collideWorld(a.pos,2.2);
    if(dist2D(a.pos,pp)>150){ a.pos.set(pp.x+rand(-10,10),0,pp.z+rand(-10,10)); }
    if(Math.abs(a.speed)>2){ for(const q of S.peds) if(q.alive && q.state==='fight' && dist2D(q.pos,a.pos)<3) killPed(q,'blast'); for(const q of S.cops) if(q.alive && q.state==='hunt' && dist2D(q.pos,a.pos)<3) damageCop(q,100,'blast'); for(const c of S.cars) if(!c.dead && c!==Player.car && dist2D(c.pos,a.pos)<4){ c.pos.addScaledVector(new THREE.Vector3(c.pos.x-a.pos.x,0,c.pos.z-a.pos.z).normalize(),4-dist2D(c.pos,a.pos)); if(c.police&&c.chase) damageCar(c,40,'crew'); } }
    a.mesh.position.copy(a.pos); a.mesh.rotation.y=a.heading;
    if(host){ const ta=Math.atan2(host.pos.x-a.pos.x,host.pos.z-a.pos.z)-a.heading; a.turret.rotation.y=lerpAngle(a.turret.rotation.y,ta,Math.min(1,dt*3)); a.shootT-=dt;
      if(a.shootT<=0 && hasLOS(a.pos.clone().setY(2),host.pos.clone().setY(host.type==='heli'?host.pos.y:1.2))){
        if(a.kind==='tank'){ a.shootT=3; const from=new THREE.Vector3(); a.mesh.userData.muzzle.getWorldPosition(from); const dir=host.pos.clone(); if(host.type!=='heli') dir.y=1; dir.sub(from).normalize(); fireProjectile('shell',from,dir,'ally'); }
        else { a.shootT=0.12; shootEntity(a,WEAPONS.m249,host,0.7); }
        if(host.type==='etank' && a.kind==='apc') a.shootT=0.2;
      } }
    else a.turret.rotation.y=lerpAngle(a.turret.rotation.y,0,Math.min(1,dt*2));
  }
}
function damageAlly(a,dmg){
  a.health-=dmg; if(a.health>0) return;
  if(a.kind==='policecar'){ explodeCar(a.car); }
  else if(a.kind==='heli'){ if(a.alive){ a.alive=false; a.vy=2; toast('Dost helikopter düşürüldü!'); } return; }
  else { explodeAt(a.pos.clone(),6,60,'blast'); S.scene.remove(a.mesh); toast((a.kind==='tank'?'Tank':'Panzer')+' yok edildi'); }
  S.allies=S.allies.filter(x=>x!==a);
}
// ---- Tamirci ----
function callMechanic(){
  if(!Player.car){ toast('Tamirci için bir araçta olmalısın'); return false; }
  if(S.mechanic){ toast('Tamirci zaten yolda'); return false; }
  const pp=Player.car.pos; let c=null; for(let t=0;t<20;t++){ c=spawnCar({type:'van'}); const d=dist2D(c.pos,pp); if(d>50&&d<130) break; removeCarAt(S.cars.length-1); c=null; }
  if(!c){ toast('Tamirci şu an gelemiyor'); return false; }
  c.ai=false; c.chase=false; c.mechanic=true; c.owned=true; c.mesh.userData.body.material=new THREE.MeshStandardMaterial({color:0xff8c1a,metalness:0.5,roughness:0.4,envMap:S.envMap});
  S.mechanic={car:c,targetCar:Player.car,state:'drive',ped:null,t:0,sparkT:0}; toast('Tamirci yola çıktı'); return true;
}
function mechanicCarStep(c,dt){
  const m=S.mechanic; if(!m||m.car!==c) return 0;
  if(m.state==='leave'){ return 0; }
  const tgt=m.targetCar.pos; const d=dist2D(c.pos,tgt);
  if(m.state!=='drive') return 0;
  const desired=Math.atan2(tgt.x-c.pos.x,tgt.z-c.pos.z); c.heading=lerpAngle(c.heading,desired,Math.min(1,dt*2.2));
  return d>9?12:0;
}
function updateMechanic(dt){
  const m=S.mechanic; if(!m) return;
  const car=m.targetCar;
  if(m.state==='drive'){ if(car.dead){ endMechanic(); return; } if(dist2D(m.car.pos,car.pos)<10 && Math.abs(m.car.speed)<1){ m.state='walk'; const n=nearestNode(m.car.pos.x,m.car.pos.z); m.ped=spawnPed(n,{gang:false}); m.ped.state='mechanic'; m.ped.pos.set(m.car.pos.x+Math.cos(m.car.heading)*2.3,0,m.car.pos.z-Math.sin(m.car.heading)*2.3); m.ped.mesh.userData.torso.material=matLambert(0xff8c1a); pedSay(m.ped,'Tamirci geldi, bakayım şuna.'); } return; }
  const p=m.ped; if(!p||!p.alive){ endMechanic(); return; }
  if(m.state==='walk'){ const tx=car.pos.x+2.2, tz=car.pos.z; const d=Math.hypot(tx-p.pos.x,tz-p.pos.z); if(d>0.8){ const dir=new THREE.Vector3(tx-p.pos.x,0,tz-p.pos.z).normalize(); p.pos.addScaledVector(dir,2.5*dt); p.facing=Math.atan2(dir.x,dir.z); p.mechSpd=2.5; collideWorld(p.pos,0.3); } else { m.state='repair'; m.t=4; p.mechSpd=0; p.facing=Math.atan2(car.pos.x-p.pos.x,car.pos.z-p.pos.z); } if(dist2D(car.pos,p.pos)>25){ m.state='return'; pedSay(p,'Nereye gidiyorsun ya!'); } }
  else if(m.state==='repair'){ m.t-=dt; m.sparkT-=dt; if(m.sparkT<=0){ m.sparkT=0.2; addParticles(car.pos.clone().add(new THREE.Vector3(Math.sin(car.heading)*1.8,0.9,Math.cos(car.heading)*1.8)),0xffd36a,3); playNoise(0.05,0.15,3000); } if(dist2D(car.pos,p.pos)>8){ m.state='return'; } else if(m.t<=0){ car.health=100; pedSay(p,'Tamam, yeni gibi oldu. Kolay gelsin.'); toast('Araç tamir edildi'); playTone(700,0.2,0.15,'triangle',1000); m.state='return'; } }
  else if(m.state==='return'){ const tx=m.car.pos.x, tz=m.car.pos.z; const d=Math.hypot(tx-p.pos.x,tz-p.pos.z); if(d>2.5){ const dir=new THREE.Vector3(tx-p.pos.x,0,tz-p.pos.z).normalize(); p.pos.addScaledVector(dir,2.5*dt); p.facing=Math.atan2(dir.x,dir.z); p.mechSpd=2.5; collideWorld(p.pos,0.3); } else { S.scene.remove(p.mesh); S.peds.splice(S.peds.indexOf(p),1); m.ped=null; m.state='leave'; m.car.mechanic=false; m.car.owned=false; m.car.ai=true; setTrafficFromPose(m.car); S.mechanic=null; } }
  if(p && p.alive){ p.mesh.position.copy(p.pos); p.mesh.rotation.y=p.facing; animateHuman(p.mesh,p.mechSpd||0,dt,false); }
}
function endMechanic(){ const m=S.mechanic; if(!m) return; if(m.ped){ S.scene.remove(m.ped.mesh); const i=S.peds.indexOf(m.ped); if(i>=0) S.peds.splice(i,1); } m.car.mechanic=false; m.car.owned=false; m.car.ai=true; setTrafficFromPose(m.car); S.mechanic=null; }
