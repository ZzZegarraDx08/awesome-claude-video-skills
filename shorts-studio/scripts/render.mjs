// Renderiza la historia a MP4 vertical 1080x1920 (o una hoja de vista previa con --preview).
// Uso: node scripts/render.mjs stories/001-la-ultima-galleta.json [--preview]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const storyPath = process.argv[2];
const preview = process.argv.includes('--preview');
const story = JSON.parse(fs.readFileSync(storyPath, 'utf8'));
const build = path.join(ROOT, 'build', story.id);
const timing = JSON.parse(fs.readFileSync(path.join(build, 'timing.json'), 'utf8'));
const FPS = timing.fps || 30;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', (e) => { console.error('ERROR en la página:', e.message); process.exitCode = 1; });
page.on('console', (m) => { if (m.type() === 'error') console.error('consola:', m.text()); });
await page.goto('file://' + path.join(ROOT, 'engine/index.html'));
await page.evaluate(() => document.fonts.load('700 100px Fredoka'));
await page.evaluate(([s, t]) => window.setup(s, t), [story, timing]);

async function frame(t, q = 0.92) {
  const url = await page.evaluate(([t, q]) => window.frameJPEG(t, q), [t, q]);
  return Buffer.from(url.split(',')[1], 'base64');
}

if (preview) {
  const dir = path.join(build, 'preview'); fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const [i, s] of timing.shots.entries()) {
    const t = s.speech_start + (s.speech_end - s.speech_start) * 0.6;
    const f = path.join(dir, `shot_${String(i).padStart(2, '0')}.jpg`);
    fs.writeFileSync(f, await frame(t)); files.push(f);
  }
  const cols = 4, rows = Math.ceil(files.length / cols);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '1', '-i', path.join(dir, 'shot_%02d.jpg'),
    '-vf', `scale=360:640,tile=${cols}x${rows}:padding=8:color=white`, '-frames:v', '1', path.join(build, 'contact.jpg')]);
  console.log('vista previa ->', path.join(build, 'contact.jpg'));
  await browser.close();
  process.exit();
}

const outDir = path.join(ROOT, 'out'); fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${story.id}.mp4`);
const total = timing.total, n = Math.ceil(total * FPS);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-i', path.join(build, 'voice.wav'), '-i', path.join(build, 'music.wav'),
  '-filter_complex', '[2:a]volume=0.16[m];[1:a][m]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]',
  '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = 0; f < n; f++) {
  const buf = await frame(f / FPS);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 150 === 0) console.log(`fotograma ${f}/${n}`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log(`video -> ${out} (${total.toFixed(1)} s, render ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
