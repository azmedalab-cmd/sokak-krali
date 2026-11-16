// missions.js — görev işaretleri, görevler, silah dükkânı, Pay'n'Spray, hileler
var MARKERS=[];
function makeMarker(kind,x,z,color,r){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,2.4,24,1,true), new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.3,side:THREE.DoubleSide,depthWrite:false})); m.position.set(x,1.2,z); S.scene.add(m);
  const ring=new THREE.Mesh(new THREE.RingGeometry(r-0.2,r,28), new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.set(x,0.32,z); S.scene.add(ring);
  const mk={kind,x,z,mesh:m,ring,r,color}; MARKERS.push(mk); return mk;
}
function initMissions(){
  const P=CITY.P, pk=S.places.park, gs=S.places.gunshop;
  S.places.job={x:pk.x, z:pk.z+21}; makeMarker('job',pk.x,pk.z+21,0xffd23b,1.6);
  makeMarker('shop',gs.x,gs.z,0x3bff6b,1.6);
  const si=Math.min(5,CITY.N-1); S.places.spray={x:si*P+30-12, z:2*P+30-22}; makeMarker('spray',S.places.spray.x,S.places.spray.z,0xff5fd2,2.6);
  S.beacon=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,60,10,1,true), new THREE.MeshBasicMaterial({color:0xffd23b,transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})); S.beacon.visible=false; S.scene.add(S.beacon);
  S.objMarker=makeMarker('obj',0,0,0xffd23b,3); S.objMarker.mesh.visible=false; S.objMarker.ring.visible=false; MARKERS.pop();
}
function setObjective(x,z){ if(S.mission) S.mission.target={x,z}; S.objTarget={x,z}; S.beacon.position.set(x,30,z); S.beacon.visible=true; S.objMarker.mesh.position.set(x,1.2,z); S.objMarker.ring.position.set(x,0.32,z); S.objMarker.mesh.visible=S.objMarker.ring.visible=true; }
function clearObjective(){ S.objTarget=null; if(S.mission) S.mission.target=null; S.beacon.visible=false; S.objMarker.mesh.visible=S.objMarker.ring.visible=false; }
function flashMessage(t,sub,ok){ const o=document.getElementById('overlay2'); o.hidden=false; o.classList.toggle('ok',!!ok); o.querySelector('h2').textContent=t; o.querySelector('p').textContent=sub||''; S.flashT=2.8; }

function startMission(){
  const pp=Player.pos, kind=pick(['car','hit','race','courier']); const m={kind,timer:0,step:0}; S.mission=m;
  if(kind==='car'){
    let c; for(let t=0;t<30;t++){ c=spawnCar({type:'sports'}); if(dist2D(c.pos,pp)>80&&dist2D(c.pos,pp)<170) break; removeCarAt(S.cars.length-1); c=null; }
    if(!c){ S.mission=null; S.jobCooldown=3; return; } c.mission=true; c.ai=false; c.parked=true; c.speed=0; m.car=c; m.title='ARAÇ HIRSIZLIĞI'; m.obj='İşaretli spor arabayı çal ve Pay\'n\'Spray garajına götür.'; m.timer=150; setObjective(c.pos.x,c.pos.z);
  } else if(kind==='hit'){
    const n=randomNodeNear(pp.x,pp.z,80,160); const p=spawnPed(n); p.mission=true; p.health=60; p.mesh.userData.torso.material=matLambert(0x111111); m.ped=p;
    m.title='SUİKAST'; m.obj='Hedefi bul ve öldür. Seni görünce kaçacak.'; m.timer=110; setObjective(p.pos.x,p.pos.z);
  } else if(kind==='race'){
    m.points=[]; let cur={x:pp.x,z:pp.z}; for(let i=0;i<5;i++){ const n=randomNodeNear(cur.x,cur.z,60,110); m.points.push({x:n.x,z:n.z}); cur=n; }
    m.title='KONTROL NOKTASI YARIŞI'; m.obj='5 kontrol noktasından sırayla geç. Araba kullan!'; m.timer=100; setObjective(m.points[0].x,m.points[0].z);
  } else {
    const a=randomNodeNear(pp.x,pp.z,50,100); m.pick={x:a.x,z:a.z}; const b=randomNodeNear(a.x,a.z,90,170); m.drop={x:b.x,z:b.z};
    m.title='KURYE'; m.obj='Paketi işaretli yerden al.'; m.timer=120; setObjective(a.x,a.z);
  }
  flashMessage(m.title,m.obj,true); playTone(660,0.12,0.15,'square',990);
}
function endMission(ok,reward,why){
  const m=S.mission; if(!m) return;
  if(m.car){ m.car.mission=false; } if(m.ped){ m.ped.mission=false; }
  clearObjective(); S.mission=null; S.jobCooldown=4;
  if(ok){ reward=typeof price==='function'?Math.round(reward/(S.diff||1)):reward; S.money+=reward; flashMessage('GÖREV TAMAMLANDI','+$'+reward,true); playTone(880,0.15,0.2,'square',1320); playTone(1320,0.3,0.15,'square'); }
  else { flashMessage('GÖREV BAŞARISIZ',why||'',false); playTone(200,0.6,0.2,'sawtooth',80); }
}
function onMissionPedKilled(p,src){ const m=S.mission; if(!m||m.ped!==p) return; if(src==='player') endMission(true,450); else endMission(false,0,'Hedef başkası tarafından öldürüldü'); }
function updateMissions(dt){
  const pp=Player.car?Player.car.pos:Player.pos; S.jobCooldown=Math.max(0,(S.jobCooldown||0)-dt);
  if(S.flashT!==undefined && S.flashT>0){ S.flashT-=dt; if(S.flashT<=0 && !S.dead && !S.busted){ document.getElementById('overlay2').hidden=true; document.getElementById('overlay2').classList.remove('ok'); } }
  for(const mk of MARKERS){ mk.mesh.rotation.y+=dt*0.8; mk.mesh.material.opacity=0.25+0.12*Math.sin(S.time*3); }
  S.objMarker.mesh.rotation.y-=dt; S.shopOpen=false;
  for(const mk of MARKERS){
    const inside=dist2D(pp,mk)<mk.r;
    if(mk.kind==='job' && inside && !Player.car && !S.mission && S.jobCooldown<=0 && !S.dead){ startMission(); }
    if(mk.kind==='shop' && inside && !Player.car) S.shopOpen=true;
    if(mk.kind==='spray' && inside && Player.car && Math.abs(Player.car.speed)<2){
      const c=Player.car;
      if(S.mission && S.mission.kind==='car' && S.mission.car===c){ endMission(true,600); Player.car.mission=false; }
      else if((S.wanted>0 || c.health<100) && S.sprayT===undefined){ if(S.money>=100){ S.money-=100; c.health=100; clearWanted(); flashMessage('PAY\'N\'SPRAY','Araç boyandı, polis izini kaybetti. -$100',true); playTone(500,0.3,0.15,'triangle',900); } else toast('Boyama için $100 gerekli'); S.sprayT=3; }
    }
  }
  if(S.sprayT!==undefined){ S.sprayT-=dt; if(S.sprayT<=0) S.sprayT=undefined; }
  document.getElementById('shop').hidden=!S.shopOpen;
  const m=S.mission; if(!m) return;
  m.timer-=dt; if(m.timer<=0){ endMission(false,0,'Süre doldu'); return; }
  if(m.kind==='car'){ if(m.car.dead) endMission(false,0,'Araba yok oldu'); else if(Player.car===m.car){ m.obj='Arabayı Pay\'n\'Spray garajına götür.'; setObjective(S.places.spray.x,S.places.spray.z); } else setObjective(m.car.pos.x,m.car.pos.z); }
  else if(m.kind==='hit'){ const p=m.ped; if(!p.alive) return; setObjective(p.pos.x,p.pos.z); if(dist2D(p.pos,Player.pos)<28 && p.state!=='flee'){ startFlee(p,Player.pos,4); } }
  else if(m.kind==='race'){ const t=m.points[m.step]; if(dist2D(pp,t)<3.5){ m.step++; playTone(900,0.1,0.15,'square',1200); if(m.step>=m.points.length){ endMission(true,700); return; } m.obj='Kontrol noktası '+(m.step+1)+'/5'; setObjective(m.points[m.step].x,m.points[m.step].z); } }
  else if(m.kind==='courier'){ if(m.step===0 && dist2D(pp,m.pick)<2.5){ m.step=1; m.obj='Paketi teslim noktasına götür.'; setObjective(m.drop.x,m.drop.z); playTone(900,0.1,0.15,'square',1200); } else if(m.step===1 && dist2D(pp,m.drop)<2.5) endMission(true,350); }
}
function clearWanted(){ S.heat=0; S.wanted=0; S.lastCrime=-100; for(const c of S.cops) c.state='leave'; for(const c of S.cars) if(c.chase){ c.chase=false; c.ai=true; setTrafficFromPose(c); } }

// ---- Silah dükkânı ----
var SHOP=[ {n:'Bıçak',p:100,f:()=>giveWeapon('knife')}, {n:'Beyzbol Sopası',p:150,f:()=>giveWeapon('bat')}, {n:'Desert Eagle',p:900,f:()=>giveWeapon('deagle')}, {n:'MP5',p:1200,f:()=>giveWeapon('mp5')}, {n:'Pompalı',p:800,f:()=>giveWeapon('pump')}, {n:'AK-47',p:2000,f:()=>giveWeapon('ak47')}, {n:'Keskin Nişancı',p:4000,f:()=>giveWeapon('sniper')},
  {n:'Mermi (seçili silah)',p:100,f:()=>{ const w=WEAPONS[Player.wid]; if(w.melee){ toast('Yakın dövüş silahına mermi olmaz'); return false; } w.cur+=w.pack; }}, {n:'Zırh (tam)',p:150,f:()=>Player.armor=100}, {n:'Sağlık (tam)',p:80,f:()=>Player.health=Player.maxHealth} ];
function shopBuy(i){ const it=SHOP[i]; if(!it) return; if(S.money<price(it.p)){ toast('Paran yetmiyor'); playTone(200,0.1,0.15,'square'); return; } if(it.f()===false) return; S.money-=price(it.p); playTone(880,0.1,0.15,'square',1320); }
function initShopUI(){ const el=document.getElementById('shop'); el.innerHTML='<h3>SİLAH DÜKKÂNI</h3>'+SHOP.map((it,i)=>'<div><b>'+((i+1)%10)+'</b> '+it.n+' <span>$'+price(it.p)+'</span></div>').join('')+'<p>Satın almak için numara tuşuna bas (sahip olduğun silaha mermi ekler)</p>'; }

// ---- Hileler: oyun içinde kodu yaz (kategorilere göre) ----
function giveSet(ids){ for(const id of ids) giveWeapon(id, WEAPONS[id].ammo); }
function giveCat(cat){ for(const id in WEAPONS) if(WEAPONS[id].cat===cat) giveWeapon(id, WEAPONS[id].ammo); }
function spawnCrewMen(n){ let k=0; const MAX=typeof CREW_MAX!=='undefined'?CREW_MAX:75; for(let i=0;i<n&&S.crew.length<MAX;i++){ const nd=randomNodeNear(Player.pos.x,Player.pos.z,3,10); const p=spawnPed(nd,{gang:true}); p.state='crew'; p.armed=(S.crewCfg&&S.crewCfg.weapon!=='mixed')?S.crewCfg.weapon:pick(['mp5','ak47','uzi','m4']); setHumanWeapon(p.mesh,p.armed); p.health=100; if(typeof crewJoinLook==='function') crewJoinLook(p); else p.mesh.userData.torso.material=matLambert(0x2d7a4f); S.crew.push(p); k++; } return k; }
// Lag temizliği: kan lekeleri, parçacıklar, izler, cesetler, hurdalar, uzak yaya/araç, mermiler, alınmış eşyalar
function lagClear(){
  let k=0; const pp=Player.car?Player.car.pos:Player.pos;
  for(const e of S.effects){ S.scene.remove(e.obj); k++; } S.effects.length=0;
  for(let i=S.peds.length-1;i>=0;i--){ const p=S.peds[i]; if(p.state==='crew'||p.boss||p.vip||p.guardOf||p.mission||p.riding||p.ai||p.state==='mechanic'||p.state==='driving') continue; if(!p.alive || dist2D(p.pos,pp)>110){ S.scene.remove(p.mesh); S.peds.splice(i,1); k++; } }
  for(let i=S.cops.length-1;i>=0;i--){ const q=S.cops[i]; if(!q.alive || (!q.loyal && q.state!=='hunt' && dist2D(q.pos,pp)>110)){ S.scene.remove(q.mesh); S.cops.splice(i,1); k++; } }
  for(let i=S.cars.length-1;i>=0;i--){ const car=S.cars[i]; if(car===Player.car||car.owned||car.ally||car.mission||car.mechanic||car.driverNpc||car.crewCar||car.hitSquad) continue; if(car.dead || (!car.chase && dist2D(car.pos,pp)>130)){ removeCarAt(i); k++; } }
  for(const p of S.projectiles) S.scene.remove(p.mesh); k+=S.projectiles.length; S.projectiles.length=0; S.fires.length=0;
  for(let i=S.pickups.length-1;i>=0;i--){ const it=S.pickups[i]; if(it.taken || (it.temp && dist2D(it,pp)>60)){ S.scene.remove(it.mesh); S.pickups.splice(i,1); k++; } }
  if(S.enemyTanks){ for(const t of S.enemyTanks) if(!t.alive){ S.scene.remove(t.mesh); k++; } S.enemyTanks=S.enemyTanks.filter(t=>t.alive); }
  if(S.renderer && S.renderer.renderLists) S.renderer.renderLists.dispose();
  return k;
}
// Düşük grafik: piksel oranı 1, shader efektleri kapalı, daha az yaya/araç, gölge haritası küçük
function lowGfx(on){
  S.lowGfx=on; const r=S.renderer; if(!r) return; r.setPixelRatio(on?1:Math.min(window.devicePixelRatio,1.5)); r.setSize(innerWidth,innerHeight); if(typeof resizeFX==='function') resizeFX(r);
  if(on){ S.fxPref=S.fx; S.fx=false; S.pedCap=45; S.carCap=10; } else { S.fx=S.fxPref!==undefined?S.fxPref:true; S.pedCap=90; S.carCap=16; }
  S.scene.traverse(o=>{ if(o.isDirectionalLight && o.shadow){ o.shadow.mapSize.set(on?1024:2048,on?1024:2048); if(o.shadow.map){ o.shadow.map.dispose(); o.shadow.map=null; } } });
}
var CHEATS={
  // Para
  HESOYAM:()=>{ Player.health=Player.maxHealth; Player.armor=100; S.money+=2500; return 'Tam can, tam zırh ve +$2.500'; },
  MONEYRAIN:()=>{ S.money+=50000; return '+$50.000'; },
  RICHKING:()=>{ S.money+=1000000; return '+$1.000.000'; },
  // Can ve hareket
  BAGUVIX:()=>{ S.godMode=!S.godMode; return S.godMode?'Ölümsüzlük açık':'Ölümsüzlük kapalı'; },
  KANGAROO:()=>{ S.superJump=!S.superJump; return S.superJump?'Süper zıplama':'Normal zıplama'; },
  SLOWITDOWN:()=>{ S.slowCheat=!S.slowCheat; S.slow=S.slowCheat?0.4:1; return S.slowCheat?'Ağır çekim':'Normal hız'; },
  FULLCLIP:()=>{ S.infAmmo=!S.infAmmo; return S.infAmmo?'Sonsuz mermi':'Mermi sayılıyor'; },
  // Silah paketleri
  LXGIWYL:()=>{ giveSet(['knife','glock','pump','uzi','ak47','grenade']); return 'Set 1: bıçak, Glock, pompalı, Uzi, AK-47, el bombası'; },
  KJKSZPJ:()=>{ giveSet(['bat','deagle','sawed','tec9','m4','molotov']); return 'Set 2: sopa, Desert Eagle, çift namlulu, TEC-9, AR-15, molotof'; },
  UZUMYMW:()=>{ giveSet(['machete','revolver','spas','mp5','scar','sniper','rpg']); return 'Set 3: pala, revolver, SPAS-12, MP5, SCAR-H, keskin nişancı, RPG'; },
  ROCKETMAN:()=>{ giveWeapon('rpg',12); giveWeapon('m79',12); giveWeapon('grenade',15); giveWeapon('pipebomb',8); return 'RPG-7, M79, el ve boru bombaları'; },
  FLAMEON:()=>{ giveWeapon('flamethrower',600); giveWeapon('minigun',1000); giveWeapon('chainsaw'); return 'Alev makinesi, minigun ve motorlu testere'; },
  MELEEKING:()=>{ giveCat('melee'); return 'Tüm yakın dövüş silahları'; },
  PISTOLKING:()=>{ giveCat('pistol'); return 'Tüm tabancalar'; },
  SMGKING:()=>{ giveCat('smg'); return 'Tüm hafif makineliler'; },
  SHOTGUNKING:()=>{ giveCat('shotgun'); return 'Tüm pompalılar'; },
  RIFLEKING:()=>{ giveCat('rifle'); return 'Tüm tüfekler'; },
  SNIPERKING:()=>{ giveCat('sniper'); return 'Tüm keskin nişancı tüfekleri'; },
  HEAVYKING:()=>{ giveCat('heavy'); return 'Tüm ağır silahlar'; },
  THROWKING:()=>{ giveCat('thrown'); return 'Tüm fırlatılanlar'; },
  ARSENAL:()=>{ for(const c of WCATS) giveCat(c); S.infAmmo=true; return '62 silahın hepsi ve sonsuz mermi'; },
  // Polis ve aranma
  ASNAEB:()=>{ clearWanted(); return 'Aranma seviyesi sıfırlandı'; },
  OSRBLHH:()=>{ S.heat=Math.min(5.95,S.heat+2); S.lastCrime=S.time; updateWanted(); return 'Aranma +2 yıldız'; },
  FIVESTARS:()=>{ S.heat=5.95; S.lastCrime=S.time; updateWanted(); return '5 yıldız: SWAT ve helikopter yolda'; },
  AEZAKMI:()=>{ S.noWanted=!S.noWanted; if(S.noWanted) clearWanted(); return S.noWanted?'Polis seni asla aramaz':'Polis tekrar arıyor'; },
  CORRUPT:()=>{ S.bribePolice=100; S.bribeSwat=100; return 'Polis ve SWAT tamamen senin'; },
  LEAVEMEALONE:()=>{ clearWanted(); S.hate=0; return 'Polis ve halk seni unuttu'; },
  // Halk ve nefret
  NOHATE:()=>{ S.hate=0; return 'Nefret sıfırlandı'; },
  FULLHATE:()=>{ S.hate=5.9; return 'Herkes senden nefret ediyor'; },
  IOJUFZN:()=>{ for(const p of S.peds) if(p.alive && p.state!=='crew' && dist2D(p.pos,Player.pos)<80){ if(!p.armed){ p.armed=pick(['bat','knife','glock']); setHumanWeapon(p.mesh,p.armed); } startFight(p); } return 'İSYAN! Herkes saldırıyor'; },
  PEACEFUL:()=>{ S.noThugs=!S.noThugs; return S.noThugs?'Serseriler sokaklardan çekildi':'Serseriler geri döndü'; },
  // Çete ve ordu
  GANGSQUAD:()=>{ return 'Çeteye '+spawnCrewMen(3)+' adam katıldı'; },
  GANGARMY:()=>{ return 'Çeteye '+spawnCrewMen(10)+' adam katıldı'; },
  FULLGANG:()=>{ return 'Çete tam kadro: +'+spawnCrewMen(75); },
  KARTELPUAN:()=>{ S.cartelBonus=(S.cartelBonus||0)+1; return 'Kartel puanı +1 (hile)'; },
  ORDUGEL:()=>{ S.cartelBonus=Math.max(S.cartelBonus||0,4); S.heat=Math.max(S.heat,3.5); S.lastCrime=S.time; updateWanted(); return 'Kartel puanı 4+ ve 3 yıldız: ordu geliyor'; },
  TANKAVI:()=>{ if(typeof spawnEnemyTank==='function'){ spawnEnemyTank(); return 'Düşman tank yolda'; } return 'Yok'; },
  KORKULAN:()=>{ S.feared=!S.feared; return S.feared?'Korkulan: kimse sataşmaz':'Korkulan kapalı'; },
  ITTIFAK:()=>{ for(const g of S.npcGangs||[]) S.gangAlly[g.id]=true; return 'Tüm NPC çeteleriyle ittifak'; },
  AIWPRTON:()=>{ spawnAllyVehicle('tank'); return 'Tank geldi'; },
  PANZER:()=>{ spawnAllyVehicle('apc'); return 'Panzer geldi'; },
  OHDUDE:()=>{ spawnAllyVehicle('heli'); return 'Dost helikopter geldi'; },
  ARMYTIME:()=>{ spawnAllyVehicle('tank'); spawnAllyVehicle('apc'); spawnAllyVehicle('heli'); spawnAllyVehicle('policecar'); return 'Tank, panzer, helikopter ve polis arabası emrinde'; },
  // Araçlar
  SPEEDFREAK:()=>{ S.speedFreak=!S.speedFreak; return S.speedFreak?'Arabalar %50 daha hızlı':'Normal araba hızı'; },
  GARAGEKING:()=>{ for(const t of Object.keys(CAR_TYPES)) if(!S.garage.includes(t)) S.garage.push(t); buyCar('sports'); return 'Spor araba teslim edildi, garajda tüm modeller var'; },
  MUSCLECAR:()=>{ buyCar('muscle'); return 'Muscle car teslim edildi'; },
  LIMOTIME:()=>{ buyCar('limo'); return 'Limuzin teslim edildi'; },
  BUSDRIVER:()=>{ buyCar('bus'); return 'Otobüs teslim edildi'; },
  TRUCKER:()=>{ buyCar('truck'); return 'Kamyon teslim edildi'; },
  BIGBANG:()=>{ let n=0; for(const c of S.cars) if(!c.dead && c!==Player.car && dist2D(c.pos,Player.pos)<45){ explodeCar(c); n++; } return n+' araç havaya uçtu'; },
  // Zaman
  NIGHTPROWLER:()=>{ S.dayTime=0.0; return 'Gece oldu'; },
  PLEASANTLYWARM:()=>{ S.dayTime=0.5; return 'Öğle oldu'; },
  TIMEFLIES:()=>{ S.fastClock=!S.fastClock; return S.fastClock?'Zaman 20 kat hızlı':'Zaman normal'; },
  // Kayıt ve kiralık adamlar
  LAGCLEAR:()=>{ const k=lagClear(); return 'Temizlik: '+k+' nesne silindi (ceset, hurda, kan, parçacık, uzak yaya/araç)'; },
  DUSUKGRAFIK:()=>{ lowGfx(!S.lowGfx); return S.lowGfx?'Düşük grafik: efektler kapalı, daha az yaya/araç, düşük çözünürlük':'Normal grafik'; },
  EFEKT:()=>{ S.fx=!S.fx; return 'Gölgelendirici efektler: '+(S.fx?'açık':'kapalı'); },
  RIZAGEL:()=>{ if(typeof spawnAIFriend==='function'){ spawnAIFriend(); if(typeof toggleChat==='function') setTimeout(()=>toggleChat(true),300); return 'Rıza çeteye katıldı (Enter ile konuş)'; } return 'Sohbet yok'; },
  CETEZIRH:()=>{ for(const p of S.crew){ if(p.alive&&!p.armored){ p.armored=true; p.health=Math.max(p.health,180); } } if(S.crewCfg) S.crewCfg.armor=true; return 'Çeteye bedava zırh'; },
  NEWGAME:()=>{ resetSave(); return 'Kayıt silindi; sayfayı yenileyince sıfırdan başlar'; },
  TAMAMENSIFIRLA2026:()=>{ fullReset(); return 'Her şey sıfırlandı: ilk gün, 250 $, yumruk ve Glock'; },
  SAVENOW:()=>{ return saveGame()?'Oyun kaydedildi':'Kayıt yapılamadı'; },
  HITSQUAD:()=>{ let n=0; while(hireHitman(true)) n++; return n+' suikastçı çatılara yerleşti'; },
  CHAUFFEUR:()=>{ return hireDriver()?'Şoför geldi':'Önce bir araca bin'; },
  VIPTIME:()=>{ spawnVIP(VIP_TIERS[4]); return 'Vali korumalarıyla şehirde'; },
  BRAWLTIME:()=>{ S.brawlT=0; let n=0; for(const p of S.peds){ if(p.alive&&p.state==='walk'&&!p.vip&&!p.guardOf&&dist2D(p.pos,Player.pos)<60){ const o=S.peds.find(q=>q!==p&&q.alive&&q.state==='walk'&&!q.vip&&!q.guardOf&&dist2D(q.pos,p.pos)<10); if(o){ p.state=o.state='brawl'; p.brawlWith=o; o.brawlWith=p; p.brawlT=o.brawlT=12; p.brawlArm=p.armed||'fist'; o.brawlArm=o.armed||'fist'; n++; } } } return n+' kavga başladı'; }
};
function checkCheats(){ for(const k in CHEATS){ if(S.cheatBuf.endsWith(k)){ const msg=CHEATS[k](); S.cheatBuf=''; flashMessage('HİLE AKTİF',msg,true); playTone(1000,0.2,0.2,'square',1500); return true; } } return false; }
