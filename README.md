# Kike Fight 2

Juego de lucha 2D en `HTML/CSS/JS` puro para navegador.

## Publicarlo en GitHub Pages (como en tu captura: **Deploy from a branch**)

Tu configuración de la imagen está bien para publicar sin GitHub Actions.

1. Sube el código al repo (`main`).
2. En **Settings → Pages** deja:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main`
   - **Folder:** `/ (root)`
3. Pulsa **Save**.
4. Espera 1–3 minutos.
5. Abre tu sitio en:
   - `https://<usuario>.github.io/<repo>/`

> Ejemplo: si tu usuario es `hernanfernandez1` y el repo se llama `kikefight2`, sería `https://hernanfernandez1.github.io/kikefight2/`.

## Si no aparece el sitio

- Haz un cambio pequeño, commit y push a `main` para forzar nuevo deploy.
- Revisa en **Actions** si hay errores de build de Pages.
- Verifica que exista `index.html` en la raíz del repositorio.

## Ejecutarlo localmente

```bash
git clone <URL_DEL_REPO>
cd kikefight2
python3 -m http.server 8000
```

Abre en el navegador: `http://localhost:8000`

## Controles
- **P1:** `A/D` mover, `W` saltar, `S` agacharse, `F` puño, `G` patada, `H` especial, `R` reiniciar.
- **P2:** `←/→` mover, `↑` saltar, `↓` agacharse, `K` puño, `L` patada, `;` especial.

## Usar tus sprites originales (recortados desde spritesheet)

Ahora el juego ya intenta usar **primero tus archivos** (spritesheet) y recorta frames con `drawImage(...)`.

Pon tus imágenes en `assets/original/` con estos nombres exactos:

- `p1_idle_sheet.png`
- `p1_attack_sheet.png`
- `p2_idle_sheet.png`
- `p2_attack_sheet.png`

### Cómo debe venir cada spritesheet

- Frames en fila horizontal.
- Fondo transparente recomendado.
- Medidas usadas actualmente por el motor:
  - Idle: `80x128` por frame, `6` frames.
  - Attack: `96x128` por frame, `6` frames.

> Si tus recortes tienen otro tamaño/cantidad de frames, ajusto esos valores en `game.js` para que quede exacto a tus assets.

## Fallback actual

Si todavía no están tus spritesheets, el juego usa temporalmente:

- `assets/kurenai_idle.svg`, `assets/kurenai_attack.svg`
- `assets/viento_idle.svg`, `assets/viento_attack.svg`
- `assets/stage_bg.svg`
