// npcs.js — yayalar (çeşitli görünüm, çete üyeleri silahlı, kaçma/dövüş), polisler (yıldıza göre silah), düşen eşyalar
var SHIRTS=[0xe74c3c,0x3498db,0xf39c12,0x9b59b6,0x1abc9c,0xecf0f1,0x34495e,0xd35400,0x7f8c8d,0xf1c40f,0xffffff,0x2c2c2c];
var PANTS=[0x2c3e50,0x34495e,0x1f2a44,0x5d4037,0x3e3e3e,0x8d6e63,0x1a1a1a,0x7a7a6a];
var SKINS=[0xf1c9a5,0xe0b090,0xc68642,0x8d5524,0xffdbac,0xa06a3a];
var HAIRS=[0x1a1a1a,0x4a2f1a,0xb08a4f,0x777777,0x2a1a0e,0xd9b36a], JACKETS=[0x222222,0x5a3a2a,0x1f3a5a,0x7a1a1a,0x3a3a3a,0x6b5a3a], SHOES=[0x1a1a1a,0xffffff,0x5a3a1a];
var GANG_WEAPONS=['glock','uzi','tec9','bat','knife','sawed','glock','mac10','skorpion','makarov','machete','glock18'];
var THUG_WEAPONS=['fist','fist','knife','bat','knuckles','crowbar'];
var THUG_LINES=['Ne bakıyorsun lan?','Paranı ver, çabuk!','Hadi gel bakalım!','Buralar bizim sokak!','Yürü git buradan!'];
var GREET_LINES=['Selam.','Kolay gelsin.','Hayırlı işler.','Hava güzel bugün.','Geç kaldım yine...','Bu şehir hiç uyumuyor.','N\'aber abi?','Otobüs yine gelmedi.','Kahve içecek yer biliyor musun?'];
var FEAR_LINES=['Patron, hürmetler.','Bir emrin var mı patron?','Sizi rahatsız etmeyeyim...','Selam patron, Allah korusun.','Yolu açın, patron geçiyor!'];
var SCARED_LINES=['Silahı indir lütfen!','Aman, silah var!','Ne yapacaksın onunla?','Bana zarar verme!'];
var BRAWL_LINES=['Ne dedin sen?!','Gel lan buraya!','Bir daha söyle de göreyim!','Çarptın, özür bile dilemedin!','Kaç para borçlusun sen bana!'];
var BRAWL_END=['Bir daha görmeyeyim seni!','Dersini aldın mı?','Hadi git şimdi!'];
var COP_LINES=['Dur! Polis!','Silahını bırak!','Yere yat, hemen!','Kıpırdama!','Eller yukarı!','Destek istiyoruz, şüpheli silahlı!'];
var CHAT_LINES=[['Dün maçı izledin mi?','İzledim, rezaletti.'],['Kira yine zamlandı.','Her yer öyle, ne yapalım.'],['Bu akşam ne yapıyorsun?','Eve gidip uyuyacağım.'],['Şu köşedeki kafe açılmış.','Kahvesi fena değilmiş.'],['Dün gece silah sesleri duydum.','Bu mahalle iyice bozuldu.'],['Patron yine mesai dedi.','İstifa et gitsin.'],['Yeni telefon aldım.','Kaç para verdin?'],['Trafik berbattı bugün.','Otobüs bir saat gelmedi.'],['Polis helikopteri geçti az önce.','Yine birini kovalıyorlardır.'],['Hafta sonu plan var mı?','Belki sahile gideriz.']];
var TALK_REPLIES=['Selam, ne lazım?','Pardon, acelem var.','İyi günler.','Beni rahat bırak lütfen.','Silah dükkânı mı? Yeşil halkayı ara.','Pay\'n\'Spray pembe halkada, biliyorsun değil mi?','Bu şehirde kimseye güvenme.','Sen şu meşhur adam mısın?','Para mı istiyorsun? Yok bende.','Çete üyeleri mor giyer, uzak dur onlardan.','Hastane kuzeybatıda.','Polis karakoluna yaklaşma, arıyorlar seni.'];
var KIND_REPLIES={ business:['Toplantıya geç kalıyorum.','Kartımı vereyim, sonra görüşelim.','Borsa yine çöktü, sorma.','Avukatımla konuş.'], worker:['Şantiye şurada, yardım lazımsa gel.','Mesai bitsin de bir çay içelim.','Kask tak kardeşim, tehlikeli burası.'], tourist:['Excuse me, boğaz nerede?','Fotoğraf çeker misin?','Bu şehir çok... hareketli!','Haritada burası neresi?'], elderly:['Evladım, eskiden burası böyle değildi.','Gençken ben de haylazdım.','Yavaş yürü, dizlerim ağrıyor.','Allah ıslah etsin bu gençleri.'], jogger:['Nefes... nefes... sonra konuşuruz!','Günde on kilometre, kardeşim.','Yoldan çekil, tempom bozuluyor!'], student:['Sınavım var, acelem var.','Burs çıkmadı yine.','Kütüphane nerede biliyor musun?'], chef:['Mutfakta kebap bekliyor.','Bugünün çorbası mercimek.','Elimi yıkamadan konuşamam.'], hipster:['Bu mahalle artık çok ana akım.','Kahveyi filtre içerim ben.','Plağım var, ister misin?'], civil:null };
var GANG_REPLIES=['Ne bakıyorsun?','Bizim bölgede ne işin var?','Çek git buradan.','Patronla mı konuşmak istiyorsun?'];
var BODY_LINES=['Aman Tanrım, ölmüş!','Biri ambulans çağırsın!','Bakma, yürü yürü!','Polis nerede ya?','Allah rahmet eylesin...'];
var PAIN_LINES=['Ahh!','Bacağım!','Kolum! Ahh!','Vuruldum!','İmdat!','Of, acıyor!'];
var DEATH_LINES=['Aaargh!','Hayır...','Anne...','Beni... bırak...','Öldürdün beni...'];
var VIP_TIERS=[
  {t:1,name:'Esnaf',guards:0,money:300,heat:0.3,look:{suit:false,jacket:0x5a4a3a}},
  {t:2,name:'İş Adamı',guards:1,money:1500,heat:0.5,look:{suit:true,jacket:0x1a1a2a}},
  {t:3,name:'Çete Lideri',guards:3,money:4000,heat:0.7,gang:true,look:{jacket:0x4a0f6a,cap:0x4a0f6a}},
  {t:4,name:'Belediye Başkanı',guards:3,money:8000,heat:2,look:{suit:true,jacket:0x2a2a2a}},
  {t:5,name:'Vali',guards:4,swat:true,money:20000,heat:4,look:{suit:true,jacket:0x111111}}
];
function randomLook(gang){
  const L={ skin:pick(SKINS), shirt:gang?pick([0x7a1a1a,0x4a0f6a,0x1a4a7a]):pick(SHIRTS), pants:pick(PANTS), hair:pick(HAIRS), shoes:pick(SHOES), female:false,
    hairStyle: Math.random()<0.12?'bald':pick(['short','short','short','beanie']),
    jacket: Math.random()<0.4?pick(JACKETS):null, shortSleeve:Math.random()<0.4, cap: gang&&Math.random()<0.5?0x7a1a1a:(Math.random()<0.1?pick([0x222222,0xc0392b,0x2980b9]):null), beard:Math.random()<0.2, glasses:Math.random()<0.1 };
  if(gang) return L;
  const r=Math.random(); // yaya tipleri: iş adamı, işçi, turist, yaşlı, koşucu, öğrenci, aşçı, hipster, sivil
  if(r<0.12){ L.kind='business'; L.suit=true; L.jacket=pick([0x1a1a2a,0x2a2a2a,0x3a3a4a,0x2a2f3a]); L.pants=L.jacket; L.shirt=0xf4f4f4; L.tie=pick([0xb01030,0x203a7a,0x1a1a1a,0x7a1a5a]); L.briefcase=true; L.shortSleeve=false; L.hairStyle='short'; L.cap=null; L.shoes=0x1a1a1a; }
  else if(r<0.22){ L.kind='worker'; L.vest=true; L.hardhat=true; L.jacket=null; L.shirt=pick([0x3a4a6a,0x6a6a6a,0x5a3a2a]); L.pants=0x2f3a4a; L.shortSleeve=true; L.cap=null; L.hairStyle='short'; }
  else if(r<0.30){ L.kind='tourist'; L.pattern='floral'; L.shirt=pick([0xe74c3c,0x3498db,0x1abc9c,0xf39c12]); L.shortSleeve=true; L.jacket=null; L.camera=true; L.backpack=Math.random()<0.6; L.cap=pick([0xffffff,0xf1c40f]); L.pants=pick([0xd9c7a0,0x5a6a7a]); L.shorts=true; }
  else if(r<0.40){ L.kind='elderly'; L.hair=pick([0xcfcfcf,0xe8e8e8,0x9a9a9a]); L.beard=Math.random()<0.5; L.cane=true; L.jacket=pick([0x5a4a3a,0x4a4a4a,0x6b5a3a]); L.shortSleeve=false; L.cap=Math.random()<0.5?0x3a3a3a:null; L.glasses=Math.random()<0.5; L.hairStyle=Math.random()<0.4?'bald':'short'; }
  else if(r<0.48){ L.kind='jogger'; L.shorts=true; L.shirt=pick([0xffffff,0x2ecc71,0xff5a5a,0x111111]); L.pants=pick([0x111111,0x2c3e50]); L.headband=true; L.shortSleeve=true; L.jacket=null; L.cap=null; L.shoes=0xffffff; L.beard=false; }
  else if(r<0.58){ L.kind='student'; L.backpack=true; L.glasses=Math.random()<0.5; L.shirt=pick([0x34495e,0x9b59b6,0x3498db]); L.jacket=Math.random()<0.5?0x2f3a5a:null; L.pattern=Math.random()<0.4?'stripes':null; }
  else if(r<0.64){ L.kind='chef'; L.shirt=0xf6f6f6; L.jacket=0xf6f6f6; L.pants=0x222222; L.apron=true; L.cap=null; L.shortSleeve=false; L.hairStyle='short'; }
  else if(r<0.70){ L.kind='hipster'; L.beard=true; L.hairStyle='beanie'; L.capColor=pick([0x883333,0x335533,0x333355]); L.pattern='check'; L.shirt=pick([0xc0392b,0x27ae60,0x2980b9]); L.glasses=Math.random()<0.6; L.jacket=null; }
  else if(r<0.77){ L.kind='athlete'; L.shorts=true; L.shirt=pick([0xff5a5a,0x2ecc71,0x111111,0xffffff,0x3498db]); L.shortSleeve=true; L.jacket=null; L.headband=true; L.cap=null; L.shoes=0xffffff; L.beard=false; L.pants=pick([0x111111,0x2c3e50,0xc0392b]); }
  else if(r<0.81){ L.kind='nurse'; L.shirt=0xf4f4f4; L.pants=0xf4f4f4; L.jacket=null; L.cap=0xf4f4f4; L.shortSleeve=true; L.shoes=0xffffff; }
  else if(r<0.85){ L.kind='security'; L.shirt=0x111111; L.pants=0x111111; L.jacket=0x1a1a1a; L.cap=0x111111; L.shortSleeve=false; L.radio=true; L.hairStyle='short'; }
  else if(r<0.89){ L.kind='delivery'; L.shirt=0xf39c12; L.pants=0x3e3e3e; L.cap=0xf39c12; L.parcel=true; L.jacket=null; L.shortSleeve=true; }
  else { L.kind='civil'; if(Math.random()<0.3) L.pattern=pick(['stripes','check']); }
  return L;
}
function spawnPed(node,opts){
  opts=opts||{}; const gang=opts.gang!==undefined?opts.gang:Math.random()<0.12;
  const angry=!gang && S.hate>=3 && Math.random()<(S.hate>=5?0.4:0.2);
  const thug=!gang && !angry && opts.gang===undefined && !opts.noThug && !S.noThugs && Math.random()<0.15;
  const look=opts.look||randomLook(gang); if(thug){ look.jacket=0x1c1c1c; look.hairStyle='beanie'; look.capColor=0x222222; look.pants=0x1a1a1a; }
  const mesh=makeHuman(look); const armed=gang?pick(GANG_WEAPONS):(angry?(S.hate>=5&&Math.random()<0.3?'glock':pick(['knife','bat','bat','knife'])):(thug?pick(THUG_WEAPONS):null));
  const p={type:'ped',mesh,pos:new THREE.Vector3(node.x,0,node.z),node,target:pick(node.nb),state:'walk',speed:rand(1.3,2.2),health:gang?50:(thug?40:30),alive:true,fleeDir:new THREE.Vector3(1,0,0),fleeT:0,deadT:0,facing:0,gang,angry,thug,armed,shootT:rand(0.5,1.5),swingT:0,surrenderT:0,idleT:0};
  p.kind=look.kind||null; if(look.kind==='elderly'){ p.speed=rand(0.7,1.0); p.health=20; } else if(look.kind==='jogger'){ p.speed=rand(3.3,4.2); } else if(look.kind==='athlete'){ p.speed=rand(2.8,3.6); p.health=45; } else if(look.kind==='worker'||look.kind==='security'){ p.health=45; }
  if(gang && !opts.look && typeof gangNear==='function'){ const g=gangNear(node.x,node.z); if(g){ applyGangLook(p,g); } }
  if(armed && armed!=='fist') setHumanWeapon(mesh,armed);
  mesh.userData.entity={type:'ped',ref:p}; mesh.position.copy(p.pos); S.scene.add(mesh); S.peds.push(p); return p;
}
// Önemli kişiler (VIP): kademeli, korumalı, soyması/öldürmesi kazançlı ama tehlikeli
function spawnVIP(tier){
  const T=tier||pick(VIP_TIERS); const pp=Player.car?Player.car.pos:Player.pos; const n=randomNodeNear(pp.x,pp.z,70,140);
  const look=Object.assign(randomLook(false),T.look); look.female=false; look.hairStyle='short';
  const p={type:'ped',mesh:makeHuman(look),pos:new THREE.Vector3(n.x,0,n.z),node:n,target:pick(n.nb),state:'walk',speed:1.2,health:60,alive:true,fleeDir:new THREE.Vector3(1,0,0),fleeT:0,deadT:0,facing:0,gang:!!T.gang,armed:T.gang?'deagle':null,shootT:1,swingT:0,surrenderT:0,idleT:0,vip:T,alarmT:0,guards:[]};
  if(p.armed) setHumanWeapon(p.mesh,p.armed);
  p.mesh.add(box(0.5,0.08,0.5,new THREE.MeshBasicMaterial({color:0xffd23b}),0,2.1,0));
  p.mesh.userData.entity={type:'ped',ref:p}; p.mesh.position.copy(p.pos); S.scene.add(p.mesh); S.peds.push(p);
  for(let i=0;i<T.guards;i++){
    const gl=T.swat?{skin:pick(SKINS),shirt:0x15181c,pants:0x101216,hair:0x111111,helmet:true,jacket:0x1b1e24}:(T.gang?randomLook(true):{skin:pick(SKINS),shirt:0x111111,pants:0x111111,hair:0x111111,jacket:0x222222});
    const g={type:'ped',mesh:makeHuman(gl),pos:new THREE.Vector3(n.x+rand(-2,2),0,n.z+rand(-2,2)),node:n,target:n,state:'bodyguard',speed:2,health:T.swat?120:70,alive:true,fleeDir:new THREE.Vector3(1,0,0),fleeT:0,deadT:0,facing:0,gang:!!T.gang,armed:T.swat?'m4':(T.gang?pick(['uzi','tec9']):'mp5'),shootT:rand(0.5,1),swingT:0,surrenderT:0,idleT:0,guardOf:p};
    setHumanWeapon(g.mesh,g.armed); g.mesh.userData.entity={type:'ped',ref:g}; g.mesh.position.copy(g.pos); S.scene.add(g.mesh); S.peds.push(g); p.guards.push(g);
  }
  S.vip=p; toast('Önemli kişi şehirde: '+T.name+(T.guards?' ('+T.guards+' koruma)':'')); return p;
}
function vipAlarm(p){ if(!p.vip) return; p.alarmT=25; for(const g of p.guards) if(g.alive) startFight(g); if(p.vip.t>=4){ S.heat=Math.min(5.95,S.heat+1); S.lastCrime=S.time; updateWanted(); } }
function updateBrawls(dt){
  S.brawlT=(S.brawlT||0)-dt; if(S.brawlT>0) return; S.brawlT=8;
  if(Math.random()<0.5){ // sohbet çifti
    const cand=S.peds.filter(p=>p.alive&&p.state==='walk'&&!p.mission&&!p.vip&&!p.guardOf&&!p.angry&&!p.thug&&!p.gang);
    for(let t=0;t<10;t++){ const a=pick(cand); if(!a) break; const b=cand.find(q=>q!==a&&dist2D(q.pos,a.pos)<12); if(!b) continue;
      a.state=b.state='chat'; a.chatWith=b; b.chatWith=a; a.chatT=b.chatT=rand(12,28); a.chatLead=true; b.chatLead=false; a.gestT=0; b.gestT=0; a.chatLineT=0.5; break; }
  }
  if(Math.random()<0.4){
    const cand=S.peds.filter(p=>p.alive&&p.state==='walk'&&!p.mission&&!p.vip&&!p.guardOf&&!p.angry);
    for(let t=0;t<10;t++){ const a=pick(cand); if(!a) break; const b=cand.find(q=>q!==a&&dist2D(q.pos,a.pos)<8&&(q.gang!==a.gang||Math.random()<0.5)); if(!b) continue;
      a.state=b.state='brawl'; a.brawlWith=b; b.brawlWith=a; a.brawlT=b.brawlT=rand(6,12); a.brawlArm=a.armed||'fist'; b.brawlArm=b.armed||'fist'; pedSay(a,pick(BRAWL_LINES)); a.sayT=4; b.sayT=4; break; }
  }
  const pp=Player.car?Player.car.pos:Player.pos; S.vipT=(S.vipT||0)-8;
  if((!S.vip||!S.vip.alive||dist2D(S.vip.pos,pp)>260) && S.vipT<=0 && !S.dead){ S.vipT=rand(60,120); spawnVIP(); }
}
function updatePeds(dt){
  const pp=Player.car?Player.car.pos:Player.pos;
  S.pedSpawnT=(S.pedSpawnT||0)-dt;
  if(S.pedSpawnT<=0){ S.pedSpawnT=0.3; const alive=S.peds.filter(p=>p.alive).length; if(alive<(S.pedCap||90)) spawnPed(randomNodeNear(pp.x,pp.z,40,150)); }
  for(let i=S.peds.length-1;i>=0;i--){
    const p=S.peds[i], d=dist2D(p.pos,pp);
    if(!p.alive){ p.deadT+=dt; if(p.rag) updateRagdoll(p,dt); else animateFall(p.mesh,p.deadT,p.deathStyle); if(p.deadT>25||d>220){ S.scene.remove(p.mesh); S.peds.splice(i,1); } continue; }
    if(p.riding){ p.pos.copy(p.riding.pos); continue; }
    if(p.state==='mechanic'||p.state==='driving') continue;
    if(d>240 && !p.mission && p.state!=='crew' && !p.vip){ S.scene.remove(p.mesh); S.peds.splice(i,1); continue; }
    p.sayT=Math.max(0,(p.sayT||0)-dt); if(p.wantedT>0) p.wantedT-=dt;
    let spd=0, aim=false, swing, handsUp=false;
    if(p.state==='walk'){
      const t=p.target, dx=t.x-p.pos.x, dz=t.z-p.pos.z, L=Math.hypot(dx,dz);
      if(L<0.6){ const opts=t.nb.filter(n=>n!==p.node); p.node=t; p.target=opts.length?pick(opts):p.node; if(Math.random()<0.12){ p.state='idle'; p.idleT=rand(2,6); } }
      else { p.pos.x+=dx/L*p.speed*dt; p.pos.z+=dz/L*p.speed*dt; p.facing=lerpAngle(p.facing,Math.atan2(dx,dz),Math.min(1,dt*8)); spd=p.speed; }
      for(const c of S.cars){ if(Math.abs(c.speed)>6 && dist2D(c.pos,p.pos)<7){ const a=aheadOf(c,p.pos.x,p.pos.z); if(a.ahead>0&&a.side<3){ startFlee(p,c.pos,3); break; } } }
      if((p.kind==='athlete'||p.kind==='jogger') && Math.random()<dt*(p.kind==='athlete'?0.06:0.02)){ p.state='exercise'; p.exT=rand(8,14); p.exType=pick(p.kind==='athlete'?['squat','pushup','jack','box','stretch']:['stretch','jack']); p.exPhase=0; }
      else if(p.angry && d<15 && !S.dead && !S.feared && hasLOS(p.pos.clone().setY(1.5),pp.clone().setY(1.2))){ startFight(p); if(p.sayT<=0){ pedSay(p,pick(['Katil! Geber!','Bu şehri sen mahvettin!','Yeter artık, öldüreceğim seni!'])); p.sayT=6; } }
      else if(p.thug && !p.thugFled && d<16 && !Player.car && !S.dead && !S.feared && Math.random()<dt*0.7 && hasLOS(p.pos.clone().setY(1.5),pp.clone().setY(1.2))){ if(Math.random()<0.8 && S.money>50){ p.state='rob'; p.robT=3.5; pedSay(p,pick(['Paranı ver, çabuk!','Cüzdanı uzat yoksa fena olur!','Ne varsa çıkar!'])); } else { startFight(p); pedSay(p,pick(THUG_LINES)); } p.sayT=6; }
      else if(p.thug && !p.thugFled && d<90 && d>10 && Math.random()<dt*0.35){ const v=S.peds.find(q=>q!==p&&q.alive&&!q.gang&&!q.thug&&!q.vip&&!q.guardOf&&!q.riding&&!q.robbed&&(q.state==='walk'||q.state==='idle'||q.state==='chat')&&dist2D(q.pos,p.pos)<14); if(v){ p.state='robnpc'; p.victim=v; p.robT=3; p.stalkT=0; } }
      else if(!Player.car && d<7 && Player.aiming && !WEAPONS[Player.wid].melee && !p.gang && !p.thug && p.sayT<=0 && Math.random()<dt*1.5){ pedSay(p,pick(SCARED_LINES)); p.sayT=10; startFlee(p,pp,5); }
      else if(!Player.car && d<4 && !Player.aiming && !S.keys.ShiftLeft && !p.gang && !p.thug && p.sayT<=0 && Math.random()<dt*0.12){ pedSay(p,pick(S.feared?FEAR_LINES:GREET_LINES)); p.sayT=20; }
      else if(S.hate>=2 && !p.gang && d<10 && Math.random()<dt*0.6){ startFlee(p,pp,4); if(p.sayT<=0 && Math.random()<0.3){ pedSay(p,pick(['O katil geldi, kaçın!','Yaklaşma bana!','Allah belanı versin!'])); p.sayT=8; } }
      if(p.vip && d<12 && p.sayT<=0 && Math.random()<dt*0.3){ pedSay(p,p.vip.t>=4?pick(['Korumalar, bu adamı uzaklaştırın.','Basına açıklama yapmayacağım.','Ne istiyorsun benden?']):pick(['Bugün işler iyi.','Toplantıya geç kalıyorum.','Buralarda dikkatli ol.'])); p.sayT=12; }
      if(p.vip && p.alarmT>0){ p.alarmT-=dt; startFlee(p,pp,4); }
      p.reactT=(p.reactT||0)-dt; if(p.reactT<=0){ p.reactT=1.2; if(!p.gang && !p.thug && Math.random()<0.4){ const body=S.peds.find(q=>!q.alive && q.deadT<20 && dist2D(q.pos,p.pos)<5); if(body){ p.state='idle'; p.idleT=rand(2,3.5); p.facing=Math.atan2(body.pos.x-p.pos.x,body.pos.z-p.pos.z); if(p.sayT<=0 && d<20){ pedSay(p,pick(BODY_LINES)); p.sayT=15; } } } }
      collideWorld(p.pos,0.3);
    } else if(p.state==='chat'){
      const o=p.chatWith; p.chatT-=dt;
      if(!o||!o.alive||o.state!=='chat'||p.chatT<=0){ p.state='walk'; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); if(o&&o.alive&&o.state==='chat'){ o.state='walk'; o.node=nearestNode(o.pos.x,o.pos.z); o.target=pick(o.node.nb); } }
      else { p.facing=lerpAngle(p.facing,Math.atan2(o.pos.x-p.pos.x,o.pos.z-p.pos.z),Math.min(1,dt*5)); const dd=dist2D(p.pos,o.pos); if(dd>1.4){ const dir=new THREE.Vector3(o.pos.x-p.pos.x,0,o.pos.z-p.pos.z).normalize(); p.pos.addScaledVector(dir,1.5*dt); spd=1.5; collideWorld(p.pos,0.3); }
        p.chatLineT=(p.chatLineT||0)-dt; if(p.chatLineT<=0 && p.chatLead){ p.chatLineT=rand(4,7); if(d<10){ const pair=pick(CHAT_LINES); pedSay(p,pair[0]); setTimeout(()=>{ if(o.alive&&o.state==='chat'&&dist2D(o.pos,Player.pos)<12) pedSay(o,pair[1]); },1800); } }
        p.gestT=(p.gestT||0)+dt; }
    } else if(p.state==='bodyguard'){
      const v=p.guardOf; if(!v||!v.alive){ p.state='walk'; p.guardOf=null; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); }
      else { const idx=v.guards.indexOf(p), ang=idx/Math.max(1,v.guards.length)*Math.PI*2; const tx=v.pos.x+Math.cos(ang)*2.2, tz=v.pos.z+Math.sin(ang)*2.2; const dd=Math.hypot(tx-p.pos.x,tz-p.pos.z);
        if(dd>0.8){ const dir=new THREE.Vector3(tx-p.pos.x,0,tz-p.pos.z).normalize(); const sp=dd>6?5:2; p.pos.addScaledVector(dir,sp*dt); p.facing=Math.atan2(dir.x,dir.z); spd=sp; } else p.facing=Math.atan2(pp.x-p.pos.x,pp.z-p.pos.z);
        if(d<6 && Player.aiming && !WEAPONS[Player.wid].melee && p.sayT<=0){ pedSay(p,'Koruma: Silahı indir yoksa ateş ederim!'); p.sayT=8; }
        collideWorld(p.pos,0.3); }
    } else if(p.state==='brawl'){
      const o=p.brawlWith; p.brawlT-=dt;
      if(!o||!o.alive||o.state!=='brawl'||p.brawlT<=0){ p.state='walk'; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); if(o&&o.alive&&p.sayT<=0){ pedSay(p,pick(BRAWL_END)); p.sayT=6; } if(o&&o.alive&&o.state==='brawl'){ o.state='walk'; o.node=nearestNode(o.pos.x,o.pos.z); o.target=pick(o.node.nb); startFlee(o,p.pos,5); } }
      else { const dd=dist2D(p.pos,o.pos); p.facing=Math.atan2(o.pos.x-p.pos.x,o.pos.z-p.pos.z);
        if(dd>1.4){ const dir=new THREE.Vector3(o.pos.x-p.pos.x,0,o.pos.z-p.pos.z).normalize(); p.pos.addScaledVector(dir,2.5*dt); spd=2.5; }
        else { p.shootT-=dt; if(p.shootT<=0){ p.shootT=rand(0.6,1.1); p.swingT=0.5; p.mesh.userData.punchLeft=!p.mesh.userData.punchLeft; const w=WEAPONS[p.brawlArm]||WEAPONS.fist; o.health-=w.melee?w.dmg*0.35:5; playNoise(0.06,0.3,500); if(o.health<=0){ killPed(o,'brawl'); } else if(Math.random()<0.3) addBloodHit(o.pos.clone().setY(1.2)); } }
        if(p.swingT>0){ p.swingT-=dt; swing=1-clamp(p.swingT/0.5,0,1); }
        collideWorld(p.pos,0.3); }
    } else if(p.state==='invite'){
      aim=true; p.facing=Math.atan2(pp.x-p.pos.x,pp.z-p.pos.z);
    } else if(p.state==='helper'){
      p.helpT=(p.helpT||0)-dt; const r=allyStep(p,dt,3,6,6,0.55); spd=r.spd||0; aim=!!r.aim; if(p.helpT<=0 && !nearestHostile(p.pos,30)){ p.state='walk'; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); }
    } else if(p.state==='bossattack'){
      const b=p.target; if(!b||!b.alive){ p.state='walk'; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); }
      else { const w=WEAPONS[p.armed]||WEAPONS.glock; const db=dist2D(p.pos,b.pos); const los=db<40 && hasLOS(p.pos.clone().setY(1.5),b.pos.clone().setY(1.2));
        if(!los||db>16){ const dir=new THREE.Vector3(b.pos.x-p.pos.x,0,b.pos.z-p.pos.z).normalize(); p.pos.addScaledVector(dir,4.5*dt); p.facing=Math.atan2(dir.x,dir.z); spd=4.5; if(collideWorld(p.pos,0.3)){ p.pos.x+=-dir.z*4*dt; p.pos.z+=dir.x*4*dt; } }
        else { aim=true; p.facing=Math.atan2(b.pos.x-p.pos.x,b.pos.z-p.pos.z); p.shootT-=dt; if(p.shootT<=0){ p.shootT=w.auto?0.5:1.0; shootEntity(p,w,{type:'ped',ref:b,pos:b.pos},0.45); } }
        if(d<8 && Math.random()<dt*0.5) startFight(p); collideWorld(p.pos,0.3); }
    } else if(p.state==='rob'){
      p.robT-=dt; p.facing=Math.atan2(pp.x-p.pos.x,pp.z-p.pos.z);
      if(d>2.0){ const dir=new THREE.Vector3(pp.x-p.pos.x,0,pp.z-p.pos.z).normalize(); p.pos.addScaledVector(dir,4*dt); spd=4; collideWorld(p.pos,0.3); } else aim=!!(p.armed&&p.armed!=='fist');
      if(Player.car||d>14){ p.state='walk'; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); }
      else if(p.robT<=0){ if(d<3.5 && !Player.aiming){ const amt=Math.max(20,Math.round(S.money*rand(0.08,0.15)*(S.diff>1?1.5:1))); S.money=Math.max(0,S.money-amt); p.loot=(p.loot||0)+amt; pedSay(p,pick(['Teşekkürler enayi!','Bir daha bu sokağa girme!','Kolay para!'])); toast('-$'+amt+' gasp edildin! Öldürürsen geri alırsın'); p.state='walk'; p.thugFled=true; startFlee(p,pp,10); p.fleeT=12; npcCrime(p,'rob'); } else { startFight(p); } }
    } else if(p.state==='robnpc'){ // gaspçı: kurbanı takip eder, yaklaşınca teslim alır, 3 sn sonra parayı alıp kaçar
      const v=p.victim; const dv=v?dist2D(p.pos,v.pos):99; p.stalkT=(p.stalkT||0)+dt;
      const ok=v&&v.alive&&!v.riding&&p.stalkT<16&&(v.state==='surrender'||v.state==='walk'||v.state==='idle'||v.state==='chat');
      if(!ok){ p.state='walk'; p.victim=null; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); }
      else { p.facing=Math.atan2(v.pos.x-p.pos.x,v.pos.z-p.pos.z);
        if(v.state!=='surrender'){ if(dv>3.2){ const dir=new THREE.Vector3(v.pos.x-p.pos.x,0,v.pos.z-p.pos.z).normalize(); p.pos.addScaledVector(dir,3.8*dt); spd=3.8; collideWorld(p.pos,0.3); } else { v.state='surrender'; v.surrenderT=9; v.surrenderTo=p; if(d<28) pedSay(p,pick(['Cüzdanı ver!','Para, çabuk!','Ses çıkarma, cüzdanı uzat!'])); p.sayT=6; } }
        else if(dv>1.6){ const dir=new THREE.Vector3(v.pos.x-p.pos.x,0,v.pos.z-p.pos.z).normalize(); p.pos.addScaledVector(dir,3.5*dt); spd=3.5; collideWorld(p.pos,0.3); }
        else { aim=!!(p.armed&&p.armed!=='fist'); p.robT-=dt;
          if(p.robT<=0){ p.loot=(p.loot||0)+randi(20,120); v.robbed=true; if(d<28) pedSay(v,pick(['Al, al, hepsi bu!','Lütfen vurma!','Tamam, işte cüzdan!'])); v.state='walk'; v.surrenderTo=null; startFlee(v,p.pos,6); p.state='walk'; p.thugFled=true; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); startFlee(p,v.pos,8); p.fleeT=10; npcCrime(p,'rob'); if(d<30 && Math.random()<0.6) setTimeout(()=>{ if(v.alive) pedSay(v,pick(['İmdat! Soyuldum!','Polis! Hırsız var!','Biri yardım etsin!'])); },1500); } } }
    } else if(p.state==='defend'){
      const t=p.defendTarget; p.defendT-=dt;
      if(!t||!t.alive||t.state!=='fight'||p.defendT<=0||S.wanted>0){ p.state='walk'; p.defendTarget=null; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); if(t&&!t.alive&&p.sayT<=0&&d<25){ pedSay(p,pick(['Hallettik.','İyi misin kardeşim?','Bu mahallede böyle şeyler olmaz.'])); p.sayT=8; } }
      else { const dtg=dist2D(p.pos,t.pos); p.facing=Math.atan2(t.pos.x-p.pos.x,t.pos.z-p.pos.z); const w=WEAPONS[p.armed||'fist']||WEAPONS.fist;
        if(dtg>1.6){ const dir=new THREE.Vector3(t.pos.x-p.pos.x,0,t.pos.z-p.pos.z).normalize(); p.pos.addScaledVector(dir,4.5*dt); spd=4.5; collideWorld(p.pos,0.3); }
        else { p.shootT-=dt; if(p.shootT<=0){ p.shootT=w.rate+0.5; p.swingT=w.rate; p.mesh.userData.punchLeft=!p.mesh.userData.punchLeft; damagePed(t,w.melee&&p.armed&&p.armed!=='fist'?w.dmg*0.5:8,'ped'); playNoise(0.06,0.3,500); if(Math.random()<0.4) addBloodHit(t.pos.clone().setY(1.2)); } }
        if(p.swingT>0){ p.swingT-=dt; swing=1-clamp(p.swingT/(w.rate||0.5),0,1); } }
    } else if(p.state==='exercise'){
      p.exT-=dt; p.exPhase+=dt; const u=p.mesh.userData;
      if(p.exT<=0 || (d<2.5 && Player.aiming)){ p.state='walk'; p.mesh.rotation.x=0; u.legL.rotation.z=0; u.legR.rotation.z=0; u.armL.rotation.z=0; u.armR.rotation.z=0; u.torso.position.y=1.26; u.head.position.y=1.75; u.head.rotation.x=0; }
      else if(p.exType==='box'){ const s=(Math.sin(p.exPhase*8)+1)/2; swing=s; if(s<0.05 && !p.exFlip){ p.exFlip=true; u.punchLeft=!u.punchLeft; } if(s>0.5) p.exFlip=false; }
    } else if(p.state==='idle'){
      p.idleT-=dt; if(p.idleT<=0) p.state='walk';
      p.mesh.userData.armR.rotation.x=-2.2; p.mesh.userData.foreR.rotation.x=-1.3;
    } else if(p.state==='surrender'){
      handsUp=true; p.surrenderT-=dt; const fp=(p.surrenderTo&&p.surrenderTo.alive&&p.surrenderTo.state==='robnpc')?p.surrenderTo.pos:pp; p.facing=Math.atan2(fp.x-p.pos.x,fp.z-p.pos.z);
      if(p.surrenderT<=0){ p.state='walk'; p.surrenderTo=null; startFlee(p,fp,5); }
    } else if(p.state==='crew'){
      const r=updateCrewMember(p,dt); spd=r.spd||0; aim=!!r.aim;
    } else if(p.state==='fight'){
      const w=WEAPONS[p.armed];
      if(S.dead||S.busted||d>(p.hunter?220:75)||!w){ p.state=p.guardOf?'bodyguard':'walk'; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); }
      else {
        p.facing=Math.atan2(pp.x-p.pos.x,pp.z-p.pos.z); const dir=new THREE.Vector3(pp.x-p.pos.x,0,pp.z-p.pos.z).normalize();
        if(!p.helpersCalled && d<30 && S.wanted===0 && S.hate<2 && !p.cartel && !p.hunter){ p.helpersCalled=true; let hn=0; for(const q of S.peds){ if(hn>=2) break; if(q!==p && q.alive && !q.gang && !q.thug && !q.vip && !q.guardOf && !q.riding && !q.angry && q.kind!=='elderly' && (q.state==='walk'||q.state==='idle'||q.state==='chat') && dist2D(q.pos,p.pos)<16 && Math.random()<0.4){ q.state='defend'; q.defendTarget=p; q.defendT=14; if((!q.armed||q.armed==='fist') && Math.random()<0.3){ q.armed=pick(['knife','bat']); setHumanWeapon(q.mesh,q.armed); } hn++; if(d<25 && q.sayT<=0){ pedSay(q,pick(['Bırak onu!','Hey! Rahat bırak adamı!','Ona dokunma!','Buraya gel bakalım kabadayı!'])); q.sayT=8; } } } } // yıldız yokken bazı yayalar bizi savunur
        if(w.melee){
          if(d>1.7){ p.pos.addScaledVector(dir,5*dt); spd=5; } else { p.shootT-=dt; if(p.shootT<=0){ p.shootT=w.rate+0.4; p.swingT=w.rate; p.mesh.userData.punchLeft=!p.mesh.userData.punchLeft; if(!Player.car) damagePlayer(w.dmg*0.5); playNoise(0.08,0.4,600); npcCrime(p,'assault'); } }
          if(p.swingT>0){ p.swingT-=dt; swing=1-clamp(p.swingT/w.rate,0,1); }
        } else {
          const los=d<60 && hasLOS(p.pos.clone().setY(1.5), pp.clone().setY(1.2));
          if(!los || d>18){ p.pos.addScaledVector(dir,4*dt); spd=4; } else { aim=true; p.facing+=aimOff(p.mesh); p.shootT-=dt; if(p.shootT<=0){ p.shootT=Math.max(0.45,w.rate*4); npcShoot(p,w,0.35); } }
        }
        collideWorld(p.pos,0.3);
      }
    } else {
      p.fleeT-=dt; p.pos.addScaledVector(p.fleeDir,6*dt); p.facing=Math.atan2(p.fleeDir.x,p.fleeDir.z); spd=6;
      if(collideWorld(p.pos,0.3)) p.fleeDir.set(-p.fleeDir.z,0,p.fleeDir.x);
      if(p.fleeT<=0){ p.state='walk'; p.node=nearestNode(p.pos.x,p.pos.z); p.target=pick(p.node.nb); }
    }
    if(!Player.car){ const dp=dist2D(p.pos,Player.pos); if(dp<0.7){ const k=(0.7-dp)/(dp||1); p.pos.x+=(p.pos.x-Player.pos.x)*k; p.pos.z+=(p.pos.z-Player.pos.z)*k; if(S.keys.ShiftLeft && p.sayT<=0 && p.state!=='crew'){ pedSay(p); p.sayT=6; } } }
    p.mesh.position.copy(p.pos); p.mesh.rotation.y=p.facing; if(p.state!=='idle') animateHuman(p.mesh,spd,dt,aim,swing,handsUp);
    if(p.state==='exercise' && p.exType!=='box') applyExercisePose(p.mesh,p.exType,p.exPhase);
    if(p.state==='chat' && p.gestT!==undefined){ const u=p.mesh.userData; const talking=p.chatLead?Math.sin(p.gestT*1.1)>0:Math.sin(p.gestT*1.1)<=0; if(talking){ u.armR.rotation.x=-0.7+Math.sin(p.gestT*4)*0.25; u.foreR.rotation.x=-0.9; u.armR.rotation.z=-0.3; } else { u.head.rotation.x=Math.sin(p.gestT*2)*0.06; } }
  }
}
// ---- Ragdoll düşme: hız, zıplama, dönme, uzuv sallanması; 1.3 sn sonra yerde kalır ----
function startRagdoll(e,src,from){
  const m=e.mesh, u=m.userData; const dir=new THREE.Vector3();
  if(from){ dir.set(e.pos.x-from.x,0,e.pos.z-from.z); } if(dir.lengthSq()<0.01) dir.set(Math.sin(e.facing+Math.PI),0,Math.cos(e.facing+Math.PI)); dir.normalize();
  const power=src==='blast'?rand(6,9):src==='car'?rand(4,7):rand(1.0,2.6);
  const rel=angDiff(e.facing,Math.atan2(dir.x,dir.z)); const forward=Math.abs(rel)<Math.PI/2; const side=Math.sin(rel);
  e.rag={vel:dir.clone().multiplyScalar(power),vy:src==='blast'?rand(5,8):src==='car'?rand(2,4):rand(0.5,1.5),y:0,t:0,targetX:(forward?1:-1)*Math.PI/2*(1-Math.abs(side)*0.5),targetZ:-side*Math.PI/2*0.9,rotX:0,rotZ:0,spin:src==='blast'?rand(-3,3):rand(-0.4,0.4),flail:[rand(-4,4),rand(-4,4),rand(-3,3),rand(-3,3)],ph:[rand(0,6),rand(0,6),rand(0,6),rand(0,6)]};
  m.rotation.order='YXZ';
}
function updateRagdoll(e,dt){
  const r=e.rag, m=e.mesh, u=m.userData; r.t+=dt;
  e.pos.addScaledVector(r.vel,dt); r.vel.multiplyScalar(Math.max(0,1-dt*(r.y>0.05?0.8:4))); collideWorld(e.pos,0.3);
  r.vy-=14*dt; r.y+=r.vy*dt; if(r.y<0){ r.y=0; if(r.vy<-2){ r.vy=-r.vy*0.3; playNoise(0.06,0.25,400); } else r.vy=0; }
  const k=Math.min(1,dt*(r.t<0.5?9:4)); r.rotX+=(r.targetX-r.rotX)*k; r.rotZ+=(r.targetZ-r.rotZ)*k; if(r.y>0.05) m.rotation.y+=r.spin*dt;
  const decay=Math.exp(-r.t*2.5);
  u.armL.rotation.x=Math.sin(r.t*11+r.ph[0])*r.flail[0]*0.5*decay-0.6; u.armR.rotation.x=Math.sin(r.t*11+r.ph[1])*r.flail[1]*0.5*decay-0.6; u.armL.rotation.z=0.3*decay; u.armR.rotation.z=-0.3*decay;
  u.foreL.rotation.x=-0.8*decay; u.foreR.rotation.x=-0.8*decay;
  u.legL.rotation.x=Math.sin(r.t*9+r.ph[2])*r.flail[2]*0.3*decay; u.legR.rotation.x=Math.sin(r.t*9+r.ph[3])*r.flail[3]*0.3*decay; u.shinL.rotation.x=0.6*decay; u.shinR.rotation.x=0.4*decay;
  u.torso.rotation.x=0; u.torso.rotation.z=0; u.head.rotation.x=Math.sin(r.t*7)*0.3*decay;
  m.rotation.x=r.rotX; m.rotation.z=r.rotZ; m.position.set(e.pos.x, r.y+0.3*Math.min(1,(Math.abs(r.rotX)+Math.abs(r.rotZ))/(Math.PI/2)), e.pos.z);
}
// ---- Konuşma (E): yakındaki yayayla kısa diyalog ----
function talkToPed(){
  if(Player.car) return false; const f=new THREE.Vector3(Math.sin(Player.facing),0,Math.cos(Player.facing)); let best=null,bd=2.8;
  for(const p of S.peds){ if(!p.alive||p.state==='fight'||p.state==='crew'||p.state==='mechanic'||p.state==='driving') continue; const d=new THREE.Vector3().subVectors(p.pos,Player.pos); const L=d.length(); if(L<bd && (L<0.9 || d.normalize().dot(f)>0.3)){ bd=L; best=p; } }
  if(!best) return false; const p=best;
  if(p.boss){ if(S.cartel===p.boss){ S.subtitle={text:'Sen: Patron, iş var mı?',t:1.5}; setTimeout(()=>{ if(p.alive) startBossMission(); },1600); return true; } else { pedSay(p,'Burada ne işin var? Korumalar!'); vipAlarm(p); return true; } }
  S.subtitle={text:'Sen: '+pick(['Selam!','Kolay gelsin.','Bir şey soracağım...','N\'aber?']),t:1.8};
  const reply=p.cartel?(S.cartel===p.cartel?pick(['Patron seni soruyordu.','Bölge sakin, patron.','Emrindeyiz.']):(S.rep[p.cartel]>=20?pick(['Seni duyduk. İyi iş çıkarıyorsun.','Patron seninle tanışmak ister.']):pick(['Yürü git.','Bizim bölgede dikkatli ol.','Kartelle uğraşma.']))):p.gang?pick(GANG_REPLIES):p.vip?(p.vip.t>=4?'Korumalarım var, uzak dur.':'Konuşacak vaktim yok.'):p.thug?pick(THUG_LINES):((p.kind&&KIND_REPLIES[p.kind])?pick(KIND_REPLIES[p.kind]):pick(TALK_REPLIES));
  setTimeout(()=>{ if(p.alive) pedSay(p,reply); },1900);
  if(p.state==='walk'||p.state==='chat'){ p.state='idle'; p.idleT=3.5; } p.facing=Math.atan2(Player.pos.x-p.pos.x,Player.pos.z-p.pos.z); p.sayT=0;
  return true;
}
function startFlee(p,from,t){
  if(p.state==='fight'||p.state==='crew'||p.state==='surrender'||p.state==='mechanic'||p.state==='bodyguard'||p.state==='brawl'||p.state==='invite'||p.state==='bossattack'||p.state==='rob'||p.state==='robnpc'||p.state==='defend'||p.boss) return;
  p.state='flee'; p.fleeT=t||rand(4,7);
  p.fleeDir.set(p.pos.x-from.x,0,p.pos.z-from.z); if(p.fleeDir.lengthSq()<0.01) p.fleeDir.set(rand(-1,1),0,rand(-1,1));
  p.fleeDir.normalize(); const a=rand(-0.5,0.5); const x=p.fleeDir.x*Math.cos(a)-p.fleeDir.z*Math.sin(a), z=p.fleeDir.x*Math.sin(a)+p.fleeDir.z*Math.cos(a); p.fleeDir.set(x,0,z);
}
function startFight(p){ if(!p.alive||!p.armed||p.state==='fight'||p.state==='crew'||p.boss) return; if(p.cartel && S.cartel===p.cartel && !p.bossattack) return; p.state='fight'; p.shootT=rand(0.3,0.8); if(p.sayT<=0){ pedSay(p,pick(['Geber!','Yanlış mahalleye geldin!','Bunu ödeyeceksin!','Vurun şunu!'])); p.sayT=5; } }
// Egzersiz pozları: squat, şınav, jumping jack, esneme
function applyExercisePose(m,type,t){ const u=m.userData; const s=(Math.sin(t*3)+1)/2;
  if(type==='squat'){ u.legL.rotation.x=-1.3*s; u.legR.rotation.x=-1.3*s; u.shinL.rotation.x=1.9*s; u.shinR.rotation.x=1.9*s; m.position.y=-0.42*s; u.armL.rotation.x=-1.4; u.armR.rotation.x=-1.4; u.foreL.rotation.x=0; u.foreR.rotation.x=0; u.torso.rotation.x=0.25*s; }
  else if(type==='pushup'){ m.rotation.x=1.42; m.position.y=0.22+0.28*s; u.legL.rotation.x=0; u.legR.rotation.x=0; u.shinL.rotation.x=0; u.shinR.rotation.x=0; u.armL.rotation.x=-1.5+0.9*(1-s); u.armR.rotation.x=-1.5+0.9*(1-s); u.foreL.rotation.x=-1.1*(1-s); u.foreR.rotation.x=-1.1*(1-s); u.torso.rotation.x=0; u.head.rotation.x=-0.6; }
  else if(type==='jack'){ const q=(Math.sin(t*7)+1)/2; u.armL.rotation.z=0.2+2.6*q; u.armR.rotation.z=-0.2-2.6*q; u.armL.rotation.x=0; u.armR.rotation.x=0; u.foreL.rotation.x=0; u.foreR.rotation.x=0; u.legL.rotation.z=0.45*q; u.legR.rotation.z=-0.45*q; u.legL.rotation.x=0; u.legR.rotation.x=0; u.shinL.rotation.x=0; u.shinR.rotation.x=0; m.position.y=0.12*Math.max(0,Math.sin(t*7)); }
  else if(type==='stretch'){ u.torso.rotation.x=0.9*s; u.head.rotation.x=0.3*s; u.armL.rotation.x=-0.3+0.3*s; u.armR.rotation.x=-0.3+0.3*s; u.foreL.rotation.x=0; u.foreR.rotation.x=0; u.legL.rotation.x=0; u.legR.rotation.x=0; u.shinL.rotation.x=0; u.shinR.rotation.x=0; u.torso.position.y=1.26-0.15*s; u.head.position.y=1.75-0.5*s; }
}
function panicPeds(pos,r){ for(const p of S.peds) if(p.alive && dist2D(p.pos,pos)<r) startFlee(p,pos); }
var PED_LINES=['Ne yapıyorsun lan!','Çekil önümden!','Polis! Polis!','Aman Allah\'ım!','Deli misin sen?','Kaçın!','Yardım edin!','Gözün kör mü?','Biri polisi arasın!','Vurmayın beni!'];
function pedSay(p,text){ if(!p||!p.alive) return; const gname=(p.gangId&&typeof gangById==='function'&&gangById(p.gangId))?gangById(p.gangId).name+': ':null; S.subtitle={text:(p.ai?'Rıza: ':p.state==='crew'?'Çeten: ':gname||(p.gang?'Çete üyesi: ':'Yaya: '))+(text||pick(PED_LINES)), t:2.6}; }
function gunshotNoise(pos){
  panicPeds(pos,28);
  let w=0; for(const p of S.peds) if(p.alive && dist2D(p.pos,pos)<18) w++;
  if(w>0) crime('shot'); if(copNear(45)) crime('shotNearCop');
  for(const p of S.peds) if(p.alive && p.armed && dist2D(p.pos,pos)<22 && Math.random()<0.3) startFight(p);
  if(Math.random()<0.3){ const near=S.peds.filter(p=>p.alive && !p.gang && dist2D(p.pos,pos)<16); if(near.length) pedSay(pick(near),pick(['Silah! Kaçın!','Polis! Polis!','Aman Allah\'ım!','Biri polisi arasın!'])); }
}
function damagePed(p,dmg,src,part){
  if(!p.alive) return; p.health-=dmg; p.lastSrc=src; if(src==='player' && p.state!=='crew' && typeof markEntity==='function') markEntity(p);
  if(p.health<=0){ killPed(p,src,undefined,src==='player'?Player.pos:undefined); return; }
  if(dmg>=4 && dist2D(p.pos,Player.pos)<70){ playGrunt(p.mesh.userData.female); if(p.sayT<=0 && Math.random()<0.5){ pedSay(p,part==='leg'?'Bacağım! Ahh!':part==='arm'?'Kolum! Ahh!':pick(PAIN_LINES)); p.sayT=5; } }
  if(p.riding) return; // araçtaki kişi: hasar alır, dışarı çıkmaz
  if(part==='leg' && !p.mesh.userData.limp){ p.mesh.userData.limp=true; p.speed*=0.5; p.wounded=true; }
  if(part==='arm' && !p.mesh.userData.armHang && Math.random()<0.6){ p.mesh.userData.armHang=true; if(p.armed && p.armed!=='fist' && Math.random()<0.6){ spawnPickup('weapon',p.pos.x+rand(-0.8,0.8),p.pos.z+rand(-0.8,0.8),true,p.armed); p.armed=null; setHumanWeapon(p.mesh,null); if(p.state==='fight'){ p.state='walk'; startFlee(p,Player.pos,8); } } }
  if(p.state==='crew') return;
  else if(p.vip && src==='player'){ vipAlarm(p); }
  else if(p.guardOf && src==='player'){ vipAlarm(p.guardOf); }
  else if(p.armed && src==='player' && p.state!=='bodyguard'){ startFight(p); for(const q of S.peds) if(q.alive && q.gang && q!==p && q.state!=='crew' && dist2D(q.pos,p.pos)<20 && Math.random()<0.7) startFight(q); }
  else if(src==='player'){ p.state='walk'; startFlee(p,Player.pos,rand(5,8)); }
}
function killPed(p,src,style,from){
  if(!p.alive) return; p.alive=false; p.deadT=0;
  if(p.riding){ const c=p.riding; p.riding=null; setSeated(p.mesh,false); p.mesh.visible=true; const h=c.heading; const side=(c.riders&&c.riders.indexOf(p)%2===0)?-1:1; const ww=(c.spec&&c.spec.w)||1.8; p.pos.set(c.pos.x+Math.cos(h)*side*ww*0.8,0,c.pos.z-Math.sin(h)*side*ww*0.8); p.mesh.position.copy(p.pos); p.mesh.rotation.set(0,h,0);
    if(c.riderNpc===p){ c.riderNpc=null; if(c.hitSquad){ c.hitSquad=null; c.chase=false; } c.ai=false; }
    if(c.driverNpc===p){ c.driverNpc=null; c.ai=false; }
    if(c.riders){ const k=c.riders.indexOf(p); if(k>=0) c.riders.splice(k,1); if(c.crewDriver===p) c.crewDriver=c.riders.find(r=>r.alive)||null; } }
  const inAct=(p.state==='robnpc'||p.state==='rob');
  if(p.state==='robnpc' && p.victim && p.victim.alive && src==='player'){ const v=p.victim; v.state='walk'; v.surrenderTo=null; v.node=nearestNode(v.pos.x,v.pos.z); v.target=pick(v.node.nb); setTimeout(()=>{ if(v.alive) pedSay(v,pick(['Teşekkür ederim! Hayatımı kurtardın.','Sağ ol kardeşim, çok korktum.','Allah razı olsun!'])); },900); S.hate=Math.max(0,S.hate-0.3); toast('Yayayı soyguncudan kurtardın'); }
  if(p.loot && src==='player'){ S.money+=p.loot; toast('Paranı geri aldın: +$'+p.loot); p.loot=0; } if(p.cartel && typeof onCartelPedKilled==='function') onCartelPedKilled(p,src); panicPeds(p.pos,22); if(typeof addBlood==='function') addBlood(p.pos,src==='blast'||src==='car'?2:1);
  const dp=dist2D(p.pos,Player.pos); if(dp<80){ playScream(p.mesh.userData.female); if(dp<25 && Math.random()<0.6) S.subtitle={text:(p.gang?'Çete üyesi: ':'Yaya: ')+pick(DEATH_LINES),t:1.6}; }
  if(!from){ if(src==='car'){ let bc=null,bd=6; for(const c of S.cars){ const d=dist2D(c.pos,p.pos); if(d<bd){bd=d;bc=c;} } from=bc?bc.pos:undefined; } else if(src==='player'||src==='hitman') from=Player.pos; }
  startRagdoll(p,src,from);
  if(p.vip){ vipAlarm(p); S.heat=Math.min(5.95,S.heat+p.vip.heat); S.lastCrime=S.time; updateWanted(); for(let i=0;i<Math.min(6,Math.ceil(p.vip.money/300));i++) spawnPickup('money',p.pos.x+rand(-1.5,1.5),p.pos.z+rand(-1.5,1.5),true); S.vipBounty=p.vip.money; toast(p.vip.name+' öldü: çevreye '+p.vip.money+'$ saçıldı'); if(S.vip===p) S.vip=null; }
  if(p.guardOf) vipAlarm(p.guardOf);
  if(src==='player'){ S.stats.kills++; if(!inAct) crime('murder'); if(!p.gang && !p.angry && !p.thug && p.state!=='crew' && !p.guardOf){ addHate(S.hate<1?1:0.5); if(S.hate>=2 && Math.random()<0.5){ const near=S.peds.filter(q=>q.alive&&!q.gang&&dist2D(q.pos,p.pos)<20); if(near.length) pedSay(pick(near),pick(['Katil! Katil!','Bu adam bir canavar!','Biri şunu durdursun!'])); } } }
  if(p.state==='crew'){ toast('Çete üyen öldü'); }
  const x=p.pos.x+rand(-0.8,0.8), z=p.pos.z+rand(-0.8,0.8);
  if(p.armed){ if(Math.random()<0.75) spawnPickup('weapon',x,z,true,p.armed); else spawnPickup('ammo',x,z,true); }
  else if(src==='player' && Math.random()<0.5) spawnPickup('money',x,z,true);
  if(p.mission && typeof onMissionPedKilled==='function') onMissionPedKilled(p,src);
}
// Ortak NPC atışı (polis ve çete): mesafeye göre isabet, oyuncuya veya aracına hasar
function npcShoot(e,w,acc){
  const pp=Player.car?Player.car.pos:Player.pos; const d=dist2D(e.pos,pp);
  const muzzle=new THREE.Vector3(); e.mesh.userData.muzzle.getWorldPosition(muzzle);
  const hit=Math.random()<clamp(acc-d/80,0.08,acc);
  const tgt=pp.clone().setY(1.1); if(!hit){ tgt.x+=rand(-2.5,2.5); tgt.y+=rand(-0.6,1.6); tgt.z+=rand(-2.5,2.5); }
  addTracer(muzzle,tgt); addFlash(muzzle); playWeaponSound(w,clamp(1-d/60,0.15,0.7)); addParticles(tgt,0xaaaaaa,1);
  if(hit){ if(Player.car){ if(Math.random()<0.4){ damagePlayer(w.dmg*0.35); addBloodHit(Player.car.pos.clone().setY(1.2)); } else damageCar(Player.car,w.dmg*0.1,'cop'); } else { damagePlayer(w.dmg*0.45); addBloodHit(Player.pos.clone().setY(1.2)); } }
  panicPeds(e.pos,12); if(e.type==='ped') npcCrime(e,'assault');
}
// ---- NPC suçları: devriye polisi bize saldıran ya da yaya soyan NPC'leri kovalar ----
function npcCrime(p,kind){
  if(!p||!p.alive||p.state==='crew'||p.cartel&&S.cartel===p.cartel) return; if((p.crimeT||0)>S.time) return; p.crimeT=S.time+4; p.wantedT=Math.max(p.wantedT||0,kind==='rob'?35:25);
  if(S.cops.filter(c=>c.alive&&c.state==='arrest').length>=4) return;
  let best=null,bd=55; for(const c of S.cops){ if(!c.alive||c.loyal||c.state==='hunt'||c.state==='arrest') continue; const d=dist2D(c.pos,p.pos); if(d<bd && hasLOS(c.pos.clone().setY(1.5),p.pos.clone().setY(1.2))){ bd=d; best=c; } }
  if(!best && S.wanted===0 && Math.random()<0.5 && !S.dead){ const nn=randomNodeNear(p.pos.x,p.pos.z,25,45); best=spawnCop(nn.x,nn.z,{patrol:true}); }
  if(best){ best.state='arrest'; best.target=p; if(dist2D(p.pos,Player.pos)<30) S.subtitle={text:'Polis: '+pick(['Dur! Polis! Kıpırdama!','Sen! Yere yat!','Şüpheli kaçıyor, destek!','Silahı bırak!']),t:2.4}; }
}

// ---- Polis ----
function copWeapon(){ return S.wanted>=5?pick(['m4','g36']):S.wanted>=3?pick(['mp5','ump45']):pick(['glock','beretta']); }
function spawnCop(x,z,opts){
  opts=opts||{}; const swat=opts.swat!==undefined?opts.swat:(S.wanted>=5 || S.cartelPts>2.5); const loyal=!opts.patrol && !opts.look && (!!opts.loyal || Math.random()*100<(swat?S.bribeSwat:S.bribePolice)); const wid=opts.armed||(swat?'m4':(loyal?'mp5':(opts.patrol?'glock':copWeapon())));
  const mesh=makeHuman(opts.look?opts.look:swat?{skin:pick(SKINS),shirt:0x15181c,pants:0x101216,hair:0x111111,helmet:true,jacket:0x1b1e24}:{skin:pick(SKINS),shirt:0x1f4a8a,pants:0x162f57,hair:0x111111,cap:0x0f2a52});
  setHumanWeapon(mesh,wid);
  if(loyal){ mesh.add(box(0.3,0.06,0.3,matLambert(0x3bff6b),0,2.02,0)); }
  const c={type:'cop',mesh,pos:new THREE.Vector3(x,0,z),health:swat?120:60,alive:true,shootT:rand(0.8,1.6),arrestT:0,facing:0,deadT:0,state:opts.patrol?'patrol':(loyal?'guard':'hunt'),armed:wid,swat,loyal,wp:null,node:null,target:null};
  mesh.userData.entity={type:'cop',ref:c}; mesh.position.copy(c.pos); S.scene.add(mesh); S.cops.push(c); return c;
}
function copNear(r){
  const pp=Player.car?Player.car.pos:Player.pos;
  for(const c of S.cops) if(c.alive && c.state==='hunt' && dist2D(c.pos,pp)<r) return true;
  for(const c of S.cars) if(c.police && !c.dead && c.chase && dist2D(c.pos,pp)<r) return true;
  return false;
}
function updateCops(dt){
  const pp=Player.car?Player.car.pos:Player.pos;
  const desired=S.wanted>0?Math.min(2+S.wanted*2,10):0;
  const hunting=S.cops.filter(c=>c.alive&&c.state==='hunt');
  S.copSpawnT=(S.copSpawnT||0)-dt;
  if(hunting.length<desired && S.copSpawnT<=0 && !S.dead && !S.busted){ S.copSpawnT=Math.max(1.2,5-S.wanted); const n=randomNodeNear(pp.x,pp.z,35,80); spawnCop(n.x,n.z); }
  if(S.wanted===0) for(const c of hunting) c.state='leave';
  else for(const c of S.cops) if(c.alive && !c.loyal && c.state!=='arrest') c.state='hunt';
  // devriye: yıldız yokken şehirde 2 polis dolaşır, suç gören yayaları kovalar
  S.patrolT=(S.patrolT||0)-dt; if(S.patrolT<=0){ S.patrolT=12; if(S.cops.filter(c=>c.alive&&(c.state==='patrol'||c.state==='arrest')).length<2 && !S.dead){ const nn=randomNodeNear(pp.x,pp.z,40,100); spawnCop(nn.x,nn.z,{patrol:true}); } }
  for(let i=S.cops.length-1;i>=0;i--){
    const c=S.cops[i], d=dist2D(c.pos,pp);
    if(!c.alive){ c.deadT+=dt; if(c.rag) updateRagdoll(c,dt); else animateFall(c.mesh,c.deadT,c.deathStyle); if(c.deadT>25||d>220){ S.scene.remove(c.mesh); S.cops.splice(i,1); } continue; }
    let spd=0, aim=false;
    if(c.loyal){ const r=updateGuard(c,dt); spd=r.spd||0; aim=!!r.aim; }
    else if(c.state==='patrol'){
      if(d>230){ S.scene.remove(c.mesh); S.cops.splice(i,1); continue; }
      const t=c.wp; if(!t){ c.node=nearestNode(c.pos.x,c.pos.z); c.wp=pick(c.node.nb); } else { const dx=t.x-c.pos.x, dz=t.z-c.pos.z, L=Math.hypot(dx,dz); if(L<0.6){ const opts=t.nb.filter(q=>q!==c.node); c.node=t; c.wp=opts.length?pick(opts):c.node; } else { c.pos.x+=dx/L*1.6*dt; c.pos.z+=dz/L*1.6*dt; c.facing=lerpAngle(c.facing,Math.atan2(dx,dz),Math.min(1,dt*6)); spd=1.6; } }
      if(S.cartelPts>2.5 && d<22 && hasLOS(c.pos.clone().setY(1.5),pp.clone().setY(1.2))){ c.state='leave'; if(!c.fledSaid && d<30){ c.fledSaid=true; S.subtitle={text:'Polis: Bu adamla uğraşmam, görmedim ben!',t:2.4}; } }
      if(Math.random()<dt*2){ for(const q of S.peds){ if(q.alive && (q.wantedT||0)>0 && dist2D(q.pos,c.pos)<30 && hasLOS(c.pos.clone().setY(1.5),q.pos.clone().setY(1.2))){ c.state='arrest'; c.target=q; break; } } }
    } else if(c.state==='arrest'){
      if(d>230){ S.scene.remove(c.mesh); S.cops.splice(i,1); continue; }
      const t=c.target; const w=WEAPONS[c.armed]||WEAPONS.glock;
      if(!t||!t.alive||(t.wantedT||0)<=0||dist2D(t.pos,c.pos)>90){ c.target=null; c.state=S.wanted>0?'hunt':'patrol'; c.wp=null; }
      else { const dq=dist2D(c.pos,t.pos); const los=dq<45 && hasLOS(c.pos.clone().setY(1.5),t.pos.clone().setY(1.2));
        if(!los||dq>14){ const dir=new THREE.Vector3(t.pos.x-c.pos.x,0,t.pos.z-c.pos.z).normalize(); c.pos.addScaledVector(dir,5.2*dt); c.facing=Math.atan2(dir.x,dir.z); spd=5.2; if(collideWorld(c.pos,0.3)){ c.pos.x+=-dir.z*5*dt; c.pos.z+=dir.x*5*dt; } }
        else { aim=true; c.facing=Math.atan2(t.pos.x-c.pos.x,t.pos.z-c.pos.z); c.shootT-=dt; if(c.shootT<=0){ c.shootT=w.auto?0.5:1.2; shootEntity(c,w,{type:'ped',ref:t,pos:t.pos},0.55); } if(t.state==='walk'||t.state==='idle'||t.state==='chat') startFlee(t,c.pos,8); } }
    }
    else if(c.state==='leave'){
      const dir=new THREE.Vector3(c.pos.x-pp.x,0,c.pos.z-pp.z).normalize(); c.pos.addScaledVector(dir,3*dt); c.facing=Math.atan2(dir.x,dir.z); spd=3;
      if(d>90){ S.scene.remove(c.mesh); S.cops.splice(i,1); continue; }
    } else {
      if(S.cartelPts>2.5 && !c.swat && !c.loyal){ c.state='leave'; if(!c.fledSaid && d<35){ c.fledSaid=true; S.subtitle={text:'Polis: '+pick(['Bu adam kartel! SWAT\'ı çağırın!','Geri çekilin, bu bizi aşar!','Merkez, burası bize göre değil!']),t:2.4}; } }
      const los = d<60 && hasLOS(c.pos.clone().setY(1.5), pp.clone().setY(1.2));
      const run=(4.6+S.wanted*0.5)*(c.mesh.userData.limp?0.5:1), w=WEAPONS[c.armed]||WEAPONS.glock;
      if(!los || d>20 || (Player.car && d>12)){
        const dir=new THREE.Vector3(pp.x-c.pos.x,0,pp.z-c.pos.z).normalize();
        c.pos.addScaledVector(dir,run*dt); c.facing=Math.atan2(dir.x,dir.z); spd=run;
        if(collideWorld(c.pos,0.3)){ c.pos.x+=-dir.z*run*dt; c.pos.z+=dir.x*run*dt; }
      } else {
        c.facing=Math.atan2(pp.x-c.pos.x,pp.z-c.pos.z)+aimOff(c.mesh); aim=true;
        if(d>7 && !Player.car){ const dir=new THREE.Vector3(pp.x-c.pos.x,0,pp.z-c.pos.z).normalize(); c.pos.addScaledVector(dir,2*dt); spd=2; }
        S.copShoutT=(S.copShoutT||0)-dt; if(S.copShoutT<=0 && d<18){ S.copShoutT=rand(4,7); S.subtitle={text:'Polis: '+pick(COP_LINES),t:2.4}; }
        c.shootT-=dt;
        if(c.shootT<=0 && !S.dead && !S.busted){ c.shootT=Math.max(0.3,(w.auto?0.35:1.3)-S.wanted*0.1); npcShoot(c,w,0.5+S.wanted*0.04); }
      }
      if(!Player.car && d<1.7){ c.arrestT+=dt; if(c.arrestT>1.0) playerBusted(); } else c.arrestT=Math.max(0,c.arrestT-dt);
    }
    collideWorld(c.pos,0.3);
    for(const o of S.cops) if(o!==c && o.alive){ const dd=dist2D(o.pos,c.pos); if(dd<0.8&&dd>0.001){ c.pos.x+=(c.pos.x-o.pos.x)/dd*(0.8-dd)*0.5; c.pos.z+=(c.pos.z-o.pos.z)/dd*(0.8-dd)*0.5; } }
    c.mesh.position.copy(c.pos); c.mesh.rotation.y=c.facing; animateHuman(c.mesh,spd,dt,aim);
  }
}
function damageCop(c,dmg,src,part){
  if(!c.alive) return; c.health-=dmg; if(src==='player' && !c.loyal && typeof markEntity==='function') markEntity(c);
  if(c.health>0){ if(dmg>=4 && dist2D(c.pos,Player.pos)<70){ playGrunt(false); if(Math.random()<0.3) S.subtitle={text:'Polis: '+pick(['Vuruldum!','Memur yaralandı!','Ahh, destek!']),t:1.6}; }
    if(part==='leg' && !c.mesh.userData.limp){ c.mesh.userData.limp=true; }
    if(part==='arm' && !c.mesh.userData.armHang && Math.random()<0.5){ c.mesh.userData.armHang=true; if(Math.random()<0.4 && !c.loyal){ spawnPickup('weapon',c.pos.x+rand(-0.8,0.8),c.pos.z+rand(-0.8,0.8),true,c.armed); setHumanWeapon(c.mesh,null); c.armed='fist'; c.state='leave'; } } return; }
  if(c.health<=0){ c.alive=false; c.deadT=0; S.stats.copKills++; if(c.swat && src==='player') S.stats.swatKills=(S.stats.swatKills||0)+1; if(typeof addBlood==='function') addBlood(c.pos,1); if(dist2D(c.pos,Player.pos)<80) playScream(false); startRagdoll(c,src,src==='player'||src==='hitman'?Player.pos:undefined); if(src==='player' && !c.loyal) crime('copKill'); if(c.loyal) toast(c.swat?'Bir SWAT muhafızın öldü':'Bir polis muhafızın öldü');
    const x=c.pos.x+rand(-0.8,0.8), z=c.pos.z+rand(-0.8,0.8); if(Math.random()<0.5) spawnPickup('weapon',x,z,true,c.armed); else spawnPickup('ammo',x,z,true); }
}
