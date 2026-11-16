// weapons.js — 8 kategori, 62 silah, parametrik modeller, toplanabilir nesne modelleri
var WCATS=['melee','pistol','smg','shotgun','rifle','sniper','heavy','thrown'];
var WCAT_NAMES={melee:'YAKIN DÖVÜŞ',pistol:'TABANCA',smg:'HAFİF MAKİNELİ',shotgun:'POMPALI',rifle:'TÜFEK',sniper:'KESKİN NİŞANCI',heavy:'AĞIR SİLAH',thrown:'FIRLATILAN'};
// m: yakın dövüş, g: ateşli. Alanlar: dmg, rate, range, ammo, pack, spread, kick, auto, pellets, snd, price
function M(name,dmg,rate,range,price,extra){ return Object.assign({cat:'melee',name,dmg,rate,range,melee:true,snd:[0.08,0.35,700],price},extra||{}); }
function G(cat,name,dmg,rate,range,ammo,pack,spread,kick,snd,price,extra){ return Object.assign({cat,name,dmg,rate,range,ammo,pack,spread,kick,snd,price},extra||{}); }
var WEAPONS={
  fist:M('Yumruk',15,0.45,2.0,0,{snd:[0.06,0.3,500]}), knuckles:M('Muşta',24,0.35,1.9,80), knife:M('Bıçak',45,0.5,2.0,100), bat:M('Beyzbol Sopası',35,0.7,2.6,150,{knock:1.6,snd:[0.1,0.5,400]}),
  hammer:M('Çekiç',42,0.6,2.1,120,{knock:1}), crowbar:M('Levye',38,0.55,2.3,130,{knock:1}), machete:M('Pala',60,0.65,2.4,300), axe:M('Balta',72,0.75,2.4,350,{knock:1.2}),
  katana:M('Katana',80,0.6,2.5,600,{snd:[0.08,0.35,1100]}), sword:M('Kılıç',75,0.6,2.6,500), chainsaw:M('Motorlu Testere',12,0.12,2.2,1200,{auto:true,snd:[0.12,0.3,300]}),
  glock:G('pistol','Glock 17',26,0.22,70,40,34,0.012,0.015,[0.12,0.5,1800],400), makarov:G('pistol','Makarov',22,0.24,60,32,16,0.014,0.014,[0.11,0.45,1900],300),
  beretta:G('pistol','Beretta 92',24,0.2,70,45,30,0.012,0.014,[0.12,0.5,1750],450), usp:G('pistol','USP .45',34,0.26,70,36,24,0.011,0.02,[0.13,0.55,1600],600),
  colt:G('pistol','Colt 1911',38,0.3,70,21,21,0.011,0.025,[0.14,0.55,1500],550), fiveseven:G('pistol','Five-seveN',22,0.16,75,60,40,0.012,0.012,[0.11,0.45,2000],700),
  silenced:G('pistol','Susturuculu Tabanca',30,0.25,65,30,30,0.01,0.012,[0.08,0.2,700],700,{silent:true}), glock18:G('pistol','Glock 18 (otomatik)',20,0.07,50,66,33,0.05,0.01,[0.08,0.4,1900],1100,{auto:true}),
  revolver:G('pistol','Revolver',48,0.42,75,18,18,0.01,0.035,[0.16,0.6,1300],650), deagle:G('pistol','Desert Eagle',60,0.5,80,21,14,0.01,0.045,[0.18,0.7,1200],900),
  uzi:G('smg','Uzi',13,0.075,45,120,90,0.045,0.008,[0.07,0.35,2600],900,{auto:true}), mac10:G('smg','MAC-10',12,0.055,40,128,64,0.07,0.009,[0.06,0.35,2700],800,{auto:true}),
  tec9:G('smg','TEC-9',15,0.08,40,100,64,0.06,0.01,[0.07,0.35,2400],700,{auto:true}), skorpion:G('smg','Skorpion',11,0.06,40,80,60,0.06,0.007,[0.06,0.3,2800],750,{auto:true}),
  mp5:G('smg','MP5',17,0.09,55,120,90,0.03,0.007,[0.08,0.38,2200],1200,{auto:true}), ump45:G('smg','UMP-45',20,0.1,55,100,75,0.03,0.009,[0.09,0.4,2000],1300,{auto:true}),
  vector:G('smg','Vector',15,0.05,50,150,99,0.03,0.006,[0.07,0.35,2500],1700,{auto:true}), p90:G('smg','P90',16,0.06,55,150,100,0.028,0.006,[0.07,0.35,2300],1600,{auto:true}),
  thompson:G('smg','Thompson',18,0.085,50,150,100,0.04,0.009,[0.09,0.42,1900],1500,{auto:true}),
  sawed:G('shotgun','Çift Namlulu',13,0.5,16,20,16,0.14,0.08,[0.25,0.8,800],600,{pellets:10}), pump:G('shotgun','Pompalı',11,0.9,22,24,16,0.09,0.06,[0.25,0.7,900],800,{pellets:8}),
  huntsg:G('shotgun','Av Tüfeği',14,0.6,28,20,16,0.07,0.07,[0.26,0.75,850],700,{pellets:9}), ksg:G('shotgun','KSG',12,0.8,22,28,16,0.09,0.06,[0.25,0.7,900],1500,{pellets:9}),
  benelli:G('shotgun','Benelli M4',11,0.45,24,28,16,0.08,0.05,[0.24,0.7,920],1900,{pellets:8}), spas:G('shotgun','SPAS-12',10,0.35,24,28,16,0.08,0.05,[0.22,0.65,950],1800,{pellets:7,auto:true}),
  aa12:G('shotgun','AA-12',9,0.25,22,40,20,0.1,0.04,[0.2,0.6,1000],3200,{pellets:7,auto:true}),
  ak47:G('rifle','AK-47',34,0.11,90,90,60,0.025,0.014,[0.14,0.5,1500],2000,{auto:true}), m4:G('rifle','AR-15',28,0.085,95,90,60,0.018,0.01,[0.12,0.45,1700],2400,{auto:true}),
  m16:G('rifle','M16',30,0.1,100,90,60,0.016,0.011,[0.13,0.45,1650],2200,{auto:true}), g36:G('rifle','G36',30,0.09,95,90,60,0.017,0.01,[0.12,0.45,1700],2600,{auto:true}),
  famas:G('rifle','FAMAS',26,0.075,90,75,50,0.02,0.009,[0.12,0.45,1800],2500,{auto:true}), aug:G('rifle','AUG',31,0.095,100,90,60,0.015,0.01,[0.13,0.45,1700],2800,{auto:true,zoom:true}),
  galil:G('rifle','Galil',33,0.1,90,105,70,0.022,0.013,[0.14,0.5,1550],2300,{auto:true}), scar:G('rifle','SCAR-H',42,0.14,100,80,60,0.02,0.016,[0.15,0.55,1400],3200,{auto:true}),
  fal:G('rifle','FN FAL',44,0.15,100,80,60,0.02,0.018,[0.16,0.55,1350],3000,{auto:true}), sks:G('rifle','SKS',55,0.4,110,40,30,0.012,0.03,[0.18,0.6,1300],1900),
  sniper:G('sniper','Keskin Nişancı',120,1.2,220,10,10,0,0.05,[0.3,0.8,1000],4000,{zoom:true}), mosin:G('sniper','Mosin-Nagant',140,1.6,220,10,10,0,0.07,[0.32,0.85,900],3000,{zoom:true}),
  m24:G('sniper','M24',150,1.4,240,10,10,0,0.06,[0.32,0.85,950],5000,{zoom:true}), dragunov:G('sniper','Dragunov SVD',110,0.7,230,20,10,0,0.05,[0.3,0.8,1000],5500,{zoom:true}),
  awm:G('sniper','AWM',180,1.5,250,10,10,0,0.07,[0.35,0.9,850],7500,{zoom:true}), barrett:G('sniper','Barrett .50',250,1.8,260,6,6,0,0.09,[0.4,1.0,700],9000,{zoom:true}),
  m249:G('heavy','M249',30,0.08,100,200,100,0.035,0.012,[0.14,0.5,1450],7000,{auto:true}), rpk:G('heavy','RPK',32,0.1,100,150,75,0.03,0.013,[0.14,0.5,1500],6000,{auto:true}),
  minigun:G('heavy','Minigun',14,0.04,90,500,250,0.05,0.003,[0.06,0.45,2000],15000,{auto:true}), flamethrower:G('heavy','Alev Makinesi',7,0.05,9,300,150,0,0,[0.05,0.15,300],9000,{auto:true,flame:true}),
  m79:G('heavy','M79 Bombaatar',90,1.2,80,6,4,0,0.05,[0.2,0.6,500],5000,{projectile:'launched'}), rpg:G('heavy','RPG-7',130,1.5,150,3,2,0,0.08,[0.4,0.9,600],6000,{projectile:'rocket'}),
  grenade:G('thrown','El Bombası',100,1.0,30,5,4,0,0,[0.05,0.2,800],500,{projectile:'grenade'}), molotov:G('thrown','Molotof',20,1.0,30,5,4,0,0,[0.05,0.2,800],300,{projectile:'molotov'}),
  pipebomb:G('thrown','Boru Bombası',140,1.2,25,3,2,0,0,[0.05,0.2,800],900,{projectile:'pipe'})
};
for(const id in WEAPONS){ WEAPONS[id].id=id; WEAPONS[id].cur=WEAPONS[id].melee?Infinity:0; }
// Silaha özel ses profilleri: dur, vol, lp (gürültü), thump [f1,f2,süre,vol], click, echo [dur,vol,lp,gecikme], whoosh
var WSFX={
  fist:{dur:0.06,vol:0.3,lp:500,thump:[120,60,0.08,0.2]}, knuckles:{dur:0.06,vol:0.35,lp:700,thump:[150,70,0.08,0.25]}, knife:{dur:0.05,vol:0.25,lp:5000,whoosh:[0.12,0.15]}, katana:{dur:0.05,vol:0.25,lp:6000,whoosh:[0.16,0.2]}, sword:{dur:0.06,vol:0.28,lp:5500,whoosh:[0.16,0.2]}, machete:{dur:0.06,vol:0.28,lp:4500,whoosh:[0.14,0.18]},
  bat:{dur:0.1,vol:0.5,lp:400,thump:[180,60,0.12,0.35]}, hammer:{dur:0.08,vol:0.5,lp:800,click:0.4,thump:[200,80,0.08,0.3]}, crowbar:{dur:0.08,vol:0.45,lp:1500,click:0.5,thump:[300,120,0.08,0.2]}, axe:{dur:0.1,vol:0.5,lp:600,thump:[150,60,0.12,0.35]}, chainsaw:{dur:0.12,vol:0.25,lp:300,thump:[90,80,0.12,0.25],click:0.3},
  glock:{dur:0.1,vol:0.5,lp:1800,thump:[220,60,0.1,0.35],click:0.4,echo:[0.25,0.12,900]}, makarov:{dur:0.09,vol:0.45,lp:2000,thump:[260,70,0.08,0.3],click:0.5,echo:[0.2,0.1,900]},
  beretta:{dur:0.1,vol:0.5,lp:1700,thump:[210,60,0.1,0.35],click:0.4,echo:[0.25,0.12,900]}, usp:{dur:0.11,vol:0.55,lp:1500,thump:[190,55,0.11,0.4],click:0.35,echo:[0.28,0.14,800]},
  colt:{dur:0.12,vol:0.55,lp:1400,thump:[180,50,0.12,0.45],click:0.35,echo:[0.3,0.15,800]}, fiveseven:{dur:0.08,vol:0.45,lp:2400,thump:[300,80,0.07,0.3],click:0.5,echo:[0.2,0.1,1000]},
  silenced:{dur:0.07,vol:0.2,lp:600,thump:[140,60,0.08,0.15],click:0.3}, glock18:{dur:0.07,vol:0.4,lp:2000,thump:[240,70,0.06,0.3],click:0.5},
  revolver:{dur:0.14,vol:0.6,lp:1200,thump:[160,45,0.14,0.5],click:0.3,echo:[0.35,0.18,700]}, deagle:{dur:0.16,vol:0.7,lp:1100,thump:[140,40,0.16,0.6],click:0.3,echo:[0.4,0.22,700]},
  uzi:{dur:0.06,vol:0.35,lp:2600,thump:[260,80,0.05,0.25],click:0.5}, mac10:{dur:0.05,vol:0.35,lp:2800,thump:[280,90,0.05,0.22],click:0.5}, tec9:{dur:0.06,vol:0.35,lp:2400,thump:[250,80,0.05,0.25],click:0.5}, skorpion:{dur:0.05,vol:0.3,lp:3000,thump:[300,100,0.04,0.2],click:0.5},
  mp5:{dur:0.07,vol:0.38,lp:2200,thump:[230,70,0.06,0.3],click:0.45}, ump45:{dur:0.08,vol:0.42,lp:1900,thump:[200,60,0.07,0.35],click:0.45}, vector:{dur:0.06,vol:0.35,lp:2500,thump:[240,80,0.05,0.28],click:0.5}, p90:{dur:0.06,vol:0.35,lp:2700,thump:[280,90,0.05,0.25],click:0.55}, thompson:{dur:0.08,vol:0.42,lp:1800,thump:[190,60,0.07,0.38],click:0.4},
  sawed:{dur:0.24,vol:0.8,lp:800,thump:[110,35,0.22,0.7],click:0.2,echo:[0.5,0.3,500]}, pump:{dur:0.22,vol:0.7,lp:900,thump:[120,40,0.2,0.6],click:0.25,echo:[0.45,0.28,500]}, huntsg:{dur:0.24,vol:0.75,lp:850,thump:[110,35,0.22,0.65],click:0.2,echo:[0.5,0.3,500]},
  ksg:{dur:0.22,vol:0.7,lp:900,thump:[120,40,0.2,0.6],click:0.3,echo:[0.45,0.28,500]}, benelli:{dur:0.2,vol:0.7,lp:950,thump:[125,42,0.18,0.6],click:0.3,echo:[0.4,0.25,500]}, spas:{dur:0.2,vol:0.65,lp:950,thump:[125,42,0.18,0.55],click:0.3,echo:[0.4,0.25,500]}, aa12:{dur:0.18,vol:0.6,lp:1000,thump:[130,45,0.16,0.5],click:0.3,echo:[0.35,0.22,500]},
  ak47:{dur:0.13,vol:0.55,lp:1500,thump:[170,50,0.11,0.45],click:0.4,echo:[0.35,0.2,700]}, m4:{dur:0.11,vol:0.5,lp:1700,thump:[200,60,0.09,0.4],click:0.45,echo:[0.3,0.18,800]}, m16:{dur:0.12,vol:0.5,lp:1650,thump:[195,58,0.1,0.4],click:0.45,echo:[0.3,0.18,800]},
  g36:{dur:0.11,vol:0.5,lp:1700,thump:[200,60,0.09,0.4],click:0.45,echo:[0.3,0.18,800]}, famas:{dur:0.1,vol:0.48,lp:1800,thump:[210,65,0.08,0.38],click:0.5,echo:[0.28,0.16,800]}, aug:{dur:0.11,vol:0.5,lp:1700,thump:[200,60,0.09,0.4],click:0.45,echo:[0.3,0.18,800]},
  galil:{dur:0.13,vol:0.55,lp:1550,thump:[175,52,0.11,0.45],click:0.4,echo:[0.35,0.2,700]}, scar:{dur:0.14,vol:0.58,lp:1400,thump:[160,48,0.12,0.5],click:0.4,echo:[0.38,0.22,700]}, fal:{dur:0.15,vol:0.6,lp:1350,thump:[155,45,0.13,0.52],click:0.4,echo:[0.4,0.24,650]}, sks:{dur:0.16,vol:0.6,lp:1300,thump:[150,45,0.14,0.52],click:0.35,echo:[0.4,0.24,650]},
  sniper:{dur:0.3,vol:0.8,lp:1000,thump:[120,35,0.25,0.7],click:0.3,echo:[0.7,0.35,500,0.08]}, mosin:{dur:0.32,vol:0.85,lp:900,thump:[115,32,0.26,0.72],click:0.3,echo:[0.7,0.36,500,0.08]}, m24:{dur:0.3,vol:0.82,lp:950,thump:[118,34,0.25,0.7],click:0.3,echo:[0.7,0.35,500,0.08]},
  dragunov:{dur:0.28,vol:0.8,lp:1000,thump:[125,36,0.24,0.68],click:0.3,echo:[0.65,0.33,520,0.08]}, awm:{dur:0.34,vol:0.9,lp:850,thump:[110,30,0.28,0.75],click:0.3,echo:[0.8,0.4,480,0.08]}, barrett:{dur:0.4,vol:1.0,lp:700,thump:[95,28,0.32,0.85],click:0.3,echo:[1.0,0.45,420,0.1]},
  m249:{dur:0.12,vol:0.5,lp:1450,thump:[170,52,0.1,0.42],click:0.4,echo:[0.3,0.18,700]}, rpk:{dur:0.13,vol:0.52,lp:1500,thump:[170,50,0.11,0.45],click:0.4,echo:[0.32,0.19,700]}, minigun:{dur:0.05,vol:0.45,lp:2000,thump:[260,90,0.04,0.3],click:0.3},
  flamethrower:{dur:0.06,vol:0.15,lp:400,whoosh:[0.1,0.25]}, m79:{dur:0.2,vol:0.6,lp:500,thump:[100,40,0.18,0.5],click:0.2}, rpg:{dur:0.4,vol:0.9,lp:600,thump:[90,40,0.3,0.6],whoosh:[0.5,0.4]},
  grenade:{dur:0.05,vol:0.2,lp:800,whoosh:[0.2,0.15]}, molotov:{dur:0.05,vol:0.2,lp:800,whoosh:[0.2,0.15]}, pipebomb:{dur:0.05,vol:0.2,lp:800,whoosh:[0.2,0.15]}
};
function playWeaponSound(w,vol){ const p=WSFX[w.id]; if(p) playShotLayered(p,vol); else playNoise(w.snd[0],w.snd[1]*(vol||1),w.snd[2]); }
var GUNMAT=null, WOODMAT=null, SILVERMAT=null;
function gunMats(){ if(!GUNMAT){ GUNMAT=new THREE.MeshPhongMaterial({color:0x2b2d31,shininess:70,specular:0x777777}); WOODMAT=new THREE.MeshPhongMaterial({color:0x6b4423,shininess:25}); SILVERMAT=new THREE.MeshPhongMaterial({color:0xbfc3c8,shininess:120,specular:0xffffff}); } }
function box(w,h,d,mat,x,y,z,rx){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x||0,y||0,z||0); if(rx) m.rotation.x=rx; m.castShadow=true; return m; }
function cyl(r,len,mat,x,y,z,r2){ const g=new THREE.CylinderGeometry(r,r2===undefined?r:r2,len,8); g.rotateX(Math.PI/2); const m=new THREE.Mesh(g,mat); m.position.set(x,y,z); m.castShadow=true; return m; }
function phong(c){ return new THREE.MeshPhongMaterial({color:c,shininess:60,specular:0x666666}); }

// Parametrik ateşli silah: +z namlu yönü, kabza orijin civarında
function gunModel(p){
  gunMats(); const g=new THREE.Group(); const M=p.color?phong(p.color):GUNMAT;
  const r=p.recv, z0=r[2]/2-0.06, top=r[1]+0.02;
  g.add(box(r[0],r[1],r[2],M,0,r[1]/2+0.02,z0));
  const bl=p.barrel[1], bz=r[2]-0.06; g.add(cyl(p.barrel[0],bl,GUNMAT,0,top-0.015,bz+bl/2));
  g.add(cyl(p.barrel[0]*0.6,0.01,new THREE.MeshBasicMaterial({color:0x050505}),0,top-0.015,bz+bl+0.002)); // namlu ağzı
  const gripM=p.grip==='metal'?GUNMAT:WOODMAT; g.add(box(0.04,0.11,0.05,gripM,0,-0.04,-0.02,0.25)); g.add(box(0.046,0.06,0.03,phong(p.grip==='metal'?0x1a1a1a:0x4a2a12),0,-0.05,-0.02,0.25)); // kabza plakası
  g.add(box(0.03,0.03,0.05,GUNMAT,0,0.0,0.04)); g.add(box(0.006,0.025,0.01,SILVERMAT,0,-0.005,0.045,0.3)); // tetik korkuluğu + tetik
  g.add(box(r[0]+0.002,0.02,0.05,phong(0x111111),0,top-0.025,z0+0.04)); // kovan atma penceresi
  for(let i=0;i<4;i++) g.add(box(r[0]+0.003,0.004,0.006,phong(0x151515),0,top-0.01-i*0.008,z0-r[2]/2+0.03)); // sürgü/gövde çentikleri
  if(p.mag) g.add(box((p.mag[0]||0.03)+0.004,0.015,(p.mag[2]||0.04)+0.004,phong(0x151515),0,-p.mag[1]+0.02,p.mag[3],p.mag[4]||0)); // şarjör taban plakası
  if(p.mag){ const m=p.mag; g.add(box(m[0],m[1],m[2],GUNMAT,0,-m[1]/2+0.02,m[3],m[4]||0)); }
  if(p.drum){ const d=new THREE.Mesh(new THREE.CylinderGeometry(0.065,0.065,0.05,12),GUNMAT); d.rotation.z=Math.PI/2; d.position.set(0,-0.04,0.1); d.castShadow=true; g.add(d); }
  if(p.stock==='wood') g.add(box(0.04,0.08,0.26,WOODMAT,0,0.03,-0.2,0.12));
  else if(p.stock==='metal') g.add(box(0.035,0.06,0.24,M,0,0.045,-0.19,0.05));
  else if(p.stock==='folded') g.add(box(0.025,0.025,0.22,GUNMAT,0,top+0.012,-0.06));
  if(p.guard){ const gl=p.guardLen||0.18; g.add(box(0.05,0.055,gl,p.guard==='wood'?WOODMAT:M,0,top-0.02,bz+gl/2-0.02)); }
  if(p.pump) g.add(box(0.055,0.05,0.14,WOODMAT,0,top-0.045,bz+0.2));
  if(p.tube) g.add(cyl(0.013,bl*0.8,GUNMAT,0,top-0.045,bz+bl*0.4));
  if(p.double) g.add(cyl(p.barrel[0],bl,GUNMAT,0,top-0.015-0.03,bz+bl/2));
  if(p.cylinder) g.add(cyl(0.028,0.06,GUNMAT,0,top-0.02,0.02));
  if(p.rail){ g.add(box(0.02,0.025,0.14,GUNMAT,0,top+0.01,z0)); for(let i=0;i<6;i++) g.add(box(0.022,0.006,0.008,phong(0x3a3a3a),0,top+0.025,z0-0.06+i*0.022)); }
  if(p.stock==='metal'||p.stock==='wood') g.add(box(0.042,0.085,0.02,phong(0x111111),0,0.03,-0.33)); // dipçik lastiği
  if(p.scope){ g.add(cyl(0.02,0.16,GUNMAT,0,top+0.035,z0)); g.add(box(0.015,0.03,0.02,GUNMAT,0,top+0.012,z0-0.05)); g.add(box(0.015,0.03,0.02,GUNMAT,0,top+0.012,z0+0.05)); }
  if(p.shroud) g.add(cyl(0.02,bl*0.9,GUNMAT,0,top-0.015,bz+bl*0.45));
  if(p.suppressor) g.add(cyl(0.02,0.16,GUNMAT,0,top-0.015,bz+bl+0.08));
  if(p.topMag) g.add(box(0.045,0.03,0.22,new THREE.MeshPhongMaterial({color:0x6a6a6a,transparent:true,opacity:0.8}),0,top+0.015,z0));
  if(p.bipod){ for(const x of [-0.04,0.04]) g.add(box(0.01,0.14,0.01,GUNMAT,x,top-0.09,bz+bl*0.6)); }
  if(p.brake) g.add(box(0.03,0.03,0.08,GUNMAT,0,top-0.015,bz+bl-0.02));
  if(p.belt) g.add(box(0.07,0.09,0.12,phong(0x4a5a3a),0,-0.03,0.06));
  if(p.handle) g.add(box(0.02,0.04,0.16,GUNMAT,0,top+0.02,z0));
  if(p.light) g.add(cyl(0.014,0.08,GUNMAT,0,top-0.06,bz+0.1));
  if(p.reddot){ g.add(box(0.03,0.03,0.05,GUNMAT,0,top+0.03,z0+0.02)); g.add(cyl(0.008,0.01,new THREE.MeshBasicMaterial({color:0xff2020}),0,top+0.035,z0-0.005)); }
  g.add(box(0.012,0.03,0.012,GUNMAT,0,top+0.005,bz+bl-0.02)); g.add(box(0.03,0.02,0.01,GUNMAT,0,top+0.008,z0-r[2]/2+0.02)); // ön ve arka gez
  // kurma kolu, emniyet mandalı, tetik korkuluğu halkası, askı kayışı
  if(p.mag||p.belt||p.topMag){ g.add(box(0.02,0.012,0.012,GUNMAT,r[0]/2+0.01,top-0.022,z0+0.03)); const kn=new THREE.Mesh(new THREE.SphereGeometry(0.008,6,6),SILVERMAT); kn.position.set(r[0]/2+0.022,top-0.022,z0+0.03); g.add(kn); }
  if(p.stock) g.add(box(0.006,0.018,0.014,phong(0x202020),-r[0]/2-0.003,0.02,-0.01));
  { const ring=new THREE.Mesh(new THREE.TorusGeometry(0.022,0.004,6,12),GUNMAT); ring.position.set(0,-0.012,0.045); ring.rotation.y=Math.PI/2; g.add(ring); }
  if((p.stock==='wood'||p.stock==='metal') && p.guard){ const a=new THREE.Vector3(0,0.0,-0.3), b=new THREE.Vector3(0,top-0.06,bz+(p.guardLen||0.18)*0.6); const len=a.distanceTo(b); const s=new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,len,5),phong(0x2a2a22)); s.position.copy(a).add(b).multiplyScalar(0.5); s.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()); g.add(s); }
  const muzzle=new THREE.Object3D(); muzzle.position.set(0,top-0.015,bz+bl+(p.suppressor?0.16:0)); g.add(muzzle); g.userData.muzzle=muzzle;
  // sol elin tutacağı nokta: el kundağı varsa ortası, yoksa gövdenin önü (tabancada yok)
  g.userData.lhand=p.guard?new THREE.Vector3(0,top-0.05,bz+(p.guardLen||0.18)/2-0.02):new THREE.Vector3(0,top-0.05,Math.max(0.1,bz-0.02));
  return g;
}
var GUN_PARAMS={
  glock:{recv:[0.045,0.055,0.18],barrel:[0.01,0.02],mag:[0.03,0.09,0.04,-0.02],grip:'metal'}, makarov:{recv:[0.04,0.05,0.16],barrel:[0.009,0.02],mag:[0.028,0.08,0.035,-0.02],grip:'metal',color:0x3a3a40},
  beretta:{recv:[0.045,0.055,0.2],barrel:[0.011,0.025],mag:[0.03,0.09,0.04,-0.02],grip:'metal',color:0x303438}, usp:{recv:[0.047,0.058,0.2],barrel:[0.011,0.03],mag:[0.03,0.09,0.04,-0.02],grip:'metal',color:0x2a2f2a,light:true},
  colt:{recv:[0.045,0.055,0.21],barrel:[0.011,0.02],mag:[0.03,0.09,0.04,-0.02],grip:'metal',color:0xa8a8a8}, fiveseven:{recv:[0.045,0.055,0.21],barrel:[0.01,0.02],mag:[0.03,0.1,0.04,-0.02],grip:'metal',color:0x4a4a4a},
  silenced:{recv:[0.045,0.055,0.18],barrel:[0.01,0.02],mag:[0.03,0.09,0.04,-0.02],grip:'metal',suppressor:true}, glock18:{recv:[0.045,0.055,0.18],barrel:[0.01,0.02],mag:[0.03,0.16,0.04,-0.02],grip:'metal'},
  revolver:{recv:[0.04,0.05,0.1],barrel:[0.012,0.14],cylinder:true,color:0x5a5e63}, deagle:{recv:[0.05,0.06,0.23],barrel:[0.012,0.03],mag:[0.03,0.09,0.04,-0.02],grip:'metal',color:0x9a9ea3},
  uzi:{recv:[0.06,0.08,0.3],barrel:[0.014,0.08],mag:[0.04,0.17,0.05,0.04],stock:'folded',grip:'metal'}, mac10:{recv:[0.055,0.07,0.22],barrel:[0.012,0.05],mag:[0.035,0.18,0.05,0.0],stock:'folded',grip:'metal'},
  tec9:{recv:[0.05,0.07,0.26],barrel:[0.01,0.14],shroud:true,mag:[0.035,0.22,0.05,0.0],grip:'metal'}, skorpion:{recv:[0.045,0.06,0.2],barrel:[0.01,0.06],mag:[0.03,0.12,0.04,0.0],stock:'folded',grip:'metal'},
  mp5:{recv:[0.05,0.07,0.32],barrel:[0.013,0.12],mag:[0.035,0.2,0.05,0.1,0.25],stock:'metal',guard:'metal',guardLen:0.12,grip:'metal',light:true}, ump45:{recv:[0.05,0.08,0.3],barrel:[0.012,0.1],mag:[0.035,0.17,0.05,0.08,0.15],stock:'metal',guard:'metal',guardLen:0.12,grip:'metal',color:0x2f2f2f},
  vector:{recv:[0.06,0.1,0.34],barrel:[0.012,0.06],mag:[0.035,0.16,0.05,0.06,0.3],stock:'metal',grip:'metal',rail:true,color:0x222222,reddot:true}, p90:{recv:[0.06,0.09,0.4],barrel:[0.012,0.08],topMag:true,grip:'metal',color:0x3a3a3a,reddot:true},
  thompson:{recv:[0.055,0.08,0.3],barrel:[0.013,0.22],drum:true,stock:'wood',guard:'wood',guardLen:0.16},
  sawed:{recv:[0.05,0.08,0.14],barrel:[0.017,0.35],double:true,stock:'wood'}, pump:{recv:[0.05,0.09,0.2],barrel:[0.018,0.6],pump:true,tube:true,stock:'wood'},
  huntsg:{recv:[0.05,0.08,0.16],barrel:[0.016,0.7],double:true,stock:'wood'}, ksg:{recv:[0.06,0.1,0.36],barrel:[0.018,0.22],tube:true,pump:true,stock:'metal',color:0x1f1f1f,grip:'metal'},
  benelli:{recv:[0.05,0.09,0.24],barrel:[0.018,0.55],tube:true,stock:'metal',guard:'metal',guardLen:0.2,color:0x222222,grip:'metal'}, spas:{recv:[0.05,0.09,0.24],barrel:[0.018,0.5],tube:true,stock:'folded',guard:'metal',guardLen:0.2,color:0x1a1a1a,grip:'metal'},
  aa12:{recv:[0.06,0.1,0.32],barrel:[0.018,0.3],drum:true,stock:'metal',guard:'metal',guardLen:0.2,color:0x1a1a1a,grip:'metal',reddot:true},
  ak47:{recv:[0.05,0.07,0.28],barrel:[0.012,0.3],mag:[0.035,0.2,0.07,0.07,0.45],stock:'wood',guard:'wood',guardLen:0.2}, m4:{recv:[0.05,0.07,0.26],barrel:[0.011,0.3],mag:[0.035,0.17,0.06,0.05,0.1],stock:'metal',guard:'metal',guardLen:0.22,rail:true,grip:'metal',light:true,reddot:true},
  m16:{recv:[0.05,0.07,0.28],barrel:[0.011,0.38],mag:[0.035,0.17,0.06,0.05,0.1],stock:'metal',guard:'metal',guardLen:0.26,handle:true,grip:'metal'}, g36:{recv:[0.05,0.08,0.3],barrel:[0.012,0.3],mag:[0.035,0.18,0.06,0.06,0.2],stock:'metal',guard:'metal',guardLen:0.22,handle:true,color:0x2a2f2a,grip:'metal'},
  famas:{recv:[0.06,0.09,0.42],barrel:[0.012,0.2],mag:[0.035,0.16,0.06,0.0,0.1],handle:true,color:0x2a2a2a,grip:'metal'}, aug:{recv:[0.06,0.09,0.4],barrel:[0.012,0.24],mag:[0.035,0.16,0.06,-0.02,0.1],scope:true,color:0x3f4a3a,grip:'metal'},
  galil:{recv:[0.05,0.07,0.28],barrel:[0.012,0.32],mag:[0.035,0.2,0.07,0.07,0.4],stock:'metal',guard:'wood',guardLen:0.2}, scar:{recv:[0.055,0.075,0.3],barrel:[0.013,0.28],mag:[0.035,0.18,0.07,0.06,0.2],stock:'metal',guard:'metal',guardLen:0.2,rail:true,color:0x8b7a4f,grip:'metal',reddot:true,light:true},
  fal:{recv:[0.05,0.075,0.3],barrel:[0.012,0.38],mag:[0.035,0.16,0.06,0.06,0.1],stock:'wood',guard:'metal',guardLen:0.24}, sks:{recv:[0.045,0.07,0.28],barrel:[0.011,0.36],mag:[0.03,0.08,0.07,0.06],stock:'wood',guard:'wood',guardLen:0.3},
  sniper:{recv:[0.045,0.07,0.3],barrel:[0.012,0.55],mag:[0.03,0.08,0.06,0.04],stock:'wood',scope:true}, mosin:{recv:[0.04,0.06,0.26],barrel:[0.011,0.7],stock:'wood',guard:'wood',guardLen:0.45},
  m24:{recv:[0.045,0.07,0.3],barrel:[0.012,0.58],stock:'wood',scope:true,color:0x2f3a2a}, dragunov:{recv:[0.045,0.07,0.3],barrel:[0.012,0.55],mag:[0.03,0.12,0.07,0.05,0.3],stock:'wood',scope:true,guard:'wood',guardLen:0.2},
  awm:{recv:[0.045,0.07,0.32],barrel:[0.013,0.6],mag:[0.03,0.08,0.06,0.04],stock:'metal',scope:true,bipod:true,color:0x3f4a3a,grip:'metal'}, barrett:{recv:[0.055,0.08,0.4],barrel:[0.015,0.7],mag:[0.035,0.12,0.08,0.02],stock:'metal',scope:true,bipod:true,brake:true,grip:'metal'},
  m249:{recv:[0.06,0.09,0.34],barrel:[0.013,0.4],belt:true,stock:'metal',guard:'metal',guardLen:0.22,bipod:true,grip:'metal'}, rpk:{recv:[0.05,0.07,0.3],barrel:[0.013,0.45],mag:[0.035,0.2,0.08,0.07,0.45],stock:'wood',guard:'wood',guardLen:0.22,bipod:true},
  m79:{recv:[0.05,0.07,0.14],barrel:[0.03,0.3],stock:'wood'}
};
function makeWeaponModel(id){
  gunMats(); const g=new THREE.Group(); let mz=0.4; const S_=SILVERMAT, W=WOODMAT, D=GUNMAT;
  if(id==='knife'){ g.add(box(0.02,0.035,0.22,S_,0,0,0.19), box(0.03,0.045,0.12,W,0,0,0.02)); mz=0.3; }
  else if(id==='knuckles'){ g.add(box(0.1,0.03,0.05,phong(0xc8a84a),0,0,0.05)); mz=0.1; }
  else if(id==='bat'){ g.add(cyl(0.035,0.8,W,0,0,0.36,0.02)); mz=0.75; }
  else if(id==='hammer'){ g.add(cyl(0.015,0.4,W,0,0,0.18), box(0.06,0.06,0.12,D,0,0,0.38)); mz=0.42; }
  else if(id==='crowbar'){ g.add(cyl(0.012,0.6,D,0,0,0.28), box(0.025,0.025,0.1,D,0,0.04,0.6)); mz=0.62; }
  else if(id==='machete'){ g.add(box(0.015,0.06,0.45,S_,0,0.01,0.32), box(0.03,0.05,0.13,D,0,0,0.03)); mz=0.55; }
  else if(id==='axe'){ g.add(cyl(0.016,0.7,W,0,0,0.3), box(0.02,0.2,0.14,S_,0,0.06,0.6)); mz=0.68; }
  else if(id==='katana'){ g.add(box(0.012,0.04,0.75,S_,0,0.01,0.48), box(0.03,0.04,0.25,phong(0x222244),0,0,0.0), box(0.07,0.07,0.015,D,0,0,0.12)); mz=0.85; }
  else if(id==='sword'){ g.add(box(0.015,0.06,0.7,S_,0,0,0.5), box(0.03,0.04,0.18,phong(0x4a2a1a),0,0,0.0), box(0.16,0.02,0.03,phong(0xc8a84a),0,0,0.12)); mz=0.85; }
  else if(id==='chainsaw'){ g.add(box(0.12,0.14,0.26,phong(0xd9771e),0,0.02,0.1), box(0.03,0.08,0.5,D,0,0.02,0.45), box(0.04,0.1,0.52,phong(0x777777),0,0.02,0.46), box(0.03,0.03,0.12,D,0,0.1,0.0)); mz=0.72; }
  else if(id==='minigun'){ for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; g.add(cyl(0.012,0.5,D,Math.cos(a)*0.035,0.07+Math.sin(a)*0.035,0.45)); } g.add(cyl(0.05,0.08,D,0,0.07,0.2), box(0.09,0.12,0.22,D,0,0.06,0.0), box(0.04,0.1,0.05,D,0,-0.04,-0.02,0.25), box(0.04,0.04,0.1,D,0,0.14,0.08)); mz=0.72; }
  else if(id==='flamethrower'){ g.add(box(0.09,0.09,0.3,phong(0x8a2a1a),0,0.06,0.0), cyl(0.02,0.5,D,0,0.06,0.4), cyl(0.035,0.08,D,0,0.06,0.66), box(0.04,0.1,0.05,D,0,-0.04,-0.02,0.25), box(0.04,0.06,0.04,D,0,0.03,0.3)); mz=0.72; }
  else if(id==='rpg'){ g.add(cyl(0.03,0.9,phong(0x3f4a3a),0,0.05,0.3), cyl(0.045,0.2,phong(0x4a5a3a),0,0.05,0.85,0.02), box(0.04,0.1,0.05,W,0,-0.04,0.0,0.25), box(0.04,0.08,0.05,W,0,-0.03,0.3,0.2), box(0.02,0.05,0.08,D,0,0.1,0.2)); mz=0.95; }
  else if(id==='grenade'){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.05,10,8),phong(0x3a4a2a)); m.position.set(0,0,0.05); g.add(m); g.add(box(0.02,0.04,0.02,D,0,0.06,0.05)); mz=0.1; }
  else if(id==='molotov'){ g.add(cyl(0.035,0.14,new THREE.MeshPhongMaterial({color:0x5a8a3a,transparent:true,opacity:0.7}),0,0,0.05), cyl(0.015,0.08,phong(0x5a8a3a),0,0,0.16), box(0.03,0.03,0.06,phong(0xeeeeee),0,0.02,0.2)); mz=0.2; }
  else if(id==='pipebomb'){ g.add(cyl(0.03,0.22,phong(0x777777),0,0,0.08), box(0.02,0.02,0.05,D,0,0.03,0.2)); mz=0.2; }
  else if(id==='fist'){ mz=0.1; }
  else return gunModel(GUN_PARAMS[id]);
  const muzzle=new THREE.Object3D(); muzzle.position.set(0,0,mz); g.add(muzzle); g.userData.muzzle=muzzle; return g;
}
// Toplanabilir nesne modelleri: para destesi, ilk yardım, zırh yeleği, mermi kutusu, silah
function makePickupMesh(type,wid){
  const g=new THREE.Group(); const L=c=>matLambert(c);
  if(type==='money'){ g.add(box(0.4,0.14,0.22,L(0x2e8b57),0,0.07,0), box(0.42,0.15,0.07,L(0xd9efd9),0,0.07,0)); const t=new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.1),new THREE.MeshBasicMaterial({map:signTexture('$','#2e8b57','#eafbea'),transparent:true})); t.rotation.x=-Math.PI/2; t.position.set(0,0.15,0); g.add(t); }
  else if(type==='health'){ g.add(box(0.45,0.3,0.35,L(0xf4f4f4),0,0.15,0), box(0.26,0.02,0.08,L(0xd62828),0,0.31,0), box(0.08,0.02,0.26,L(0xd62828),0,0.31,0), box(0.14,0.04,0.08,L(0x999999),0,0.33,0)); }
  else if(type==='armor'){ g.add(box(0.46,0.5,0.14,L(0x2a4a8a),0,0.3,0), box(0.1,0.18,0.15,L(0x1c3360),-0.16,0.6,0), box(0.1,0.18,0.15,L(0x1c3360),0.16,0.6,0), box(0.3,0.04,0.15,L(0x111111),0,0.2,0)); }
  else if(type==='ammo'){ g.add(box(0.4,0.22,0.26,L(0x5a5a3a),0,0.11,0), box(0.42,0.03,0.06,L(0x2a2a1a),0,0.11,0)); for(let i=0;i<4;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.12,6),L(0xc8a84a)); b.position.set(-0.12+i*0.08,0.28,0); g.add(b); } }
  else if(type==='weapon'){ const w=makeWeaponModel(wid); w.scale.setScalar(1.4); w.rotation.z=0.5; w.position.y=0.15; g.add(w); }
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  return g;
}
