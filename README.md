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


## Assets incluidos
- `assets/kurenai_idle.svg`, `assets/kurenai_attack.svg`
- `assets/viento_idle.svg`, `assets/viento_attack.svg`
- `assets/stage_bg.svg`

Estos assets ya vienen dentro del repo y se usan en el render del juego.


## Nota sobre assets
Los archivos en `assets/` son una recreación ligera en SVG inspirada en tu referencia visual.
No son un recorte 1:1 automático de las imágenes que compartiste en el chat.
Si me pasas los sprites originales como archivos (`.png`/`.webp`), los integro exactamente en el juego.
