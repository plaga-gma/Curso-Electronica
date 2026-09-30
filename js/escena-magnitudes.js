/* Módulo 2 · Lección 2 · Voltaje, corriente y resistencia
   Modo agua: dos tanques, bomba y un estrechamiento (la analogía hidráulica).
   Modo cable: resistencia de un cable real según material, largo y sección (R = ρ·L/A). */
const RHO_CABLE = { // Ω·mm²/m (equivale a 10⁻⁶ Ω·m)
  cobre:{n:'Cobre',rho:.0168,col:0xe3874f,css:'#e3874f'},
  aluminio:{n:'Aluminio',rho:.0265,col:0xb9c3cf,css:'#b9c3cf'},
  hierro:{n:'Hierro',rho:.097,col:0x7d8594,css:'#7d8594'},
  nicromo:{n:'Nicromo',rho:1.10,col:0x9aa37a,css:'#9aa37a'},
};
function initMagnitudes(){
  const S={mode:'agua', dh:2, est:2, mat:'cobre', L:2, A:1, Q:1};
  const v=M3D.makeViewer($('#stage-mag'),'magnitudes',{cam:[0,.8,15.5],target:[0,.6,0],auto:false,minD:5,maxD:35});
  let agua, cable, drops, waterL, rNarrow, wheel, impeller, lvlLbl, wire, wireGroup, eFlow=null, wireLbl=null;
  const baseY=-1.8, tankR=1.2, hR=.8;

  if(v){
    /* ---------- modo agua ---------- */
    agua=new THREE.Group(); v.scene.add(agua);
    const glass=new THREE.MeshStandardMaterial({color:0x9fe0d6,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false,roughness:.1});
    const pipe=(a,b,r=.22)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);const d=B.clone().sub(A);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),24,1,true),glass);m.position.copy(A).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());agua.add(m);return m;};
    pipe([-5.4,-1.2,0],[-5.4,3.2,0]); pipe([5.4,-1.2,0],[5.4,3.2,0]); pipe([-5.4,3.2,0],[5.4,3.2,0]);
    pipe([-5.4,-1.2,0],[-4.8,-1.2,0]); pipe([4.8,-1.2,0],[5.4,-1.2,0]);
    pipe([-2.4,-1.2,0],[-1,-1.2,0]); pipe([1,-1.2,0],[2.4,-1.2,0]);
    rNarrow=pipe([-1,-1.2,0],[1,-1.2,0],.22);
    [[-5.4,-1.2],[5.4,-1.2],[5.4,3.2],[-5.4,3.2]].forEach(([x,y])=>{const s=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),glass);s.position.set(x,y,0);agua.add(s);});
    // tanques
    const waterMat=new THREE.MeshStandardMaterial({color:0x3a9cff,transparent:true,opacity:.42,roughness:.15,depthWrite:false});
    const tank=x=>{const t=new THREE.Mesh(new THREE.CylinderGeometry(tankR,tankR,4.2,40,1,true),glass);t.position.set(x,baseY+2.1,0);agua.add(t);
      const w=new THREE.Mesh(new THREE.CylinderGeometry(tankR*.97,tankR*.97,1,40),waterMat);agua.add(w);w.position.x=x;return w;};
    waterL=tank(-3.6); const waterR=tank(3.6);
    waterR.scale.y=hR; waterR.position.y=baseY+hR/2;
    // bomba (arriba) con hélice
    const pump=new THREE.Mesh(new THREE.BoxGeometry(1.3,1,.9),new THREE.MeshStandardMaterial({color:0x2a3f7a,roughness:.5})); pump.position.set(0,3.2,0); agua.add(pump);
    impeller=new THREE.Group(); impeller.position.set(0,3.2,.47); agua.add(impeller);
    for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.7,.1,.04),new THREE.MeshStandardMaterial({color:0xffb454}));b.rotation.z=i*Math.PI/4;impeller.add(b);}
    // rueda que mide el caudal
    wheel=new THREE.Group(); wheel.position.set(1.7,-1.2,0); agua.add(wheel);
    const wm=new THREE.MeshStandardMaterial({color:0xd0d6e2,metalness:.6,roughness:.3});
    for(let i=0;i<6;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.05,.34,.3),wm);b.rotation.z=i*Math.PI/3;b.position.set(Math.sin(i*Math.PI/3)*.17,Math.cos(i*Math.PI/3)*.17,0);wheel.add(b);}
    // etiquetas
    const lab=(t,c,p,s=.34)=>{const x=M3D.textSprite(t,{size:s,color:c});x.position.set(...p);agua.add(x);return x;};
    lab('bomba = PILA','#ffcf8f',[0,4.25,0]); lab('(mantiene la diferencia de altura)','#95a1c0',[0,3.85,0],.26);
    lab('estrechamiento = RESISTENCIA','#b48cff',[-.3,-2.2,0]); lab('caudal = CORRIENTE','#56d8ff',[2.3,-.55,0],.3);
    lvlLbl=lab('diferencia de altura = VOLTAJE','#ff8593',[-3.6,2.9,0],.32);
    const P=C3D.path([[-5.4,-1.2,0],[5.4,-1.2,0],[5.4,3.2,0],[-5.4,3.2,0]],{r:.25});
    drops=C3D.flow(agua,P,{n:70,color:0x5fb8ff,r:.08,jitter:.07});

    /* ---------- modo cable ---------- */
    cable=new THREE.Group(); cable.visible=false; v.scene.add(cable);
    wireGroup=new THREE.Group(); cable.add(wireGroup);
    const tl=M3D.textSprite('Los electrones se mueven más fácil cuanto menor es la resistencia',{size:.3,color:'#95a1c0',weight:400}); tl.position.set(0,-2.6,0); cable.add(tl);

    v.ticks.push((dt,t)=>{
      if(agua.visible){
        S.Q+=((S.dh/S.est)-S.Q)*Math.min(1,dt*3);
        const rn=.22/Math.sqrt(S.est);
        const L=drops.L, base=S.Q*1.3*(M3D.reduceMotion?.4:1);
        drops.items.forEach(it=>{
          const p=it.o.position; let k=1;
          if(Math.abs(p.y+1.2)<.3 && Math.abs(p.x)<1) k=Math.min(5,(.22/rn)**2);
          else if(Math.abs(p.y+1.2)<.3 && Math.abs(Math.abs(p.x)-3.6)<1.2) k=.45;
          it.u=((it.u+base*k*dt/L)%1+1)%1; p.copy(drops.path.getPointAt(it.u)).add(it.off);
        });
        wheel.rotation.z-=S.Q*dt*5; impeller.rotation.z+=(.5+S.dh)*dt*4;
      }
      if(cable.visible && eFlow){
        const R=S.L*RHO_CABLE[S.mat].rho/S.A;
        eFlow.speed=Math.min(3,.06/R)*(M3D.reduceMotion?.4:1)+.02; eFlow.update(dt);
      }
    });
  }

  function buildWire(){
    if(!v) return;
    while(wireGroup.children.length){ const c=wireGroup.children.pop(); M3D.disposeGroup(c); }
    const m=RHO_CABLE[S.mat], len=2+S.L*.75, r=.18*Math.sqrt(S.A)+.08;
    const mat=new THREE.MeshStandardMaterial({color:m.col,metalness:.75,roughness:.3,transparent:true,opacity:.42,depthWrite:false});
    wire=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,40,1,true),mat); wire.rotation.z=Math.PI/2; wireGroup.add(wire);
    [-1,1].forEach(s=>{const cap=new THREE.Mesh(new THREE.CircleGeometry(r,40),new THREE.MeshStandardMaterial({color:m.col,metalness:.8,roughness:.3,side:THREE.DoubleSide}));cap.rotation.y=Math.PI/2;cap.position.x=s*len/2;wireGroup.add(cap);});
    // electrones dentro del cable (misma densidad: más cable = más electrones)
    const g=new THREE.Group(); wireGroup.add(g);
    const n=Math.min(260,Math.round(len*r*r*95)+8);
    const P=C3D.path([[-len/2,0,0],[len/2,0,0]],{closed:false});
    eFlow=C3D.flow(g,P,{n,r:.055,jitter:r*.8});
    const lbl=M3D.textSprite(`${m.n} · ${fmtNum(S.L,1)} m · ${fmtNum(S.A,2)} mm²`,{size:.38,color:m.css}); lbl.position.set(0,r+.7,0); wireGroup.add(lbl);
    M3D.flyTo(v,[0,1,Math.max(9,len*1.15+2)],[0,0,0],.8);
  }

  function paint(){
    $$('#mag-mode button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===S.mode));
    $$('#mag-mat button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===S.mat));
    $('#mag-agua').hidden=S.mode!=='agua'; $('#mag-cable').hidden=S.mode!=='cable';
    $('#mag-dh').value=Math.round(S.dh*10); $('#mag-dh-o').textContent=fmtNum(S.dh,1);
    $('#mag-est').value=Math.round(S.est*10); $('#mag-est-o').textContent=fmtNum(S.est,1);
    $('#mag-q').textContent=`${fmtNum(S.dh,1)} ÷ ${fmtNum(S.est,1)} = ${fmtNum(S.dh/S.est,2)}`;
    $('#mag-L').value=Math.round(S.L*2); $('#mag-L-o').textContent=fmtNum(S.L,1)+' m';
    $('#mag-A').value=String(S.A);
    const m=RHO_CABLE[S.mat], R=S.L*m.rho/S.A;
    $('#mag-R').textContent=R<1?fmtNum(R*1000,1)+' mΩ':fmtNum(R,2)+' Ω';
    $('#mag-caida').textContent=fmtNum(10*R,2)+' V';
    $('#mag-calc').textContent=`R = ${fmtNum(m.rho,4)} × ${fmtNum(S.L,1)} ÷ ${fmtNum(S.A,2)}`;
    $('#mag-title').textContent=S.mode==='agua'?'La analogía del agua':'Resistencia de un cable';
    if(!v) return;
    agua.visible=S.mode==='agua'; cable.visible=S.mode==='cable';
    const h=hR+S.dh; waterL.scale.y=h; waterL.position.y=baseY+h/2; lvlLbl.position.y=baseY+h+.5;
    const rn=.22/Math.sqrt(S.est); rNarrow.scale.set(rn/.22,1,rn/.22);
  }
  const api={ set(o){ const prevMode=S.mode; const rebuild=('mat' in o)||('L' in o)||('A' in o)||(o.mode==='cable'&&prevMode!=='cable'); Object.assign(S,o); paint(); if(rebuild&&S.mode==='cable') buildWire(); if(o.mode==='agua'&&prevMode!=='agua'&&v) M3D.flyTo(v,[0,.8,15.5],[0,.6,0],.8); } };
  $$('#mag-mode button').forEach(b=>b.onclick=()=>api.set({mode:b.dataset.v}));
  $$('#mag-mat button').forEach(b=>b.onclick=()=>api.set({mat:b.dataset.v}));
  $('#mag-dh').oninput=e=>api.set({dh:e.target.value/10});
  $('#mag-est').oninput=e=>api.set({est:e.target.value/10});
  $('#mag-L').oninput=e=>api.set({L:e.target.value/2});
  $('#mag-A').onchange=e=>api.set({A:+e.target.value});

  const pasos=[
    {t:'Una analogía con agua', do:()=>api.set({mode:'agua',dh:2,est:2}),
     p:'<p>La electricidad no se ve, pero se comporta <strong>muy parecido al agua</strong> en un circuito de cañerías.</p><p>La <strong>bomba</strong> hace el papel de la <strong>pila</strong>: mantiene el tanque izquierdo más lleno que el derecho. El agua baja por la cañería de abajo, pasa por un estrechamiento y la bomba la vuelve a subir. Las gotitas azules son como los electrones.</p>'},
    {t:'Voltaje = diferencia de presión', do:()=>api.set({mode:'agua',dh:3,est:2}),
     p:'<p>Subimos el nivel del tanque izquierdo. Más <strong>diferencia de altura</strong> → más <strong>presión</strong> → el agua corre más rápido.</p><p>En electricidad, esa presión es el <strong>voltaje</strong> (o tensión), y se mide en <strong>voltios (V)</strong>. Es el “empuje” que la pila le da a cada electrón: <strong>1 V</strong> significa 1 joule de energía por cada coulomb de carga.</p>'},
    {t:'Sin diferencia, no hay flujo', do:()=>api.set({mode:'agua',dh:0,est:2}),
     p:'<p>Con los dos tanques al mismo nivel, <strong>el agua no se mueve</strong>, aunque haya muchísima agua.</p><p>Con el voltaje pasa lo mismo: <strong>siempre se mide entre dos puntos</strong>. Un pájaro parado sobre un cable de alta tensión no se electrocuta porque sus dos patas están al mismo voltaje. Lo que importa es la <strong>diferencia</strong>.</p>'},
    {t:'Resistencia = estrechez', do:()=>api.set({mode:'agua',dh:2,est:7}),
     p:'<p>Achicamos el caño en el medio. Con la misma presión, ahora pasa <strong>mucha menos agua</strong>: el estrechamiento <strong>se opone</strong> al paso.</p><p>Eso es la <strong>resistencia</strong>, y se mide en <strong>ohmios (Ω)</strong>. En un cable viene de los choques de los electrones contra los iones que viste en el módulo 1.</p>'},
    {t:'Corriente = caudal', do:()=>api.set({mode:'agua',dh:2,est:2}),
     p:'<p>La rueda mide el <strong>caudal</strong>: cuánta agua pasa por segundo. En electricidad es la <strong>corriente</strong>, en amperes.</p><p>Fijate en el panel: <strong>caudal = presión ÷ estrechez</strong>. Si duplicás la presión, se duplica el caudal; si duplicás la estrechez, se reduce a la mitad. Esa relación, con voltaje, corriente y resistencia, es la <strong>ley de Ohm</strong> (próxima lección).</p>'},
    {t:'¿De qué depende la resistencia de un cable?', do:()=>api.set({mode:'cable',mat:'cobre',L:2,A:1}),
     p:'<p>Pasamos a un cable real. Su resistencia depende de <strong>tres cosas</strong>: el <strong>material</strong> (su resistividad ρ, que viste en el módulo 1), el <strong>largo</strong> y la <strong>sección</strong> (qué tan grueso es).</p><div class="formula" style="margin:6px 0 0">R = ρ × L ÷ A</div><p>Un cable de cobre de 2 m y 1 mm² tiene apenas <strong>0,034 Ω</strong>.</p>'},
    {t:'El material', do:()=>api.set({mode:'cable',mat:'nicromo',L:2,A:1}),
     p:'<p>El mismo cable, pero de <strong>nicromo</strong> (níquel y cromo): <strong>65 veces más resistencia</strong> que el cobre. Los electrones avanzan mucho más lento.</p><p>Por eso el nicromo se usa en lo que <strong>tiene que calentarse</strong>: resistencias de estufas, secadores de pelo y tostadoras.</p>'},
    {t:'El largo y el grosor', do:()=>api.set({mode:'cable',mat:'cobre',L:8,A:.5}),
     p:'<p>Un cable <strong>más largo</strong> tiene más resistencia (más camino con choques): el doble de largo, el doble de resistencia. Uno <strong>más grueso</strong> tiene menos (hay más “carriles” para los electrones): el doble de sección, la mitad de resistencia.</p><p>Por eso un <strong>alargue largo y finito</strong> pierde voltaje y se calienta con una pava eléctrica, y los cables de aparatos potentes son gruesos. Probá cambiar largo y sección.</p>'},
  ];
  paint();
  makeTour($('#tour-mag'),pasos,{onFinish:()=>showTab('ohm'),finishLabel:'Seguir: la ley de Ohm →'}).go(0);
}
