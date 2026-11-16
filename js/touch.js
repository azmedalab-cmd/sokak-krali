// touch.js — mobil / dokunmatik kontroller: sol joystick (yürü / direksiyon), sağ alanda sürükleyerek bakış, ateş / nişan / zıpla / bin / koş düğmeleri ve menü kısayolları
var Touch={on:false,run:false,joy:null,look:null,ui:null,R:52};
function isTouchDevice(){ if(/[?&]touch=0/.test(location.search)) return false; if(/[?&]touch=1/.test(location.search)) return true; return ('ontouchstart' in window || navigator.maxTouchPoints>0) && /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent); }
function initTouch(){
  if(!isTouchDevice()) return; Touch.on=true; document.body.classList.add('touch');
  const ui=document.createElement('div'); ui.id='touchui'; Touch.ui=ui;
  ui.innerHTML='<div id="joyZone"><div id="joyBase"><div id="joyKnob"></div></div></div><div id="lookZone"></div>'+
    '<div id="tbtns"><button data-a="fire" class="big">ATEŞ</button><button data-a="aim">NİŞAN</button><button data-a="jump">ZIPLA<br><small>FREN</small></button><button data-a="use">E<br><small>BİN/KONUŞ</small></button><button data-a="run">KOŞ</button></div>'+
    '<div id="ttop"><button data-a="tab">SİLAH</button><button data-a="next">↻</button><button data-a="cam">KAMERA</button><button data-a="radio">RADYO</button><button data-a="shop">MAĞAZA</button><button data-a="map">HARİTA</button><button data-a="crew">ÇETE</button><button data-a="chat">💬</button><button data-a="pause">⏸</button></div>';
  document.body.appendChild(ui);
  const joyZone=ui.querySelector('#joyZone'), base=ui.querySelector('#joyBase'), knob=ui.querySelector('#joyKnob'), lookZone=ui.querySelector('#lookZone');
  const setKeys=(dx,dy)=>{ const k=S.keys; k.KeyW=dy<-0.25; k.KeyS=dy>0.25; k.KeyA=dx<-0.25; k.KeyD=dx>0.25; const mag=Math.hypot(dx,dy); k.ShiftLeft=Touch.run||mag>0.9; };
  joyZone.addEventListener('pointerdown',e=>{ if(Touch.joy) return; e.preventDefault(); try{ joyZone.setPointerCapture(e.pointerId); }catch(err){} Touch.joy={id:e.pointerId,x:e.clientX,y:e.clientY}; base.style.left=(e.clientX-Touch.R)+'px'; base.style.top=(e.clientY-Touch.R)+'px'; base.classList.add('on'); knob.style.transform='translate(0,0)'; });
  joyZone.addEventListener('pointermove',e=>{ const j=Touch.joy; if(!j||e.pointerId!==j.id) return; e.preventDefault(); let dx=(e.clientX-j.x)/Touch.R, dy=(e.clientY-j.y)/Touch.R; const m=Math.hypot(dx,dy); if(m>1){ dx/=m; dy/=m; } knob.style.transform='translate('+(dx*Touch.R*0.6)+'px,'+(dy*Touch.R*0.6)+'px)'; setKeys(dx,dy); });
  const joyEnd=e=>{ const j=Touch.joy; if(!j||e.pointerId!==j.id) return; Touch.joy=null; base.classList.remove('on'); knob.style.transform='translate(0,0)'; const k=S.keys; k.KeyW=k.KeyS=k.KeyA=k.KeyD=false; k.ShiftLeft=Touch.run; };
  joyZone.addEventListener('pointerup',joyEnd); joyZone.addEventListener('pointercancel',joyEnd);
  lookZone.addEventListener('pointerdown',e=>{ if(Touch.look) return; e.preventDefault(); try{ lookZone.setPointerCapture(e.pointerId); }catch(err){} Touch.look={id:e.pointerId,x:e.clientX,y:e.clientY}; });
  lookZone.addEventListener('pointermove',e=>{ const l=Touch.look; if(!l||e.pointerId!==l.id) return; e.preventDefault(); const dx=e.clientX-l.x, dy=e.clientY-l.y; l.x=e.clientX; l.y=e.clientY; if(S.paused) return; S.yaw-=dx*0.006; S.pitch=clamp(S.pitch+dy*0.004,-0.35,1.2); S.mouse.idle=0; if(typeof Player!=='undefined'&&Player.sway){ Player.sway.x=clamp(Player.sway.x+dx,-60,60); Player.sway.y=clamp(Player.sway.y+dy,-60,60); } });
  const lookEnd=e=>{ if(Touch.look&&e.pointerId===Touch.look.id) Touch.look=null; };
  lookZone.addEventListener('pointerup',lookEnd); lookZone.addEventListener('pointercancel',lookEnd);
  const act=(a,down)=>{ const k=S.keys;
    if(a==='fire'){ S.mouse.down=down; if(down) audioInit(); }
    else if(a==='jump'){ k.Space=down; }
    else if(!down) return;
    else if(a==='aim'){ S.mouse.rdown=!S.mouse.rdown; ui.querySelector('[data-a=aim]').classList.toggle('on',S.mouse.rdown); }
    else if(a==='run'){ Touch.run=!Touch.run; k.ShiftLeft=Touch.run; ui.querySelector('[data-a=run]').classList.toggle('on',Touch.run); }
    else if(a==='use') dispatchKey('KeyE'); else if(a==='tab') dispatchKey('Tab'); else if(a==='next') dispatchKey('WheelDown'); else if(a==='cam') dispatchKey('KeyF'); else if(a==='radio') dispatchKey('KeyR');
    else if(a==='shop') dispatchKey('KeyP'); else if(a==='map') dispatchKey('KeyM'); else if(a==='crew') dispatchKey('KeyC'); else if(a==='chat'){ if(typeof toggleChat==='function') toggleChat(true); }
    else if(a==='pause'){ if(!S.paused) pauseGame(); }
  };
  ui.querySelectorAll('button').forEach(b=>{ const a=b.dataset.a;
    b.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); b.classList.add('press'); act(a,true); });
    const up=e=>{ b.classList.remove('press'); if(a==='fire'||a==='jump') act(a,false); };
    b.addEventListener('pointerup',up); b.addEventListener('pointercancel',up); b.addEventListener('pointerleave',up);
    b.addEventListener('contextmenu',e=>e.preventDefault());
  });
  // paneller açıkken kontroller gizlenir; menüdeyken de
  Touch.tick=()=>{ const hide=S.paused || (typeof MENU!=='undefined'&&!MENU.started) || (typeof ShopUI!=='undefined'&&ShopUI.open) || (typeof BigMap!=='undefined'&&BigMap.open) || (typeof CrewUI!=='undefined'&&CrewUI.open) || (typeof AvatarUI!=='undefined'&&AvatarUI.open) || (typeof Chat!=='undefined'&&Chat.open) || S.dead || S.busted; ui.classList.toggle('hide',!!hide); ui.classList.toggle('incar',!!(typeof Player!=='undefined'&&Player.car)); };
  // ölünce / duraklayınca basılı tuşlar kalmasın
  window.addEventListener('blur',()=>{ S.mouse.down=false; Touch.joy=null; Touch.look=null; });
  // mobilde otomatik düşük grafik
  if(typeof lowGfx==='function') setTimeout(()=>{ if(S.renderer && !S.lowGfx) lowGfx(true); },500);
}
