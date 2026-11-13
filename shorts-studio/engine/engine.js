(() => {
// Línea de tiempo: escenas, cámara, efectos y subtítulos palabra por palabra.
'use strict';
const { W, H, hash } = window.ART;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let STORY = null, TIMING = null;
const setCache = new Map();

const ease = (x) => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
const lerp = (a, b, k) => a + (b - a) * k;

function setCanvas(name, time, blur) {
  const key = name + '|' + time + '|' + blur;
  if (setCache.has(key)) return setCache.get(key);
  const base = document.createElement('canvas'); base.width = W; base.height = H;
  const b = base.getContext('2d');
  const night = time === 'night';
  if (name === 'kitchen') ART.drawKitchen(b, night); else ART.drawLivingRoom(b, night);
  let out = base;
  if (blur > 0) {
    out = document.createElement('canvas'); out.width = W; out.height = H;
    const o = out.getContext('2d'); o.filter = `blur(${blur}px)`; o.drawImage(base, 0, 0); o.filter = 'none';
  }
  setCache.set(key, out);
  return out;
}

function shotAt(t) {
  const s = TIMING.shots;
  for (let i = 0; i < s.length; i++) if (t < s[i].end || i === s.length - 1) return i;
  return s.length - 1;
}

function camera(sh, tm, lt, dur) {
  const k = ease(lt / dur);
  let [x, y, z] = sh.cam.from.map((v, i) => lerp(v, sh.cam.to[i], k));
  const fx = sh.fx || [];
  if (fx.includes('punch')) z *= 1 + 0.10 * Math.exp(-lt * 9);
  // pequeña deriva de cámara en mano
  x += Math.sin(lt * 0.9 + tm.i) * 4; y += Math.cos(lt * 0.7 + tm.i) * 3;
  if (fx.includes('shake') && lt < 0.45) { const a = (0.45 - lt) * 40; x += (hash(Math.floor(lt * 60)) - 0.5) * a; y += (hash(Math.floor(lt * 60) + 9) - 0.5) * a; }
  // mantener la vista dentro del escenario
  const hw = W / 2 / z, hh = H / 2 / z;
  x = Math.max(hw, Math.min(W - hw, x)); y = Math.max(hh, Math.min(H - hh, y));
  return { x, y, z };
}

function drawWorld(sh, tm, lt, dur) {
  const cam = camera(sh, tm, lt, dur);
  const night = sh.time === 'night';
  const blur = cam.z >= 1.6 ? Math.round(2 + (cam.z - 1.6) * 3) : 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
  ctx.drawImage(setCanvas(sh.set, sh.time || 'day', blur), 0, 0);

  // objetos y personajes ordenados por profundidad (y)
  const items = [];
  for (const p of sh.props || []) items.push({ y: p.y - 1, draw: () => {
    if (p.what === 'side_table') ART.drawSideTable(ctx, p, night, lt);
    if (p.what === 'crumbs') ART.drawCrumbs(ctx, p);
  } });
  (sh.actors || []).forEach((a, idx) => {
    let x = a.x, walking = false, phase = 0;
    if (a.to_x !== undefined) {
      const walkDur = Math.max(0.8, dur * 0.72);
      const k = Math.min(1, lt / walkDur);
      x = lerp(a.x, a.to_x, k);
      walking = k < 1;
      phase = Math.abs(x - a.x) / 38;
    }
    const o = Object.assign({}, a, { x, t: lt + idx * 0.7, walking, walkPhase: phase, seed: idx * 1.1 });
    items.push({ y: a.y + (a.who === 'michi' ? 5 : 0), draw: () => a.who === 'michi' ? ART.drawMichi(ctx, o) : ART.drawMateo(ctx, o) });
    if (a.pose === 'sleepwalk') items.push({ y: 99999, draw: () => drawZzz(x + 120 * (a.face || 1), a.y - 980, lt) });
  });
  items.sort((p, q) => p.y - q.y).forEach((it) => it.draw());
  ctx.restore();

  // luz nocturna
  if (night) {
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(70,85,160,0.55)'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
  // viñeta suave
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.72);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(30,20,10,0.28)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

function drawZzz(x, y, t) {
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = ART.INK; ctx.lineWidth = 8; ctx.lineJoin = 'round';
  ctx.font = '700 80px Fredoka, sans-serif';
  for (let i = 0; i < 3; i++) {
    const k = ((t * 0.6 + i / 3) % 1);
    ctx.globalAlpha = Math.sin(k * Math.PI);
    const s = 0.6 + k * 0.6;
    ctx.save(); ctx.translate(x + k * 70, y - k * 160); ctx.scale(s, s);
    ctx.strokeText('z', 0, 0); ctx.fillText('z', 0, 0); ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// cámara de seguridad / visión nocturna
const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
function footage(lt, tAbs) {
  const tc = tmp.getContext('2d');
  tc.clearRect(0, 0, W, H); tc.drawImage(canvas, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = 'grayscale(1) contrast(1.25) brightness(1.45)';
  ctx.drawImage(tmp, 0, 0); ctx.filter = 'none';
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(150,255,170)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.10; ctx.fillStyle = '#000';
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2);
  ctx.globalAlpha = 1;
  for (let i = 0; i < 220; i++) { ctx.fillStyle = `rgba(255,255,255,${hash(i + Math.floor(tAbs * 30) * 7) * 0.25})`; ctx.fillRect(hash(i * 3 + Math.floor(tAbs * 30)) * W, hash(i * 5 + Math.floor(tAbs * 30)) * H, 3, 3); }
  // esquinas y REC
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8;
  for (const [x, y, dx, dy] of [[60, 140, 1, 1], [W - 60, 140, -1, 1], [60, H - 420, 1, -1], [W - 60, H - 420, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(x, y + dy * 90); ctx.lineTo(x, y); ctx.lineTo(x + dx * 90, y); ctx.stroke();
  }
  ctx.font = '700 56px Fredoka, sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
  if (Math.floor(lt * 2) % 2 === 0) { ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(110, 230, 18, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#fff'; ctx.fillText('REC', 145, 250);
  const secs = 14 + Math.floor(lt);
  ctx.textAlign = 'right'; ctx.fillText('03:00:' + String(secs).padStart(2, '0'), W - 100, 250);
  ctx.textAlign = 'left';
}

// subtítulos: una palabra a la vez, con "pop"
function caption(t, sh, tm) {
  let cur = null;
  for (const w of tm.words) if (t >= w.start - 0.02) cur = w;
  if (!cur || t > tm.speech_end + 0.25) return;
  const raw = cur.w.replace(/[.,;:…]+$/g, '').replace(/^[«"]+|[»"]+$/g, '');
  const clean = raw.replace(/[¿?¡!]/g, '').toLowerCase();
  const isKey = (sh.keywords || []).some((k) => clean === k.toLowerCase().replace(/[¿?¡!.,]/g, ''));
  const age = t - cur.start;
  const pop = age < 0.09 ? 0.78 + (age / 0.09) * 0.32 : age < 0.16 ? 1.1 - ((age - 0.09) / 0.07) * 0.1 : 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save();
  ctx.translate(W / 2, 1420); ctx.scale(pop, pop);
  let size = isKey ? 170 : 150;
  ctx.font = `700 ${size}px Fredoka, sans-serif`;
  const wpx = ctx.measureText(raw).width;
  if (wpx > 960) { size = size * 960 / wpx; ctx.font = `700 ${size}px Fredoka, sans-serif`; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.miterLimit = 2;
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 10;
  ctx.lineWidth = 32; ctx.strokeStyle = '#111014'; ctx.strokeText(raw, 0, 0);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = isKey ? '#ffd23f' : '#ffffff'; ctx.fillText(raw, 0, 0);
  ctx.restore();
}

window.setup = (story, timing) => { STORY = story; TIMING = timing; setCache.clear(); };
window.renderAt = (t) => {
  const i = shotAt(t);
  const sh = STORY.shots[i], tm = TIMING.shots[i];
  const lt = t - tm.start, dur = tm.end - tm.start;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  drawWorld(sh, tm, lt, dur);
  if ((sh.fx || []).includes('footage')) footage(lt, t);
  caption(t, sh, tm);
  // flash blanco muy corto en los cortes con "punch"
  if ((sh.fx || []).includes('punch') && lt < 0.06 && i > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, W, H); }
};
window.frameJPEG = (t, q) => { window.renderAt(t); return canvas.toDataURL('image/jpeg', q || 0.92); };
})();
