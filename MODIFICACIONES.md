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

---

### 2026-04-28 · Reestructuración a 2 secciones (GENERAL país / MEDELLÍN) — reunión Surtimax

**Motivación:** Dirección solicita reunión con Surtimax (programada 2026-04-29) con foco en **información país** de recaudos, no solo Medellín. Estadística por cliente últimos 6 meses con desglose total mes vs. total por VH. El mapa interactivo aplica solo a **macrozonas país**; el detalle Medellín conserva las imágenes estáticas existentes.

**Cambios estructurales en `web/index.html`:**
- Agregado `<div id="section-tabs">` con dos botones: **GENERAL** (default) y **MEDELLÍN**.
- Los 31 slides existentes quedan envueltos en `<section data-section="medellin" hidden>`. Sin tagging individual.
- Nuevos 7 slides en `<section data-section="general">`:
  | # | ID | Contenido |
  |---|---|---|
  | 1 | `slide-G1` | Cover Surtimax · Recaudo país |
  | 2 | `slide-G2` | KPIs ejecutivos país (servicios, recaudo, clientes, VH) |
  | 3 | `slide-G3` | Tabla top 10 clientes 6 meses (formato pedido por dirección) |
  | 4 | `slide-G4` | Tendencia mensual por región (matriz 6×6 + total país) |
  | 5 | `slide-G5` | Efectividad comparativa por región |
  | 6 | `slide-G6` | Detalle cliente × mes × VH (formato Diana Pinilla solicitado por jefe) |
  | 7 | `slide-G7` | Mapa interactivo ArcGIS de 6 regiones país |
- `slide-13` (MEDELLÍN) **restaurado** a imagen estática `../images/maps/overview_antioquia.png`. El componente `#arcgis-map` ahora vive solo en `slide-G7`.

**Cambios en `web/js/slides.js`:**
- Reescrito para soportar tabs. Estado `{ section, current, slides }`.
- Al cambiar de tab: oculta el otro `<section>`, reconstruye `dot-nav`, resetea a slide 0.
- Expone API `window.QuickSlides` (`switchSection`, `goTo`, `getSection`, `getCurrent`).
- Corrige rutas de mapas de zona Medellín (`assets/charts/` → `../images/charts/`) que estaban rotas tras la reorg 2026-04-28.

**Cambios en `web/js/arcgis_map.js`:**
- Reemplaza las 9 zonas Medellín por **6 regiones país**: Antioquia, Bogotá-Sabana, Valle del Cauca, Costa Atlántica, Eje Cafetero, Santanderes.
- Centroides aproximados en capitales departamentales (TODO: ajustar con shapefile oficial).
- Vista inicial: `center=[-73.5, 5.5]`, `zoom=6` (Colombia entera).
- KPIs **mock estables** inline (no aleatorios por carga): servicios, recaudo $M, efectividad %, top 3 clientes.
- Init lazy ahora vigila `slide-G7` (no `slide-13`).

**Cambios en `web/css/styles.css`:**
- Sección "Section tabs": píldora flotante centrada arriba, paleta azul Éxito.
- Sección "Tabla genérica .general-table": estilo unificado para slides G3, G4, G6.
- `.section-block { display: contents }` para que el `<section>` no rompa el layout original.

**Datos mock — estructura esperada para `data/db_real`:**
```
clientes:
  - cliente: str
    region: str  ∈ {Antioquia, Bogotá-Sabana, Valle, Costa, Eje Cafetero, Santanderes}
    meses:
      - mes: YYYY-MM
        total_mes_M: number    # millones COP
        total_por_vh_M: number # millones COP / VH
        vh_activos: int
        servicios: int
```

**Impactos / TODOs:**
- ⚠️ **Datos mock estables**: reemplazar al subir archivos a `data/db_real/`. Los lugares a tocar son: tablas en `slide-G2..G6` (HTML directo) y constante `REGIONES` en `web/js/arcgis_map.js`.
- ⚠️ Los **6 centroides** son aproximados (capital de cada región). Validar con shapefile oficial.
- ⚠️ El WebMap `781f76fd8f9b402a82c0b1672cff38c4` debe ser **público o accesible** desde el browser del cliente.
- La sección MEDELLÍN queda intacta (slides 1-31), solo reactiva su imagen estática en slide-13.

---

### 2026-04-28 · Integración base real `RECAUDO_NACIONAL_LIMPIO.xlsx` → reemplazo de mocks GENERAL

**Motivación:** el usuario subió `data/db_real/RECAUDO_NACIONAL_LIMPIO.xlsx` (17.324 filas, 1,6 MB). Se reemplazan los datos mock placeholder de la sección GENERAL por los reales antes de la reunión Surtimax 2026-04-29.

**Cobertura real vs solicitada:**
- Cobertura entregada: **4 meses** (2026-01 a 2026-04). El REQUEST pedía 6 (nov-25 a abr-26). Decisión del usuario: adaptar dashboard a 4 meses.
- 5 regiones con datos (Antioquia, Bogotá-Sabana, Valle del Cauca, Costa Atlántica, Eje Cafetero). **Santanderes sin servicios** en el período.

**Archivos creados:**
| Archivo | Rol |
|---|---|
| `scripts/clean_db_real.py` | Pipeline reproducible: carga xlsx → limpia → mapea → agrega → genera CSV+JSON |
| `data/db_real_clean_v1.csv` | Base normalizada nivel servicio · 17.176 filas · UTF-8 |
| `data/db_real_aggregations_v1.json` | KPIs pre-calculados listos para los slides |

**Decisiones de modelado (acordadas con usuario):**
- **Cobertura:** 4 meses (ene-abr 2026), no 6.
- **Slide G5 efectividad:** mantenido con proxy temporal **% Sin riesgo = SIN_RIESGO / total** por región. TODO: ajustar a fórmula real (cobrados/asignados) cuando se reciba base de servicios pendientes.
- **TIPO DE RECAUDO:** 4 buckets — Contado · Contraentrega · Aliados · Crédito (+ Otros para "Recogida en Cedi"). 16 variantes raw colapsadas.
- **RIESGO:** valor `"0"` (2.486 filas) → categoría **"Sin clasificar"** (no se une a SIN RIESGO).
- **Mapeo regional:** prioridad `REGIONAL` operativa (FUNZA/MEDELLIN/COSTA/EJE/CALI) con fallback a `DEPARTAMENTO`. Servicios fuera de las 6 macrozonas (11 filas) → "Otros".

**Limpieza aplicada:**
- 5 fechas inválidas (NaT) descartadas
- 143 duplicados removidos por `(fecha, placa, cliente, valor, municipio)`
- Encoding mojibake corregido (`NARI�O`→`NARIÑO`, `BELTR�N`→`BELTRÁN`, etc.)
- Strings normalizados (NFC, strip)
- IDs derivados por hash MD5: `servicio_id` (10 chars), `cliente_id` (8 chars)

**Reemplazos en el dashboard:**
| Slide | Cambio |
|---|---|
| **G1** cover | Subtítulo "6 meses" → "4 meses · enero — abril 2026"; metas: 5 regiones país, 3.453 clientes, $23.919M |
| **G2** KPIs | Servicios 12.480→**17.176**; Recaudo $4.820M→**$23.919M**; Clientes 187→**3.453**; VH 94→**131**; concentración real (Bogotá 42,9% · Antioquia 23% · Costa 18,6%); meses pico/bajo/promedio reales |
| **G3** Top 10 clientes | Reemplazo completo: INVERSIONES GRUPO ROAL SAS, INVERSIONES LA CENTRAL DE CLEMENCIA, GUTIERREZ GIL, ALYAN UNIDOS, URREA GARCIA, BARBOSA GUERRA, CARDENAS VALENCIA, RODRIGUEZ FORERO, NARANJO DULFARY, SUPERMERCADOS LOS PAISAS |
| **G4** Tendencia | Tabla de 6×6 → **5×4** (5 regiones · 4 meses). Total país $4.820M→**$23.919M** |
| **G5** Efectividad | Etiqueta "% efectividad" → **"% Sin riesgo"** (proxy). 6 cards → 5 cards reales + 1 marcador "sin datos" para Santanderes. Eje Cafetero como región más crítica (54,4%) |
| **G6** Detalle cliente×mes×VH | Top 5 reales (INVERSIONES GRUPO ROAL SAS, INVERSIONES LA CENTRAL DE CLEMENCIA, GUTIERREZ GIL, ALYAN UNIDOS, URREA GARCIA) × 4 meses × 2 métricas |
| **G7** Mapa ArcGIS | Constante `REGIONES` reemplazada con 5 regiones reales (Bogotá, Antioquia, Costa, Eje, Valle). Popup actualizado: subtítulo "ene-abr 2026", campo "% Sin riesgo" en lugar de "Efectividad", footer cita `data/db_real_clean_v1.csv` |

**Re-ejecución del pipeline:**
```
cd <project_root>
python scripts/clean_db_real.py
```
Genera de nuevo el CSV+JSON desde la fuente. Si la base se actualiza, esto debe correrse antes de tocar el HTML.

**TODOs pendientes:**
- Recibir base de servicios pendientes/asignados → recalcular efectividad real en G5.
- Confirmar significado de columna `PESO` (puede ser kg, indicador binario, ignorado).
- Validar centroides de capitales con shapefile oficial.
- Considerar `fetch(data/db_real_aggregations_v1.json)` en `arcgis_map.js` para evitar duplicación HTML/JS.
- Aclarar 11 servicios fuera de las 6 macrozonas (Santander/Tolima/Nariño/Córdoba): incluir o excluir.

---

### 2026-04-28 · `web/` → `docs/` para GitHub Pages

**Motivación:** GitHub Pages plan free solo sirve desde la raíz del repo o desde `/docs`. El dashboard vivía en `/web` (no soportado), por lo que `https://dataana1quick.github.io/EXITO/` mostraba la versión vieja del 24-04 (cuando `index.html` estaba en raíz, antes de la reorg).

**Acción tomada:** copiar `web/` → `docs/` (no rename), porque OneDrive Files-On-Demand tenía la carpeta marcada con atributos `ReadOnly` + `ReparsePoint` y un proceso `node` (Live Server) la retenía. El rename fallaba con `Access denied`.

**Resultado en git:**
- `docs/` agregada al tracking (con todo el contenido del antiguo `web/`).
- `web/` removida del index con `git rm -r --cached` (los archivos físicos quedan en disco).
- `web/` agregada a `.gitignore` para evitar que vuelva al tracking.

**Pendiente de hacer manualmente desde el Explorador de Windows:**
1. Pausar OneDrive (clic derecho ícono bandeja → Pause syncing → 2 hours).
2. Cerrar VS Code Live Server si está activo.
3. Cerrar pestañas del navegador con `web/index.html`.
4. Eliminar la carpeta `C:\Users\Quick\OneDrive\OneDrive - Quick Help SAS\INFORMES\EXITO\EXITO V2\exito\web\` (clic derecho → Eliminar).
5. Reanudar OneDrive.

**Configuración pendiente en GitHub UI:**
1. Ir a `https://github.com/DataAna1Quick/EXITO/settings/pages`.
2. Source: **Deploy from a branch**.
3. Branch: **`mapa-arcgis-interactivo`** · Folder: **`/docs`**.
4. Save.
5. Esperar ~1 minuto. La URL `https://dataana1quick.github.io/EXITO/` empezará a servir `docs/index.html`.

**Las rutas internas del HTML siguen funcionando** sin cambios: `css/styles.css`, `js/...`, `../images/...` son relativas al HTML, no al repo. La carpeta `images/` no se movió.

**TODO:** después del próximo merge a `main`, considerar si conviene mover Pages back a `main` con `/docs` (para que la URL pública refleje "estable" y no la rama de feature).
