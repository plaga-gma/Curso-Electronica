/* Lección 4 · Bandas de energía: conductor, semiconductor y aislante lado a lado */
function initBandas(){
  const S={temp:tempFromC(20)};
  const tI=$('#temp-b');
  const COLS=[
    {x:-5.4,name:'Conductor',sub:'cobre',gap:-.9,gapTxt:'se superponen',css:'#e3874f',rate:0},
    {x:0,name:'Semiconductor',sub:'silicio',gap:1.12,gapTxt:'1,1 eV',css:'#b48cff',rate:5},
    {x:5.4,name:'Aislante',sub:'vidrio',gap:9,gapTxt:'≈ 9 eV',css:'#7fc7b5',rate:0},
  ];
  const v=M3D.makeViewer($('#stage-bandas'),'bandas',{cam:[0,1.5,17],target:[0,.2,0],auto:false});
  const K=.45, W=3.6, H=1.3, D=1.6, vbBot=-3.1, vbTop=vbBot+H;
  let state=[], flashS=null, flashT=0;

  function sync(){ tI.value=Math.round(S.temp*100); $('#temp-b-o').textContent=tempC(S.temp)+' °C'; }
  tI.oninput=()=>{S.temp=tI.value/100;sync();};
  const api={ flash(){}, set(o){ if('temp' in o) S.temp=o.temp; sync(); } };

  if(v){
    const band=(x,yc,color,op)=>{
      const g=new THREE.Group();
      const box=new THREE.Mesh(new THREE.BoxGeometry(W,H,D),new THREE.MeshStandardMaterial({color,transparent:true,opacity:op,roughness:.3,metalness:.1,depthWrite:false}));
      const ed=new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry),new THREE.LineBasicMaterial({color,transparent:true,opacity:.7}));
      g.add(box,ed); g.position.set(x,yc,0); v.scene.add(g); return g;
    };
    const yAxis=M3D.textSprite('energía ↑',{size:.36,color:'#95a1c0',weight:400}); yAxis.position.set(-8.4,.4,0); v.scene.add(yAxis);
    state=COLS.map(c=>{
      const cbBot=vbTop+c.gap*K, cbTop=cbBot+H, top=Math.max(cbTop,vbTop+H);
      band(c.x,vbBot+H/2,0x56d8ff,.12); band(c.x,cbBot+H/2,0xffb454,.08);
      const t1=M3D.textSprite(c.name,{size:.5,color:c.css}); t1.position.set(c.x,top+.8,0);
      const t2=M3D.textSprite(c.sub,{size:.34,color:'#95a1c0',weight:400}); t2.position.set(c.x,top+.36,0);
      const lc=M3D.textSprite('banda de conducción',{size:.24,color:'#ffcf8f',weight:400}); lc.position.set(c.x,cbTop-.2,D/2+.02);
      const lv=M3D.textSprite('banda de valencia',{size:.24,color:'#9ce6ff',weight:400}); lv.position.set(c.x,vbBot-.28,D/2);
      v.scene.add(t1,t2,lc,lv);
      const gl=M3D.textSprite(c.gapTxt,{size:.32,color:'#e7ecf7'});
      if(c.gap>0){
        gl.position.set(c.x+W/2+.72,(vbTop+cbBot)/2,0);
        const pts=[new THREE.Vector3(c.x+W/2+.12,vbTop,0),new THREE.Vector3(c.x+W/2+.12,cbBot,0)];
        const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineDashedMaterial({color:0xe7ecf7,dashSize:.12,gapSize:.08}));
        ln.computeLineDistances(); v.scene.add(ln);
        const bl=M3D.textSprite('brecha',{size:.24,color:'#95a1c0',weight:400}); bl.position.set(c.x+W/2+.6,(vbTop+cbBot)/2-.34,0); v.scene.add(bl);
      } else gl.position.set(c.x-W/2-1.25,vbTop+c.gap*K/2,0);
      v.scene.add(gl);
      // electrones de valencia (ocupados en enlaces)
      const vb=[];
      for(let i=0;i<8;i++)for(let j=0;j<3;j++)for(let k=0;k<2;k++){
        const o=M3D.electron(0x56d8ff,.09); const base=new THREE.Vector3(c.x-W/2+.3+i*(W-.6)/7,vbBot+.25+j*(H-.5)/2,-D/2+.45+k*(D-.9));
        o.position.copy(base); v.scene.add(o); vb.push({o,base,ph:Math.random()*TAU,busy:false});
      }
      // el conductor ya tiene electrones libres en la zona superpuesta
      const cb=[];
      if(c.gap<0) for(let q=0;q<14;q++){const o=M3D.electron(0xffb454,.11);v.scene.add(o);cb.push({o,x:Math.random()*W,y:cbBot+.2+Math.random()*(vbTop-cbBot-.05),z:(Math.random()-.5)*(D-.4),vx:(Math.random()<.5?-1:1)*(1+Math.random()*1.5),ph:Math.random()*TAU});}
      return {c,cbBot,cbTop,vb,cb,jumps:[]};
    });
    flashS=new THREE.Sprite(M3D.glowMat(0xfff2a8,false)); flashS.scale.set(7,7,1); flashS.position.set(0,1.2,.5); flashS.material.opacity=0; v.scene.add(flashS);

    const tmp=new THREE.Vector3();
    const jump=s=>{
      const free=s.vb.filter(e=>!e.busy&&e.base.y>vbTop-.5); const e=free[Math.floor(Math.random()*free.length)]; if(!e) return;
      e.busy=true; e.o.visible=false; const o=M3D.electron(0xffb454,.11); o.position.copy(e.base); v.scene.add(o);
      const h=M3D.holeSprite(.34); h.position.copy(e.base); v.scene.add(h);
      s.jumps.push({src:e,o,h,st:'up',k:0,to:new THREE.Vector3(e.base.x,s.cbBot+.3+Math.random()*(H-.6),e.base.z),life:2.5+Math.random()*3,vx:(Math.random()<.5?-1:1)*(1.2+Math.random())});
    };
    api.flash=()=>{ flashT=1; const s=state[1]; for(let q=0;q<5&&s.jumps.length<14;q++) jump(s); };
    v.ticks.push((dt,t)=>{
      const sp=M3D.reduceMotion?.3:1;
      if(flashT>0){flashT=Math.max(0,flashT-dt*1.5);flashS.material.opacity=flashT*.9;}
      state.forEach(s=>{
        const j=.03+.05*S.temp;
        for(const e of s.vb){ if(e.busy) continue; e.o.position.set(e.base.x+Math.sin(t*3+e.ph)*j,e.base.y+Math.cos(t*2.6+e.ph)*j,e.base.z); }
        const rate=s.c.rate*Math.pow(S.temp,2.2);
        if(rate>0 && s.jumps.length<12 && Math.random()<rate*dt) jump(s);
        for(let q=s.jumps.length-1;q>=0;q--){
          const J=s.jumps[q];
          if(J.st==='up'){ J.k=Math.min(1,J.k+dt*1.6*sp); tmp.lerpVectors(J.src.base,J.to,J.k); tmp.x+=Math.sin(J.k*Math.PI)*.4; J.o.position.copy(tmp); if(J.k>=1) J.st='in'; }
          else if(J.st==='in'){
            J.life-=dt; J.to.x+=J.vx*dt*sp; const x0=s.c.x-W/2+.15, x1=s.c.x+W/2-.15;
            if(J.to.x>x1||J.to.x<x0){J.vx*=-1;J.to.x=Math.max(x0,Math.min(x1,J.to.x));}
            J.o.position.copy(J.to); J.o.position.y+=Math.sin(t*4+q)*.05;
            if(J.life<=0){J.st='down';J.k=1;J.from=J.to.clone();}
          } else {
            J.k=Math.max(0,J.k-dt*1.6*sp); tmp.lerpVectors(J.src.base,J.from,J.k); J.o.position.copy(tmp);
            if(J.k<=0){ v.scene.remove(J.o,J.h); J.h.material.dispose(); J.src.busy=false; J.src.o.visible=true; s.jumps.splice(q,1); }
          }
        }
        for(const e of s.cb){ const vx=e.vx*(1+S.temp*.8); e.x+=vx*dt*sp; if(e.x>W-.15||e.x<.15){e.vx*=-1;e.x=Math.max(.15,Math.min(W-.15,e.x));} e.o.position.set(s.c.x-W/2+e.x,e.y+Math.sin(t*3+e.ph)*.04,e.z); }
      });
    });
  }
  setInterval(()=>{
    if(M3D.tab!=='bandas'||!state.length) return;
    $('#b-c0').textContent=state[0].cb.length+' · siempre';
    $('#b-c1').textContent=state[1].jumps.filter(j=>j.st!=='down').length+' · según la energía';
    $('#b-c2').textContent='0 · brecha enorme';
  },200);

  $('#btn-luz').onclick=()=>api.flash();
  const fly=i=> i===null ? M3D.flyTo(v,[0,1.5,17],[0,.2,0]) : M3D.flyTo(v,[COLS[i].x,.9,8.8],[COLS[i].x,-.9,0]);

  const amb=tempFromC(20), hot=tempFromC(450), cold=tempFromC(-200);
  const pasos=[
    {t:'Dos pisos de energía', do:()=>{api.set({temp:cold});fly(null);},
     p:'<p>Cada columna es un material. Cuanto <strong>más arriba</strong>, <strong>más energía</strong> tiene el electrón.</p><p>Abajo, en celeste, la <strong>banda de valencia</strong>: electrones ocupados en enlaces, que no pueden moverse por el material. Arriba, la <strong>banda de conducción</strong>: el “piso” de los electrones libres. Entre las dos puede haber una <strong>brecha prohibida</strong>: ahí no puede quedarse ningún electrón.</p>'},
    {t:'Conductor: las bandas se tocan', do:()=>{api.set({temp:cold});fly(0);},
     p:'<p>En el <strong>cobre</strong> las dos bandas <strong>se superponen</strong>: no hay brecha. Siempre hay electrones en la banda de conducción, incluso a −200 °C.</p><p>No necesitan “saltar” nada: <strong>siempre conduce</strong>. Esto es lo mismo que viste como “mar de electrones” en la lección 3, contado con energías.</p>'},
    {t:'Semiconductor: una brecha chica', do:()=>{api.set({temp:amb});fly(1);},
     p:'<p>En el <strong>silicio</strong> hay una brecha de <strong>1,1 eV</strong> (electronvoltios, una unidad de energía muy chica). A −200 °C nadie la salta.</p><p>A temperatura ambiente, de vez en cuando algún electrón junta la energía justa y <strong>salta</strong> a la banda de conducción. Son poquísimos: por eso el silicio puro conduce tan poco.</p>'},
    {t:'Más calor, más saltos', do:()=>{api.set({temp:hot});fly(1);},
     p:'<p>A 450 °C saltan <strong>muchos más</strong>. Cada electrón que sube deja un <strong>hueco</strong> (anillo violeta) en la banda de valencia.</p><p>Electrones arriba y huecos abajo: <strong>los dos ayudan a conducir</strong>. Es la misma idea que viste en la red de silicio, ahora vista como energía.</p>'},
    {t:'Aislante: una brecha enorme', do:()=>{api.set({temp:hot});fly(2);},
     p:'<p>En el <strong>vidrio</strong> la brecha es de unos <strong>9 eV</strong>: ocho veces la del silicio. Aunque lo calientes a 450 °C, la probabilidad de que un electrón junte tanta energía es prácticamente cero.</p><p>Todos sus electrones se quedan abajo, en los enlaces. <strong>Por eso aísla.</strong> Solo un voltaje enorme lo haría conducir (ruptura dieléctrica).</p>'},
    {t:'La luz también da energía', do:()=>{api.set({temp:amb});fly(null);setTimeout(()=>api.flash(),700);},
     p:'<p>No solo el calor: la <strong>luz</strong> llega en paquetitos de energía llamados <strong>fotones</strong>. Si un fotón tiene más energía que la brecha, hace saltar un electrón. Tocá <strong>“Iluminar el silicio”</strong> para verlo. Así funcionan los <strong>paneles solares</strong> y los sensores de las cámaras.</p><p>Dato: la luz visible trae entre 1,6 y 3,3 eV, poco para los 9 eV del vidrio. La luz no puede hacer saltar a sus electrones y por eso lo atraviesa: <strong>por eso el vidrio es transparente</strong>.</p>'},
  ];
  sync();
  makeTour($('#tour-bandas'),pasos,{onFinish:()=>showTab('vida'),finishLabel:'Seguir: en la vida real →'}).go(0);
}
