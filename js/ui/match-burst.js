// The match moment: a canvas heart burst behind the popup. Reduced motion
// gets a still glow instead (handled in css/features.css).
const COLORS = ['#ff4d6d', '#ff8fab', '#ffd166', '#c77dff', '#ffffff'];

function heart(ctx, x, y, s, rot, color, alpha) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.globalAlpha = alpha; ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.bezierCurveTo(-10, -6, -6, -14, 0, -8);
  ctx.bezierCurveTo(6, -14, 10, -6, 0, 3);
  ctx.fill();
  ctx.restore();
}

export function heartBurst(host) {
  if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  host.querySelector('canvas.match-burst')?.remove();
  const canvas = document.createElement('canvas');
  canvas.className = 'match-burst';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.width = window.innerWidth * dpr;
  const hgt = canvas.height = window.innerHeight * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cx = w / 2, cy = hgt * 0.45;
  const parts = Array.from({ length: 90 }, (_, i) => {
    const a = (i / 90) * Math.PI * 2 + Math.random() * 0.3;
    const sp = (4 + Math.random() * 9) * dpr;
    return { x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3 * dpr,
      s: (0.8 + Math.random() * 1.6) * dpr, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2,
      c: COLORS[i % COLORS.length] };
  });
  const start = performance.now();
  const frame = now => {
    const tt = (now - start) / 1600;
    if (tt >= 1 || !canvas.isConnected) { canvas.remove(); return; }
    ctx.clearRect(0, 0, w, hgt);
    // Shockwave ring
    ctx.globalAlpha = Math.max(0, 0.5 - tt);
    ctx.strokeStyle = '#ff8fab'; ctx.lineWidth = 6 * dpr;
    ctx.beginPath(); ctx.arc(cx, cy, tt * Math.max(w, hgt) * 0.6, 0, Math.PI * 2); ctx.stroke();
    for (const p of parts) {
      p.vx *= 0.975; p.vy = p.vy * 0.975 + 0.18 * dpr;
      p.x += p.vx; p.y += p.vy; p.r += p.vr;
      heart(ctx, p.x, p.y, p.s, p.r, p.c, 1 - tt * tt);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
