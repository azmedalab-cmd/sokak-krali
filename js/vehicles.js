// vehicles.js — araçlar: profil gövdeli modeller, trafik yapay zekası, sürüş, polis, çarpışma, patlama
var CAR_COLORS=[0xc0392b,0x2980b9,0xf1c40f,0xecf0f1,0x2c3e50,0x27ae60,0x8e44ad,0xe67e22,0x7f8c8d,0x16a085,0x1b1b1b,0x9b2d2d];
var CAR_TYPES={
  sedan:{w:1.9,prof:[[-2.2,0.35],[-2.2,0.95],[-1.5,1.0],[-1.2,1.45],[-0.3,1.5],[0.7,1.45],[1.3,1.0],[2.1,0.95],[2.2,0.55],[2.2,0.35]],glass:[[-1.25,1.0],[-1.08,1.43],[0.62,1.43],[1.2,1.0]],max:28,acc:11,wz:[1.45,-1.45],mz:0.9,belt:1.0},
  hatch:{w:1.8,prof:[[-1.95,0.35],[-1.95,1.0],[-1.85,1.5],[-0.4,1.55],[0.6,1.5],[1.2,1.0],[1.85,0.95],[1.95,0.55],[1.95,0.35]],glass:[[-1.8,1.02],[-1.75,1.48],[0.5,1.48],[1.1,1.02]],max:26,acc:10,wz:[1.25,-1.25],mz:0.8},
  sports:{w:1.95,prof:[[-2.2,0.3],[-2.2,0.8],[-1.0,0.85],[-0.5,1.2],[0.3,1.25],[1.2,0.85],[2.1,0.75],[2.2,0.45],[2.2,0.3]],glass:[[-0.95,0.86],[-0.55,1.18],[0.25,1.18],[1.1,0.86]],max:36,acc:15,wz:[1.45,-1.45],mz:0.6},
  pickup:{w:1.95,prof:[[-2.4,0.35],[-2.4,1.0],[-0.6,1.0],[-0.5,1.55],[0.5,1.55],[1.0,1.0],[2.2,0.95],[2.4,0.55],[2.4,0.35]],glass:[[-0.55,1.02],[-0.48,1.5],[0.45,1.5],[0.95,1.02]],max:26,acc:9,wz:[1.5,-1.6],mz:0.7},
  van:{w:2.0,prof:[[-2.5,0.35],[-2.5,1.9],[1.2,1.9],[1.9,1.3],[2.5,1.1],[2.5,0.35]],glass:[[1.1,1.28],[1.15,1.88],[1.95,1.28]],max:24,acc:8,wz:[1.6,-1.6],mz:1.5,belt:1.25},
  suv:{w:2.0,prof:[[-2.4,0.4],[-2.4,1.1],[-2.3,1.75],[-0.9,1.8],[1.3,1.7],[1.9,1.1],[2.4,1.0],[2.4,0.4]],glass:[[-2.2,1.12],[-2.1,1.7],[1.2,1.65],[1.75,1.12]],max:27,acc:10,wz:[1.6,-1.6],mz:0.9,r:1.8,ws:1.15,belt:1.1},
  coupe:{w:1.85,prof:[[-2.1,0.32],[-2.1,0.85],[-1.3,0.9],[-0.9,1.3],[0.1,1.35],[1.0,0.95],[2.0,0.85],[2.1,0.5],[2.1,0.32]],glass:[[-0.95,0.9],[-0.6,1.28],[0.05,1.28],[0.9,0.9]],max:32,acc:13,wz:[1.35,-1.35],mz:0.6},
  muscle:{w:2.0,prof:[[-2.4,0.35],[-2.4,0.95],[-1.4,1.0],[-1.1,1.4],[-0.2,1.45],[0.8,1.4],[1.3,1.0],[2.3,0.95],[2.4,0.5],[2.4,0.35]],glass:[[-1.15,1.0],[-0.95,1.38],[0.7,1.38],[1.2,1.0]],max:34,acc:14,wz:[1.55,-1.55],mz:0.8,r:1.8},
  limo:{w:1.95,prof:[[-3.6,0.35],[-3.6,0.95],[-3.0,1.0],[-2.7,1.45],[1.5,1.45],[2.2,1.0],[3.5,0.95],[3.6,0.55],[3.6,0.35]],glass:[[-2.75,1.0],[-2.6,1.4],[1.4,1.4],[2.1,1.0]],max:25,acc:8,wz:[2.6,-2.6],mz:1.8,r:2.6,doors:[1.0,-0.6,-2.0]},
  truck:{w:2.3,prof:[[-3.6,0.5],[-3.6,2.8],[-0.3,2.8],[-0.3,2.4],[0.4,2.4],[1.6,2.3],[2.5,1.4],[3.6,1.3],[3.6,0.5]],glass:[[0.45,1.45],[0.5,2.3],[1.55,2.25],[2.3,1.45]],max:22,acc:6,wz:[2.3,-2.4],mz:1.5,r:2.8,ws:1.35,doors:[1.2],belt:1.45},
  moto:{w:0.6,prof:[[-0.9,0.3],[-0.9,0.9],[0.9,0.9],[0.9,0.3]],glass:[[0,0.9],[0.1,1.0],[0.2,0.9]],max:38,acc:16,wz:[0.75,-0.7],mz:0.3,r:0.9,moto:true},
  bus:{w:2.4,prof:[[-5.2,0.5],[-5.2,3.0],[4.6,3.0],[5.2,2.4],[5.2,0.5]],glass:[[-5.0,1.4],[-5.0,2.7],[4.5,2.7],[4.9,1.4]],max:20,acc:5,wz:[3.4,-3.4],mz:3.5,r:3.6,ws:1.35,doors:[3.0,-1.5],belt:1.4}
};
var CAR_WEIGHTS=[['moto',9],['sedan',25],['hatch',18],['sports',8],['pickup',12],['van',10],['suv',12],['coupe',7],['muscle',4],['limo',2],['truck',4],['bus',3]];
function randomCarType(){ let t=0; for(const w of CAR_WEIGHTS) t+=w[1]; let r=Math.random()*t; for(const w of CAR_WEIGHTS){ r-=w[1]; if(r<=0) return w[0]; } return 'sedan'; }
var _tireGeo=null,_rimGeo=null,_blackMat=null,_rimMat=null,_glassMat=null,_lightMat=null,_tailMat=null;
function lanePoint(axis,dir,road,along){ const P=CITY.P; return axis==='z' ? new THREE.Vector3(road*P-3.5*dir,0,along) : new THREE.Vector3(along,0,road*P+3.5*dir); }
function extrudeProfile(pts,width,mat){
  const sh=new THREE.Shape(); pts.forEach((p,i)=> i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));
  const geo=new THREE.ExtrudeGeometry(sh,{depth:width,bevelEnabled:false}); geo.rotateY(-Math.PI/2); geo.translate(width/2,0,0); geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,mat); m.castShadow=true; return m;
}
// Poligonu y<=lim (ya da y>=lim) yarı düzlemine kırp (Sutherland-Hodgman)
function clipPoly(pts,lim,keepBelow){
  const out=[]; const inside=p=>keepBelow?p[1]<=lim:p[1]>=lim;
  for(let i=0;i<pts.length;i++){ const a=pts[i], b=pts[(i+1)%pts.length]; const ia=inside(a), ib=inside(b);
    if(ia) out.push(a); if(ia!==ib){ const t=(lim-a[1])/(b[1]-a[1]); out.push([a[0]+(b[0]-a[0])*t,lim]); } }
  return out;
}
var _intMat=null,_seatMat=null,_wheelMat=null;
function makeCarMesh(type,color,opts){
  opts=opts||{}; const T=CAR_TYPES[type], w=T.w, len=T.prof[T.prof.length-1][0]*2;
  if(!_tireGeo){ _tireGeo=new THREE.CylinderGeometry(0.36,0.36,0.26,16); _tireGeo.rotateZ(Math.PI/2); _rimGeo=new THREE.CylinderGeometry(0.23,0.23,0.27,12); _rimGeo.rotateZ(Math.PI/2);
    _blackMat=new THREE.MeshStandardMaterial({color:0x151515,metalness:0.1,roughness:0.9}); _rimMat=new THREE.MeshStandardMaterial({color:0xc8ccd2,metalness:0.9,roughness:0.25,envMap:S.envMap,envMapIntensity:1.0});
    _glassMat=new THREE.MeshStandardMaterial({color:0x6a8aa8,metalness:0.7,roughness:0.08,envMap:S.envMap,envMapIntensity:1.2,transparent:true,opacity:0.42,depthWrite:false}); _lightMat=new THREE.MeshBasicMaterial({color:0xfff6c8}); _tailMat=new THREE.MeshBasicMaterial({color:0xff2a2a});
    _intMat=new THREE.MeshLambertMaterial({color:0x2a2a2e}); _seatMat=new THREE.MeshLambertMaterial({color:0x3a3634}); _wheelMat=new THREE.MeshLambertMaterial({color:0x111111}); }
  const g=new THREE.Group();
  const bodyMat=new THREE.MeshStandardMaterial({color,metalness:0.6,roughness:0.3,envMap:S.envMap,envMapIntensity:0.9});
  if(T.moto){ return makeMotoMesh(g,bodyMat,opts); }
  const belt=T.belt||1.0, gtop=Math.max(...T.glass.map(p=>p[1])); g.userData.gtop=gtop;
  const lower=extrudeProfile(clipPoly(T.prof,belt,true),w,bodyMat); g.add(lower);
  const roofPts=clipPoly(T.prof,gtop-0.12,false); if(roofPts.length>=3){ const roof=extrudeProfile(roofPts,w-0.06,bodyMat); g.add(roof); }
  const glass=extrudeProfile(T.glass,w+0.04,_glassMat); glass.castShadow=false; glass.renderOrder=2; g.add(glass);
  // direkler: cam poligonunun ön/arka kenarlarında ve ortada
  const gz=T.glass.map(p=>p[0]), gzMin=Math.min(...gz), gzMax=Math.max(...gz);
  for(const s of [1,-1]) for(const pz of [gzMin+0.08,gzMax-0.08,(gzMin+gzMax)/2]){ const pil=new THREE.Mesh(new THREE.BoxGeometry(0.06,gtop-belt+0.05,0.1),bodyMat); pil.position.set(s*(w/2-0.02),(gtop+belt)/2,pz); g.add(pil); }
  // iç mekan: taban, gösterge paneli, direksiyon, koltuklar
  const floor=new THREE.Mesh(new THREE.BoxGeometry(w-0.1,0.08,gzMax-gzMin+0.8),_intMat); floor.position.set(0,belt-0.45,(gzMin+gzMax)/2); g.add(floor);
  const dash=new THREE.Mesh(new THREE.BoxGeometry(w-0.15,0.28,0.45),_intMat); dash.position.set(0,belt+0.02,gzMax-0.3); g.add(dash);
  const wheel=new THREE.Mesh(new THREE.TorusGeometry(0.17,0.022,8,16),_wheelMat); wheel.position.set(w/4,belt+0.12,gzMax-0.62); wheel.rotation.x=0.55; g.add(wheel); g.userData.steer=wheel;
  const seatRows=type==='bus'?[2.6,1.2,-0.2,-1.6,-3.0,-4.4]:type==='van'||type==='limo'?[0.2,-1.1,-2.2]:[0.2,-1.1];
  g.userData.seats=[];
  for(const sz of seatRows) for(const sx of [w/4,-w/4]){ const cush=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.18,0.5),_seatMat); cush.position.set(sx,belt-0.3,sz); g.add(cush); const back=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.55,0.12),_seatMat); back.position.set(sx,belt-0.02,sz-0.28); g.add(back); g.userData.seats.push([sx,belt-0.21,sz]); }
  const under=new THREE.Mesh(new THREE.BoxGeometry(w-0.3,0.25,len-0.8),_blackMat); under.position.y=0.3; g.add(under);
  const wheels=[], pivots=[], ws=T.ws||1;
  for(const z of T.wz) for(const x of [-w/2+0.12, w/2-0.12]){
    const p=new THREE.Group(); p.position.set(x,0.36*ws,z); p.scale.setScalar(ws); const t=new THREE.Mesh(_tireGeo,_blackMat), r=new THREE.Mesh(_rimGeo,_rimMat); t.castShadow=true; p.add(t,r); g.add(p); wheels.push(t,r); if(z>0) pivots.push(p);
    const arch=new THREE.Mesh(new THREE.CircleGeometry(0.46*ws,18),_blackMat); arch.position.set(Math.sign(x)*(w/2+0.004),0.4*ws,z); arch.rotation.y=Math.sign(x)*Math.PI/2; g.add(arch);
  }
  for(const s of [1,-1]){ const b=new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.22,0.22),_blackMat); b.position.set(0,0.42,s*len/2); g.add(b); }
  const grille=new THREE.Mesh(new THREE.BoxGeometry(w*0.45,0.16,0.06),_blackMat); grille.position.set(0,0.66,len/2+0.01); g.add(grille);
  const tailMat=new THREE.MeshBasicMaterial({color:0x9a1a1a}); g.userData.tail=tailMat;
  for(const s of [1,-1]) for(const dz of (T.doors||[0.35,-0.95])){ const seam=new THREE.Mesh(new THREE.BoxGeometry(0.012,belt-0.4,0.016),_blackMat); seam.position.set(s*(w/2+0.003),(belt+0.4)/2,dz); g.add(seam); const hd=new THREE.Mesh(new THREE.BoxGeometry(0.025,0.03,0.12),_rimMat); hd.position.set(s*(w/2+0.01),belt-0.1,dz-0.2); g.add(hd); }
  if(type==='truck'){ const cargo=new THREE.Mesh(new THREE.BoxGeometry(w+0.02,2.3,3.2),new THREE.MeshStandardMaterial({color:0xe8e8e8,metalness:0.2,roughness:0.6})); cargo.position.set(0,1.7,-1.95); cargo.castShadow=true; g.add(cargo); }
  for(const x of [-w/2+0.35, w/2-0.35]){ const h=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.16,0.08),_lightMat); h.position.set(x,0.72,len/2+0.02); g.add(h); const t=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.14,0.08),tailMat); t.position.set(x,0.72,-len/2-0.02); g.add(t); }
  for(const x of [-w/2-0.08, w/2+0.08]){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.1,0.18),bodyMat); m.position.set(x,belt+0.1,T.mz); g.add(m); }
  const plate=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.14,0.04),new THREE.MeshBasicMaterial({color:0xf4f4f4})); plate.position.set(0,0.55,-len/2-0.1); g.add(plate);
  const ex=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.3,6),_blackMat); ex.rotation.x=Math.PI/2; ex.position.set(w/2-0.4,0.3,-len/2-0.05); g.add(ex);
  let lights=null;
  if(opts.police){ const r=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.16,0.3),new THREE.MeshBasicMaterial({color:0xff2020})); r.position.set(-0.35,gtop+0.1,-0.2); const b=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.16,0.3),new THREE.MeshBasicMaterial({color:0x2060ff})); b.position.set(0.35,gtop+0.1,-0.2); g.add(r,b); lights=[r,b];
    for(const s of [1,-1]){ const st=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.3,len*0.55),new THREE.MeshPhongMaterial({color:0x1b3a6b})); st.position.set(s*(w/2+0.01),0.8,0.1); g.add(st); } }
  if(opts.taxi){ const t=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.22,0.3),new THREE.MeshBasicMaterial({map:signTexture('TAKSİ','#ffd23b','#111111')})); t.position.set(0,gtop+0.12,-0.2); g.add(t); }
  if(type==='sports'){ const sp=new THREE.Mesh(new THREE.BoxGeometry(w-0.3,0.04,0.3),bodyMat); sp.position.set(0,1.05,-len/2+0.25); g.add(sp); for(const x of [-0.6,0.6]){ const st=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.22,0.08),_blackMat); st.position.set(x,0.92,-len/2+0.25); g.add(st); } }
  if(type==='van'){ for(const x of [-0.6,0.6]){ const bar=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,2.6),_blackMat); bar.position.set(x,1.98,-0.4); g.add(bar); } }
  if(type==='pickup'){ const bed=new THREE.Mesh(new THREE.BoxGeometry(w-0.35,0.04,1.6),_blackMat); bed.position.set(0,1.0,-1.5); g.add(bed); }
  g.traverse(o=>{ if(o.isMesh && o.castShadow===undefined) o.castShadow=true; });
  g.userData.wheels=wheels; g.userData.pivots=pivots; g.userData.lights=lights; g.userData.body=lower; g.rotation.order='YXZ';
  return g;
}
// Motosiklet: iki tekerlek, şasi, depo, sele, gidon, far, egzoz; sürücü görünür oturur
function makeMotoMesh(g,bodyMat,opts){
  const frame=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.26,1.3),_blackMat); frame.position.set(0,0.62,0); g.add(frame);
  const tank=new THREE.Mesh(new THREE.SphereGeometry(0.22,10,8),bodyMat); tank.scale.set(1,0.8,1.6); tank.position.set(0,0.82,0.25); g.add(tank);
  const seat=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.1,0.7),_seatMat); seat.position.set(0,0.86,-0.35); g.add(seat);
  const fork1=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.7,6),_rimMat); fork1.position.set(-0.1,0.65,0.72); fork1.rotation.x=0.4; g.add(fork1); const fork2=fork1.clone(); fork2.position.x=0.1; g.add(fork2);
  const bar=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.04,0.04),_blackMat); bar.position.set(0,1.0,0.6); g.add(bar);
  const hl=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,6),_lightMat); hl.position.set(0,0.95,0.78); g.add(hl);
  const ex=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.04,0.9,6),_rimMat); ex.rotation.x=Math.PI/2; ex.position.set(0.14,0.45,-0.4); g.add(ex);
  const tailMat=new THREE.MeshBasicMaterial({color:0x9a1a1a}); const tl=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.08,0.05),tailMat); tl.position.set(0,0.8,-0.8); g.add(tl); g.userData.tail=tailMat;
  const wheels=[], pivots=[];
  for(const z of [0.75,-0.7]){ const p=new THREE.Group(); p.position.set(0,0.33,z); const t=new THREE.Mesh(new THREE.CylinderGeometry(0.33,0.33,0.12,14).rotateZ(Math.PI/2),_blackMat); const r=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.13,10).rotateZ(Math.PI/2),_rimMat); t.castShadow=true; p.add(t,r); g.add(p); wheels.push(t,r); if(z>0) pivots.push(p); }
  g.userData.seats=[[0,0.52,-0.25],[0,0.52,-0.75]];
  g.traverse(o=>{ if(o.isMesh && o.castShadow===undefined) o.castShadow=true; });
  g.userData.wheels=wheels; g.userData.pivots=pivots; g.userData.lights=null; g.userData.body=tank; g.userData.moto=true; g.rotation.order='YXZ';
  return g;
}
// Araçtaki kişileri koltuklara yerleştir (oyuncu 3. şahısta, şoför, binen çete, trafik sürücüsü)
function placeOccupants(c){
  const seats=c.mesh.userData.seats||[[0,0.5,0]]; const h=c.heading;
  const put=(mesh,idx,driver,aim)=>{ const s=seats[Math.min(idx,seats.length-1)]; mesh.visible=true; setSeated(mesh,true,driver); let sy=c.pos.y+s[1]-0.78; const gt=c.mesh.userData.gtop; if(gt!==undefined && !c.spec.moto) sy=Math.min(sy,c.pos.y+gt-0.12-1.9); mesh.position.set(c.pos.x+Math.cos(h)*s[0]+Math.sin(h)*s[2], sy, c.pos.z-Math.sin(h)*s[0]+Math.cos(h)*s[2]); mesh.rotation.set(0,h,c.spec.moto?c.mesh.rotation.z:0); if(aim){ const u=mesh.userData; u.armR.rotation.x=-1.5; u.armR.rotation.z=driver?0.35:-0.35; u.foreR.rotation.x=0; u.handR.rotation.y=0; } };
  if(Player.car===c && !Player.fp && !S.dead) put(Player.mesh,Player.seat,Player.seat===0,Player.aiming);
  if(c.driverNpc && c.driverNpc.alive) put(c.driverNpc.mesh,0,true);
  if(c.riderNpc && c.riderNpc.alive) put(c.riderNpc.mesh,0,true,!!c.hitSquad);
  let idx=1; for(const r of c.riders){ if(!r.alive) continue; if(r===c.crewDriver){ put(r.mesh,0,true); continue; } if(idx===Player.seat && Player.car===c) idx++; put(r.mesh,idx,false); idx++; }
}
function removeCarAt(i){ const c=S.cars[i]; S.scene.remove(c.mesh); for(const p of [c.driverNpc,c.riderNpc]) if(p){ const k=S.peds.indexOf(p); if(k>=0){ S.scene.remove(p.mesh); S.peds.splice(k,1); } } S.cars.splice(i,1); }
function setTrafficFromPose(c){
  const P=CITY.P,N=CITY.N; const i=Math.round(c.pos.x/P), j=Math.round(c.pos.z/P);
  if(Math.abs(c.pos.x-i*P) <= Math.abs(c.pos.z-j*P)){ c.axis='z'; c.road=clamp(i,0,N); c.dir=Math.cos(c.heading)>=0?1:-1; }
  else { c.axis='x'; c.road=clamp(j,0,N); c.dir=Math.sin(c.heading)>=0?1:-1; }
  const along = c.axis==='z'?c.pos.z:c.pos.x;
  c.nextK = clamp(c.dir>0?Math.ceil((along+8)/P):Math.floor((along-8)/P),0,N);
  c.phase='pre'; c.target=lanePoint(c.axis,c.dir,c.road,c.nextK*P-7*c.dir);
}
function spawnCar(opts){
  opts=opts||{}; const P=CITY.P,N=CITY.N;
  const axis=Math.random()<0.5?'z':'x', road=randi(0,N), dir=Math.random()<0.5?1:-1;
  const along=opts.along!==undefined?opts.along:rand(10,CITY.size-10);
  const pos=opts.pos||lanePoint(axis,dir,road,along);
  const heading = opts.heading!==undefined?opts.heading:(axis==='z' ? (dir>0?0:Math.PI) : (dir>0?Math.PI/2:-Math.PI/2));
  const type=opts.type||(opts.police?'sedan':randomCarType());
  const taxi=!opts.police && type==='sedan' && Math.random()<0.25;
  const c={type:'car', kind:type, spec:CAR_TYPES[type], pos:pos.clone(), heading, speed:0, prevSpeed:0, steer:0, health:100, police:!!opts.police, taxi, ai:true, chase:!!opts.chase, dead:false, driver:null, rider:null, driverNpc:null, riders:[], dest:null, hold:false, stuckT:0, revT:0, dropT:0, smokeT:0, deadT:0, lastHit:null, screechT:0};
  const col=opts.police?0xf2f2f2:(taxi?0xf5c518:(type==='bus'?0x2a7fbf:type==='truck'?0xcfcfcf:pick(CAR_COLORS)));
  c.mesh=makeCarMesh(type, col, {police:opts.police,taxi}); c.mesh.userData.entity={type:'car',ref:c}; c.baseColor=new THREE.Color(col);
  c.mesh.position.copy(c.pos); c.mesh.rotation.y=heading; S.scene.add(c.mesh); S.cars.push(c);
  setTrafficFromPose(c);
  if(!opts.police && !opts.noDriver && typeof spawnPed==='function' && S.nodes.length){ const p=spawnPed(nearestNode(c.pos.x,c.pos.z),{gang:false,noThug:true}); p.state='driving'; p.riding=c; c.riderNpc=p; }
  else if(opts.police && typeof spawnPed==='function' && S.nodes.length){ const p=spawnPed(nearestNode(c.pos.x,c.pos.z),{gang:false,noThug:true,look:{skin:pick(SKINS),shirt:0x1f4a8a,pants:0x162f57,hair:0x111111,cap:0x0f2a52}}); p.state='driving'; p.riding=c; c.riderNpc=p; }
  return c;
}
function nextTarget(c){
  const P=CITY.P,N=CITY.N;
  if(c.phase==='pre'){
    const K=c.nextK, opts=[];
    if(K+c.dir>=0 && K+c.dir<=N) opts.push({axis:c.axis,dir:c.dir,w:3});
    const other=c.axis==='z'?'x':'z';
    for(const nd of [1,-1]) if(c.road+nd>=0 && c.road+nd<=N) opts.push({axis:other,dir:nd,w:1});
    if(!opts.length) opts.push({axis:c.axis,dir:-c.dir,w:1});
    if(c.dest){ for(const o of opts){ let ix,iz; if(o.axis===c.axis){ ix=c.axis==='z'?c.road:K+o.dir; iz=c.axis==='z'?K+o.dir:c.road; } else { ix=o.axis==='z'?K:c.road+o.dir; iz=o.axis==='z'?c.road+o.dir:K; } const dd=Math.hypot(ix*P-c.dest.x,iz*P-c.dest.z); o.w=1/(1+dd)*100+Math.random()*0.01; } }
    let tot=0; for(const o of opts) tot+=o.w; let r=Math.random()*tot, o=opts[0]; if(c.dest){ o=opts.reduce((a,b)=>b.w>a.w?b:a,opts[0]); } else for(const x of opts){ r-=x.w; if(r<=0){o=x;break;} }
    const oldRoad=c.road;
    if(o.axis===c.axis){ c.dir=o.dir; c.target=lanePoint(c.axis,c.dir,c.road,K*P+7*c.dir); c.nextK=K+c.dir; }
    else { c.axis=o.axis; c.dir=o.dir; c.road=K; c.target=lanePoint(c.axis,c.dir,c.road,oldRoad*P+7*c.dir); c.nextK=oldRoad+c.dir; }
    c.phase='exit';
  } else { c.phase='pre'; c.target=lanePoint(c.axis,c.dir,c.road,c.nextK*P-7*c.dir); }
}
function aheadOf(c,px,pz){ const fx=Math.sin(c.heading), fz=Math.cos(c.heading); const dx=px-c.pos.x, dz=pz-c.pos.z; return {ahead:dx*fx+dz*fz, side:Math.abs(dx*fz-dz*fx)}; }

function updateCars(dt){
  const pp=Player.car?Player.car.pos:Player.pos;
  S.carSpawnT=(S.carSpawnT||0)-dt;
  const traffic=S.cars.filter(c=>c.ai && !c.police && !c.dead).length;
  if(traffic<(S.carCap||16) && S.carSpawnT<=0){ S.carSpawnT=0.6; const c=spawnCar(); const d=dist2D(c.pos,pp); if(d<70||d>230){ removeCarAt(S.cars.length-1); } }
  managePoliceCars(dt);
  for(let i=S.cars.length-1;i>=0;i--){
    const c=S.cars[i]; const d=dist2D(c.pos,pp);
    if(c.dead){ c.deadT+=dt; if(c.driver!==Player && !c.mission && (c.deadT>40 || d>160)){ removeCarAt(i); } continue; }
    if(c.driver!==Player && c.rider!==Player && !c.mission && !c.owned && d>270 && !c.chase){ removeCarAt(i); continue; }
    const h0=c.heading;
    if(c.driver!==Player){
      let want=0;
      if(c.hitSquad) want=hitSquadStep(c,dt);
      else if(c.driverNpc) want=driverStep(c,dt);
      else if(c.ally) want=allyCarStep(c,dt);
      else if(c.mechanic) want=mechanicCarStep(c,dt);
      else if(c.chase) want=chaseStep(c,dt,pp,d);
      else if(c.ai) want=trafficStep(c,dt);
      if(c.revT>0){ c.revT-=dt; want=-6; c.heading+=dt*1.2; }
      else if(want>2 && Math.abs(c.speed)<0.6){ c.stuckT+=dt; if(c.stuckT>2){ c.revT=1.3; c.stuckT=0; } } else c.stuckT=0;
      if(!c.ai && !c.chase && !c.ally && !c.mechanic && !c.driverNpc && !c.hitSquad){ want=0; if(!c.riderNpc && Math.abs(c.speed)>0.5) c.speed-=Math.sign(c.speed)*Math.min(Math.abs(c.speed),3*dt); }
      c.speed += clamp(want-c.speed, -22*dt, (c.chase||c.ally?9:6)*dt);
      if(dt>0) c.steer += (clamp(angDiff(h0,c.heading)/dt/2.5,-1,1)-c.steer)*Math.min(1,dt*8);
    }
    moveCar(c,dt);
  }
  for(let i=0;i<S.cars.length;i++) for(let j=i+1;j<S.cars.length;j++){
    const a=S.cars[i], b=S.cars[j]; const rr=(a.spec.r||1.7)+(b.spec.r||1.7)+0.9; const d=dist2D(a.pos,b.pos); if(d>rr||d<0.01) continue;
    const nx=(b.pos.x-a.pos.x)/d, nz=(b.pos.z-a.pos.z)/d, push=(rr-d)/2;
    a.pos.x-=nx*push; a.pos.z-=nz*push; b.pos.x+=nx*push; b.pos.z+=nz*push;
    const rel=Math.abs(a.speed-b.speed);
    if(rel>4 && !a.dead && !b.dead){ const src=(a.driver===Player||b.driver===Player)?'player':null; damageCar(a,rel*1.4,src); damageCar(b,rel*1.4,src); playNoise(0.2,0.5,600); }
    const m=(a.speed+b.speed)/2; a.speed=m*0.6; b.speed=m*0.6;
  }
}
function trafficStep(c,dt){
  const t=c.target; const d=Math.hypot(t.x-c.pos.x,t.z-c.pos.z);
  if(d<2.6) nextTarget(c);
  const desired=Math.atan2(c.target.x-c.pos.x, c.target.z-c.pos.z);
  c.heading=lerpAngle(c.heading,desired,Math.min(1,dt*3.2));
  let want=(c.phase==='pre'&&d<12)?7:Math.min(12,c.spec.max*0.5);
  if(c.phase==='pre' && d<9 && typeof lightFor==='function'){ const L=lightFor(c.axis,c.road,c.nextK); if(L==='red' || (L==='yellow' && d>4)) want=0; }
  for(const o of S.cars){ if(o===c) continue; const a=aheadOf(c,o.pos.x,o.pos.z); const gap=(c.spec.r||1.7)+(o.spec.r||1.7)+1.5; if(a.ahead>0&&a.ahead<gap+8&&a.side<2.8) want=Math.min(want,Math.max(0,(a.ahead-gap)*1.3)); }
  if(!Player.car){ const a=aheadOf(c,Player.pos.x,Player.pos.z); if(a.ahead>0&&a.ahead<9&&a.side<2.2) want=0; }
  for(const p of S.peds){ if(!p.alive) continue; const a=aheadOf(c,p.pos.x,p.pos.z); if(a.ahead>0&&a.ahead<7&&a.side<1.8){ want=0; break; } }
  return want;
}
function chaseStep(c,dt,pp,d){
  const desired=Math.atan2(pp.x-c.pos.x, pp.z-c.pos.z);
  c.heading=lerpAngle(c.heading,desired,Math.min(1,dt*2.4));
  let want=17;
  if(!Player.car){ if(d<9){ want=0; c.dropT-=dt; if(c.dropT<=0 && Math.abs(c.speed)<2){ c.dropT=7; const r=new THREE.Vector3(-Math.cos(c.heading),0,Math.sin(c.heading)); if(S.cops.filter(x=>x.alive).length<10) spawnCop(c.pos.x+r.x*2.2,c.pos.z+r.z*2.2); } } }
  else if(d<5) want=12;
  return want;
}
function moveCar(c,dt){
  c.pos.x+=Math.sin(c.heading)*c.speed*dt; c.pos.z+=Math.cos(c.heading)*c.speed*dt;
  if(collideWorld(c.pos,c.spec.r||1.7)){ if(Math.abs(c.speed)>5){ damageCar(c,Math.abs(c.speed)*1.1, c.driver===Player?'player':null); playNoise(0.18,0.4,500); } c.speed*=-0.25; }
  const braking = c.driver===Player ? !!(S.keys.KeyS||S.keys.Space) : (c.speed<c.prevSpeed-0.3);
  c.mesh.userData.tail.color.setHex(braking||S.night>0.5?0xff5050:0x9a1a1a);
  if(c.health!==c.colHealth){ c.colHealth=c.health; c.mesh.userData.body.material.color.copy(c.baseColor).lerp(new THREE.Color(0x2a2a2a),(1-clamp(c.health,0,100)/100)*0.7); }
  if(Math.abs(c.speed)>3){
    for(const p of S.peds){ if(p.alive && !p.riding && dist2D(p.pos,c.pos)<(c.spec.r||1.7)+0.5 && !(c.ally && p.state==='crew')){ killPed(p, c.driver===Player?'player':'car'); c.speed*=0.85; } }
    for(const k of S.cops){ if(k.alive && dist2D(k.pos,c.pos)<2.1 && !(c.ally && k.loyal)){ damageCop(k,100, c.driver===Player?'player':'car'); c.speed*=0.85; } }
    if(!Player.car && dist2D(c.pos,Player.pos)<2.2){ damagePlayer(Math.abs(c.speed)*2.5); Player.pos.addScaledVector(new THREE.Vector3(Math.sin(c.heading),0,Math.cos(c.heading)),2.5); c.speed*=0.6; }
  }
  if(c.driver===Player||c.rider===Player) Player.pos.copy(c.pos);
  for(const r of c.riders) if(r.alive) r.pos.copy(c.pos);
  if(c.health<35 && !c.dead){ c.smokeT-=dt; if(c.smokeT<=0){ c.smokeT=0.15; addSmoke(c.pos.clone().add(new THREE.Vector3(Math.sin(c.heading)*1.8,1,Math.cos(c.heading)*1.8))); } }
  c.mesh.position.copy(c.pos); c.mesh.rotation.y=c.heading;
  const accel=dt>0?(c.speed-c.prevSpeed)/dt:0; c.prevSpeed=c.speed;
  const rz=-c.steer*clamp(c.speed/25,-1,1)*0.06, rx=clamp(-accel*0.006,-0.05,0.05);
  c.mesh.rotation.z+=(rz-c.mesh.rotation.z)*Math.min(1,dt*6); c.mesh.rotation.x+=(rx-c.mesh.rotation.x)*Math.min(1,dt*5);
  for(const w of c.mesh.userData.wheels) w.rotation.x+=c.speed*dt/0.36;
  if(c.mesh.userData.steer) c.mesh.userData.steer.rotation.z=-c.steer*1.2;
  if(c.spec.moto){ c.mesh.rotation.z=-c.steer*clamp(Math.abs(c.speed)/20,0,1)*0.5; }
  placeOccupants(c);
  for(const p of c.mesh.userData.pivots) p.rotation.y=c.steer*0.45;
  if(c.mesh.userData.lights){ const on=c.chase||c.driver===Player||c.ally; const ph=Math.floor(S.time*6)%2; c.mesh.userData.lights[0].visible=!on||ph===0; c.mesh.userData.lights[1].visible=!on||ph===1; }
}
function updateDriving(dt){
  const c=Player.car, k=S.keys, T=c.spec; const th=(k.KeyW?1:0)-(k.KeyS?1:0), st=(k.KeyA?1:0)-(k.KeyD?1:0);
  if(th>0) c.speed+=(c.speed<0?30:T.acc)*dt; else if(th<0) c.speed-=(c.speed>0?30:9)*dt;
  else c.speed-=Math.sign(c.speed)*Math.min(Math.abs(c.speed),4*dt);
  if(k.Space) c.speed-=Math.sign(c.speed)*Math.min(Math.abs(c.speed),28*dt);
  c.speed=clamp(c.speed,-10,T.max*(S.speedFreak?1.5:1));
  c.steer+=(st-c.steer)*Math.min(1,dt*7);
  c.heading+=c.steer*(c.spec.moto?2.8:2.3)*dt*clamp(c.speed/9,-1,1);
  driveBy(dt);
  c.screechT-=dt; if(c.screechT<=0 && ((Math.abs(c.speed)>13 && Math.abs(c.steer)>0.6) || (k.Space && Math.abs(c.speed)>8))){ c.screechT=0.28; playNoise(0.25,0.18,3000); if(Math.random()<0.5) addSmoke(c.pos.clone().add(new THREE.Vector3(-Math.sin(c.heading)*1.5+rand(-0.8,0.8),0.3,-Math.cos(c.heading)*1.5))); }
}
function seatCount(c){ return c.kind==='bus'?20:c.kind==='van'||c.kind==='limo'?6:c.kind==='suv'?5:4; }
function tryEnterCar(asPassenger){
  if(S.dead||S.busted) return;
  if(Player.car){ exitCar(); return; }
  let best=null,bd=2.6; for(const c of S.cars){ if(c.dead) continue; const d=dist2D(c.pos,Player.pos)-(c.spec.r||1.7); if(d<bd){bd=d;best=c;} }
  if(!best) return;
  const passenger=asPassenger||!!best.driverNpc;
  const wasTraffic=best.ai && !best.police && !best.parked && !passenger;
  Player.car=best; Player.seat=passenger?1:0; if(passenger){ best.rider=Player; if(!best.driverNpc){ best.ai=false; best.chase=false; best.parked=true; } } else { best.driver=Player; best.ai=false; best.chase=false; best.parked=true; }
  Player.mesh.visible=false; Player.aiming=false;
  playTone(300,0.15,0.2,'triangle',520);
  if(best.riderNpc && !passenger){ const h=best.heading, p=best.riderNpc; best.riderNpc=null; p.state='walk'; p.riding=null; p.mesh.visible=true; setSeated(p.mesh,false); p.mesh.rotation.set(0,h,0); p.pos.set(best.pos.x-Math.cos(h)*((best.spec.r||1.7)+0.8),0,best.pos.z+Math.sin(h)*((best.spec.r||1.7)+0.8)); collideWorld(p.pos,0.3); p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); startFlee(p,best.pos,6); pedSay(p,pick(['Hey! Arabam!','Hırsız var!','Polis! Arabamı çaldı!','Dur, çocuklarım arkada!','Motorum! Dur lan!'])); }
  if(!passenger && (best.police || copNear(35))) crime('steal');
  if(typeof attachHeadlight==='function') attachHeadlight(best);
  // yakındaki çete üyeleri de biner
  const cap=seatCount(c=best)-2; let n=0; for(const p of S.crew){ if(n>=cap) break; if(p.alive && !p.riding && dist2D(p.pos,best.pos)<14){ p.riding=best; p.mesh.visible=false; best.riders.push(p); n++; } }
  toast(passenger?(best.driverNpc?'Şoförün arabasına bindin (N: koltuk, Space: dur, W: devam)':'Yolcu koltuğuna oturdun (N: koltuk değiştir)'):(best.police?'Polis arabası çalındı!':(best.taxi?'Taksiye bindin':'Araca bindin'))+(n?' · '+n+' adamın da bindi':''));
  if(typeof radioOnEnter==='function') radioOnEnter();
  if(best.driverNpc && passenger) S.subtitle={text:'Şoför: Nereye patron? Haritadan (M) hedef seç.',t:3};
}
function exitCar(){
  const c=Player.car, h=c.heading; let x=c.pos.x+Math.cos(h)*((c.spec.r||1.7)+0.8), z=c.pos.z-Math.sin(h)*((c.spec.r||1.7)+0.8);
  if(pointInObstacle(x,z,0.4)){ x=c.pos.x-Math.cos(h)*((c.spec.r||1.7)+0.8); z=c.pos.z+Math.sin(h)*((c.spec.r||1.7)+0.8); }
  Player.pos.set(x,0,z); Player.car=null; if(c.driver===Player) c.driver=null; if(c.rider===Player) c.rider=null; Player.seat=0; Player.mesh.visible=true; setSeated(Player.mesh,false); Player.mesh.rotation.set(0,Player.facing,0); Player.mesh.position.copy(Player.pos); Player.aiming=false;
  for(const p of c.riders){ if(p.alive){ p.riding=null; p.mesh.visible=true; setSeated(p.mesh,false); p.mesh.rotation.set(0,0,0); p.pos.set(x+rand(-2,2),0,z+rand(-2,2)); collideWorld(p.pos,0.3); } } c.riders=[];
  if(c.driverNpc){ c.hold=true; S.subtitle={text:'Şoför: Burada bekliyorum patron.',t:3}; }
  if(typeof detachHeadlight==='function') detachHeadlight();
}
function cycleSeat(){
  const c=Player.car; if(!c) return; const n=seatCount(c); let s=Player.seat;
  for(let i=0;i<n;i++){ s=(s+1)%n; if(s===0 && c.driverNpc) continue; break; }
  if(s===Player.seat) return;
  if(s===0){ Player.seat=0; c.rider=null; c.driver=Player; c.ai=false; toast('Direksiyona geçtin'); }
  else { if(c.driver===Player) c.driver=null; c.rider=Player; Player.seat=s; c.speed*=0.5; toast('Koltuk '+(s+1)+(s===1?' (ön yolcu)':' (arka)')); }
}
function driveBy(dt){
  const w=WEAPONS[Player.wid]; const can=!w.melee && (w.cat==='pistol'||w.cat==='smg'||w.cat==='thrown');
  Player.aiming=!!S.mouse.rdown && can; if(S.mouse.rdown && !can && !S.driveByWarned){ toast('Araçtan sadece tabanca, hafif makineli ve fırlatılanlarla ateş edilir'); S.driveByWarned=true; }
  Player.cooldown-=dt; Player.recoil=Math.max(0,Player.recoil-dt*6);
  if(Player.aiming && S.mouse.down && Player.cooldown<=0 && (w.auto||!S.mouse.wasDown)) fireWeapon(w);
  S.mouse.wasDown=S.mouse.down;
}
function updatePassenger(dt){ driveBy(dt); const c=Player.car; const k=S.keys; if(c.driverNpc){ if(k.Space){ if(!c.hold){ c.hold=true; S.subtitle={text:'Şoför: Tamam, duruyorum.',t:2}; } } if(k.KeyW && c.hold){ c.hold=false; S.subtitle={text:'Şoför: Devam ediyoruz.',t:2}; } } else { c.speed-=Math.sign(c.speed)*Math.min(Math.abs(c.speed),4*dt); } }
// ---- Şoför ----
function hireDriver(){
  const c=Player.car; if(!c){ toast('Şoför için bir araçta olmalısın'); return false; }
  if(c.driverNpc){ toast('Bu arabanın zaten şoförü var'); return false; }
  const n=nearestNode(c.pos.x,c.pos.z); const p=spawnPed(n,{gang:false,noThug:true,look:{skin:pick(SKINS),shirt:0xf0f0f0,pants:0x111111,hair:0x222222,jacket:0x1a1a1a,cap:0x111111}}); p.state='driving'; p.pos.copy(c.pos); if(c.riderNpc){ const q=c.riderNpc; c.riderNpc=null; const k=S.peds.indexOf(q); if(k>=0){ S.scene.remove(q.mesh); S.peds.splice(k,1); } }
  c.driverNpc=p; c.owned=true; c.ai=false; c.chase=false; c.hold=false; if(Player.seat===0){ c.driver=null; c.rider=Player; Player.seat=1; }
  setTrafficFromPose(c); S.subtitle={text:'Şoför: Emrindeyim patron. Haritadan (M) hedef seç ya da dolaşalım.',t:4}; toast('Şoför tutuldu: Space dur, W devam, N koltuk'); return true;
}
function driverStep(c,dt){
  if(c.hold || S.dead) return 0;
  if(S.waypoint){ c.dest=S.waypoint; }
  if(c.dest){ const d=dist2D(c.pos,c.dest); if(d<9){ if(Math.abs(c.speed)<0.8){ c.dest=null; S.waypoint=null; if(S.wpBeacon) S.wpBeacon.visible=false; S.subtitle={text:'Şoför: Geldik patron.',t:3}; c.hold=true; } return 0; } }
  const w=trafficStep(c,dt); c.sayT=(c.sayT||0)-dt; if(c.sayT<=0 && Math.random()<dt*0.05){ c.sayT=20; S.subtitle={text:'Şoför: '+pick(['Trafik berbat bugün.','Radyoyu açayım mı?','Bu şehir hiç değişmiyor.','Arkana yaslan patron.']),t:3}; }
  return Math.min(w,(c.rider===Player?14:12));
}
function hornCar(){
  const c=Player.car; if(!c) return; playTone(420,0.35,0.22,'sawtooth'); playTone(520,0.35,0.12,'square');
  for(const p of S.peds){ if(!p.alive) continue; const a=aheadOf(c,p.pos.x,p.pos.z); if(a.ahead>0&&a.ahead<14&&a.side<4) startFlee(p,c.pos,3); }
}
function damageCar(c,n,src){
  if(c.dead) return; c.health-=n; if(src) c.lastHit=src;
  if(c.health<=0) explodeCar(c);
}
function explodeCar(c){
  c.dead=true; c.speed=0; c.ai=false; c.chase=false; c.health=0;
  playNoise(0.7,1.0,350); addExplosion(c.pos.clone().setY(1));
  const src=c.lastHit==='player'?'player':'car';
  if(Player.car===c){ exitCar(); damagePlayer(70); }
  else if(!S.dead){ const d=dist2D(c.pos,Player.pos); if(d<8) damagePlayer(60*(1-d/8)); }
  for(const p of S.peds) if(p.alive && dist2D(p.pos,c.pos)<7) killPed(p,src);
  for(const k of S.cops) if(k.alive && dist2D(k.pos,c.pos)<7) damageCop(k,100,src);
  for(const o of S.cars) if(o!==c && !o.dead && dist2D(o.pos,c.pos)<7) damageCar(o,45,src);
  for(const p of [c.driverNpc,c.riderNpc].concat(c.riders)) if(p&&p.alive){ p.riding=null; p.mesh.visible=true; setSeated(p.mesh,false); killPed(p,'blast',undefined,c.pos); } c.driverNpc=null; c.riderNpc=null; c.riders=[];
  c.mesh.traverse(o=>{ if(o.isMesh) o.material=_blackMat; });
  if(c.mesh.userData.lights) c.mesh.userData.lights.forEach(l=>l.visible=false);
  if(src==='player' && c.police) crime('copKill');
}
function managePoliceCars(dt){
  const pp=Player.car?Player.car.pos:Player.pos;
  const desired=S.wanted>=3?Math.min(3,S.wanted-2):0;
  const active=S.cars.filter(c=>c.police&&c.chase&&!c.dead&&c.driver!==Player);
  S.copCarT=(S.copCarT||0)-dt;
  if(active.length<desired && S.copCarT<=0 && !S.dead && !S.busted){
    S.copCarT=5;
    for(let t=0;t<20;t++){ const c=spawnCar({police:true,chase:true}); const d=dist2D(c.pos,pp); if(d>80&&d<170) break; removeCarAt(S.cars.length-1); }
  }
  if(S.wanted===0) for(const c of active){ c.chase=false; c.ai=true; setTrafficFromPose(c); }
}
