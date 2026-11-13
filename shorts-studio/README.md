# Shorts Studio

Fábrica gratuita de shorts animados verticales (1080x1920, máx. 60 s): monigotes de cabeza blanca, escenarios coloridos, voz en español y subtítulos palabra por palabra.

Todo es local y gratis:
- **Dibujo y animación:** código (Canvas), renderizado con Playwright/Chromium. El personaje es idéntico en cada escena.
- **Voz:** [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) (Apache-2.0), voces en español `em_alex`, `ef_dora`, `em_santa`.
- **Música:** pizzicato generado por el propio programa (sin derechos de autor).
- **Fuente:** Fredoka (SIL OFL).

## Uso

```bash
./setup.sh                                        # una vez
./make.sh stories/001-la-ultima-galleta.json --preview   # hoja de vista previa
./make.sh stories/001-la-ultima-galleta.json             # video -> out/001-la-ultima-galleta.mp4
```

## Escribir una historia

Cada historia es un JSON en `stories/` con una lista de escenas (`shots`). Cada escena tiene:

| Campo | Qué hace |
|---|---|
| `line` | La frase que narra la voz (la duración de la escena sale de aquí) |
| `set` / `time` | Escenario (`living_room`, `kitchen`) y `day` / `night` |
| `cam` | Cámara `from` → `to` como `[x, y, zoom]` en un mundo de 1080x1920 |
| `actors` | `mateo` o `michi` con `x`, `y`, `to_x` (camina), `face` (1/-1), `expr`, `pose`, `hold`, `look` |
| `props` | `side_table` (con `plate: full/empty`, `phone`) o `crumbs` |
| `fx` | `punch` (zoom de golpe), `shake`, `footage` (cámara de seguridad nocturna) |
| `keywords` | Palabras que se resaltan en amarillo en los subtítulos |

Expresiones de Mateo: `neutral`, `happy`, `shocked`, `suspicious`, `sleepy`. Poses: `stand`, `point`, `reach`, `crouch`, `sleepwalk`. Objetos en mano: `plate_empty`, `milk`, `magnifier`, `phone`.
Expresiones de Michi: `neutral`, `innocent`, `shocked`, `smug`.
