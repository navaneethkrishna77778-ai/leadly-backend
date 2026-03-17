/* ─────────────────────────────────────────
   LEADLY AI  ·  script.js
───────────────────────────────────────── */

const isMob = () => window.matchMedia('(hover: none),(pointer: coarse)').matches;

/* ── CUSTOM CURSOR ── */
(function () {
  if (isMob()) return;
  const cur = document.getElementById('cur');
  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function animC() {
    cx += (mx - cx) * 0.13;
    cy += (my - cy) * 0.13;
    cur.style.left = cx + 'px';
    cur.style.top  = cy + 'px';
    requestAnimationFrame(animC);
  })();

  document.querySelectorAll('a, button, .for-tag, .plat-item, .m-tag, .fq-q').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('big'));
    el.addEventListener('mouseleave', () => cur.classList.remove('big'));
  });
})();


/* ── CANVAS PARTICLE NETWORK ── */
(function () {
  if (isMob()) return;

  const cv  = document.getElementById('bgcanvas');
  const ctx = cv.getContext('2d');
  let W, H, pts = [];
  const COUNT   = 68;
  const CONNECT = 135;
  const PURPLE  = 'rgba(139,92,246,';
  const mouse   = { x: -999, y: -999 };

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); init(); });
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  function mkPt() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - .5) * .28,
      vy: (Math.random() - .5) * .28,
      r:  Math.random() * 1.3 + .5
    };
  }

  function init() { pts = []; for (let i = 0; i < COUNT; i++) pts.push(mkPt()); }
  init();

  function draw() {
    ctx.clearRect(0, 0, W, H);

    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    /* connections between dots */
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx   = pts[i].x - pts[j].x;
        const dy   = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT) {
          const a = (1 - dist / CONNECT) * 0.16;
          ctx.beginPath();
          ctx.strokeStyle = PURPLE + a + ')';
          ctx.lineWidth   = .55;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }

      /* mouse glow connections */
      const mdx  = pts[i].x - mouse.x;
      const mdy  = pts[i].y - mouse.y;
      const md   = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 165) {
        const a = (1 - md / 165) * 0.38;
        ctx.beginPath();
        ctx.strokeStyle = PURPLE + a + ')';
        ctx.lineWidth   = .85;
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    /* dots */
    pts.forEach(p => {
      const mdx  = p.x - mouse.x;
      const mdy  = p.y - mouse.y;
      const md   = Math.sqrt(mdx * mdx + mdy * mdy);
      const bright = md < 165 ? 0.55 : 0.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = PURPLE + bright + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();


/* ── SCROLL REVEAL ── */
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: .1, rootMargin: '0px 0px -28px 0px' });
  document.querySelectorAll('.rv').forEach(el => obs.observe(el));
})();


/* ── FAQ ── */
function tfaq(btn) {
  const item = btn.closest('.fq');
  const open = item.classList.contains('open');
  document.querySelectorAll('.fq.open').forEach(i => i.classList.remove('open'));
  if (!open) item.classList.add('open');
}
window.tfaq = tfaq;


/* ── WAITLIST ── */
function goWL() {
  document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' });
}

function joinWL() {
  const input = document.getElementById('wlEmail');
  const email = input.value.trim();
  if (!email || !email.includes('@')) { toast('Enter a valid email address'); return; }

  const list = JSON.parse(localStorage.getItem('leadly_wl') || '[]');
  if (list.find(e => e.email === email)) { toast("You're already on the list!"); return; }
  list.push({ email, ts: new Date().toISOString() });
  localStorage.setItem('leadly_wl', JSON.stringify(list));

  input.value = '';
  toast("You're on the list — we'll be in touch 🚀");
}
window.goWL  = goWL;
window.joinWL = joinWL;


/* ── TOAST ── */
let toastTimer;
function toast(msg) {
  clearTimeout(toastTimer);
  document.getElementById('toast-msg').textContent = msg;
  const el = document.getElementById('toast');
  el.classList.add('show');
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}
