/* Taller de Electrones · motor 3D común
   Crea los visores (Three.js), maneja el bucle de animación y ofrece
   piezas reutilizables: electrones brillantes, textos flotantes, vuelos de cámara. */

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const TAU = Math.PI * 2;

const M3D = (() => {
  const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function webglOK(){
    try{ const c=document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl')||c.getContext('experimental-webgl'))); }
    catch(e){ return false; }
  }
  const ok = typeof THREE !== 'undefined' && !!THREE.OrbitControls && webglOK();
  const viewers = [];
  let activeTab = null, last = 0, clock = 0, started = false;
  let glowTex, ringTex, eGeo;
  const glowCache = {}, coreCache = {};

  function canvasTex(draw, size=64){
    const c=document.createElement('canvas'); c.width=c.height=size; draw(c.getContext('2d'), size);
    return new THREE.CanvasTexture(c);
  }
  function init(){
    if(!ok) return;
    glowTex = canvasTex((g,s)=>{const h=s/2;const gr=g.createRadialGradient(h,h,0,h,h,h);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.22,'rgba(255,255,255,.55)');gr.addColorStop(.55,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,s,s);});
    ringTex = canvasTex((g,s)=>{g.strokeStyle='#fff';g.lineWidth=6;g.beginPath();g.arc(s/2,s/2,s*.34,0,TAU);g.stroke();});
    eGeo = new THREE.SphereGeometry(1,14,10); eGeo.userData.shared = true;
  }
  function glowMat(color, shared=true){
    if(shared && glowCache[color]) return glowCache[color];
    const m=new THREE.SpriteMaterial({map:glowTex,color,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true});
    m.userData.shared=shared; if(shared) glowCache[color]=m; return m;
  }
  function coreMat(color, shared=true){
    if(shared && coreCache[color]) return coreCache[color];
    const m=new THREE.MeshBasicMaterial({color,transparent:true});
    m.userData.shared=shared; if(shared) coreCache[color]=m; return m;
  }
  /* Un electrón: esfera + halo luminoso */
  function electron(color, r=.1, shared=true){
    const g=new THREE.Group();
    const core=new THREE.Mesh(eGeo, coreMat(color,shared)); core.scale.setScalar(r); g.add(core);
    const s=new THREE.Sprite(glowMat(color,shared)); s.scale.set(r*7,r*7,1); g.add(s);
    return g;
  }
  function holeSprite(size=.4, color=0xb48cff){
    const m=new THREE.SpriteMaterial({map:ringTex,color,transparent:true,depthWrite:false});
    const s=new THREE.Sprite(m); s.scale.set(size,size,1); return s;
  }
  /* Texto que siempre mira a la cámara */
  function textSprite(txt,{size=.42,color='#e7ecf7',weight=700,font='Atkinson Hyperlegible'}={}){
    const c=document.createElement('canvas'), g=c.getContext('2d'), fs=64;
    const f=`${weight} ${fs}px "${font}", "Segoe UI", sans-serif`; g.font=f;
    const w=Math.ceil(g.measureText(txt).width)+20; c.width=w; c.height=Math.round(fs*1.35);
    g.font=f; g.fillStyle=color; g.textBaseline='middle'; g.fillText(txt,10,c.height/2);
    const t=new THREE.CanvasTexture(c); t.minFilter=THREE.LinearFilter;
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));
    s.scale.set(size*w/c.height,size,1); return s;
  }
  function disposeGroup(g){
    g.traverse(o=>{
      if(o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
      const mats = o.material ? (Array.isArray(o.material)?o.material:[o.material]) : [];
      mats.forEach(m=>{ if(m.userData.shared) return; if(m.map && m.map!==glowTex && m.map!==ringTex) m.map.dispose(); m.dispose(); });
    });
  }
  function randDir(){const u=Math.random()*2-1,a=Math.random()*TAU,s=Math.sqrt(1-u*u);return new THREE.Vector3(s*Math.cos(a),u,s*Math.sin(a));}
  function noGL(el){
    const d=document.createElement('div'); d.className='nogl';
    d.textContent = typeof THREE==='undefined'
      ? 'No se pudo cargar el motor 3D. Revisá tu conexión a internet y recargá la página.'
      : 'Tu navegador no puede mostrar gráficos 3D (WebGL). Probá con Chrome, Edge o Firefox actualizados.';
    el.appendChild(d);
  }

  /* Crea un visor 3D dentro de un elemento. Devuelve null si no hay 3D disponible. */
  function makeViewer(el, tab, {cam=[0,4,14], target=[0,0,0], auto=true, minD=3, maxD=70}={}){
    if(!ok){ noGL(el); return null; }
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    el.prepend(renderer.domElement);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(42,1,.05,400);
    camera.position.set(...cam);
    const controls=new THREE.OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true; controls.dampingFactor=.08; controls.enablePan=false;
    controls.autoRotate=auto && !reduceMotion; controls.autoRotateSpeed=.5;
    controls.minDistance=minD; controls.maxDistance=maxD; controls.target.set(...target);
    scene.add(new THREE.AmbientLight(0xbfd0ff,.55));
    const d=new THREE.DirectionalLight(0xffffff,.9); d.position.set(5,9,7); scene.add(d);
    const p=new THREE.PointLight(0x56d8ff,.9,80); p.position.set(-8,-4,6); scene.add(p);
    const p2=new THREE.PointLight(0xffb454,.5,80); p2.position.set(8,3,-6); scene.add(p2);
    const v={el,tab,renderer,scene,camera,controls,ticks:[],fly:null,onscreen:true,autoBase:controls.autoRotate};
    const resize=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
    v.resize=resize;
    if(window.ResizeObserver) new ResizeObserver(resize).observe(el); else window.addEventListener('resize',resize);
    if(window.IntersectionObserver) new IntersectionObserver(es=>{v.onscreen=es[0].isIntersecting;}).observe(el);
    // si la persona toca la escena, se frena el giro automático
    renderer.domElement.addEventListener('pointerdown',()=>{controls.autoRotate=false;});
    resize();
    viewers.push(v);
    return v;
  }
  /* Vuelo suave de cámara */
  function flyTo(v, pos, target=[0,0,0], dur=1.2){
    if(!v) return;
    const to=new THREE.Vector3(...pos), tt=new THREE.Vector3(...target);
    if(reduceMotion){ v.camera.position.copy(to); v.controls.target.copy(tt); return; }
    v.fly={p0:v.camera.position.clone(),t0:v.controls.target.clone(),p1:to,t1:tt,k:0,dur};
  }
  const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
  /* Gráficos 2D animados (canvas): se dibujan solo cuando su pestaña está visible */
  const plots=[];
  function plot2D(canvas, tab, draw){
    const ctx=canvas.getContext('2d');
    const p={canvas,ctx,tab,draw,w:0,h:0,onscreen:true};
    const fit=()=>{const r=canvas.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);if(!r.width)return;p.w=r.width;p.h=r.height;canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);ctx.setTransform(d,0,0,d,0,0);};
    p.fit=fit;
    if(window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener('resize',fit);
    if(window.IntersectionObserver) new IntersectionObserver(es=>{p.onscreen=es[0].isIntersecting;}).observe(canvas);
    fit(); plots.push(p); return p;
  }
  function frame(dt){
    clock+=dt;
    for(const v of viewers){
      if(v.tab!==activeTab || !v.onscreen) continue;
      for(const f of v.ticks) f(dt,clock);
      if(v.fly){
        const F=v.fly; F.k=Math.min(1,F.k+dt/F.dur); const e=ease(F.k);
        v.camera.position.lerpVectors(F.p0,F.p1,e); v.controls.target.lerpVectors(F.t0,F.t1,e);
        if(F.k>=1) v.fly=null;
      }
      v.controls.update();
      v.renderer.render(v.scene,v.camera);
    }
    for(const p of plots){
      if(p.tab!==activeTab || !p.onscreen) continue;
      if(!p.w) p.fit();
      if(p.w){ p.ctx.clearRect(0,0,p.w,p.h); p.draw(p.ctx,p.w,p.h,dt,clock); }
    }
  }
  function loop(now){
    const dt=Math.min(.05,(now-last)/1000||0); last=now;
    if(!document.hidden) frame(dt);
    requestAnimationFrame(loop);
  }
  function setActive(tab){
    activeTab=tab;
    viewers.forEach(v=>{ if(v.tab===tab) v.resize(); });
    plots.forEach(p=>{ if(p.tab===tab) p.fit(); });
    if(!started){ started=true; requestAnimationFrame(t=>{last=t;loop(t);}); }
  }
  /* Avanza la simulación a mano (sirve para probar la página sin animación en pantalla) */
  function step(n=60, dt=1/60){ for(let i=0;i<n;i++) frame(dt); }
  return {ok, reduceMotion, init, makeViewer, flyTo, setActive, plot2D, step, electron, holeSprite, glowMat, coreMat, textSprite, disposeGroup, randDir,
          get eGeo(){return eGeo;}, get glowTex(){return glowTex;}, get ringTex(){return ringTex;}, get tab(){return activeTab;}};
})();

/* Formato de números científicos: 1,68 × 10⁻⁸ */
const SUP={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const sup=n=>String(n).split('').map(c=>SUP[c]||c).join('');
function sci(x){
  const e=Math.floor(Math.log10(x)); const m=x/Math.pow(10,e);
  if(e>=-1 && e<=3) return String(+x.toPrecision(3)).replace('.',',');
  const ms=m.toFixed(2).replace(/\.?0+$/,'').replace('.',',');
  return (ms==='1'?'':ms+' × ')+'10'+sup(e);
}
function rhoText(r){return Array.isArray(r)?(r[0]===r[1]?'≈ '+sci(r[0]):sci(r[0])+' a '+sci(r[1])):sci(r);}
const tempC=t=>Math.round(-200+800*t);           // deslizador 0–1 → −200 °C … 600 °C
const tempFromC=c=>(c+200)/800;
const TIPO_TXT={conductor:'conductor',semiconductor:'semiconductor',aislante:'aislante',gas:'gas noble'};

/* Recorrido guiado: pasos con título, texto y una acción sobre la escena */
function makeTour(el, steps, {onFinish, finishLabel}={}){
  let i=0;
  el.innerHTML=`<div class="tour-head"><span class="tour-k">Recorrido guiado</span><span class="tour-n"></span></div>
    <h3 class="tour-t"></h3><div class="tour-p" aria-live="polite"></div>
    <div class="tour-dots" role="group" aria-label="Pasos"></div>
    <div class="tour-nav"><button class="btn prev" type="button">← Anterior</button><button class="btn primary nxt" type="button">Siguiente →</button></div>`;
  const dots=$('.tour-dots',el);
  steps.forEach((s,k)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Paso '+(k+1)+': '+s.t);b.onclick=()=>go(k);dots.appendChild(b);});
  const prev=$('.prev',el), nxt=$('.nxt',el);
  prev.onclick=()=>go(i-1);
  nxt.onclick=()=>{ if(i===steps.length-1){ onFinish&&onFinish(); } else go(i+1); };
  function go(n){
    i=Math.max(0,Math.min(steps.length-1,n)); const s=steps[i];
    $('.tour-n',el).textContent=`Paso ${i+1} de ${steps.length}`;
    $('.tour-t',el).textContent=s.t;
    $('.tour-p',el).innerHTML=s.p;
    $$('button',dots).forEach((b,k)=>{b.className=k===i?'on':(k<i?'done':'');});
    prev.disabled=i===0;
    nxt.textContent= i===steps.length-1 ? (finishLabel||'Terminar ✓') : 'Siguiente →';
    nxt.disabled = i===steps.length-1 && !onFinish;
    try{ s.do && s.do(); }catch(e){ console.error(e); }
  }
  return {go, get i(){return i;}};
}
