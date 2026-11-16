// fx.js — post-işlem gölgelendiricileri: parlama (bloom), vinyet, renk düzeltme, film tanesi, kromatik sapma, hasar kızıllığı; S.fx ile açılır/kapanır (EFEKT hilesi)
var FX={ready:false,hurt:0};
function initFX(r){
  if(FX.ready) return; const pr=r.getPixelRatio(); const w=Math.floor(innerWidth*pr), h=Math.floor(innerHeight*pr);
  const lin={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat};
  FX.rt=new THREE.WebGLRenderTarget(w,h,lin); FX.rtA=new THREE.WebGLRenderTarget(Math.max(2,w>>2),Math.max(2,h>>2),lin); FX.rtB=new THREE.WebGLRenderTarget(Math.max(2,w>>2),Math.max(2,h>>2),lin);
  FX.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1); FX.scene=new THREE.Scene();
  const vs='varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }';
  FX.bright=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},threshold:{value:0.72}},vertexShader:vs,depthTest:false,depthWrite:false,fragmentShader:
    'varying vec2 vUv; uniform sampler2D tDiffuse; uniform float threshold; void main(){ vec4 c=texture2D(tDiffuse,vUv); float l=dot(c.rgb,vec3(0.299,0.587,0.114)); float m=smoothstep(threshold,threshold+0.3,l); gl_FragColor=vec4(c.rgb*m,1.0); }'});
  FX.blur=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},dir:{value:new THREE.Vector2(1,0)},res:{value:new THREE.Vector2(1,1)}},vertexShader:vs,depthTest:false,depthWrite:false,fragmentShader:
    'varying vec2 vUv; uniform sampler2D tDiffuse; uniform vec2 dir; uniform vec2 res; void main(){ vec2 o=dir/res; vec4 s=texture2D(tDiffuse,vUv)*0.227; s+=(texture2D(tDiffuse,vUv+o*1.385)+texture2D(tDiffuse,vUv-o*1.385))*0.316; s+=(texture2D(tDiffuse,vUv+o*3.23)+texture2D(tDiffuse,vUv-o*3.23))*0.07; gl_FragColor=s; }'});
  FX.comp=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},tBloom:{value:null},time:{value:0},hurt:{value:0},night:{value:0},bloomStr:{value:0.6}},vertexShader:vs,depthTest:false,depthWrite:false,fragmentShader:[
    'varying vec2 vUv; uniform sampler2D tDiffuse; uniform sampler2D tBloom; uniform float time; uniform float hurt; uniform float night; uniform float bloomStr;',
    'float rnd(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }',
    'void main(){ vec2 uv=vUv; vec2 d=uv-0.5; float r2=dot(d,d);',
    '  float ca=0.012*r2; vec3 c; c.r=texture2D(tDiffuse,uv+d*ca).r; c.g=texture2D(tDiffuse,uv).g; c.b=texture2D(tDiffuse,uv-d*ca).b;',
    '  c+=texture2D(tBloom,uv).rgb*bloomStr;',
    '  c=(c-0.5)*1.07+0.5; c*=vec3(1.04,1.0,0.95); c=mix(c,c*vec3(0.8,0.88,1.2),night*0.55);',
    '  float lum=dot(c,vec3(0.299,0.587,0.114)); c=mix(vec3(lum),c,1.14);',
    '  float v=smoothstep(0.9,0.3,r2*1.5); c*=mix(0.5,1.0,v);',
    '  c=mix(c,vec3(0.55,0.02,0.02),clamp(hurt*(1.0-v)*1.2+hurt*0.1,0.0,0.9));',
    '  c+=(rnd(uv*vec2(1920.0,1080.0)+fract(time*7.0))-0.5)*0.04;',
    '  c=max(c,0.0); c=pow(c,vec3(1.0/2.2)); gl_FragColor=vec4(c,1.0); }'].join('\n')});
  FX.comp.toneMapped=false; FX.bright.toneMapped=false; FX.blur.toneMapped=false;
  FX.quad=new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2),FX.comp); FX.quad.frustumCulled=false; FX.scene.add(FX.quad); FX.ready=true;
}
function resizeFX(r){ if(!FX.ready) return; const pr=r.getPixelRatio(); const w=Math.floor(innerWidth*pr), h=Math.floor(innerHeight*pr); FX.rt.setSize(w,h); FX.rtA.setSize(Math.max(2,w>>2),Math.max(2,h>>2)); FX.rtB.setSize(Math.max(2,w>>2),Math.max(2,h>>2)); }
function renderFX(r){
  r.setRenderTarget(FX.rt); r.render(S.scene,S.camera);
  FX.quad.material=FX.bright; FX.bright.uniforms.tDiffuse.value=FX.rt.texture; r.setRenderTarget(FX.rtA); r.render(FX.scene,FX.cam);
  FX.quad.material=FX.blur; FX.blur.uniforms.res.value.set(FX.rtA.width,FX.rtA.height);
  FX.blur.uniforms.tDiffuse.value=FX.rtA.texture; FX.blur.uniforms.dir.value.set(1,0); r.setRenderTarget(FX.rtB); r.render(FX.scene,FX.cam);
  FX.blur.uniforms.tDiffuse.value=FX.rtB.texture; FX.blur.uniforms.dir.value.set(0,1); r.setRenderTarget(FX.rtA); r.render(FX.scene,FX.cam);
  const target=(typeof Player!=='undefined' && Player.hurtT>0)?0.6:(S.dead?0.35:0); FX.hurt+=(target-FX.hurt)*Math.min(1,(S.dt||0.016)*10);
  FX.quad.material=FX.comp; const u=FX.comp.uniforms; u.tDiffuse.value=FX.rt.texture; u.tBloom.value=FX.rtA.texture; u.time.value=S.time||0; u.hurt.value=FX.hurt; u.night.value=S.night||0;
  r.setRenderTarget(null); r.render(FX.scene,FX.cam);
}
