"""
build_colocacion_data.py — Pipeline de Colocación / Posicionamiento de flota

Lee data/db_real/COLOCACION_NACIONAL.xlsx (hoja `Data`, grano FECHA x ZONA) y
genera docs/js/colocacion_data.js (window.COLOCACION_DATA) para los slides 2-4
de la sección MEDELLÍN.

Decisiones (ver .claude/context/07_INDICADORES.md):
  - Solicitados = SOLICITUD · Colocados/Puestos = POSICIONAMIENTO · % = pos/sol.
  - Semana = ISO secuencial S01..N (normalizado a todo el proyecto).
  - Target 95% fijo (meta de negocio).

Re-ejecutable: reemplaza el xlsx y corre `python scripts/build_colocacion_data.py`.
"""
import json
import sys
from pathlib import Path

import pandas as pd

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "db_real" / "COLOCACION_NACIONAL.xlsx"
OUT_JS = ROOT / "docs" / "js" / "colocacion_data.js"
OUT_JSON = ROOT / "data" / "colocacion_data.json"
TARGET = 95

MES_NUM = {"ENERO": 1, "FEBRERO": 2, "MARZO": 3, "ABRIL": 4, "MAYO": 5, "JUNIO": 6,
           "JULIO": 7, "AGOSTO": 8, "SEPTIEMBRE": 9, "OCTUBRE": 10, "NOVIEMBRE": 11, "DICIEMBRE": 12}
MES_ABBR = {1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun", 7: "Jul",
            8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic"}
ZONA_DISPLAY = {"FUNZA": "Funza", "MEDELLIN": "Medellín", "COSTA": "Costa",
                "CALI": "Cali", "EJE CAFETERO": "Eje Cafetero"}


def lectura(pct):
    if pct >= 85:
        return "Aceptable · cerca del target"
    if pct >= 70:
        return "Zona amarilla"
    if pct >= 50:
        return "Punto de quiebre"
    return "Crisis · capacidad insuficiente"


def color_pct(pct):
    return "#27ae60" if pct >= 95 else ("#fbbf24" if pct >= 70 else "#f59e0b")


def main():
    print(f"[1/3] Cargando {SRC.name} (hoja Data) …")
    df = pd.read_excel(SRC, sheet_name="Data", usecols="A:F").dropna(subset=["FECHA", "ZONA"])
    df["FECHA"] = pd.to_datetime(df["FECHA"], errors="coerce", dayfirst=True)
    df = df[df["FECHA"].notna()]
    df["ZONA"] = df["ZONA"].astype(str).str.upper().str.strip()
    df["MESN"] = df["MES"].astype(str).str.upper().str.strip()
    iso = df["FECHA"].dt.isocalendar()
    df["isoweek"] = iso["week"].astype(int)
    print(f"      filas: {len(df)} · {df['FECHA'].min().date()} → {df['FECHA'].max().date()}")

    # Índice de meses + semanas (ISO secuencial)
    meses_keys = sorted(df["MESN"].unique(), key=lambda m: MES_NUM.get(m, 99))
    meses = [{"key": m, "abbr": MES_ABBR[MES_NUM[m]], "nombre": m.title()} for m in meses_keys]

    iso_keys = sorted(df["isoweek"].unique())
    semanas = []
    iso_to_seq = {}
    for i, wk in enumerate(iso_keys, start=1):
        seq = f"S{i:02d}"
        iso_to_seq[wk] = seq
        sub = df[df["isoweek"] == wk]
        d0, d1 = sub["FECHA"].min(), sub["FECHA"].max()
        semanas.append({"key": seq, "iso": int(wk),
                        "label": f"{d0.day} {MES_ABBR[d0.month]}",
                        "rango": f"{d0.day} {MES_ABBR[d0.month]} – {d1.day} {MES_ABBR[d1.month]}"})

    def agg(sub):
        return int(sub["SOLICITUD"].sum()), int(sub["POSICIONAMIENTO"].sum())

    # Medellín
    med = df[df["ZONA"] == "MEDELLIN"]
    por_mes = []
    for m in meses_keys:
        s, p = agg(med[med["MESN"] == m])
        por_mes.append({"mes": m, "abbr": MES_ABBR[MES_NUM[m]], "sol": s, "pos": p,
                        "sin_cubrir": p - s, "pct": round(p / s * 100, 1) if s else 0,
                        "lectura": lectura(p / s * 100 if s else 0)})
    por_sem = []
    for wk in iso_keys:
        s, p = agg(med[med["isoweek"] == wk])
        pct = round(p / s * 100) if s else 0
        por_sem.append({"key": iso_to_seq[wk], "sol": s, "pos": p, "pct": pct, "color": color_pct(pct)})
    s_tot, p_tot = agg(med)
    med_total = {"sol": s_tot, "pos": p_tot, "sin_cubrir": p_tot - s_tot,
                 "pct": round(p_tot / s_tot * 100, 1) if s_tot else 0,
                 "brecha_pp": round(p_tot / s_tot * 100 - TARGET, 1) if s_tot else 0}

    # Comparativo por regional (todo el período)
    regiones = []
    for z, g in df.groupby("ZONA"):
        s, p = agg(g)
        regiones.append({"zona": ZONA_DISPLAY.get(z, z.title()), "raw": z,
                         "sol": s, "pos": p, "pct": round(p / s * 100, 1) if s else 0})
    regiones.sort(key=lambda x: x["pct"], reverse=True)
    s_all, p_all = agg(df)
    red_total = {"sol": s_all, "pos": p_all, "pct": round(p_all / s_all * 100, 1) if s_all else 0}
    # red sin Medellín
    nm = df[df["ZONA"] != "MEDELLIN"]
    s_nm, p_nm = agg(nm)
    red_sin_med = round(p_nm / s_nm * 100, 1) if s_nm else 0

    out = {
        "meta": {"fuente": "data/db_real/COLOCACION_NACIONAL.xlsx", "target": TARGET,
                 "generado": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M"),
                 "rango": f"{df['FECHA'].min().strftime('%d/%m/%Y')} – {df['FECHA'].max().strftime('%d/%m/%Y')}"},
        "meses": meses, "semanas": semanas,
        "medellin": {"por_mes": por_mes, "por_semana": por_sem, "total": med_total},
        "regiones": regiones, "red_total": red_total, "red_sin_medellin": red_sin_med,
    }

    print("[2/3] Escribiendo salidas …")
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_JS.write_text(
        "/* AUTO-GENERADO por scripts/build_colocacion_data.py — NO editar a mano. */\n"
        "window.COLOCACION_DATA = " + json.dumps(out, ensure_ascii=False) + ";\n", encoding="utf-8")
    print(f"      {OUT_JSON.relative_to(ROOT)}")
    print(f"      {OUT_JS.relative_to(ROOT)}")

    print("\n[3/3] RESUMEN Medellín")
    print(f"  Total: {med_total['sol']}/{med_total['pos']} = {med_total['pct']}% (brecha {med_total['brecha_pp']}pp vs {TARGET})")
    print("  Por mes: " + " · ".join(f"{m['abbr']} {m['pct']}%" for m in por_mes))
    print(f"  Red total: {red_total['pct']}% · Red sin Medellín: {red_sin_med}%")


if __name__ == "__main__":
    main()
