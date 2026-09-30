/* Taller de Electrones · navegación, gráfico, ejemplos, resumen, glosario y autoevaluación */

const LECCIONES = ['inicio','atomo','tabla','materiales','bandas','vida','resumen','prueba'];
const NOMBRE_LECCION = {1:'El átomo',2:'La tabla periódica',3:'Conductores y aislantes',4:'Bandas de energía',5:'En la vida real'};
const VISTOS_KEY = 'taller-electrones-m1-vistos';

function leerVistos(){ try{ return JSON.parse(localStorage.getItem(VISTOS_KEY)||'[]'); }catch(e){ return []; } }
function marcarVisto(id){
  const v=leerVistos(); if(!v.includes(id)){ v.push(id); try{ localStorage.setItem(VISTOS_KEY,JSON.stringify(v)); }catch(e){} }
  pintarVistos();
}
function pintarVistos(){ const v=leerVistos(); $$('.tab').forEach(t=>t.classList.toggle('seen',v.includes(t.getAttribute('aria-controls')))); }

function showTab(id){
  if(!LECCIONES.includes(id)) id='inicio';
  $$('.tab').forEach(t=>t.setAttribute('aria-selected',String(t.getAttribute('aria-controls')===id)));
  $$('.panel').forEach(p=>{p.hidden=p.id!==id;});
  M3D.setActive(id);
  try{ history.replaceState(null,'','#'+id); }catch(e){}
  const main=$('main'); const y=main.getBoundingClientRect().top+window.scrollY-60;
  if(window.scrollY>y) window.scrollTo({top:Math.max(0,y),behavior:M3D.reduceMotion?'auto':'smooth'});
  // en pantallas angostas, centrar la pestaña activa en la barra (sin mover la página)
  const tab=$('#t-'+id), nav=$('nav.tabs');
  if(tab && nav.scrollWidth>nav.clientWidth) nav.scrollLeft=tab.offsetLeft-(nav.clientWidth-tab.offsetWidth)/2;
  marcarVisto(id);
}

/* ---------- gráfico de resistividad ---------- */
function initChart(){
  const LO=-9, HI=17, pos=x=>(Math.log10(x)-LO)/(HI-LO)*100;
  const COL={conductor:'var(--cu)',semiconductor:'var(--semi)',aislante:'var(--ais)',intermedio:'var(--muted)'};
  const zones=[{a:LO,b:-5,t:'conductores',c:'var(--cu)'},{a:-5,b:8,t:'intermedios y semiconductores',c:'var(--semi)'},{a:8,b:HI,t:'aislantes',c:'var(--ais)'}];
  const zp=z=>`left:${(z.a-LO)/(HI-LO)*100}%;width:${(z.b-z.a)/(HI-LO)*100}%`;
  const zbg=zones.map(z=>`<div class="zone" style="${zp(z)};background:color-mix(in srgb,${z.c} 6%,transparent)"></div>`).join('');
  let h=`<div class="zones-head"><span></span><div class="zhead">${zones.map(z=>`<span style="left:${(z.a-LO)/(HI-LO)*100+.8}%;color:${z.c}">${z.t}</span>`).join('')}</div><span></span></div>`;
  CHART.forEach((r,i)=>{
    const col=COL[r.tipo]; const [a,b]=Array.isArray(r.v)?r.v:[r.v,r.v];
    const solid=`<div class="cbar" style="width:${pos(a)}%;background:${col};animation-delay:${i*40}ms"></div>`;
    const rng=b>a?`<div class="cbar range" style="left:${pos(a)}%;width:${pos(b)-pos(a)}%;background-color:${col};animation-delay:${i*40+200}ms"></div>`:'';
    const link=r.m?` link" data-m="${r.m}" role="button" tabindex="0" aria-label="Ver ${r.n} por dentro en 3D`:'';
    h+=`<div class="crow${link}">
      <div class="cname"><i class="dot" style="background:${col}"></i><span>${r.n}${r.d?`<br><small>${r.d}</small>`:''}${r.m?' <small>· ver 3D</small>':''}</span></div>
      <div class="track">${zbg}${solid}${rng}</div>
      <div class="cval">${rhoText(r.v)}</div></div>`;
  });
  const ticks=[-8,-4,0,4,8,12,16].map(e=>`<span style="left:${(e-LO)/(HI-LO)*100}%">10${sup(e)}</span>`).join('');
  h+=`<div class="axis"><span></span><div class="ticks">${ticks}</div><span class="cval" style="padding-top:6px">Ω·m</span></div>`;
  $('#chart').innerHTML=h;
  $('#ratio').textContent='más de 10'+sup(Math.floor(Math.log10(1e13/1.59e-8)))+' veces';
  $$('.crow.link').forEach(el=>{
    const go=()=>window.verMaterial&&window.verMaterial(el.dataset.m);
    el.onclick=go; el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};
  });
}

/* ---------- ejemplos y mitos ---------- */
function initVida(){
  $('#usos').innerHTML=EJEMPLOS.map(u=>`<div class="use"><h4>${u.t}</h4><div class="parts">${u.partes.map(([tipo,mat,rol])=>`<div class="part"><span class="pill ${tipo}">${tipo}</span><span><strong>${mat}</strong>: ${rol}</span></div>`).join('')}</div><p>${u.p}</p></div>`).join('');
  $('#mitos').innerHTML=MITOS.map(([no,si])=>`<div class="myth"><div class="no"><b>Se suele creer</b>${no}</div><div class="si"><b>En realidad</b>${si}</div></div>`).join('');
}

/* ---------- resumen y glosario ---------- */
function initResumen(){
  $('#ideas').innerHTML=IDEAS.map(([t,d])=>`<li><strong>${t}</strong>${d}</li>`).join('');
  const box=$('#glosario'), q=$('#gloss-q'), cnt=$('#gloss-n');
  const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  function paint(){
    const f=norm(q.value.trim());
    const items=GLOSARIO.filter(([t,d])=>!f||norm(t+' '+d).includes(f));
    box.innerHTML=items.map(([t,d])=>`<div class="gitem"><dt>${t}</dt><dd>${d}</dd></div>`).join('') || '<p style="color:var(--muted)">No hay términos con esa palabra.</p>';
    cnt.textContent=`${items.length} de ${GLOSARIO.length} términos`;
  }
  q.oninput=paint; paint();
}

/* ---------- autoevaluación ---------- */
function initQuiz(){
  const box=$('#quiz'); let ok=0, done=0;
  const lecId={1:'atomo',2:'tabla',3:'materiales',4:'bandas',5:'vida'};
  const sc=document.createElement('div'); sc.className='score';
  function paint(){
    let msg='';
    if(done===PREGUNTAS.length){
      const p=ok/PREGUNTAS.length;
      msg = p===1 ? '¡Perfecto! Entendiste el módulo completo.' : p>=.75 ? 'Muy bien. Repasá las que fallaste con el enlace de cada una.' : 'Conviene repasar las lecciones marcadas antes de seguir.';
    }
    sc.innerHTML=`<span><b>${ok}</b> / ${PREGUNTAS.length} correctas</span><span>${done} respondidas</span>${msg?`<span class="msg">${msg}</span>`:''}<button class="btn small" type="button" id="quiz-reset">Empezar de nuevo</button>`;
    $('#quiz-reset').onclick=initQuiz;
  }
  box.innerHTML=''; box.appendChild(sc);
  PREGUNTAS.forEach((p,i)=>{
    const d=document.createElement('div'); d.className='q';
    d.innerHTML=`<div class="qk">Pregunta ${i+1} · Lección ${p.l}: ${NOMBRE_LECCION[p.l]}</div><h3>${p.q}</h3>
      <div class="opts">${p.o.map((o,j)=>`<button class="opt" type="button" id="q${i}o${j}" data-j="${j}">${o}</button>`).join('')}</div><div class="exp" hidden></div>`;
    $$('.opt',d).forEach(b=>b.onclick=()=>{
      const j=+b.dataset.j, bien=j===p.c;
      $$('.opt',d).forEach(x=>{x.disabled=true; if(+x.dataset.j===p.c) x.classList.add('good');});
      if(!bien) b.classList.add('bad'); else ok++; done++;
      const ex=$('.exp',d); ex.hidden=false;
      ex.innerHTML=(bien?'<strong style="color:var(--ok)">¡Correcto!</strong> ':'<strong style="color:var(--bad)">No es esa.</strong> ')+p.e+
        (bien?'':` <a role="button" tabindex="0" data-go="${lecId[p.l]}">Repasar la lección ${p.l} →</a>`);
      const a=$('a',ex); if(a){ a.onclick=()=>showTab(a.dataset.go); a.onkeydown=e=>{if(e.key==='Enter')showTab(a.dataset.go);}; }
      paint();
    });
    box.appendChild(d);
  });
  paint();
}

/* ---------- inicio ---------- */
function initInicio(){
  $('#proximos').innerHTML=`<div class="now"><span class="n">1</span><span><strong>La materia y la electricidad</strong>: átomos, electrones, conductores, aislantes y semiconductores</span><span class="st">este módulo</span></div>`+
    PROXIMOS.map((t,i)=>`<div><span class="n">${i+2}</span><span>${t}</span><span class="st">próximamente</span></div>`).join('');
}

/* ---------- arranque ---------- */
function start(){
  M3D.init();
  $$('.tab').forEach(t=>t.onclick=()=>showTab(t.getAttribute('aria-controls')));
  $$('[data-go]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.go)));
  // cada escena se inicia por separado: si una falla, las demás siguen funcionando
  [initInicio,initViaje,initAtomo,initTabla,initMateriales,initBandas,initChart,initVida,initResumen,initQuiz].forEach(f=>{
    try{ f(); }catch(e){ console.error('Error al iniciar '+f.name, e); }
  });
  pintarVistos();
  const h=(location.hash||'').slice(1);
  showTab(LECCIONES.includes(h)?h:'inicio');
  // el navegador salta al ancla del #hash al cargar; volvemos arriba de todo
  try{ history.scrollRestoration='manual'; }catch(e){}
  window.scrollTo(0,0);
  window.addEventListener('hashchange',()=>{ const id=location.hash.slice(1); if(LECCIONES.includes(id)&&id!==M3D.tab) showTab(id); });
}
const fuentesListas = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]) : Promise.resolve();
fuentesListas.then(start);
