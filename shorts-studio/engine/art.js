(() => {
// Arte vectorial dibujado en código: escenarios, personajes y objetos.
// Mundo de 1080 x 1920 (vertical). El suelo de los personajes está en y≈1700.
'use strict';

const INK = '#1e1b24';
const W = 1080, H = 1920;

// ---------- utilidades ----------
function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function paint(c, fill, lw = 7, stroke = INK) {
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (lw) { c.lineWidth = lw; c.strokeStyle = stroke; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
}
function ell(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function line(c, pts, lw = 7, col = INK) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.lineWidth = lw; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
}
function curve(c, a, ctrl, b, lw = 7, col = INK) {
  c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(ctrl[0], ctrl[1], b[0], b[1]);
  c.lineWidth = lw; c.strokeStyle = col; c.lineCap = 'round'; c.stroke();
}
// ruido determinista
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

// ---------- ESCENARIO: SALA ----------
function drawLivingRoom(c, night) {
  // pared
  const wall = c.createLinearGradient(0, 0, 0, 1260);
  wall.addColorStop(0, night ? '#7d7487' : '#f7ead2');
  wall.addColorStop(1, night ? '#6b6377' : '#efdcbc');
  c.fillStyle = wall; c.fillRect(0, 0, W, 1262);
  // papel tapiz: rayas y rombos suaves
  c.globalAlpha = 0.35;
  for (let x = 0; x < W; x += 72) { c.fillStyle = night ? '#625a6f' : '#e6d2ae'; c.fillRect(x, 0, 6, 1262); }
  for (let y = 40; y < 1240; y += 90) for (let x = 36; x < W; x += 72) {
    c.save(); c.translate(x, y + ((x / 72) % 2) * 45); c.rotate(Math.PI / 4);
    c.fillStyle = night ? '#5c546a' : '#e2caa0'; c.fillRect(-6, -6, 12, 12); c.restore();
  }
  c.globalAlpha = 1;

  // ventana
  const wx = 600, wy = 230, ww = 420, wh = 640;
  rr(c, wx - 18, wy - 18, ww + 36, wh + 36, 10); paint(c, night ? '#cfc8d6' : '#fffaf0', 7);
  const sky = c.createLinearGradient(0, wy, 0, wy + wh);
  if (night) { sky.addColorStop(0, '#16224a'); sky.addColorStop(1, '#2f4276'); }
  else { sky.addColorStop(0, '#7fc4f0'); sky.addColorStop(1, '#d4efff'); }
  c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip();
  if (night) {
    for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(255,255,230,' + (0.4 + hash(i) * 0.6) + ')'; ell(c, wx + hash(i + 3) * ww, wy + hash(i + 9) * wh * 0.5, 2.5, 2.5); c.fill(); }
    ell(c, wx + 300, wy + 120, 44, 44); paint(c, '#fff6d6', 0);
    ell(c, wx + 322, wy + 104, 40, 40); c.fillStyle = '#1b2850'; c.fill();
  } else {
    // nubes
    for (const [cx, cy, s] of [[wx + 90, wy + 110, 1], [wx + 300, wy + 190, 0.8]]) {
      c.fillStyle = '#ffffff';
      for (const [dx, dy, r] of [[0, 0, 34], [34, -14, 42], [74, 0, 32], [36, 12, 30]]) { ell(c, cx + dx * s, cy + dy * s, r * s, r * s); c.fill(); }
    }
  }
  // casas vecinas
  const houses = [[wx - 20, 520, 190, '#f2c48f', '#e0764f'], [wx + 170, 470, 170, '#f6dcae', '#d9604a'], [wx + 330, 540, 150, '#eab98a', '#c95545']];
  for (const [hx, hy, hw, wallc, roof] of houses) {
    const yy = wy + hy - 230;
    c.beginPath(); c.rect(hx, yy, hw, wh); paint(c, night ? '#4a4566' : wallc, 6);
    c.beginPath(); c.moveTo(hx - 20, yy); c.lineTo(hx + hw / 2, yy - 90); c.lineTo(hx + hw + 20, yy); c.closePath();
    paint(c, night ? '#3b3555' : roof, 6);
    for (let k = 0; k < 2; k++) { rr(c, hx + 30 + k * (hw - 100), yy + 50, 40, 50, 4); paint(c, night ? '#ffd76a' : '#9fd3f0', 5); }
  }
  c.restore();
  // marco y cruz de la ventana
  c.beginPath(); c.rect(wx, wy, ww, wh); paint(c, null, 8);
  line(c, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 16, night ? '#cfc8d6' : '#fffaf0');
  line(c, [[wx, wy + wh * 0.55], [wx + ww, wy + wh * 0.55]], 16, night ? '#cfc8d6' : '#fffaf0');
  line(c, [[wx + ww / 2 - 8, wy], [wx + ww / 2 - 8, wy + wh]], 3); line(c, [[wx + ww / 2 + 8, wy], [wx + ww / 2 + 8, wy + wh]], 3);
  rr(c, wx - 40, wy + wh + 10, ww + 80, 34, 8); paint(c, night ? '#cfc8d6' : '#fffaf0', 7);

  // cortinas verde azulado
  for (const side of [-1, 1]) {
    const cx = side < 0 ? wx - 70 : wx + ww + 10;
    c.beginPath(); c.moveTo(cx, 180); c.lineTo(cx + 60, 180);
    c.bezierCurveTo(cx + 70, 600, cx + 40, 900, cx + 70, 1100); c.lineTo(cx - 10, 1100);
    c.bezierCurveTo(cx + 10, 800, cx - 20, 500, cx, 180); c.closePath();
    paint(c, night ? '#2c5f66' : '#2fa198', 7);
    curve(c, [cx + 25, 200], [cx + 35, 650], [cx + 25, 1080], 4, night ? '#22494f' : '#24837b');
  }
  line(c, [[wx - 100, 178], [wx + ww + 100, 178]], 12, '#8a5a3a');

  // cuadros
  drawFrame(c, 90, 330, 150, 190, '#7cc6e8', 'sun', night);
  drawFrame(c, 280, 280, 140, 140, '#f5a3a3', 'cat', night);
  drawFrame(c, 290, 460, 130, 110, '#ffe08a', 'boat', night);

  // zócalo
  c.fillStyle = night ? '#bdb4c6' : '#fff7ea'; c.fillRect(0, 1236, W, 30);
  line(c, [[0, 1236], [W, 1236]], 5); line(c, [[0, 1266], [W, 1266]], 6);

  // piso de madera en perspectiva
  const fl = c.createLinearGradient(0, 1266, 0, H);
  fl.addColorStop(0, night ? '#5e4636' : '#c48a55'); fl.addColorStop(1, night ? '#6e5240' : '#d79c63');
  c.fillStyle = fl; c.fillRect(0, 1266, W, H - 1266);
  c.globalAlpha = 0.55;
  for (let i = -10; i <= 20; i++) line(c, [[540 + i * 30, 1266], [540 + i * 160, H]], 3, night ? '#4b382b' : '#a8703f');
  for (const y of [1330, 1430, 1570, 1760]) for (let x = (y * 7) % 200; x < W; x += 260) line(c, [[x, y], [x + 70, y]], 3, night ? '#4b382b' : '#a8703f');
  c.globalAlpha = 1;
  // alfombra
  c.beginPath(); c.moveTo(150, 1520); c.lineTo(930, 1520); c.lineTo(1080, 1900); c.lineTo(0, 1900); c.closePath();
  paint(c, night ? '#8f8a97' : '#ece5d8', 7);
  c.beginPath(); c.moveTo(190, 1550); c.lineTo(890, 1550); c.lineTo(1010, 1860); c.lineTo(70, 1860); c.closePath();
  paint(c, null, 4, night ? '#77727f' : '#d6a66a');
  // sofá a la izquierda
  drawSofa(c, 110, 1000, night);
  // planta
  drawPlant(c, 40, 1180, night);
  // luz del sol en el piso
  if (!night) {
    c.globalAlpha = 0.18; c.fillStyle = '#fff6c8';
    c.beginPath(); c.moveTo(600, 1266); c.lineTo(1020, 1266); c.lineTo(1080, 1600); c.lineTo(760, 1600); c.closePath(); c.fill();
    c.globalAlpha = 1;
  }
}

function drawFrame(c, x, y, w, h, bg, kind, night) {
  rr(c, x, y, w, h, 6); paint(c, '#8b5a3c', 6);
  c.beginPath(); c.rect(x + 14, y + 14, w - 28, h - 28); paint(c, night ? shade(bg, -0.35) : bg, 4);
  const cx = x + w / 2, cy = y + h / 2;
  if (kind === 'sun') { ell(c, cx, cy - 10, 26, 26); paint(c, '#ffb53d', 4); line(c, [[x + 20, cy + 45], [x + w - 20, cy + 45]], 4); }
  if (kind === 'cat') { ell(c, cx, cy + 6, 30, 26); paint(c, '#f28c28', 4); c.beginPath(); c.moveTo(cx - 26, cy - 6); c.lineTo(cx - 20, cy - 34); c.lineTo(cx - 6, cy - 18); c.moveTo(cx + 26, cy - 6); c.lineTo(cx + 20, cy - 34); c.lineTo(cx + 6, cy - 18); paint(c, '#f28c28', 4); }
  if (kind === 'boat') { c.beginPath(); c.moveTo(cx - 34, cy + 12); c.lineTo(cx + 34, cy + 12); c.lineTo(cx + 22, cy + 26); c.lineTo(cx - 22, cy + 26); c.closePath(); paint(c, '#e0603e', 4); c.beginPath(); c.moveTo(cx, cy + 10); c.lineTo(cx, cy - 30); c.lineTo(cx + 24, cy + 6); c.closePath(); paint(c, '#fff', 4); }
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
}

function drawSofa(c, x, y, night) {
  const red = night ? '#8a3a3a' : '#e0473d', dark = night ? '#6e2c2c' : '#b8352d';
  rr(c, x, y, 520, 220, 40); paint(c, red, 8);                 // respaldo
  rr(c, x + 30, y + 30, 220, 160, 26); paint(c, shade(red, 0.08), 5);
  rr(c, x + 270, y + 30, 220, 160, 26); paint(c, shade(red, 0.08), 5);
  rr(c, x - 10, y + 170, 540, 120, 30); paint(c, red, 8);       // asiento
  rr(c, x - 50, y + 110, 90, 200, 36); paint(c, dark, 8);       // brazos
  rr(c, x + 480, y + 110, 90, 200, 36); paint(c, dark, 8);
  for (const lx of [x + 10, x + 480]) { c.beginPath(); c.moveTo(lx, y + 290); c.lineTo(lx + 30, y + 290); c.lineTo(lx + 22, y + 330); c.lineTo(lx + 8, y + 330); c.closePath(); paint(c, '#5a3a26', 5); }
  rr(c, x + 300, y + 60, 120, 100, 30); paint(c, night ? '#b0a060' : '#ffd25a', 5);  // cojín
}

function drawPlant(c, x, y, night) {
  const g = night ? '#2d5a3a' : '#3f9d55', gd = night ? '#234a2f' : '#2f7d43';
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.32, L = 210 + (i % 2) * 40;
    const ex = x + 50 + Math.cos(a) * L, ey = y - 10 + Math.sin(a) * L;
    curve(c, [x + 50, y], [x + 50 + Math.cos(a) * L * 0.4, y - L * 0.5], [ex, ey], 5, gd);
    ell(c, ex, ey, 34, 22, a); paint(c, g, 5);
    line(c, [[ex - Math.cos(a) * 26, ey - Math.sin(a) * 26], [ex + Math.cos(a) * 26, ey + Math.sin(a) * 26]], 3, gd);
  }
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + 100, y); c.lineTo(x + 85, y + 110); c.lineTo(x + 15, y + 110); c.closePath();
  paint(c, night ? '#7a4a36' : '#c4693f', 7);
  rr(c, x - 8, y - 10, 116, 26, 6); paint(c, night ? '#8a5640' : '#d97a4c', 6);
}

// ---------- ESCENARIO: COCINA ----------
function drawKitchen(c, night) {
  const wall = night ? '#8b7a3e' : '#f6cd55';
  c.fillStyle = wall; c.fillRect(0, 0, W, 1262);
  // azulejos detrás de la encimera
  c.fillStyle = '#f7f5ef'; c.fillRect(0, 760, 600, 330);
  c.globalAlpha = 0.5;
  for (let x = 0; x <= 600; x += 50) line(c, [[x, 760], [x, 1090]], 2, '#c9c4b8');
  for (let y = 760; y <= 1090; y += 50) line(c, [[0, y], [600, y]], 2, '#c9c4b8');
  c.globalAlpha = 1;
  // ventana con cortina de cuadros
  const wx = 150, wy = 380, ww = 300, wh = 300;
  rr(c, wx - 14, wy - 14, ww + 28, wh + 28, 8); paint(c, '#fffaf0', 7);
  const sky = c.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, '#86c9f2'); sky.addColorStop(1, '#d8f1ff');
  c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  ell(c, wx + 210, wy + 220, 120, 60); c.fillStyle = '#7cc46a'; c.fill();
  c.beginPath(); c.rect(wx, wy, ww, wh); paint(c, null, 7);
  line(c, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 12, '#fffaf0');
  // cortina
  c.save(); c.beginPath(); c.moveTo(wx - 30, wy - 30); c.lineTo(wx + ww + 30, wy - 30); c.lineTo(wx + ww + 30, wy + 70);
  c.quadraticCurveTo(wx + ww / 2, wy + 120, wx - 30, wy + 70); c.closePath();
  c.fillStyle = '#fff'; c.fill(); c.clip();
  c.fillStyle = '#e04a43';
  for (let x = wx - 30; x < wx + ww + 30; x += 30) for (let y = wy - 30; y < wy + 130; y += 30) if (((x - wx) / 30 + (y - wy) / 30) % 2 === 0) c.fillRect(x, y, 30, 30);
  c.restore();
  c.beginPath(); c.moveTo(wx - 30, wy - 30); c.lineTo(wx + ww + 30, wy - 30); c.lineTo(wx + ww + 30, wy + 70);
  c.quadraticCurveTo(wx + ww / 2, wy + 120, wx - 30, wy + 70); c.closePath(); paint(c, null, 6);

  // lámpara colgante
  line(c, [[540, 0], [540, 150]], 5);
  c.beginPath(); c.moveTo(450, 240); c.quadraticCurveTo(540, 120, 630, 240); c.closePath(); paint(c, '#2e9c9a', 7);
  ell(c, 540, 244, 34, 14); paint(c, '#fff5c4', 5);
  // calendario
  rr(c, 520, 440, 120, 150, 6); paint(c, '#fff', 6);
  c.fillStyle = '#e04a43'; c.fillRect(524, 444, 112, 34);
  c.fillStyle = '#fff'; c.font = '700 22px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillText('JUEVES', 580, 470);
  c.globalAlpha = 0.6; for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { c.fillStyle = '#9a948a'; c.fillRect(534 + k * 26, 492 + r * 24, 14, 12); } c.globalAlpha = 1;

  // encimera y muebles
  const teal = night ? '#2b6f70' : '#45b2ad';
  rr(c, 0, 220, 470, 120, 8); paint(c, teal, 7);   // alacena alta
  line(c, [[235, 220], [235, 340]], 5);
  ell(c, 215, 300, 7, 7); paint(c, '#fff', 3); ell(c, 255, 300, 7, 7); paint(c, '#fff', 3);
  rr(c, -20, 1090, 640, 34, 6); paint(c, '#f7f5ef', 7);   // encimera
  c.beginPath(); c.rect(-10, 1124, 610, 230); paint(c, teal, 7);
  for (const x of [0, 200, 400]) { rr(c, x + 14, 1140, 172, 196, 10); paint(c, shade(teal, 0.1), 5); ell(c, x + 100, 1180, 8, 8); paint(c, '#fff', 3); }
  // cosas sobre la encimera
  rr(c, 60, 990, 70, 100, 10); paint(c, '#f0e9dc', 6); c.fillStyle = '#e04a43'; c.fillRect(64, 1020, 62, 20); // tarro
  rr(c, 160, 1010, 50, 80, 8); paint(c, '#7cc6e8', 6);
  // tostadora
  rr(c, 380, 1000, 150, 90, 24); paint(c, '#d8dde2', 7); line(c, [[420, 1000], [420, 1020]], 6); line(c, [[480, 1000], [480, 1020]], 6);

  // nevera retro
  const fx = 680, fy = 640;
  rr(c, fx, fy, 330, 740, 50); paint(c, night ? '#7ab1aa' : '#a9e4dc', 9);
  line(c, [[fx, fy + 250], [fx + 330, fy + 250]], 6);
  rr(c, fx + 270, fy + 90, 24, 120, 12); paint(c, '#e8eef0', 6);
  rr(c, fx + 270, fy + 300, 24, 180, 12); paint(c, '#e8eef0', 6);
  // notas con imanes (texto original)
  note(c, fx + 50, fy + 300, '#ffef8a', 'LECHE', -0.06);
  note(c, fx + 150, fy + 420, '#ffb3c7', '¡NO\nTOCAR!', 0.05);
  note(c, fx + 50, fy + 520, '#b8e6ff', 'galletas\n= 1', -0.03);
  rr(c, fx + 30, fy + 700, 270, 40, 10); paint(c, '#7d8a8c', 5);

  c.fillStyle = night ? '#b0a77a' : '#fff7ea'; c.fillRect(0, 1236, W, 30); line(c, [[600, 1236], [680, 1236]], 5); line(c, [[0, 1266], [W, 1266]], 6);
  // piso a cuadros en perspectiva
  const vx = 540, vy = 700, rows = [1266, 1330, 1410, 1510, 1640, 1800, 2000];
  for (let r = 0; r < rows.length - 1; r++) {
    for (let k = -14; k < 14; k++) {
      const y0 = rows[r], y1 = rows[r + 1];
      const x = (y, i) => vx + (i * 90) * ((y - vy) / (1266 - vy)) * 0.55;
      c.beginPath(); c.moveTo(x(y0, k), y0); c.lineTo(x(y0, k + 1), y0); c.lineTo(x(y1, k + 1), y1); c.lineTo(x(y1, k), y1); c.closePath();
      c.fillStyle = (r + k) % 2 === 0 ? (night ? '#2a5d62' : '#2f9aa0') : (night ? '#b9b6ad' : '#f6f3ea'); c.fill();
    }
  }
  c.globalAlpha = 0.2; c.fillStyle = '#fff6c8';
  c.beginPath(); c.moveTo(150, 1266); c.lineTo(450, 1266); c.lineTo(560, 1700); c.lineTo(160, 1700); c.closePath(); c.fill(); c.globalAlpha = 1;
}

function note(c, x, y, col, text, rot) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath(); c.rect(0, 0, 120, 90); paint(c, col, 4);
  ell(c, 60, 4, 9, 9); paint(c, '#e04a43', 3);
  c.fillStyle = INK; c.font = '600 24px Fredoka, sans-serif'; c.textAlign = 'center';
  text.split('\n').forEach((t, i, a) => c.fillText(t, 60, 50 - (a.length - 1) * 13 + i * 28));
  c.restore();
}

// ---------- PERSONAJE: MATEO (monigote de cabeza blanca) ----------
const SWEATER = '#f2b134', SWEATER_D = '#d99419', HAIR = '#3b2a20';

function drawMateo(c, o) {
  const t = o.t || 0, s = o.scale || 1;
  const pose = o.pose || 'stand';
  c.save(); c.translate(o.x, o.y); c.scale(s * (o.face || 1), s);
  // sombra
  c.globalAlpha = 0.22; ell(c, 0, 4, 120, 22); c.fillStyle = '#000'; c.fill(); c.globalAlpha = 1;

  const breathe = Math.sin(t * 2.4) * 4;
  const walking = o.walking;
  const ph = o.walkPhase || 0;
  let hipY = -300, lean = 0, bob = 0;
  if (walking) bob = -Math.abs(Math.sin(ph)) * 14;
  if (pose === 'crouch') { hipY = -200; lean = 0.18; }
  if (pose === 'sleepwalk') { bob += Math.sin(t * 3) * 6; }

  // piernas
  const legL = walking ? Math.sin(ph) * 0.45 : -0.12, legR = walking ? -Math.sin(ph) * 0.45 : 0.12;
  const hip = [0, hipY + bob];
  const leg = (a, side) => {
    const L = 300;
    let foot = [hip[0] + Math.sin(a) * L + side * 6, 0];
    if (pose === 'crouch') foot = [side * 60, 0];
    const knee = pose === 'crouch' ? [side * 20 + 80, hipY + 70] : [(hip[0] + foot[0]) / 2 + 14, (hip[1] + foot[1]) / 2];
    curve(c, hip, knee, foot, 10);
    ell(c, foot[0] + 16, foot[1] - 4, 26, 12); c.fillStyle = INK; c.fill();
  };
  leg(legL, -1); leg(legR, 1);

  // torso (suéter)
  c.save(); c.translate(0, hipY + bob); c.rotate(lean);
  const ty = -190 + breathe * 0.3;
  const sweater = () => {
    c.beginPath();
    c.moveTo(-62, ty + 20); c.quadraticCurveTo(-70, ty - 4, -40, ty - 6); c.lineTo(40, ty - 6); c.quadraticCurveTo(70, ty - 4, 64, ty + 20);
    c.lineTo(78, -14); c.quadraticCurveTo(80, 6, 60, 8); c.lineTo(-60, 8); c.quadraticCurveTo(-80, 6, -78, -14); c.closePath();
    paint(c, SWEATER, 8);
    c.save(); c.clip(); c.fillStyle = SWEATER_D; c.fillRect(30, ty - 10, 60, 220); c.restore();
    c.beginPath(); c.moveTo(-62, ty + 20); c.quadraticCurveTo(-70, ty - 4, -40, ty - 6); c.lineTo(40, ty - 6); c.quadraticCurveTo(70, ty - 4, 64, ty + 20);
    c.lineTo(78, -14); c.quadraticCurveTo(80, 6, 60, 8); c.lineTo(-60, 8); c.quadraticCurveTo(-80, 6, -78, -14); c.closePath(); paint(c, null, 8);
    line(c, [[-70, -22], [72, -22]], 5);  // elástico
    if (o.crumbs) { c.fillStyle = '#8a5326'; for (let i = 0; i < 9; i++) { ell(c, -40 + hash(i) * 90, ty + 50 + hash(i + 4) * 150, 6 + hash(i + 7) * 5, 5); c.fill(); } }
  };

  // brazos
  const sh = [[-52, ty + 22], [52, ty + 22]];
  const handAt = (p) => { ell(c, p[0], p[1], 20, 18); paint(c, '#fdfcf8', 6); };
  const armTo = (a, h, bend = 18) => { curve(c, a, [(a[0] + h[0]) / 2 + bend, (a[1] + h[1]) / 2 + Math.abs(bend)], h, 9); };
  const sway = walking ? Math.sin(ph) * 40 : Math.sin(t * 1.7) * 4;
  let hb, hf; // mano trasera / delantera
  if (pose === 'point') { hb = [-85 - sway * 0.2, ty + 175]; hf = [215, ty + 40 + Math.sin(t * 6) * 6]; }
  else if (pose === 'reach') { hb = [-85, ty + 175]; hf = [230, ty - 20]; }
  else if (pose === 'sleepwalk') { hb = [190, ty + 52]; hf = [235, ty + 40]; }
  else if (pose === 'crouch') { hb = [60, ty + 150]; hf = [170, ty + 120]; }
  else if (o.hold) { hb = [30, ty + 120]; hf = [100, ty + 110]; }
  else { hb = [-90 - sway, ty + 180]; hf = [90 + sway, ty + 180]; }
  // brazo trasero detrás del cuerpo
  armTo(sh[0], hb, -14); handAt(hb);
  sweater();
  // objeto sostenido (detrás de la mano delantera)
  if (o.hold) drawHeld(c, o.hold, hf, t, o);
  armTo(sh[1], hf, 14);
  handAt(hf);
  if (pose === 'point') { line(c, [[hf[0] + 10, hf[1] - 4], [hf[0] + 44, hf[1] - 10]], 9); ell(c, hf[0] + 46, hf[1] - 10, 9, 9); paint(c, '#fdfcf8', 5); }

  // cabeza
  const hy = ty - 115;
  drawHead(c, 0, hy, o);
  c.restore();
  c.restore();
}

function drawHead(c, x, y, o) {
  const R = 150, t = o.t || 0;
  // cabeza blanca con sombreado suave a un lado
  ell(c, x, y, R, R * 0.96); c.fillStyle = '#fdfcf8'; c.fill();
  c.save(); ell(c, x, y, R, R * 0.96); c.clip();
  ell(c, x - 40, y - 20, R, R); c.fillStyle = 'rgba(0,0,0,0)';
  c.fillStyle = '#e6e3dc'; ell(c, x + 30, y + 10, R, R); c.fill();
  c.fillStyle = '#fdfcf8'; ell(c, x - 24, y - 8, R * 0.98, R * 0.95); c.fill();
  c.restore();
  ell(c, x, y, R, R * 0.96); paint(c, null, 9);
  // pelo: casquete despeinado con mechones redondeados
  c.beginPath();
  const a0 = -Math.PI * 0.93, a1 = -Math.PI * 0.07, n = 9;
  c.moveTo(x + Math.cos(a0) * (R + 6), y + Math.sin(a0) * (R + 6));
  for (let i = 1; i <= n; i++) {
    const am = a0 + (a1 - a0) * (i - 0.5) / n, ae = a0 + (a1 - a0) * i / n;
    const bump = R + 34 + (i % 3 === 1 ? 14 : 0);
    c.quadraticCurveTo(x + Math.cos(am) * bump, y + Math.sin(am) * bump, x + Math.cos(ae) * (R + 8), y + Math.sin(ae) * (R + 8));
  }
  c.quadraticCurveTo(x + 110, y - 70, x + 70, y - 92);
  c.quadraticCurveTo(x + 20, y - 70, x - 10, y - 100);
  c.quadraticCurveTo(x - 60, y - 84, x - 100, y - 92);
  c.quadraticCurveTo(x - 130, y - 80, x + Math.cos(a0) * (R + 6), y + Math.sin(a0) * (R + 6));
  c.closePath(); paint(c, HAIR, 7);
  // remolino
  c.beginPath(); c.moveTo(x - 6, y - R - 30); c.quadraticCurveTo(x + 8, y - R - 58, x + 36, y - R - 52); c.quadraticCurveTo(x + 16, y - R - 40, x + 18, y - R - 24); paint(c, HAIR, 7);
  // cara
  const look = o.look || 'cam';
  let fx = 0, fy = 0, px = 0, py = 0;
  if (look === 'right') { fx = 34; px = 10; } if (look === 'left') { fx = -34; px = -10; }
  if (look === 'down') { fy = 18; py = 10; px = 6; } if (look === 'up') { fy = -10; py = -10; }
  const expr = o.expr || 'neutral';
  const blink = (o.blinkOk !== false) && ((t + (o.seed || 0)) % 3.3) < 0.13 && !['happy', 'sleepy'].includes(expr);
  const ex = [x - 50 + fx, x + 50 + fx], ey = y + 6 + fy;
  for (let i = 0; i < 2; i++) {
    const cx = ex[i];
    if (blink || expr === 'sleepy') {
      curve(c, [cx - 26, ey + 4], [cx, ey + 18], [cx + 26, ey + 4], 7);
      continue;
    }
    if (expr === 'happy') { curve(c, [cx - 26, ey + 10], [cx, ey - 22], [cx + 26, ey + 10], 8); continue; }
    const big = expr === 'shocked' ? 1.25 : 1;
    ell(c, cx, ey, 30 * big, 36 * big); paint(c, '#ffffff', 6);
    const pr = expr === 'shocked' ? 8 : 14;
    ell(c, cx + px, ey + py + 4, pr, pr); c.fillStyle = INK; c.fill();
    ell(c, cx + px + 5, ey + py - 1, 4, 4); c.fillStyle = '#fff'; c.fill();
    if (expr === 'suspicious') {
      c.save(); ell(c, cx, ey, 31, 37); c.clip();
      c.fillStyle = '#ece9e2'; c.fillRect(cx - 40, ey - 50, 80, 46); c.restore();
      line(c, [[cx - 30, ey - 4], [cx + 30, ey - 4]], 6);
    }
  }
  // cejas
  const by = ey - 58;
  if (expr === 'shocked') { curve(c, [ex[0] - 26, by - 14], [ex[0], by - 34], [ex[0] + 26, by - 16], 7); curve(c, [ex[1] - 26, by - 16], [ex[1], by - 34], [ex[1] + 26, by - 14], 7); }
  else if (expr === 'suspicious') { line(c, [[ex[0] - 26, by + 6], [ex[0] + 24, by + 18]], 8); line(c, [[ex[1] - 24, by + 14], [ex[1] + 26, by - 2]], 8); }
  else if (expr === 'sleepy') { line(c, [[ex[0] - 22, by + 14], [ex[0] + 22, by + 10]], 6); line(c, [[ex[1] - 22, by + 10], [ex[1] + 22, by + 14]], 6); }
  else { curve(c, [ex[0] - 24, by + 4], [ex[0], by - 8], [ex[0] + 24, by + 2], 7); curve(c, [ex[1] - 24, by + 2], [ex[1], by - 8], [ex[1] + 24, by + 4], 7); }
  // boca
  const mx = x + fx * 0.9, my = y + 82 + fy;
  if (expr === 'happy') {
    c.beginPath(); c.moveTo(mx - 34, my - 6); c.quadraticCurveTo(mx, my + 40, mx + 34, my - 6); c.closePath(); paint(c, '#7a2b2b', 6);
    ell(c, ex[0] - 18, ey + 40, 18, 10); c.fillStyle = 'rgba(255,120,120,0.45)'; c.fill(); ell(c, ex[1] + 18, ey + 40, 18, 10); c.fill();
  } else if (expr === 'shocked') {
    ell(c, mx, my + 4, 20, 28); paint(c, '#7a2b2b', 6); ell(c, mx, my + 20, 12, 8); c.fillStyle = '#e8737a'; c.fill();
  } else if (expr === 'suspicious') { line(c, [[mx - 22, my + 4], [mx + 20, my - 2]], 7); }
  else if (expr === 'sleepy') { ell(c, mx, my + 2, 10, 12); paint(c, '#7a2b2b', 5); }
  else { curve(c, [mx - 22, my], [mx, my + 12], [mx + 22, my], 7); }
}

function drawHeld(c, what, h, t, o) {
  const [x, y] = h;
  if (what === 'plate_empty') {
    ell(c, x - 30, y - 14, 95, 26); paint(c, '#ffffff', 6); ell(c, x - 30, y - 16, 60, 14); paint(c, null, 3, '#cfcac0');
    c.fillStyle = '#8a5326'; for (let i = 0; i < 6; i++) { ell(c, x - 60 + hash(i) * 60, y - 20 + hash(i + 2) * 10, 5, 3.5); c.fill(); }
  } else if (what === 'milk') {
    c.beginPath(); c.moveTo(x - 30, y - 110); c.lineTo(x + 30, y - 110); c.lineTo(x + 24, y + 10); c.lineTo(x - 24, y + 10); c.closePath(); paint(c, '#ffffff', 6);
    c.beginPath(); c.moveTo(x - 27, y - 80); c.lineTo(x + 27, y - 80); c.stroke();
    c.globalAlpha = 0.5; c.fillStyle = '#cfe8ff'; c.fillRect(x + 8, y - 105, 10, 100); c.globalAlpha = 1;
  } else if (what === 'magnifier') {
    line(c, [[x, y], [x + 70, y - 60]], 14, '#6b4a2e');
    ell(c, x + 100, y - 88, 50, 50); c.fillStyle = 'rgba(200,235,255,0.45)'; c.fill(); paint(c, null, 10, '#3a3a44');
    ell(c, x + 84, y - 104, 14, 9, -0.6); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fill();
  } else if (what === 'phone') {
    rr(c, x - 40, y - 150, 90, 160, 14); paint(c, '#2a2a33', 6);
    c.fillStyle = '#9fe0a8'; c.fillRect(x - 32, y - 140, 74, 132);
    c.fillStyle = '#e03b3b'; ell(c, x - 18, y - 128, 5, 5); c.fill();
  }
}

// ---------- PERSONAJE: MICHI (gato atigrado naranja) ----------
function drawMichi(c, o) {
  const t = o.t || 0, s = (o.scale || 1) * 1.1;
  const expr = o.expr || 'neutral';
  c.save(); c.translate(o.x, o.y); c.scale(s * (o.face || 1), s);
  c.globalAlpha = 0.22; ell(c, 0, 4, 110, 18); c.fillStyle = '#000'; c.fill(); c.globalAlpha = 1;
  const OR = '#f28a26', ORD = '#cf6716';
  // cola
  const sw = Math.sin(t * 2.2) * 0.25;
  c.beginPath(); c.moveTo(60, -20);
  c.bezierCurveTo(170, -10, 170 + sw * 80, -150, 120 + sw * 120, -210);
  c.lineWidth = 34; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
  c.lineWidth = 22; c.strokeStyle = OR; c.stroke();
  // cuerpo
  c.beginPath(); c.moveTo(-90, -10); c.bezierCurveTo(-110, -150, -60, -230, 0, -230); c.bezierCurveTo(60, -230, 110, -150, 90, -10); c.quadraticCurveTo(0, 6, -90, -10); c.closePath();
  paint(c, OR, 8);
  c.save(); c.clip();
  c.beginPath(); c.moveTo(-40, -10); c.quadraticCurveTo(-50, -170, 0, -200); c.quadraticCurveTo(50, -170, 40, -10); c.closePath(); c.fillStyle = '#fff6ec'; c.fill();
  for (let i = 0; i < 3; i++) { curve(c, [70, -150 + i * 40], [95, -140 + i * 40], [100, -120 + i * 40], 9, ORD); curve(c, [-70, -150 + i * 40], [-95, -140 + i * 40], [-100, -120 + i * 40], 9, ORD); }
  c.restore();
  // patas delanteras
  for (const px of [-32, 32]) { ell(c, px, -14, 28, 18); paint(c, '#fff6ec', 6); }
  // cabeza
  const hy = -270 + Math.sin(t * 2) * 2;
  for (const sd of [-1, 1]) { // orejas
    c.beginPath(); c.moveTo(sd * 46, hy - 70); c.lineTo(sd * 92, hy - 150); c.lineTo(sd * 104, hy - 40); c.closePath(); paint(c, OR, 7);
    c.beginPath(); c.moveTo(sd * 62, hy - 72); c.lineTo(sd * 90, hy - 124); c.lineTo(sd * 96, hy - 60); c.closePath(); c.fillStyle = '#f7a8b0'; c.fill();
  }
  c.beginPath(); c.ellipse(0, hy, 118, 98, 0, 0, Math.PI * 2);
  paint(c, OR, 8);
  // franjas de la frente
  for (const dx of [-26, 0, 26]) line(c, [[dx, hy - 96], [dx * 0.8, hy - 64]], 9, ORD);
  // hocico blanco
  ell(c, 0, hy + 40, 64, 42); c.fillStyle = '#fff6ec'; c.fill();
  // ojos
  const look = o.look || 'cam';
  const px = look === 'left' ? -8 : look === 'right' ? 8 : 0;
  const blink = ((t + 1.3) % 3.7) < 0.13 && expr !== 'smug';
  for (const sd of [-1, 1]) {
    const cx = sd * 46, cy = hy - 6;
    if (blink) { curve(c, [cx - 26, cy], [cx, cy + 12], [cx + 26, cy], 7); continue; }
    const big = expr === 'shocked' ? 1.2 : expr === 'innocent' ? 1.12 : 1;
    ell(c, cx, cy, 30 * big, 34 * big); paint(c, '#f6d23c', 6);
    if (expr === 'innocent') { ell(c, cx + px, cy + 2, 22, 26); c.fillStyle = INK; c.fill(); ell(c, cx + px + 8, cy - 8, 8, 8); c.fillStyle = '#fff'; c.fill(); ell(c, cx + px - 6, cy + 10, 4, 4); c.fill(); }
    else if (expr === 'shocked') { ell(c, cx + px, cy, 6, 10); c.fillStyle = INK; c.fill(); }
    else { ell(c, cx + px, cy + 2, 9, 24); c.fillStyle = INK; c.fill(); ell(c, cx + px + 5, cy - 8, 4, 4); c.fillStyle = '#fff'; c.fill(); }
    if (expr === 'smug') {
      c.save(); ell(c, cx, cy, 31, 35); c.clip(); c.fillStyle = OR; c.fillRect(cx - 40, cy - 50, 80, 42); c.restore();
      line(c, [[cx - 30, cy - 8], [cx + 30, cy - 8]], 7);
    }
  }
  // nariz y boca
  c.beginPath(); c.moveTo(-12, hy + 24); c.lineTo(12, hy + 24); c.lineTo(0, hy + 38); c.closePath(); paint(c, '#f07f95', 4);
  if (expr === 'smug') { curve(c, [-30, hy + 50], [-12, hy + 66], [0, hy + 46], 6); curve(c, [0, hy + 46], [16, hy + 70], [38, hy + 44], 6); }
  else if (expr === 'shocked') { ell(c, 0, hy + 58, 12, 14); paint(c, '#7a2b2b', 5); }
  else { curve(c, [-24, hy + 52], [-12, hy + 62], [0, hy + 46], 6); curve(c, [0, hy + 46], [12, hy + 62], [24, hy + 52], 6); }
  // bigotes
  for (const sd of [-1, 1]) for (const k of [-1, 0, 1]) line(c, [[sd * 66, hy + 34 + k * 12], [sd * 140, hy + 26 + k * 22]], 3);
  if (expr === 'innocent') { ell(c, -80, hy + 30, 16, 9); c.fillStyle = 'rgba(255,120,140,0.45)'; c.fill(); ell(c, 80, hy + 30, 16, 9); c.fill(); }
  if (expr === 'shocked') { c.fillStyle = INK; c.font = '700 70px Fredoka, sans-serif'; c.fillText('!', 120, hy - 120); }
  c.restore();
}

// ---------- OBJETOS ----------
function drawSideTable(c, p, night, t) {
  const x = p.x, y = p.y;
  c.globalAlpha = 0.22; ell(c, x, y + 4, 140, 18); c.fillStyle = '#000'; c.fill(); c.globalAlpha = 1;
  for (const lx of [-90, 80]) { rr(c, x + lx, y - 320, 18, 320, 6); paint(c, '#8b5a3c', 6); }
  rr(c, x - 130, y - 340, 260, 34, 8); paint(c, '#a86d45', 7);
  rr(c, x - 110, y - 306, 220, 70, 6); paint(c, '#95603d', 6); ell(c, x, y - 272, 7, 7); paint(c, '#e8c070', 3);
  // lámpara
  const lx = x - 70, ly = y - 340;
  c.beginPath(); c.moveTo(lx - 30, ly); c.lineTo(lx + 30, ly); c.lineTo(lx + 22, ly - 20); c.lineTo(lx - 22, ly - 20); c.closePath(); paint(c, '#2a6f8a', 5);
  line(c, [[lx, ly - 20], [lx, ly - 120]], 7);
  c.beginPath(); c.moveTo(lx - 50, ly - 110); c.lineTo(lx + 50, ly - 110); c.lineTo(lx + 34, ly - 200); c.lineTo(lx - 34, ly - 200); c.closePath();
  paint(c, night ? '#fff1b8' : '#f4efe4', 6);
  if (p.phone) { c.save(); c.translate(lx + 50, ly - 4); c.rotate(-0.15); rr(c, 0, -110, 56, 110, 10); paint(c, '#2a2a33', 5); c.fillStyle = '#e03b3b'; ell(c, 28, -96, 6, 6); c.fill(); c.restore(); }
  // plato
  const px = x + 50, py = y - 346;
  ell(c, px, py, 62, 16); paint(c, '#ffffff', 5);
  if (p.plate === 'full') {
    ell(c, px, py - 14, 40, 18); paint(c, '#d99a52', 5);
    c.fillStyle = '#5a3317'; for (const [dx, dy] of [[-16, -16], [6, -10], [18, -18], [-4, -20]]) { ell(c, px + dx, py + dy, 5, 3.5); c.fill(); }
  } else {
    c.fillStyle = '#8a5326'; for (let i = 0; i < 7; i++) { ell(c, px - 30 + hash(i + 1) * 60, py - 4 + hash(i + 5) * 6, 4.5, 3); c.fill(); }
  }
}

function drawCrumbs(c, p) {
  c.fillStyle = '#8a5326';
  for (let i = 0; i < 10; i++) { ell(c, p.x + (hash(i) - 0.5) * 120, p.y - 6 + (hash(i + 3) - 0.5) * 24, 5 + hash(i + 8) * 4, 4); c.fill(); }
}

window.ART = { W, H, INK, drawLivingRoom, drawKitchen, drawMateo, drawMichi, drawSideTable, drawCrumbs, hash, rr, paint, ell };
})();
