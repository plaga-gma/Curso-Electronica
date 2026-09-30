/* Inicio · Viaje al interior de un cable (4 escalas: cable → red → átomo → núcleo) */
function initViaje(){
  const ETAPAS=[
    {t:'Un cable de cobre', esc:'≈ 1 mm', sub:'el grosor del cable', cam:[5.5,3.8,11],
     p:'<p>Un cable común tiene dos materiales: adentro, <strong>cobre</strong>, un <strong>conductor</strong> por donde viaja la corriente; afuera, <strong>plástico</strong>, un <strong>aislante</strong> que evita que la corriente se escape o te dé una descarga.</p><p>Este módulo explica <strong>por qué uno conduce y el otro no</strong>. Tocá <em>Siguiente</em> para meterte adentro del cobre.</p>'},
    {t:'La red de átomos', esc:'≈ 1 nm', sub:'1 nanómetro = 1 millonésima de mm', cam:[7,5.5,10],
     p:'<p>Un millón de veces más cerca, el cobre ya no es “liso”: está hecho de <strong>átomos ordenados en filas</strong>, como naranjas apiladas. Eso se llama <strong>red cristalina</strong>. En 1 mm entran unos <strong>4 millones de átomos</strong> en fila.</p><p>Los puntitos dorados que se mueven entre los átomos son <strong>electrones libres</strong>. Son la clave de todo el módulo.</p>'},
    {t:'Un átomo de cobre', esc:'≈ 0,1 nm', sub:'un átomo de cobre mide ≈ 0,25 nm', cam:[0,4.5,14],
     p:'<p>Cada átomo tiene un <strong>núcleo</strong> en el centro y <strong>29 electrones</strong> alrededor, ordenados en 4 capas: 2 + 8 + 18 + 1.</p><p>El electrón de la última capa (dorado) está tan flojo que se escapa y pasa a ser uno de los <strong>electrones libres</strong> que viste recién.</p>'},
    {t:'El núcleo', esc:'≈ 10 fm', sub:'1 femtómetro = 1 billonésima de mm', cam:[0,2.5,9],
     p:'<p>En el centro hay <strong>29 protones</strong> (rojos, carga +) y unos <strong>35 neutrones</strong> (grises, sin carga), bien apretados.</p><p>El núcleo es diminuto: si el átomo fuera una <strong>cancha de fútbol</strong>, el núcleo sería una <strong>lenteja</strong> en el medio del campo. Todo lo demás es casi espacio vacío, recorrido por los electrones.</p>'},
  ];
  const v=M3D.makeViewer($('#stage-viaje'),'inicio',{cam:ETAPAS[0].cam,auto:true,minD:3,maxD:40});
  let cur=0; const G=[];

  if(v){
    const newMat=(M,opts)=>{const m=new M(Object.assign({transparent:true},opts));m.userData.base=m.opacity;return m;};
    const mkE=(core,glow,r)=>{const g=new THREE.Group();const c=new THREE.Mesh(M3D.eGeo,core);c.scale.setScalar(r);g.add(c);const s=new THREE.Sprite(glow);s.scale.set(r*7,r*7,1);g.add(s);return g;};
    const eMats=color=>[newMat(THREE.MeshBasicMaterial,{color}),newMat(THREE.SpriteMaterial,{map:M3D.glowTex,color,blending:THREE.AdditiveBlending,depthWrite:false})];
    const label=(txt,color,pos,size=.5)=>{const s=M3D.textSprite(txt,{size,color});s.position.set(...pos);s.material.userData.base=1;return s;};
    function stageGroup(){const g=new THREE.Group();g.userData={k:0,s:.12};g.visible=false;v.scene.add(g);G.push(g);return g;}
    const cuMat=()=>newMat(THREE.MeshStandardMaterial,{color:0xe3874f,metalness:.85,roughness:.28,emissive:0x3a1a08,emissiveIntensity:.4});

    /* 0 · cable */
    {
      const g=stageGroup();
      const core=new THREE.Mesh(new THREE.CylinderGeometry(1,1,12,64),cuMat()); core.rotation.z=Math.PI/2; g.add(core);
      const tip=new THREE.Mesh(new THREE.CircleGeometry(1,64),cuMat()); tip.position.x=6; tip.rotation.y=Math.PI/2; g.add(tip);
      const ins=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,8.5,64,1,true,.3,Math.PI*1.45),
        newMat(THREE.MeshStandardMaterial,{color:0x7fc7b5,roughness:.55,opacity:.9,side:THREE.DoubleSide}));
      ins.rotation.z=Math.PI/2; ins.position.x=-1.75; g.add(ins);
      g.add(label('cobre → conductor','#f2a36f',[4.2,2.1,0]));
      g.add(label('plástico → aislante','#9fe0d6',[-3.2,2.5,0]));
    }
    /* 1 · red cristalina con mar de electrones */
    const sea=[];
    {
      const g=stageGroup(); const N=5, S=1.2, o=-(N-1)/2*S;
      const aGeo=new THREE.SphereGeometry(.42,24,16); const m=cuMat();
      for(let i=0;i<N;i++)for(let j=0;j<N;j++)for(let k=0;k<N;k++){const a=new THREE.Mesh(aGeo,m);a.position.set(o+i*S,o+j*S,o+k*S);g.add(a);}
      const [c,gl]=eMats(0xffb454); const lim=-o+.4;
      for(let q=0;q<70;q++){const e=mkE(c,gl,.09);const p=new THREE.Vector3((Math.random()*2-1)*lim,(Math.random()*2-1)*lim,(Math.random()*2-1)*lim);e.position.copy(p);g.add(e);sea.push({e,p,v:M3D.randDir().multiplyScalar(1.6),lim});}
    }
    /* 2 · átomo de cobre */
    const shells=[];
    {
      const g=stageGroup(); const nuc=new THREE.Group(); g.add(nuc);
      const pm=newMat(THREE.MeshStandardMaterial,{color:0xff5a6e,roughness:.4}), nm=newMat(THREE.MeshStandardMaterial,{color:0x9aa7c7,roughness:.5});
      const sg=new THREE.SphereGeometry(.13,12,10);
      for(let i=0;i<64;i++){const d=M3D.randDir(),r=.45*Math.cbrt(Math.random());const s=new THREE.Mesh(sg,i<29?pm:nm);s.position.set(d.x*r,d.y*r,d.z*r);nuc.add(s);}
      const [ci,gi]=eMats(0x56d8ff), [cv,gv]=eMats(0xffb454);
      [2,8,18,1].forEach((n,i)=>{
        const val=i===3, r=1.3+i*1.05, sg2=new THREE.Group(); sg2.rotation.x=(i-1.5)*.3; sg2.rotation.z=i*.45; g.add(sg2);
        const ring=new THREE.Mesh(new THREE.TorusGeometry(r,val?.02:.012,8,140),newMat(THREE.MeshBasicMaterial,{color:val?0xffb454:0x56d8ff,opacity:val?.55:.25}));
        ring.rotation.x=Math.PI/2; sg2.add(ring);
        const es=[]; for(let k=0;k<n;k++){const e=mkE(val?cv:ci,val?gv:gi,val?.15:.1);sg2.add(e);es.push(e);}
        shells.push({r,es,ang:Math.random()*TAU,sp:1.1/Math.pow(i+1,.75)});
      });
      g.userData.nuc=nuc;
    }
    /* 3 · núcleo */
    {
      const g=stageGroup(); const pm=newMat(THREE.MeshStandardMaterial,{color:0xff5a6e,roughness:.35,emissive:0x5a0f18,emissiveIntensity:.5}), nm=newMat(THREE.MeshStandardMaterial,{color:0x9aa7c7,roughness:.45});
      const sg=new THREE.SphereGeometry(.5,28,20); const pts=[];
      for(let tries=0;pts.length<64&&tries<20000;tries++){const d=M3D.randDir().multiplyScalar(2.35*Math.cbrt(Math.random()));if(pts.every(p=>p.distanceTo(d)>.86))pts.push(d);}
      while(pts.length<64) pts.push(M3D.randDir().multiplyScalar(2.2));
      pts.sort((a,b)=>a.length()-b.length());
      pts.forEach((p,i)=>{const s=new THREE.Mesh(sg,(i%64)*29%64<29?pm:nm);s.position.copy(p);g.add(s);});
      const gl=new THREE.Sprite(newMat(THREE.SpriteMaterial,{map:M3D.glowTex,color:0xff5a6e,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.35}));gl.material.userData.base=.35;gl.scale.set(11,11,1);g.add(gl);
      g.add(label('protón (+)','#ff8593',[3.3,1.6,0],.42));
      g.add(label('neutrón','#b8c3dd',[-3.3,-1.8,0],.42));
    }
    // cada grupo guarda la lista de materiales para poder desvanecerlo
    G.forEach(g=>{const ms=new Set();g.traverse(o=>{if(o.material)ms.add(o.material);});g.userData.mats=[...ms];ms.forEach(m=>{if(m.userData.base===undefined)m.userData.base=m.opacity;m.transparent=true;});});

    v.ticks.push((dt,t)=>{
      G.forEach((g,i)=>{
        const u=g.userData, ts=i<cur?7:(i>cur?.12:1), tk=i===cur?1:0, f=Math.min(1,dt*3.2);
        u.s+=(ts-u.s)*f; u.k+=(tk-u.k)*f;
        g.scale.setScalar(u.s); g.visible=u.k>.01;
        if(g.visible) u.mats.forEach(m=>{m.opacity=m.userData.base*u.k;});
      });
      if(G[1].visible) for(const s of sea){ if(Math.random()<dt*3) s.v.copy(M3D.randDir()).multiplyScalar(1.2+Math.random()); s.p.addScaledVector(s.v,dt);
        ['x','y','z'].forEach(a=>{if(Math.abs(s.p[a])>s.lim){s.p[a]=Math.sign(s.p[a])*s.lim;s.v[a]*=-1;}}); s.e.position.copy(s.p); }
      if(G[2].visible){ G[2].userData.nuc.rotation.y+=dt*.3; shells.forEach(s=>{s.ang+=s.sp*dt;s.es.forEach((e,k)=>{const a=s.ang+k*TAU/s.es.length;e.position.set(Math.cos(a)*s.r,0,Math.sin(a)*s.r);});}); }
      if(G[3].visible) G[3].rotation.y+=dt*.15;
    });
  }

  function go(i){
    cur=i; const E=ETAPAS[i];
    $('#viaje-esc').textContent=E.esc; $('#viaje-sub').textContent=E.sub;
    $('#viaje-t').textContent=E.t;
    if(v){ M3D.flyTo(v,E.cam,[0,0,0],1.3); v.controls.autoRotate=v.autoBase; }
  }
  makeTour($('#tour-viaje'), ETAPAS.map((E,i)=>({t:E.t,p:E.p,do:()=>go(i)})), {onFinish:()=>showTab('atomo'), finishLabel:'Empezar la lección 1 →'}).go(0);
}
