// radio.js — prosedürel müzik motoru: 8 istasyon + karışık, 104 bestelenmiş parça (tohumdan üretilir, her çalışta aynı), Web Audio ile gerçek zamanlı çalınır.
// R: istasyon · Shift+R: sonraki parça · radyo araçta ve yayan (telefon) çalışır.
var GENRE={
  trap:   {bpm:[68,82], half:true, scales:[[0,2,3,5,7,8,10],[0,2,3,5,7,8,11],[0,1,3,5,7,8,10]], progs:[[0,5,3,4],[0,3,5,4],[0,0,5,3],[0,5,0,4]], drums:'trap', bass:'808', lead:'pluck', pad:true, dens:0.45, swing:0},
  drill:  {bpm:[138,146], half:true, scales:[[0,2,3,5,7,8,10],[0,1,3,5,7,8,10]], progs:[[0,3,4,0],[0,5,4,3],[0,0,3,4]], drums:'drill', bass:'808slide', lead:'pluck', pad:true, dens:0.4, swing:0},
  rock:   {bpm:[118,152], half:false, scales:[[0,2,4,5,7,9,11],[0,2,3,5,7,8,10],[0,3,5,7,10]], progs:[[0,4,5,3],[0,5,3,4],[0,3,4,4],[0,6,3,4]], drums:'rock', bass:'saw', lead:'lead', pad:false, power:true, dens:0.55, swing:0},
  arabesk:{bpm:[88,108], half:false, scales:[[0,1,4,5,7,8,11],[0,2,3,6,7,8,11],[0,1,4,5,7,8,10]], progs:[[0,3,4,0],[0,0,3,4],[0,5,3,0]], drums:'darbuka', bass:'soft', lead:'orn', pad:true, dens:0.6, swing:0},
  techno: {bpm:[124,134], half:false, scales:[[0,3,5,7,10],[0,2,3,7,10],[0,1,3,5,7,8,10]], progs:[[0,0,0,0],[0,0,3,3],[0,5,0,5]], drums:'techno', bass:'acid', lead:'stab', pad:true, dens:0.5, swing:0},
  lofi:   {bpm:[72,90], half:false, scales:[[0,2,4,5,7,9,11],[0,2,3,5,7,9,10],[0,2,4,7,9]], progs:[[0,3,1,4],[0,5,1,4],[1,4,0,0],[0,2,5,3]], drums:'lofi', bass:'soft', lead:'keys', pad:true, seventh:true, dens:0.35, swing:0.12},
  synth:  {bpm:[98,118], half:false, scales:[[0,2,3,5,7,8,10],[0,2,4,5,7,9,11]], progs:[[0,5,3,4],[0,3,4,5],[5,3,0,4],[0,4,5,3]], drums:'synth', bass:'saw', lead:'arp', pad:true, dens:0.7, swing:0},
  hiphop: {bpm:[86,96], half:false, scales:[[0,2,3,5,7,8,10],[0,2,4,5,7,9,11],[0,3,5,7,10]], progs:[[0,3,5,4],[0,0,3,3],[0,5,1,4]], drums:'boombap', bass:'soft', lead:'keys', pad:false, seventh:true, dens:0.4, swing:0.14}
};
var TRACK_NAMES={
  trap:['Sokak Kralı','Beton Orman','Gece Devriyesi','Kara Para','Siren Sesleri','Mahalle Baskısı','Kurşun Geçirmez','Neon Karanlık','Tetikçi','Sisli Sokaklar','Taht Boş Kalmaz','Kodes Dönüşü','Son Uyarı'],
  drill:['06 Drill','Köşe Başı','Bıçak Sırtı','Gri Beton','Kapüşon','Hızlı Para','Sokak Kanunu','Zincir','Saat Üç','Karanlık Otopark','Yüz Maskesi','Duvar Yazısı','Blok 7'],
  rock:['Asfalt Ateşi','Son Benzin','Gaz Pedalı','Kırık Cam','Yüksek Voltaj','Demir Yol','Kara Gün','Gece Yarısı Sürüşü','Çelik Yumruk','İsyan','Tozlu Yollar','Motor Sesi','Şimşek'],
  arabesk:['Kader Yolu','Gecenin Sesi','Kırık Kalp','Mektup','Yalnız Şehir','Dumanlı Oda','Bir Garip Yolcu','Son Sigara','Gurbet','Küllenmiş Aşk','Çile','Yağmur Sonrası','Vefasız'],
  techno:['Klub 44','Makine Dairesi','Asit Yağmuru','Stroboskop','Alt Geçit','Bodrum Kat','Nabız','Elektrik','Devre','Sıfır Saat','Kara Kutu','Derin Bas','Yeraltı'],
  lofi:['Lo-Fi Gece','Yağmurlu Pencere','Çay Molası','Kaset','Eski Fotoğraf','Balkon','Saat Dört','Uyku Hapı','Tren Sesi','Boş Oda','Sarı Sokak Lambası','Uzak Deniz','Defter'],
  synth:['Neon 84','Gece Otobanı','Kırmızı Ufuk','Retro Sürüş','Krom','Lazer','Uzay Kedisi','Tarih 1986','Mor Gökyüzü','Siber Şehir','Son Tur','Arcade','Hologram'],
  hiphop:['Boom Bap','Eski Okul','Plak Çizgisi','Köşe Kapmaca','Mahalle Günlüğü','Kaset Çalar','Mikrofon','Beton Şiiri','Sokak Lambası','Çatı Katı','Kafiye','Cadde Yürüyüşü','Mola']
};
var STATIONS=[
  {name:'KRAL FM',genre:'trap'},{name:'DRILL 06',genre:'drill'},{name:'ROCK ARENA',genre:'rock'},{name:'ARABESK 101',genre:'arabesk'},
  {name:'KLUB 44',genre:'techno'},{name:'LO-FI GECE',genre:'lofi'},{name:'NEON 84',genre:'synth'},{name:'BOOM BAP',genre:'hiphop'}
];
var ALL_TRACKS=[];
// Parça besteleme: tohumdan tempo, ton, gam, akor dizisi, bas kalıbı, melodi motifi, davul varyasyonu
function composeTrack(genre,name,idx){
  const G=GENRE[genre]; const rng=mulberry32(seedFromString(genre+'#'+name+'#'+idx)); const r=(a,b)=>a+rng()*(b-a); const ri=(a,b)=>Math.floor(r(a,b+1)); const pk=arr=>arr[Math.floor(rng()*arr.length)];
  const t={genre,name,bpm:Math.round(r(G.bpm[0],G.bpm[1])),root:ri(40,52),scale:pk(G.scales),prog:pk(G.progs),bars:ri(40,56),kickVar:ri(0,3),hatVar:ri(0,2),motif:[],rhythm:[],bassPat:[],arpDir:rng()<0.5?1:-1,leadOct:rng()<0.3?24:12,seed:seedFromString(name)};
  let deg=ri(0,4); for(let i=0;i<8;i++){ deg=clamp(deg+pk([-2,-1,-1,0,1,1,2,3]),0,t.scale.length-1); t.motif.push(deg); }
  for(let i=0;i<16;i++) t.rhythm.push(rng()<G.dens?1:0); t.rhythm[0]=1;
  for(let i=0;i<16;i++) t.bassPat.push(i%4===0?1:(rng()<0.3?1:0));
  t.len=Math.round(t.bars*16); return t;
}
(function buildTracks(){ for(const st of STATIONS){ st.tracks=TRACK_NAMES[st.genre].map((n,i)=>composeTrack(st.genre,n,i)); ALL_TRACKS.push(...st.tracks); } STATIONS.push({name:'KARIŞIK',genre:null,tracks:ALL_TRACKS}); })();
var Radio={station:0,track:0,nextT:0,step:0,showT:0,trackIdx:0,master:null,vinyl:null};
function radioName(){ if(Radio.station===0) return 'Radyo kapalı'; const st=STATIONS[Radio.station-1]; const tr=st.tracks[Radio.track%st.tracks.length]; return st.name+' — '+tr.name; }
function radioOnEnter(){ if(Radio.station===0){ Radio.station=1; Radio.track=0; } Radio.showT=3; }
function radioNext(){ audioInit(); if(S.keys.ShiftLeft){ if(Radio.station===0) return; const st=STATIONS[Radio.station-1]; Radio.track=(Radio.track+1)%st.tracks.length; Radio.step=0; Radio.showT=3; playTone(700,0.05,0.1,'square'); return; }
  Radio.station=(Radio.station+1)%(STATIONS.length+1); const st=STATIONS[Radio.station-1]; if(st) Radio.track=Math.floor(Math.random()*st.tracks.length); Radio.step=0; Radio.showT=3; playTone(600,0.05,0.1,'square'); }
function midi(n){ return 440*Math.pow(2,(n-69)/12); }
function mbus(){ if(!Radio.master){ Radio.master=AC.createGain(); Radio.master.gain.value=0.75; const comp=AC.createDynamicsCompressor(); comp.threshold.value=-14; comp.ratio.value=4; Radio.master.connect(comp); comp.connect(AC.destination); } return Radio.master; }
// ---- enstrümanlar ----
var _nz=null; function noiseBuf(){ if(!_nz){ const n=AC.sampleRate*0.5|0; _nz=AC.createBuffer(1,n,AC.sampleRate); const d=_nz.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1; } return _nz; }
function iKick(t,vol,low){ const o=AC.createOscillator(),g=AC.createGain(); o.type='sine'; o.frequency.setValueAtTime(low?140:170,t); o.frequency.exponentialRampToValueAtTime(low?38:48,t+0.12); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.26); o.connect(g); g.connect(mbus()); o.start(t); o.stop(t+0.3); }
function i808(t,n,dur,slideTo){ const o=AC.createOscillator(),g=AC.createGain(); o.type='sine'; o.frequency.setValueAtTime(midi(n)*2.5,t); o.frequency.exponentialRampToValueAtTime(midi(n),t+0.06); if(slideTo!==undefined) o.frequency.linearRampToValueAtTime(midi(slideTo),t+dur*0.8); g.gain.setValueAtTime(0.5,t); g.gain.setValueAtTime(0.5,t+dur*0.6); g.gain.exponentialRampToValueAtTime(0.001,t+dur); const sh=AC.createWaveShaper(); const c=new Float32Array(256); for(let i=0;i<256;i++){ const x=i/128-1; c[i]=Math.tanh(x*2.2); } sh.curve=c; o.connect(sh); sh.connect(g); g.connect(mbus()); o.start(t); o.stop(t+dur+0.05); }
function iSnare(t,vol,tight){ const s=AC.createBufferSource(); s.buffer=noiseBuf(); const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=tight?2400:1700; f.Q.value=0.8; const g=AC.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+(tight?0.1:0.18)); s.connect(f); f.connect(g); g.connect(mbus()); s.start(t); s.stop(t+0.2);
  const o=AC.createOscillator(),g2=AC.createGain(); o.type='triangle'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(120,t+0.08); g2.gain.setValueAtTime(vol*0.7,t); g2.gain.exponentialRampToValueAtTime(0.001,t+0.1); o.connect(g2); g2.connect(mbus()); o.start(t); o.stop(t+0.12); }
function iClap(t,vol){ for(let i=0;i<3;i++){ const s=AC.createBufferSource(); s.buffer=noiseBuf(); const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1500; const g=AC.createGain(); const tt=t+i*0.012; g.gain.setValueAtTime(vol*(i===2?1:0.5),tt); g.gain.exponentialRampToValueAtTime(0.001,tt+(i===2?0.16:0.03)); s.connect(f); f.connect(g); g.connect(mbus()); s.start(tt); s.stop(tt+0.2); } }
function iHat(t,open,vol){ const s=AC.createBufferSource(); s.buffer=noiseBuf(); const f=AC.createBiquadFilter(); f.type='highpass'; f.frequency.value=7000; const g=AC.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+(open?0.16:0.04)); s.connect(f); f.connect(g); g.connect(mbus()); s.start(t); s.stop(t+0.2); }
function iDarbuka(t,dum,vol){ const o=AC.createOscillator(),g=AC.createGain(); o.type='sine'; o.frequency.setValueAtTime(dum?190:420,t); o.frequency.exponentialRampToValueAtTime(dum?70:300,t+0.07); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+(dum?0.22:0.08)); o.connect(g); g.connect(mbus()); o.start(t); o.stop(t+0.25); if(!dum) iHat(t,false,vol*0.5); }
function iTone(t,n,type,vol,dur,cut,att,q,det){ const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter(); o.type=type; o.frequency.value=midi(n); if(det) o.detune.value=det; f.type='lowpass'; f.frequency.value=cut; if(q) f.Q.value=q; const a=att||0.005; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+a); g.gain.setValueAtTime(vol,t+Math.max(a,dur*0.5)); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(f); f.connect(g); g.connect(mbus()); o.start(t); o.stop(t+dur+0.02); }
function iPad(t,notes,dur,bright){ for(const n of notes){ iTone(t,n,'sawtooth',0.035,dur,bright?1400:800,0.25,0.5,-7); iTone(t,n,'sawtooth',0.035,dur,bright?1400:800,0.25,0.5,7); } }
function iKeys(t,n,vol,dur){ iTone(t,n,'triangle',vol,dur,2600,0.004); iTone(t,n+12,'sine',vol*0.35,dur*0.7,3000,0.004); }
function iPower(t,n,dur){ const sh=AC.createWaveShaper(); const c=new Float32Array(256); for(let i=0;i<256;i++){ const x=i/128-1; c[i]=Math.tanh(x*3.5); } sh.curve=c; const g=AC.createGain(); g.gain.setValueAtTime(0.09,t); g.gain.setValueAtTime(0.09,t+dur*0.6); g.gain.exponentialRampToValueAtTime(0.001,t+dur); const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2200; sh.connect(f); f.connect(g); g.connect(mbus()); for(const k of [0,7,12]){ const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=midi(n+k); o.connect(sh); o.start(t); o.stop(t+dur+0.02); } }
function iAcid(t,n,dur,cut){ iTone(t,n,'sawtooth',0.14,dur,cut,0.003,9); }
// ---- adım zamanlayıcı: parça yapısı (giriş / kıta / nakarat / köprü / çıkış), akorlar, bas, davul, melodi ----
function sectionOf(bar,bars){ const p=bar/bars; if(bar<4) return 'intro'; if(p>0.92) return 'outro'; if(p>0.74 && p<0.84) return 'bridge'; const q=Math.floor((bar-4)/8); return q%2===0?'verse':'chorus'; }
function chordNotes(t,bar,G){ const deg=t.prog[bar%4]; const sc=t.scale; const n=i=>t.root+12+sc[(deg+i)%sc.length]+12*Math.floor((deg+i)/sc.length); const notes=[n(0),n(2),n(4)]; if(G.seventh) notes.push(n(6)); return notes; }
function scheduleStep(t,step,at){
  const G=GENRE[t.genre]; const s=step%16, bar=Math.floor(step/16); const sec=sectionOf(bar,t.bars); const rng=mulberry32(t.seed+bar*7919+s); const chance=p=>rng()<p;
  const spb=60/t.bpm/4; const sw=(s%2===1)?G.swing*spb:0; at+=sw;
  const deg=t.prog[bar%4]; const sc=t.scale; const rootN=t.root+sc[deg%sc.length]+12*Math.floor(deg/sc.length); const chord=chordNotes(t,bar,G);
  const drumsOn=sec!=='bridge'||s%8===0; const fill=(bar%8===7 && s>=12); const full=sec==='chorus'||sec==='bridge'; const lite=sec==='intro'||sec==='outro';
  // davul
  if(drumsOn){ const D=G.drums; const hv=lite?0.03:0.05;
    if(D==='trap'||D==='drill'){ const K=t.kickVar===0?[0,6,10]:t.kickVar===1?[0,7,10]:t.kickVar===2?[0,3,8,11]:[0,6,9,12]; if(K.includes(s)||(fill&&s%2===0&&chance(0.5))) i808(at,t.root-12+sc[deg%sc.length],spb*4,D==='drill'&&chance(0.4)?t.root-12+sc[(deg+2)%sc.length]:undefined); if(s===8||(D==='drill'&&s===14&&chance(0.3))) iClap(at,0.26); if(G.half){ if(s%2===0) iHat(at,false,hv); if(t.hatVar>0 && (s===7||s===15) && chance(0.6)){ for(let k=0;k<4;k++) iHat(at+k*spb/4,false,hv*0.8); } } else { iHat(at,false,hv); } }
    else if(D==='rock'){ const K=t.kickVar<2?[0,8,10]:[0,6,8,14]; if(K.includes(s)) iKick(at,0.5); if(s===4||s===12||(fill&&s%2===0)) iSnare(at,0.35); if(s%2===0) iHat(at,s===14,hv*1.3); }
    else if(D==='techno'){ if(s%4===0) iKick(at,0.55,true); if(s%4===2) iHat(at,true,hv*1.2); if((s===4||s===12)&&!lite) iClap(at,0.2); if(s%2===1&&full) iHat(at,false,hv*0.6); }
    else if(D==='lofi'){ const K=t.kickVar<2?[0,7,10]:[0,5,8,11]; if(K.includes(s)) iKick(at,0.35,true); if(s===4||s===12) iSnare(at,0.2,false); if(s%2===0) iHat(at,false,hv*0.7); }
    else if(D==='synth'){ if(s%4===0) iKick(at,0.5); if(s===4||s===12) iSnare(at,0.3,true); iHat(at,false,hv*(s%2?0.5:1)); }
    else if(D==='boombap'){ const K=t.kickVar<2?[0,6,10]:[0,3,8,11]; if(K.includes(s)) iKick(at,0.45,true); if(s===4||s===12||(fill&&s===14)) iSnare(at,0.33,false); if(s%2===0) iHat(at,false,hv); }
    else if(D==='darbuka'){ const P=t.kickVar<2?[1,0,2,0,2,0,1,0,0,0,2,0,1,0,2,2]:[1,0,0,2,0,2,1,0,2,0,0,2,1,0,2,0]; if(P[s]===1) iDarbuka(at,true,0.4); else if(P[s]===2) iDarbuka(at,false,0.25); if(fill&&s%2===1) iDarbuka(at,false,0.3); }
  }
  // bas
  if(!lite||s===0){ const B=G.bass; const bn=rootN-12;
    if(B==='808'||B==='808slide'){ /* 808 davulda */ }
    else if(B==='acid'){ if(s%2===0) iAcid(at,bn+(s%8===6?12:0),spb*1.6,600+1800*((s%16)/16)+(full?900:0)); }
    else if(B==='saw'){ if(t.bassPat[s]||s%8===0) iTone(at,bn,'sawtooth',0.14,spb*1.8,G.power?900:500); if(G.power && full && s%8===0) iPower(at,rootN,spb*7); }
    else { if(t.bassPat[s]) iTone(at,bn+(chance(0.2)?7:0),'triangle',0.16,spb*2.5,420,0.01); }
  }
  // pad / akor
  if(G.pad && s===0 && (full||sec==='intro'||sec==='verse'&&bar%2===0)) iPad(at,chord,spb*16,full);
  if(G.lead==='keys' && (s===0||s===8) && !lite){ for(const n of chord) iKeys(at,n,0.045,spb*6); }
  // melodi: motif akor köküne göre; nakaratta daha yoğun; arabeskte süslemeli
  const leadOn=sec==='chorus'||sec==='bridge'||(sec==='verse'&&bar%2===1)||(sec==='outro'&&bar%2===0);
  if(leadOn && t.rhythm[s] && (full||chance(0.7))){ const mi=(s>>1)%8; const d=t.motif[mi]+deg; const n=t.root+t.leadOct+sc[d%sc.length]+12*Math.floor(d/sc.length); const L=G.lead;
    if(L==='pluck') iTone(at,n,'square',0.05,spb*1.5,2600,0.003);
    else if(L==='lead') iTone(at,n,'sawtooth',0.07,spb*1.8,3200,0.01,2);
    else if(L==='stab'){ if(s%4===0) for(const c of chord) iTone(at,c+12,'sawtooth',0.03,spb*1.2,2200,0.003); }
    else if(L==='orn'){ iTone(at,n,'triangle',0.08,spb*1.9,3000,0.01); if(chance(0.5)) iTone(at+spb*0.5,n+1,'triangle',0.05,spb*0.6,3000,0.005); if(chance(0.3)) iTone(at+spb*0.25,n-1,'triangle',0.04,spb*0.5,3000,0.005); }
    else if(L==='keys') iKeys(at,n+12,0.05,spb*2.2);
    else if(L==='arp'){ const ai=(s+(t.arpDir>0?0:3))%4; const an=chord[(t.arpDir>0?ai:3-ai)%chord.length]+12; iTone(at,an,'square',0.045,spb*1.1,2800,0.003); }
  }
  if(G.lead==='arp' && full && !t.rhythm[s]){ const ai=s%4; iTone(at,chord[ai%chord.length]+12,'square',0.035,spb,2400,0.003); }
}
function radioUpdate(dt){
  Radio.showT=Math.max(0,Radio.showT-dt);
  if(!AC || Radio.station===0 || S.paused || S.dead){ Radio.nextT=0; return; }
  const st=STATIONS[Radio.station-1]; const tr=st.tracks[Radio.track%st.tracks.length]; const now=AC.currentTime; if(Radio.nextT<now) Radio.nextT=now+0.05;
  while(Radio.nextT<now+0.35){ scheduleStep(tr,Radio.step,Radio.nextT); Radio.step++; Radio.nextT+=60/tr.bpm/4;
    if(Radio.step>=tr.len){ Radio.step=0; Radio.track=(Radio.track+1)%st.tracks.length; Radio.showT=3; Radio.nextT+=0.8; } }
}
