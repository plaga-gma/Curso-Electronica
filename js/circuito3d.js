/* Taller de Electrones · piezas 3D para circuitos
   Cables con esquinas redondeadas, electrones que circulan por ellos, flechas de
   sentido convencional y componentes: pila, resistencia, lamparita, LED,
   interruptor, fusible y medidores. Todos se construyen a lo largo del eje X. */

const C3D = (() => {
  const UP = new THREE.Vector3(0,1,0);
  const V = a => new THREE.Vector3(...a);

  /* Camino por puntos, con esquinas redondeadas. closed=true lo cierra en un lazo. */
  function path(pts, {r=.35, closed=true}={}){
    const P=pts.map(V), n=P.length, cp=new THREE.CurvePath();
    const corner=i=>{
      const a=P[(i-1+n)%n], b=P[i], c=P[(i+1)%n];
      const rr=Math.min(r, a.distanceTo(b)/2.01, c.distanceTo(b)/2.01);
      return {pin:b.clone().add(a.clone().sub(b).normalize().multiplyScalar(rr)), b, pout:b.clone().add(c.clone().sub(b).normalize().multiplyScalar(rr))};
    };
    if(closed){
      const cs=P.map((_,i)=>corner(i));
      cs.forEach((c,i)=>{ cp.add(new THREE.QuadraticBezierCurve3(c.pin,c.b,c.pout)); cp.add(new THREE.LineCurve3(c.pout, cs[(i+1)%n].pin)); });
    }else{
      let prev=P[0];
      for(let i=1;i<n-1;i++){ const c=corner(i); cp.add(new THREE.LineCurve3(prev,c.pin)); cp.add(new THREE.QuadraticBezierCurve3(c.pin,c.b,c.pout)); prev=c.pout; }
      cp.add(new THREE.LineCurve3(prev,P[n-1]));
    }
    return cp;
  }
  function tube(p, {radius=.07, color=0xc9774a, opacity=1, closed=true}={}){
    const L=p.getLength();
    const m=new THREE.Mesh(new THREE.TubeGeometry(p, Math.max(40,Math.ceil(L*14)), radius, 10, closed),
      new THREE.MeshStandardMaterial({color, metalness:.7, roughness:.35, transparent:opacity<1, opacity}));
    return m;
  }

  /* Electrones que recorren un camino. speed en unidades de escena por segundo (negativo = al revés). */
  function flow(parent, p, {n=36, color=0xffb454, r=.075, jitter=.035}={}){
    const L=p.getLength(), items=[];
    for(let i=0;i<n;i++){ const o=M3D.electron(color,r); parent.add(o); items.push({o,u:i/n,off:M3D.randDir().multiplyScalar(jitter*Math.random())}); }
    const F={items, L, speed:0, path:p,
      update(dt){ const du=F.speed*dt/L; for(const it of items){ it.u=((it.u+du)%1+1)%1; it.o.position.copy(p.getPointAt(it.u)).add(it.off); } },
      show(v){ items.forEach(it=>{it.o.visible=v;}); } };
    F.update(0); return F;
  }
  /* Flechas rojas que muestran el sentido convencional de la corriente */
  const coneGeo = () => { const g=new THREE.ConeGeometry(.1,.28,14); g.userData.shared=true; return g; };
  let _cone=null;
  function arrows(parent, p, {n=10, color=0xff5a6e}={}){
    _cone=_cone||coneGeo();
    const L=p.getLength(), mat=new THREE.MeshBasicMaterial({color}), items=[];
    for(let i=0;i<n;i++){ const m=new THREE.Mesh(_cone,mat); parent.add(m); items.push({m,u:i/n}); }
    const A={items, speed:0,
      update(dt){ const du=A.speed*dt/L; for(const it of items){ it.u=((it.u+du)%1+1)%1; it.m.position.copy(p.getPointAt(it.u)); const t=p.getTangentAt(it.u); if(A.speed<0) t.negate(); it.m.quaternion.setFromUnitVectors(UP,t); } },
      show(v){ items.forEach(it=>{it.m.visible=v;}); } };
    A.update(0); return A;
  }

  /* Texto sobre un plano (para displays) */
  function display(w=1.1, h=.42){
    const c=document.createElement('canvas'); c.width=256; c.height=Math.round(256*h/w); const g=c.getContext('2d');
    const tex=new THREE.CanvasTexture(c); tex.minFilter=THREE.LinearFilter;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({map:tex}));
    let last='';
    mesh.userData.set=(txt,color='#9dffc8')=>{
      if(txt+color===last) return; last=txt+color;
      g.fillStyle='#0b1a14'; g.fillRect(0,0,c.width,c.height);
      g.fillStyle=color; g.textAlign='center'; g.textBaseline='middle';
      g.font=`600 ${Math.round(c.height*.58)}px "JetBrains Mono", Consolas, monospace`; g.fillText(txt,c.width/2,c.height/2+2);
      tex.needsUpdate=true;
    };
    mesh.userData.set('');
    return mesh;
  }

  /* ---------- componentes ---------- */
  function battery({len=1.7, label='9 V', r=.42}={}){
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len*.78,32),new THREE.MeshStandardMaterial({color:0x1d2438,metalness:.3,roughness:.5}));
    body.rotation.z=Math.PI/2; body.position.x=-len*.11; g.add(body);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len*.22,32),new THREE.MeshStandardMaterial({color:0xe3874f,metalness:.7,roughness:.3}));
    cap.rotation.z=Math.PI/2; cap.position.x=len*.39; g.add(cap);
    const nub=new THREE.Mesh(new THREE.CylinderGeometry(r*.35,r*.35,.14,20),new THREE.MeshStandardMaterial({color:0xd0d6e2,metalness:.8,roughness:.25}));
    nub.rotation.z=Math.PI/2; nub.position.x=len/2+.06; g.add(nub);
    const pl=M3D.textSprite('+',{size:.55,color:'#ff8593'}); pl.position.set(len/2-.05,r+.38,0); g.add(pl);
    const mn=M3D.textSprite('−',{size:.55,color:'#7fb0ff'}); mn.position.set(-len/2+.1,r+.38,0); g.add(mn);
    let lab=null;
    g.userData.setLabel=t=>{ if(lab){g.remove(lab);lab.material.map.dispose();lab.material.dispose();} lab=M3D.textSprite(t,{size:.42,color:'#e7ecf7'}); lab.position.set(-len*.1,-r-.42,0); g.add(lab); };
    g.userData.setLabel(label);
    return g;
  }

  const BAND_COL=[0x111111,0x7a4a24,0xd8322e,0xf07c1c,0xf2d02b,0x2e9e4a,0x2f62d8,0x8a47c9,0x8a8f99,0xf4f4f4];
  const BAND_TXT=['negro','marrón','rojo','naranja','amarillo','verde','azul','violeta','gris','blanco'];
  function bandasDe(R){ // 4 bandas: 2 dígitos + multiplicador (+ dorado)
    const e=Math.floor(Math.log10(R))-1; const d=Math.round(R/Math.pow(10,e)); return [Math.floor(d/10),d%10,e];
  }
  function resistor({len=1.1, r=.24, ohms=470}={}){
    const g=new THREE.Group();
    const bodyMat=new THREE.MeshStandardMaterial({color:0xd8c39a,roughness:.55,emissive:0x000000});
    const body=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,28),bodyMat); body.rotation.z=Math.PI/2; g.add(body);
    [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.SphereGeometry(r*1.12,24,16),bodyMat);e.scale.set(.7,1,1);e.position.x=s*len/2;g.add(e);});
    const bands=[-.3,-.14,.02,.3].map((x,i)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r*1.02,r*1.02,len*.075,28),new THREE.MeshStandardMaterial({color:i===3?0xc9a227:0x000000,metalness:i===3?.8:.1,roughness:.4}));m.rotation.z=Math.PI/2;m.position.x=x*len;g.add(m);return m;});
    const glow=new THREE.Sprite(M3D.glowMat(0xff6a2a,false)); glow.scale.set(len*2.6,len*1.6,1); glow.material.opacity=0; g.add(glow);
    g.userData.setOhms=R=>{const [a,b,m]=bandasDe(R); [a,b,m].forEach((d,i)=>bands[i].material.color.setHex(BAND_COL[Math.max(0,Math.min(9,d))]));};
    g.userData.setHeat=k=>{ k=Math.max(0,Math.min(1.4,k)); bodyMat.emissive.setRGB(k*.9,k*.28,k*.05); glow.material.opacity=Math.min(.9,k*.8); };
    g.userData.setBurnt=b=>{ bodyMat.color.setHex(b?0x2a211b:0xd8c39a); bands.forEach(x=>x.visible=!b); };
    g.userData.setOhms(ohms);
    return g;
  }
  function bulb({r=.5}={}){
    const g=new THREE.Group();
    const base=new THREE.Mesh(new THREE.CylinderGeometry(r*.42,r*.36,r*.7,24),new THREE.MeshStandardMaterial({color:0xaab3c2,metalness:.85,roughness:.3}));
    g.add(base);
    const glassMat=new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.18,roughness:.05,metalness:0,depthWrite:false,emissive:0xffc766,emissiveIntensity:0});
    const glass=new THREE.Mesh(new THREE.SphereGeometry(r,32,24),glassMat); glass.position.y=r*1.15; g.add(glass);
    const filMat=new THREE.MeshBasicMaterial({color:0x3a2a1a});
    const fil=new THREE.Mesh(new THREE.TorusGeometry(r*.28,r*.035,8,32,Math.PI),filMat); fil.position.y=r*1.05; g.add(fil);
    const glow=new THREE.Sprite(M3D.glowMat(0xffd27a,false)); glow.position.y=r*1.15; glow.scale.set(r*5,r*5,1); glow.material.opacity=0; g.add(glow);
    const light=new THREE.PointLight(0xffc766,0,8); light.position.y=r*1.2; g.add(light);
    g.userData.setLevel=k=>{ k=Math.max(0,Math.min(1.3,k)); const c=new THREE.Color(0x3a2a1a).lerp(new THREE.Color(0xfff1c9),Math.min(1,k*1.4)); filMat.color.copy(c); glassMat.emissiveIntensity=k*.5; glow.material.opacity=Math.min(1,k); light.intensity=k*1.6; };
    return g;
  }
  function led({color=0xff4d5e, r=.22}={}){
    const g=new THREE.Group();
    const col=new THREE.Color(color);
    const mat=new THREE.MeshStandardMaterial({color,transparent:true,opacity:.75,roughness:.2,emissive:color,emissiveIntensity:.05});
    const cyl=new THREE.Mesh(new THREE.CylinderGeometry(r,r,r*1.3,24),mat); cyl.position.y=r*.65; g.add(cyl);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(r,24,12,0,Math.PI*2,0,Math.PI/2),mat); dome.position.y=r*1.3; g.add(dome);
    const rim=new THREE.Mesh(new THREE.CylinderGeometry(r*1.15,r*1.15,r*.18,24),mat); rim.position.y=r*.09; g.add(rim);
    const glow=new THREE.Sprite(M3D.glowMat(col.getHex(),false)); glow.position.y=r*1.1; glow.scale.set(r*9,r*9,1); glow.material.opacity=0; g.add(glow);
    g.userData.setLevel=k=>{ k=Math.max(0,Math.min(1.2,k)); mat.emissiveIntensity=.05+k*1.2; glow.material.opacity=Math.min(1,k); };
    return g;
  }
  function sw(){
    const g=new THREE.Group();
    const base=new THREE.Mesh(new THREE.BoxGeometry(1.2,.12,.6),new THREE.MeshStandardMaterial({color:0x2a3350,roughness:.6})); base.position.y=-.14; g.add(base);
    const postM=new THREE.MeshStandardMaterial({color:0xd0d6e2,metalness:.8,roughness:.25});
    [-.45,.45].forEach(x=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.22,16),postM);p.position.set(x,0,0);g.add(p);});
    const pivot=new THREE.Group(); pivot.position.set(-.45,.1,0); g.add(pivot);
    const lever=new THREE.Mesh(new THREE.BoxGeometry(.98,.07,.14),postM); lever.position.x=.49; pivot.add(lever);
    const knob=new THREE.Mesh(new THREE.SphereGeometry(.09,16,12),new THREE.MeshStandardMaterial({color:0xff5a6e})); knob.position.x=.9; pivot.add(knob);
    let target=0;
    g.userData.set=on=>{ target=on?0:-.75; };
    g.userData.tick=dt=>{ pivot.rotation.z+=(target-pivot.rotation.z)*Math.min(1,dt*10); };
    g.userData.set(true); pivot.rotation.z=0;
    return g;
  }
  function fuse(){
    const g=new THREE.Group();
    const glass=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.9,24,1,true),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}));
    glass.rotation.z=Math.PI/2; g.add(glass);
    const capM=new THREE.MeshStandardMaterial({color:0xd0d6e2,metalness:.85,roughness:.25});
    [-1,1].forEach(s=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.2,24),capM);c.rotation.z=Math.PI/2;c.position.x=s*.5;g.add(c);});
    const wm=new THREE.MeshBasicMaterial({color:0xe7ecf7});
    const whole=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.8,8),wm); whole.rotation.z=Math.PI/2; g.add(whole);
    const stubs=[-1,1].map(s=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.25,8),wm);m.rotation.z=Math.PI/2;m.position.x=s*.28;m.visible=false;g.add(m);return m;});
    const soot=new THREE.Sprite(new THREE.SpriteMaterial({map:M3D.glowTex,color:0x000000,transparent:true,opacity:0,depthWrite:false})); soot.scale.set(.9,.6,1); g.add(soot);
    g.userData.set=blown=>{ whole.visible=!blown; stubs.forEach(s=>s.visible=blown); soot.material.opacity=blown?.7:0; };
    return g;
  }
  function meter(kind='A'){
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(1.4,.95,.36),new THREE.MeshStandardMaterial({color:kind==='A'?0x2a3f7a:0x6b2a3a,roughness:.55})); g.add(body);
    const d=display(1.12,.42); d.position.set(0,.12,.185); g.add(d);
    const t=M3D.textSprite(kind==='A'?'amperímetro':'voltímetro',{size:.2,color:'#e7ecf7',weight:400}); t.position.set(0,-.3,.2); g.add(t);
    g.userData.set=(txt,color)=>d.userData.set(txt,color);
    return g;
  }
  /* Ubica un componente sobre un tramo: pos [x,y,z], vertical=true lo gira 90° */
  function place(obj,pos,vertical=false,flip=false){ obj.position.set(...pos); if(vertical) obj.rotation.z=Math.PI/2; if(flip) obj.rotation.z+=Math.PI; return obj; }

  return {path, tube, flow, arrows, display, battery, resistor, bulb, led, sw, fuse, meter, place, bandasDe, BAND_TXT};
})();

/* Series E12 de resistencias comerciales (10 Ω a 10 kΩ) */
const E12 = (()=>{ const b=[10,12,15,18,22,27,33,39,47,56,68,82]; const out=[]; [1,10,100].forEach(m=>b.forEach(v=>out.push(v*m))); out.push(10000); return out; })();
function fmtOhm(R){ return R>=1000 ? String(+(R/1000).toFixed(2)).replace('.',',')+' kΩ' : String(+R.toFixed(1)).replace('.',',')+' Ω'; }
function fmtNum(x,d=2){ return String(+x.toFixed(d)).replace('.',','); }
function fmtA(I){ return Math.abs(I)<1 ? fmtNum(I*1000,1)+' mA' : fmtNum(I,2)+' A'; }
function fmtW(P){ return Math.abs(P)<1 ? fmtNum(P*1000,0)+' mW' : fmtNum(P,2)+' W'; }
