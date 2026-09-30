/* Lección 3 · Conductores y aislantes: la red de átomos por dentro
   Metales: modelo de Drude (electrones libres que chocan y derivan con el voltaje).
   Aislantes y silicio: electrones en enlaces entre átomos; el silicio libera algunos con calor. */
function initMateriales(){
  const S={volt:.5,temp:tempFromC(20),mat:null,atoms:[],bonds:[],free:[],I:0};
  const voltI=$('#volt'), tempI=$('#temp');

  // botones de materiales
  const chips=$('#mat-chips');
  MATERIALES.forEach(m=>{
    const b=document.createElement('button'); b.type='button'; b.className='mchip'; b.id='mat-'+m.id; b.setAttribute('aria-pressed','false');
    b.innerHTML=`<i class="sw" style="background:${m.css}"></i>${m.n}`; b.onclick=()=>api.material(m.id); chips.appendChild(b);
  });

  const v=M3D.makeViewer($('#stage-mat'),'materiales',{cam:[4,6.5,15.5],auto:false});
  let group=null, tMinus, tPlus, arrow, arrowLbl, cylGeo;
  const NX=6,NY=3,NZ=3,SP=1.8;
  const X0=-(NX-1)/2*SP, Y0=-(NY-1)/2*SP, Z0=-(NZ-1)/2*SP;
  const xmin=X0-SP/2, xmax=-X0+SP/2, L=xmax-xmin, ylim=-Y0+.65, zlim=-Z0+.65;
  const VT=2.4, ACC=6;                       // velocidad térmica y empuje del voltaje (unidades de la escena)
  const IREF=NX*NY*NZ*ACC/3.8/L;            // corriente de la plata con voltaje al máximo = 100 %

  if(v){
    cylGeo=new THREE.CylinderGeometry(.045,.045,1,8); cylGeo.userData.shared=true;
    const tg=new THREE.BoxGeometry(.14,NY*SP+.5,NZ*SP+.5);
    tMinus=new THREE.Mesh(tg,new THREE.MeshStandardMaterial({color:0x4f8cff,emissive:0x4f8cff,emissiveIntensity:.3,transparent:true,opacity:.5})); tMinus.position.x=xmin-.45;
    tPlus=new THREE.Mesh(tg,new THREE.MeshStandardMaterial({color:0xff5a6e,emissive:0xff5a6e,emissiveIntensity:.3,transparent:true,opacity:.5})); tPlus.position.x=xmax+.45;
    v.scene.add(tMinus,tPlus);
    const lm=M3D.textSprite('− negativo',{size:.55,color:'#7fb0ff'}); lm.position.set(xmin-.45,ylim+1.2,0);
    const lp=M3D.textSprite('+ positivo',{size:.55,color:'#ff8593'}); lp.position.set(xmax+.45,ylim+1.2,0);
    v.scene.add(lm,lp);
    arrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(-2.5,ylim+1.2,0),5,0xffb454,.55,.35); v.scene.add(arrow);
    arrowLbl=M3D.textSprite('electrones →',{size:.4,color:'#ffcf8f'}); arrowLbl.position.set(0,ylim+1.75,0); v.scene.add(arrowLbl);
    v.ticks.push(tick);
  }

  function sync(){
    voltI.value=Math.round(S.volt*100); tempI.value=Math.round(S.temp*100);
    $('#volt-o').textContent=S.volt<.01?'apagado':Math.round(S.volt*100)+' %';
    $('#temp-o').textContent=tempC(S.temp)+' °C';
    if(!v) return;
    const on=S.volt>.01, carriers=S.mat&&S.mat.tipo!=='aislante';
    tMinus.material.emissiveIntensity=tPlus.material.emissiveIntensity=.15+S.volt*1.3;
    tMinus.material.opacity=tPlus.material.opacity=.3+S.volt*.5;
    arrow.visible=arrowLbl.visible=on&&carriers;
    const len=1.5+3.5*S.volt; arrow.setLength(len,.55,.35); arrow.position.x=-len/2;
  }
  voltI.oninput=()=>{S.volt=voltI.value/100;sync();};
  tempI.oninput=()=>{S.temp=tempI.value/100;sync();};

  function addFree(p){
    const o=M3D.electron(0xffb454,.11); group.add(o);
    const f={o,p:p.clone(),v:M3D.randDir().multiplyScalar(VT)}; o.position.copy(f.p); S.free.push(f); return f;
  }
  function build(m){
    if(group){ v.scene.remove(group); M3D.disposeGroup(group); }
    group=new THREE.Group(); v.scene.add(group); S.atoms=[]; S.bonds=[]; S.free=[]; S.I=0;
    const metal=m.tipo==='conductor', jit=m.tipo==='aislante'?.38:0;
    const mats=m.col.map(c=>new THREE.MeshStandardMaterial({color:c,metalness:metal?.8:.1,roughness:metal?.28:.55,emissive:c,emissiveIntensity:metal?.08:.05}));
    const aGeo=new THREE.SphereGeometry(metal?.42:.34,28,20);
    const grid=[];
    for(let i=0;i<NX;i++)for(let j=0;j<NY;j++)for(let k=0;k<NZ;k++){
      const base=new THREE.Vector3(X0+i*SP+(Math.random()-.5)*jit,Y0+j*SP+(Math.random()-.5)*jit,Z0+k*SP+(Math.random()-.5)*jit);
      const mesh=new THREE.Mesh(aGeo,mats[(i+j+k)%mats.length]); mesh.position.copy(base); group.add(mesh);
      const a={base,cur:base.clone(),mesh,ph:[Math.random()*TAU,Math.random()*TAU,Math.random()*TAU]};
      S.atoms.push(a); grid[(i*NY+j)*NZ+k]=a;
    }
    if(metal){
      const n=S.atoms.length*m.libres;
      for(let q=0;q<n;q++) addFree(new THREE.Vector3(xmin+Math.random()*L,(Math.random()*2-1)*ylim,(Math.random()*2-1)*zlim));
    }else{
      const bm=new THREE.MeshBasicMaterial({color:0x56d8ff,transparent:true,opacity:.18});
      const at=(i,j,k)=>grid[(i*NY+j)*NZ+k];
      for(let i=0;i<NX;i++)for(let j=0;j<NY;j++)for(let k=0;k<NZ;k++){
        [[i+1,j,k],[i,j+1,k],[i,j,k+1]].forEach(([a,b,c])=>{
          if(a>=NX||b>=NY||c>=NZ) return;
          const cyl=new THREE.Mesh(cylGeo,bm); group.add(cyl);
          const bond={a:at(i,j,k),b:at(a,b,c),cyl,e:[],hole:null};
          for(const side of [1,-1]){const o=M3D.electron(0x56d8ff,.085);group.add(o);bond.e.push({o,side,ph:Math.random()*TAU,w:2+Math.random()*1.5,freed:false});}
          S.bonds.push(bond);
        });
      }
    }
    sync();
  }

  const tmp=new THREE.Vector3(), dir=new THREE.Vector3(), perp=new THREE.Vector3(), UP=new THREE.Vector3(0,1,0), FW=new THREE.Vector3(0,0,1);
  function bondPoint(bd,e,t,out){
    dir.subVectors(bd.b.cur,bd.a.cur);
    perp.crossVectors(dir,Math.abs(dir.y)>.5*dir.length()?FW:UP).normalize().multiplyScalar(.13*e.side);
    return out.copy(bd.a.cur).addScaledVector(dir,.5+.24*Math.sin(t*e.w+e.ph)).add(perp);
  }
  function tick(dt,t){
    const m=S.mat; if(!m) return;
    const sp=M3D.reduceMotion?.4:1;
    // los átomos vibran más cuanto más caliente
    const amp=.015+.13*S.temp;
    for(const a of S.atoms){a.cur.set(a.base.x+Math.sin(t*13+a.ph[0])*amp,a.base.y+Math.sin(t*11.3+a.ph[1])*amp,a.base.z+Math.sin(t*12.1+a.ph[2])*amp);a.mesh.position.copy(a.cur);}
    // enlaces con sus dos electrones compartidos
    for(const bd of S.bonds){
      dir.subVectors(bd.b.cur,bd.a.cur); const len=dir.length();
      bd.cyl.position.copy(bd.a.cur).addScaledVector(dir,.5); bd.cyl.scale.set(1,len,1); bd.cyl.quaternion.setFromUnitVectors(UP,dir.normalize());
      for(const e of bd.e){ if(e.freed){e.o.visible=false;continue;} e.o.visible=true; bondPoint(bd,e,t,e.o.position); e.o.position.x+=S.volt*.28; }
      if(bd.hole) bd.hole.position.copy(bd.cyl.position);
    }
    // semiconductor: el calor suelta electrones y deja huecos
    if(m.tipo==='semiconductor'){
      const target=Math.floor(14*Math.pow(S.temp,2.2));
      if(S.free.length<target && Math.random()<dt*4){
        const cands=S.bonds.filter(b=>!b.hole); const bd=cands[Math.floor(Math.random()*cands.length)];
        if(bd){ const e=bd.e[0]; bondPoint(bd,e,t,tmp); e.freed=true; const f=addFree(tmp); f.bond=bd;
          const h=M3D.holeSprite(.42); group.add(h); bd.hole=h; }
      }else if(S.free.length>target && Math.random()<dt*3){
        const f=S.free.shift(); group.remove(f.o); const bd=f.bond; bd.e[0].freed=false; group.remove(bd.hole); bd.hole.material.dispose(); bd.hole=null;
      }
    }
    // electrones libres: cada choque los desvía al azar; el voltaje los empuja hacia +
    const coll=(m.coll||4)*(1+1.6*S.temp); let sumVx=0;
    for(const f of S.free){
      f.v.x+=S.volt*ACC*dt;
      if(Math.random()<coll*dt) f.v.copy(M3D.randDir()).multiplyScalar(VT*(.6+.7*Math.random()));
      f.p.addScaledVector(f.v,dt*sp);
      if(f.p.x>xmax) f.p.x-=L; else if(f.p.x<xmin) f.p.x+=L;
      if(Math.abs(f.p.y)>ylim){f.p.y=Math.sign(f.p.y)*ylim;f.v.y*=-1;}
      if(Math.abs(f.p.z)>zlim){f.p.z=Math.sign(f.p.z)*zlim;f.v.z*=-1;}
      f.o.position.copy(f.p); sumVx+=f.v.x;
    }
    const inst=Math.max(0,sumVx/L/IREF); S.I+=(inst-S.I)*Math.min(1,dt*1.5);
  }

  // lecturas
  setInterval(()=>{
    if(M3D.tab!=='materiales'||!S.mat) return;
    const m=S.mat, pct=(S.volt<.01||m.tipo==='aislante'||!v)?0:Math.min(140,S.I*100);
    $('#r-i').textContent=Math.round(pct)+' %';
    $('#r-meter').style.width=Math.min(100,pct)+'%';
    $('#r-free').textContent= m.tipo==='conductor' ? `${S.free.length} (${m.libres} por átomo)` : `${S.free.length} de ${S.bonds.length*2}`;
  },200);

  const api={
    material(id){
      const m=MATERIALES.find(x=>x.id===id); if(!m) return; S.mat=m;
      $$('#mat-chips .mchip').forEach(b=>b.setAttribute('aria-pressed',b.id==='mat-'+id));
      $('#mat-sym').textContent=m.n;
      $('#mat-nm').textContent=m.tipo==='conductor'?'red metálica · mar de electrones':m.tipo==='semiconductor'?'red de enlaces covalentes':'átomos enlazados · sin orden fijo';
      $('#r-tipo').innerHTML=`<span class="pill ${m.tipo}">${m.tipo}</span>`;
      $('#r-rho').textContent=rhoText(m.rho)+' Ω·m';
      $('#mat-note').textContent=m.nota;
      const ion=`<span><i class="dot" style="background:${m.css}"></i>${m.tipo==='conductor'?'Ion metálico (+)':'Átomo'}</span>`;
      $('#mat-legend').innerHTML = m.tipo==='conductor'
        ? ion+'<span><i class="dot" style="background:var(--val)"></i>Electrón libre</span>'
        : ion+'<span><i class="dot" style="background:var(--e)"></i>Electrón en un enlace</span>'+(m.tipo==='semiconductor'?'<span><i class="dot" style="background:var(--val)"></i>Electrón liberado</span><span><i class="dot ring"></i>Hueco</span>':'');
      if(v) build(m); else sync();
    },
    set(o){ if('volt' in o) S.volt=o.volt; if('temp' in o) S.temp=o.temp; sync(); },
  };
  window.verMaterial=id=>{ showTab('materiales'); api.material(id); };

  const amb=tempFromC(20), hot=tempFromC(450), cold=tempFromC(-150);
  const pasos=[
    {t:'Un metal por dentro', do:()=>{api.material('cobre');api.set({volt:0,temp:amb});},
     p:'<p>Esto es <strong>cobre</strong> visto por dentro. Las esferas grandes son <strong>iones de cobre</strong>: átomos que soltaron su electrón de valencia y quedaron con carga +. Están fijos, ordenados en una red.</p><p>Los puntos dorados son esos electrones sueltos: los <strong>electrones libres</strong>. Se mueven rapidísimo y chocan todo el tiempo, pero <strong>sin voltaje van para cualquier lado</strong>: en promedio no avanzan. Mirá el medidor: corriente 0.</p>'},
    {t:'Aplicamos voltaje', do:()=>api.set({volt:.6,temp:amb}),
     p:'<p>Conectamos una pila: un extremo <strong style="color:var(--minus)">negativo</strong> y otro <strong style="color:var(--plus)">positivo</strong>. Los electrones (−) son empujados desde el − y atraídos hacia el +.</p><p>Siguen chocando y zigzagueando, pero ahora <strong>en promedio avanzan hacia la derecha</strong>. Ese avance ordenado de cargas es la <strong>corriente eléctrica</strong>. Más voltaje, más empuje, más corriente.</p>'},
    {t:'El calor frena a los electrones', do:()=>api.set({volt:.6,temp:hot}),
     p:'<p>Subimos la temperatura a 450 °C. Los iones <strong>vibran mucho más</strong> y se cruzan en el camino de los electrones: hay <strong>más choques</strong>.</p><p>La corriente <strong>baja</strong>. Por eso, en los metales, <strong>la resistencia aumenta con la temperatura</strong>. Un cable que se calienta conduce un poco peor.</p>'},
    {t:'Un aislante: goma', do:()=>{api.material('goma');api.set({volt:.6,temp:amb});},
     p:'<p>En la <strong>goma</strong> no hay iones ni mar de electrones. Los átomos están unidos por <strong>enlaces</strong> (las barritas celestes), y cada enlace se sostiene con <strong>2 electrones compartidos</strong>.</p><p>Con voltaje, esos electrones <strong>se corren un poquito</strong> hacia el + (se llama <strong>polarización</strong>) pero <strong>no pueden irse</strong>: si se fueran, se rompería el enlace. Corriente: 0.</p>'},
    {t:'Un semiconductor: silicio', do:()=>{api.material('silicio');api.set({volt:.6,temp:amb});},
     p:'<p>El <strong>silicio</strong> también tiene sus electrones en enlaces, pero están <strong>menos sujetos</strong>. A temperatura ambiente, casi todos siguen en su lugar: conduce <strong>muy poco</strong>.</p><p>Mirá el contador de “electrones libres”: pocos o ninguno.</p>'},
    {t:'Calentemos el silicio', do:()=>api.set({volt:.6,temp:hot}),
     p:'<p>Con calor, algunos electrones <strong>ganan energía suficiente para soltarse</strong> del enlace y pasan a moverse libres (dorados). Donde estaban queda un <strong>hueco</strong> (anillo violeta), que se comporta como una carga +.</p><p>¡Al revés que en el cobre! En un semiconductor, <strong>más temperatura = más corriente</strong>. Los sensores de temperatura (termistores) aprovechan eso.</p>'},
    {t:'Frío extremo', do:()=>api.set({volt:.6,temp:cold}),
     p:'<p>A −150 °C, el silicio vuelve a atrapar a casi todos sus electrones: <strong>se comporta como aislante</strong>.</p><p>Probá vos: elegí <strong>cobre</strong> y bajá la temperatura. Vas a ver que conduce <strong>todavía mejor</strong> que a temperatura ambiente.</p>'},
    {t:'Más electrones no siempre es mejor', do:()=>{api.material('aluminio');api.set({volt:.6,temp:amb});},
     p:'<p>El <strong>aluminio</strong> aporta <strong>3 electrones libres</strong> por átomo (el cobre, 1). Pero en el aluminio chocan muchísimo más.</p><p>Resultado: conduce un poco <strong>menos</strong> que el cobre. Lo que importa es la combinación de <strong>cuántos</strong> electrones libres hay y <strong>qué tan fácil</strong> se mueven. Comparalo en el medidor con plata, cobre y oro.</p>'},
  ];
  makeTour($('#tour-mat'),pasos,{onFinish:()=>showTab('bandas'),finishLabel:'Seguir: bandas de energía →'}).go(0);
}
