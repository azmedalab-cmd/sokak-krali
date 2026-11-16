// player.js — eklemli insan modeli, animasyonlar (yürüme, boşta, silah çekme, geri tepme, pompa, ölüm), oyuncu, silah seçimi, ateş, kamera, 1. şahıs
// Kare + oval karışımı insan modeli: kutu gövde/kalça/üst uzuvlar, silindir alt uzuvlar, küre kafa/eklem/el; mafya kıyafeti seçeneği
function rcyl(rt,rb,h,mat,x,y,z,seg){ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||10),mat); m.position.set(x||0,y||0,z||0); m.castShadow=true; return m; }
function rsph(r,mat,x,y,z,sx,sy,sz){ const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),mat); m.position.set(x||0,y||0,z||0); if(sx) m.scale.set(sx,sy,sz); m.castShadow=true; return m; }
var _pinTex=null;
function pinstripeMat(color){ if(!_pinTex){ _pinTex=makeCanvasTex(64,64,g=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,64,64); g.fillStyle='rgba(0,0,0,0.55)'; for(let x=0;x<64;x+=8) g.fillRect(x,0,1,64); }); _pinTex.repeat.set(2,2); } return new THREE.MeshLambertMaterial({color,map:_pinTex}); }
var _patTex={};
function patternMat(kind,color){ if(!_patTex[kind]){ const t=makeCanvasTex(64,64,g=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,64,64); if(kind==='stripes'){ g.fillStyle='rgba(0,0,0,0.45)'; for(let y=0;y<64;y+=12) g.fillRect(0,y,64,5); } else if(kind==='check'){ g.fillStyle='rgba(0,0,0,0.4)'; for(let y=0;y<64;y+=16) for(let x=0;x<64;x+=16) if(((x+y)/16)%2===0) g.fillRect(x,y,16,16); g.fillStyle='rgba(0,0,0,0.2)'; for(let y=0;y<64;y+=16) g.fillRect(0,y,64,2); } else { g.fillStyle='rgba(255,255,255,0.9)'; for(let i=0;i<10;i++){ const x=(i*23)%64, y=(i*37)%64; g.beginPath(); g.arc(x,y,5,0,Math.PI*2); g.fill(); } g.fillStyle='rgba(0,0,0,0.35)'; for(let i=0;i<10;i++){ const x=(i*23+7)%64, y=(i*37+9)%64; g.beginPath(); g.arc(x,y,2,0,Math.PI*2); g.fill(); } } }); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(2,2); _patTex[kind]=t; } return new THREE.MeshLambertMaterial({color,map:_patTex[kind]}); }
function makeHuman(c){
  const g=new THREE.Group(); const L=matLambert;
  const skin=L(c.skin), shirt=c.pattern?patternMat(c.pattern,c.shirt):L(c.shirt), pants=L(c.pants), shoe=L(c.shoes||0x1a1a1a), dark=L(0x151515);
  const sw=0.44, outer=c.jacket?(c.pinstripe?pinstripeMat(c.jacket):L(c.jacket)):shirt;
  const torso=box(sw,0.56,0.26,shirt,0,1.26,0); g.add(torso);
  const hips=box(sw-0.06,0.14,0.22,c.pinstripe?pinstripeMat(c.pants):pants,0,0.9,0); g.add(hips);
  if(c.jacket){ g.add(box(sw+0.04,0.5,0.3,outer,0,1.25,0)); g.add(box(0.12,0.5,0.31,c.mafia?L(0xf4f4f4):shirt,0,1.25,0.0)); }
  if(c.mafia){ g.add(box(0.06,0.3,0.02,L(c.tie||0xb01030),0,1.3,0.16)); g.add(rsph(0.025,L(0xffffff),-0.16,1.44,0.15)); }
  for(const sx of [-1,1]) g.add(rsph(0.085,outer,sx*(sw/2),1.5,0));
  g.add(rcyl(0.055,0.06,0.1,skin,0,1.58,0));
  const head=rsph(0.145,skin,0,1.75,0,1,1.12,1); g.add(head);
  if(c.mafia||c.shades){ g.add(box(0.27,0.05,0.03,dark,0,1.78,0.125)); } else { g.add(rsph(0.022,dark,-0.055,1.78,0.12), rsph(0.022,dark,0.055,1.78,0.12)); }
  g.add(rsph(0.03,skin,0,1.73,0.14,1,1,1.3), box(0.07,0.014,0.02,L(0x7a3a3a),0,1.665,0.135));
  if(c.mafia&&c.cigar){ const cg=rcyl(0.012,0.012,0.11,L(0x5a3a1a),0.03,1.665,0.19); cg.rotation.x=Math.PI/2; cg.rotation.z=0.3; g.add(cg); const ember=rsph(0.013,new THREE.MeshBasicMaterial({color:0xff6a1a}),0.045,1.665,0.245); g.add(ember); }
  if(c.mustache) g.add(box(0.1,0.02,0.02,L(c.hair),0,1.695,0.135));
  const hs=c.hairStyle||'short', hair=L(c.hair);
  if(c.fedora){ const brim=rcyl(0.24,0.24,0.02,L(c.fedora),0,1.87,0.01,14); g.add(brim); g.add(rcyl(0.15,0.16,0.13,L(c.fedora),0,1.94,0,14)); g.add(rcyl(0.155,0.155,0.03,L(0x3a3a3a),0,1.89,0,14)); }
  else if(hs==='short'||hs==='long'){ const cap=new THREE.Mesh(new THREE.SphereGeometry(0.155,10,8,0,Math.PI*2,0,Math.PI*0.55),hair); cap.position.set(0,1.76,-0.005); cap.scale.set(1,1.1,1); cap.castShadow=true; g.add(cap); if(hs==='long') g.add(box(0.28,0.34,0.12,hair,0,1.57,-0.1)); }
  if(hs==='beanie' && !c.fedora){ const b=new THREE.Mesh(new THREE.SphereGeometry(0.165,10,8,0,Math.PI*2,0,Math.PI*0.6),L(c.capColor||0x883333)); b.position.set(0,1.76,0); b.scale.set(1,1.08,1); g.add(b); }
  if(c.cap && !c.fedora){ const b=new THREE.Mesh(new THREE.SphereGeometry(0.16,10,8,0,Math.PI*2,0,Math.PI*0.5),L(c.cap)); b.position.set(0,1.78,0); g.add(b); g.add(box(0.26,0.025,0.16,L(c.cap),0,1.82,0.22)); }
  if(c.helmet){ const h=new THREE.Mesh(new THREE.SphereGeometry(0.19,10,8,0,Math.PI*2,0,Math.PI*0.62),L(0x111111)); h.position.set(0,1.76,0); g.add(h); g.add(box(0.28,0.1,0.04,L(0x223344),0,1.78,0.16)); }
  if((c.suit||c.tie) && !c.mafia){ g.add(box(0.07,0.3,0.02,L(c.tie||0xb01030),0,1.32,0.145)); }
  const legMat=c.pinstripe?pinstripeMat(c.pants):pants;
  const mkLeg=x=>{ const p=new THREE.Group(); p.position.set(x,0.86,0); p.add(box(0.16,0.42,0.18,legMat,0,-0.21,0)); p.add(rsph(0.075,legMat,0,-0.42,0));
    const k=new THREE.Group(); k.position.y=-0.42; k.add(rcyl(0.07,0.06,0.4,c.shorts?skin:legMat,0,-0.2,0)); k.add(box(0.16,0.09,0.27,shoe,0,-0.44,0.04)); p.add(k); p.userData.knee=k; return p; };
  const sleeve=c.shortSleeve?skin:outer;
  const mkArm=x=>{ const p=new THREE.Group(); p.position.set(x,1.5,0); p.add(box(0.13,0.3,0.14,outer,0,-0.15,0)); p.add(rsph(0.06,sleeve,0,-0.3,0));
    const e=new THREE.Group(); e.position.y=-0.3; e.add(rcyl(0.055,0.048,0.3,sleeve,0,-0.15,0)); e.add(rsph(0.058,skin,0,-0.34,0,1,1.2,0.8)); p.add(e); p.userData.elbow=e; return p; };
  const legL=mkLeg(-0.1), legR=mkLeg(0.1), armL=mkArm(-(sw/2+0.05)), armR=mkArm(sw/2+0.05);
  const handR=new THREE.Object3D(); handR.position.set(0,-0.36,0.03); handR.rotation.x=Math.PI/2; armR.userData.elbow.add(handR);
  g.add(legL,legR,armL,armR);
  // aksesuarlar: yelek, baret, önlük, sırt çantası, kamera, gözlük, sakal, saç bandı, evrak çantası, baston
  if(c.vest){ g.add(box(sw+0.06,0.4,0.3,L(0xff9f1a),0,1.27,0)); g.add(box(sw+0.07,0.05,0.31,L(0xdddddd),0,1.2,0)); g.add(box(sw+0.07,0.05,0.31,L(0xdddddd),0,1.33,0)); }
  if(c.hardhat){ const h=new THREE.Mesh(new THREE.SphereGeometry(0.185,10,8,0,Math.PI*2,0,Math.PI*0.6),L(0xffd21a)); h.position.set(0,1.77,0); h.castShadow=true; g.add(h); g.add(rcyl(0.2,0.2,0.02,L(0xffd21a),0,1.73,0.02,14)); }
  if(c.apron){ g.add(box(sw-0.08,0.5,0.02,L(0xffffff),0,1.0,0.14)); }
  if(c.backpack){ g.add(box(0.3,0.36,0.14,L(c.backpackColor||pick([0x1f3a5a,0x7a1a1a,0x2a2a2a,0x3a5a2a])),0,1.28,-0.2)); for(const sx of [-1,1]) g.add(box(0.05,0.3,0.03,L(0x222222),sx*0.12,1.4,0.11)); }
  if(c.camera){ g.add(box(0.1,0.07,0.06,L(0x111111),0.05,1.15,0.17)); g.add(rcyl(0.025,0.025,0.03,L(0x333333),0.05,1.15,0.21)); g.add(box(0.02,0.3,0.01,L(0x111111),-0.08,1.35,0.14)); }
  if(c.glasses){ g.add(box(0.26,0.035,0.012,L(0x111111),0,1.78,0.14)); for(const sx of [-1,1]) g.add(box(0.01,0.01,0.14,L(0x111111),sx*0.13,1.78,0.07)); }
  if(c.beard){ g.add(box(0.16,0.07,0.07,L(c.hair),0,1.645,0.1)); }
  if(c.headband){ g.add(rcyl(0.158,0.158,0.035,L(0xff3b3b),0,1.8,0,12)); }
  if(c.briefcase){ const b=box(0.3,0.22,0.08,L(0x3a2a1a),0,-0.5,0); b.add(box(0.1,0.03,0.02,L(0x222222),0,0.13,0)); armL.userData.elbow.add(b); }
  if(c.cane){ const cn=rcyl(0.012,0.012,0.85,L(0x5a3a1a),0,-0.62,0.06); armL.userData.elbow.add(cn); cn.add(rsph(0.02,L(0x8a6a3a),0,0.42,0)); }
  if(c.radio){ g.add(box(0.05,0.1,0.03,L(0x111111),-0.16,1.4,0.15)); g.add(rcyl(0.004,0.004,0.1,L(0x222222),-0.16,1.5,0.15)); }
  if(c.parcel){ g.add(box(0.42,0.3,0.32,L(0xc8a06a),0,1.12,0.34)); g.add(box(0.44,0.03,0.34,L(0x8a6a3a),0,1.2,0.34)); }
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  const muzzleFist=new THREE.Object3D(); muzzleFist.position.set(0,-0.4,0.1); armR.userData.elbow.add(muzzleFist);
  g.userData={carry:!!c.parcel,torso,head,legL,legR,armL,armR,foreL:armL.userData.elbow,foreR:armR.userData.elbow,shinL:legL.userData.knee,shinR:legR.userData.knee,handR,muzzle:muzzleFist,muzzleFist,weapon:null,wid:null,phase:Math.random()*6,twoHanded:false,drawT:0,kick:0,pumpT:0,female:false};
  return g;
}
// Araçta oturma pozu (sürücü/yolcu): bacaklar öne, kollar direksiyonda ya da kucakta
function setSeated(g,on,driver){ const u=g.userData; u.seated=on; if(!on) return; u.legL.rotation.x=-1.45; u.legR.rotation.x=-1.45; u.shinL.rotation.x=1.5; u.shinR.rotation.x=1.5; if(driver){ u.armL.rotation.x=-1.0; u.armR.rotation.x=-1.0; u.foreL.rotation.x=-0.5; u.foreR.rotation.x=-0.5; u.armL.rotation.z=0.15; u.armR.rotation.z=-0.15; } else { u.armL.rotation.x=-0.5; u.armR.rotation.x=-0.5; u.foreL.rotation.x=-1.0; u.foreR.rotation.x=-1.0; u.armL.rotation.z=0; u.armR.rotation.z=0; } u.torso.rotation.x=0; u.torso.rotation.z=0; u.torso.rotation.y=0; u.head.rotation.y=0; }
var MELEE_STYLE={fist:'punch',knuckles:'punch',knife:'stab'};
function setHumanWeapon(g,wid){
  const u=g.userData; if(u.weapon){ u.handR.remove(u.weapon); u.weapon=null; }
  u.wid=wid||null; u.drawT=0.3; u.lpose=null; u.meleeStyle=MELEE_STYLE[wid]||((wid&&wid!=='fist')?'swing':'punch');
  if(wid && wid!=='fist'){ u.weapon=makeWeaponModel(wid); u.weapon.scale.setScalar(1.2); u.handR.add(u.weapon); u.muzzle=u.weapon.userData.muzzle; }
  else u.muzzle=u.muzzleFist;
  const w=wid&&WEAPONS[wid]; u.twoHanded=!!(w && !w.melee && w.cat!=='pistol' && w.cat!=='thrown');
  if(u.twoHanded && u.weapon && u.weapon.userData.lhand){ u.rpose=solveRightArm(g); u.lpose=leftHandPose(g); }
}
// Sol el için 2 eklemli IK: üst kol (x,z) ve dirsek bükümünü sayısal arayarak eli silahın kundağına yerleştirir (silah başına önbellek)
var _LPOSE={}, AIM_R2={x:-0.95,z:-0.45,fore:-0.62,hand:-0.45}, AIM_R1={x:-Math.PI/2+0.12,z:0,fore:0,hand:0};
function aimOff(mesh){ return 0; }
// Sağ kol için sayısal çözüm: namlu gövdeye göre tam ileri, kabza göğüs önünde (insan tipi başına önbellek)
var _RPOSE={};
function solveRightArm(g){
  const u=g.userData, key="r_"+u.armR.position.x.toFixed(2); if(_RPOSE[key]) return _RPOSE[key];
  const w=u.weapon; if(w) u.handR.remove(w); const probe=new THREE.Object3D(); probe.position.set(0,0,0.5); u.handR.add(probe);
  const sv=[g.rotation.y,g.position.x,g.position.y,g.position.z,u.armR.rotation.x,u.armR.rotation.z,u.foreR.rotation.x,u.handR.rotation.y];
  g.rotation.y=0; g.position.set(0,0,0); g.updateMatrixWorld(true);
  const tgt=new THREE.Vector3(-0.06,1.26,0.22), gp=new THREE.Vector3(), mp=new THREE.Vector3(); let best=null,bd=1e9;
  for(let ax=-1.9;ax<=0.9;ax+=0.1) for(let az=-0.9;az<=0.2;az+=0.1) for(let bend=-2.4;bend<=0;bend+=0.1) for(let dy=-1.0;dy<=1.0;dy+=0.2){
    u.armR.rotation.x=ax; u.armR.rotation.z=az; u.foreR.rotation.x=bend; u.handR.rotation.y=dy; u.armR.updateMatrixWorld(true);
    u.handR.getWorldPosition(gp); probe.getWorldPosition(mp); mp.sub(gp).normalize();
    const cost=(mp.x*mp.x+mp.y*mp.y+(mp.z-1)*(mp.z-1))*7+gp.distanceToSquared(tgt); if(cost<bd){ bd=cost; best={x:ax,z:az,fore:bend,hand:dy}; }
  }
  u.handR.remove(probe); if(w) u.handR.add(w);
  g.rotation.y=sv[0]; g.position.set(sv[1],sv[2],sv[3]); u.armR.rotation.x=sv[4]; u.armR.rotation.z=sv[5]; u.foreR.rotation.x=sv[6]; u.handR.rotation.y=sv[7];
  _RPOSE[key]=best; return best;
}
function leftHandPose(g){
  const u=g.userData, key=u.wid+'_'+u.armL.position.x.toFixed(2)+'_'+(u.rpose?u.rpose.x.toFixed(2)+u.rpose.z.toFixed(2):''); if(_LPOSE[key]) return _LPOSE[key];
  const save=[u.armR.rotation.x,u.armR.rotation.z,u.foreR.rotation.x,g.rotation.y,g.position.x,g.position.y,g.position.z];
  const RP=u.rpose||AIM_R2; u.armR.rotation.x=RP.x; u.armR.rotation.z=RP.z; u.foreR.rotation.x=RP.fore; u.handR.rotation.y=RP.hand; g.rotation.y=0; g.position.set(0,0,0); g.updateMatrixWorld(true);
  const T=g.worldToLocal(u.weapon.localToWorld(u.weapon.userData.lhand.clone())), G=g.worldToLocal(u.weapon.localToWorld(new THREE.Vector3(0,0,0)));
  u.armR.rotation.x=save[0]; u.armR.rotation.z=save[1]; u.foreR.rotation.x=save[2]; u.handR.rotation.y=0; g.rotation.y=save[3]; g.position.set(save[4],save[5],save[6]);
  const Sh=u.armL.position.clone(), L1=0.3, L2=0.34; let best=null,bd=1e9;
  // Kundak noktası kol boyunu aşıyorsa eli namlu ekseni boyunca geriye, ulaşılabilir yere kaydır
  for(let s=1;s>=0;s-=0.05){ const P=G.clone().lerp(T,s); if(P.distanceTo(Sh)<=0.6){ T.copy(P); break; } if(s<=0.05){ T.copy(G).lerp(T,0.05); } }
  const e1=new THREE.Euler(), e2=new THREE.Euler(), v1=new THREE.Vector3(), v2=new THREE.Vector3();
  for(let ax=-2.4;ax<=0.4;ax+=0.08) for(let az=-0.4;az<=1.5;az+=0.08) for(let bend=-2.4;bend<=0;bend+=0.12){
    e1.set(ax,0,az,'XYZ'); v1.set(0,-L1,0).applyEuler(e1); e2.set(bend,0,0); v2.set(0,-L2,0).applyEuler(e2).applyEuler(e1);
    const hx=Sh.x+v1.x+v2.x, hy=Sh.y+v1.y+v2.y, hz=Sh.z+v1.z+v2.z; const d=(hx-T.x)**2+(hy-T.y)**2+(hz-T.z)**2+(bend>-0.2?0.02:0);
    if(d<bd){ bd=d; best={ax,az,bend}; }
  }
  _LPOSE[key]=best; return best;
}
// Vuruş bölgesi: kafa / gövde / kol / bacak (yerel koordinatlarda)
function bodyPart(mesh,point){ const l=mesh.worldToLocal(point.clone()); if(l.y>1.56) return 'head'; if(l.y<0.86) return 'leg'; if(Math.abs(l.x)>0.24) return 'arm'; return 'torso'; }
var PART_MULT={head:3,torso:1,arm:0.7,leg:0.6};
function animateHuman(g,speed,dt,aiming,swing,handsUp){
  const u=g.userData; if(u.seated) return; u.phase+=dt*Math.max(speed,0)*2.4;
  u.drawT=Math.max(0,u.drawT-dt); u.kick=Math.max(0,u.kick-dt*7); u.pumpT=Math.max(0,u.pumpT-dt);
  const k=Math.min(1,speed/3), a=Math.sin(u.phase)*k*0.8, run=clamp((speed-4)/5,0,1), idle=1-k;
  if(u.limp){ u.legL.rotation.x=a*0.4; u.legR.rotation.x=-a; u.shinL.rotation.x=0.9; u.shinR.rotation.x=clamp(a,0,1)*1.1+0.1*k; u.torso.rotation.z=0.12+Math.abs(a)*0.1; }
  else { u.legL.rotation.x=a; u.legR.rotation.x=-a; u.shinL.rotation.x=clamp(-a,0,1)*1.1+0.1*k; u.shinR.rotation.x=clamp(a,0,1)*1.1+0.1*k; }
  const breathe=Math.sin(S.time*1.6+u.phase)*0.012*idle, bob=Math.abs(Math.cos(u.phase))*k*0.035;
  u.torso.position.y=1.26+bob+breathe; u.head.position.y=1.75+bob+breathe; u.torso.rotation.x=run*0.18;
  u.torso.rotation.y=a*0.12; if(!u.limp) u.torso.rotation.z=a*(u.female?0.06:0.035); u.head.rotation.y=-a*0.1+Math.sin(S.time*0.7+u.phase)*0.08*idle;
  const draw=1-u.drawT/0.3, kick=u.kick, pump=Math.sin(Math.min(1,u.pumpT/0.5)*Math.PI);
  if(handsUp){ u.armL.rotation.x=-Math.PI+0.2; u.armR.rotation.x=-Math.PI+0.2; u.armL.rotation.z=-0.25; u.armR.rotation.z=0.25; u.foreL.rotation.x=0; u.foreR.rotation.x=0; }
  else if(swing!==undefined){ const st=u.meleeStyle||'swing', s=Math.sin(Math.min(1,swing)*Math.PI);
    if(st==='punch'){ const L=!!u.punchLeft; const A=L?u.armL:u.armR, F=L?u.foreL:u.foreR, B=L?u.armR:u.armL, G=L?u.foreR:u.foreL; A.rotation.x=-0.5-1.2*s; A.rotation.z=(L?0.15:-0.15)*(1-s); F.rotation.x=-1.1*(1-s)-0.05; B.rotation.x=-0.9; B.rotation.z=L?-0.35:0.35; G.rotation.x=-1.6; u.torso.rotation.y=(L?-0.4:0.4)*s; u.torso.rotation.x=0.12*s; u.head.rotation.y=(L?0.2:-0.2)*s; } // yumruk: dönüşümlü sol/sağ direkt, gövde dönüşü
    else if(st==='stab'){ u.armR.rotation.x=-0.4-1.3*s; u.armR.rotation.z=-0.1; u.foreR.rotation.x=-1.3*(1-s); u.handR.rotation.y=0; u.armL.rotation.x=-0.8; u.armL.rotation.z=0.3; u.foreL.rotation.x=-1.2; u.torso.rotation.y=0.45*s; u.torso.rotation.x=0.2*s; } // bıçak: öne saplama
    else { u.armR.rotation.x=-2.3+swing*2.4; u.armR.rotation.z=-0.2; u.foreR.rotation.x=-0.5+swing*0.3; u.armL.rotation.x=-a*0.5; u.armL.rotation.z=0; u.foreL.rotation.x=-0.3; u.torso.rotation.y=-0.3+swing*0.7; } } // sopa/pala: tepeden savurma
  else if(aiming){ const AR=u.twoHanded?(u.rpose||AIM_R2):AIM_R1; const aimX=AR.x+kick*0.3; u.armR.rotation.x=a*(1-draw)+aimX*draw; u.armR.rotation.z=AR.z*draw; u.foreR.rotation.x=-0.25*(1-draw)+AR.fore*draw; u.handR.rotation.y=AR.hand*draw;
    if(u.twoHanded){ const lp=u.lpose||{ax:-Math.PI/2+0.4,az:0.85,bend:-0.7}; u.armL.rotation.x=(-a)*(1-draw)+(lp.ax+pump*0.3+kick*0.25)*draw; u.armL.rotation.z=lp.az*draw; u.foreL.rotation.x=lp.bend*draw; } else { u.armL.rotation.x=-a*0.4; u.armL.rotation.z=0; u.foreL.rotation.x=-0.3; } }
  else { u.handR.rotation.y=0; u.armL.rotation.x=-a+Math.sin(S.time*1.3+u.phase)*0.04*idle; u.armR.rotation.x=a-Math.sin(S.time*1.3+u.phase)*0.04*idle; u.armL.rotation.z=0.04*idle; u.armR.rotation.z=-0.04*idle; u.foreL.rotation.x=-0.25-0.4*run; u.foreR.rotation.x=-0.25-0.4*run; }
  if(u.carry && swing===undefined && !handsUp){ u.armL.rotation.x=-1.15; u.armR.rotation.x=-1.15; u.foreL.rotation.x=-0.55; u.foreR.rotation.x=-0.55; u.armL.rotation.z=0.12; u.armR.rotation.z=-0.12; }
  if(u.armHang){ u.armL.rotation.x=0.1; u.armL.rotation.z=0.15; u.foreL.rotation.x=-0.1; }
  if(u.weapon) u.weapon.position.z=-kick*0.07;
}
// Ölüm animasyonu: style: back | front | crumple | fly
function animateFall(g,deadT,style){
  const k=Math.min(1,deadT/0.35), u=g.userData; style=style||'back';
  if(style==='back'){ g.rotation.x=-Math.PI/2*k*k; g.position.y=0.3*k; }
  else if(style==='front'){ g.rotation.x=Math.PI/2*k*k; g.position.y=0.3*k; u.armL.rotation.x=-1.2*k; u.armR.rotation.x=-1.2*k; }
  else if(style==='crumple'){ const c1=Math.min(1,deadT/0.3), c2=clamp((deadT-0.3)/0.4,0,1); u.shinL.rotation.x=1.6*c1; u.shinR.rotation.x=1.6*c1; u.legL.rotation.x=-0.8*c1; u.legR.rotation.x=-0.8*c1; u.torso.rotation.x=0.5*c1; g.position.y=-0.55*c1+0.4*c2; g.rotation.z=(Math.PI/2)*c2*c2; }
  else { g.rotation.x=(-Math.PI/2)*k; g.rotation.z=deadT*2; g.position.y=Math.max(0.3,g.position.y); }
}

var Player={ pos:new THREE.Vector3(), vy:0, onGround:true, health:100, maxHealth:100, armor:0, mesh:null, car:null, seat:0, wid:'glock', owned:{fist:true,glock:true}, cooldown:0, facing:0, aiming:false, hurtT:0, fp:false, recoil:0, deadT:0, deathStyle:'back', view:null, bobPhase:0, meleeT:0, meleeHit:false, sway:{x:0,y:0} };
function initPlayer(){
  Player.mesh=makeHuman(Object.assign({},S.look||{skin:0xe0b090, shirt:0xf0f0f0, pants:0x2b2f4a, hair:0x2a1a0e, jacket:0x2d7a4f, shoes:0x222222},{female:false})); if(typeof bodyScale==='function') bodyScale(Player.mesh);
  Player.mesh.userData.entity={type:'player'};
  const hp=S.places.hospital||{x:30,z:30}; Player.pos.set(hp.x, 0, hp.z+6);
  S.scene.add(Player.mesh); S.scene.add(S.camera);
  WEAPONS.glock.cur=WEAPONS.glock.ammo;
  Player.view=new THREE.Group(); S.camera.add(Player.view);
  setHumanWeapon(Player.mesh,Player.wid); updateViewModel();
}
function ownedIn(cat){ return Object.keys(WEAPONS).filter(id=>WEAPONS[id].cat===cat && Player.owned[id]); }
function giveWeapon(id,ammo){
  const w=WEAPONS[id]; if(!w) return;
  if(!Player.owned[id]){ Player.owned[id]=true; if(!w.melee) w.cur=(ammo!==undefined?ammo:w.ammo); toast(w.name+' alındı'); if(WEAPONS[Player.wid].cat===w.cat || Player.wid==='fist' || Player.wid==='glock'&&w.cat==='pistol') equip(id); }
  else if(!w.melee){ w.cur+=(ammo!==undefined?ammo:w.pack); toast(w.name+' mermisi +'+(ammo!==undefined?ammo:w.pack)); }
  else toast(w.name+' zaten sende');
}
function equip(id){ Player.wid=id; setHumanWeapon(Player.mesh,id); updateViewModel(); playTone(400,0.05,0.15,'square'); S.weaponShowT=2.5; Player.drawT=0.3; }
function switchCategory(dir){
  const cats=WCATS.filter(c=>ownedIn(c).length); if(!cats.length) return;
  let i=cats.indexOf(WEAPONS[Player.wid].cat); i=(i+(dir||1)+cats.length)%cats.length;
  const list=ownedIn(cats[i]); equip(Player.lastIn&&Player.lastIn[cats[i]]&&list.includes(Player.lastIn[cats[i]])?Player.lastIn[cats[i]]:list[0]);
}
function selectCategory(i){ const list=ownedIn(WCATS[i]); if(!list.length){ toast(WCAT_NAMES[WCATS[i]]+': silahın yok'); return; } equip((Player.lastIn&&Player.lastIn[WCATS[i]]&&list.includes(Player.lastIn[WCATS[i]]))?Player.lastIn[WCATS[i]]:list[0]); }
function switchModel(dir){
  const cat=WEAPONS[Player.wid].cat, list=ownedIn(cat); if(list.length<2){ S.weaponShowT=1.5; return; }
  const i=(list.indexOf(Player.wid)+dir+list.length)%list.length; equip(list[i]); Player.lastIn=Player.lastIn||{}; Player.lastIn[cat]=list[i];
}
// Birinci şahıs görünümü: iki kol + silah; nişan (ADS), koşu ve sallanma animasyonları animateView'da
function updateViewModel(){
  const v=Player.view; while(v.children.length) v.remove(v.children[0]); const w=WEAPONS[Player.wid];
  const L=S.look||{}; const sleeve=matLambert(L.jacket||L.shirt||0x2d7a4f), skin=matLambert(L.skin||0xe0b090);
  const inner=new THREE.Group(); v.add(inner); v.userData.inner=inner;
  const armR=box(0.08,0.08,0.42,sleeve,0.05,-0.08,0.1); armR.rotation.x=0.5; inner.add(armR); inner.add(box(0.09,0.08,0.1,skin,0,-0.02,-0.03));
  if(Player.wid!=='fist'){ const m=makeWeaponModel(Player.wid); m.position.set(0,0,0); m.rotation.y=Math.PI; m.scale.setScalar(1.1); inner.add(m); v.userData.muzzle=m.userData.muzzle; v.userData.gun=m;
    if(w.cat!=='pistol' && !w.melee && w.cat!=='thrown'){ const armL=box(0.08,0.08,0.36,sleeve,-0.14,-0.12,-0.1); armL.rotation.x=0.35; armL.rotation.y=0.5; inner.add(armL); inner.add(box(0.09,0.08,0.1,skin,-0.05,-0.03,-0.25)); } }
  else { v.userData.muzzle=null; v.userData.gun=null; inner.add(box(0.09,0.08,0.12,skin,-0.5,0.02,-0.05)); }
  v.traverse(o=>{ if(o.isMesh){ o.castShadow=false; } });
}
function animateView(dt){
  const v=Player.view, w=WEAPONS[Player.wid], run=S.keys.ShiftLeft && !Player.aiming && Player.moving;
  const ads=Player.aiming && S.mouse.rdown && !w.melee && w.cat!=='thrown';
  const tp=ads?[0.0,-0.19,-0.42]:run?[0.34,-0.36,-0.5]:[0.27,-0.27,-0.55], tr=ads?[0,0,0]:run?[0.35,-0.5,0.15]:[0.06,0.0,0.0];
  v.userData.t=v.userData.t||[0.27,-0.27,-0.55,0,0,0]; const t=v.userData.t, k=Math.min(1,dt*10);
  for(let i=0;i<3;i++){ t[i]+=(tp[i]-t[i])*k; t[i+3]+=(tr[i]-t[i+3])*k; }
  Player.sway.x+=(0-Player.sway.x)*Math.min(1,dt*6); Player.sway.y+=(0-Player.sway.y)*Math.min(1,dt*6);
  const bobA=Player.moving?(run?0.02:0.01):0.002;
  v.position.set(t[0]+Math.cos(Player.bobPhase*0.5)*bobA-Player.sway.x*0.0006, t[1]+Math.sin(Player.bobPhase)*bobA-Player.recoil*0.015+Player.sway.y*0.0004, t[2]+Player.recoil*0.07);
  v.rotation.set(t[3]+Player.recoil*0.1-Player.sway.y*0.0012, t[4]-Player.sway.x*0.0012, t[5]);
  const dr=Player.drawT=Math.max(0,(Player.drawT||0)-dt); v.position.y-=dr*0.9; v.rotation.x+=dr*1.5;
  const inner=v.userData.inner; if(inner){
    if(w.melee){ const st=MELEE_STYLE[Player.wid]||'swing'; const ph=Player.meleeT>0?1-Player.meleeT/w.rate:0; const s=Math.sin(Math.min(1,ph)*Math.PI);
      if(st==='punch'){ const L=!!Player.punchLeft; inner.position.set((L?0.5:-0.15)*s,0.08*s,-0.45*s); inner.rotation.set(-0.25*s,(L?-0.4:0.4)*s,0); }
      else if(st==='stab'){ inner.position.set(-0.1*s,0.03*s,-0.5*s); inner.rotation.set(-0.5*s,0.35*s,0.4*s); }
      else if(w.auto){ const on=S.mouse.down?1:0.15; inner.position.set(Math.sin(S.time*60)*0.012*on,Math.cos(S.time*50)*0.012*on,-0.08*on); inner.rotation.set(0,0,0); }
      else { inner.position.set(0.3*s,0.15*s,-0.35*s); inner.rotation.set(-0.6*s,1.2*s,0.5*s); }
    } else { inner.position.set(0,0,0); inner.rotation.set(0,0,0); }
  }
}
function camForward(){ return new THREE.Vector3(-Math.sin(S.yaw),0,-Math.cos(S.yaw)); }
function camRight(){ return new THREE.Vector3(Math.cos(S.yaw),0,-Math.sin(S.yaw)); }

function updatePlayer(dt){
  if(S.dead){ Player.deadT+=dt; animateFall(Player.mesh,Player.deadT,Player.deathStyle); Player.mesh.position.set(Player.pos.x,Player.mesh.position.y,Player.pos.z); return; }
  if(S.busted) return;
  if(Player.car){ if(Player.seat===0) updateDriving(dt); else updatePassenger(dt); return; }
  const k=S.keys, p=Player, w=WEAPONS[p.wid];
  let mx=(k.KeyD?1:0)-(k.KeyA?1:0), mz=(k.KeyW?1:0)-(k.KeyS?1:0);
  const f=camForward(), r=camRight();
  const move=new THREE.Vector3().addScaledVector(f,mz).addScaledVector(r,mx);
  const moving=move.lengthSq()>0; if(moving) move.normalize(); p.moving=moving;
  p.aiming = (S.mouse.rdown || S.mouse.down) && (!w.melee || w.auto);
  const speed = p.aiming ? 3.2 : (k.ShiftLeft ? 9 : 5);
  p.pos.addScaledVector(move, speed*dt);
  if(k.Space && p.onGround){ p.vy=S.superJump?13:6.5; p.onGround=false; }
  p.vy -= 18*dt; p.pos.y += p.vy*dt; if(p.pos.y<=0){ p.pos.y=0; p.vy=0; p.onGround=true; }
  collideWorld(p.pos, 0.35);
  for(const c of S.cars){ const rr=(c.spec.r||1.7)+0.6; const d=dist2D(p.pos,c.pos); if(d<rr){ const dx=(p.pos.x-c.pos.x)/(d||1), dz=(p.pos.z-c.pos.z)/(d||1); p.pos.x=c.pos.x+dx*rr; p.pos.z=c.pos.z+dz*rr; } }
  const want = (p.aiming||p.fp||p.meleeT>0) ? S.yaw+Math.PI+(p.aiming?aimOff(p.mesh):0) : (moving ? Math.atan2(move.x,move.z) : p.facing);
  p.facing = lerpAngle(p.facing, want, Math.min(1, dt*14));
  p.mesh.position.copy(p.pos); p.mesh.rotation.y=p.facing;
  let swing; if(p.meleeT>0){ p.meleeT-=dt; swing=1-clamp(p.meleeT/w.rate,0,1); if(swing>0.45 && !p.meleeHit){ p.meleeHit=true; meleeHit(w); } }
  animateHuman(p.mesh, moving?speed:0, dt, p.aiming, swing);
  p.bobPhase+=dt*(moving?speed*1.8:0);
  if(p.aiming && !w.melee && w.cat!=='thrown') updateAimTarget(); else S.aimedPed=null;
  if(typeof updateLookTarget==='function') updateLookTarget();
  p.cooldown-=dt; p.recoil=Math.max(0,p.recoil-dt*6);
  if(S.mouse.down && p.cooldown<=0 && (w.auto || !S.mouse.wasDown)) fireWeapon(w);
  S.mouse.wasDown=S.mouse.down;
  if(p.hurtT>0) p.hurtT-=dt;
}
function toggleView(){ Player.fp=!Player.fp; toast(Player.fp?'Birinci şahıs':'Üçüncü şahıs'); }
var _rc=new THREE.Raycaster();
function muzzleWorld(){ const v=new THREE.Vector3(); const m=(Player.fp && !Player.car && Player.view.userData.muzzle) ? Player.view.userData.muzzle : Player.mesh.userData.muzzle; m.getWorldPosition(v); return v; }
function fireWeapon(w){
  const p=Player;
  if(w.melee){
    if(w.auto){ p.cooldown=w.rate; playWeaponSound(w,1); meleeHit(w); p.recoil=0.4; return; }
    if(p.meleeT>0) return; p.meleeT=w.rate; p.meleeHit=false; p.cooldown=w.rate; playWeaponSound(w,1); p.recoil=1; p.mesh.userData.punchLeft=!p.mesh.userData.punchLeft; p.punchLeft=p.mesh.userData.punchLeft; return; }
  if(w.cur<=0){ playTone(200,0.08,0.2,'square'); p.cooldown=0.3; return; }
  p.cooldown=w.rate; if(!S.infAmmo) w.cur--;
  playWeaponSound(w,1);
  const muzzle=muzzleWorld(); if(!w.silent && w.cat!=='thrown') gunshotNoise(p.pos);
  p.recoil=w.flame?0.3:1; S.pitch-=w.kick; S.yaw+=rand(-w.kick,w.kick)*0.5; p.mesh.userData.kick=1; if(w.cat==='shotgun' && !w.auto) p.mesh.userData.pumpT=0.5;
  _rc.setFromCamera({x:0,y:0},S.camera); const cdir=_rc.ray.direction.clone();
  if(w.flame){ flameAttack(muzzle,cdir,w); return; }
  if(w.projectile){ fireProjectile(w.projectile, w.cat==='thrown'?Player.pos.clone().add(new THREE.Vector3(0,1.5,0)):muzzle, cdir, 'player'); if(w.cat!=='thrown') addFlash(muzzle); return; }
  const pellets=w.pellets||1;
  const targets=S.buildingMeshes.concat(S.peds.filter(x=>x.alive).map(x=>x.mesh), S.cops.filter(x=>x.alive).map(x=>x.mesh), S.cars.map(x=>x.mesh), S.heli&&S.heli.alive?[S.heli.mesh]:[], (S.enemyTanks||[]).filter(t=>t.alive).map(t=>t.mesh));
  for(let i=0;i<pellets;i++){
    _rc.setFromCamera({x:0,y:0}, S.camera);
    _rc.ray.direction.x+=rand(-w.spread,w.spread); _rc.ray.direction.y+=rand(-w.spread,w.spread); _rc.ray.direction.z+=rand(-w.spread,w.spread); _rc.ray.direction.normalize();
    _rc.near=0.1; _rc.far=w.range+6;
    const hits=_rc.intersectObjects(targets,true);
    let end=_rc.ray.at(w.range+6, new THREE.Vector3()), ent=null;
    const entOf=h=>{ let o=h.object; while(o && !o.userData.entity) o=o.parent; return o?o.userData.entity:null; };
    for(let hi=0;hi<hits.length;hi++){ const h=hits[hi]; const e=entOf(h);
      if(e && e.type==='player') continue;
      if(e && e.type==='car' && Player.car===e.ref) continue; // kendi aracın: içeriden ateşte mermi aracı delmez
      if(e && (e.type==='ped'||e.type==='cop') && e.ref.riding && e.ref.riding===Player.car) continue; // kendi aracındaki yolcular
      if(e && e.type==='car'){ let occ=null; for(let hj=hi+1;hj<hits.length && hits[hj].distance-h.distance<2.8;hj++){ const e2=entOf(hits[hj]); if(e2 && (e2.type==='ped'||e2.type==='cop') && e2.ref.riding===e.ref){ occ={h:hits[hj],e:e2}; break; } } if(occ){ end=occ.h.point; ent=occ.e; break; } } // araçtaki kişi: cam/gövde arkasındaki yolcuyu vur
      end=h.point; ent=e; break; }
    addTracer(muzzle,end); if(ent) applyHit(ent, w.dmg, end);
  }
  addFlash(muzzle); addShell(muzzle);
}
function applyHit(ent, dmg, point){
  if(ent.type==='ped'||ent.type==='cop'){ const part=bodyPart(ent.ref.mesh,point); const m=PART_MULT[part]*(part==='head'&&ent.ref.swat?0.5:1); addBloodHit(point); if(part==='head') addBloodHit(point);
    if(ent.type==='ped') damagePed(ent.ref, dmg*m, 'player', part); else damageCop(ent.ref, dmg*m, 'player', part); return; }
  else if(ent.type==='car'){ damageCar(ent.ref, dmg*0.2, 'player'); addParticles(point, 0xffd36a, 4); }
  else if(ent.type==='heli'){ damageHeli(dmg); addParticles(point, 0xffd36a, 4); }
  else if(ent.type==='etank'){ damageEnemyTank(ent.ref, dmg*0.15, 'player'); addParticles(point, 0xffd36a, 5); }
  else addParticles(point, 0xaaaaaa, 3);
}
function meleeHit(w){
  const p=Player, f=new THREE.Vector3(Math.sin(p.facing),0,Math.cos(p.facing));
  const list=S.peds.filter(x=>x.alive).map(x=>({e:x,t:'ped'})).concat(S.cops.filter(x=>x.alive).map(x=>({e:x,t:'cop'})));
  for(const it of list){
    const d=new THREE.Vector3().subVectors(it.e.pos,p.pos); const L=d.length(); if(L>w.range) continue;
    if(d.normalize().dot(f)<0.4) continue;
    if(it.t==='ped'){ damagePed(it.e, w.dmg, 'player'); pedSay(it.e); } else damageCop(it.e, w.dmg, 'player');
    it.e.pos.addScaledVector(f,w.knock||0.6); if(p.wid==='fist'||p.wid==='bat'||p.wid==='knuckles') addParticles(it.e.pos.clone().setY(1.2),0xffffff,4); else addBloodHit(it.e.pos.clone().setY(1.2)); playNoise(0.08,0.4,600); return;
  }
  for(const c of S.cars){ if(!c.dead && dist2D(c.pos,p.pos)<(c.spec.r||1.7)+1.2){ damageCar(c,w.dmg*0.4,'player'); addParticles(c.pos.clone().setY(1),0xffd36a,4); playNoise(0.15,0.5,500); return; } }
}
function damagePlayer(n){
  if(S.dead||S.busted||S.godMode) return;
  const a=Math.min(Player.armor, n*0.65); Player.armor-=a; n-=a;
  Player.health-=n; Player.hurtT=0.35;
  if(Player.health<=0){ Player.health=0; playerDie(); }
}

// ---- Kamera ----
function seatOffset(c,seat){ const h=c.heading, w=c.spec.w; const lx=seat%2===0?-w/4:w/4, lz=seat<2?0.2:-1.1; return new THREE.Vector3(c.pos.x+Math.cos(h)*(-lx)+Math.sin(h)*lz, c.pos.y+1.25, c.pos.z-Math.sin(h)*(-lx)+Math.cos(h)*lz); }
function updateCamera(dt){
  const cam=S.camera; S.mouse.idle+=dt; const w=WEAPONS[Player.wid];
  const fp=Player.fp && !S.dead && !S.busted;
  Player.mesh.visible = !fp; Player.view.visible = fp && !Player.car;
  const zoom=Player.aiming && w.zoom && !Player.car;
  let fov = Player.car ? (Player.aiming?58:70+Math.abs(Player.car.speed)*0.35) : (zoom?18:(Player.aiming?(fp?(S.mouse.rdown?48:62):60):70));
  cam.fov += (fov-cam.fov)*Math.min(1,dt*(zoom?10:6)); cam.updateProjectionMatrix();
  if(fp || zoom){
    S.pitch=clamp(S.pitch,-1.25,1.25); let eye;
    if(Player.car){ const c=Player.car; eye=seatOffset(c,Player.seat); if(S.mouse.idle>1.5){ S.yaw=lerpAngle(S.yaw,c.heading+Math.PI,Math.min(1,dt*3)); S.pitch+=(0.02-S.pitch)*Math.min(1,dt*2); } }
    else { eye=Player.pos.clone().add(new THREE.Vector3(0,1.62+Math.sin(Player.bobPhase)*0.025,0)); }
    cam.position.copy(eye);
    const dir=new THREE.Vector3(-Math.sin(S.yaw)*Math.cos(S.pitch), -Math.sin(S.pitch), -Math.cos(S.yaw)*Math.cos(S.pitch));
    cam.lookAt(eye.clone().add(dir));
    animateView(dt); Player.view.visible=fp&&!zoom&&!Player.car;
    return;
  }
  let target, dist, shoulder=0;
  if(Player.car){
    const c=Player.car; target=c.pos.clone().setY(1.4); dist=8+(c.spec.r||1.7)*1.2;
    if(S.mouse.idle>1.2 && !Player.aiming){ S.yaw=lerpAngle(S.yaw, c.heading+Math.PI, Math.min(1,dt*2.5)); S.pitch += (0.32-S.pitch)*Math.min(1,dt*2); }
  } else { target=Player.pos.clone().setY(1.5); dist=Player.aiming?2.8:4.6; shoulder=Player.aiming?0.95:0.45; }
  if(S.dead||S.busted){ dist=7; S.yaw+=dt*0.3; S.pitch+=(0.6-S.pitch)*dt; }
  S.pitch=clamp(S.pitch,-0.35,1.2);
  const off=new THREE.Vector3(Math.sin(S.yaw)*Math.cos(S.pitch)*dist, Math.sin(S.pitch)*dist+0.3, Math.cos(S.yaw)*Math.cos(S.pitch)*dist);
  target.addScaledVector(camRight(), shoulder);
  let pos=target.clone().add(off);
  for(let n=1;n<=10;n++){ const p=target.clone().lerp(pos, n/10); if(pointInObstacle(p.x,p.z,0.4) && p.y<50){ pos=target.clone().lerp(pos,(n-1)/10); break; } }
  if(pos.y<0.4) pos.y=0.4;
  cam.position.lerp(pos, Player.car?Math.min(1,dt*9):1);
  const look=target.clone().addScaledVector(camForward(), 2); look.y-=Player.recoil*0.1; cam.lookAt(look);
}
