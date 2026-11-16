// world.js — şehir: yollar, kaldırımlar, binalar, lambalar, ağaçlar, yaya düğümleri
function makeCanvasTex(w,h,draw,repeat){
  const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'));
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; if(repeat) t.repeat.set(repeat[0],repeat[1]);
  t.anisotropy=8; t.encoding=THREE.sRGBEncoding; return t;
}
function noise(g,w,h,n,a){ for(let i=0;i<n;i++){ const v=Math.random()*60|0; g.fillStyle='rgba('+v+','+v+','+v+','+a+')'; g.fillRect(Math.random()*w,Math.random()*h,2,2); } }
// Pencere dokusu: gündüz haritası + gece için yalnız yanan pencerelerin parladığı emissive harita
function windowTextures(style){
  const cols=style===2?2:4, ww=style===2?44:16, wh=style===2?24:20, lit=[];
  for(let i=0;i<4*cols;i++) lit.push(Math.random()<0.3);
  const map=makeCanvasTex(128,128,g=>{
    g.fillStyle=style===1?'#d9d5cc':style===2?'#cfd6dd':'#e8e4dc'; g.fillRect(0,0,128,128); noise(g,128,128,400,0.08);
    for(let y=0;y<4;y++) for(let x=0;x<cols;x++){
      const cw=128/cols, px=x*cw+(cw-ww)/2, py=y*32+6;
      g.fillStyle=Math.random()<0.5?'#2b3a4e':'#3a4d66'; g.fillRect(px,py,ww,wh);
      g.fillStyle='rgba(255,255,255,0.28)'; g.fillRect(px,py,ww,3);
      g.fillStyle='rgba(0,0,0,0.35)'; g.fillRect(px,py+wh-2,ww,2); if(style!==2){ g.fillRect(px+ww/2-1,py,2,wh); }
    }
  });
  const em=makeCanvasTex(128,128,g=>{
    g.fillStyle='#000'; g.fillRect(0,0,128,128);
    for(let y=0;y<4;y++) for(let x=0;x<cols;x++){ if(!lit[y*cols+x]) continue; const cw=128/cols, px=x*cw+(cw-ww)/2, py=y*32+6; g.fillStyle=Math.random()<0.5?'#ffd98a':'#fff1c4'; g.fillRect(px,py,ww,wh); }
  });
  return {map,em};
}
function updateDayNight(dt){
  S.dayTime=((S.dayTime===undefined?0.3:S.dayTime)+dt*(S.fastClock?20:1)/600)%1;
  const ang=S.dayTime*Math.PI*2, elev=-Math.cos(ang);
  const day=clamp((elev+0.12)/0.45,0,1), dusk=clamp(1-Math.abs(elev)/0.22,0,1);
  const pp=Player.car?Player.car.pos:Player.pos;
  const dir=elev>=0?new THREE.Vector3(Math.sin(ang)*0.7,elev+0.05,0.45):new THREE.Vector3(-Math.sin(ang)*0.5,-elev*0.5+0.25,0.5); dir.normalize();
  S.sun.position.copy(pp).addScaledVector(dir,180); S.sun.target.position.set(pp.x,0,pp.z); S.sun.target.updateMatrixWorld();
  S.sun.intensity = elev>=0 ? 0.3+1.2*day : 0.14;
  const C=(a,b,t)=>new THREE.Color(a).lerp(new THREE.Color(b),t);
  S.sun.color.copy(elev>=0?C(0xffa050,0xfff0d8,1-dusk):new THREE.Color(0x8fa8ff));
  S.hemi.intensity=0.22+0.7*day; S.hemi.color.copy(C(0x3a4a7a,0xcfe3ff,day));
  const top=C(0x070b1a,0x3d7fd6,day).lerp(new THREE.Color(0x6a4a7a),dusk*0.5), hor=C(0x151a2a,0xd8e6f2,day).lerp(new THREE.Color(0xff9a4a),dusk*0.75);
  S.sky.material.uniforms.top.value.copy(top); S.sky.material.uniforms.horizon.value.copy(hor); S.sky.material.uniforms.sunDir.value.copy(dir);
  S.scene.fog.color.copy(hor);
  const night=1-day; for(const m of S.windowMats) m.emissiveIntensity=night*0.9;
  S.lampHeadMat.color.copy(C(0x8a8a80,0xfff2b0,night));
  S.night=night;
}
function roadTexture(){
  return makeCanvasTex(128,256,g=>{
    g.fillStyle='#3b3b40'; g.fillRect(0,0,128,256); noise(g,128,256,1400,0.12);
    g.fillStyle='#e8c23a'; g.fillRect(61,20,6,100);  // kesikli orta çizgi
    g.fillStyle='#d9d9d9'; g.fillRect(4,0,3,256); g.fillRect(121,0,3,256);
  });
}
function walkTexture(){
  return makeCanvasTex(128,128,g=>{
    g.fillStyle='#a9a6a0'; g.fillRect(0,0,128,128); noise(g,128,128,500,0.1);
    g.strokeStyle='rgba(0,0,0,0.22)'; g.lineWidth=2; for(let i=0;i<=128;i+=32){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,128); g.moveTo(0,i); g.lineTo(128,i); g.stroke(); }
  });
}
function grassTexture(){
  return makeCanvasTex(128,128,g=>{ g.fillStyle='#4a7a3c'; g.fillRect(0,0,128,128); for(let i=0;i<1500;i++){ g.fillStyle=Math.random()<0.5?'rgba(30,70,25,0.35)':'rgba(120,160,70,0.25)'; g.fillRect(Math.random()*128,Math.random()*128,2,3); } });
}
function makeSky(){
  const mat=new THREE.ShaderMaterial({ side:THREE.BackSide, depthWrite:false,
    uniforms:{ top:{value:new THREE.Color(0x3d7fd6)}, horizon:{value:new THREE.Color(0xd8e6f2)}, sunDir:{value:new THREE.Vector3(80,140,50).normalize()} },
    vertexShader:'varying vec3 vW; void main(){ vW=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:'uniform vec3 top; uniform vec3 horizon; uniform vec3 sunDir; varying vec3 vW; void main(){ vec3 d=normalize(vW-cameraPosition); float t=pow(max(d.y,0.0),0.55); vec3 col=mix(horizon,top,t); float s=max(dot(d,sunDir),0.0); col+=vec3(1.0,0.95,0.8)*pow(s,600.0)*2.0+vec3(1.0,0.85,0.6)*pow(s,6.0)*0.18; gl_FragColor=vec4(col,1.0); }' });
  const sky=new THREE.Mesh(new THREE.SphereGeometry(650,24,12), mat); sky.frustumCulled=false; sky.renderOrder=-1; S.scene.add(sky); S.sky=sky;
}
function signTexture(text, bg, fg){
  return makeCanvasTex(256,64,g=>{
    g.fillStyle=bg; g.fillRect(0,0,256,64); g.fillStyle=fg; g.font='bold 40px Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(text,128,34);
  });
}
function addObstacle(x1,z1,x2,z2){ S.obstacles.push({minX:x1,maxX:x2,minZ:z1,maxZ:z2}); }

// Araç yansımaları için üretilmiş küp ortam haritası (gök, ufuk, zemin)
function makeEnvMap(){
  const mk=draw=>{ const c=document.createElement('canvas'); c.width=c.height=64; draw(c.getContext('2d')); return c; };
  const side=g=>{ const gr=g.createLinearGradient(0,0,0,64); gr.addColorStop(0,'#5a93d8'); gr.addColorStop(0.48,'#d7e4ef'); gr.addColorStop(0.52,'#6e6e66'); gr.addColorStop(1,'#34342f'); g.fillStyle=gr; g.fillRect(0,0,64,64); for(let i=0;i<6;i++){ g.fillStyle='rgba(40,40,45,0.8)'; g.fillRect(i*11,26,6,8+Math.random()*8); } };
  const faces=[mk(side),mk(side),mk(g=>{ g.fillStyle='#4a86d2'; g.fillRect(0,0,64,64); g.fillStyle='#fff6e0'; g.beginPath(); g.arc(40,20,9,0,7); g.fill(); }),mk(g=>{ g.fillStyle='#34342f'; g.fillRect(0,0,64,64); }),mk(side),mk(side)];
  const t=new THREE.CubeTexture(faces); t.needsUpdate=true; t.encoding=THREE.sRGBEncoding; S.envMap=t; return t;
}
function buildWorld(){
  const scene=S.scene, P=CITY.P, N=CITY.N, R=CITY.R, size=CITY.size;
  scene.fog=new THREE.Fog(0xd8e6f2,160,520); makeSky(); makeEnvMap();
  S.hemi=new THREE.HemisphereLight(0xcfe3ff,0x6b6150,0.9); scene.add(S.hemi);
  const sun=new THREE.DirectionalLight(0xfff0d8,1.7); sun.position.set(80,140,50); sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048); const sc=sun.shadow.camera; sc.left=sc.bottom=-120; sc.right=sc.top=120; sc.near=10; sc.far=420; sun.shadow.bias=-0.0015; sun.shadow.normalBias=0.05;
  scene.add(sun); scene.add(sun.target); S.sun=sun;

  const gt=grassTexture(); gt.repeat.set(300,300);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400), matLambert(0xffffff,{map:gt})); ground.rotation.x=-Math.PI/2; ground.position.set(size/2,0,size/2); ground.receiveShadow=true; scene.add(ground);

  // Yollar
  const rtex=roadTexture(); const L=size+R;
  for(let i=0;i<=N;i++){
    const tv=rtex.clone(); tv.needsUpdate=true; tv.repeat.set(1,L/12);
    const v=new THREE.Mesh(new THREE.PlaneGeometry(R,L), matLambert(0xffffff,{map:tv})); v.rotation.x=-Math.PI/2; v.position.set(i*P,0.02,size/2); v.receiveShadow=true; scene.add(v);
    const th=rtex.clone(); th.needsUpdate=true; th.repeat.set(1,L/12);
    const h=new THREE.Mesh(new THREE.PlaneGeometry(R,L), matLambert(0xffffff,{map:th})); h.rotation.x=-Math.PI/2; h.rotation.z=Math.PI/2; h.position.set(size/2,0.02,i*P); h.receiveShadow=true; scene.add(h);
  }
  const interMat=matLambert(0x3b3b40), zebra=matLambert(0xdddddd);
  for(let i=0;i<=N;i++) for(let j=0;j<=N;j++){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(R,R), interMat); m.rotation.x=-Math.PI/2; m.position.set(i*P,0.03,j*P); scene.add(m);
    for(let k=-2;k<=2;k++){ // yaya geçitleri
      for(const [dx,dz,rot] of [[0,R/2+1.2,0],[0,-R/2-1.2,0],[R/2+1.2,0,1],[-R/2-1.2,0,1]]){
        const s=new THREE.Mesh(new THREE.PlaneGeometry(1.2,2.2), zebra); s.rotation.x=-Math.PI/2; if(rot) s.rotation.z=Math.PI/2;
        s.position.set(i*P+dx+(rot?0:k*2.4), 0.035, j*P+dz+(rot?k*2.4:0)); scene.add(s);
      }
    }
  }

  // Kaldırımlar ve binalar
  const wtex=[windowTextures(0),windowTextures(1),windowTextures(2)];
  const palette=[0xc9b8a0,0x9fa8b3,0xb5604f,0x7d8c99,0xd8d2c4,0x6b7f8f,0xa07c5b,0x8d9bb0];
  const sideMats=[]; for(const c of palette) for(const t of wtex) sideMats.push(matLambert(c,{map:t.map,emissiveMap:t.em,emissive:0xffffff,emissiveIntensity:0}));
  S.windowMats=sideMats;
  const roofMat=matLambert(0x55575c); S.detailMats={base:matLambert(0x2a2f36), glass:matLambert(0x6d8ea8,{emissive:0x101820}), ac:matLambert(0x9a9a9a), tank:matLambert(0x7a5a3a)};
  const wk=walkTexture(); const walkMat=matLambert(0xffffff,{map:wk});
  const specials={}; specials['0,0']='hospital'; specials[(N-1)+',0']='police'; specials['3,3']='park'; specials['0,'+(N-1)]='gunshop';
  S.places={};
  for(let i=0;i<N;i++) for(let j=0;j<N;j++){
    const cx=i*P+P/2, cz=j*P+P/2, bw=P-R;
    const wg=new THREE.BoxGeometry(bw,0.25,bw); scaleBoxUV(wg,bw,0.25,bw);
    const walk=new THREE.Mesh(wg, walkMat); walk.position.set(cx,0.125,cz); walk.receiveShadow=true; scene.add(walk);
    const kind=specials[i+','+j];
    if(kind==='park'){ buildPark(cx,cz); continue; }
    if(kind){ buildSpecial(kind,cx,cz); continue; }
    const inner=bw-2*CITY.SW-2, hf=inner/2-1.5, q=inner/4;
    const layout=Math.random();
    const cells = layout<0.3 ? [[0,0,inner,inner]] : layout<0.65 ? [[-q,0,hf,inner],[q,0,hf,inner]]
      : [[-q,-q,hf,hf],[q,-q,hf,hf],[-q,q,hf,hf],[q,q,hf,hf]];
    const central = 1 - (Math.abs(i-3)+Math.abs(j-3))/6;
    for(const [ox,oz,w,d] of cells){
      const h = rand(8,16) + central*rand(10,50);
      const face = cells.length===1 ? pick([[1,0],[-1,0],[0,1],[0,-1]]) : (Math.abs(ox)>=Math.abs(oz)?[Math.sign(ox)||1,0]:[0,Math.sign(oz)||1]);
      makeBuilding(cx+ox,cz+oz,w,h,d,pick(sideMats),roofMat,face);
    }
  }
  finishBalconies();
  buildLampsAndTrees();
  buildTrafficLights();
  buildNodes();
}
// Trafik ışıkları: her kavşakta 4 direk; z ekseni ve x ekseni dönüşümlü yeşil
function lightFor(axis,road,k){ const i=axis==='z'?road:k, j=axis==='z'?k:road; const t=(S.time+(i*3+j*5)%16)%16; const zg=t<7, zy=t>=7&&t<8, xg=t>=8&&t<15, xy=t>=15; if(axis==='z') return zg?'green':zy?'yellow':'red'; return xg?'green':xy?'yellow':'red'; }
function buildTrafficLights(){
  const P=CITY.P,N=CITY.N,R=CITY.R, list=[];
  for(let i=0;i<=N;i++) for(let j=0;j<=N;j++) for(const [sx,sz,axis] of [[1,-1,'z'],[-1,1,'z'],[1,1,'x'],[-1,-1,'x']]) list.push({x:i*P+sx*(R/2+0.6),z:j*P+sz*(R/2+0.6),i,j,axis});
  const pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07,0.09,4.2,6),matLambert(0x444444),list.length);
  const head=new THREE.InstancedMesh(new THREE.BoxGeometry(0.32,0.8,0.3),matLambert(0x1a1a1a),list.length);
  const lamp=new THREE.InstancedMesh(new THREE.SphereGeometry(0.11,8,6),new THREE.MeshBasicMaterial({color:0xffffff}),list.length);
  const m=new THREE.Matrix4(), c=new THREE.Color();
  list.forEach((L,k)=>{ m.makeTranslation(L.x,2.1,L.z); pole.setMatrixAt(k,m); m.makeTranslation(L.x,4.3,L.z); head.setMatrixAt(k,m); m.makeTranslation(L.x,4.3,L.z); lamp.setMatrixAt(k,m); lamp.setColorAt(k,c.setHex(0xff2020)); });
  S.scene.add(pole,head,lamp); S.tlights={list,lamp,t:0};
}
function updateTrafficLights(dt){
  const T=S.tlights; if(!T) return; T.t-=dt; if(T.t>0) return; T.t=0.25;
  const c=new THREE.Color(); T.list.forEach((L,k)=>{ const s=lightFor(L.axis,L.axis==='z'?L.i:L.j,L.axis==='z'?L.j:L.i); T.lamp.setColorAt(k,c.setHex(s==='green'?0x30ff50:s==='yellow'?0xffcc20:0xff2020)); });
  T.lamp.instanceColor.needsUpdate=true;
}
var SHOP_NAMES=['MARKET','ECZANE','BERBER','KAFE','FIRIN','KEBAP','BANKA','OTEL','BUTİK','LOKANTA','KUAFÖR','TEKEL','PASTANE','ELEKTRONİK','KİTABEVİ','DÖNER','BÜFE','SPOR','NOTER','DİŞÇİ'];
var SIGN_COLORS=[['#b3261e','#ffffff'],['#1b4fa0','#ffffff'],['#f2c14e','#1a1a1a'],['#2a7f4f','#ffffff'],['#111111','#ffd23b'],['#7a2a8a','#ffffff'],['#e86f1f','#ffffff']];
var AWNING_COLORS=[0xb3261e,0x1b4fa0,0x2a7f4f,0xe86f1f,0x7a2a8a,0xd9d2c4];
var _balcony={slabs:[],rails:[]};
// Bina: düz ya da kademeli kule; cephe detayları ayrıca
function makeBuilding(x,z,w,h,d,mat,roofMat,face){
  const stepped=h>28 && Math.random()<0.55;
  const parts=stepped?[[w,h*0.55,d,0,0],[w*rand(0.55,0.75),h*0.45,d*rand(0.55,0.75),rand(-0.1,0.1)*w,rand(-0.1,0.1)*d]]:[[w,h,d,0,0]];
  let y0=0.25;
  for(const [pw,ph,pd,ox,oz] of parts){
    const geo=new THREE.BoxGeometry(pw,ph,pd); scaleBoxUV(geo,pw,ph,pd);
    const mesh=new THREE.Mesh(geo,[mat,mat,roofMat,roofMat,mat,mat]); mesh.position.set(x+ox,y0+ph/2,z+oz); mesh.castShadow=true; mesh.receiveShadow=true;
    mesh.userData.entity={type:'building'}; S.scene.add(mesh); S.buildingMeshes.push(mesh);
    if(y0>0.3){ const ledge=new THREE.Mesh(new THREE.BoxGeometry(pw+0.5,0.4,pd+0.5),S.detailMats.base); ledge.position.set(x+ox,y0-0.2,z+oz); S.scene.add(ledge); }
    y0+=ph;
  }
  addObstacle(x-w/2,z-d/2,x+w/2,z+d/2);
  buildingDetails(x,z,w,h,d,face,stepped?parts[1]:null);
}
function finishBalconies(){
  const B=_balcony; if(!B.slabs.length) return; const m=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(1,1,1);
  const slab=new THREE.InstancedMesh(new THREE.BoxGeometry(1,0.12,1),matLambert(0xbcb8ae),B.slabs.length); slab.castShadow=true;
  const rail=new THREE.InstancedMesh(new THREE.BoxGeometry(1,0.5,0.05),matLambert(0x333333),B.rails.length);
  B.slabs.forEach((b,i)=>{ q.setFromEuler(new THREE.Euler(0,b.ry,0)); m.compose(new THREE.Vector3(b.x,b.y,b.z),q,new THREE.Vector3(b.w,1,1.0)); slab.setMatrixAt(i,m); });
  B.rails.forEach((b,i)=>{ q.setFromEuler(new THREE.Euler(0,b.ry,0)); m.compose(new THREE.Vector3(b.x,b.y,b.z),q,new THREE.Vector3(b.w,1,1)); rail.setMatrixAt(i,m); });
  S.scene.add(slab,rail);
}
// Zemin kat vitrin bandı, kapı, tabela, tente, balkonlar, çatı klimaları, su deposu, anten, reklam panosu
function buildingDetails(x,z,w,h,d,face,upper){
  const M=S.detailMats, top=h+0.25;
  face=face||[0,1]; const fx=face[0], fz=face[1]; const half=fx?w/2:d/2; const ry=fx?(fx>0?Math.PI/2:-Math.PI/2):(fz>0?0:Math.PI);
  const px=x+fx*(half+0.2), pz=z+fz*(half+0.2);
  const door=new THREE.Mesh(new THREE.BoxGeometry(1.4,2.4,0.12),matLambert(0x2a1f18)); door.position.set(px,1.45,pz); door.rotation.y=ry; S.scene.add(door);
  const nm=pick(SHOP_NAMES), col=pick(SIGN_COLORS);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w,d)*0.6,1.1),new THREE.MeshBasicMaterial({map:signTexture(nm,col[0],col[1])})); sign.position.set(x+fx*(half+0.26),4.5,z+fz*(half+0.26)); sign.rotation.y=ry; S.scene.add(sign);
  if(Math.random()<0.7){ const aw=new THREE.Mesh(new THREE.BoxGeometry(Math.min(w,d)*0.5,0.08,1.0),matLambert(pick(AWNING_COLORS))); aw.position.set(x+fx*(half+0.7),3.3,z+fz*(half+0.7)); aw.rotation.y=ry; aw.rotation.x=fx?0:0.25*(fz>0?1:-1); if(fx) aw.rotation.z=0.25*(fx>0?-1:1); aw.castShadow=true; S.scene.add(aw); }
  if(h>=12 && Math.random()<0.5){ const bw=Math.min(w,d)*0.5; for(let y=6.3;y<(upper?h*0.55:h)-2;y+=3.1){ _balcony.slabs.push({x:x+fx*(half+0.5),y:y+0.25,z:z+fz*(half+0.5),ry,w:bw}); _balcony.rails.push({x:x+fx*(half+0.98),y:y+0.55,z:z+fz*(half+0.98),ry,w:bw}); } }
  if(h>36 && Math.random()<0.5){ const bb=new THREE.Mesh(new THREE.PlaneGeometry(10,3.2),new THREE.MeshBasicMaterial({map:signTexture(pick(['SOKAK KRALI','RADYO 101','K-DRUM FM','FLASH BEAT','BANKA','SİNEMA','KOLA']),pick(['#111111','#1b4fa0','#b3261e']),'#ffffff'),side:THREE.DoubleSide})); bb.position.set(x+fx*2,top+2.2,z+fz*2); bb.rotation.y=ry; S.scene.add(bb); for(const sx of [-4,4]){ const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,2.2,6),M.base); pole.position.set(x+fx*2+(fx?0:sx),top+0.9,z+fz*2+(fz?0:sx)); S.scene.add(pole); } }
  const base=new THREE.Mesh(new THREE.BoxGeometry(w+0.3,3.6,d+0.3), M.glass); base.position.set(x,0.25+1.8,z); base.receiveShadow=true; S.scene.add(base);
  const band=new THREE.Mesh(new THREE.BoxGeometry(w+0.4,0.5,d+0.4), M.base); band.position.set(x,0.25+3.8,z); S.scene.add(band);
  const n=randi(1,3);
  for(let i=0;i<n;i++){ const ac=new THREE.Mesh(new THREE.BoxGeometry(rand(1.2,2.2),rand(0.8,1.4),rand(1.2,2.2)), M.ac); ac.position.set(x+rand(-w/2+2,w/2-2),top+0.5,z+rand(-d/2+2,d/2-2)); ac.castShadow=true; S.scene.add(ac); }
  if(Math.random()<0.4){ const t=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,2.2,10), M.tank); t.position.set(x+rand(-w/4,w/4),top+1.1,z+rand(-d/4,d/4)); t.castShadow=true; S.scene.add(t); }
  if(h>30 && Math.random()<0.7){ const a=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.12,rand(4,9),5), M.base); a.position.set(x+rand(-w/3,w/3),top+a.geometry.parameters.height/2,z+rand(-d/3,d/3)); S.scene.add(a); }
  const ledge=new THREE.Mesh(new THREE.BoxGeometry(w+0.5,0.4,d+0.5), M.base); ledge.position.set(x,top-0.2,z); S.scene.add(ledge);
}
function scaleBoxUV(geo,w,h,d){
  const uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++){
    const f=(i/4)|0; let su=1,sv=1;
    if(f<2){su=d/4;sv=h/4;} else if(f<4){su=w/6;sv=d/6;} else {su=w/4;sv=h/4;}
    uv.setXY(i, uv.getX(i)*su, uv.getY(i)*sv);
  }
}
function buildSpecial(kind,cx,cz){
  const cfg={ hospital:{c:0xf4f4f4,h:14,text:'HASTANE',bg:'#ffffff',fg:'#d62828'}, police:{c:0x5b7fb3,h:12,text:'POLİS',bg:'#1b3a6b',fg:'#ffffff'}, gunshop:{c:0x4a4a4a,h:9,text:'SİLAH',bg:'#111111',fg:'#ffd23b'} }[kind];
  const w=30,d=22,h=cfg.h;
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), matLambert(cfg.c)); mesh.position.set(cx,h/2+0.25,cz-6); mesh.castShadow=true; mesh.receiveShadow=true; mesh.userData.entity={type:'building'};
  S.scene.add(mesh); S.buildingMeshes.push(mesh); addObstacle(cx-w/2,cz-6-d/2,cx+w/2,cz-6+d/2);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(16,4), new THREE.MeshBasicMaterial({map:signTexture(cfg.text,cfg.bg,cfg.fg)})); sign.position.set(cx,h-3,cz-6+d/2+0.06); S.scene.add(sign);
  const sign2=sign.clone(); sign2.rotation.y=Math.PI; sign2.position.set(cx,h-3,cz-6-d/2-0.06); S.scene.add(sign2);
  S.places[kind]={x:cx, z:cz+12};
  if(kind==='hospital'){ const cross=new THREE.Mesh(new THREE.BoxGeometry(4,1,0.3), new THREE.MeshBasicMaterial({color:0xff2222})); cross.position.set(cx,h+1,cz-6); const c2=cross.clone(); c2.rotation.z=Math.PI/2; S.scene.add(cross,c2); }
}
function buildPark(cx,cz){
  const g=new THREE.Mesh(new THREE.PlaneGeometry(40,40), matLambert(0x5f9a44)); g.rotation.x=-Math.PI/2; g.position.set(cx,0.26,cz); S.scene.add(g);
  const f=new THREE.Mesh(new THREE.CylinderGeometry(4,4.5,1,24), matLambert(0x9fb3c8)); f.position.set(cx,0.75,cz); S.scene.add(f);
  const w=new THREE.Mesh(new THREE.CylinderGeometry(3.6,3.6,0.4,24), matLambert(0x3a86c8,{emissive:0x0b3a66})); w.position.set(cx,1.1,cz); S.scene.add(w);
  addObstacle(cx-4.5,cz-4.5,cx+4.5,cz+4.5);
  S.parkTrees=[]; for(let k=0;k<10;k++){ const a=k/10*Math.PI*2; S.parkTrees.push([cx+Math.cos(a)*14, cz+Math.sin(a)*14]); }
  S.places.park={x:cx,z:cz};
}
function buildLampsAndTrees(){
  const P=CITY.P,N=CITY.N,R=CITY.R; const lamps=[], trees=[];
  for(let i=0;i<N;i++) for(let j=0;j<N;j++){
    const x0=i*P+R/2+1, x1=(i+1)*P-R/2-1, z0=j*P+R/2+1, z1=(j+1)*P-R/2-1;
    lamps.push([x0,z0],[x1,z0],[x0,z1],[x1,z1]);
    if((i===0&&j===0)||(i===N-1&&j===0)||(i===0&&j===N-1)) continue; // özel binaların önü açık kalsın
    if(Math.random()<0.5) trees.push([(x0+x1)/2, z0]); if(Math.random()<0.5) trees.push([(x0+x1)/2, z1]);
    if(Math.random()<0.5) trees.push([x0,(z0+z1)/2]); if(Math.random()<0.5) trees.push([x1,(z0+z1)/2]);
  }
  for(const t of S.parkTrees||[]) trees.push(t);
  const pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12,0.16,6,6), matLambert(0x333333), lamps.length);
  S.lampHeadMat=new THREE.MeshBasicMaterial({color:0xfff2b0});
  const head=new THREE.InstancedMesh(new THREE.SphereGeometry(0.35,8,6), S.lampHeadMat, lamps.length);
  const m=new THREE.Matrix4();
  lamps.forEach(([x,z],k)=>{ m.makeTranslation(x,3.25,z); pole.setMatrixAt(k,m); m.makeTranslation(x,6.4,z); head.setMatrixAt(k,m); });
  S.scene.add(pole,head);
  const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2,0.3,2.2,6), matLambert(0x6b4a2b), trees.length);
  const crown=new THREE.InstancedMesh(new THREE.SphereGeometry(2.2,8,6), matLambert(0x3f8a3a), trees.length); crown.castShadow=true;
  trees.forEach(([x,z],k)=>{ m.makeTranslation(x,1.3,z); trunk.setMatrixAt(k,m); const s=rand(0.8,1.3); m.makeScale(s,s,s); m.setPosition(x,3.4*s,z); crown.setMatrixAt(k,m); addObstacle(x-0.35,z-0.35,x+0.35,z+0.35); });
  S.scene.add(trunk,crown);
}
function buildNodes(){
  const P=CITY.P,N=CITY.N,R=CITY.R; const cs=[]; for(let i=0;i<=N;i++){ cs.push(i*P-(R/2+1.5)); cs.push(i*P+(R/2+1.5)); }
  const L=cs.length; S.nodes=[];
  for(let a=0;a<L;a++) for(let b=0;b<L;b++){ S.nodes.push({x:cs[a],z:cs[b],ia:a,ib:b,nb:[]}); }
  for(const n of S.nodes){
    for(const [da,db] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a=n.ia+da,b=n.ib+db; if(a<0||b<0||a>=L||b>=L) continue; n.nb.push(S.nodes[a*L+b]); }
  }
}
