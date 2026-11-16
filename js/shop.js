// shop.js — online mağaza (P): araç galerisi, servis, rüşvet, ordu; büyük harita ve lejant (M)
var ShopUI={open:false,tab:0,sel:0};
var CAR_PRICES={sedan:8000,hatch:6000,pickup:12000,van:10000,sports:35000,suv:18000,coupe:22000,muscle:28000,limo:45000,truck:20000,bus:30000};
var SHOP_TABS=[
  {name:'ARAÇ GALERİSİ',items:()=>['hatch','sedan','van','pickup','suv','truck','coupe','muscle','bus','sports','limo'].map(t=>({n:CAR_LABELS[t],p:CAR_PRICES[t],d:'Yakındaki yola hemen teslim edilir. Azami hız '+Math.round(CAR_TYPES[t].max*3.6)+' km/s.',f:()=>buyCar(t)}))
    .concat(S.garage.map(t=>({n:'Garajdan getir: '+CAR_LABELS[t],p:300,d:'Sahip olduğun aracı tekrar teslim eder.',f:()=>buyCar(t)})))},
  {name:'SERVİS',items:()=>[
    {n:'Tamirci çağır',p:300,d:'Bir tamirci vanla gelir, aracının yanına yürür ve onarır.',f:()=>callMechanic()},
    {n:'Şoför tut',p:500,d:'Bulunduğun arabaya şoför gelir; sen yolcu koltuğuna geçersin. Haritadan (M) tıklayarak hedef verirsin. Space: dur, W: devam.',f:()=>hireDriver()},
    {n:'Suikastçı tut (çatı)',p:5000,d:'Bir keskin nişancı yakındaki bir çatıya yerleşir. Birine bakıp K\'ye basınca vurur; sana yıldız gelmez. En fazla 4.',f:()=>hireHitman()},
    {n:'Halka bağış yap',p:1000,d:'Nefret 1 kademe düşer; siviller seni biraz affeder.',f:()=>{ if(S.hate<=0){ toast('Kimse senden nefret etmiyor'); return false; } S.hate=Math.max(0,S.hate-1); }},
    {n:'Büyük bağış (vakıf kur)',p:4000,d:'Nefret tamamen sıfırlanır.',f:()=>{ S.hate=0; }},
    {n:'Avukat tut',p:2500,d:'Aranma seviyesi sıfırlanır.',f:()=>{ if(S.wanted<=0){ toast('Zaten aranmıyorsun'); return false; } clearWanted(); }}
  ]},
  {name:'RÜŞVET',items:()=>[
    {n:'Polis rüşveti +%10  (şu an %'+S.bribePolice+')',p:2500,d:'Polislerin bu yüzdesi senin adamın olur: saldırmaz, seni korur ve sana zarar vereni vurur.',f:()=>{ if(S.bribePolice>=100){ toast('Polisin tamamı zaten senin'); return false; } S.bribePolice=Math.min(100,S.bribePolice+10); }},
    {n:'Polis rüşveti +%25  (şu an %'+S.bribePolice+')',p:5500,d:'Toplu rüşvet, daha ucuz.',f:()=>{ if(S.bribePolice>=100){ toast('Polisin tamamı zaten senin'); return false; } S.bribePolice=Math.min(100,S.bribePolice+25); }},
    {n:'SWAT rüşveti +%10  (şu an %'+S.bribeSwat+')',p:5000,d:'SWAT ekiplerinin bu yüzdesi seni korur (AR-15 ve kask).',f:()=>{ if(S.bribeSwat>=100){ toast('SWAT tamamen senin'); return false; } S.bribeSwat=Math.min(100,S.bribeSwat+10); }},
    {n:'SWAT rüşveti +%25  (şu an %'+S.bribeSwat+')',p:11000,d:'Toplu SWAT rüşveti.',f:()=>{ if(S.bribeSwat>=100){ toast('SWAT tamamen senin'); return false; } S.bribeSwat=Math.min(100,S.bribeSwat+25); }}
  ]},
  {name:'KORUMA',items:()=>[
    {n:'Kurşun geçirmez yelek',p:3000,d:'Zırh üst sınırı 200 olur ve dolar.',f:()=>buyVest()},
    {n:'Özel koruma (2 kişi)',p:6000,d:'Takım elbiseli iki zırhlı koruma çetene katılır (MP5).',f:()=>hireBodyguards(2)},
    {n:'Zırhlı SUV',p:25000,d:'Siyah, 4 kat dayanıklı SUV teslim edilir.',f:()=>buyArmoredCar()},
    {n:'Çeteye zırh (hepsine)',p:0,d:'Üye başına $'+price(200)+'; C panelinden de alınır.',f:()=>{ buyCrewArmor(); return false; }}
  ]},
  {name:'KIYAFET',items:()=>[
    {n:'Kıyafet dükkânına gir',p:0,d:'Yüz, vücut, saç ücretsiz; her kıyafet değişimi $'+price(60)+'. (Oyun içinde U tuşu da açar.)',f:()=>{ toggleShop(); openAvatar(); return false; }}
  ]},
  {name:'ORDU',items:()=>[
    {n:'Dost polis arabası',p:8000,d:'Seni takip eder, düşmanlara çarpar ve sirenle gelir.',f:()=>spawnAllyVehicle('policecar')},
    {n:'Panzer',p:30000,d:'Makineli tüfekli zırhlı araç; seni takip eder ve sana saldıranı tarar.',f:()=>spawnAllyVehicle('apc')},
    {n:'Tank',p:80000,d:'Top ateşiyle düşmanı imha eder, ağır zırh.',f:()=>spawnAllyVehicle('tank')},
    {n:'Helikopter',p:60000,d:'Havadan koruma; düşmanlara ateş eder (en fazla 1).',f:()=>spawnAllyVehicle('heli')}
  ]}
];
function toggleShop(){ ShopUI.open=!ShopUI.open; ShopUI.sel=0; document.getElementById('oshop').hidden=!ShopUI.open; if(ShopUI.open){ renderShop(); playTone(900,0.08,0.12,'square',1200); } }
function renderShop(){
  const t=SHOP_TABS[ShopUI.tab], items=t.items(); ShopUI.sel=clamp(ShopUI.sel,0,Math.max(0,items.length-1));
  let h='<div class="tabs">'+SHOP_TABS.map((x,i)=>'<span class="'+(i===ShopUI.tab?'on':'')+'">'+x.name+'</span>').join('')+'</div><div class="bal">Bakiye: $'+S.money+'</div><div class="items">';
  items.forEach((it,i)=>{ h+='<div class="it '+(i===ShopUI.sel?'sel':'')+(S.money<price(it.p)?' poor':'')+'"><span>'+it.n+'</span><b>$'+price(it.p)+'</b></div>'; });
  h+='</div><p class="desc">'+(items[ShopUI.sel]?items[ShopUI.sel].d:'')+'</p><p class="keys">← → sekme &nbsp; ↑ ↓ seç &nbsp; Enter satın al &nbsp; P / Esc kapat</p>';
  document.getElementById('oshop').innerHTML=h;
}
function shopKey(code){
  if(code==='ArrowLeft'){ ShopUI.tab=(ShopUI.tab+SHOP_TABS.length-1)%SHOP_TABS.length; ShopUI.sel=0; }
  else if(code==='ArrowRight'){ ShopUI.tab=(ShopUI.tab+1)%SHOP_TABS.length; ShopUI.sel=0; }
  else if(code==='ArrowUp') ShopUI.sel--; else if(code==='ArrowDown') ShopUI.sel++;
  else if(code==='Enter'||code==='NumpadEnter'){ const it=SHOP_TABS[ShopUI.tab].items()[ShopUI.sel]; if(!it) return; if(S.money<price(it.p)){ toast('Paran yetmiyor'); playTone(200,0.1,0.15,'square'); } else if(it.f()!==false){ S.money-=price(it.p); playTone(880,0.12,0.15,'square',1320); } }
  else if(code==='Escape'||code==='KeyP'){ toggleShop(); return; }
  renderShop();
}
// ---- Büyük harita + lejant ----
var BigMap={open:false};
function toggleBigMap(){ BigMap.open=!BigMap.open; document.getElementById('bigmap').hidden=!BigMap.open; if(BigMap.open){ drawBigMap(); if(!BigMap.bound){ BigMap.bound=true; document.getElementById('bigmapc').addEventListener('click',e=>{ const cv=e.currentTarget, r=cv.getBoundingClientRect(); const s=cv.width/(CITY.size+40); const x=(e.clientX-r.left)*(cv.width/r.width)/s-20, z=(e.clientY-r.top)*(cv.height/r.height)/s-20; S.waypoint={x:clamp(x,0,CITY.size),z:clamp(z,0,CITY.size)}; toast('Hedef işaretlendi'+(Player.car&&Player.car.driverNpc?' — şoför yola çıkıyor':'')); if(Player.car&&Player.car.driverNpc){ Player.car.hold=false; Player.car.dest=S.waypoint; } drawBigMap(); }); } } }
var LEGEND=[['#ffffff','▲ Sen'],['#8a1a1a','Kuzey Karteli bölgesi/üyesi'],['#1a3a8a','Doğu Karteli bölgesi/üyesi'],['#8a6a1a','Batı Karteli bölgesi/üyesi'],['#5a1a7a','Merkez Karteli bölgesi/üyesi'],['#2a7a2a','Güney Karteli bölgesi/üyesi'],['#ffffff','■ Kartel patronu (üyeysen)'],['#40c8ff','● Hedef (haritaya tıkla)'],['#ffd23b','★ Önemli kişi (VIP)'],['#ff2a7a','■ Suikastçın (çatıda)'],['#e8e8e8','Yaya'],['#c070ff','Çete üyesi (silahlı)'],['#ff3030','Saldırgan / çatışan'],['#3bff6b','Kendi çeten'],['#4aa3ff','Polis'],['#4aa3ff','■ Polis arabası'],['#ff8a2a','■ Polis helikopteri'],['#8dff8d','■ Satın aldığın kuvvetler'],['#b8b8b8','■ Araç'],['#ff4040','■ Hastane'],['#4a7dff','■ Polis karakolu'],['#3bff6b','■ Silah dükkânı'],['#ff5fd2','■ Pay\'n\'Spray'],['#ffd23b','■ Görev noktası'],['#ffd23b','● Görev hedefi'],['#ff4040','· Sağlık'],['#c8a84a','· Mermi'],['#3bff6b','· Para'],['#3b8bff','· Zırh'],['#ffffff','· Silah']];
function drawBigMap(){
  const cv=document.getElementById('bigmapc'); const W=cv.width=Math.min(innerWidth-360,innerHeight-80,900), Hh=cv.height=W; const g=cv.getContext('2d');
  const P=CITY.P,N=CITY.N,R=CITY.R; const s=W/(CITY.size+40); const X=x=>(x+20)*s, Z=z=>(z+20)*s;
  g.fillStyle='#223322'; g.fillRect(0,0,W,Hh);
  g.fillStyle='#4b5157'; for(let i=0;i<N;i++) for(let j=0;j<N;j++) g.fillRect(X(i*P+R/2),Z(j*P+R/2),(P-R)*s,(P-R)*s);
  g.fillStyle='#2e2e33'; for(let i=0;i<=N;i++){ g.fillRect(X(i*P)-R*s/2,Z(-20),R*s,Hh); g.fillRect(X(-20),Z(i*P)-R*s/2,W,R*s); }
  const pk=S.places.park; g.fillStyle='#3f8a3a'; g.fillRect(X(pk.x-20),Z(pk.z-20),40*s,40*s);
  for(let i=0;i<N;i++) for(let j=0;j<N;j++){ const c=cartelAt(i*P+30,j*P+30); if(c){ g.fillStyle='#'+c.color.toString(16).padStart(6,'0')+'55'; g.fillRect(X(i*P+R/2),Z(j*P+R/2),(P-R)*s,(P-R)*s); } }
  if(S.places.boss){ sq(S.places.boss.x,S.places.boss.z,'#ffffff',9); }
  const sq=(x,z,c,w)=>{ g.fillStyle=c; g.fillRect(X(x)-w/2,Z(z)-w/2,w,w); };
  for(const [k,col] of [['hospital','#ff4040'],['police','#4a7dff'],['gunshop','#3bff6b'],['spray','#ff5fd2'],['job','#ffd23b']]){ const p=S.places[k]; if(p) sq(p.x,p.z,col,10); }
  for(const p of S.pickups) if(!p.taken) sq(p.x,p.z,PICKUP_COLORS[p.type],3);
  for(const c of S.cars) sq(c.pos.x,c.pos.z,c.dead?'#111':(c.ally?'#8dff8d':(c.police?'#4aa3ff':'#b8b8b8')),c.police?6:4);
  for(const p of S.peds) if(p.alive) sq(p.pos.x,p.pos.z,p.state==='crew'?'#3bff6b':p.state==='fight'?'#ff3030':(p.gang?'#c070ff':'#e8e8e8'),p.gang||p.state==='crew'?4:2);
  for(const c of S.cops) if(c.alive) sq(c.pos.x,c.pos.z,c.loyal?'#8dff8d':'#4aa3ff',4);
  for(const a of S.allies) if(a.pos && a.kind!=='policecar') sq(a.pos.x,a.pos.z,'#8dff8d',7);
  if(S.heli) sq(S.heli.pos.x,S.heli.pos.z,'#ff8a2a',8);
  if(S.objTarget){ const t=S.objTarget; g.fillStyle='#ffd23b'; g.beginPath(); g.arc(X(t.x),Z(t.z),6,0,7); g.fill(); }
  if(S.waypoint){ g.fillStyle='#40c8ff'; g.beginPath(); g.arc(X(S.waypoint.x),Z(S.waypoint.z),7,0,7); g.fill(); g.strokeStyle='#fff'; g.stroke(); }
  if(S.vip&&S.vip.alive){ g.fillStyle='#ffd23b'; g.font='bold 16px sans-serif'; g.fillText('★',X(S.vip.pos.x)-7,Z(S.vip.pos.z)+6); }
  g.fillStyle='#ff2a7a'; for(const h of S.hitmen) sq(h.pos.x,h.pos.z,'#ff2a7a',6);
  const pp=Player.car?Player.car.pos:Player.pos, a=Player.car?Player.car.heading:Player.facing;
  g.save(); g.translate(X(pp.x),Z(pp.z)); g.rotate(-a); g.fillStyle='#fff'; g.strokeStyle='#000'; g.lineWidth=2; g.beginPath(); g.moveTo(0,-9); g.lineTo(6,7); g.lineTo(-6,7); g.closePath(); g.fill(); g.stroke(); g.restore();
  const lg=document.getElementById('legend'); if(!lg.dataset.done){ lg.innerHTML='<h3>LEJANT</h3>'+LEGEND.map(([c,t])=>'<div><i style="background:'+c+'"></i>'+t+'</div>').join('')+'<p>Haritaya tıkla: hedef koy (şoför oraya gider). M: kapat · ☠ nefret</p>'; lg.dataset.done='1'; }
}
