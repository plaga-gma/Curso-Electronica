/* Lección 2 · La tabla periódica en 3D */
function initTabla(){
  const CAT_COL={conductor:'#e3874f',semiconductor:'#b48cff',aislante:'#7fc7b5',gas:'#8aa0c8'};
  const S={mode:'tipo', sel:null};
  const METALES=TABLA.filter(e=>e.cat==='conductor').length;
  $$('.n-metales').forEach(el=>el.textContent=METALES);

  const v=M3D.makeViewer($('#stage-tabla'),'tabla',{cam:[0,17.5,16],target:[0,0,.6],auto:false,minD:6,maxD:60});
  const tiles=[]; const P=1.06;
  const xOf=col=>(col-9.5)*P, zOf=fila=>((fila<=7?fila:fila-.5)-5)*P;
  let topLabels=[];

  function tileTexture(e){
    const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d');
    g.fillStyle=CAT_COL[e.cat]; g.fillRect(0,0,128,128);
    g.fillStyle='rgba(10,15,28,.9)'; g.textAlign='center'; g.textBaseline='middle';
    g.font='800 58px "Bricolage Grotesque","Segoe UI",sans-serif'; g.fillText(e.s,64,72);
    g.textAlign='left'; g.font='600 22px "JetBrains Mono",Consolas,monospace'; g.fillText(String(e.z),10,20);
    const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t;
  }

  if(v){
    const geo=new THREE.BoxGeometry(.94,1,.94); geo.translate(0,.5,0);
    TABLA.forEach(e=>{
      const side=new THREE.MeshStandardMaterial({color:CAT_COL[e.cat],roughness:.45,metalness:e.cat==='conductor'?.35:.05,emissive:0x000000});
      const top=new THREE.MeshStandardMaterial({map:tileTexture(e),roughness:.6,emissive:0x000000});
      const m=new THREE.Mesh(geo,[side,side,top,side,side,side]);
      m.position.set(xOf(e.col),0,zOf(e.fila)); m.scale.y=.25; m.userData.e=e;
      v.scene.add(m); tiles.push({m,e,side,top,base:new THREE.Color(CAT_COL[e.cat]),h:.25,th:.25,dim:0,tdim:0});
    });
    // referencias: grupos (columnas), períodos (filas) y huecos de lantánidos/actínidos
    for(let c=1;c<=18;c++){const s=M3D.textSprite(String(c),{size:.32,color:'#65718f'});const r0=(c===1||c===18)?1:((c===2||c>=13)?2:4);s.position.set(xOf(c),.1,zOf(r0)-.95);v.scene.add(s);}
    for(let f=1;f<=7;f++){const s=M3D.textSprite('fila '+f,{size:.3,color:'#65718f',weight:400});s.position.set(xOf(0)-.35,.1,zOf(f));v.scene.add(s);}
    [['57–71',6],['89–103',7]].forEach(([t,f])=>{const s=M3D.textSprite(t,{size:.26,color:'#95a1c0',weight:400});s.position.set(xOf(3),.15,zOf(f));v.scene.add(s);});
    // etiquetas de conductividad para los 4 mejores
    topLabels=['Ag','Cu','Au','Al'].map(sym=>{const e=TABLA.find(x=>x.s===sym);const s=M3D.textSprite(`${sym} ${String(e.cond).replace('.',',')}`,{size:.38,color:'#ffcf8f'});s.visible=false;v.scene.add(s);return {s,t:tiles.find(t=>t.e.s===sym)};});

    // selección con clic/toque (sin confundir con arrastrar para girar)
    const ray=new THREE.Raycaster(), ptr=new THREE.Vector2(); let down=null;
    const pick=ev=>{const r=v.renderer.domElement.getBoundingClientRect();ptr.set(((ev.clientX-r.left)/r.width)*2-1,-((ev.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ptr,v.camera);const h=ray.intersectObjects(tiles.map(t=>t.m));return h[0]?h[0].object.userData.e:null;};
    const cv=v.renderer.domElement;
    cv.addEventListener('pointerdown',ev=>{down=[ev.clientX,ev.clientY];});
    cv.addEventListener('pointerup',ev=>{if(!down)return;const d=Math.hypot(ev.clientX-down[0],ev.clientY-down[1]);down=null;if(d<6){const e=pick(ev);if(e)api.select(e.s);}});
    cv.addEventListener('pointermove',ev=>{if(ev.buttons)return;cv.style.cursor=pick(ev)?'pointer':'grab';});

    // encuadre: aleja la cámara en pantallas angostas para que entre la tabla completa
    let lastA=0; const VIEW=new THREE.Vector3(0,.74,.67).normalize();
    v.ticks.push(dt=>{
      if(Math.abs(v.camera.aspect-lastA)>.01){ lastA=v.camera.aspect; const D=24/Math.min(1,lastA/1.5); v.camera.position.copy(v.controls.target).addScaledVector(VIEW,D); }
      const f=Math.min(1,dt*5);
      tiles.forEach(t=>{
        t.h+=(t.th-t.h)*f; t.dim+=(t.tdim-t.dim)*f;
        const sel=S.sel===t.e.s; const hh=t.h+(sel?.35:0);
        t.m.scale.y=hh;
        const k=1-t.dim*.8; t.side.color.copy(t.base).multiplyScalar(k); t.top.color.setScalar(k);
        t.side.emissive.setScalar(sel?.28:0); t.top.emissive.setScalar(sel?.18:0);
      });
      topLabels.forEach(L=>{L.s.position.set(L.t.m.position.x,L.t.m.scale.y+.45,L.t.m.position.z);});
    });
  }

  function targetFor(e){
    switch(S.mode){
      case 'valencia': return e.val ? [e.val*.42,0] : [.12,1];
      case 'conductor': return e.cat==='conductor' ? [1.1,0] : [.12,1];
      case 'semi': return e.cat==='semiconductor' ? [1.1,0] : [.12,1];
      case 'aislante': return (e.cat==='aislante'||e.cat==='gas') ? [1.1,0] : [.12,1];
      case 'conductividad': return e.cond ? [e.cond/62.9*4.6+.25,0] : [.1,1];
      default: return [.25,0];
    }
  }
  function applyMode(){
    tiles.forEach(t=>{const [h,d]=targetFor(t.e);t.th=h;t.tdim=d;});
    topLabels.forEach(L=>L.s.visible=S.mode==='conductividad');
    $$('#pt-modes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===S.mode));
    const L={tipo:'Color = comportamiento eléctrico',valencia:'Altura = electrones de valencia',conductor:'Resaltados: metales (conductores)',semi:'Resaltados: metaloides (semiconductores)',aislante:'Resaltados: no metales y gases nobles',conductividad:'Altura = conductividad real (MS/m)'};
    $('#pt-mode-lbl').textContent=L[S.mode];
  }
  function paintInfo(){
    const box=$('#pt-info'); const e=TABLA.find(x=>x.s===S.sel);
    if(!e){ box.innerHTML='<p><strong>Tocá cualquier elemento</strong> de la tabla para ver sus datos y dónde se usa.</p>'; return; }
    const periodo = e.fila<=7 ? e.fila : e.fila-3;
    const grupo = e.fila<=7 ? e.col : '3 (bloque f)';
    const val = e.val ? `<strong style="color:var(--val)">${e.val} electrón${e.val>1?'es':''} de valencia.</strong>` : 'Metal de transición o del bloque f: casi siempre 1 o 2 electrones en la última capa.';
    const catTxt={conductor:'Metal: suelta sus electrones de valencia con facilidad, así que <strong>conduce</strong>.',semiconductor:'Metaloide: conduce a medias; se comporta como <strong>semiconductor</strong>.',aislante:'No metal: retiene sus electrones; en general es <strong>aislante</strong>.',gas:'Gas noble: capa externa completa, muy estable; <strong>aislante</strong>.'}[e.cat];
    box.innerHTML=`<h3>${e.n} <span class="pill ${e.cat}">${TIPO_TXT[e.cat]}</span></h3>
      <div class="readouts">
        <div class="ro"><div class="k">Número atómico</div><div class="v">Z = ${e.z}</div></div>
        <div class="ro"><div class="k">Fila · columna</div><div class="v">${periodo} · ${grupo}</div></div>
        ${e.cond?`<div class="ro wide"><div class="k">Conductividad (aprox. 20 °C)</div><div class="v">${String(e.cond).replace('.',',')} MS/m · ${Math.round(e.cond/59.6*100)} % del cobre</div></div>`:''}
      </div>
      <p>${val} ${catTxt}${e.fila<=7?` Tiene <strong>${periodo} capas</strong> de electrones.`:''}</p>
      ${e.uso?`<p><strong>Dónde lo encontrás:</strong> ${e.uso}</p>`:''}
      ${e.z>=104?'<p style="color:var(--muted)">Elemento sintético: dura fracciones de segundo, así que sus propiedades son predicciones.</p>':''}
      ${e.s==='At'||e.s==='Po'?'<p style="color:var(--muted)">Según la tabla que consultes, puede figurar como metaloide o como metal/no metal.</p>':''}`;
  }
  const api={
    mode(m){S.mode=m;applyMode();},
    select(sym){S.sel=sym;paintInfo();},
  };
  $$('#pt-modes button').forEach(b=>b.onclick=()=>api.mode(b.dataset.mode));
  const sel=$('#pt-select');
  sel.innerHTML='<option value="">Elegí un elemento…</option>';
  TABLA.forEach(e=>{const o=document.createElement('option');o.value=e.s;o.textContent=`${e.z} · ${e.s} · ${e.n}`;sel.appendChild(o);});
  sel.onchange=()=>api.select(sel.value);
  const origSelect=api.select; api.select=sym=>{origSelect(sym); sel.value=sym||'';};

  const pasos=[
    {t:'Los 118 elementos, en orden', do:()=>{api.mode('tipo');api.select(null);},
     p:'<p>La tabla periódica ordena <strong>todos los elementos</strong> según su cantidad de protones (Z): de izquierda a derecha y de arriba hacia abajo.</p><p>Los colores muestran cómo se comportan con la electricidad: <strong style="color:var(--cu)">metales</strong> (conductores), <strong style="color:var(--semi)">metaloides</strong> (semiconductores), <strong style="color:var(--ais)">no metales</strong> (aislantes) y <strong style="color:var(--gas)">gases nobles</strong> (aislantes).</p>'},
    {t:'Cada fila = una capa más', do:()=>{api.mode('tipo');api.select('Cu');},
     p:'<p>El número de <strong>fila</strong> (período) te dice cuántas <strong>capas</strong> de electrones tiene el átomo. Fila 1 = 1 capa, fila 2 = 2 capas…</p><p>El <strong>cobre</strong> (resaltado) está en la fila 4, y por eso tiene 4 capas: 2 · 8 · 18 · 1, como viste en la lección 1.</p>'},
    {t:'Cada columna = misma última capa', do:()=>{api.mode('valencia');api.select(null);},
     p:'<p>Ahora la <strong>altura</strong> muestra los <strong>electrones de valencia</strong> en las columnas 1, 2 y 13 a 18: suben de 1 a 8 de izquierda a derecha.</p><p>Los elementos de una <strong>misma columna</strong> tienen la última capa parecida, así que se comportan parecido. Los del centro (bajitos y oscuros) son los <strong>metales de transición</strong>: casi siempre tienen 1 o 2 en la última capa.</p>'},
    {t:'Los metales: conductores', do:()=>{api.mode('conductor');api.select(null);},
     p:`<p><strong>${METALES} de los 118</strong> elementos son metales. Ocupan la izquierda y el centro de la tabla.</p><p>Tienen <strong>pocos electrones de valencia</strong> (1, 2 o 3) y los sueltan con facilidad. Por eso <strong>todos los metales conducen</strong>, aunque algunos mucho mejor que otros.</p>`},
    {t:'La escalera de los semiconductores', do:()=>{api.mode('semi');api.select('Si');},
     p:'<p>Entre los metales y los no metales hay una <strong>“escalera”</strong> de <strong style="color:var(--semi)">metaloides</strong>: boro, silicio, germanio, arsénico, antimonio y telurio.</p><p>Conducen a medias: son <strong>semiconductores</strong>. El <strong>silicio</strong> (resaltado, 4 electrones de valencia) es el material de casi todos los chips del mundo.</p>'},
    {t:'Arriba a la derecha: aislantes', do:()=>{api.mode('aislante');api.select(null);},
     p:'<p>Los <strong style="color:var(--ais)">no metales</strong> y los <strong style="color:var(--gas)">gases nobles</strong> tienen muchos electrones de valencia (4 a 8) y los retienen. Son <strong>aislantes</strong>.</p><p>Casi todos los aislantes que usás están hechos de ellos: plásticos y gomas (carbono e hidrógeno), el PVC de los cables (con cloro), el vidrio (silicio unido a oxígeno).</p>'},
    {t:'¿Quién conduce mejor?', do:()=>{api.mode('conductividad');api.select('Cu');},
     p:'<p>La altura muestra la <strong>conductividad real</strong> de los metales más comunes. Los tres más altos —<strong>plata, cobre y oro</strong>— están en la <strong>misma columna</strong> (grupo 11): los tres tienen <strong>1 solo electrón</strong> en la última capa.</p><p>El cuarto es el <strong>aluminio</strong>. El hierro, por ejemplo, conduce 6 veces menos que el cobre.</p>'},
    {t:'Ahora explorá vos', do:()=>{api.mode('tipo');api.select('In');},
     p:'<p><strong>Tocá cualquier elemento</strong> (o elegilo en la lista) para ver sus datos y dónde aparece en la electrónica.</p><p>Algunos interesantes: <strong>In</strong> (pantallas táctiles), <strong>Ta</strong> (capacitores de celulares), <strong>Li</strong> (baterías), <strong>Sn</strong> (soldadura), <strong>Nd</strong> (imanes de parlantes).</p>'},
  ];
  makeTour($('#tour-tabla'),pasos,{onFinish:()=>showTab('materiales'),finishLabel:'Seguir: conductores y aislantes →'}).go(0);
}
