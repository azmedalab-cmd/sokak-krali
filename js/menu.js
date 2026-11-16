// menu.js — ana menü: oyun modu (tek / parti / yapay zekâ), harita, zorluk, dil, grafik; tohumlu dünya
var MENU={mode:'single',map:'center',diff:'hard',fx:true,code:'',joinCode:'',started:false};
var MAPS={center:{N:7},big:{N:9},small:{N:5}};
function loadPrefs(){ try{ const p=JSON.parse(localStorage.getItem('sokakkrali_prefs')||'{}'); Object.assign(MENU,p); if(p.lang) S.lang=p.lang; if(p.look && typeof S.look==='object') Object.assign(S.look,p.look); if(p.gang && p.gang.name) MENU.gang=p.gang; }catch(e){} }
function savePrefs(){ try{ localStorage.setItem('sokakkrali_prefs',JSON.stringify({mode:MENU.mode,map:MENU.map,diff:MENU.diff,fx:MENU.fx,lang:S.lang,name:MENU.name||'',look:S.look,gang:MENU.gang||null})); }catch(e){} }
function makeCode(){ const a='abcdefghjkmnpqrstuvwxyz23456789'; let s=''; for(let i=0;i<6;i++) s+=a[Math.floor(Math.random()*a.length)]; return s; }
// Tohumlu rastgele: parti kodundan ya da haritadan türetilir; aynı kod = aynı şehir
function seedFromString(str){ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function renderMenu(){
  const el=document.getElementById('menu'); const L=k=>T(k); applyLang();
  const opt=(group,val,label)=>'<button class="opt '+(MENU[group]===val?'on':'')+'" data-g="'+group+'" data-v="'+val+'">'+label+'</button>';
  let h='<h1>'+L('title')+'</h1><p class="sub">'+L('sub')+'</p>';
  h+='<div class="row"><label>'+L('mode')+'</label>'+opt('mode','single',L('single'))+opt('mode','party',L('party'))+opt('mode','ai',L('ai'))+'</div>';
  if(MENU.mode==='party'){ h+='<div class="row party"><label>'+L('partyCode')+'</label><button class="act" data-a="create">'+L('create')+'</button><span class="code">'+(MENU.code||'—')+'</span><input id="joincode" placeholder="'+L('joinHint')+'" value="'+(MENU.joinCode||'')+'" maxlength="8"><button class="act" data-a="join">'+L('join')+'</button><input id="pname" placeholder="'+L('name')+'" value="'+(MENU.name||'')+'" maxlength="12" style="width:110px"></div>'; }
  h+='<div class="row"><label>'+L('map')+'</label>'+opt('map','center',L('mapCenter'))+opt('map','big',L('mapBig'))+opt('map','small',L('mapSmall'))+'</div>';
  h+='<div class="row"><label>'+L('diff')+'</label>'+opt('diff','normal',L('normal'))+opt('diff','hard',L('hard'))+opt('diff','hardcore',L('hardcore'))+'</div>';
  h+='<div class="row"><label>'+L('lang')+'</label>'+LANG_LIST.map(([id,nm])=>'<button class="opt '+(S.lang===id?'on':'')+'" data-g="lang" data-v="'+id+'">'+nm+'</button>').join('')+'</div>';
  h+='<div class="row"><label>'+L('gfx')+'</label>'+opt('fx',true,L('fxOn'))+opt('fx',false,L('fxOff'))+'</div>';
  const hasSave=(()=>{ try{ return !!localStorage.getItem(typeof SAVE_KEY!=='undefined'?SAVE_KEY:'sokakkrali_save_v1'); }catch(e){ return false; } })();
  h+='<div class="row"><label>'+L('character')+'</label><button class="act" data-a="avatar">'+L('charEdit')+'</button><button class="act" data-a="gang">'+(MENU.gang?MENU.gang.symbol+' '+MENU.gang.name:L('createGang'))+'</button></div>';
  const isApp=/Electron/i.test(navigator.userAgent) || (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || (window.matchMedia && matchMedia('(display-mode: fullscreen)').matches);
  if(!isApp){ h+='<div class="row app">'+(MENU.installEvt?'<button class="act install" data-a="install">📲 '+({tr:'UYGULAMA OLARAK YÜKLE',en:'INSTALL AS APP',de:'ALS APP INSTALLIEREN',uk:'ВСТАНОВИТИ ЯК ДОДАТОК',es:'INSTALAR COMO APP'}[S.lang]||'UYGULAMA OLARAK YÜKLE')+'</button>':'')+'<a class="dl" href="https://github.com/azmedalab-cmd/sokak-krali/releases/latest" target="_blank" rel="noopener">⬇ '+({tr:'Windows uygulamasını indir',en:'Download the Windows app',de:'Windows-App herunterladen',uk:'Завантажити програму для Windows',es:'Descargar la app para Windows'}[S.lang]||'Windows uygulamasını indir')+'</a></div>'; }
  h+='<div class="row start"><button class="play" data-a="start">'+L('play')+(hasSave?' · '+L('continueSave'):'')+'</button></div>';
  h+='<details><summary>'+L('controls')+'</summary><div id="controlsList"></div></details>';
  el.innerHTML=h;
  el.querySelectorAll('button.opt').forEach(b=>b.addEventListener('click',()=>{ const g=b.dataset.g, v=b.dataset.v; if(g==='lang'){ S.lang=v; } else if(g==='fx'){ MENU.fx=v==='true'; } else MENU[g]=v; savePrefs(); renderMenu(); }));
  el.querySelectorAll('button.act,button.play').forEach(b=>b.addEventListener('click',()=>{ if(b.dataset.a==='create'){ MENU.code=makeCode(); MENU.joinCode=''; renderMenu(); } else if(b.dataset.a==='join'){ const v=(document.getElementById('joincode').value||'').trim().toLowerCase(); if(v.length>=4){ MENU.joinCode=v; MENU.code=v; renderMenu(); } } else if(b.dataset.a==='start'){ startFromMenu(); } else if(b.dataset.a==='avatar'){ openAvatar(); } else if(b.dataset.a==='gang'){ openGangForm(); } else if(b.dataset.a==='install'){ installApp(); } }));
  const pn=document.getElementById('pname'); if(pn){ pn.addEventListener('keydown',e=>e.stopPropagation()); pn.addEventListener('change',()=>{ MENU.name=(pn.value||'').trim().slice(0,12); savePrefs(); }); }
  const inp=document.getElementById('joincode'); if(inp) inp.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Enter'){ MENU.joinCode=(inp.value||'').trim().toLowerCase(); MENU.code=MENU.joinCode; renderMenu(); } });
  const cl=document.getElementById('controlsList'); const ov=document.getElementById('overlay'); if(cl&&ov){ const ul=ov.querySelector('ul'); if(ul) cl.innerHTML=ul.outerHTML; }
}
function startFromMenu(){
  if(MENU.started) return; const pn=document.getElementById('pname'); if(pn) MENU.name=(pn.value||'').trim().slice(0,12);
  if(MENU.mode==='party' && !MENU.name){ if(pn){ pn.classList.add('err'); pn.placeholder={tr:'Önce kullanıcı adı seç!',en:'Pick a username first!',de:'Erst Benutzernamen wählen!',uk:'Спочатку обери ім\'я!',es:'¡Elige un nombre primero!'}[S.lang]||'Önce kullanıcı adı seç!'; pn.focus(); } return; }
  MENU.started=true; S.gang=MENU.gang&&MENU.gang.name?Object.assign({},MENU.gang):null; S.playerName=MENU.name||({tr:'Oyuncu',en:'Player',de:'Spieler',uk:'Гравець',es:'Jugador'}[S.lang]||'Oyuncu'); savePrefs();
  if(MENU.mode==='party' && !MENU.code) MENU.code=makeCode();
  const N=MAPS[MENU.map].N; CITY.N=N; CITY.size=CITY.P*N; CITY.hi=CITY.size+CITY.R/2+CITY.SW;
  S.seed=seedFromString((MENU.mode==='party'?MENU.code:'solo')+'-'+MENU.map); S.diff=MENU.diff==='hardcore'?3:MENU.diff==='hard'?2:1; S.fx=!!MENU.fx;
  document.getElementById('menu').hidden=true;
  startGame();
}
function applyLang(){ const ov=document.getElementById('overlay'); if(!ov) return; const L=(typeof CONTROLS!=='undefined'&&CONTROLS[S.lang])||CONTROLS.tr; const ul=ov.querySelector('ul'); if(ul) ul.innerHTML=L.map(([k,v])=>'<li><b>'+k+'</b> '+v+'</li>').join(''); const cta=ov.querySelector('.cta'); if(cta) cta.textContent=T('clickToPlay'); const br=document.getElementById('btnResume'); if(br) br.textContent=T('resume'); const bm=document.getElementById('btnMenu'); if(bm) bm.textContent=T('mainMenu'); const h1=ov.querySelector('h1'); if(h1) h1.textContent=T('title'); const subs=ov.querySelectorAll('.sub'); if(subs[0]) subs[0].textContent=T('sub'); }
// PWA kurulumu: tarayıcı 'beforeinstallprompt' verince menüde düğme çıkar; tıklayınca kurulum penceresi açılır
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); MENU.installEvt=e; if(!MENU.started && document.getElementById('menu') && !document.getElementById('menu').hidden) renderMenu(); });
window.addEventListener('appinstalled',()=>{ MENU.installEvt=null; if(!MENU.started) renderMenu(); });
async function installApp(){ const e=MENU.installEvt; if(!e) return; try{ e.prompt(); const r=await e.userChoice; if(r && r.outcome==='accepted'){ MENU.installEvt=null; renderMenu(); } }catch(err){} }
