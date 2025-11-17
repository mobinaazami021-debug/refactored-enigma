/* app.js
  بازی‌ـآزمایشگاه هم‌نهشتی مثلث‌ها — نسخهٔ پیشرفته و بازی‌وار
  نویسنده: آماده برای معلم
  توضیحات: پنج حالت: sss, sas, asa, rhs-leg (و،ض), rhs-ang (و،ز)
*/

(() => {
  // ---------- تنظیمات بازی ----------
  const LEVELS = [
    { mode: 'sss', title: '(ض،ض،ض)', desc: 'سه ضلع برابر' },
    { mode: 'sas', title: '(ض،ز،ض)', desc: 'ضلع - زاویه بین - ضلع' },
    { mode: 'asa', title: '(ز،ض،ز)', desc: 'زاویه - ضلع بین - زاویه' },
    { mode: 'rhs-leg', title: '(و،ض)', desc: 'وتر و ضلع مجاور (مثلث قائم)' },
    { mode: 'rhs-ang', title: '(و،ز)', desc: 'وتر و زاویه (مثلث قائم)' },
  ];

  // DOM
  const levelNum = document.getElementById('levelNum');
  const levelsTotal = document.getElementById('levelsTotal');
  const levelTitle = document.getElementById('levelTitle');
  const levelDesc = document.getElementById('levelDesc');
  const controls = document.getElementById('controls');
  const btnRandom = document.getElementById('btnRandom');
  const btnHint = document.getElementById('btnHint');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnSkip = document.getElementById('btnSkip');
  const message = document.getElementById('message');
  const hintBox = document.getElementById('hintBox');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const canvas = document.getElementById('gameCanvas');
  const confCanvas = document.getElementById('confetti');
  const resultModal = document.getElementById('resultModal');
  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');
  const nextBtn = document.getElementById('nextBtn');
  const retryBtn = document.getElementById('retryBtn');

  const ctx = canvas.getContext('2d');
  const confCtx = confCanvas.getContext('2d');

  // بازی‌وار
  let currentLevelIndex = 0;
  let score = 0;
  let lives = 3;

  // مدل‌ها: target (مثلث هدف)، play (مثلث بازیکن)
  let targetModel = null;
  let playModel = null;

  // تنظیم‌های گرافیکی
  let DPR = window.devicePixelRatio || 1;

  // ابعاد کانواس
  function resizeCanvases(){
    DPR = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * DPR);
    canvas.height = Math.floor(rect.height * DPR);
    confCanvas.width = canvas.width;
    confCanvas.height = canvas.height;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    confCtx.setTransform(DPR,0,0,DPR,0,0);
    render();
  }
  window.addEventListener('resize', () => { resizeCanvases(); });

  // init
  function init(){
    levelsTotal.textContent = LEVELS.length;
    loadLevel(0);
    resizeCanvases();
    attachHandlers();
  }

  // ========================
  // سطح‌بندی و UI پویا
  // ========================
  function loadLevel(index){
    currentLevelIndex = index % LEVELS.length;
    const L = LEVELS[currentLevelIndex];
    levelNum.textContent = currentLevelIndex + 1;
    levelTitle.textContent = چالش: ${L.title};
    levelDesc.textContent = L.desc;
    message.textContent = 'مثلث هدف را ببین و مثلث خودت را بساز.';
    generateNewTarget(L.mode);
    createControlsForMode(L.mode);
    // ساخت مثلث بازیکن با مقادیر پیش‌فرض از هدف (تا راحت‌تر شروع کنند)
    buildDefaultPlayModelFromTarget(L.mode);
    render();
  }

  // ورودی‌ها را براساس حالت می‌سازیم
  function createControlsForMode(mode){
    controls.innerHTML = '';
    function addNumber(label, id, min=0.5, max=40, step=0.1, val=5){
      const row = document.createElement('div'); row.className='control-row';
      row.innerHTML = <label>${label}</label><input id="${id}" type="number" min="${min}" max="${max}" step="${step}" value="${val}">;
      controls.appendChild(row);
      document.getElementById(id).addEventListener('input', onControlChange);
    }
    function addAngle(label, id, val=40){
      const row = document.createElement('div'); row.className='control-row';
      row.innerHTML = <label>${label}</label><input id="${id}" type="number" min="1" max="178" step="0.5" value="${val}">;
      controls.appendChild(row);
      document.getElementById(id).addEventListener('input', onControlChange);
    }

    if (mode === 'sss'){
      addNumber('ضلع ۱ (a)', 'p-s1', 0.5, 40, 0.1, 5);
      addNumber('ضلع ۲ (b)', 'p-s2', 0.5, 40, 0.1, 6);
      addNumber('ضلع ۳ (c)', 'p-s3', 0.5, 40, 0.1, 7);
    } else if (mode === 'sas'){
      addNumber('ضلع کناری ۱', 'p-s1', 0.5, 40, 0.1, 5);
      addAngle('زاویه بین (درجه)', 'p-ang', 20);
      addNumber('ضلع کناری ۲', 'p-s2', 0.5, 40, 0.1, 6);
    } else if (mode === 'asa'){
      addAngle('زاویه ۱ (درجه)', 'p-ang1', 40);
      addNumber('ضلع بین دو زاویه', 'p-side', 0.5, 40, 0.1, 5);
      addAngle('زاویه ۲ (درجه)', 'p-ang2', 60);
    } else if (mode === 'rhs-leg'){
      addNumber('وتر (و)', 'p-hyp', 0.6, 60, 0.1, 10);
      addNumber('ضلع مجاور (ض)', 'p-leg', 0.1, 59, 0.1, 6);
    } else if (mode === 'rhs-ang'){
      addNumber('وتر (و)', 'p-hyp', 0.6, 60, 0.1, 10);
      addAngle('زاویه حاده (درجه)', 'p-ang', 30);
    }
  }

  function onControlChange(){
    // بازسازی playModel از ورودی‌ها
    buildPlayModelFromControls();
    render();
  }

  // ========================
  // تولید مثلث هدف (تصادفی و معتبر)
  // ========================
  // helper: عدد تصادفی اعشاری
  function rnd(min,max,step=0.1){
    const cnt = Math.round((max-min)/step);
    return Math.round((min + Math.floor(Math.random()*(cnt+1))*step)*1000)/1000;
  }

  function generateNewTarget(mode){
    // تولید هدف متناسب با حالت
    if (mode === 'sss'){
      // تولید سه ضلع که مثلث بسازند
      let a,b,c;
      do {
        a = rnd(2,12); b = rnd(2,12); c = rnd(2,12);
      } while (!isTriangle(a,b,c));
      targetModel = buildFromSides(a,b,c);
    } else if (mode === 'sas'){
      const s1 = rnd(3,10), s2 = rnd(3,10), ang = rnd(20,120);
      targetModel = buildFromSAS(s1, deg2rad(ang), s2);
    } else if (mode === 'asa'){
      let ang1 = rnd(25,70), ang2 = rnd(20,80);
      if (ang1 + ang2 >= 175) { ang1 = 40; ang2 = 60; }
      const side = rnd(3,10);
      targetModel = buildFromASA(deg2rad(ang1), side, deg2rad(ang2));
    } else if (mode === 'rhs-leg'){
      // hyp > leg
      let hyp = rnd(6,15), leg = rnd(3,Math.max(3,hyp-0.5));
      while (leg >= hyp - 0.05) leg = rnd(2,Math.max(2,hyp-0.5));
      targetModel = buildFromHypLeg(hyp, leg);
    } else if (mode === 'rhs-ang'){
      let hyp = rnd(6,15), ang = rnd(20,70);
      targetModel = buildFromHypAng(hyp, deg2rad(ang));
    }
    // در صورت خطا دوباره تولید کن
    if (!targetModel || !targetModel.valid) generateNewTarget(mode);
    // hint box update
    hintBox.textContent = ID هدف: ${Math.floor(Math.random()*9000+1000)} — تمرین کن!;
  }

  // ساخت default play model مطابق target (اما کمی متفاوت برای بازی)
  function buildDefaultPlayModelFromTarget(mode){
    if (!targetModel) return;
    // کپی جزئی از target یا مقادیر تصادفی نزدیک
    if (mode === 'sss'){
      setControlVal('p-s1', targetModel.sides[0] + rnd(-0.8,0.8));
      setControlVal('p-s2', targetModel.sides[1] + rnd(-0.8,0.8));
      setControlVal('p-s3', targetModel.sides[2] + rnd(-0.8,0.8));
    } else if (mode === 'sas'){
      const info = extractSASFromPoints(targetModel.points);
      setControlVal('p-s1', info.s1 + rnd(-0.6,0.6));
      setControlVal('p-ang', rad2deg(info.ang) + rnd(-3,3));
      setControlVal('p-s2', info.s2 + rnd(-0.6,0.6));
    } else if (mode === 'asa'){
      const info = extractASAFromPoints(targetModel.points);
      setControlVal('p-ang1', rad2deg(info.ang1) + rnd(-3,3));
      setControlVal('p-side', info.side + rnd(-0.6,0.6));
      setControlVal('p-ang2', rad2deg(info.ang2) + rnd(-3,3));
    } else if (mode === 'rhs-leg'){
      const info = extractHypLeg(targetModel.points);
      setControlVal('p-hyp', info.h + rnd(-0.6,0.6));
      setControlVal('p-leg', info.leg + rnd(-0.6,0.6));
    } else if (mode === 'rhs-ang'){
      const info = extractHypAng(targetModel.points);
      setControlVal('p-hyp', info.h + rnd(-0.6,0.6));
      setControlVal('p-ang', rad2deg(info.ang) + rnd(-3,3));
    }
    buildPlayModelFromControls();
  }

  function setControlVal(id,val){
    const el = document.getElementById(id);
    if (el) el.value = Math.round(val*100)/100;
  }

  // خواندن کنترل‌ها و ساخت playModel
  function buildPlayModelFromControls(){
    const L = LEVELS[currentLevelIndex];
    const mode = L.mode;
    try {
      if (mode === 'sss'){
        const s1 = parseFloat(document.getElementById('p-s1').value);
        const s2 = parseFloat(document.getElementById('p-s2').value);
        const s3 = parseFloat(document.getElementById('p-s3').value);
        playModel = buildFromSides(s1,s2,s3);
      } else if (mode === 'sas'){
        const s1 = parseFloat(document.getElementById('p-s1').value);
        const ang = deg2rad(parseFloat(document.getElementById('p-ang').value));
        const s2 = parseFloat(document.getElementById('p-s2').value);
        playModel = buildFromSAS(s1, ang, s2);
      } else if (mode === 'asa'){
        const ang1 = deg2rad(parseFloat(document.getElementById('p-ang1').value));
        const side = parseFloat(document.getElementById('p-side').value);
        const ang2 = deg2rad(parseFloat(document.getElementById('p-ang2').value));
        playModel = buildFromASA(ang1, side, ang2);
      } else if (mode === 'rhs-leg'){
        const hyp = parseFloat(document.getElementById('p-hyp').value);
        const leg = parseFloat(document.getElementById('p-leg').value);
        playModel = buildFromHypLeg(hyp, leg);
      } else if (mode === 'rhs-ang'){
        const hyp = parseFloat(document.getElementById('p-hyp').value);
        const ang = deg2rad(parseFloat(document.getElementById('p-ang').value));
        playModel = buildFromHypAng(hyp, ang);
      }
    } catch (e){
      playModel = {valid:false, reason:'ورودی نامعتبر'};
    }
    // اگر نامعتبر باشه، اجازه نده برسیم به رسم
    if (!playModel || !playModel.valid) {
      playModel = playModel || {valid:false, reason:'پارامتر نامعتبر'};
    }
  }

  // ========================
  // ساخت مثلث‌ها — توابع پایه هندسی
  // ========================
  const EPS = 1e-6;
  function isTriangle(a,b,c){ return (a+b > c + EPS) && (a+c > b + EPS) && (b+c > a + EPS); }
  function deg2rad(d){ return d * Math.PI / 180; }
  function rad2deg(r){ return r * 180 / Math.PI; }
  function dist(p,q){ return Math.hypot(p.x - q.x, p.y - q.y); }
  function round3(v){ return Math.round(v*1000)/1000; }

  // A(0,0), B(c,0) convention for buildFromSides: a=BC, b=AC, c=AB
  function buildFromSides(a,b,c){
    if (a <= 0 || b <= 0 || c <= 0) return {valid:false, reason:'طول منفی یا صفر'};
    if (!isTriangle(a,b,c)) return {valid:false, reason:'این سه ضلع مثلث نمی‌سازند'};
    const xC = (b*b + c*c - a*a) / (2*c);
    const y2 = b*b - xC*xC;
    if (y2 < -1e-6) return {valid:false, reason:'خطای محاسبه مختصات'};
    const yC = Math.sqrt(Math.max(0,y2));
    const A = {x:0, y:0}, B={x:c, y:0}, C={x:xC, y:yC};
    return {valid:true, sides:[round3(a),round3(b),round3(c)], points:[A,B,C]};
  }

  function buildFromSAS(s1,ang,s2){
    if (s1 <= 0 || s2 <= 0) return {valid:false, reason:'طول منفی یا صفر'};
    const A = {x:0,y:0};
    const B = {x:s1,y:0};
    const C = {x: s2*Math.cos(ang), y: s2*Math.sin(ang)};
    if (Math.abs(areaTriangle(A,B,C)) < 1e-6) return {valid:false, reason:'مثلث مسطح است'};
    const a = dist(B,C), b = s2, c = s1;
    return {valid:true, sides:[round3(a),round3(b),round3(c)], points:[A,B,C]};
  }

  function buildFromASA(ang1,side,ang2){
    const ang3 = Math.PI - ang1 - ang2;
    if (ang3 <= 0) return {valid:false, reason:'زاویه‌ها نامعتبر'};
    const k = side / Math.sin(ang3);
    const a = k * Math.sin(ang1); // BC
    const b = k * Math.sin(ang2); // AC
    const c = side; // AB
    return buildFromSides(a,b,c);
  }

  function buildFromHypLeg(hyp,leg){
    if (hyp <= 0 || leg <= 0) return {valid:false, reason:'طول نامعتبر'};
    if (leg >= hyp - 0.05) return {valid:false, reason:'ضلع نمی‌تواند برابر یا بزرگ‌تر از وتر باشد'};
    const other = Math.sqrt(Math.max(0, hyp*hyp - leg*leg));
    // coordinates: right angle at origin (0,0), leg along x, other along y
    const A = {x:0,y:0}, B={x:leg,y:0}, C={x:0,y:other};
    const a = dist(B,C), b = dist(A,C), c = dist(A,B);
    return {valid:true, sides:[round3(a),round3(b),round3(c)], points:[A,B,C], right:true};
  }

  function buildFromHypAng(hyp,ang){
    if (hyp <= 0) return {valid:false, reason:'وتر نامعتبر'};
    const adj = hyp * Math.cos(ang);
    const opp = hyp * Math.sin(ang);
    if (adj <= 0 || opp <= 0) return {valid:false, reason:'زاویه نامعتبر'};
    const A = {x:0,y:0}, B={x:adj,y:0}, C={x:0,y:opp};
    const a = dist(B,C), b = dist(A,C), c = dist(A,B);
    return {valid:true, sides:[round3(a),round3(b),round3(c)], points:[A,B,C], right:true};
  }

  function areaTriangle(A,B,C){ return 0.5*Math.abs((B.x-A.x)(C.y-A.y)-(C.x-A.x)(B.y-A.y)); }

  // ========================
  // استخراج پارامترها از نقاط برای مقایسه
  // ========================
  function extractSASFromPoints(pts){
    const A = pts[0], B = pts[1], C = pts[2];
    const s1 = dist(A,B), s2 = dist(A,C);
    const v1 = {x: B.x - A.x, y: B.y - A.y}, v2 = {x: C.x - A.x, y: C.y - A.y};
    const ang = Math.acos(clamp((v1.x*v2.x + v1.y*v2.y) / (Math.hypot(v1.x,v1.y)*Math.hypot(v2.x,v2.y)), -1, 1));
    return {s1:round3(s1), s2:round3(s2), ang:round3(ang)};
  }

  function extractASAFromPoints(pts){
    const A = pts[0], B = pts[1], C = pts[2];
    const side = dist(A,B);
    const angA = angleAt(A,B,C);
    const angB = angleAt(B,A,C);
    return {side:round3(side), ang1:round3(angA), ang2:round3(angB)};
  }

  function extractHypLeg(pts){
    const d01 = dist(pts[0],pts[1]), d12 = dist(pts[1],pts[2]), d02 = dist(pts[0],pts[2]);
    const arr = [{d:d01,p:[0,1]},{d:d12,p:[1,2]},{d:d02,p:[0,2]}].sort((a,b)=>b.d - a.d);
    const h = arr[0].d;
    const leg = Math.min(arr[1].d, arr[2].d);
    const okRight = Math.abs(h*h - (arr[1].d*arr[1].d + arr[2].d*arr[2].d)) < 0.05;
    return okRight ? {h:round3(h), leg:round3(leg)} : null;
  }

  function extractHypAng(pts){
    const info = extractHypLeg(pts);
    if (!info) return null;
    const angs = [ angleAt(pts[0],pts[1],pts[2]), angleAt(pts[1],pts[0],pts[2]), angleAt(pts[2],pts[0],pts[1]) ];
    const acute = angs.find(a => Math.abs(a - Math.PI/2) > 0.1 && a < Math.PI/2 + 0.2);
    return acute ? {h:info.h, ang: round3(acute)} : null;
  }

  function angleAt(P,Q,R){
    const v1 = {x:P.x - Q.x, y:P.y - Q.y}, v2 = {x:R.x - Q.x, y:R.y - Q.y};
    const dot = v1.x*v2.x + v1.y*v2.y;
    const m = Math.hypot(v1.x,v1.y)*Math.hypot(v2.x,v2.y);
    if (m === 0) return 0;
    return Math.acos(clamp(dot/m, -1, 1));
  }

  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

  // ========================
  // چک هم‌نهشتی براساس حالت
  // ========================
  function areCongruent(modelA, modelB){
    if (!modelA || !modelA.valid) return {ok:false, reason:'مثلث هدف نامعتبر'};
    if (!modelB || !modelB.valid) return {ok:false, reason:'مثلث تو نامعتبر'};
    const mode = LEVELS[currentLevelIndex].mode;
    if (mode === 'sss'){
      const sa = [...modelA.sides].sort((x,y)=>x-y);
      const sb = [...modelB.sides].sort((x,y)=>x-y);
      const ok = sa.every((v,i)=> Math.abs(v - sb[i]) < 0.06);
      return {ok, reason: ok ? 'سه ضلع برابرند' : 'سه ضلع برابر نیستند'};
    } else if (mode === 'sas'){
      const ia = extractSASFromPoints(modelA.points);
      const ib = extractSASFromPoints(modelB.points);
      if (!ia || !ib) return {ok:false, reason:'خطا در استخراج SAS'};
      const angDiff = Math.abs(ia.ang - ib.ang);
      const ok = Math.abs(ia.s1 - ib.s1) < 0.06 && Math.abs(ia.s2 - ib.s2) < 0.06 && angDiff < deg2rad(3.5);
      return {ok, reason: ok ? 'سازگار' : 'نامطابق'};
    } else if (mode === 'asa'){
      const ia = extractASAFromPoints(modelA.points);
      const ib = extractASAFromPoints(modelB.points);
      if (!ia || !ib) return {ok:false, reason:'خطا در استخراج ASA'};
      const ok = Math.abs(ia.side - ib.side) < 0.06 && Math.abs(ia.ang1 - ib.ang1) < deg2rad(3.5) && Math.abs(ia.ang2 - ib.ang2) < deg2rad(3.5);
      return {ok, reason: ok ? 'سازگار' : 'نامطابق'};
    } else if (mode === 'rhs-leg'){
      const ia = extractHypLeg(modelA.points);
      const ib = extractHypLeg(modelB.points);
      if (!ia || !ib) return {ok:false, reason:'یکی از مثلث‌ها قائم نیست یا استخراج نشد'};
      const ok = Math.abs(ia.h - ib.h) < 0.06 && Math.abs(ia.leg - ib.leg) < 0.06;
      return {ok, reason: ok ? 'سازگار' : 'نامطابق'};
    } else if (mode === 'rhs-ang'){
      const ia = extractHypAng(modelA.points);
      const ib = extractHypAng(modelB.points);
      if (!ia || !ib) return {ok:false, reason:'خطا در استخراج اطلاعات (و،ز)'};
      const ok = Math.abs(ia.h - ib.h) < 0.06 && Math.abs(ia.ang - ib.ang) < deg2rad(3.2);
      return {ok, reason: ok ? 'سازگار' : 'نامطابق'};
    }
    return {ok:false, reason:'حالت ناشناخته'};
  }

  // ========================
  // تعامل: دکمه‌ها
  // ========================
  btnRandom.addEventListener('click', ()=>{
    const L = LEVELS[currentLevelIndex];
    generateNewTarget(L.mode);
    buildDefaultPlayModelFromTarget(L.mode);
    render();
  });

  btnHint.addEventListener('click', ()=>{
    provideHint();
  });

  btnSubmit.addEventListener('click', ()=>{
    buildPlayModelFromControls();
    const res = areCongruent(targetModel, playModel);
    if (res.ok) {
      onWin();
    } else {
      onFail(res.reason);
    }
  });

  btnSkip.addEventListener('click', ()=>{
    lives = Math.max(0, lives - 1);
    updateHUD();
    showMessage('مرحله رد شد — یک جان کم شد', 1800);
    nextLevelAfter(800);
  });

  nextBtn && nextBtn.addEventListener('click', ()=>{
    resultModal.style.display = 'none';
    loadLevel((currentLevelIndex + 1) % LEVELS.length);
  });
  retryBtn && retryBtn.addEventListener('click', ()=>{
    resultModal.style.display = 'none';
    buildDefaultPlayModelFromTarget(LEVELS[currentLevelIndex].mode);
    render();
  });

  // hint ساده
  function provideHint(){
    const mode = LEVELS[currentLevelIndex].mode;
    let text = 'تهیهٔ راهنما...';
    if (mode === 'sss') text = اندازهٔ حدودی اضلاع: ${targetModel.sides.map(v=>v.toFixed(1)).join(' , ')};
    else if (mode === 'sas'){ const i = extractSASFromPoints(targetModel.points); text = اضلاع ~ ${i.s1}, ${i.s2} — زاویه ~ ${rad2deg(i.ang).toFixed(1)}°; }
    else if (mode === 'asa'){ const i = extractASAFromPoints(targetModel.points); text = زاویه‌ها ~ ${rad2deg(i.ang1).toFixed(1)}°, ${rad2deg(i.ang2).toFixed(1)}° — ضلع ~ ${i.side.toFixed(1)}; }
    else if (mode === 'rhs-leg'){ const i = extractHypLeg(targetModel.points); text = وتر ~ ${i.h.toFixed(1)} — ضلع ~ ${i.leg.toFixed(1)}; }
    else if (mode === 'rhs-ang'){ const i = extractHypAng(targetModel.points); text = وتر ~ ${i.h.toFixed(1)} — زاویه ~ ${rad2deg(i.ang).toFixed(1)}°; }
    hintBox.textContent = text;
  }

  // ========================
  // برد/باخت و امتیاز
  // ========================
  function onWin(){
    score += 100 + Math.floor(Math.random()*50);
    updateHUD();
    showConfetti();
    showResult(true, 'تبریک! هم‌نهشت شدند. امتیاز اضافه شد.');
    // بعد از اندکی، مرحله بعد
    setTimeout(()=> { resultModal.style.display = 'flex'; }, 700);
    // play sound (optional) - small beep
    playBeep(880, 0.08);
  }

  function onFail(reason){
    lives = Math.max(0, lives - 1);
    updateHUD();
    showMessage('نه! درست نشد — ' + reason, 2000);
    playBeep(220, 0.12);
    if (lives <= 0){
      showResult(false, 'جان‌ها تموم شد — بازی دوباره از اول.');
      score = Math.max(0, Math.floor(score/2));
      updateHUD();
      resultModal.style.display = 'flex';
    }
  }

  function nextLevelAfter(ms=1000){
    setTimeout(()=> loadLevel((currentLevelIndex+1)%LEVELS.length), ms);
  }

  function showResult(ok, text){
    resultTitle.textContent = ok ? 'موفقیت' : 'متأسفیم';
    resultText.textContent = text;
    resultModal.style.display = 'flex';
  }

  function updateHUD(){
    scoreEl.textContent = score;
    livesEl.textContent = lives;
  }

  function showMessage(text, ms=1200){
    message.textContent = text;
    setTimeout(()=> { message.textContent = 'مثلث هدف را ببین و مثلث خودت را بساز.'; }, ms);
  }

  // ========================
  // رسم حرفه‌ای روی کانواس
  // ========================
  function render(){
    if (!canvas) return;
    // clear
    const W = canvas.width / DPR, H = canvas.height / DPR;
    ctx.clearRect(0,0,W,H);
    // background gradient
    const g = ctx.createLinearGradient(0,0,W, H);
    g.addColorStop(0, 'rgba(255,255,255,0.02)');
    g.addColorStop(1, 'rgba(0,0,0,0.03)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    // draw grid (subtle)
    drawGrid(W,H);

    // compute bounding box from models to scale nicely
    const models = [];
    if (targetModel && targetModel.valid) models.push(targetModel);
    if (playModel && playModel.valid) models.push(playModel);
    const box = computeBoundingBox(models);
    // draw target triangles with gradient stroke and filled shadow
    if (targetModel && targetModel.valid) drawTriangle(targetModel.points, { stroke: ['#ff6b6b','#ffd86b'], fill: 'rgba(255,107,107,0.12)' }, box, 'هدف');
    if (playModel && playModel.valid) drawTriangle(playModel.points, { stroke: ['#6bffd9','#6b8cff'], fill: 'rgba(107,255,217,0.12)' }, box, 'تو');

    // labels and small info
    drawInfoBox(W,H,box);
  }

  function drawGrid(W,H){
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    const step = 30;
    for (let x=0;x<W;x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y=0;y<H;y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.restore();
  }

  function computeBoundingBox(models){
    if (!models.length) return {minX:-10,maxX:10,minY:-10,maxY:10};
    let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
    models.forEach(m=>{
      if (!m.valid) return;
      m.points.forEach(p=>{
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      });
    });
    if (!isFinite(minX)) { minX=-10; maxX=10; minY=-10; maxY=10; }
    const dx = maxX - minX, dy = maxY - minY;
    if (dx < 1){ minX -= 1; maxX += 1; }
    if (dy < 1){ minY -= 1; maxY += 1; }
    return {minX: minX-1, maxX: maxX+1, minY: minY-1, maxY: maxY+1};
  }

  function worldToCanvas(pt, box, W, H){
    const pad = 40;
    const bw = box.maxX - box.minX;
    const bh = box.maxY - box.minY;
    const scale = Math.min( (W - 2*pad)/bw, (H - 2*pad)/bh ) * 0.95;
    const cx = (box.minX + box.maxX)/2;
    const cy = (box.minY + box.maxY)/2;
    const x = (pt.x - cx) * scale + W/2;
    const y = (-(pt.y - cy)) * scale + H/2;
    return {x,y};
  }

  function drawTriangle(pts, style, box, label){
    const W = canvas.width / DPR, H = canvas.height / DPR;
    const p0 = worldToCanvas(pts[0], box, W, H);
    const p1 = worldToCanvas(pts[1], box, W, H);
    const p2 = worldToCanvas(pts[2], box, W, H);

    // fill with soft gradient
    ctx.save();
    const path = new Path2D();
    path.moveTo(p0.x,p0.y); path.lineTo(p1.x,p1.y); path.lineTo(p2.x,p2.y); path.closePath();
    ctx.fillStyle = style.fill;
    ctx.globalAlpha = 1;
    ctx.fill(path);

    // stroke with multi-color gradient
    const grd = ctx.createLinearGradient(p0.x,p0.y,p2.x,p2.y);
    grd.addColorStop(0, style.stroke[0]);
    grd.addColorStop(1, style.stroke[1]);
    ctx.strokeStyle = grd;
    ctx.lineWidth = 4;
    ctx.stroke(path);

    // vertices
    [p0,p1,p2].forEach((p,i)=>{
      ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fillStyle = style.stroke[0]; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '12px Vazirmatn'; ctx.fillText(['A','B','C'][i], p.x + 8, p.y - 8);
    });

    // label
    ctx.fillStyle = '#fff'; ctx.font = '14px Vazirmatn'; ctx.fillText(label, (p0.x+p1.x+p2.x)/3 - 12, (p0.y+p1.y+p2.y)/3 - 12);
    ctx.restore();
  }

  function drawInfoBox(W,H,box){
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(12,12,220,68);
    ctx.fillStyle = '#fff'; ctx.font = '14px Vazirmatn';
    ctx.fillText('اطلاعات هدف:', 20, 34);
    if (targetModel && targetModel.valid){
      const s = targetModel.sides.map(v=>v.toFixed(2)).join(' , ');
      ctx.fillText('اضلاع: ' + s, 20, 54);
    } else {
      ctx.fillText('هدف نامعتبر', 20, 54);
    }
    ctx.restore();
  }

  // ========================
  // کنفتی (ساده) برای شادی برد
  // ========================
  let confettiParticles = [];
  function showConfetti(){
    confettiParticles = [];
    const cnt = 60;
    for (let i=0;i<cnt;i++){
      confettiParticles.push({
        x: Math.random()*confCanvas.width,
        y: -20 - Math.random()*200,
        vx: Math.random()*6 - 3,
        vy: Math.random()*3 + 2,
        size: Math.random()*6 + 4,
        color: ['#ff6b6b','#ffd86b','#6bffd9','#9b8cff'][Math.floor(Math.random()*4)],
        rot: Math.random()*360,
        vr: Math.random()*10 - 5
      });
    }
    animateConfetti();
  }
  let confAnimId = null;
  function animateConfetti(){
    confCtx.clearRect(0,0,confCanvas.width, confCanvas.height);
    confAnimId && cancelAnimationFrame(confAnimId);
    function frame(){
      confCtx.clearRect(0,0,confCanvas.width, confCanvas.height);
      confParticlesStep();
      confAnimId = requestAnimationFrame(frame);
    }
    frame();
    // stop after 2200ms
    setTimeout(()=> { cancelAnimationFrame(confAnimId); confCtx.clearRect(0,0,confCanvas.width, confCanvas.height); }, 2200);
  }
  function confParticlesStep(){
    confCtx.save();
    confParticlesStep = function(){};
    confCtx.clearRect(0,0,confCanvas.width, confCanvas.height);
    confettiParticles.forEach(p=>{
      p.x += p.vx * DPR;
      p.y += p.vy * DPR;
      p.vy += 0.06;
      confCtx.save();
      confCtx.translate(p.x, p.y);
      confCtx.rotate(p.rot * Math.PI/180);
      confCtx.fillStyle = p.color;
      confCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      confCtx.restore();
    });
    confCtx.restore();
  }
  // hack: define once to be replaced
  let confParticlesStep = function(){};

  // ========================
  // صوت کوتاه
  // ========================
  function playBeep(freq=440, dur=0.1){
    try {
      const A = new (window.AudioContext || window.webkitAudioContext)();
      const o = A.createOscillator();
      const g = A.createGain();
      o.connect(g); g.connect(A.destination);
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, A.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, A.currentTime + 0.01);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + dur);
      setTimeout(()=>{ o.stop(); A.close(); }, dur*1000 + 50);
    } catch(e){}
  }

  // ========================
  // کمک‌های هندسی
  // ========================
  // (توابع قبلاً تعریف‌شده مثل dist, angleAt, ... استفاده می‌شوند)

  // ========================
  // تعامل لمسی/درگ: اجازه بده کاربر رئوس مثلث B را حرکت بده
  // ========================
  // برای سادگی: ما ورودی‌های عددی را تبدیل می‌کنیم به نقاط هندسی برای playModel
  // و همچنین امکان drag روی canvas برای جابجایی سه نقطه مثلث B فراهم می‌کنیم.
  let dragState = { active:false, idx:null, offsetX:0, offsetY:0 };
  canvas.addEventListener('pointerdown', (e) => {
    const pos = getPointerPos(e);
    // پیدا کردن کدام راس نزدیک است (از مدل play)
    if (!playModel || !playModel.valid) return;
    const W = canvas.width / DPR, H = canvas.height / DPR;
    const box = computeBoundingBox([targetModel, playModel]);
    const pts = playModel.points.map(p => worldToCanvas(p, box, W, H));
    for (let i=0;i<3;i++){
      const dx = pos.x - pts[i].x, dy = pos.y - pts[i].y;
      if (Math.hypot(dx,dy) < 14){
        dragState.active = true; dragState.idx = i; dragState.offsetX = dx; dragState.offsetY = dy;
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragState.active) return;
    const pos = getPointerPos(e);
    const W = canvas.width / DPR, H = canvas.height / DPR;
    const box = computeBoundingBox([targetModel, playModel]);
    // map canvas -> world
    const world = canvasToWorld(pos, box, W, H);
    // move the selected vertex to world
    playModel.points[dragState.idx].x = world.x;
    playModel.points[dragState.idx].y = world.y;
    // update control inputs if present (best-effort: update sides/angles is complex; skip)
    render();
  });
  canvas.addEventListener('pointerup', (e) => {
    if (dragState.active) { dragState.active=false; dragState.idx=null; canvas.releasePointerCapture && canvas.releasePointerCapture(e.pointerId); }
  });
  canvas.addEventListener('pointercancel', (e) => { dragState.active=false; dragState.idx=null; });

  function getPointerPos(e){
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left), y: (e.clientY - rect.top) };
  }
  function canvasToWorld(pt, box, W, H){
    const pad = 40;
    const bw = box.maxX - box.minX;
    const bh = box.maxY - box.minY;
    const scale = Math.min( (W - 2*pad)/bw, (H - 2*pad)/bh ) * 0.95;
    const cx = (box.minX + box.maxX)/2;
    const cy = (box.minY + box.maxY)/2;
    const x = (pt.x - W/2)/scale + cx;
    const y = -(pt.y - H/2)/scale + cy;
    return {x,y};
  }

  // ========================
  // اتصال/شروع
  // ========================
  function attachHandlers(){
    // initial controls change
    document.addEventListener('input', (e) => {
      if (e.target && e.target.id && e.target.id.startsWith('p-')) buildPlayModelFromControls();
    });
    // close modal by click outside
    resultModal.addEventListener('click', (e)=>{ if (e.target === resultModal) resultModal.style.display = 'none'; });
  }

  // ========================
  // اجرا
  // ========================
  init();
  updateHUD();

  // initial render loop (light)
  setInterval(()=>{ render(); }, 700);

  // ========================
  // پایان توابع کمکی — تابع‌های استخراج
  // ========================

  // (توضیح: توابع buildFromSides, buildFromSAS, ... قبلاً تعریف شده در این اسکوپ)
  // برای اطمینان از در دسترس بودن—آن‌ها در بالای فایل تعریف شدند.

})();