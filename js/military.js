// military.js — kartel puanı, polisin kaçması (yalnız SWAT), askerler ve düşman tanklar, "korkulan" statüsü, koruma hizmetleri
S.enemyTanks=[]; S.cartelPts=0; S.cartelBonus=0; S.repBonus=false; S.feared=false; S.stats.swatKills=S.stats.swatKills||0; S.stats.tanks=S.stats.tanks||0; Player.maxArmor=100;
function cartelPts(){ if(!S.repBonus && Object.values(S.rep||{}).some(v=>v>=50)){ S.repBonus=true; toast('Kartel puanı +2: bir kartel seni dost sayıyor'); } const s=S.stats; return (S.repBonus?2:0)+Math.floor((s.kills||0)/100)+Math.floor((s.copKills||0)/100)+Math.floor((s.swatKills||0)/100)+(S.cartelBonus||0); }
function cartelPtsInfo(){ const s=S.stats; return 'Kartel puanı '+S.cartelPts+' — kill '+(s.kills||0)+'/100, polis '+(s.copKills||0)+'/100, SWAT '+(s.swatKills||0)+'/100, kartel dostluğu '+(S.repBonus?'✓':'✗')+(S.cartelBonus?', hile +'+S.cartelBonus:''); }
function soldierLook(){ return {skin:pick(SKINS),shirt:0x3b4a2a,pants:0x2f3a22,hair:0x111111,helmet:true,jacket:0x4a5a3a,vest:false,shoes:0x1a1a1a}; }
function updateMilitary(dt){
  const old=S.cartelPts; S.cartelPts=cartelPts();
  if(S.cartelPts!==old && old!==undefined){ if(S.cartelPts>2.5 && old<=2.5) flashMsg('KARTEL SEVİYESİ','Polis artık senden kaçıyor; sadece SWAT geliyor'); if(S.cartelPts>=4 && old<4) flashMsg('ORDU ALARMI','3+ yıldızda askerler ve tanklar gelecek'); }
  const pp=Player.car?Player.car.pos:Player.pos;
  // askerler ve tanklar (kartel puanı 4+, 3+ yıldız)
  if(S.cartelPts>=4 && S.wanted>=3 && !S.dead && !S.busted){
    S.soldierT=(S.soldierT||0)-dt; const soldiers=S.cops.filter(c=>c.alive&&c.soldier).length;
    if(S.soldierT<=0 && soldiers<2+S.wanted){ S.soldierT=4; const n=randomNodeNear(pp.x,pp.z,40,80); spawnSoldier(n.x,n.z); }
    S.tankT=(S.tankT||0)-dt; if(S.tankT<=0 && S.enemyTanks.filter(t=>t.alive).length<(S.wanted>=5?2:1)){ S.tankT=18; spawnEnemyTank(); }
  }
  updateEnemyTanks(dt);
}
function flashMsg(a,b){ if(typeof flashMessage==='function') flashMessage(a,b,true); else toast(a+': '+b); }
function spawnSoldier(x,z){ const c=spawnCop(x,z,{swat:true,loyal:false,look:soldierLook(),armed:Math.random()<0.3?'m249':'m4'}); c.soldier=true; c.health=160; c.state='hunt'; if(!S.soldierSaid){ S.soldierSaid=true; S.subtitle={text:'Asker: Hedef görüldü, ateş serbest!',t:3}; } return c; }
function spawnEnemyTank(){
  const pp=Player.car?Player.car.pos:Player.pos; let lp=null; for(let t=0;t<12;t++){ const n=randomNodeNear(pp.x,pp.z,60,110); lp=nearestLanePoint(n); if(dist2D(lp,pp)>45) break; }
  const a=makeArmor('tank'); a.mesh.traverse(o=>{ if(o.isMesh && o.material && o.material.color && o.material.color.getHex()===0x3bff6b) o.material=new THREE.MeshBasicMaterial({color:0xff3030}); });
  const t={kind:'etank',mesh:a.mesh,turret:a.turret,pos:lp.clone(),heading:Math.atan2(pp.x-lp.x,pp.z-lp.z),speed:0,health:900,maxHealth:900,shootT:3,alive:true,leaveT:0};
  t.mesh.userData.entity={type:'etank',ref:t}; t.mesh.position.copy(t.pos); t.mesh.rotation.y=t.heading; S.scene.add(t.mesh); S.enemyTanks.push(t); toast('ORDU: Tank geliyor!'); playNoise(0.5,0.8,200); return t;
}
function damageEnemyTank(t,dmg,src){
  if(!t.alive) return; t.health-=dmg; if(dmg>5) addParticles(t.pos.clone().setY(1.5),0xffd36a,3);
  if(t.health<=0){ t.alive=false; explodeAt(t.pos.clone().setY(1),6,80,'blast'); t.mesh.traverse(o=>{ if(o.isMesh) o.material=_blackMat; }); if(src==='player'||src==='crew'||src==='ally'){ S.stats.tanks=(S.stats.tanks||0)+1; toast('Tank imha edildi ('+S.stats.tanks+'/5)'); if(S.stats.tanks>=5 && !S.feared){ S.feared=true; flashMsg('KORKULAN','5 tank parçaladın: artık kimse sana sataşmaya cesaret edemiyor'); } } }
}
function updateEnemyTanks(dt){
  const pp=Player.car?Player.car.pos:Player.pos;
  for(let i=S.enemyTanks.length-1;i>=0;i--){ const t=S.enemyTanks[i];
    if(!t.alive){ t.deadT=(t.deadT||0)+dt; if(t.deadT>30 || dist2D(t.pos,pp)>200){ S.scene.remove(t.mesh); S.enemyTanks.splice(i,1); } continue; }
    const d=dist2D(t.pos,pp); const leaving=S.wanted===0 || S.dead || S.busted; if(leaving){ t.leaveT+=dt; if(t.leaveT>12 || d>180){ S.scene.remove(t.mesh); S.enemyTanks.splice(i,1); continue; } } else t.leaveT=0;
    const tx=leaving?t.pos.x+Math.sin(t.heading)*50:pp.x, tz=leaving?t.pos.z+Math.cos(t.heading)*50:pp.z;
    const desired=Math.atan2(tx-t.pos.x,tz-t.pos.z); t.heading=lerpAngle(t.heading,desired,Math.min(1,dt*1.2));
    const want=leaving?7:(d>22?7:(d<12?-3:0)); t.speed+=clamp(want-t.speed,-8*dt,3*dt);
    t.pos.x+=Math.sin(t.heading)*t.speed*dt; t.pos.z+=Math.cos(t.heading)*t.speed*dt; collideWorld(t.pos,2.2);
    if(Math.abs(t.speed)>1.5){ for(const q of S.peds) if(q.alive && !q.riding && dist2D(q.pos,t.pos)<2.8) killPed(q,'car'); for(const c of S.cars) if(!c.dead && c!==Player.car && dist2D(c.pos,t.pos)<4.2){ c.pos.addScaledVector(new THREE.Vector3(c.pos.x-t.pos.x,0,c.pos.z-t.pos.z).normalize(),4.2-dist2D(c.pos,t.pos)); damageCar(c,20,'blast'); } if(Player.car && dist2D(Player.car.pos,t.pos)<4.2) damageCar(Player.car,25,'blast'); else if(!Player.car && dist2D(Player.pos,t.pos)<2.6) damagePlayer(40); }
    t.mesh.position.copy(t.pos); t.mesh.rotation.y=t.heading;
    if(!leaving){ const ta=Math.atan2(pp.x-t.pos.x,pp.z-t.pos.z)-t.heading; t.turret.rotation.y=lerpAngle(t.turret.rotation.y,ta,Math.min(1,dt*2)); t.shootT-=dt;
      if(t.shootT<=0 && d<70 && hasLOS(t.pos.clone().setY(2),pp.clone().setY(1.2))){ t.shootT=4.5; const from=new THREE.Vector3(); t.mesh.userData.muzzle.getWorldPosition(from); const dir=pp.clone().setY(1).sub(from).normalize(); dir.x+=rand(-0.04,0.04); dir.z+=rand(-0.04,0.04); fireProjectile('shell',from,dir,'tank'); } }
  }
}
// Koruma hizmetleri (mağaza: KORUMA sekmesi)
function buyVest(){ if(Player.maxArmor>=200){ toast('Zaten kurşun geçirmez yelek giyiyorsun'); return false; } Player.maxArmor=200; Player.armor=200; toast('Kurşun geçirmez yelek: zırh 200'); }
function hireBodyguards(n){ if(S.crew.length+n>CREW_MAX){ toast('Çete dolu'); return false; } for(let i=0;i<n;i++){ const nd=randomNodeNear(Player.pos.x,Player.pos.z,3,8); const p=spawnPed(nd,{gang:true,look:{skin:pick(SKINS),shirt:0xf4f4f4,pants:0x111111,hair:0x111111,jacket:0x1a1a1f,mafia:true,tie:0x111111,shades:true},noThug:true}); p.state='crew'; p.armed='mp5'; setHumanWeapon(p.mesh,'mp5'); p.health=160; p.armored=true; p.bodyguardHire=true; p.gang=true; S.crew.push(p); if(typeof crewJoinLook==='function') crewJoinLook(p); } toast(n+' özel koruma seninle'); }
function buyArmoredCar(){ const c=buyCar('suv'); const car=S.cars[S.cars.length-1]; if(car && car.owned){ car.health=400; car.maxHealth=400; car.armored=true; car.mesh.traverse(o=>{ if(o.isMesh && o.material && o.material.metalness!==undefined){ o.material=o.material.clone(); o.material.color.setHex(0x111111); } }); toast('Zırhlı SUV teslim edildi (4 kat dayanıklı)'); } return c; }
