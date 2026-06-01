"""
build_medellin_data.py — Pipeline Zonas / Riesgo de Efectivo (Medellín / Antioquia)

Zonifica el recaudo de Antioquia (REGIONAL=MEDELLIN) usando el lookup de
data/raw/data_servicios_zonificada_v3.csv (columna MACROZONA, ~95% cobertura por
(municipio, barrio); fallback por municipio; resto → "Medellín – Otros barrios")
y genera docs/js/medellin_data.js para los slides 12-16 y el mapa slide-13.

Decisiones (ver .claude/context/07_INDICADORES.md Módulo 2):
  - Efectivo / recaudo físico = Contado + Contraentrega + MISURTII.
  - Macrozonas SE CONSERVAN (no se pierde data).
  - Umbrales fijos: placa >$8M / >$15M; distribución $2M/$5M/$8M/$12M/$20M.

Re-ejecutable: reemplaza la fuente y corre `python scripts/build_medellin_data.py`.
"""
import json
import sys
import unicodedata
from pathlib import Path

import pandas as pd

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "db_real" / "RECAUDO_NACIONAL_LIMPIO.xlsx"
LOOKUP = ROOT / "data" / "raw" / "data_servicios_zonificada_v3.csv"
OUT_JS = ROOT / "docs" / "js" / "medellin_data.js"
OUT_JSON = ROOT / "data" / "medellin_data.json"

DEFAULT_ZONA = "Medellín – Otros barrios"
SPECIFIC_FIXES = [
    ("NARI�O", "NARIÑO"), ("C�RDOBA", "CÓRDOBA"), ("NORE�A", "NOREÑA"),
    ("MU�OZ", "MUÑOZ"), ("PE�A", "PEÑA"), ("ITAG�", "ITAGÜÍ"),
]


def norm(s):
    if not isinstance(s, str):
        return ""
    for a, b in SPECIFIC_FIXES:
        s = s.replace(a, b)
    return unicodedata.normalize("NFC", s).strip().upper()


def clean_mz(s):
    if not isinstance(s, str):
        return DEFAULT_ZONA
    s = (s.replace("Medell�n", "Medellín").replace("Aburr�", "Aburrá")
          .replace("Antioque�o", "Antioqueño").replace(" � ", " – "))
    return unicodedata.normalize("NFC", s).strip()


def es_efectivo(t):
    u = str(t).upper().strip()
    return u == "CONTADO" or u == "PAGO CONTRAENTREGA" or u.startswith("MISURTII")


def tipo_ef(t):
    u = str(t).upper().strip()
    if u == "CONTADO":
        return "contado"
    if u == "PAGO CONTRAENTREGA":
        return "contraentrega"
    if u.startswith("MISURTII"):
        return "misurtii"
    return "otro"


def fmt_cop(n):
    return "$" + f"{round(n):,}".replace(",", ".")


def pct1(a, b):
    return round(a / b * 100, 1) if b else 0


def build_lookup():
    v3 = pd.read_csv(LOOKUP, sep=None, engine="python")
    v3["k_mun"] = v3["MUNICIPIO"].map(norm)
    v3["k_bar"] = v3["BARRIO"].map(norm)
    v3["mz"] = v3["MACROZONA"].map(clean_mz)
    pair = (v3.groupby(["k_mun", "k_bar"])["mz"].agg(lambda x: x.value_counts().index[0]).to_dict())
    muni = (v3.groupby("k_mun")["mz"].agg(lambda x: x.value_counts().index[0]).to_dict())
    return pair, muni


def main():
    print("[1/5] Cargando recaudo + lookup v3 …")
    pair, muni = build_lookup()
    df = pd.read_excel(SRC, sheet_name="Data_Consolidada_Regional")
    df["FECHA"] = pd.to_datetime(df["FECHA"], errors="coerce", dayfirst=True)
    df = df[(df["FECHA"].notna()) & (df["REGIONAL"].map(norm) == "MEDELLIN")].copy()
    df = df.drop_duplicates(subset=["FECHA", "PLACA", "CLIENTE", "VALOR LIMPIO", "MUNICIPIO"], keep="first")
    print(f"      servicios Antioquia: {len(df)}")

    print("[2/5] Zonificando …")
    km = df["MUNICIPIO"].map(norm)
    kb = df["BARRIO"].map(norm)
    zona = []
    for m, b in zip(km, kb):
        zona.append(pair.get((m, b)) or muni.get(m) or DEFAULT_ZONA)
    df["zona"] = zona
    cobertura = pct1((pd.Series(zona) != DEFAULT_ZONA).sum() + (pd.Series(zona) == DEFAULT_ZONA).sum() * 0, len(df))
    mapeados = sum(1 for m, b in zip(km, kb) if (m, b) in pair or m in muni)
    print(f"      cobertura directa (par/municipio): {pct1(mapeados, len(df))}% · resto → '{DEFAULT_ZONA}'")

    df["cliente"] = df["CLIENTE"].map(lambda s: unicodedata.normalize("NFC", str(s)).strip())
    df["valor"] = df["VALOR LIMPIO"].astype(float)
    df["ef"] = df["TIPO DE RECAUDO"].map(es_efectivo)
    df["tipo_ef"] = df["TIPO DE RECAUDO"].map(tipo_ef)
    df["fecha_d"] = df["FECHA"].dt.normalize()
    df["riesgo_norm"] = df["RIESGO"].map(norm).map(
        {"SIN RIESGO": "Sin riesgo", "EN RIESGO": "En riesgo"}).fillna("Sin clasificar")
    ef = df[df["ef"]].copy()

    print("[3/5] Agregando por macrozona …")
    ORDER = ["Aburrá Norte (municipios)", "Aburrá Sur (municipios)",
             "Medellín – Nororiente", "Medellín – Noroccidente", "Medellín – Centroriente",
             "Medellín – Centroccidente", "Medellín – Suroccidente", "Medellín – Corregimientos",
             "Medellín – Otros barrios", "Oriente Antioqueño", "Otros municipios"]
    zonas_presentes = [z for z in ORDER if z in set(df["zona"])]
    for z in df["zona"].unique():
        if z not in zonas_presentes:
            zonas_presentes.append(z)

    macrozonas = []
    for z in zonas_presentes:
        sub = df[df["zona"] == z]
        sef = sub[sub["ef"]]
        comp = sef.groupby("tipo_ef")["valor"].sum()
        cont, contraent, misu = float(comp.get("contado", 0)), float(comp.get("contraentrega", 0)), float(comp.get("misurtii", 0))
        ef_tot = cont + contraent + misu
        # día pico físico
        if len(sef):
            byday = sef.groupby("fecha_d")["valor"].sum()
            dpf = {"fecha": pd.Timestamp(byday.idxmax()).strftime("%d/%m/%Y"), "valor": int(round(byday.max()))}
        else:
            dpf = None
        t3s = sub["cliente"].value_counts().head(3)
        top3_serv = [{"name": n.title(), "val": int(v)} for n, v in t3s.items()]
        t3r = sub.groupby("cliente")["valor"].sum().nlargest(3)
        top3_rec = []
        for n, v in t3r.items():
            cd = sub[sub["cliente"] == n].groupby("fecha_d")["valor"].sum()
            top3_rec.append({"name": n.title(), "val": int(round(v)),
                             "dia_max": {"fecha": pd.Timestamp(cd.idxmax()).strftime("%d/%m/%Y"), "valor": int(round(cd.max()))}})
        macrozonas.append({
            "nombre": z, "servicios": int(len(sub)),
            "recaudo": int(round(sub["valor"].sum())),
            "recaudo_efectivo": int(round(ef_tot)), "recaudo_efectivo_fmt": fmt_cop(ef_tot),
            "contado": int(round(cont)), "contraentrega": int(round(contraent)), "misurtii": int(round(misu)),
            "pct_contado": pct1(cont, ef_tot), "pct_contraentrega": pct1(contraent, ef_tot), "pct_misurtii": pct1(misu, ef_tot),
            "dia_pico_fisico": dpf,
            "top3_servicios": top3_serv, "top3_recaudo": top3_rec,
            "pct_sin_riesgo": pct1((sub["riesgo_norm"] == "Sin riesgo").sum(), len(sub)),
        })

    print("[4/5] Clasificación por placa + distribución (efectivo diario) …")
    # recaudo efectivo diario por (placa, día)
    pd_day = ef.dropna(subset=["PLACA"]).groupby(["PLACA", "fecha_d"])["valor"].sum().reset_index()
    placas = []
    for placa, g in pd_day.groupby("PLACA"):
        d = g["valor"]
        mx = float(d.max())
        riesgo = "Crítico" if (mx >= 20e6 or (d > 15e6).sum() >= 1) else ("Alto" if mx >= 10e6 else "Moderado")
        placas.append({"placa": placa, "riesgo": riesgo,
                       "recaudo_total": int(round(d.sum())), "dias_op": int(len(d)),
                       "mediana": int(round(d.median())), "p75": int(round(d.quantile(.75))),
                       "p90": int(round(d.quantile(.90))), "maximo": int(round(mx)),
                       "dias_8m": int((d > 8e6).sum()), "dias_15m": int((d > 15e6).sum())})
    placas.sort(key=lambda x: x["recaudo_total"], reverse=True)
    placas_top = placas[:12]

    # distribución por umbral de recaudo diario (placa-día)
    dd = pd_day["valor"]
    total_dias = len(dd)
    total_rec = dd.sum()
    niveles = [("BAJO", 0, 2e6), ("BAJO+", 2e6, 5e6), ("MODERADO", 5e6, 8e6),
               ("ALTO", 8e6, 12e6), ("ALTO+", 12e6, 20e6), ("CRÍTICO", 20e6, float("inf"))]
    rangos = {"BAJO": "$1K – $2.000.000", "BAJO+": "$2.000.000 – $5.000.000", "MODERADO": "$5.000.000 – $8.000.000",
              "ALTO": "$8.000.000 – $12.000.000", "ALTO+": "$12.000.000 – $20.000.000", "CRÍTICO": "> $20.000.000"}
    distribucion = []
    for nombre, lo, hi in niveles:
        mask = (dd > lo) & (dd <= hi) if lo > 0 else (dd <= hi)
        distribucion.append({"nivel": nombre, "rango": rangos[nombre],
                             "dias": int(mask.sum()), "pct_dias": pct1(mask.sum(), total_dias),
                             "pct_recaudo": pct1(dd[mask].sum(), total_rec)})
    dias_8m_tot = int((dd > 8e6).sum())

    kpis = {
        "servicios": int(len(df)),
        "recaudo_total": int(round(df["valor"].sum())),
        "recaudo_efectivo": int(round(ef["valor"].sum())), "recaudo_efectivo_fmt": fmt_cop(ef["valor"].sum()),
        "vh_efectivo": int(ef["PLACA"].dropna().nunique()),
        "dias_operativos_placa": int(total_dias),
        "rango": f"{df['fecha_d'].min().strftime('%Y-%m-%d')} a {df['fecha_d'].max().strftime('%Y-%m-%d')}",
    }

    out = {
        "meta": {"fuente": "RECAUDO_NACIONAL_LIMPIO.xlsx + lookup data_servicios_zonificada_v3.csv",
                 "generado": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M"),
                 "definicion_efectivo": "Contado + Contraentrega + MISURTII",
                 "cobertura_zonificacion_pct": pct1(mapeados, len(df))},
        "kpis": kpis, "macrozonas": macrozonas, "placas": placas_top, "distribucion": distribucion,
        "alerta_dias_8m": {"dias": dias_8m_tot, "pct_dias": pct1(dias_8m_tot, total_dias),
                           "pct_recaudo": pct1(dd[dd > 8e6].sum(), total_rec)},
    }

    print("[5/5] Escribiendo salidas …")
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_JS.write_text("/* AUTO-GENERADO por scripts/build_medellin_data.py — NO editar a mano. */\n"
                      "window.MEDELLIN_DATA = " + json.dumps(out, ensure_ascii=False) + ";\n", encoding="utf-8")
    print(f"      {OUT_JSON.relative_to(ROOT)}\n      {OUT_JS.relative_to(ROOT)}")

    print("\n=== RESUMEN ===")
    print(f"  Servicios Antioquia: {kpis['servicios']} · efectivo {kpis['recaudo_efectivo_fmt']} · {kpis['vh_efectivo']} VH")
    print(f"  Cobertura zonificación: {out['meta']['cobertura_zonificacion_pct']}%")
    print(f"  Macrozonas ({len(macrozonas)}):")
    for m in macrozonas:
        print(f"    {m['nombre']:32s} {m['servicios']:>4} svc · efectivo {m['recaudo_efectivo_fmt']}")
    print(f"  Placa-días: {total_dias} · días >$8M: {dias_8m_tot} ({out['alerta_dias_8m']['pct_dias']}% días = {out['alerta_dias_8m']['pct_recaudo']}% recaudo)")
    print("  Distribución: " + " · ".join(f"{d['nivel']} {d['pct_dias']}%" for d in distribucion))
    print(f"  Top placa: {placas_top[0]['placa']} ({placas_top[0]['riesgo']}) máx {fmt_cop(placas_top[0]['maximo'])} · {placas_top[0]['dias_8m']}d>$8M")


if __name__ == "__main__":
    main()
