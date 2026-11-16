// core.js — ortak durum, yardımcılar, girdi ve ses
var S = {
  scene:null, camera:null, renderer:null, time:0, dt:0,
  keys:{}, mouse:{down:false, wasDown:false, rdown:false, locked:false, idle:99},
  yaw:0, pitch:0.25,
  peds:[], cops:[], cars:[], pickups:[], effects:[],
  obstacles:[], buildingMeshes:[], nodes:[], nodeMap:{},
  money:250, heat:0, wanted:0, lastCrime:-100,
  stats:{kills:0, copKills:0, swatKills:0, tanks:0},
  paused:true, dead:false, busted:false,
  keyHandlers:[], toasts:[]
};
var CITY = { P:60, N:7, R:14, SW:3 };
CITY.size = CITY.P*CITY.N;
CITY.lo = -(CITY.R/2+CITY.SW); CITY.hi = CITY.size+CITY.R/2+CITY.SW;

function rand(a,b){ return a + Math.random()*(b-a); }
function randi(a,b){ return Math.floor(rand(a,b+1)); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function clamp(v,a,b){ return v<a?a:v>b?b:v; }
function lerpAngle(a,b,t){ let d=b-a; while(d>Math.PI)d-=2*Math.PI; while(d<-Math.PI)d+=2*Math.PI; return a+d*t; }
function angDiff(a,b){ let d=b-a; while(d>Math.PI)d-=2*Math.PI; while(d<-Math.PI)d+=2*Math.PI; return d; }
function dist2D(a,b){ const dx=a.x-b.x, dz=a.z-b.z; return Math.sqrt(dx*dx+dz*dz); }
function matLambert(c, extra){ return new THREE.MeshLambertMaterial(Object.assign({color:c}, extra||{})); }

// Daire (pos, r) ile bina kutularını çarpıştır; pos'u dışarı iter.
function collideWorld(pos, r){
  let hit=false;
  for(let i=0;i<S.obstacles.length;i++){
    const o=S.obstacles[i];
    if(pos.x < o.minX - r || pos.x > o.maxX + r || pos.z < o.minZ - r || pos.z > o.maxZ + r) continue;
    const dl = pos.x - (o.minX - r), dr = (o.maxX + r) - pos.x;
    const dn = pos.z - (o.minZ - r), df = (o.maxZ + r) - pos.z;
    const m = Math.min(dl,dr,dn,df);
    if(m===dl) pos.x = o.minX - r; else if(m===dr) pos.x = o.maxX + r;
    else if(m===dn) pos.z = o.minZ - r; else pos.z = o.maxZ + r;
    hit=true;
  }
  if(pos.x < CITY.lo+r){ pos.x = CITY.lo+r; hit=true; } if(pos.x > CITY.hi-r){ pos.x = CITY.hi-r; hit=true; }
  if(pos.z < CITY.lo+r){ pos.z = CITY.lo+r; hit=true; } if(pos.z > CITY.hi-r){ pos.z = CITY.hi-r; hit=true; }
  return hit;
}
function pointInObstacle(x,z,m){
  for(const o of S.obstacles){ if(x>o.minX-m && x<o.maxX+m && z>o.minZ-m && z<o.maxZ+m) return true; }
  return false;
}
// Görüş hattı: iki nokta arasında bina var mı?
var _ray = null;
function hasLOS(a, b){
  if(!_ray) _ray = new THREE.Raycaster();
  const dir = new THREE.Vector3().subVectors(b,a); const d = dir.length(); if(d<0.01) return true;
  dir.divideScalar(d); _ray.set(a, dir); _ray.far = d; _ray.near = 0;
  return _ray.intersectObjects(S.buildingMeshes, false).length===0;
}
function nearestNode(x,z){
  let best=null, bd=1e9;
  for(const n of S.nodes){ const d=(n.x-x)*(n.x-x)+(n.z-z)*(n.z-z); if(d<bd){bd=d;best=n;} }
  return best;
}
function randomNodeNear(x,z,minD,maxD){
  for(let t=0;t<40;t++){ const n=pick(S.nodes); const d=Math.hypot(n.x-x,n.z-z); if(d>=minD&&d<=maxD) return n; }
  const inR=S.nodes.filter(n=>{ const d=Math.hypot(n.x-x,n.z-z); return d>=minD&&d<=maxD; }); if(inR.length) return pick(inR);
  let best=null,bd=1e9; for(const n of S.nodes){ const d=Math.abs(Math.hypot(n.x-x,n.z-z)-(minD+maxD)/2); if(d<bd){ bd=d; best=n; } } return best||pick(S.nodes);
}

// ---- Girdi ----
function dispatchKey(code){ for(const h of S.keyHandlers) h(code); }
function flushPendingKey(){ if(S.pendingKey && S.time>S.pendingKey.t){ const pk=S.pendingKey; S.pendingKey=null; dispatchKey(pk.code); } }
function initInput(canvas){
  window.addEventListener('keydown', e=>{
    if(e.repeat) return;
    if(typeof Chat!=='undefined' && Chat.open){ if(e.code==='Escape') toggleChat(false); return; }
    if(e.code==='ControlLeft'||e.code==='ControlRight'){ e.preventDefault(); toggleFreeMouse(); return; }
    S.keys[e.code]=true;
    // Hile yazımı: tampon, en uzun olası hile ön eki; menü tuşları (P,M,F,R,H,G) bir hile başlatıyor olabilir diye kısa gecikmeyle çalışır
    let prefixLen=0;
    if(e.key && e.key.length===1 && !S.paused && !(typeof ShopUI!=='undefined' && ShopUI.open)){
      S.cheatBuf=((S.cheatBuf||'')+e.key.toUpperCase()).slice(-24);
      if(typeof checkCheats==='function'){ if(checkCheats()){ S.pendingKey=null; return; } const buf=S.cheatBuf; for(const code in CHEATS){ for(let k=Math.min(buf.length,code.length);k>prefixLen;k--){ if(code.startsWith(buf.slice(-k))){ prefixLen=k; break; } } } }
    }
    if(['Space','KeyW','KeyA','KeyS','KeyD','ShiftLeft','Tab'].includes(e.code)) e.preventDefault();
    const wasd=['KeyW','KeyA','KeyS','KeyD'].includes(e.code);
    if(S.pendingKey){ const pk=S.pendingKey; S.pendingKey=null; if(prefixLen<2) dispatchKey(pk.code); }
    if(prefixLen>=3 && !wasd) return;
    if(prefixLen>=1 && ['KeyP','KeyM','KeyF','KeyR','KeyH','KeyG','KeyK','KeyT','KeyN','KeyC','KeyX','KeyU'].includes(e.code)){ S.pendingKey={code:e.code,t:S.time+0.45}; return; }
    dispatchKey(e.code);
  });
  window.addEventListener('keyup', e=>{ S.keys[e.code]=false; });
  window.addEventListener('blur', ()=>{ S.keys={}; S.mouse.down=false; S.mouse.rdown=false; });
  canvas.addEventListener('mousedown', e=>{
    audioInit();
    if(S.freeMouse) return;
    if(!S.mouse.locked && !S.dragMode){ resumeGame(); return; }
    if(e.button===0) S.mouse.down=true; if(e.button===2) S.mouse.rdown=true;
  });
  // Esc: önce açık pencere kapanır (kendi tuş işleyicisinde), sonra duraklatma menüsü, duraklatmadayken Esc = ana menü
  window.addEventListener('mouseup', e=>{ if(e.button===0) S.mouse.down=false; if(e.button===2) S.mouse.rdown=false; });
  canvas.addEventListener('contextmenu', e=>e.preventDefault());
  document.addEventListener('pointerlockchange', ()=>{
    S.mouse.locked = document.pointerLockElement===canvas;
    if(!S.mouse.locked && S.freeMouse){ S.mouse.down=false; S.mouse.rdown=false; return; } // Ctrl ile bilerek bıraktık, oyun sürer
    S.paused = !S.mouse.locked;
    const ov=document.getElementById('overlay'); if(ov) ov.hidden = S.mouse.locked;
    if(!S.mouse.locked){ S.keys={}; S.mouse.down=false; S.mouse.rdown=false; }
    updateCursor();
  });
  document.addEventListener('mousemove', e=>{
    if(S.freeMouse || S.paused) return;
    if(!S.mouse.locked && !S.dragMode) return;
    S.yaw -= e.movementX*0.0024; S.pitch = clamp(S.pitch + e.movementY*0.0022, -0.35, 1.2); S.mouse.idle=0;
    if(typeof Player!=='undefined'){ Player.sway.x=clamp(Player.sway.x+e.movementX,-60,60); Player.sway.y=clamp(Player.sway.y+e.movementY,-60,60); }
  });
  window.addEventListener('wheel', e=>{ for(const h of S.keyHandlers) h(e.deltaY>0?'WheelDown':'WheelUp'); }, {passive:true});
}

// Başlat: önce fare kilidi dene; tutmazsa (gömülü tarayıcılar) kilitsiz "sürükle-bak" moduna geç.
function resumeGame(){
  audioInit(); const canvas=S.renderer.domElement;
  try{ const p=canvas.requestPointerLock(); if(p&&typeof p.then==='function') p.then(null,()=>{}); }catch(e){}
  setTimeout(()=>{ if(!S.mouse.locked && S.paused){ S.dragMode=true; S.paused=false; const ov=document.getElementById('overlay'); if(ov) ov.hidden=true; } }, 450);
}
// Ana menüye dön: kaydet, fare kilidini bırak, sayfayı yeniden yükle (menü açılır; 'Kayıttan devam' ile sürer)
function returnToMenu(){ try{ if(typeof saveGame==='function' && !S.noSave) saveGame(); }catch(e){} S.noSave=true; try{ if(document.pointerLockElement) document.exitPointerLock(); }catch(e){} try{ location.reload(); }catch(e){ location.href=location.href; } }
function pauseGame(){ S.dragMode=false; S.freeMouse=false; S.paused=true; S.keys={}; S.mouse.down=false; S.mouse.rdown=false; const ov=document.getElementById('overlay'); if(ov) ov.hidden=false; updateCursor(); }
// Ctrl: fareyi serbest bırak / tekrar yakala (oyun durmaz)
function toggleFreeMouse(){
  if(S.paused) return;
  const canvas=S.renderer.domElement;
  if(S.freeMouse){
    S.freeMouse=false;
    if(!S.dragMode){ try{ const p=canvas.requestPointerLock(); if(p&&typeof p.then==='function') p.then(null,()=>{}); }catch(e){} }
    toast('Fare yakalandı');
  } else {
    S.freeMouse=true; S.mouse.down=false; S.mouse.rdown=false;
    if(S.mouse.locked){ try{ document.exitPointerLock(); }catch(e){} }
    toast('Fare serbest — Ctrl ile geri al');
  }
  updateCursor();
}
function updateCursor(){ const c=S.renderer&&S.renderer.domElement; if(!c) return; c.style.cursor = (!S.paused && !S.freeMouse && (S.dragMode||S.mouse.locked)) ? 'none' : 'default'; }

// Ortam sesi: şehir uğultusu (döngülü filtreli gürültü)
var ambSrc=null, ambGain=null;
function ambientUpdate(dt){
  if(!AC) return;
  if(!ambSrc){ const n=AC.sampleRate*2|0, buf=AC.createBuffer(1,n,AC.sampleRate), d=buf.getChannelData(0); let last=0; for(let i=0;i<n;i++){ last=last*0.98+(Math.random()*2-1)*0.02; d[i]=last*8; }
    ambSrc=AC.createBufferSource(); ambSrc.buffer=buf; ambSrc.loop=true; const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=260; ambGain=AC.createGain(); ambGain.gain.value=0; ambSrc.connect(f); f.connect(ambGain); ambGain.connect(AC.destination); ambSrc.start(); }
  const t=S.paused?0:(Player.car?0.02:0.045); ambGain.gain.value+=(t-ambGain.gain.value)*Math.min(1,dt*2);
}
// Motor sesi: hız ile tınısı değişen testere dalgası
var engOsc=null, engGain=null, engFilter=null;
function engineUpdate(active, speed, dt){
  if(!AC) return;
  if(!engOsc){ engOsc=AC.createOscillator(); engOsc.type='sawtooth'; engFilter=AC.createBiquadFilter(); engFilter.type='lowpass'; engFilter.frequency.value=380; engGain=AC.createGain(); engGain.gain.value=0; engOsc.connect(engFilter); engFilter.connect(engGain); engGain.connect(AC.destination); engOsc.start(); }
  const target=active?0.05:0; engGain.gain.value+=(target-engGain.gain.value)*Math.min(1,dt*6);
  const rpm=45+Math.abs(speed)*3.2+(active&&S.keys.KeyW?12:0);
  engOsc.frequency.value+=(rpm-engOsc.frequency.value)*Math.min(1,dt*4);
}

// ---- Ses (Web Audio, dosyasız) ----
var AC=null, sirenOsc=null, sirenGain=null;
function audioInit(){
  if(!AC){ try{ AC = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; } }
  if(AC.state==='suspended') AC.resume();
}
function playNoise(dur, vol, freq){
  if(!AC) return;
  const n = (AC.sampleRate*dur)|0, buf = AC.createBuffer(1,n,AC.sampleRate), d = buf.getChannelData(0);
  for(let i=0;i<n;i++){ const k=1-i/n; d[i]=(Math.random()*2-1)*k*k; }
  const src=AC.createBufferSource(); src.buffer=buf;
  const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=freq;
  const g=AC.createGain(); g.gain.value=vol;
  src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
}
function playTone(freq, dur, vol, type, slide){
  if(!AC) return;
  const o=AC.createOscillator(), g=AC.createGain(); o.type=type||'square'; o.frequency.value=freq;
  if(slide) o.frequency.exponentialRampToValueAtTime(slide, AC.currentTime+dur);
  g.gain.setValueAtTime(vol, AC.currentTime); g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime+dur);
  o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime+dur);
}
// Katmanlı silah sesi: gürültü patlaması + alçak vuruş tonu + mekanik tık + yankı kuyruğu
function playShotLayered(p,vol){
  if(!AC) return; vol=vol===undefined?1:vol; const t=AC.currentTime;
  const noise=(dur,v,freq,delay,q)=>{ const n=(AC.sampleRate*dur)|0, buf=AC.createBuffer(1,n,AC.sampleRate), d=buf.getChannelData(0); for(let i=0;i<n;i++){ const k=1-i/n; d[i]=(Math.random()*2-1)*k*k; }
    const s=AC.createBufferSource(); s.buffer=buf; const f=AC.createBiquadFilter(); f.type=q?'bandpass':'lowpass'; f.frequency.value=freq; if(q) f.Q.value=q; const g=AC.createGain(); g.gain.value=v*vol; s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t+(delay||0)); };
  noise(p.dur,p.vol,p.lp,0);
  if(p.thump){ const o=AC.createOscillator(), g=AC.createGain(); o.type='sine'; o.frequency.setValueAtTime(p.thump[0],t); o.frequency.exponentialRampToValueAtTime(p.thump[1],t+p.thump[2]); g.gain.setValueAtTime(p.thump[3]*vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+p.thump[2]); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+p.thump[2]+0.02); }
  if(p.click) noise(0.02,p.click*0.8,6000,0,2);
  if(p.echo) noise(p.echo[0],p.echo[1],p.echo[2],p.echo[3]||0.06);
  if(p.whoosh) noise(p.whoosh[0],p.whoosh[1],900,0,1.2);
}
function playScream(female){
  if(!AC) return; const t=AC.currentTime, o=AC.createOscillator(), g=AC.createGain(), f=AC.createBiquadFilter(); const base=female?rand(520,720):rand(240,380), dur=rand(0.35,0.7);
  o.type='sawtooth'; o.frequency.setValueAtTime(base,t); o.frequency.linearRampToValueAtTime(base*1.25,t+dur*0.25); o.frequency.exponentialRampToValueAtTime(base*0.5,t+dur);
  const lfo=AC.createOscillator(), lg=AC.createGain(); lfo.frequency.value=rand(6,9); lg.gain.value=base*0.06; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t+dur);
  f.type='bandpass'; f.frequency.value=female?1600:900; f.Q.value=1.1; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.22,t+0.04); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(f); f.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+dur+0.02);
}
function playGrunt(female){
  if(!AC) return; const t=AC.currentTime, o=AC.createOscillator(), g=AC.createGain(), f=AC.createBiquadFilter(); const base=female?rand(380,480):rand(160,230);
  o.type='square'; o.frequency.setValueAtTime(base,t); o.frequency.exponentialRampToValueAtTime(base*0.7,t+0.18); f.type='lowpass'; f.frequency.value=900;
  g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.2); o.connect(f); f.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+0.22);
}
function sirenUpdate(active, dt){
  if(!AC) return;
  if(!sirenOsc){ sirenOsc=AC.createOscillator(); sirenGain=AC.createGain(); sirenGain.gain.value=0; sirenOsc.type='sawtooth'; sirenOsc.connect(sirenGain); sirenGain.connect(AC.destination); sirenOsc.start(); }
  const target = active ? 0.045 : 0;
  sirenGain.gain.value += (target - sirenGain.gain.value)*Math.min(1, dt*4);
  if(active){ sirenOsc.frequency.value = 650 + 250*Math.sin(S.time*7); }
}
