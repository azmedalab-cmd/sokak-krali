// hitman.js — çatılarda bekleyen suikastçılar: baktığın hedefi K ile vurdur, sana yıldız gelmez
S.hitmen=[];
function hireHitman(silent){
  if(S.hitmen.length>=4){ if(!silent) toast('En fazla 4 suikastçı tutabilirsin'); return false; }
  const h={mesh:makeHuman({skin:pick(SKINS),shirt:0x111111,pants:0x111111,hair:0x111111,jacket:0x1a1a1a,cap:0x111111}),pos:new THREE.Vector3(),kills:0,relocT:0,facing:0};
  setHumanWeapon(h.mesh,'barrett'); h.mesh.userData.entity={type:'hitman'}; S.scene.add(h.mesh); S.hitmen.push(h); placeHitman(h);
  if(!silent){ toast('Suikastçı çatıya yerleşti. Birine bak ve K ile vurdur.'); S.subtitle={text:'Suikastçı: Yerimdeyim. Hedefi göster, gerisi bende.',t:3}; }
  return true;
}
function placeHitman(h){
  const pp=Player.car?Player.car.pos:Player.pos; let best=null,bs=1e9;
  for(const b of S.buildingMeshes){ const d=dist2D(b.position,pp); if(d<25||d>95) continue; const hgt=b.geometry.parameters?b.geometry.parameters.height:10; const score=d+(hgt<12?40:0)-hgt*0.5+Math.random()*10; if(score<bs){ bs=score; best=b; } }
  if(!best){ const n=randomNodeNear(pp.x,pp.z,20,60); h.pos.set(n.x,0,n.z); }
  else { const g=best.geometry.parameters; const dx=pp.x-best.position.x, dz=pp.z-best.position.z; const ex=Math.abs(dx)>Math.abs(dz); h.pos.set(best.position.x+(ex?Math.sign(dx)*(g.width/2-0.6):clamp(dx,-g.width/2+1,g.width/2-1)), best.position.y+g.height/2, best.position.z+(ex?clamp(dz,-g.depth/2+1,g.depth/2-1):Math.sign(dz)*(g.depth/2-0.6))); }
  h.mesh.position.copy(h.pos); h.relocT=0;
}
function updateHitmen(dt){
  const pp=Player.car?Player.car.pos:Player.pos;
  for(const h of S.hitmen){
    const d=dist2D(h.pos,pp); if(d>130){ h.relocT+=dt; if(h.relocT>3) placeHitman(h); } else h.relocT=0;
    h.facing=lerpAngle(h.facing,Math.atan2(pp.x-h.pos.x,pp.z-h.pos.z),Math.min(1,dt*2)); h.mesh.rotation.y=h.facing; animateHuman(h.mesh,0,dt,true);
  }
}
function hitmanStrike(){
  const t=S.lookTarget;
  if(!S.hitmen.length){ toast('Suikastçın yok: P menüsü → Servis → Suikastçı tut'); return; }
  if(!t){ toast('Yakın mesafeden birine bak, sonra K'); return; }
  let best=null,bd=160; for(const h of S.hitmen){ const d=dist2D(h.pos,t.pos); if(d<bd){ bd=d; best=h; } }
  if(!best){ toast('Suikastçılar çok uzakta; biraz bekle, yeniden konumlanıyorlar'); return; }
  const from=new THREE.Vector3(); best.mesh.userData.muzzle.getWorldPosition(from); const tgt=t.pos.clone().setY(1.3);
  best.mesh.userData.kick=1; addTracer(from,tgt); addFlash(from); playWeaponSound(WEAPONS.barrett,0.6); addBloodHit(tgt); addBloodHit(tgt); panicPeds(t.pos,25);
  if(t.type==='ped') killPed(t.ref,'hitman',undefined,best.pos); else if(t.type==='cop') damageCop(t.ref,500,'hitman');
  best.kills++; S.subtitle={text:'Suikastçı: '+pick(['Hedef indirildi.','Temiz iş.','Bir sonraki?','Kimse görmedi.']),t:2.5};
}
