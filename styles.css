/* app.js
   آزمایشگاه هم‌نهشتی — Light & Pro
   همهٔ پنج حالت: sss, sas, asa, rhs-leg, rhs-ang
   طراحی شده برای اجرا در GitHub Pages (static)
   نویسنده: تولیدشده توسط سیستم — برای معلم
*/

(() => {
  'use strict';

  /* ---------- DOM ---------- */
  const modeSelect = document.getElementById('modeSelect');
  const runModeSelect = document.getElementById('runMode');
  const btnNew = document.getElementById('btnNew');
  const targetInfo = document.getElementById('targetInfo');
  const targetParams = document.getElementById('targetParams');
  const playerParams = document.getElementById('playerParams');
  const btnRandom = document.getElementById('btnRandom');
  const btnCheck = document.getElementById('btnCheck');
  const btnShowHint = document.getElementById('btnShowHint');
  const infoBar = document.getElementById('infoBar');
  const statusEl = document.getElementById('status');
  const modeDisplay = document.getElementById('modeDisplay');

  const mainCanvas = document.getElementById('mainCanvas');
  const effectsCanvas = document.getElementById('effectsCanvas');

  let DPR = window.devicePixelRatio || 1;
  function resize() {
    DPR = window.devicePixelRatio || 1;
    const rect = mainCanvas.getBoundingClientRect();
    mainCanvas.width = Math.max(300, Math.floor(rect.width * DPR));
    mainCanvas.height = Math.max(200, Math.floor(rect.height * DPR));
    effectsCanvas.width = mainCanvas.width;
    effectsCanvas.height = mainCanvas.height;
    mainCtx.setTransform(DPR,0,0,DPR,0,0);
    effectsCtx.setTransform(DPR,0,0,DPR,0,0);
    render();
  }
  window.addEventListener('resize', resize);

  const mainCtx = mainCanvas.getContext('2d', { alpha: true });
  const effectsCtx = effectsCanvas.getContext('2d', { alpha: true });

  /* ---------- state ---------- */
  const TOL = 0.06; // تلرانس عددی برای مقایسه اضلاع (متناسب با واحد)
  let targetModel = null;
  let playModel = null;

  // helpers
  const rnd = (min,max,step=0.1) => {
    const cnt = Math.round((max-min)/step);
    return Math.round((min + Math.floor(Math.random()*(cnt+1))*step)*1000)/1000;
  };
  const deg2rad = d => d * Math.PI/180;
  const rad2deg = r => r * 180/Math.PI;
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const dist = (p,q) => Math.hypot(p.x-q.x, p.y-q.y);
  const round3 = v => Math.round(v*1000)/1000;

  /* ---------- هندسه: ساخت مثلث ---------- */
  function isTriangle(a,b,c){ return a>0 && b>0 && c>0 && (a+b > c + 1e-6) && (a+c > b + 1e-6) && (b+c > a + 1e-6); }

  // convention: buildFromSides(a,b,c) where a = BC, b = AC, c = AB; A(0,0), B(c,0)
  function buildFromSides(a,b,c){
    if (!isTriangle(a,b,c)) return { valid:false, reason:'این سه ضلع مثلث نمی‌سازند' };
    const xC = (b*b + c*c - a*a) / (2*c);
    const y2 = b*b - xC*xC;
    if (y2 < -1e-6) return { valid:false, reason:'خطا در محاسبه' };
    const y = Math.sqrt(Math.max(0,y2));
    const A = {x:0,y:0}, B={x:c,y:0}, C={x:xC,y:y};
    return { valid:true, sides:[round3(a),round3(b),round3(c)], points:[A,B,C] };
  }

  function buildFromSAS(s1,ang,s2){
    if (s1<=0||s2<=0) return {valid:false, reason:'طول نامعتبر'};
    const A={x:0,y:0}, B={x:s1,y:0}, C={x: s2*Math.cos(ang), y: s2*Math.sin(ang)};
    if (Math.abs(0.5*Math.abs((B.x-A.x)(C.y-A.y)-(C.x-A.x)(B.y-A.y))) < 1e-6) return {valid:false, reason:'مساحت صفر'};
    const a = dist(B,C), b = s2, c = s1;
    return {valid:true, sides:[round3(a),round3(b),round3(c)], points:[A,B,C]};
  }

  function buildFromASA(ang1,side,ang2){
    const ang3 = Math.PI - ang1 - ang2;
    if (ang3 <= 0) return {valid:false, reason:'زاویه‌ها نامعتبر'};
    const k = side / Math.sin(ang3);
    const a = k * Math.sin(ang1);
    const b = k * Math.sin(ang2);
    return buildFromSides(a,b,side);
  }

  function buildFromHypLeg(hyp,leg){
    if (hyp <= 0 || leg <= 0) return {valid:false, reason:'طول نامعتبر'};
    if (leg >= hyp - 1e-3) return {valid:false, reason:'ضلع نمی‌تواند ≥ وتر باشد'};
    const other = Math.sqrt(Math.max(0, hyp*hyp - leg*leg));
    const A={x:0,y:0}, B={x:leg,y:0}, C={x:0,y:other};
    const a = dist(B,C), b = dist(A,C), c = dist(A,B);
    return {valid:true, sides:[round3(a),round3(b),round3(c)], points:[A,B,C], right:true};
  }

  function buildFromHypAng(hyp,ang){
    if (hyp <= 0) return {valid:false, reason:'وتر نامعتبر'};
    const adj = hyp * Math.cos(ang), opp = hyp * Math.sin(ang);
    if (adj <= 0 || opp <= 0) return {valid:false, reason:'زاویه نامعتبر'};
    return buildFromHypLeg(hyp, adj);
  }

  /* ---------- استخراج پارامترها از نقاط (برای مقایسه) ---------- */
  function angleAt(P,Q,R){
    const v1 = {x:P.x-Q.x, y:P.y-Q.y}, v2 = {x:R.x-Q.x, y:R.y-Q.y};
    const dot = v1.x*v2.x + v1.y*v2.y;
    const m = Math.hypot(v1.x,v1.y) * Math.hypot(v2.x,v2.y);
    if (m === 0) return 0;
    return Math.acos(clamp(dot/m,-1,1));
  }

  function extractSAS(pts){
    const A=pts[0], B=pts[1], C=pts[2];
    const s1=round3(dist(A,B)), s2=round3(dist(A,C)), ang=round3(angleAt(B,A,C));
    return {s1,s2,ang};
  }
  function extractASA(pts){
    const A=pts[0], B=pts[1], C=pts[2];
    const side=round3(dist(A,B));
    const ang1=round3(angleAt(C,A,B)), ang2=round3(angleAt(A,B,C));
    return {side,ang1,ang2};
  }
  function extractHypLeg(pts){
    const d01=dist(pts[0],pts[1]), d12=dist(pts[1],pts[2]), d02=dist(pts[0],pts[2]);
    const arr=[{d:d01, p:[0,1]},{d:d12,p:[1,2]},{d:d02,p:[0,2]}].sort((a,b)=>b.d-a.d);
    const h=arr[0].d, leg=Math.min(arr[1].d, arr[2].d);
    const ok = Math.abs(h*h - (arr[1].d*arr[1].d + arr[2].d*arr[2].d)) < 0.06;
    return ok ? {h:round3(h), leg:round3(leg)} : null;
  }
  function extractHypAng(pts){
    const info = extractHypLeg(pts);
    if (!info) return null;
    const angs = [angleAt(pts[0],pts[1],pts[2]), angleAt(pts[1],pts[0],pts[2]), angleAt(pts[2],pts[0],pts[1])];
    const acute = angs.find(a => Math.abs(a - Math.PI/2) > 0.05 && a < Math.PI/2 + 0.2);
    return acute ? {h:info.h, ang:round3(acute)} : null;
  }

  /* ---------- تولید هدف ---------- */
  function generateTarget(mode){
    let model = null;
    if (mode === 'sss'){
      let a,b,c;
      do { a=rnd(2,12); b=rnd(2,12); c=rnd(2,12); } while (!isTriangle(a,b,c));
      model = buildFromSides(a,b,c);
    } else if (mode === 'sas'){
      const s1=rnd(3,12), s2=rnd(3,12), ang=rnd(25,120);
      model = buildFromSAS(s1, deg2rad(ang), s2);
    } else if (mode === 'asa'){
      let ang1=rnd(25,70), ang2=rnd(20,80);
      if (ang1+ang2 >= 175){ ang1=40; ang2=60; }
      const side = rnd(3,10);
      model = buildFromASA(deg2rad(ang1), side, deg2rad(ang2));
    } else if (mode === 'rhs-leg'){
      let hyp=rnd(7,16); let leg=rnd(3,hyp-0.6);
      while (leg >= hyp - 0.05) leg = rnd(2,hyp-0.6);
      model = buildFromHypLeg(hyp, leg);
    } else if (mode === 'rhs-ang'){
      const hyp=rnd(7,16); const ang = rnd(20,70);
      model = buildFromHypAng(hyp, deg2rad(ang));
    }
    if (!model || !model.valid) return generateTarget(mode);
    return model;
  }

  /* ---------- UI پارامترها (target/player) ---------- */
  function clearElement(el){ while (el.firstChild) el.removeChild(el.firstChild); }

  function showTargetInfo(model){
    clearElement(targetParams);
    if (!model || !model.valid){ targetInfo.textContent = 'هدف نامعتبر'; return; }
    targetInfo.textContent = اضلاع: ${model.sides.map(v=>v.toFixed(2)).join(' , ')};
    const rows = [
      ['a (BC)', model.sides[0]],
      ['b (AC)', model.sides[1]],
      ['c (AB)', model.sides[2]]
    ];
    rows.forEach(r=>{
      const div = document.createElement('div'); div.className='param-row';
      div.innerHTML = <label>${r[0]}</label><div class="val">${r[1]}</div>;
      targetParams.appendChild(div);
    });
  }

  function buildPlayerUI(mode){
    clearElement(playerParams);
    function addNumber(label, id, val=5, min=0.3, max=60, step=0.1){
      const row = document.createElement('div'); row.className='param-row';
      row.innerHTML = <label>${label}</label><input id="${id}" type="number" min="${min}" max="${max}" step="${step}" value="${val}">;
      playerParams.appendChild(row);
      document.getElementById(id).addEventListener('input', onPlayerInputChange);
    }
    function addAngle(label, id, val=40){
      const row = document.createElement('div'); row.className='param-row';
      row.innerHTML = <label>${label}</label><input id="${id}" type="number" min="1" max="178" step="0.5" value="${val}">;
      playerParams.appendChild(row);
      document.getElementById(id).addEventListener('input', onPlayerInputChange);
    }

    if (mode === 'sss'){
      addNumber('ضلع ۱ (a)', 'p-s1', 5);
      addNumber('ضلع ۲ (b)', 'p-s2', 6);
      addNumber('ضلع ۳ (c)', 'p-s3', 7);
    } else if (mode === 'sas'){
      addNumber('ضلع کناری ۱', 'p-s1', 5);
      addAngle('زاویه بین (درجه)', 'p-ang', 40);
      addNumber('ضلع کناری ۲', 'p-s2', 6);
    } else if (mode === 'asa'){
      addAngle('زاویه ۱', 'p-ang1', 40);
      addNumber('ضلع بین', 'p-side', 5);
      addAngle('زاویه ۲', 'p-ang2', 60);
    } else if (mode === 'rhs-leg'){
      addNumber('وتر (و)', 'p-hyp', 10);
      addNumber('ضلع مجاور (ض)', 'p-leg', 6);
    } else if (mode === 'rhs-ang'){
      addNumber('وتر (و)', 'p-hyp', 10);
      addAngle('زاویه حاده (درجه)', 'p-ang', 30);
    }
  }

  function onPlayerInputChange(){
    buildPlayFromUI();
    render();
  }

  function buildPlayFromUI(){
    const mode = modeSelect.value;
    try {
      if (mode === 'sss'){
        const s1=+document.getElementById('p-s1').value;
        const s2=+document.getElementById('p-s2').value;
        const s3=+document.getElementById('p-s3').value;
        playModel = buildFromSides(s1,s2,s3);
      } else if (mode === 'sas'){
        const s1=+document.getElementById('p-s1').value;
        const ang=deg2rad(+document.getElementById('p-ang').value);
        const s2=+document.getElementById('p-s2').value;
        playModel = buildFromSAS(s1,ang,s2);
      } else if (mode === 'asa'){
        const ang1=deg2rad(+document.getElementById('p-ang1').value);
        const side=+document.getElementById('p-side').value;
        const ang2=deg2rad(+document.getElementById('p-ang2').value);
        playModel = buildFromASA(ang1,side,ang2);
      } else if (mode === 'rhs-leg'){
        const hyp=+document.getElementById('p-hyp').value;
        const leg=+document.getElementById('p-leg').value;
        playModel = buildFromHypLeg(hyp,leg);
      } else if (mode === 'rhs-ang'){
        const hyp=+document.getElementById('p-hyp').value;
        const ang=deg2rad(+document.getElementById('p-ang').value);
        playModel = buildFromHypAng(hyp,ang);
      }
      if (!playModel || !playModel.valid) {
        statusEl.textContent = 'پارامترهای شما نامعتبرند';
      } else {
        statusEl.textContent = 'پارامترها به‌روزرسانی شدند';
      }
    } catch (e){
      playModel = {valid:false, reason:'ورودی خطا'};
      statusEl.textContent = 'خطای ورودی';
    }
  }

  /* ---------- مقایسه هم‌نهشتی براساس حالت ---------- */
  function areCongruent(A,B){
    if (!A || !A.valid) return {ok:false, reason:'هدف نامعتبر'};
    if (!B || !B.valid) return {ok:false, reason:'مثلث شما نامعتبر'};
    const mode = modeSelect.value;
    if (mode === 'sss'){
      const sa = [...A.sides].sort((x,y)=>x-y);
      const sb = [...B.sides].sort((x,y)=>x-y);
      const ok = sa.every((v,i)=> Math.abs(v - sb[i]) < Math.max(TOL, 0.03*v));
      return {ok, reason: ok ? 'سه ضلع مطابق‌اند' : 'سه ضلع برابر نیستند'};
    } else if (mode === 'sas'){
      const ia = extractSAS(A.points), ib = extractSAS(B.points);
      const angDiff = Math.abs(ia.ang - ib.ang);
      const ok = Math.abs(ia.s1 - ib.s1) < Math.max(0.04,0.02*ia.s1) && Math.abs(ia.s2 - ib.s2) < Math.max(0.04,0.02*ia.s2) && angDiff < deg2rad(3.5);
      return {ok, reason: ok ? 'SAS برقرار است' : 'SAS برقرار نیست'};
    } else if (mode === 'asa'){
      const ia = extractASA(A.points), ib = extractASA(B.points);
      const ok = Math.abs(ia.side - ib.side) < Math.max(0.04,0.02*ia.side) && Math.abs(ia.ang1 - ib.ang1) < deg2rad(3.5) && Math.abs(ia.ang2 - ib.ang2) < deg2rad(3.5);
      return {ok, reason: ok ? 'ASA برقرار است' : 'ASA برقرار نیست'};
    } else if (mode === 'rhs-leg'){
      const ia = extractHypLeg(A.points), ib = extractHypLeg(B.points);
      if (!ia || !ib) return {ok:false, reason:'یکی از مثلث‌ها قائم نیست'};
      const ok = Math.abs(ia.h - ib.h) < 0.06 && Math.abs(ia.leg - ib.leg) < 0.06;
      return {ok, reason: ok ? '(و،ض) برقرار است' : '(و،ض) برقرار نیست'};
    } else if (mode === 'rhs-ang'){
      const ia = extractHypAng(A.points), ib = extractHypAng(B.points);
      if (!ia || !ib) return {ok:false, reason:'یکی از مثلث‌ها قائم نیست'};
      const ok = Math.abs(ia.h - ib.h) < 0.06 && Math.abs(ia.ang - ib.ang) < deg2rad(3.2);
      return {ok, reason: ok ? '(و،ز) برقرار است' : '(و،ز) برقرار نیست'};
    }
    return {ok:false, reason:'حالت نامشخص'};
  }

  /* ---------- رسم: main canvas (دو مثلث، راهنمایی‌ها) ---------- */
  function render(){
    if (!mainCtx) return;
    const W = mainCanvas.width / DPR, H = mainCanvas.height / DPR;
    // پس‌زمینه
    mainCtx.clearRect(0,0,W,H);
    const g = mainCtx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'rgba(255,255,255,0.02)');
    g.addColorStop(1,'rgba(0,0,0,0.03)');
    mainCtx.fillStyle = g;
    mainCtx.fillRect(0,0,W,H);

    // grid
    drawGrid(W,H);

    // combine box
    const models = [];
    if (targetModel && targetModel.valid) models.push(targetModel);
    if (playModel && playModel.valid) models.push(playModel);
    const box = computeBox(models);
    if (targetModel && targetModel.valid) drawTriangleOnCanvas(targetModel.points, box, {stroke1:'#ff7a7a', stroke2:'#ffd86b', fill:'rgba(255,107,107,0.12)', label:'هدف'});
    if (playModel && playModel.valid) drawTriangleOnCanvas(playModel.points, box, {stroke1:'#6bffd9', stroke2:'#6b8cff', fill:'rgba(107,255,217,0.12)', label:'تو'});
    // draw help text
    infoBar.textContent = (targetModel && targetModel.valid) ? اضلاع هدف: ${targetModel.sides.map(v=>v.toFixed(2)).join(' , ')} : 'هدف نامعتبر';
    modeDisplay.textContent = modeSelect.options[modeSelect.selectedIndex].text;
  }

  function drawGrid(W,H){
    mainCtx.save();
    mainCtx.globalAlpha = 0.06;
    mainCtx.strokeStyle = '#ffffff';
    mainCtx.lineWidth = 1;
    const step = 28;
    for (let x=0;x<W;x+=step){ mainCtx.beginPath(); mainCtx.moveTo(x,0); mainCtx.lineTo(x,H); mainCtx.stroke(); }
    for (let y=0;y<H;y+=step){ mainCtx.beginPath(); mainCtx.moveTo(0,y); mainCtx.lineTo(W,y); mainCtx.stroke(); }
    mainCtx.restore();
  }

  function computeBox(models){
    if (!models.length) return {minX:-10, maxX:10, minY:-10, maxY:10};
    let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
    models.forEach(m=>{
      if (!m.valid) return;
      m.points.forEach(p=>{
        minX=Math.min(minX,p.x); maxX=Math.max(maxX,p.x);
        minY=Math.min(minY,p.y); maxY=Math.max(maxY,p.y);
      });
    });
    if (!isFinite(minX)){ minX=-10; maxX=10; minY=-10; maxY=10; }
    const pad = 1;
    return {minX: minX-pad, maxX: maxX+pad, minY: minY-pad, maxY: maxY+pad};
  }

  function worldToCanvas(pt, box, W, H){
    const pad = 40;
    const bw = box.maxX - box.minX;
    const bh = box.maxY - box.minY;
    const scale = Math.min((W-2*pad)/bw, (H-2*pad)/bh) * 0.95;
    const cx = (box.minX + box.maxX)/2;
    const cy = (box.minY + box.maxY)/2;
    const x = (pt.x - cx) * scale + W/2;
    const y = (-(pt.y - cy)) * scale + H/2;
    return {x,y,scale};
  }

  function drawTriangleOnCanvas(pts, box, style, label){
    const W = mainCanvas.width / DPR, H = mainCanvas.height / DPR;
    const p0 = worldToCanvas(pts[0], box, W, H);
    const p1 = worldToCanvas(pts[1], box, W, H);
    const p2 = worldToCanvas(pts[2], box, W, H);

    const path = new Path2D();
    path.moveTo(p0.x,p0.y); path.lineTo(p1.x,p1.y); path.lineTo(p2.x,p2.y); path.closePath();

    mainCtx.save();
    // fill
    mainCtx.fillStyle = style.fill || 'rgba(255,255,255,0.06)';
    mainCtx.fill(path);
    // stroke gradient
    const grd = mainCtx.createLinearGradient(p0.x,p0.y,p2.x,p2.y);
    grd.addColorStop(0, style.stroke1);
    grd.addColorStop(1, style.stroke2);
    mainCtx.strokeStyle = grd;
    mainCtx.lineWidth = 4;
    mainCtx.stroke(path);
    // vertices
    [p0,p1,p2].forEach((p,i)=>{
      mainCtx.beginPath(); mainCtx.arc(p.x,p.y,6,0,Math.PI*2); mainCtx.fillStyle='#fff'; mainCtx.fill();
      mainCtx.beginPath(); mainCtx.arc(p.x,p.y,4,0,Math.PI*2); mainCtx.fillStyle = (style.stroke1 || '#fff'); mainCtx.fill();
      mainCtx.fillStyle = '#fff'; mainCtx.font = '12px Vazirmatn'; mainCtx.fillText(['A','B','C'][i], p.x+8, p.y-8);
    });
    // label
    mainCtx.fillStyle = '#fff'; mainCtx.font = '14px Vazirmatn';
    mainCtx.fillText(label, (p0.x+p1.x+p2.x)/3 - 12, (p0.y+p1.y+p2.y)/3 - 12);
    mainCtx.restore();
  }

  /* ---------- drag/touch برای جابجایی رئوس مثلث playModel ---------- */
  let drag = {active:false, idx:null, pointerId:null};
  mainCanvas.addEventListener('pointerdown', (e) => {
    const pos = getPointerPos(e);
    if (!playModel || !playModel.valid) return;
    const W = mainCanvas.width/DPR, H = mainCanvas.height/DPR;
    const box = computeBox([targetModel, playModel]);
    const pts = playModel.points.map(p => worldToCanvas(p, box, W, H));
    for (let i=0;i<3;i++){
      const dx = pos.x - pts[i].x, dy = pos.y - pts[i].y;
      if (Math.hypot(dx,dy) < 14){
        drag.active = true; drag.idx = i; drag.pointerId = e.pointerId;
        mainCanvas.setPointerCapture && mainCanvas.setPointerCapture(e.pointerId);
        return;
      }
    }
  });
  mainCanvas.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    if (drag.pointerId !== e.pointerId) return;
    const pos = getPointerPos(e);
    const W = mainCanvas.width/DPR, H = mainCanvas.height/DPR;
    const box = computeBox([targetModel, playModel]);
    const world = canvasToWorld(pos, box, W, H);
    playModel.points[drag.idx].x = world.x;
    playModel.points[drag.idx].y = world.y;
    // best-effort: do not sync numeric inputs to complex recomputation to avoid cycles
    render();
  });
  mainCanvas.addEventListener('pointerup', (e) => {
    if (drag.active && drag.pointerId === e.pointerId){
      drag.active=false; drag.idx=null; mainCanvas.releasePointerCapture && mainCanvas.releasePointerCapture(e.pointerId);
    }
  });
  mainCanvas.addEventListener('pointercancel', ()=> { drag.active=false; drag.idx=null; });

  function getPointerPos(e){
    const r = mainCanvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function canvasToWorld(pt, box, W, H){
    const pad = 40;
    const bw = box.maxX - box.minX;
    const bh = box.maxY - box.minY;
    const scale = Math.min((W-2*pad)/bw, (H-2*pad)/bh) * 0.95;
    const cx = (box.minX + box.maxX)/2;
    const cy = (box.minY + box.maxY)/2;
    const x = (pt.x - W/2)/scale + cx;
    const y = -(pt.y - H/2)/scale + cy;
    return {x,y};
  }

  /* ---------- effects: Pro mode (particles, glow) ---------- */
  let particles = [];
  function emitParticles(x,y,color,count=40){
    for (let i=0;i<count;i++){
      particles.push({
        x, y,
        vx: (Math.random()-0.5)*6,
        vy: (Math.random()-1.5)*6,
        life: Math.random()*900 + 600,
        size: Math.random()*6+4,
        color
      });
    }
  }
  function stepParticles(dt){
    effectsCtx.clearRect(0,0,effectsCanvas.width,effectsCanvas.height);
    const now = Date.now();
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx * (dt/16);
      p.y += p.vy * (dt/16);
      p.vy += 0.08 * (dt/16);
      p.life -= dt;
      effectsCtx.globalAlpha = clamp(p.life/1200,0,1);
      effectsCtx.fillStyle = p.color;
      effectsCtx.beginPath();
      effectsCtx.ellipse(p.x, p.y, p.size, p.size*0.6, 0, 0, Math.PI*2);
      effectsCtx.fill();
    });
  }

  /* ---------- افکت زمانی که پاسخ درست است ---------- */
  function celebrate(){
    // emit particles at center
    const centerX = effectsCanvas.width/2, centerY = effectsCanvas.height/2;
    emitParticles(centerX, centerY, '#6bffd9', 80);
    emitParticles(centerX, centerY, '#ffd86b', 60);
  }

  /* ---------- داینامیک لوپ افکت و render ---------- */
  let lastTime = performance.now();
  function animate(now){
    const dt = now - lastTime; lastTime = now;
    // only step heavy effects in Pro mode
    if (runModeSelect.value === 'pro') stepParticles(dt);
    requestAnimationFrame(animate);
  }

  /* ---------- تعاملات دکمه‌ها ---------- */
  modeSelect.addEventListener('change', () => {
    const mode = modeSelect.value;
    buildPlayerUI(mode);
    targetModel = generateTarget(mode);
    showTargetInfo(targetModel);
    buildPlayFromUI();
    render();
  });

  runModeSelect.addEventListener('change', () => {
    // clear effects on mode change
    effectsCtx.clearRect(0,0,effectsCanvas.width,effectsCanvas.height);
  });

  btnNew.addEventListener('click', () => {
    const mode = modeSelect.value;
    targetModel = generateTarget(mode);
    showTargetInfo(targetModel);
    buildDefaultPlayerFromTarget(targetModel);
    render();
  });

  btnRandom.addEventListener('click', () => {
    const mode = modeSelect.value;
    buildDefaultPlayerFromTarget(targetModel, true);
    render();
  });

  btnShowHint.addEventListener('click', () => {
    if (!targetModel) return;
    const mode = modeSelect.value;
    if (mode === 'sss') alert(سرنخ: اضلاع هدف ≈ ${targetModel.sides.map(v=>v.toFixed(2)).join(' , ')});
    else if (mode === 'sas') { const i=extractSAS(targetModel.points); alert(سرنخ: اضلاع ~ ${i.s1}, ${i.s2} — زاویه ~ ${rad2deg(i.ang).toFixed(1)}°); }
    else if (mode === 'asa') { const i=extractASA(targetModel.points); alert(سرنخ: زاویه‌ها ~ ${rad2deg(i.ang1).toFixed(1)}°, ${rad2deg(i.ang2).toFixed(1)}° — ضلع ~ ${i.side.toFixed(1)}); }
    else if (mode === 'rhs-leg') { const i=extractHypLeg(targetModel.points); alert(سرنخ: وتر ~ ${i.h.toFixed(1)} — ضلع ~ ${i.leg.toFixed(1)}); }
    else if (mode === 'rhs-ang') { const i=extractHypAng(targetModel.points); alert(سرنخ: وتر ~ ${i.h.toFixed(1)} — زاویه ~ ${rad2deg(i.ang).toFixed(1)}°); }
  });

  btnCheck.addEventListener('click', () => {
    buildPlayFromUI();
    const res = areCongruent(targetModel, playModel);
    if (res.ok){
      infoBar.textContent = '✔ هم‌نهشت هستند — تبریک!';
      infoBar.style.color = '#7fffd4';
      celebrate();
      if (runModeSelect.value === 'pro') {
        // soft glow on canvas (temporary)
        softGlow(800);
      }
    } else {
      infoBar.textContent = '✖ هم‌نهشت نیستند — علت: ' + res.reason;
      infoBar.style.color = '#ffd1d1';
      // small shake
      shakeCanvas();
    }
  });

  /* ---------- UI helpers: default player from target ---------- */
  function buildDefaultPlayerFromTarget(target, noisy=false){
    if (!target || !target.valid) return;
    const mode = modeSelect.value;
    if (mode === 'sss'){
      setInput('p-s1', target.sides[0] + (noisy?rnd(-0.5,0.5):0));
      setInput('p-s2', target.sides[1] + (noisy?rnd(-0.5,0.5):0));
      setInput('p-s3', target.sides[2] + (noisy?rnd(-0.5,0.5):0));
    } else if (mode === 'sas'){
      const i = extractSAS(target.points);
      setInput('p-s1', i.s1 + (noisy?rnd(-0.4,0.4):0));
      setInput('p-ang', rad2deg(i.ang) + (noisy?rnd(-3,3):0));
      setInput('p-s2', i.s2 + (noisy?rnd(-0.4,0.4):0));
    } else if (mode === 'asa'){
      const i = extractASA(target.points);
      setInput('p-ang1', rad2deg(i.ang1) + (noisy?rnd(-3,3):0));
      setInput('p-side', i.side + (noisy?rnd(-0.4,0.4):0));
      setInput('p-ang2', rad2deg(i.ang2) + (noisy?rnd(-3,3):0));
    } else if (mode === 'rhs-leg'){
      const i = extractHypLeg(target.points);
      setInput('p-hyp', i.h + (noisy?rnd(-0.4,0.4):0));
      setInput('p-leg', i.leg + (noisy?rnd(-0.4,0.4):0));
    } else if (mode === 'rhs-ang'){
      const i = extractHypAng(target.points);
      setInput('p-hyp', i.h + (noisy?rnd(-0.4,0.4):0));
      setInput('p-ang', rad2deg(i.ang) + (noisy?rnd(-3,3):0));
    }
    buildPlayFromUI();
  }
  function setInput(id,val){
    const el = document.getElementById(id); if (el) el.value = Math.round(val*100)/100;
  }

  /* ---------- UX helpers: soft glow & shake ---------- */
  function softGlow(ms=600){
    const start = performance.now();
    const step = (t) => {
      const p = (t - start) / ms;
      if (p > 1) { mainCanvas.style.boxShadow=''; return; }
      const glow = Math.sin(Math.PI * p) * 18;
      mainCanvas.style.boxShadow = 0 0 ${glow}px rgba(255,200,100,0.6);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function shakeCanvas(){
    const el = mainCanvas.parentElement;
    const dur = 400;
    const start = performance.now();
    const step = (t) => {
      const p = (t - start) / dur;
      if (p > 1){ el.style.transform=''; return; }
      const x = Math.sin(p * Math.PI * 8) * (1 - p) * 8;
      el.style.transform = translateX(${x}px);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- small utilities ---------- */
  function showError(msg){
    infoBar.textContent = 'خطا: ' + msg;
    infoBar.style.color = '#ffb3b3';
  }

  /* ---------- initialization ---------- */
  function init(){
    try {
      resize();
      // initial UI
      buildPlayerUI(modeSelect.value);
      targetModel = generateTarget(modeSelect.value);
      showTargetInfo(targetModel);
      buildDefaultPlayerFromTarget(targetModel, true);
      buildPlayFromUI();
      // start animation loop for effects
      requestAnimationFrame(animate);
      // keep rendering periodically
      setInterval(render, 700);
    } catch (e){
      console.error(e);
      showError('خطای داخلی — کنسول را بررسی کن');
    }
  }

  /* ---------- start ---------- */
  init();

  // expose a tiny API for debugging (in console)
  window.__TriLab = { buildFromSides, buildFromSAS, buildFromASA, buildFromHypLeg, generateTarget, areCongruent };

})();