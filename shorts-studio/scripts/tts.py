"""Narración gratuita y local con Kokoro + tiempos por palabra + música de fondo generada.

Uso: .venv/bin/python scripts/tts.py stories/001-la-ultima-galleta.json
Salida: build/<id>/voice.wav, music.wav, timing.json
"""
import json, os, re, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 24000
LEAD = 0.15      # silencio antes de la primera frase
GAP = 0.32       # pausa entre frases
TAIL = 1.1       # cola al final (para el remate)


def trim(s, thr=0.006):
    idx = np.where(np.abs(s) > thr)[0]
    if len(idx) == 0:
        return s
    a = max(0, idx[0] - int(0.02 * SR))
    b = min(len(s), idx[-1] + int(0.06 * SR))
    return s[a:b]


def syllable_weight(word):
    """Peso aproximado de duración de una palabra: vocales (sílabas) + signos de pausa."""
    w = word.lower()
    v = len(re.findall(r"[aeiouáéíóúü]+", w)) or 1
    weight = v + 0.15 * len(re.sub(r"[^a-záéíóúñü]", "", w))
    if re.search(r"[.,;:!?…]$", word):
        weight += 0.9
    return weight


def word_timing(text, start, dur):
    words = text.split()
    ws = [syllable_weight(w) for w in words]
    tot = sum(ws)
    t, out = start, []
    for w, wt in zip(words, ws):
        d = dur * wt / tot
        out.append({"w": w, "start": round(t, 3), "end": round(t + d, 3)})
        t += d
    return out


def pluck(freq, dur, sr=SR, decay=0.996):
    """Cuerda pulsada (Karplus-Strong): suena a pizzicato suave."""
    n = int(dur * sr)
    p = int(sr / freq)
    rng = np.random.default_rng(int(freq * 10))
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = decay * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out


def music(total, bpm=104):
    """Base musical juguetona tipo 'misterio cómico' (pizzicato), libre de derechos: la generamos nosotros."""
    beat = 60 / bpm
    n = int(total * SR) + SR
    out = np.zeros(n)
    # progresión Am - F - C - E (misterio ligero)
    chords = [[220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [196.0, 261.6, 329.6], [164.8, 207.7, 246.9]]
    bass = [110.0, 87.3, 98.0, 82.4]
    cache = {}
    def note(f, d):
        k = (round(f, 1), d)
        if k not in cache:
            cache[k] = pluck(f, d)
        return cache[k]
    t, bar = 0.0, 0
    while t < total + 1:
        ch, b = chords[bar % 4], bass[bar % 4]
        for i in range(8):  # corcheas
            st = int((t + i * beat / 2) * SR)
            f = ch[[0, 1, 2, 1, 0, 2, 1, 2][i]] * 2
            s = note(f, 0.5) * (0.22 if i % 2 == 0 else 0.15)
            out[st:st + len(s)] += s[: max(0, n - st)]
        for i in (0, 2):
            st = int((t + i * beat) * SR)
            s = note(b, 0.9) * 0.35
            out[st:st + len(s)] += s[: max(0, n - st)]
        t += 4 * beat
        bar += 1
    out = out[: int(total * SR)]
    fade = int(1.0 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)
    out[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))
    return (out / (np.max(np.abs(out)) + 1e-9) * 0.9).astype(np.float32)


def main(path):
    story = json.load(open(path, encoding="utf-8"))
    out_dir = os.path.join(ROOT, "build", story["id"])
    os.makedirs(out_dir, exist_ok=True)
    k = Kokoro(os.path.join(ROOT, "models/kokoro-v1.0.onnx"), os.path.join(ROOT, "models/voices-v1.0.bin"))
    voice, speed, lang = story.get("voice", "em_alex"), story.get("speed", 1.05), story.get("lang", "es")

    pieces, shots, t = [np.zeros(int(LEAD * SR), np.float32)], [], LEAD
    for i, sh in enumerate(story["shots"]):
        s, sr = k.create(sh["line"], voice=voice, speed=speed, lang=lang)
        assert sr == SR
        s = trim(s)
        d = len(s) / SR
        shots.append({"i": i, "start": round(t - (LEAD if i == 0 else GAP / 2), 3), "speech_start": round(t, 3),
                      "speech_end": round(t + d, 3), "words": word_timing(sh["line"], t, d)})
        pieces.append(s.astype(np.float32))
        t += d
        gap = TAIL if i == len(story["shots"]) - 1 else GAP
        pieces.append(np.zeros(int(gap * SR), np.float32))
        t += gap
    total = round(t, 3)
    for i, s in enumerate(shots):
        s["start"] = max(0.0, s["start"])
        s["end"] = shots[i + 1]["speech_start"] - GAP / 2 if i + 1 < len(shots) else total
    voice_wav = np.concatenate(pieces)
    voice_wav = voice_wav / (np.max(np.abs(voice_wav)) + 1e-9) * 0.95
    sf.write(os.path.join(out_dir, "voice.wav"), voice_wav, SR)
    sf.write(os.path.join(out_dir, "music.wav"), music(total), SR)
    json.dump({"total": total, "fps": 30, "shots": shots}, open(os.path.join(out_dir, "timing.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{story['id']}: {total:.1f}s, {len(shots)} escenas -> {out_dir}")


if __name__ == "__main__":
    main(sys.argv[1])
