// avatar.js — karakter editörü (yüz, vücut, saç) ve kıyafet dükkânı: panelin üstünde canlı 3B önizleme (yüz satırlarında yüze yakınlaşır), renkler kutucuk + isim olarak gösterilir; menüden ve oyun içinden (U ya da P → KIYAFET) her zaman değiştirilebilir
S.look={skin:0xe0b090, shirt:0xf0f0f0, pants:0x2b2f4a, hair:0x2a1a0e, hairStyle:'short', jacket:0x2d7a4f, shoes:0x222222, beard:false, mustache:false, glasses:false, shades:false, cap:null, pattern:null, suit:false, tie:0xb01030, body:'normal'};
var AvatarUI={open:false,sel:0,spin:0.4,scene:null,mesh:null,r2:null,cam:null,drag:null,camT:null,raf:0,keyBound:false};
var SKIN_NAMES={0xe0b090:'Açık',0xf1c9a5:'Pembe',0xffdbac:'Bej',0xc68642:'Buğday',0xa06a3a:'Esmer',0x8d5524:'Koyu'};
var HAIR_NAMES={0x1a1a1a:'Siyah',0x4a2f1a:'Kahve',0xb08a4f:'Kumral',0x777777:'Gri',0x2a1a0e:'Koyu Kahve',0xd9b36a:'Sarı',0xcfcfcf:'Beyaz',0xe8e8e8:'Ak',0x9a9a9a:'Kır'};
var CLOTH_COLORS=[0xf0f0f0,0x111111,0xe74c3c,0x3498db,0xf39c12,0x9b59b6,0x1abc9c,0x34495e,0xd35400,0x7f8c8d,0xf1c40f,0x2c2c2c,0xffffff,0x2d7a4f,0x8a1a1a,0x1a3a8a];
var JACKET_OPTS=[null,0x2d7a4f,0x222222,0x5a3a2a,0x1f3a5a,0x7a1a1a,0x3a3a3a,0x6b5a3a,0xf4f4f4,0xd9771e];
var BODY_OPTS=['slim','normal','big','tall'];
var FACE_ROWS=[0,1,2,3,4,5];
function cyc(list,cur,d){ let i=list.indexOf(cur); if(i<0) i=0; return list[(i+d+list.length)%list.length]; }
// Renk adı: ton/doygunluk/parlaklıktan Türkçe ad
function colorName(c,names){ if(c===null||c===undefined) return 'Yok'; if(names&&names[c]) return names[c]; const hsl={}; new THREE.Color(c).getHSL(hsl); const h=hsl.h*360,s=hsl.s,l=hsl.l;
  if(l>0.9) return 'Beyaz'; if(l<0.12) return 'Siyah'; if(s<0.14) return l<0.4?'Koyu Gri':'Gri'; if(h<15||h>=345) return l<0.35?'Bordo':'Kırmızı'; if(h<40) return l<0.4?'Kahverengi':'Turuncu'; if(h<65) return 'Sarı'; if(h<170) return l<0.3?'Koyu Yeşil':'Yeşil'; if(h<200) return 'Turkuaz'; if(h<255) return l<0.3?'Lacivert':'Mavi'; if(h<290) return 'Mor'; return 'Pembe'; }
function swatch(c,names){ return (c===null||c===undefined?'<i class="swatch none"></i>':'<i class="swatch" style="background:'+hex(c)+'"></i>')+colorName(c,names); }
// Çakışma kuralları: şapka+bere, takım+desen, gözlük+güneş gözlüğü birlikte olmaz
function normalizeLook(L){ if(L.cap && L.hairStyle==='beanie') L.hairStyle='short'; if(L.suit){ L.pattern=null; L.shirt=0xf4f4f4; if(!L.jacket) L.jacket=0x1a1a2a; L.pants=L.jacket; } if(L.shades) L.glasses=false; if(L.hairStyle==='bald') L.beard=L.beard; return L; }
function avatarRows(){ const L=S.look; const paid=MENU.started; const $=paid?' ($'+price(60)+')':'';
  return [
    {n:'Ten rengi',v:swatch(L.skin,SKIN_NAMES),f:d=>{ L.skin=cyc(SKINS,L.skin,d); }},
    {n:'Saç',v:{short:'Kısa',bald:'Kel',beanie:'Bere',long:'Uzun'}[L.hairStyle]||L.hairStyle,f:d=>{ L.hairStyle=cyc(['short','bald','beanie','long'],L.hairStyle,d); if(L.hairStyle==='beanie') L.cap=null; }},
    {n:'Saç rengi',v:swatch(L.hair,HAIR_NAMES),f:d=>{ L.hair=cyc(HAIRS.concat([0xcfcfcf]),L.hair,d); }},
    {n:'Sakal',v:L.beard?'Var':'Yok',f:()=>{ L.beard=!L.beard; }},
    {n:'Bıyık',v:L.mustache?'Var':'Yok',f:()=>{ L.mustache=!L.mustache; }},
    {n:'Gözlük',v:L.shades?'Güneş gözlüğü':L.glasses?'Gözlük':'Yok',f:d=>{ const o=L.shades?'shades':L.glasses?'glasses':'none'; const n=cyc(['none','glasses','shades'],o,d); L.glasses=n==='glasses'; L.shades=n==='shades'; }},
    {n:'Vücut',v:{slim:'İnce',normal:'Normal',big:'İri',tall:'Uzun'}[L.body],f:d=>{ L.body=cyc(BODY_OPTS,L.body,d); }},
    {n:'Gömlek'+$,v:swatch(L.shirt),cost:true,f:d=>{ L.shirt=cyc(CLOTH_COLORS,L.shirt,d); L.suit=false; }},
    {n:'Desen'+$,v:{null:'Düz',stripes:'Çizgili',check:'Kareli',floral:'Çiçekli'}[L.pattern],cost:true,f:d=>{ L.pattern=cyc([null,'stripes','check','floral'],L.pattern,d); if(L.pattern) L.suit=false; }},
    {n:'Ceket'+$,v:swatch(L.jacket),cost:true,f:d=>{ L.jacket=cyc(JACKET_OPTS,L.jacket,d); if(!L.jacket) L.suit=false; }},
    {n:'Takım elbise'+$,v:L.suit?'Var (kravatlı)':'Yok',cost:true,f:()=>{ L.suit=!L.suit; if(L.suit){ L.jacket=(L.jacket&&L.jacket!==0xf4f4f4)?L.jacket:0x1a1a2a; } }},
    {n:'Pantolon'+$,v:swatch(L.pants),cost:true,f:d=>{ L.pants=cyc(PANTS.concat([0xd9c7a0,0x111111]),L.pants,d); L.suit=false; }},
    {n:'Ayakkabı'+$,v:swatch(L.shoes),cost:true,f:d=>{ L.shoes=cyc(SHOES.concat([0xc0392b,0x2980b9]),L.shoes,d); }},
    {n:'Şapka'+$,v:swatch(L.cap),cost:true,f:d=>{ L.cap=cyc([null,0x222222,0xc0392b,0x2980b9,0xffffff,0xf1c40f,0x2d7a4f],L.cap,d); }},
    {n:'Rastgele',v:'🎲',f:()=>{ const r=randomLook(false); Object.assign(L,{skin:r.skin,shirt:r.shirt,pants:r.pants,hair:r.hair,hairStyle:r.hairStyle==='beanie'?'beanie':r.hairStyle,jacket:r.jacket,shoes:r.shoes||0x222222,beard:!!r.beard,glasses:!!r.glasses,shades:false,mustache:false,cap:r.cap||null,pattern:r.pattern||null,suit:!!r.suit}); }}
  ]; }
function openAvatar(){ AvatarUI.open=true; AvatarUI.sel=0; document.getElementById('avatar').hidden=false; renderAvatar(); startAvatarPreview();
  if(MENU.started){ S.keys={}; S.mouse.down=false; S.mouse.rdown=false; if(Player.fp){ AvatarUI.wasFp=true; Player.fp=false; } }
  if(!AvatarUI.keyBound){ AvatarUI.keyBound=true; window.addEventListener('keydown',e=>{ if(!AvatarUI.open || MENU.started) return; if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','NumpadEnter','Escape'].includes(e.code)){ e.preventDefault(); e.stopPropagation(); avatarKey(e.code); } },true); }
}
function closeAvatar(){ AvatarUI.open=false; document.getElementById('avatar').hidden=true; if(AvatarUI.wasFp){ Player.fp=true; AvatarUI.wasFp=false; } stopAvatarPreview(); if(typeof savePrefs==='function'){ MENU.look=S.look; savePrefs(); } }
function renderAvatar(){ const rows=avatarRows(); AvatarUI.sel=clamp(AvatarUI.sel,0,rows.length-1); const el=document.getElementById('avatar'); const keepCanvas=el.querySelector('canvas');
  el.innerHTML='<h3>'+(MENU.started?'KIYAFET DÜKKÂNI & KARAKTER':'KARAKTERİNİ OLUŞTUR')+'</h3><div class="prev"><div class="hint">'+(FACE_ROWS.includes(AvatarUI.sel)?'Yüz görünümü · sürükleyerek çevir':'Tam boy · sürükleyerek çevir')+'</div></div><div class="rows">'+rows.map((r,i)=>'<div class="it '+(i===AvatarUI.sel?'sel':'')+'" data-i="'+i+'"><span>'+r.n+'</span><span class="ctl"><button data-d="-1" type="button">◀</button><b>'+r.v+'</b><button data-d="1" type="button">▶</button></span></div>').join('')+'</div><p class="keys">↑ ↓ seç · ← → değiştir · Esc kapat · satırlara ve oklara tıklayabilirsin'+(MENU.started?' · kıyafet değişimi $'+price(60)+', yüz ve vücut ücretsiz':'')+'</p><div class="btns"><button id="avClose" type="button">KAPAT (Esc)</button></div>';
  const prev=el.querySelector('.prev'); if(keepCanvas) prev.insertBefore(keepCanvas,prev.firstChild); else if(AvatarUI.canvas) prev.insertBefore(AvatarUI.canvas,prev.firstChild);
  el.querySelectorAll('.it').forEach(d=>d.addEventListener('click',e=>{ AvatarUI.sel=+d.dataset.i; const b=e.target.closest('button'); if(b){ e.stopPropagation(); avatarKey(+b.dataset.d<0?'ArrowLeft':'ArrowRight'); } else renderAvatar(); }));
  el.querySelector('#avClose').addEventListener('click',()=>closeAvatar());
  const selEl=el.querySelector('.it.sel'); if(selEl && selEl.scrollIntoView) selEl.scrollIntoView({block:'nearest'});
}
function avatarKey(code){ const rows=avatarRows(); if(code==='ArrowUp') AvatarUI.sel--; else if(code==='ArrowDown') AvatarUI.sel++;
  else if(code==='ArrowLeft'||code==='ArrowRight'||code==='Enter'||code==='NumpadEnter'){ const r=rows[AvatarUI.sel]; const d=code==='ArrowLeft'?-1:1; if(r.cost && MENU.started){ const c=price(60); if(S.money<c){ toast('Kıyafet için $'+c+' gerekli'); renderAvatar(); return; } S.money-=c; } r.f(d); normalizeLook(S.look); rebuildPlayerMesh(); }
  else if(code==='Escape'||code==='KeyP'||code==='KeyU'){ closeAvatar(); return; } renderAvatar(); }
function bodyScale(mesh){ const b=S.look.body; const s=b==='slim'?[0.9,1,0.9]:b==='big'?[1.18,1.03,1.18]:b==='tall'?[1,1.08,1]:[1,1,1]; mesh.scale.set(s[0],s[1],s[2]); }
function rebuildPlayerMesh(){
  normalizeLook(S.look);
  if(Player.mesh){ const old=Player.mesh; const m=makeHuman(Object.assign({},S.look,{female:false})); bodyScale(m);
    m.position.copy(old.position); m.rotation.copy(old.rotation); m.visible=old.visible; m.userData.entity={type:'player'}; m.userData.punchLeft=old.userData.punchLeft;
    if(old.parent) old.parent.remove(old); S.scene.add(m); Player.mesh=m; setHumanWeapon(m,Player.wid); if(typeof updateViewModel==='function') updateViewModel(); }
  if(AvatarUI.scene){ if(AvatarUI.mesh) AvatarUI.scene.remove(AvatarUI.mesh); AvatarUI.mesh=makeHuman(Object.assign({},S.look,{female:false})); bodyScale(AvatarUI.mesh); AvatarUI.mesh.rotation.y=AvatarUI.spin; AvatarUI.scene.add(AvatarUI.mesh); }
}
// Panel içi 3B önizleme: ayrı küçük renderer; yüz satırlarında kamera yüze yaklaşır; fareyle sürükleyince döner
function startAvatarPreview(){
  if(!AvatarUI.r2){ try{ AvatarUI.r2=new THREE.WebGLRenderer({antialias:true,alpha:true}); AvatarUI.r2.setPixelRatio(Math.min(devicePixelRatio,2)); AvatarUI.r2.setSize(320,260); AvatarUI.r2.outputEncoding=THREE.sRGBEncoding; AvatarUI.canvas=AvatarUI.r2.domElement; AvatarUI.canvas.className='avcanvas'; }catch(e){ return; }
    const cv=AvatarUI.canvas; cv.addEventListener('mousedown',e=>{ AvatarUI.drag={x:e.clientX,spin:AvatarUI.spin}; e.preventDefault(); }); window.addEventListener('mousemove',e=>{ if(AvatarUI.drag){ AvatarUI.spin=AvatarUI.drag.spin+(e.clientX-AvatarUI.drag.x)*0.02; AvatarUI.dragT=1.5; } }); window.addEventListener('mouseup',()=>{ AvatarUI.drag=null; });
    cv.addEventListener('touchstart',e=>{ if(e.touches[0]) AvatarUI.drag={x:e.touches[0].clientX,spin:AvatarUI.spin}; },{passive:true}); cv.addEventListener('touchmove',e=>{ if(AvatarUI.drag&&e.touches[0]){ AvatarUI.spin=AvatarUI.drag.spin+(e.touches[0].clientX-AvatarUI.drag.x)*0.02; AvatarUI.dragT=1.5; } },{passive:true}); cv.addEventListener('touchend',()=>{ AvatarUI.drag=null; });
  }
  const prev=document.querySelector('#avatar .prev'); if(prev && AvatarUI.canvas.parentNode!==prev) prev.insertBefore(AvatarUI.canvas,prev.firstChild);
  const sc=new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff,0x334455,1.0)); const dl=new THREE.DirectionalLight(0xffffff,1.0); dl.position.set(2,4,3); sc.add(dl); const fl=new THREE.DirectionalLight(0xffe0b0,0.4); fl.position.set(-3,2,-2); sc.add(fl);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(0.9,32),new THREE.MeshLambertMaterial({color:0x2a2f3a})); floor.rotation.x=-Math.PI/2; sc.add(floor);
  AvatarUI.scene=sc; AvatarUI.cam=new THREE.PerspectiveCamera(32,320/260,0.05,50); AvatarUI.camT={y:1.0,d:4.3}; AvatarUI.cam.position.set(0,1.0,4.3); AvatarUI.cam.lookAt(0,1.0,0);
  rebuildPlayerMesh(); if(AvatarUI.raf) cancelAnimationFrame(AvatarUI.raf);
  let last=performance.now();
  const loop=(now)=>{ if(!AvatarUI.scene) return; const dt=Math.min(0.05,(now-last)/1000); last=now; AvatarUI.raf=requestAnimationFrame(loop);
    AvatarUI.dragT=Math.max(0,(AvatarUI.dragT||0)-dt); if(!AvatarUI.drag && AvatarUI.dragT<=0) AvatarUI.spin+=dt*0.5; if(AvatarUI.mesh) AvatarUI.mesh.rotation.y=AvatarUI.spin;
    const face=FACE_ROWS.includes(AvatarUI.sel); const ty=face?1.62:1.0, td=face?1.35:4.3; AvatarUI.camT.y+=(ty-AvatarUI.camT.y)*Math.min(1,dt*6); AvatarUI.camT.d+=(td-AvatarUI.camT.d)*Math.min(1,dt*6);
    AvatarUI.cam.position.set(0,AvatarUI.camT.y+(face?0.1:0.25),AvatarUI.camT.d); AvatarUI.cam.lookAt(0,AvatarUI.camT.y,0);
    AvatarUI.r2.render(AvatarUI.scene,AvatarUI.cam); };
  AvatarUI.raf=requestAnimationFrame(loop);
}
function stopAvatarPreview(){ if(AvatarUI.raf) cancelAnimationFrame(AvatarUI.raf); AvatarUI.raf=0; AvatarUI.scene=null; AvatarUI.mesh=null; }
