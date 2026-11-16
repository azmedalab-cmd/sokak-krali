// radio.js — araç radyosu: Web Audio ile üretilen üç istasyon (R ile değiştir)
var STATIONS=[
  {name:'K-DRUM FM', bpm:128, root:45, scale:[0,3,5,7,10,12], kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1], lead:'square', leadP:0.45, bassP:1},
  {name:'FLASH BEAT', bpm:150, root:48, scale:[0,2,4,7,9,12], kick:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], lead:'sawtooth', leadP:0.6, bassP:1},
  {name:'LO-FI 101', bpm:84, root:50, scale:[0,2,3,7,10,12,14], kick:[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0], lead:'triangle', leadP:0.35, bassP:0.5}
];
var Radio={station:0, nextT:0, step:0, showT:0, bassNote:0, leadNote:2};
function radioName(){ return Radio.station===0?'Radyo kapalı':STATIONS[Radio.station-1].name; }
function radioOnEnter(){ if(Radio.station===0) Radio.station=1; Radio.showT=3; Radio.step=0; }
function radioNext(){ if(!Player.car) return; Radio.station=(Radio.station+1)%(STATIONS.length+1); Radio.showT=3; playTone(600,0.05,0.1,'square'); }
function midi(n){ return 440*Math.pow(2,(n-69)/12); }
function rKick(t){ const o=AC.createOscillator(), g=AC.createGain(); o.type='sine'; o.frequency.setValueAtTime(160,t); o.frequency.exponentialRampToValueAtTime(42,t+0.14); g.gain.setValueAtTime(0.45,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.22); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+0.25); }
var _hatBuf=null;
function rHat(t,open){ if(!_hatBuf){ const n=AC.sampleRate*0.12|0; _hatBuf=AC.createBuffer(1,n,AC.sampleRate); const d=_hatBuf.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1; }
  const s=AC.createBufferSource(); s.buffer=_hatBuf; const f=AC.createBiquadFilter(); f.type='highpass'; f.frequency.value=6000; const g=AC.createGain(); g.gain.setValueAtTime(open?0.06:0.035,t); g.gain.exponentialRampToValueAtTime(0.001,t+(open?0.12:0.04)); s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t); }
function rNote(t,n,type,vol,dur,cut){ const o=AC.createOscillator(), g=AC.createGain(), f=AC.createBiquadFilter(); o.type=type; o.frequency.value=midi(n); f.type='lowpass'; f.frequency.value=cut; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur); o.connect(f); f.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+dur+0.02); }
function scheduleStep(st,step,t){
  const s=step%16;
  if(st.kick[s]) rKick(t);
  if(s%2===1) rHat(t,s%8===7); else if(s%4===2 && st.bpm>100) rHat(t,false);
  if(s%4===0 && Math.random()<st.bassP){ if(Math.random()<0.4) Radio.bassNote=randi(0,2); rNote(t,st.root+st.scale[Radio.bassNote],'sawtooth',0.11,0.25,320); }
  if(s%2===0 && Math.random()<st.leadP){ Radio.leadNote=clamp(Radio.leadNote+randi(-2,2),0,st.scale.length-1); rNote(t,st.root+12+st.scale[Radio.leadNote],st.lead,0.045,0.2,2200); }
  if(s===0 && Math.random()<0.5) rNote(t,st.root+24+st.scale[Radio.leadNote],'triangle',0.03,0.6,1800);
}
function radioUpdate(dt){
  Radio.showT=Math.max(0,Radio.showT-dt);
  if(!AC || !Player.car || Radio.station===0 || S.paused || S.dead){ Radio.nextT=0; return; }
  const st=STATIONS[Radio.station-1], now=AC.currentTime; if(Radio.nextT<now) Radio.nextT=now+0.05;
  while(Radio.nextT<now+0.3){ scheduleStep(st,Radio.step,Radio.nextT); Radio.step++; Radio.nextT+=60/st.bpm/4; }
}
