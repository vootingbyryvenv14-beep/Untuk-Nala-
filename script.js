(function () {
  'use strict';

  /* ===== Isi pesan (mudah diubah) ===== */
  var CFG = { to: 'Nala', from: 'Yoga' };
  var HELLO = [
    'Hai, Nala.',
    'Aku Yoga. Aku tidak pandai merangkai kata, jadi aku membuat ini supaya perasaanku sampai dengan caraku sendiri.',
    'Sejak mengenalmu, hari-hariku terasa lebih berwarna. Ada banyak hal kecil darimu yang diam-diam aku simpan.',
    'Boleh aku tunjukkan sebagian?'
  ];
  var REASONS = [
    { t: 'Senyummu', d: 'Sederhana, tapi bisa membuat hariku terasa lebih ringan.' },
    { t: 'Caramu bicara', d: 'Enak didengar, dan aku selalu ingin mendengar lebih lama.' },
    { t: 'Kamu apa adanya', d: 'Tidak perlu berpura-pura di dekatmu. Itu yang membuatku nyaman.' },
    { t: 'Tawamu', d: 'Menular. Aku sering ikut tersenyum sendiri setelahnya.' },
    { t: 'Dan masih banyak lagi', d: 'Terlalu banyak untuk ditulis di sini, jadi aku ceritakan langsung nanti.' }
  ];
  var YES_TEXT = [
    'Aku tidak tahu harus bilang apa selain terima kasih.',
    'Kamu baru saja membuat hari ini jadi hari terbaikku.',
    'Aku janji akan berusaha jadi seseorang yang bisa kamu andalkan, dan membuatmu tersenyum sebanyak yang aku bisa.'
  ];
  var SORRY_TEXT = [
    'Terima kasih sudah jujur, Nala, dan sudah membaca sampai sini.',
    'Maaf kalau perasaanku membuatmu tidak nyaman. Itu bukan niatku.',
    'Aku menghargai jawabanmu sepenuhnya, dan kamu tidak perlu merasa bersalah. Semoga harimu selalu penuh hal baik.'
  ];
  var NO_CHIPS = [
    'Aku belum siap berpacaran',
    'Aku belum punya perasaan itu',
    'Aku sedang fokus ke hal lain',
    'Aku lebih nyaman berteman',
    'Aku sudah ada yang lain'
  ];
  var WAIT_CHIPS = [
    { l: 'Besok', n: 1 }, { l: '3 hari lagi', n: 3 }, { l: 'Seminggu', n: 7 }, { l: 'Dua minggu', n: 14 }
  ];

  /* ===== Util ===== */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var dtf = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  var dfOnly = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  function span(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    return d + ' hari ' + pad(h) + ':' + pad(m) + ':' + pad(s);
  }
  function centerOf(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  /* ===== Kanvas ===== */
  var bg = $('#bg'), fx = $('#fx');
  var bctx = bg.getContext('2d'), fctx = fx.getContext('2d');
  var W = 0, H = 0, DPR = 1;
  var COLORS = ['#ff5d83', '#ffc9d4', '#ff8a6b', '#c9a6ff', '#ffd08a'];

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    [bg, fx].forEach(function (c) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); });
    bctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    makeBg();
  }
  function heart(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.15);
    ctx.bezierCurveTo(0, -s * 0.5, -s * 0.5, -s * 0.5, -s * 0.5, -s * 0.2);
    ctx.bezierCurveTo(-s * 0.5, s * 0.12, 0, s * 0.28, 0, s * 0.5);
    ctx.bezierCurveTo(0, s * 0.28, s * 0.5, s * 0.12, s * 0.5, -s * 0.2);
    ctx.bezierCurveTo(s * 0.5, -s * 0.5, 0, -s * 0.5, 0, -s * 0.15);
    ctx.closePath();
  }

  /* partikel latar */
  var mode = 'hearts', bgp = [];
  function spawnBg(init) {
    var p = { x: rand(0, W), y: init ? rand(0, H) : H + 40, s: rand(9, 28), vy: rand(0.25, 0.8), ph: rand(0, 6.28), sw: rand(10, 36), a: rand(0.1, 0.34), rot: rand(-0.5, 0.5), col: pick(COLORS), ang: rand(0, 6.28) };
    if (mode === 'petals') { p.y = init ? rand(0, H) : -30; p.vy = rand(0.5, 1.2); p.col = pick(['#ffc9d4', '#ff9db5', '#ffd9e0', '#e9b4ff']); p.a = rand(0.25, 0.55); }
    if (mode === 'fireflies') { p.y = rand(0, H); p.s = rand(2, 4.5); p.col = pick(['#ffd08a', '#ffe9b8', '#ffb36b']); }
    return p;
  }
  function makeBg() {
    bgp = [];
    var n = reduce ? 10 : (W < 600 ? 20 : 34);
    for (var i = 0; i < n; i++) bgp.push(spawnBg(true));
  }
  function setMode(m) { if (m !== mode) { mode = m; makeBg(); } }

  function drawBg(t) {
    bctx.clearRect(0, 0, W, H);
    for (var i = 0; i < bgp.length; i++) {
      var p = bgp[i];
      if (!reduce) {
        if (mode === 'hearts') { p.y -= p.vy; if (p.y < -40) bgp[i] = p = spawnBg(false); }
        else if (mode === 'petals') { p.y += p.vy; p.rot += 0.012; if (p.y > H + 40) bgp[i] = p = spawnBg(false); }
        else { p.ang += rand(-0.08, 0.08); p.x += Math.cos(p.ang) * 0.35; p.y += Math.sin(p.ang) * 0.35; if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10; if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10; }
      }
      var x = p.x + (mode === 'fireflies' ? 0 : Math.sin(t * 0.001 + p.ph) * p.sw);
      bctx.save();
      bctx.translate(x, p.y);
      if (mode === 'hearts') {
        bctx.rotate(p.rot + Math.sin(t * 0.0008 + p.ph) * 0.2);
        bctx.globalAlpha = p.a; bctx.fillStyle = p.col; heart(bctx, p.s); bctx.fill();
      } else if (mode === 'petals') {
        bctx.rotate(p.rot); bctx.globalAlpha = p.a; bctx.fillStyle = p.col;
        bctx.beginPath(); bctx.ellipse(0, 0, p.s * 0.32, p.s * 0.6, 0, 0, 6.2832); bctx.fill();
      } else {
        var pulse = 0.5 + 0.5 * Math.sin(t * 0.002 + p.ph);
        bctx.fillStyle = p.col;
        bctx.globalAlpha = 0.12 * pulse; bctx.beginPath(); bctx.arc(0, 0, p.s * 5, 0, 6.2832); bctx.fill();
        bctx.globalAlpha = 0.5 + 0.5 * pulse; bctx.beginPath(); bctx.arc(0, 0, p.s * 0.7, 0, 6.2832); bctx.fill();
      }
      bctx.restore();
    }
  }

  /* partikel efek */
  var fxp = [];
  function push(p) { if (fxp.length < 700) fxp.push(p); }
  function addConfetti(x, y, n, spread, up) {
    n = reduce ? Math.ceil(n / 3) : n;
    for (var i = 0; i < n; i++) {
      var a = rand(0, 6.2832), v = rand(2, spread || 9);
      push({ t: 'conf', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (up || 3), g: 0.14, drag: 0.985, life: rand(110, 190), max: 190, s: rand(5, 10), rot: rand(0, 6.28), vr: rand(-0.3, 0.3), col: pick(COLORS) });
    }
  }
  function addRain(n) {
    n = reduce ? 2 : n;
    for (var i = 0; i < n; i++) {
      push({ t: 'conf', x: rand(0, W), y: -12, vx: rand(-1, 1), vy: rand(2, 4.5), g: 0.03, drag: 0.995, life: 320, max: 320, s: rand(6, 11), rot: rand(0, 6.28), vr: rand(-0.2, 0.2), col: pick(COLORS) });
    }
  }
  function addHearts(x, y, n) {
    n = reduce ? Math.ceil(n / 2) : n;
    for (var i = 0; i < n; i++) {
      push({ t: 'heart', x: x + rand(-8, 8), y: y, vx: rand(-1.6, 1.6), vy: rand(-3.6, -1.4), g: -0.012, drag: 0.99, life: rand(70, 120), max: 120, s: rand(10, 22), rot: rand(-0.5, 0.5), vr: rand(-0.04, 0.04), col: pick(COLORS) });
    }
  }
  function addSparks(x, y, n) {
    n = reduce ? 3 : n;
    for (var i = 0; i < n; i++) {
      var a = rand(0, 6.2832), v = rand(1, 4);
      push({ t: 'spark', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.03, drag: 0.96, life: rand(25, 50), max: 50, s: rand(1.5, 3), col: pick(['#ffd08a', '#fff1ee', '#ffc9d4']) });
    }
  }
  function firework(x, y) {
    var col = pick(COLORS), n = reduce ? 14 : 46;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * 6.2832, v = rand(2.5, 5.5);
      push({ t: 'spark', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.05, drag: 0.965, life: rand(45, 75), max: 75, s: rand(2, 3.2), col: i % 3 ? col : '#fff1ee', trail: true });
    }
    addHearts(x, y, 4);
  }
  function drawFx() {
    fctx.clearRect(0, 0, W, H);
    for (var i = fxp.length - 1; i >= 0; i--) {
      var p = fxp[i];
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy; p.life--;
      if (p.rot !== undefined) p.rot += p.vr || 0;
      if (p.life <= 0 || p.y > H + 40 || p.y < -80) { fxp.splice(i, 1); continue; }
      var a = Math.min(1, p.life / (p.max * 0.4));
      fctx.save(); fctx.globalAlpha = a; fctx.translate(p.x, p.y);
      if (p.t === 'conf') {
        fctx.rotate(p.rot); fctx.scale(1, Math.cos(p.rot * 2)); fctx.fillStyle = p.col; fctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      } else if (p.t === 'heart') {
        fctx.rotate(p.rot); fctx.fillStyle = p.col; heart(fctx, p.s); fctx.fill();
      } else {
        fctx.fillStyle = p.col;
        if (p.trail) { fctx.strokeStyle = p.col; fctx.lineWidth = p.s * 0.8; fctx.beginPath(); fctx.moveTo(0, 0); fctx.lineTo(-p.vx * 2.2, -p.vy * 2.2); fctx.stroke(); }
        fctx.beginPath(); fctx.arc(0, 0, p.s, 0, 6.2832); fctx.fill();
      }
      fctx.restore();
    }
  }
  function frame(t) {
    if (!document.hidden) { drawBg(t); drawFx(); }
    requestAnimationFrame(frame);
  }

  /* ===== Musik (kotak musik sintetis) ===== */
  var actx = null, musicOn = false, mTimer = null, mStep = 0, mNext = 0;
  var SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
  var MELODY = [4, 2, 0, 2, 5, 4, 2, 1, 0, 2, 4, 5, 7, 5, 4, 2, 3, 2, 0, 1, 2, 4, 2, 0];
  function note(f, t, g) {
    var o = actx.createOscillator(), o2 = actx.createOscillator(), gn = actx.createGain();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'triangle'; o2.frequency.value = f * 2;
    var g2 = actx.createGain(); g2.gain.value = 0.25;
    o.connect(gn); o2.connect(g2); g2.connect(gn); gn.connect(actx.destination);
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.linearRampToValueAtTime(g, t + 0.01);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    o.start(t); o2.start(t); o.stop(t + 1.6); o2.stop(t + 1.6);
  }
  function startMusic() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.resume) actx.resume();
      musicOn = true; mNext = actx.currentTime + 0.05;
      clearInterval(mTimer);
      mTimer = setInterval(function () {
        while (mNext < actx.currentTime + 0.7) {
          note(SCALE[MELODY[mStep % MELODY.length]], mNext, 0.05);
          if (mStep % 8 === 0) note(130.81, mNext, 0.045);
          mStep++; mNext += 0.5;
        }
      }, 200);
    } catch (e) { musicOn = false; }
    syncMusicBtn();
  }
  function stopMusic() { musicOn = false; clearInterval(mTimer); syncMusicBtn(); }
  function syncMusicBtn() {
    var b = $('#music'); b.classList.toggle('on', musicOn);
    b.setAttribute('aria-pressed', String(musicOn));
    b.setAttribute('aria-label', musicOn ? 'Matikan musik' : 'Putar musik');
  }
  function chime(freqs) {
    if (!actx || !musicOn) return;
    var t = actx.currentTime + 0.02;
    freqs.forEach(function (f, i) { note(f, t + i * 0.12, 0.07); });
  }
  $('#music').addEventListener('click', function () { musicOn ? stopMusic() : startMusic(); });
  document.addEventListener('visibilitychange', function () {
    if (!actx) return;
    try { if (document.hidden) actx.suspend(); else if (musicOn) actx.resume(); } catch (e) {}
  });

  /* ===== Toast & salin ===== */
  var toastT = null;
  function toast(msg) {
    var el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }
  function copyText(text) {
    var done = function () { toast('Tersalin. Kirim ke Yoga ya.'); };
    var fail = function () {
      var box = $('#fallback'); box.value = text; box.hidden = false; box.focus(); box.select();
      toast('Tekan lama pada teks yang tersorot, lalu salin.');
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail);
      else fail();
    } catch (e) { fail(); }
  }
  $('#fallback').addEventListener('blur', function () { this.hidden = true; });

  /* ===== Efek mengetik ===== */
  var activeTyper = null;
  function typer(box, paras, speed) {
    var st = { skip: false, stop: false, finished: false };
    box.textContent = '';
    var ps = paras.map(function () { var p = document.createElement('p'); box.appendChild(p); return p; });
    var caret = document.createElement('span'); caret.className = 'caret';
    function finish() { ps.forEach(function (p, i) { p.textContent = paras[i]; }); st.finished = true; }
    st.done = (async function () {
      for (var i = 0; i < paras.length; i++) {
        var t = paras[i], tn = document.createTextNode('');
        ps[i].textContent = ''; ps[i].appendChild(tn); ps[i].appendChild(caret);
        for (var k = 1; k <= t.length; k++) {
          if (st.stop) return;
          if (st.skip) { finish(); return; }
          tn.data = t.slice(0, k);
          var ch = t.charAt(k - 1);
          await sleep(speed + (',.?!'.indexOf(ch) > -1 ? 140 : 0));
        }
        await sleep(260);
      }
      caret.remove(); st.finished = true;
    })();
    return st;
  }

  /* ===== Navigasi layar ===== */
  var cur = null, timers = [];
  var hooks = {};
  function clearTimers() {
    timers.forEach(function (t) { clearInterval(t); clearTimeout(t); });
    timers = [];
    if (activeTyper) activeTyper.stop = true;
  }
  function go(id) {
    var next = $('#s-' + id);
    if (!next || next === cur) return;
    clearTimers();
    if (cur) cur.classList.remove('active');
    next.classList.add('active'); next.scrollTop = 0; cur = next;
    document.body.setAttribute('data-mood', next.getAttribute('data-mood') || 'love');
    setMode(next.getAttribute('data-bg') || 'hearts');
    if (hooks[id]) hooks[id]();
  }

  /* ===== Tahap 1: amplop ===== */
  var opening = false;
  $('#env').addEventListener('click', async function () {
    if (opening) return; opening = true;
    this.classList.add('open'); $('#envHint').textContent = 'sebentar ya...';
    startMusic(); chime([659, 784, 988]);
    var c = centerOf(this); addHearts(c.x, c.y - 40, 10); addSparks(c.x, c.y - 60, 18);
    await sleep(1900);
    go('hello'); opening = false;
  });
  $('#today').textContent = 'Ditulis ' + dfOnly.format(new Date());

  /* ===== Tahap 2: pesan ===== */
  hooks.hello = function () {
    var t = activeTyper = typer($('#typed'), HELLO, 26);
    var b = $('#helloBtn'); b.textContent = 'Lewati';
    t.done.then(function () { if (!t.stop) b.textContent = 'Tunjukkan'; });
  };
  $('#helloBtn').addEventListener('click', function () {
    if (activeTyper && !activeTyper.finished) activeTyper.skip = true;
    else go('reasons');
  });

  /* ===== Tahap 3: alasan ===== */
  var ri = 0, dotsBox = $('#dots');
  REASONS.forEach(function () { dotsBox.appendChild(document.createElement('span')); });
  function renderReason(dir) {
    var r = REASONS[ri], card = $('#rcard');
    $('#rt').textContent = r.t; $('#rd').textContent = r.d;
    card.style.setProperty('--dx', (dir >= 0 ? 36 : -36) + 'px');
    card.style.setProperty('--rot', (dir >= 0 ? 2 : -2) + 'deg');
    card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
    $$('span', dotsBox).forEach(function (d, i) { d.classList.toggle('on', i === ri); });
    $('#rprev').style.visibility = ri === 0 ? 'hidden' : 'visible';
    $('#rnext').textContent = ri === REASONS.length - 1 ? 'Ke pertanyaanku' : 'Berikutnya';
    var c = centerOf(card); addHearts(c.x, c.y, 5);
  }
  hooks.reasons = function () { ri = 0; renderReason(1); };
  $('#rprev').addEventListener('click', function () { if (ri > 0) { ri--; renderReason(-1); } });
  $('#rnext').addEventListener('click', function () {
    if (ri < REASONS.length - 1) { ri++; renderReason(1); } else go('ask');
  });

  /* ===== Tahap 4: pertanyaan ===== */
  (function () {
    var box = $('#askTitle');
    (CFG.to + ', maukah kamu jadi pacarku?').split(' ').forEach(function (w, i, a) {
      var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--w', i); s.textContent = w;
      box.appendChild(s); if (i < a.length - 1) box.appendChild(document.createTextNode(' '));
    });
  })();
  hooks.ask = function () {
    timers.push(setInterval(function () {
      var y = $('#yes'); if (!y) return; var c = centerOf(y);
      addSparks(c.x + rand(-70, 70), c.y + rand(-26, 26), 2);
    }, 700));
  };
  $('#yes').addEventListener('click', function () {
    var c = centerOf(this); addConfetti(c.x, c.y, 60, 11, 4); addHearts(c.x, c.y, 14); chime([523, 659, 784, 1047, 1319]);
    setTimeout(function () { go('yes'); }, 650);
  });
  $('#no').addEventListener('click', function () { go('no'); });
  $('#maybe').addEventListener('click', function () { go('wait'); });

  /* ===== 5a: terima ===== */
  var acceptedAt = null;
  hooks.yes = function () {
    acceptedAt = new Date();
    $('#since').textContent = dtf.format(acceptedAt);
    activeTyper = typer($('#yesTyped'), YES_TEXT, 24);
    var tm = $('#timer');
    var tick = function () { tm.textContent = span(Date.now() - acceptedAt.getTime()); };
    tick(); timers.push(setInterval(tick, 1000));
    var fill = $('#meterFill'), val = $('#meterVal');
    fill.style.transition = 'none'; fill.style.width = '0'; void fill.offsetWidth; fill.style.transition = '';
    val.textContent = '0%';
    timers.push(setTimeout(function () {
      fill.style.width = '100%';
      var t0 = performance.now();
      var iv = setInterval(function () {
        var k = Math.min(1, (performance.now() - t0) / 2400);
        val.textContent = Math.round(k * 100) + '%' + (k >= 1 ? ' dan masih naik' : '');
        if (k >= 1) clearInterval(iv);
      }, 40);
      timers.push(iv);
    }, 600));
    var n = 0;
    addRain(40);
    timers.push(setInterval(function () { if (n++ < 30) addRain(5); }, 120));
    timers.push(setInterval(function () { firework(rand(W * 0.15, W * 0.85), rand(H * 0.12, H * 0.5)); }, 1100));
    timers.push(setTimeout(function () { firework(W * 0.5, H * 0.25); }, 250));
  };
  $('#copyYes').addEventListener('click', function () {
    copyText('Yoga, aku mau jadi pacarmu. (' + dtf.format(acceptedAt || new Date()) + ') - ' + CFG.to);
  });
  $('#restart1').addEventListener('click', restart);

  /* ===== 5b: tolak ===== */
  var chosen = [], reasonText = '';
  var chipBox = $('#chips'), ta = $('#reasonText'), sendBtn = $('#noSend');
  NO_CHIPS.forEach(function (label) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      var i = chosen.indexOf(label);
      if (i > -1) chosen.splice(i, 1); else chosen.push(label);
      b.setAttribute('aria-pressed', String(i === -1)); updateSend();
    });
    chipBox.appendChild(b);
  });
  function updateSend() { $('#cnt').textContent = ta.value.length; sendBtn.disabled = !(chosen.length || ta.value.trim()); }
  ta.addEventListener('input', updateSend);
  hooks.no = function () { updateSend(); };
  $('#noBack').addEventListener('click', function () { go('ask'); });
  sendBtn.addEventListener('click', function () {
    var extra = ta.value.trim();
    reasonText = chosen.join('; ') + (chosen.length && extra ? '. ' : '') + extra;
    go('sorry');
  });
  hooks.sorry = function () {
    $('#quoteText').textContent = reasonText;
    activeTyper = typer($('#sorryTyped'), SORRY_TEXT, 28);
  };
  $('#copyNo').addEventListener('click', function () {
    copyText('Yoga, maaf, aku belum bisa. Alasanku: ' + reasonText + ' - ' + CFG.to);
  });
  $('#changeAns').addEventListener('click', function () { go('ask'); });

  /* ===== 5c: mungkin ===== */
  var waitTarget = null, waitBox = $('#waitChips');
  WAIT_CHIPS.forEach(function (c) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = c.l; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      $$('.chip', waitBox).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      waitTarget = new Date(Date.now() + c.n * 86400000);
      $('#waitDate').textContent = dfOnly.format(waitTarget);
      $('#waitInfo').classList.add('show');
      var r = b.getBoundingClientRect(); addSparks(r.left + r.width / 2, r.top + r.height / 2, 14);
      var t = $('#waitTimer'); var tick = function () { t.textContent = span(waitTarget - Date.now()); };
      tick(); timers.push(setInterval(tick, 1000));
    });
    waitBox.appendChild(b);
  });
  hooks.wait = function () {
    timers.push(setInterval(function () { addSparks(rand(0, W), rand(0, H), 1); }, 900));
  };
  $('#copyWait').addEventListener('click', function () {
    copyText('Yoga, aku butuh waktu untuk memikirkannya. Aku akan memberi jawaban sebelum ' + dfOnly.format(waitTarget || new Date()) + '. - ' + CFG.to);
  });
  $('#waitBack').addEventListener('click', function () { go('ask'); });

  /* ===== Ulangi ===== */
  function restart() {
    $('#env').classList.remove('open'); $('#envHint').textContent = 'ketuk amplopnya';
    if ($('#giftBox')) { $('#giftBox').classList.remove('open'); $('#giftBox').setAttribute('aria-expanded','false'); $('#giftHint').textContent = 'Ada satu kejutan kecil untukmu · ketuk kotaknya'; }
    chosen = []; ta.value = ''; reasonText = '';
    $$('.chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
    $('#waitInfo').classList.remove('show');
    go('intro');
  }

  /* ===== Efek pointer ===== */
  var lastTrail = 0;
  document.addEventListener('pointermove', function (e) {
    if (reduce || e.pointerType === 'touch') return;
    var now = performance.now(); if (now - lastTrail < 55) return; lastTrail = now;
    addSparks(e.clientX, e.clientY, 2);
  });
  document.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button, textarea, input')) return;
    addHearts(e.clientX, e.clientY, 5); addSparks(e.clientX, e.clientY, 6);
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.btn, .chip'); if (!b) return;
    var c = centerOf(b); addSparks(c.x, c.y, 10);
  });
  $('#yes').addEventListener('pointerenter', function () { var c = centerOf(this); addHearts(c.x, c.y - 10, 4); });
  var giftBox = $('#giftBox');
  if (giftBox) giftBox.addEventListener('click', function () {
    var opened = giftBox.classList.toggle('open');
    giftBox.setAttribute('aria-expanded', String(opened));
    $('#giftHint').textContent = opened ? 'Semoga hari-harimu selalu dipenuhi hal baik ✨' : 'Ada satu kejutan kecil untukmu · ketuk kotaknya';
    var c = centerOf(giftBox);
    if (opened) { addHearts(c.x, c.y - 18, 18); addSparks(c.x, c.y - 18, 26); }
  });

  /* ===== Mulai ===== */
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
  go('intro');
})();
