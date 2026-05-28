"""
build_loyalty_data.py — Pipeline de Fidelización de Flota (Loyalty)

Lee data/db_real/Data_Exto_Loyalti.csv (nivel REGIONAL x MES) y genera
docs/js/loyalty_data.js (window.LOYALTY_DATA) que alimenta el slide de loyalty.

Características de la data (ver .claude/context/07_INDICADORES.md):
  - Grano: una fila por (regional FM Éxito x mes). 5 regionales, ene-may 2026.
  - Métricas: SERVICIOS, SERV FINALIZADOS, % FINALIZADOS, CANTIDAD VEH,
    LOYALTY (vehículos fieles), % LOYALTY = LOYALTY/VEH, SERV POR VEH.
  - SOLO mensual (no hay fecha diaria) → trazabilidad por MES, no por semana.

Re-ejecutable: reemplaza el CSV y corre `python scripts/build_loyalty_data.py`.
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
SRC = ROOT / "data" / "db_real" / "Data_Exto_Loyalti.csv"
OUT_JS = ROOT / "docs" / "js" / "loyalty_data.js"
OUT_JSON = ROOT / "data" / "loyalty_data.json"

ORDEN = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
         "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
ABBR = {"enero": "Ene", "febrero": "Feb", "marzo": "Mar", "abril": "Abr", "mayo": "May",
        "junio": "Jun", "julio": "Jul", "agosto": "Ago", "septiembre": "Sep",
        "octubre": "Oct", "noviembre": "Nov", "diciembre": "Dic"}


def pct(s):
    return float(str(s).replace("%", "").replace(",", ".").strip())


def num(s):
    return float(str(s).replace(",", ".").strip())


def main():
    print(f"[1/3] Cargando {SRC.name} …")
    df = pd.read_csv(SRC, sep=None, engine="python", encoding="utf-8-sig")
    df.columns = [c.strip() for c in df.columns]
    df["Mes"] = df["Mes"].str.strip().str.lower()
    print(f"      filas: {len(df)} · regionales: {df['Nombre'].nunique()} · meses: {df['Mes'].nunique()}")

    meses = [m for m in ORDEN if m in df["Mes"].unique()]

    regionales = []
    for nombre, g in df.groupby("Nombre"):
        g = g.set_index("Mes")
        por_mes = []
        for m in meses:
            if m not in g.index:
                continue
            r = g.loc[m]
            por_mes.append({
                "mes": m, "abbr": ABBR.get(m, m[:3].title()),
                "servicios": int(r["SERVICIOS"]),
                "serv_finalizados": int(r["SERV FINALIZADOS"]),
                "pct_finalizados": round(pct(r["% FIANLIZADOS"]), 1),
                "veh": int(r["CANTIDAD VEH"]),
                "loyalty": int(r["LOYALTY"]),
                "pct_loyalty": round(pct(r["% LOYALTY"]), 1),
                "serv_por_veh": round(num(r["SERV POR VEH"]), 1),
            })
        serv_tot = sum(p["servicios"] for p in por_mes)
        regionales.append({
            "nombre": nombre.replace("FM EXITO ", "").strip().title(),
            "nombre_full": nombre,
            "por_mes": por_mes,
            "servicios_total": serv_tot,
            "veh_prom": round(sum(p["veh"] for p in por_mes) / len(por_mes), 1),
            "loy_prom": round(sum(p["pct_loyalty"] for p in por_mes) / len(por_mes), 1),
            "loy_ultimo": por_mes[-1]["pct_loyalty"] if por_mes else 0,
        })
    regionales.sort(key=lambda x: x["servicios_total"], reverse=True)

    # Nacional por mes (suma LOYALTY / suma VEH)
    nacional = []
    for m in meses:
        sub = df[df["Mes"] == m]
        veh = int(sub["CANTIDAD VEH"].sum())
        loy = int(sub["LOYALTY"].sum())
        svc = int(sub["SERVICIOS"].sum())
        nacional.append({
            "mes": m, "abbr": ABBR.get(m, m[:3].title()),
            "servicios": svc, "veh": veh, "loyalty": loy,
            "pct_loyalty": round(loy / veh * 100, 1) if veh else 0,
            "serv_por_veh": round(svc / veh, 1) if veh else 0,
        })

    out = {
        "meta": {
            "fuente": "data/db_real/Data_Exto_Loyalti.csv",
            "generado": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M"),
            "rango": f"{ABBR[meses[0]]}–{ABBR[meses[-1]]} 2026",
            "granularidad": "mensual (sin trazabilidad semanal: la data viene agregada por mes)",
            "definicion_loyalty": "% LOYALTY = vehículos fieles (LOYALTY) / vehículos activos (CANTIDAD VEH)",
        },
        "meses": [{"key": m, "abbr": ABBR.get(m, m[:3].title())} for m in meses],
        "regionales": regionales,
        "nacional": nacional,
        "nacional_loy_prom": round(sum(n["pct_loyalty"] for n in nacional) / len(nacional), 1),
    }

    print("[2/3] Escribiendo salidas …")
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_JS.write_text(
        "/* AUTO-GENERADO por scripts/build_loyalty_data.py — NO editar a mano. */\n"
        "window.LOYALTY_DATA = " + json.dumps(out, ensure_ascii=False) + ";\n",
        encoding="utf-8")
    print(f"      {OUT_JSON.relative_to(ROOT)}")
    print(f"      {OUT_JS.relative_to(ROOT)}")

    print("\n[3/3] RESUMEN")
    print(f"  Loyalty nacional por mes: " + " · ".join(f"{n['abbr']} {n['pct_loyalty']}%" for n in nacional))
    print(f"  Promedio nacional: {out['nacional_loy_prom']}%")
    for r in regionales:
        print(f"  {r['nombre']:14s}: {r['servicios_total']:>5} svc · {r['veh_prom']:>5} VH prom · loyalty prom {r['loy_prom']}% (últ {r['loy_ultimo']}%)")


if __name__ == "__main__":
    main()
