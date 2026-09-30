/* Taller de Electrones · ayudas para gráficos 2D animados (canvas) */
const G2D = (() => {
  let C=null;
  function col(){
    if(C) return C;
    const s=getComputedStyle(document.documentElement), v=n=>s.getPropertyValue(n).trim()||'#fff';
    C={text:v('--text'),soft:v('--soft'),muted:v('--muted'),dim:v('--dim'),line:v('--line'),line2:v('--line2'),bg2:v('--bg2'),
       e:v('--e'),val:v('--val'),plus:v('--plus'),minus:v('--minus'),cu:v('--cu'),semi:v('--semi'),ais:v('--ais'),ok:v('--ok'),bad:v('--bad'),
       mono:'"JetBrains Mono", Consolas, monospace', body:'"Atkinson Hyperlegible", "Segoe UI", sans-serif'};
    return C;
  }
  /* Ejes con grilla. Devuelve funciones X(v) e Y(v) que pasan de valores a píxeles. */
  function axes(ctx, w, h, {x0=0,x1=1,y0=0,y1=1,xt=[],yt=[],fx=v=>v,fy=v=>v,xl='',yl='',pad={l:52,r:14,t:14,b:38}}={}){
    const c=col(), L=pad.l, R=w-pad.r, T=pad.t, B=h-pad.b;
    const X=v=>L+(v-x0)/(x1-x0)*(R-L), Y=v=>B-(v-y0)/(y1-y0)*(B-T);
    ctx.lineWidth=1; ctx.font=`11px ${c.mono}`; ctx.fillStyle=c.muted;
    ctx.strokeStyle=c.line; ctx.beginPath();
    xt.forEach(v=>{ctx.moveTo(X(v)+.5,T);ctx.lineTo(X(v)+.5,B);}); yt.forEach(v=>{ctx.moveTo(L,Y(v)+.5);ctx.lineTo(R,Y(v)+.5);}); ctx.stroke();
    ctx.strokeStyle=c.line2; ctx.beginPath(); ctx.moveTo(L+.5,T); ctx.lineTo(L+.5,B); ctx.lineTo(R,B+.5); ctx.stroke();
    ctx.textAlign='center'; ctx.textBaseline='top'; xt.forEach(v=>ctx.fillText(fx(v),X(v),B+5));
    ctx.textAlign='right'; ctx.textBaseline='middle'; yt.forEach(v=>ctx.fillText(fy(v),L-6,Y(v)));
    ctx.fillStyle=c.soft; ctx.font=`12px ${c.body}`;
    if(xl){ctx.textAlign='right';ctx.textBaseline='bottom';ctx.fillText(xl,R,h-2);}
    if(yl){ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(yl,L+6,T);}
    return {X,Y,L,R,T,B};
  }
  function curve(ctx, f, a, b, X, Y, {color, width=2.5, dash=null, n=160}={}){
    ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineJoin='round'; if(dash) ctx.setLineDash(dash);
    ctx.beginPath(); for(let i=0;i<=n;i++){const x=a+(b-a)*i/n; const y=f(x); i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));} ctx.stroke(); ctx.restore();
  }
  function dot(ctx,x,y,{r=6,color,glow=true}={}){
    ctx.save(); if(glow){ctx.shadowColor=color;ctx.shadowBlur=14;} ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  function label(ctx,txt,x,y,{color,align='left',base='middle',size=12,font='mono',bg=false}={}){
    const c=col(); ctx.save(); ctx.font=`${font==='mono'?'600 ':''}${size}px ${font==='mono'?c.mono:c.body}`; ctx.textAlign=align; ctx.textBaseline=base;
    if(bg){ const w=ctx.measureText(txt).width+10; const bx=align==='left'?x-5:align==='right'?x-w+5:x-w/2; ctx.fillStyle=c.bg2; ctx.globalAlpha=.9; ctx.fillRect(bx,y-size*.8,w,size*1.6); ctx.globalAlpha=1; }
    ctx.fillStyle=color||c.text; ctx.fillText(txt,x,y); ctx.restore();
  }
  function hline(ctx,y,a,b,{color,dash=[5,5],width=1.2}={}){ ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(a,y); ctx.lineTo(b,y); ctx.stroke(); ctx.restore(); }
  /* Número “lindo” que se acerca suavemente a su objetivo (para animar valores) */
  function ease(cur,target,dt,k=8){ return cur+(target-cur)*Math.min(1,dt*k); }
  return {col, axes, curve, dot, label, hline, ease};
})();
