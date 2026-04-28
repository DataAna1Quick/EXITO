# Ventana de contexto — Reorganización de carpetas

**Fecha:** 2026-04-28
**Carpeta:** `C:\Users\Quick\Desktop\exito`
**Criterio aprobado por el usuario:**

- Estructura **mixta** (tipo + tema): `presentations/`, `data/`, `web/`, `scripts/`, `images/`.
- **Versiones antiguas** se mueven a una subcarpeta `versions/`; la versión más reciente queda fuera.
- Solo el archivo `errorr de cards.png` se trata como auxiliar y va a `images/screenshots/`.
- Se reorganiza también el **web** (`index.html`, `css/`, `js/`).
- **No se modifica ningún nombre de archivo.** Todos los nombres se preservan exactamente como estaban (incluyendo espacios dobles, paréntesis, errores de tipeo como "errorr" y "EXTIO", etc.).
- No se tocan: `.git/`, `.claude/`, `.vscode/`, `.gitignore`, `__pycache__/`, `_overview_b64.txt`, `README.md`.

---

## 1. Estructura final

```
exito/
├── .claude/                                (intacto)
├── .git/                                   (intacto)
├── .gitignore                              (intacto)
├── .vscode/                                (intacto)
├── README.md                               (intacto, en raíz)
├── __pycache__/                            (intacto, no movido por el usuario)
├── _overview_b64.txt                       (intacto, no movido por el usuario)
├── MODIFICACIONES.md                       ← este documento
│
├── presentations/
│   ├── Maps.pptx
│   ├── exito_antioquia/
│   │   ├── ESTATUS_QUICK_EXITO_ANT_v2 (1).pptx
│   │   └── Exito_Antioquia_Riesgo_Efectivo_FINAL.pptx
│   ├── operacion_medellin/
│   │   ├── Operacion_Medellin_100_Editable.pptx
│   │   ├── Operacion_Medellin_Hibrido_Editable.pptx
│   │   └── versions/
│   │       └── Operacion_Medellin_Editable.pptx
│   ├── reportes/
│   │   ├── Reporte_Consolidado_Medellin_Q1_2026_v2 (1).pptx
│   │   └── versions/
│   │       └── Reporte_Consolidado_Medellin_Q1_2026.pptx
│   └── prm/
│       ├── D1_Valledupar_Quick.pptx
│       └── Exito_Antioquia_Riesgo_Efectivo_v6 (1).pptx
│
├── data/
│   ├── efectividad_regionales_agregar slider 3.xlsx
│   └── raw/
│       ├── DATA EXITO (1).xlsx
│       ├── data.tsv
│       ├── data.xlsx
│       ├── data_servicios_zonificada_v3.csv
│       ├── muestra data colocacion.xlsx
│       └── muestra data servicios.xlsx
│
├── web/
│   ├── EXITO_ANTIOQUIA_Operacion_Medellin.html
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── slides.js
│   └── versions/
│       ├── EXITO_ANTIOQUIA_Operacion_Medellin (3).html
│       └── EXITO_ANTIOQUIA_Operacion_Medellin (4).html
│
├── scripts/
│   ├── html_to_pptx_converter.py
│   ├── push.py
│   └── tsv_to_xlsx.py
│
└── images/
    ├── IMAGEN DATA DATA  EFECTIVIDAD POSICIONAMIENTO  2026 DE TODO EXTIO NO SOLO MEDELLIN .jpeg
    ├── charts/
    │   ├── chart_3.png
    │   ├── colocacion_detalle_1.png
    │   ├── colocacion_detalle_2.png
    │   ├── map_slide-18.jpg
    │   ├── map_slide-19.jpg
    │   ├── map_slide-20.jpg
    │   ├── map_slide-21.jpg
    │   ├── map_slide-22.jpg
    │   ├── map_slide-23.jpg
    │   ├── map_slide-24.jpg
    │   ├── map_slide-25.jpg
    │   └── map_slide-26.jpg
    ├── maps/
    │   ├── aburra_norte.jpg
    │   ├── aburra_sur.jpg
    │   ├── medellin_centroccidente.jpg
    │   ├── medellin_centroriente.jpg
    │   ├── medellin_corregimientos.jpg
    │   ├── medellin_noroccidente.jpg
    │   ├── medellin_nororiente.jpg
    │   ├── medellin_suroccidente.jpg
    │   ├── otros_municipios.jpg
    │   └── overview_antioquia.png
    └── screenshots/
        └── errorr de cards.png
```

---

## 2. Movimientos detallados (origen → destino)

### Presentaciones (.pptx)

| Origen | Destino |
|---|---|
| `ESTATUS_QUICK_EXITO_ANT_v2 (1).pptx` | `presentations/exito_antioquia/ESTATUS_QUICK_EXITO_ANT_v2 (1).pptx` |
| `Exito_Antioquia_Riesgo_Efectivo_FINAL.pptx` | `presentations/exito_antioquia/Exito_Antioquia_Riesgo_Efectivo_FINAL.pptx` |
| `Operacion_Medellin_100_Editable.pptx` | `presentations/operacion_medellin/Operacion_Medellin_100_Editable.pptx` |
| `Operacion_Medellin_Hibrido_Editable.pptx` | `presentations/operacion_medellin/Operacion_Medellin_Hibrido_Editable.pptx` |
| `Operacion_Medellin_Editable.pptx` | `presentations/operacion_medellin/versions/Operacion_Medellin_Editable.pptx` *(versión más antigua)* |
| `Reporte_Consolidado_Medellin_Q1_2026_v2 (1).pptx` | `presentations/reportes/Reporte_Consolidado_Medellin_Q1_2026_v2 (1).pptx` |
| `Maps.pptx` | `presentations/Maps.pptx` |
| `prm/D1_Valledupar_Quick.pptx` | `presentations/prm/D1_Valledupar_Quick.pptx` |
| `prm/Exito_Antioquia_Riesgo_Efectivo_v6 (1).pptx` | `presentations/prm/Exito_Antioquia_Riesgo_Efectivo_v6 (1).pptx` |
| `prm/Reporte_Consolidado_Medellin_Q1_2026.pptx` | `presentations/reportes/versions/Reporte_Consolidado_Medellin_Q1_2026.pptx` *(versión más antigua que el v2 de la raíz)* |

### Datos (.xlsx, .csv, .tsv)

| Origen | Destino |
|---|---|
| `DATA EXITO (1).xlsx` | `data/raw/DATA EXITO (1).xlsx` |
| `data.tsv` | `data/raw/data.tsv` |
| `data.xlsx` | `data/raw/data.xlsx` |
| `data_servicios_zonificada_v3.csv` | `data/raw/data_servicios_zonificada_v3.csv` |
| `muestra data colocacion.xlsx` | `data/raw/muestra data colocacion.xlsx` |
| `muestra data servicios.xlsx` | `data/raw/muestra data servicios.xlsx` |
| `efectividad_regionales_agregar slider 3.xlsx` | `data/efectividad_regionales_agregar slider 3.xlsx` *(parece dato de trabajo activo, queda fuera de raw/)* |

### Web

| Origen | Destino |
|---|---|
| `index.html` | `web/index.html` |
| `EXITO_ANTIOQUIA_Operacion_Medellin.html` | `web/EXITO_ANTIOQUIA_Operacion_Medellin.html` *(la más reciente y de mayor tamaño)* |
| `EXITO_ANTIOQUIA_Operacion_Medellin (3).html` | `web/versions/EXITO_ANTIOQUIA_Operacion_Medellin (3).html` |
| `EXITO_ANTIOQUIA_Operacion_Medellin (4).html` | `web/versions/EXITO_ANTIOQUIA_Operacion_Medellin (4).html` |
| `css/styles.css` | `web/css/styles.css` |
| `js/slides.js` | `web/js/slides.js` |

### Scripts

| Origen | Destino |
|---|---|
| `html_to_pptx_converter.py` | `scripts/html_to_pptx_converter.py` |
| `push.py` | `scripts/push.py` |
| `tsv_to_xlsx.py` | `scripts/tsv_to_xlsx.py` |

### Imágenes

| Origen | Destino |
|---|---|
| `assets/charts/*` (12 archivos) | `images/charts/*` |
| `assets/maps/*` (10 archivos) | `images/maps/*` |
| `errorr de cards.png` | `images/screenshots/errorr de cards.png` |
| `IMAGEN DATA DATA  EFECTIVIDAD POSICIONAMIENTO  2026 DE TODO EXTIO NO SOLO MEDELLIN .jpeg` | `images/IMAGEN DATA DATA  EFECTIVIDAD POSICIONAMIENTO  2026 DE TODO EXTIO NO SOLO MEDELLIN .jpeg` |

---

## 3. Carpetas residuales vacías (no se pudieron eliminar)

El sistema de archivos del directorio montado (Windows) no permite borrar carpetas vacías desde el sandbox. Estas carpetas quedaron vacías y pueden borrarse manualmente desde el Explorador de Windows:

- `assets/` (con subcarpetas vacías `charts/` y `maps/`)
- `css/`
- `js/`
- `prm/`

Para borrarlas en Windows: clic derecho → Eliminar.

---

## 4. Posibles impactos a revisar

1. **`index.html`, `css/styles.css`, `js/slides.js`**: si `index.html` referencia `css/styles.css` y `js/slides.js` con rutas relativas (lo más común), seguirá funcionando porque el árbol relativo se conserva (`web/index.html` → `web/css/styles.css`, `web/js/slides.js`).
2. **`scripts/*.py`**: si los scripts esperaban estar en la raíz con rutas relativas a archivos de datos (por ejemplo `data.xlsx`), ahora los datos están en `data/raw/` — habrá que ajustar las rutas dentro de los scripts si vuelves a ejecutarlos. **No se ha modificado el contenido de ningún script.**
3. **`__pycache__/html_to_pptx_converter.cpython-313.pyc`**: este caché quedó en raíz pero apunta a un `.py` que ya no está en raíz. Python regenerará el caché automáticamente la próxima vez que ejecute el script.
4. **Git**: estas reubicaciones aparecerán como renombrados/borrados/agregados en `git status`. Conviene hacer `git add -A` y un commit que diga "reorganización de carpetas" para que el historial las reconozca como rename.
5. **`Maps.pptx`**: lo dejé en `presentations/` directamente (no en una subcarpeta temática) porque su nombre genérico no sugiere claramente a qué tema pertenece. Si pertenece a Operación Medellín o Éxito Antioquia, indícame y lo muevo.

---

## 5. Resumen rápido

- **49 archivos movidos** (22 desde la raíz, 3 desde `prm/`, 22 desde `assets/`, 1 desde `css/`, 1 desde `js/`), todos con su nombre original intacto.
- **0 archivos renombrados.**
- **0 archivos eliminados.**
- **5 archivos** quedaron en raíz por decisión explícita: `README.md`, `.gitignore`, `_overview_b64.txt`, `__pycache__/`, `MODIFICACIONES.md`.
- **4 carpetas vacías** quedan como residuo eliminable manualmente: `assets/`, `css/`, `js/`, `prm/`.

---

## Cambios incrementales

### 2026-04-28 · Mapa interactivo ArcGIS en `slide-13`

**Motivación:** reemplazar la imagen estática `chart_3.png` del slide-13 por un mapa interactivo con 9 markers (uno por regional) que muestren un cuadro informativo (popup) al click con los KPIs de la zona.

**Archivos creados:**
| Archivo | Rol |
|---|---|
| `web/js/arcgis_map.js` | Lógica del mapa: WebMap + 9 markers + popup custom + extracción de KPIs desde el DOM |
| `.claude/context/agents/arcgis_agent.md` | Ventana de contexto del nuevo agente especializado |

**Archivos modificados:**
| Archivo | Cambio |
|---|---|
| `web/index.html` | `<head>`: agregado SDK ArcGIS 4.30 (CSS+JS); `slide-13`: `<img>` reemplazada por `.arcgis-map-wrapper` (con la imagen como fallback); `<body>`: agregado `<script src="js/arcgis_map.js">` |
| `web/css/styles.css` | Agregada sección "ArcGIS · Mapa interactivo" (≈120 líneas): estilos para `#arcgis-map`, fallback y `.exito-popup` con paleta azul Éxito existente |
| `.claude/context/00_INDEX.md` | Registrada nueva fila "ArcGIS" en la tabla "Ventanas por agente" |

**Decisiones técnicas:**
- **SDK 4.x clásico** (no `<arcgis-embedded-map>` 5.0) para tener control total del popup HTML.
- **Item-id del WebMap:** `781f76fd8f9b402a82c0b1672cff38c4` (el que provee el usuario).
- **Lazy init:** el mapa solo se carga cuando `slide-13` entra en viewport o se activa, vía `IntersectionObserver` + `MutationObserver` sobre la clase `.active`.
- **KPIs sin duplicación:** `arcgis_map.js` lee los slides 18-26 del DOM (`.zona-card-red`, `.zona-card-yellow`, `.top3-list`) y construye el popup. Si los slides cambian, el popup se actualiza solo.
- **CTA "Ver ficha completa":** el popup tiene un link que dispara click sobre el dot-nav del slide correspondiente, sin modificar `slides.js`.
- **Fallback robusto:** si el SDK no carga o `view.when()` falla, la imagen `assets/charts/chart_3.png` queda visible debajo. Solo cuando el WebMap se monta exitosamente se le agrega `.loaded` y se oculta.

**Impactos potenciales / TODOs:**
- Las **coordenadas (lat/lng) de las 9 zonas son aproximadas** (centroides estimados desde Aburrá+Antioquia). Validar con un dataset oficial de zonificación antes de presentación al cliente. Editar el array `REGIONES` en `arcgis_map.js`.
- El WebMap `781f76fd8f9b402a82c0b1672cff38c4` debe ser **público o accesible** desde el browser del cliente. Si está privado, hace falta autenticación (IdentityManager + token).
- La ruta `assets/charts/chart_3.png` que actúa como fallback **está rota** desde la reorganización del 2026-04-28 (la imagen vive ahora en `images/charts/chart_3.png`). No se corrige aquí porque excede el alcance de esta tarea, pero el mapa interactivo igual funciona y, si el SDK monta, el fallback nunca se ve.
- El SDK ArcGIS pesa ~3 MB en primera carga; lazy init mitiga el costo. Si el cliente está offline, el mapa no carga y queda visible la imagen fallback (rota actualmente — ver punto anterior).
- **No se borraron** las imágenes en `images/maps/*.jpg` ni `images/charts/chart_3.png`: el mapa interactivo coexiste como capa lógica.
