"""
build_dashboard_data.py — Pipeline dinámico de la sección GENERAL país (Surtimax)

Lee RECAUDO_NACIONAL_LIMPIO.xlsx y genera un JSON maestro indexado por periodo
(todos / cada mes / cada semana ISO secuencial 1..N) que alimenta el dashboard
dinámico en docs/index.html (sección GENERAL).

Salidas:
  - docs/js/dashboard_data.js   → window.DASHBOARD_DATA = {...}  (lo consume el HTML; funciona en file:// y GitHub Pages)
  - data/dashboard.json         → mismo contenido, para inspección / otras herramientas

Decisiones de negocio (ver .claude/context/07_INDICADORES.md):
  - FECHA mixta (datetime + texto dd/mm/yyyy) → parsear con dayfirst=True.
  - Efectivo en ruta = CONTADO + CONTRAENTREGA + MISURTII* (MISURTII SÍ cuenta).
  - Semana = ISO (lunes-domingo), numerada secuencial S01..SNN; no depende del mes, filtrable por mes.
  - Recalcular todo desde el Excel completo en cada corrida.
  - Montos COP completos (sin truncar).

Uso:
  python scripts/build_dashboard_data.py
"""
import json
import sys
import hashlib
import unicodedata
from pathlib import Path

import pandas as pd

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "db_real" / "RECAUDO_NACIONAL_LIMPIO.xlsx"
OUT_JS = ROOT / "docs" / "js" / "dashboard_data.js"
OUT_JSON = ROOT / "data" / "dashboard.json"
SHEET = "Data_Consolidada_Regional"

# Umbral "día en alto riesgo de recaudo" (exposición recurrente)
UMBRAL_DIA_RIESGO = 5_000_000

REGIONAL_OPERATIVA_TO_PAIS = {
    "FUNZA": "Bogotá-Sabana",
    "MEDELLIN": "Antioquia",
    "COSTA": "Costa Atlántica",
    "EJE CAFETERO": "Eje Cafetero",
    "CALI": "Valle del Cauca",
}
REGION_ORDER = ["Bogotá-Sabana", "Antioquia", "Costa Atlántica", "Eje Cafetero", "Valle del Cauca"]

SPECIFIC_FIXES = [
    ("NARI�O", "NARIÑO"), ("C�RDOBA", "CÓRDOBA"), ("QUIND�O", "QUINDÍO"),
    ("BELTR�N", "BELTRÁN"), ("JOS�", "JOSÉ"), ("MAR�A", "MARÍA"),
    ("ANDR�S", "ANDRÉS"), ("RAM�REZ", "RAMÍREZ"), ("MART�NEZ", "MARTÍNEZ"),
    ("L�PEZ", "LÓPEZ"), ("P�REZ", "PÉREZ"), ("GONZ�LEZ", "GONZÁLEZ"),
    ("NORE�A", "NOREÑA"), ("MU�OZ", "MUÑOZ"), ("PE�A", "PEÑA"),
    ("�", "Ñ"),  # fallback final
]

MESES_ES = {1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
            7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"}
MES_ABBR = {1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun",
            7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic"}


def fix_encoding(s):
    if not isinstance(s, str):
        return s
    for bad, good in SPECIFIC_FIXES:
        s = s.replace(bad, good)
    return s


def norm(s):
    if not isinstance(s, str):
        return s
    return unicodedata.normalize("NFC", fix_encoding(s)).strip()


def hash_id(*parts, length=10):
    return hashlib.md5("|".join(str(p) for p in parts).encode("utf-8")).hexdigest()[:length]


def tipo_bucket(t):
    u = str(t).upper().strip()
    if u == "CONTADO":
        return "Contado"
    if u == "PAGO CONTRAENTREGA":
        return "Contraentrega"
    if u.startswith("MISURTII"):
        return "MISURTII"
    if u.startswith("ALIADO"):
        return "Aliados"
    if u == "CREDITO":
        return "Crédito"
    return "Otros"  # PACIFICO CALI*, Recogida en Cedi, etc.


EFECTIVO_BUCKETS = {"Contado", "Contraentrega", "MISURTII"}


def fmt_cop(n):
    return "$" + f"{round(n):,}".replace(",", ".")


def fmt_pct(p):
    return f"{p:.1f}".replace(".", ",") + "%"


# ── Carga + limpieza ─────────────────────────────────────────────────────────
def load_clean():
    print(f"[1/4] Cargando {SRC.name} …")
    df = pd.read_excel(SRC, sheet_name=SHEET)
    print(f"      filas crudas: {len(df):,}")

    for c in ["REGIONAL", "PLACA", "CLIENTE", "TIPO DE RECAUDO", "MUNICIPIO", "DEPARTAMENTO", "RIESGO"]:
        df[c] = df[c].map(norm)

    # FECHA: mixta (datetime + texto dd/mm/yyyy) → dayfirst
    df["FECHA"] = pd.to_datetime(df["FECHA"], errors="coerce", dayfirst=True)
    df = df[df["FECHA"].notna()].copy()

    n0 = len(df)
    df = df.drop_duplicates(subset=["FECHA", "PLACA", "CLIENTE", "VALOR LIMPIO", "MUNICIPIO"], keep="first")
    print(f"      duplicados removidos: {n0 - len(df):,} → quedan {len(df):,}")

    df["region"] = df["REGIONAL"].map(REGIONAL_OPERATIVA_TO_PAIS).fillna("Otros")
    df["bucket"] = df["TIPO DE RECAUDO"].map(tipo_bucket)
    df["es_efectivo"] = df["bucket"].isin(EFECTIVO_BUCKETS)
    df["riesgo_norm"] = df["RIESGO"].map(
        {"SIN RIESGO": "Sin riesgo", "EN RIESGO": "En riesgo", "0": "Sin clasificar"}
    ).fillna("Sin clasificar")

    df["mes"] = df["FECHA"].dt.strftime("%Y-%m")
    iso = df["FECHA"].dt.isocalendar()
    df["iso_key"] = iso["year"].astype(str) + "-" + iso["week"].astype(int).astype(str).str.zfill(2)
    df["fecha_d"] = df["FECHA"].dt.normalize()

    df["cliente"] = df["CLIENTE"]
    df["vh"] = df["PLACA"]
    df["valor"] = df["VALOR LIMPIO"].astype(float)
    df["cliente_id"] = df["cliente"].apply(lambda x: hash_id(x, length=8))
    return df


# ── Índice de periodos ───────────────────────────────────────────────────────
def build_index(df):
    meses = sorted(df["mes"].unique())
    mes_meta = []
    for m in meses:
        y, mm = m.split("-")
        mm = int(mm)
        mes_meta.append({"key": m, "label": f"{MESES_ES[mm]} {y}", "abbr": MES_ABBR[mm]})

    iso_keys = sorted(df["iso_key"].unique())
    sem_meta = []
    iso_to_seq = {}
    for i, ik in enumerate(iso_keys, start=1):
        seq = f"S{i:02d}"
        iso_to_seq[ik] = seq
        sub = df[df["iso_key"] == ik]
        d0, d1 = sub["fecha_d"].min(), sub["fecha_d"].max()
        lab = f"{seq} · {d0.day} {MES_ABBR[d0.month]} – {d1.day} {MES_ABBR[d1.month]}"
        meses_sem = sorted(sub["mes"].unique())
        sem_meta.append({"key": seq, "iso": ik, "label": lab,
                         "desde": d0.strftime("%Y-%m-%d"), "hasta": d1.strftime("%Y-%m-%d"),
                         "meses": meses_sem})
    df["sem_seq"] = df["iso_key"].map(iso_to_seq)

    semanas_por_mes = {m["key"]: [s["key"] for s in sem_meta if m["key"] in s["meses"]] for m in mes_meta}
    return mes_meta, sem_meta, semanas_por_mes


# ── Tendencia adaptativa (mes→por mes / mes filtrado→por semana / semana→por día) ─
def build_tendencia(sub, nivel):
    if nivel == "todos":
        keys = sorted(sub["mes"].unique())
        col, labels = "mes", {k: MES_ABBR[int(k.split("-")[1])] for k in keys}
        gran = "mes"
    elif nivel == "mes":
        keys = sorted(sub["sem_seq"].unique())
        col, labels = "sem_seq", {k: k for k in keys}
        gran = "semana"
    else:  # semana → por día
        keys = sorted(sub["fecha_d"].unique())
        col = "fecha_d"
        labels = {k: f"{pd.Timestamp(k).day}/{pd.Timestamp(k).month:02d}" for k in keys}
        gran = "dia"

    regiones = []
    for r in REGION_ORDER:
        rs = sub[sub["region"] == r]
        if rs["valor"].sum() == 0 and len(rs) == 0:
            continue
        vals = [int(round(rs[rs[col] == k]["valor"].sum() / 1e6)) for k in keys]
        regiones.append({"region": r, "valores_M": vals, "total_M": int(round(rs["valor"].sum() / 1e6))})
    total_bucket = [int(round(sub[sub[col] == k]["valor"].sum() / 1e6)) for k in keys]
    return {
        "granularidad": gran,
        "buckets": [labels[k] for k in keys],
        "regiones": regiones,
        "total_por_bucket_M": total_bucket,
    }


# ── Payload por periodo ───────────────────────────────────────────────────────
def compute_payload(sub, nivel, label):
    n_meses = sub["mes"].nunique()
    dias_op = sub["fecha_d"].nunique()
    tot = float(sub["valor"].sum())
    efectivo = float(sub[sub["es_efectivo"]]["valor"].sum())
    credito = float(sub[sub["bucket"].isin(["Aliados", "Crédito"])]["valor"].sum())
    otro = tot - efectivo - credito

    kpis = {
        "servicios": int(len(sub)),
        "recaudo_total": int(round(tot)),
        "recaudo_total_fmt": fmt_cop(tot),
        "clientes": int(sub["cliente_id"].nunique()),
        "vh": int(sub["vh"].dropna().nunique()),
        "recaudo_efectivo": int(round(efectivo)),
        "recaudo_efectivo_fmt": fmt_cop(efectivo),
        "pct_efectivo": round(efectivo / tot * 100, 1) if tot else 0,
        "recaudo_credito": int(round(credito)),
        "pct_credito": round(credito / tot * 100, 1) if tot else 0,
        "recaudo_otro": int(round(otro)),
        "pct_otro": round(otro / tot * 100, 1) if tot else 0,
        "n_meses": int(n_meses),
        "dias_operativos": int(dias_op),
        "prom_mensual": int(round(tot / n_meses)) if n_meses else 0,
        "prom_mensual_fmt": fmt_cop(tot / n_meses) if n_meses else "$0",
        "prom_diario": int(round(tot / dias_op)) if dias_op else 0,
        "prom_diario_fmt": fmt_cop(tot / dias_op) if dias_op else "$0",
    }

    # Top 10 clientes
    g = (sub.groupby(["cliente_id", "cliente"])
         .agg(servicios=("valor", "size"), recaudo=("valor", "sum"),
              vh=("vh", "nunique"),
              region=("region", lambda x: x.value_counts().index[0]))
         .reset_index().sort_values("recaudo", ascending=False).head(10))
    top_clientes = []
    for _, row in g.iterrows():
        cs = sub[sub["cliente_id"] == row["cliente_id"]]
        by_day = cs.groupby("fecha_d")["valor"].agg(["sum", "size"])
        dia = by_day["sum"].idxmax()
        por_mes = {m: round(v / 1e6, 1) for m, v in cs.groupby("mes")["valor"].sum().items()}
        top_clientes.append({
            "nombre": row["cliente"], "region": row["region"],
            "servicios": int(row["servicios"]),
            "recaudo": int(round(row["recaudo"])), "recaudo_fmt": fmt_cop(row["recaudo"]),
            "por_vh": int(round(row["recaudo"] / row["vh"])) if row["vh"] else 0,
            "por_mes_M": por_mes,
            "dia_max": {"fecha": pd.Timestamp(dia).strftime("%d/%m/%Y"),
                        "valor": int(round(by_day.loc[dia, "sum"])),
                        "ticket": int(round(by_day.loc[dia, "sum"] / by_day.loc[dia, "size"]))},
        })

    # Efectividad (% sin riesgo) por región
    efect = []
    for r in REGION_ORDER:
        rs = sub[sub["region"] == r]
        if len(rs) == 0:
            continue
        sr = int((rs["riesgo_norm"] == "Sin riesgo").sum())
        er = int((rs["riesgo_norm"] == "En riesgo").sum())
        sc = int((rs["riesgo_norm"] == "Sin clasificar").sum())
        efect.append({"region": r, "sin_riesgo": sr, "en_riesgo": er, "sin_clasificar": sc,
                      "total": len(rs), "pct_sin_riesgo": round(sr / len(rs) * 100, 1)})

    # Por región (cards del mapa G7)
    por_region = []
    for r in REGION_ORDER:
        rs = sub[sub["region"] == r]
        if len(rs) == 0:
            continue
        r_tot = float(rs["valor"].sum())
        r_ef = float(rs[rs["es_efectivo"]]["valor"].sum())
        r_dias = rs["fecha_d"].nunique()
        r_meses = rs["mes"].nunique()
        # día pico físico (efectivo)
        ef_rows = rs[rs["es_efectivo"]]
        if len(ef_rows):
            by_day_ef = ef_rows.groupby("fecha_d")["valor"].sum()
            dpf = by_day_ef.idxmax()
            dia_pico = {"fecha": pd.Timestamp(dpf).strftime("%d/%m/%Y"), "valor": int(round(by_day_ef.max()))}
            # placa max efectivo en un día
            by_pf = ef_rows.dropna(subset=["vh"]).groupby(["vh", "fecha_d"])["valor"].sum()
            if len(by_pf):
                (pl, fpl) = by_pf.idxmax()
                placa_max = {"placa": pl, "fecha": pd.Timestamp(fpl).strftime("%d/%m/%Y"), "valor": int(round(by_pf.max()))}
            else:
                placa_max = None
        else:
            dia_pico, placa_max = None, None
        # top 3 por recaudo con su día max
        t3 = (rs.groupby("cliente")["valor"].sum().nlargest(3))
        top3 = []
        for nombre, val in t3.items():
            cd = rs[rs["cliente"] == nombre].groupby("fecha_d")["valor"].sum()
            dmax = cd.idxmax()
            top3.append({"nombre": nombre, "recaudo": int(round(val)), "recaudo_fmt": fmt_cop(val),
                         "dia_max": {"fecha": pd.Timestamp(dmax).strftime("%d/%m/%Y"), "valor": int(round(cd.max()))}})
        # alerta: clientes con días de recaudo diario > umbral
        cdays = rs.groupby(["cliente", "fecha_d"])["valor"].sum().reset_index()
        cdays["riesgo"] = cdays["valor"] > UMBRAL_DIA_RIESGO
        per_cli = cdays.groupby("cliente").agg(dias_activos=("fecha_d", "nunique"),
                                               dias_riesgo=("riesgo", "sum"),
                                               recaudo=("valor", "sum"))
        per_cli["pct_propio"] = (per_cli["dias_riesgo"] / per_cli["dias_activos"] * 100).round(1)
        persistentes = int(((per_cli["pct_propio"] >= 20) & (per_cli["dias_riesgo"] > 0)).sum())
        alert_top = per_cli[per_cli["dias_riesgo"] > 0].sort_values("dias_riesgo", ascending=False).head(5)
        alerta_clientes = [{
            "nombre": idx, "dias_riesgo": int(row["dias_riesgo"]), "dias_activos": int(row["dias_activos"]),
            "pct_propio": float(row["pct_propio"]),
            "pct_op": round(row["dias_riesgo"] / r_dias * 100, 1) if r_dias else 0,
            "recaudo": int(round(row["recaudo"])),
        } for idx, row in alert_top.iterrows()]

        ef_e = next((e for e in efect if e["region"] == r), None)
        por_region.append({
            "region": r, "servicios": int(len(rs)),
            "recaudo": int(round(r_tot)), "recaudo_fmt": fmt_cop(r_tot),
            "recaudo_efectivo": int(round(r_ef)), "recaudo_efectivo_fmt": fmt_cop(r_ef),
            "clientes": int(rs["cliente_id"].nunique()), "vh": int(rs["vh"].dropna().nunique()),
            "vh_efectivo": int(ef_rows["vh"].dropna().nunique()),
            "dias_operativos": int(r_dias),
            "prom_mensual": int(round(r_tot / r_meses)) if r_meses else 0,
            "prom_mensual_fmt": fmt_cop(r_tot / r_meses) if r_meses else "$0",
            "prom_diario": int(round(r_tot / r_dias)) if r_dias else 0,
            "prom_diario_fmt": fmt_cop(r_tot / r_dias) if r_dias else "$0",
            "pct_sin_riesgo": ef_e["pct_sin_riesgo"] if ef_e else None,
            "dia_pico_fisico": dia_pico, "placa_max_dia": placa_max,
            "top3_recaudo": top3,
            "alerta": {"clientes_persistentes": persistentes, "top_clientes": alerta_clientes},
        })

    # Concentración por región
    concentr = sorted(
        [{"region": pr["region"], "recaudo": pr["recaudo"], "recaudo_fmt": pr["recaudo_fmt"],
          "pct": round(pr["recaudo"] / tot * 100, 1) if tot else 0} for pr in por_region],
        key=lambda x: x["recaudo"], reverse=True)

    return {
        "label": label,
        "kpis": kpis,
        "tendencia": build_tendencia(sub, nivel),
        "top_clientes": top_clientes,
        "efectividad": efect,
        "por_region": por_region,
        "concentracion": concentr,
    }


def main():
    df = load_clean()
    print("[2/4] Construyendo índice de periodos …")
    mes_meta, sem_meta, semanas_por_mes = build_index(df)
    print(f"      meses: {len(mes_meta)} · semanas ISO: {len(sem_meta)}")

    print("[3/4] Calculando payloads por periodo …")
    periodos = {}
    periodos["todos"] = compute_payload(df, "todos", "Todo el período")
    for m in mes_meta:
        periodos[m["key"]] = compute_payload(df[df["mes"] == m["key"]], "mes", m["label"])
    for s in sem_meta:
        periodos[s["key"]] = compute_payload(df[df["sem_seq"] == s["key"]], "semana", s["label"])

    out = {
        "meta": {
            "fuente": "data/db_real/RECAUDO_NACIONAL_LIMPIO.xlsx",
            "generado": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M"),
            "rango": f"{df['fecha_d'].min().strftime('%Y-%m-%d')} a {df['fecha_d'].max().strftime('%Y-%m-%d')}",
            "servicios": int(len(df)),
            "umbral_dia_riesgo": UMBRAL_DIA_RIESGO,
            "definicion_efectivo": "Contado + Contraentrega + MISURTII",
        },
        "index": {
            "meses": mes_meta,
            "semanas": sem_meta,
            "semanas_por_mes": semanas_por_mes,
        },
        "periodos": periodos,
    }

    print("[4/4] Escribiendo salidas …")
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_JS.write_text(
        "/* AUTO-GENERADO por scripts/build_dashboard_data.py — NO editar a mano. */\n"
        "window.DASHBOARD_DATA = " + json.dumps(out, ensure_ascii=False) + ";\n",
        encoding="utf-8")
    print(f"      {OUT_JSON.relative_to(ROOT)}")
    print(f"      {OUT_JS.relative_to(ROOT)}")

    k = periodos["todos"]["kpis"]
    print("\n=== RESUMEN (todos) ===")
    print(f"  Servicios : {k['servicios']:,}")
    print(f"  Recaudo   : {k['recaudo_total_fmt']}")
    print(f"  Efectivo  : {k['recaudo_efectivo_fmt']} ({k['pct_efectivo']}%)")
    print(f"  Clientes  : {k['clientes']:,} · VH: {k['vh']}")
    print(f"  Meses     : {k['n_meses']} · días op.: {k['dias_operativos']}")


if __name__ == "__main__":
    main()
