/* Módulo 2 · Lección 1 · El flujo de electrones
   Circuito cerrado con sentido real y convencional + tubo de bolitas (por qué la señal es instantánea). */
function initFlujo(){
  const S={mode:'circuito', on:true, ver:'real', I:1, Ivis:1};
  const v=M3D.makeViewer($('#stage-flujo'),'flujo',{cam:[0,1.2,12.5],auto:false,minD:5,maxD:30});
  let circ, tubes, F, A, bulb, swi, cnt=0, cntT=0, rate=0, uS=0;
  const tubo={full:[], one:null, drops:[], piston1:null, piston2:null, pushing:0, t:0, exit1:null, exit2:null, running:false};

  if(v){
    circ=new THREE.Group(); v.scene.add(circ);
    // lazo: baja por la pila (de + a −), sigue por abajo, sube por la derecha y vuelve por arriba
    const P=C3D.path([[-4,2.2],[-4,-2.2],[4,-2.2],[4,2.2]].map(([x,y])=>[x,y,0]),{r:.5});
    circ.add(C3D.tube(P,{radius:.09}));
    const bat=C3D.battery({len:2.2,label:'pila'}); C3D.place(bat,[-4,0,0],true); circ.add(bat);
    bulb=C3D.bulb({r:.55}); bulb.position.set(1.6,2.2,0); circ.add(bulb);
    swi=C3D.sw(); swi.position.set(-1.6,2.2,0); circ.add(swi);
    // sensor que cuenta electrones
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.32,.04,10,40),new THREE.MeshBasicMaterial({color:0x56d8ff,transparent:true,opacity:.8}));
    ring.rotation.y=Math.PI/2; ring.position.set(1.2,-2.2,0); circ.add(ring);
    const rl=M3D.textSprite('sensor: cuenta los que pasan',{size:.3,color:'#9ce6ff',weight:400}); rl.position.set(1.2,-2.85,0); circ.add(rl);
    const lp=M3D.textSprite('− sale de acá',{size:.3,color:'#7fb0ff',weight:400}); lp.position.set(-5.2,-1.6,0); circ.add(lp);
    const lm=M3D.textSprite('vuelve por acá +',{size:.3,color:'#ff8593',weight:400}); lm.position.set(-5.3,1.6,0); circ.add(lm);
    F=C3D.flow(circ,P,{n:46});
    A=C3D.arrows(circ,P,{n:12});
    // posición del sensor sobre el camino, en fracción 0–1
    let best=0,bd=1e9; for(let i=0;i<=400;i++){const d=P.getPointAt(i/400).distanceTo(ring.position); if(d<bd){bd=d;best=i/400;}} uS=best;

    /* --- tubos con bolitas --- */
    tubes=new THREE.Group(); tubes.visible=false; v.scene.add(tubes);
    const glass=new THREE.MeshStandardMaterial({color:0x9fe0d6,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false,roughness:.1});
    const mkTube=y=>{const t=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,10,32,1,true),glass);t.rotation.z=Math.PI/2;t.position.y=y;tubes.add(t);};
    mkTube(1.5); mkTube(-1.7);
    const mGeo=new THREE.SphereGeometry(.34,24,16), mMat=new THREE.MeshStandardMaterial({color:0xffb454,roughness:.35,metalness:.2,emissive:0x5a3000,emissiveIntensity:.4});
    const mk=(x,y)=>{const m=new THREE.Mesh(mGeo,mMat);m.position.set(x,y,0);tubes.add(m);return {m,x,tx:x,vy:0,fall:false};};
    for(let i=0;i<13;i++) tubo.full.push(mk(-4.5+i*.75,1.5));
    tubo.one=mk(-4.5,-1.7); tubo.one.v=0;
    const pistonMat=new THREE.MeshStandardMaterial({color:0x8aa0c8,metalness:.6,roughness:.3});
    const mkPiston=y=>{const g=new THREE.Group();const d=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.12,28),pistonMat);d.rotation.z=Math.PI/2;g.add(d);const r=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.6,12),pistonMat);r.rotation.z=Math.PI/2;r.position.x=-.8;g.add(r);g.position.set(-4.95,y,0);tubes.add(g);return g;};
    tubo.piston1=mkPiston(1.5); tubo.piston2=mkPiston(-1.7);
    const l1=M3D.textSprite('tubo LLENO de bolitas (como un cable lleno de electrones)',{size:.34,color:'#ffcf8f'}); l1.position.set(0,2.45,0); tubes.add(l1);
    const l2=M3D.textSprite('tubo VACÍO con una sola bolita',{size:.34,color:'#9fe0d6'}); l2.position.set(0,-.75,0); tubes.add(l2);
    const ls=M3D.textSprite('salida →',{size:.3,color:'#95a1c0',weight:400}); ls.position.set(5.7,0,0); tubes.add(ls);

    v.ticks.push((dt,t)=>{
      // corriente visual: sigue al objetivo (0 si el interruptor está abierto)
      const target=S.on?S.I:0; S.Ivis+=(target-S.Ivis)*Math.min(1,dt*(S.on?3:9));
      swi.userData.tick(dt);
      if(circ.visible){
        const sp=S.Ivis*1.5*(M3D.reduceMotion?.4:1);
        const before=F.items.map(it=>it.u);
        F.speed=sp; F.update(dt); A.speed=-sp; A.update(dt);
        F.items.forEach((it,k)=>{ const a=before[k], b=it.u; if(sp>0 && ((a<uS && b>=uS) || (a>b && (a<uS || b>=uS)))) cnt++; });
        cntT+=dt; if(cntT>=1){ rate=cnt/cntT; cnt=0; cntT=0; }
        bulb.userData.setLevel(S.Ivis/2.2);
      }
      if(tubes.visible) tickTubes(dt);
    });
  }

  function tickTubes(dt){
    const T=tubo;
    if(T.running) T.t+=dt;
    // tubo lleno: todas las bolitas se corren a la vez
    T.piston1.position.x+=((T.pushing>0?-4.95+.75:-4.95)-T.piston1.position.x)*Math.min(1,dt*9);
    if(T.pushing>0){ T.pushing-=dt; if(T.pushing<=0) refill(); }
    T.full.forEach(b=>{
      if(b.wait) return;
      b.x+=(b.tx-b.x)*Math.min(1,dt*9); b.m.position.x=b.x;
      if(b.m.scale.x<1) b.m.scale.setScalar(Math.min(1,b.m.scale.x+dt*4));
      if(b.x>5.05){ b.wait=true; b.m.visible=false; drop(b.m.position); if(T.exit1===null) T.exit1=T.t; }
    });
    // tubo vacío: la bolita tiene que recorrer todo el tubo
    const o=T.one;
    if(o.m.scale.x<1) o.m.scale.setScalar(Math.min(1,o.m.scale.x+dt*4));
    if(o.v>0){ o.x+=o.v*dt; o.m.position.x=o.x; T.piston2.position.x=Math.min(-4.95+.6,T.piston2.position.x+dt*4); }
    else T.piston2.position.x+=(-4.95-T.piston2.position.x)*Math.min(1,dt*6);
    if(o.x>5.05){ drop(o.m.position); o.v=0; o.x=-4.5; o.m.position.x=-4.5; o.m.scale.setScalar(.01); if(T.exit2===null) T.exit2=T.t; }
    // bolitas que salen y caen
    for(let i=T.drops.length-1;i>=0;i--){ const d=T.drops[i]; d.vy-=9*dt; d.m.position.x+=.9*dt; d.m.position.y+=d.vy*dt; if(d.m.position.y<-4.5){ tubes.remove(d.m); T.drops.splice(i,1); } }
    if(T.exit1!==null && T.exit2!==null) T.running=false;
    $('#fl-t1').textContent=T.exit1!==null?fmtNum(T.exit1,2)+' s':(T.running?'…':'—');
    $('#fl-t2').textContent=T.exit2!==null?fmtNum(T.exit2,2)+' s':(T.running?'…':'—');
  }
  function drop(pos){ const m=new THREE.Mesh(tubo.full[0].m.geometry,tubo.full[0].m.material); m.position.copy(pos); tubes.add(m); tubo.drops.push({m,vy:0}); }
  function refill(){
    // la bolita que salió vuelve a entrar por la izquierda, en el lugar que dejó el pistón
    tubo.full.forEach(b=>{ if(b.wait){ b.wait=false; b.m.visible=true; b.x=b.tx=-4.5; b.m.position.x=-4.5; b.m.scale.setScalar(.01); } });
  }
  function push(){
    if(!tubes) return; const T=tubo;
    T.t=0; T.exit1=null; T.exit2=null; T.running=true;
    T.pushing=.35; T.full.forEach(b=>{ if(!b.wait) b.tx+=.75; });
    T.one.x=-4.5; T.one.m.position.x=-4.5; T.one.m.scale.setScalar(1); T.one.v=1.9;
  }

  function paint(){
    $$('#fl-mode button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===S.mode));
    $$('#fl-ver button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===S.ver));
    $('#fl-sw').textContent=S.on?'Abrir el interruptor':'Cerrar el interruptor';
    $('#fl-i').value=Math.round(S.I*10); $('#fl-i-o').textContent=fmtNum(S.I,1)+' A';
    $('#fl-circ').hidden=S.mode!=='circuito'; $('#fl-tubo').hidden=S.mode!=='tubo';
    const I=S.on?S.I:0;
    $('#fl-e').textContent=I?sci(I*6.24e18)+' e⁻/s':'0 e⁻/s';
    $('#fl-vd').textContent=I?fmtNum(I*.0736,3)+' mm/s':'0 mm/s';
    $('#fl-state').textContent=S.on?'cerrado: circula corriente':'abierto: no circula nada';
    $('#fl-title').textContent=S.mode==='circuito'?'Circuito cerrado':'Tubos con bolitas';
    if(!v) return;
    circ.visible=S.mode==='circuito'; tubes.visible=S.mode==='tubo';
    swi.userData.set(S.on);
    F.show(S.ver!=='conv'); A.show(S.ver!=='real');
  }
  setInterval(()=>{ if(M3D.tab==='flujo' && S.mode==='circuito') $('#fl-rate').textContent=v?Math.round(rate)+' puntitos/s':'—'; },250);

  const api={ set(o){ Object.assign(S,o); paint(); }, push };
  $$('#fl-mode button').forEach(b=>b.onclick=()=>api.set({mode:b.dataset.v}));
  $$('#fl-ver button').forEach(b=>b.onclick=()=>api.set({ver:b.dataset.v}));
  $('#fl-sw').onclick=()=>api.set({on:!S.on});
  $('#fl-i').oninput=e=>api.set({I:e.target.value/10});
  $('#fl-push').onclick=push;

  const pasos=[
    {t:'Un camino cerrado', do:()=>api.set({mode:'circuito',on:true,ver:'real',I:1}),
     p:'<p>Esto es un <strong>circuito</strong>: una pila, cables, un interruptor y una lamparita, formando un <strong>camino cerrado</strong>.</p><p>Los electrones (dorados) salen del polo <strong style="color:var(--minus)">negativo</strong> de la pila, recorren el cable, atraviesan la lamparita y vuelven al polo <strong style="color:var(--plus)">positivo</strong>. Adentro de la pila, una reacción química los “bombea” de nuevo hacia el negativo. Así la vuelta nunca se corta.</p>'},
    {t:'Si el camino se abre, se detiene todo', do:()=>api.set({mode:'circuito',on:false,ver:'real'}),
     p:'<p>Abrimos el <strong>interruptor</strong>: queda un hueco de aire en el camino. Los electrones <strong>no pueden saltarlo</strong> (el aire es aislante).</p><p>Fijate que no se frenan solo los que están cerca del interruptor: <strong>se detienen todos a la vez</strong>, en todo el circuito. La corriente necesita un <strong>lazo completo</strong> para circular.</p>'},
    {t:'Sentido real: de − a +', do:()=>api.set({mode:'circuito',on:true,ver:'real'}),
     p:'<p>Los electrones tienen carga negativa, así que el polo <strong>negativo los repele</strong> y el <strong>positivo los atrae</strong>. Por fuera de la pila siempre van de <strong style="color:var(--minus)">−</strong> a <strong style="color:var(--plus)">+</strong>.</p><p>Esto se llama <strong>sentido real</strong> (o electrónico) de la corriente.</p>'},
    {t:'Sentido convencional: de + a −', do:()=>api.set({mode:'circuito',on:true,ver:'conv'}),
     p:'<p>Las flechas rojas muestran el <strong>sentido convencional</strong>: de <strong style="color:var(--plus)">+</strong> a <strong style="color:var(--minus)">−</strong>, justo al revés.</p><p>¿Por qué? Hacia 1750, Benjamin Franklin eligió esa dirección <strong>antes de que se supiera que existían los electrones</strong> (se descubrieron en 1897). La costumbre quedó: los esquemas, los símbolos y los libros usan el sentido convencional.</p>'},
    {t:'Los dos a la vez', do:()=>api.set({mode:'circuito',on:true,ver:'ambos'}),
     p:'<p>No se contradicen: una carga negativa que va hacia la derecha produce <strong>el mismo efecto</strong> que una carga positiva que va hacia la izquierda.</p><p>Para calcular, da igual cuál uses. <strong>Regla práctica:</strong> en los esquemas y cálculos usá el convencional (+ → −); cuando pienses qué pasa adentro del material, acordate de que los que se mueven son los electrones (− → +).</p>'},
    {t:'¿Cuánta corriente pasa?', do:()=>api.set({mode:'circuito',on:true,ver:'real',I:2}),
     p:'<p>La <strong>corriente</strong> es la cantidad de carga que pasa por un punto en cada segundo, como si contaras autos en un peaje. El anillo celeste es ese “contador”.</p><p>Se mide en <strong>amperes (A)</strong>. Cada puntito del dibujo representa muchísimos electrones: con <strong>1 A</strong> pasan unos <strong>6,24 trillones</strong> de electrones por segundo. Con 2 A, el doble. Mirá las lecturas del panel.</p>'},
    {t:'Lento… pero instantáneo', do:()=>{api.set({mode:'tubo'});setTimeout(push,500);},
     p:'<p>Si los electrones avanzan milímetros por hora, ¿por qué la luz se prende al instante? Mirá estos dos tubos.</p><p>Arriba, el tubo está <strong>lleno</strong>: al empujar una bolita, <strong>la del otro extremo sale en el mismo momento</strong>. Abajo, el tubo está vacío y la bolita tarda en cruzarlo. <strong>Un cable es como el tubo lleno</strong>: ya está repleto de electrones libres. Tocá “Empujar” las veces que quieras.</p>'},
    {t:'Tres velocidades distintas', do:()=>api.set({mode:'tubo'}),
     p:'<p>En un cable hay tres “velocidades” que no hay que confundir:</p><p><strong>Térmica</strong> (≈ 1.500 km/s): el zigzag al azar de cada electrón, que no lleva a ningún lado.<br><strong>De deriva</strong> (≈ 0,07 mm/s con 1 A en 1 mm²): lo que avanzan en promedio. Esa es la corriente.<br><strong>De la señal</strong> (≈ 200.000 km/s): lo rápido que viaja el “empujón” por el cable.</p>'},
  ];
  paint();
  makeTour($('#tour-flujo'),pasos,{onFinish:()=>showTab('magnitudes'),finishLabel:'Seguir: voltaje, corriente y resistencia →'}).go(0);
}
