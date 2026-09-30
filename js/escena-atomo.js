/* Lección 1 · El átomo: núcleo, capas, electrones de valencia, escudo e iones */
function initAtomo(){
  const S={idx:ELEMENTOS.findIndex(e=>e.s==='Cu'), solo:false, ion:false, shield:false, focus:'todo', ionT:0};
  const v=M3D.makeViewer($('#stage-atomo'),'atomo',{cam:[0,5,16]});
  let group=null, nucleus=null, shells=[], shieldGrp=null, R=1;
  const pGeo = v ? new THREE.SphereGeometry(.2,16,12) : null;

  // botones de elementos
  const chips=$('#el-chips');
  ELEMENTOS.forEach((e,i)=>{
    const b=document.createElement('button'); b.type='button'; b.className='cell'; b.id='el-'+e.s; b.setAttribute('aria-pressed','false');
    b.innerHTML=`<span class="z">${e.z}</span><span class="s">${e.s}</span><span class="t">${e.n}</span>`;
    b.onclick=()=>api.select(e.s); chips.appendChild(b);
  });
  $('#solo-val').onchange=e=>api.set({solo:e.target.checked});
  $('#escudo').onchange=e=>api.set({shield:e.target.checked});
  $('#btn-ion').onclick=()=>api.set({ion:!S.ion});

  const shellR=i=>1.35+R*.7+i*1.05;

  function build(){
    const el=ELEMENTOS[S.idx];
    if(group){ v.scene.remove(group); M3D.disposeGroup(group); }
    group=new THREE.Group(); v.scene.add(group); shells=[];
    const A=el.a, Z=el.z, N=A-Z; R=.24*Math.cbrt(A);
    nucleus=new THREE.Group(); group.add(nucleus);
    const prot=new THREE.InstancedMesh(pGeo,new THREE.MeshStandardMaterial({color:0xff5a6e,roughness:.35,metalness:.1,emissive:0x5a0f18,emissiveIntensity:.6}),Z);
    const neu=N>0?new THREE.InstancedMesh(pGeo,new THREE.MeshStandardMaterial({color:0x9aa7c7,roughness:.5}),N):null;
    const m=new THREE.Matrix4(); let pi=0, ni=0;
    for(let i=0;i<A;i++){
      const d=M3D.randDir(), r=A===1?0:R*Math.cbrt(Math.random()); m.makeTranslation(d.x*r,d.y*r,d.z*r);
      if(pi<Z && (ni>=N || Math.random()<Z/A)) prot.setMatrixAt(pi++,m); else neu.setMatrixAt(ni++,m);
    }
    prot.frustumCulled=false; if(neu) neu.frustumCulled=false;
    nucleus.add(prot); if(neu) nucleus.add(neu);
    const ng=new THREE.Sprite(M3D.glowMat(0xff5a6e,false)); ng.material.opacity=.5; ng.scale.setScalar(R*6+1.2); nucleus.add(ng);

    const n=el.capas.length;
    el.capas.forEach((cnt,i)=>{
      const val=i===n-1, r=shellR(i);
      const g=new THREE.Group(); g.rotation.x=(i-(n-1)/2)*.28+(i%2?.18:-.12); g.rotation.z=i*.42; group.add(g);
      const color=val?0xffb454:0x56d8ff;
      const ringMat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:val?.55:.22}); ringMat.userData.base=ringMat.opacity;
      const ring=new THREE.Mesh(new THREE.TorusGeometry(r,val?.018:.012,8,160),ringMat); ring.rotation.x=Math.PI/2; g.add(ring);
      const core=M3D.coreMat(color,false), glow=M3D.glowMat(color,false); core.userData.base=1; glow.userData.base=val?1:.8; glow.opacity=glow.userData.base;
      const es=[];
      for(let k=0;k<cnt;k++){
        // el último electrón de valencia tiene materiales propios para poder “irse” (ion)
        const leaver = val && k===cnt-1;
        const c2 = leaver ? M3D.coreMat(0xffb454,false) : core, g2 = leaver ? M3D.glowMat(0xffb454,false) : glow;
        if(leaver){ c2.userData.base=1; g2.userData.base=1; }
        const eg=new THREE.Group(); const c=new THREE.Mesh(M3D.eGeo,c2); const rr=val?.15:.1; c.scale.setScalar(rr); eg.add(c);
        const s=new THREE.Sprite(g2); s.scale.set(rr*(val?9:6),rr*(val?9:6),1); eg.add(s); g.add(eg);
        es.push({o:eg,leaver,mats:leaver?[c2,g2]:null});
      }
      shells.push({g,r,es,val,ang:Math.random()*TAU,speed:1.1/Math.pow(i+1,.75),mats:[ringMat,core,glow]});
    });

    // escudo: esfera translúcida que envuelve las capas internas
    shieldGrp=new THREE.Group(); group.add(shieldGrp);
    if(n>=2){
      const rs=shellR(n-2)+.3;
      const sm=new THREE.MeshPhongMaterial({color:0x56d8ff,transparent:true,opacity:.12,shininess:90,depthWrite:false,side:THREE.DoubleSide});
      shieldGrp.add(new THREE.Mesh(new THREE.SphereGeometry(rs,48,32),sm));
      const wf=new THREE.Mesh(new THREE.SphereGeometry(rs+.01,24,16),new THREE.MeshBasicMaterial({color:0x56d8ff,wireframe:true,transparent:true,opacity:.07}));
      shieldGrp.add(wf);
      const lb=M3D.textSprite(`escudo: ${el.z-el.capas[n-1]} electrones internos`,{size:.42,color:'#9ce6ff'}); lb.position.set(0,rs+.55,0); shieldGrp.add(lb);
    }
    shieldGrp.visible=S.shield;
    applyDim();
  }

  function applyDim(){
    shells.forEach(s=>{
      const o = S.focus==='nucleo' ? .1 : (S.solo && !s.val ? .07 : 1);
      s.mats.forEach(m=>{ m.opacity=o*(m.userData.base??1); });
    });
    if(shieldGrp) shieldGrp.visible=S.shield;
  }

  if(v) v.ticks.push(dt=>{
    if(nucleus) nucleus.rotation.y+=dt*.25;
    const target=S.ion?1:0; S.ionT+=(target-S.ionT)*Math.min(1,dt*1.4);
    shells.forEach((s,i)=>{
      s.ang+=s.speed*dt*(M3D.reduceMotion?.3:1);
      s.es.forEach((e,k)=>{
        const a=s.ang+k*TAU/s.es.length;
        let r=s.r;
        if(e.leaver){
          r=s.r*(1+S.ionT*3.2);
          const o=Math.max(0,1-S.ionT*1.15)*(S.focus==='nucleo'?.1:1);
          e.mats.forEach(m=>{m.opacity=o;}); e.o.visible=o>.02;
        }
        e.o.position.set(Math.cos(a)*r,0,Math.sin(a)*r);
      });
      s.g.rotation.y+=dt*.04*(i%2?1:-1);
    });
  });

  function camFor(){
    const n=ELEMENTOS[S.idx].capas.length, outer=shellR(n-1);
    if(S.focus==='nucleo') return [0,R*2.2+.8,R*6+2.4];
    const d=outer*2.6+5; return [0,d*.3,d];
  }
  function paintInfo(){
    const el=ELEMENTOS[S.idx], n=el.capas.length, val=el.capas[n-1];
    $$('#el-chips .cell').forEach(b=>b.setAttribute('aria-pressed',b.id==='el-'+el.s));
    $('#at-sym').textContent=el.s+(S.ion?'⁺':'');
    $('#at-nm').textContent=`${el.n} · Z = ${el.z}${S.ion?' · ion positivo':''}`;
    const e=el.z-(S.ion?1:0), q=el.z-e;
    $('#at-info').innerHTML=`<h3>${el.n} <span class="pill ${el.tipo}">${TIPO_TXT[el.tipo]}</span></h3>
      <div class="shellbar" aria-label="Electrones por capa"><em>capas</em>${el.capas.map((c,j)=>`<span class="${j===n-1?'v':''}">${j===n-1&&S.ion?c-1:c}</span>`).join('')}</div>
      <div class="charge">
        <div><div class="k">Protones</div><div class="v" style="color:var(--plus)">+${el.z}</div></div>
        <div><div class="k">Electrones</div><div class="v" style="color:var(--e)">−${e}</div></div>
        <div><div class="k">Carga total</div><div class="v">${q===0?'0':'+'+q}</div></div>
      </div>
      <p>${S.ion?`<strong>Ahora es un ion positivo (${el.s}⁺):</strong> perdió un electrón, así que sobra un protón sin compensar.`:`<strong style="color:var(--val)">${val} electrón${val>1?'es':''} de valencia.</strong> ${el.txt}`}</p>`;
    $('#btn-ion').textContent=S.ion?'Devolverle el electrón':'Arrancarle un electrón de valencia';
    $('#solo-val').checked=S.solo; $('#escudo').checked=S.shield;
    $('#escudo').disabled=n<2;
  }

  const api={
    select(sym){ const i=ELEMENTOS.findIndex(e=>e.s===sym); if(i<0) return; S.idx=i; S.ion=false; S.ionT=0; if(v){ build(); M3D.flyTo(v,camFor()); } paintInfo(); },
    set(o){ const refocus=('focus' in o)&&o.focus!==S.focus; Object.assign(S,o); if(ELEMENTOS[S.idx].capas.length<2) S.shield=false; applyDim(); paintInfo(); if(v&&refocus) M3D.flyTo(v,camFor()); },
  };

  const pasos=[
    {t:'El núcleo: la parte positiva', do:()=>{api.select('Cu');api.set({focus:'nucleo',solo:false,shield:false,ion:false});},
     p:'<p>Empezamos por el centro de un átomo de <strong>cobre</strong>. Ese grupito es el <strong>núcleo</strong>: tiene <strong style="color:var(--plus)">29 protones</strong> (rojos, carga +) y unos 35 <strong>neutrones</strong> (grises, sin carga).</p><p>La cantidad de protones define qué elemento es: 29 protones = cobre, siempre. Se llama <strong>número atómico (Z)</strong>.</p>'},
    {t:'Los electrones se ordenan en capas', do:()=>api.set({focus:'todo',solo:false,shield:false,ion:false}),
     p:'<p>Alrededor giran <strong style="color:var(--e)">29 electrones</strong> (carga −), uno por cada protón. Por eso el átomo completo es <strong>neutro</strong>: +29 − 29 = 0.</p><p>Se reparten en <strong>capas</strong>, y cada capa tiene lugares limitados: <strong>2, 8, 18, 32…</strong> Cuando una se llena, los que sobran van a la siguiente. En el cobre: 2 + 8 + 18 + <strong style="color:var(--val)">1</strong>.</p>'},
    {t:'¿Por qué no se escapan?', do:()=>api.set({focus:'todo',solo:false,shield:false,ion:false}),
     p:'<p>Porque <strong>las cargas opuestas se atraen</strong>: el núcleo (+) tira de los electrones (−). Las cargas iguales, en cambio, se repelen.</p><p>Esa atracción es más fuerte <strong>cuanto más cerca</strong> está el electrón. Los de las capas internas están bien sujetos y nunca participan de la corriente.</p>'},
    {t:'Los electrones de valencia', do:()=>api.set({focus:'todo',solo:true,shield:false,ion:false}),
     p:'<p>Los electrones de la <strong style="color:var(--val)">última capa</strong> se llaman <strong>electrones de valencia</strong>. Son los más lejanos, los que se unen con otros átomos y los que pueden soltarse.</p><p>El cobre tiene <strong>uno solo</strong>. Ese electrón decide que el cobre sea conductor.</p>'},
    {t:'El escudo de electrones internos', do:()=>api.set({focus:'todo',solo:true,shield:true,ion:false}),
     p:'<p>Entre el núcleo y el electrón de valencia hay <strong>28 electrones internos</strong> (la burbuja celeste). Como son negativos, lo empujan hacia afuera y <strong>tapan casi toda la atracción</strong> de los 29 protones.</p><p>Resultado: el electrón de valencia siente una atracción muy débil. <strong>Está flojo.</strong></p>'},
    {t:'Si se va, queda un ion', do:()=>api.set({focus:'todo',solo:true,shield:false,ion:true}),
     p:'<p>Con muy poca energía, ese electrón se escapa. El átomo queda con 29 protones y 28 electrones: <strong>carga total +1</strong>. Un átomo con carga se llama <strong>ion</strong>; este es <strong>Cu⁺</strong>.</p><p>En un trozo de cobre esto pasa en <strong>todos los átomos a la vez</strong>: quedan iones + ordenados y un “mar” de electrones libres. Lo vas a ver en la lección 3.</p>'},
    {t:'Compará: silicio', do:()=>{api.select('Si');api.set({focus:'todo',solo:true,shield:false,ion:false});},
     p:'<p>El <strong>silicio</strong> tiene <strong style="color:var(--val)">4 electrones de valencia</strong>. No los regala fácilmente: los usa para unirse con 4 vecinos.</p><p>Por eso conduce muy poco… salvo que le des energía. Es un <strong style="color:var(--semi)">semiconductor</strong>, la base de los chips.</p>'},
    {t:'Compará: oxígeno y neón', do:()=>{api.select('O');api.set({focus:'todo',solo:true,shield:false,ion:false});},
     p:'<p>El <strong>oxígeno</strong> tiene <strong style="color:var(--val)">6</strong>: le faltan 2 para completar 8, así que en vez de soltar electrones <strong>los atrapa</strong>. Materiales con oxígeno, como el vidrio, son aislantes.</p><p>Probá después el <strong>neón</strong> (capa llena de 8: ni da ni recibe). <strong>Regla práctica:</strong> 1 a 3 → conductor · 4 → semiconductor · 5 a 8 → aislante.</p>'},
  ];
  makeTour($('#tour-atomo'),pasos,{onFinish:()=>showTab('tabla'),finishLabel:'Seguir: la tabla periódica →'}).go(0);
}
