"""
clean_db_real.py — Limpia y agrega RECAUDO_NACIONAL_LIMPIO.xlsx

Genera dos artefactos:
  - data/db_real_clean_v1.csv       (base normalizada nivel servicio)
  - data/db_real_aggregations_v1.json (KPIs listos para los slides G2..G7)

Decisiones tomadas (sesión 2026-04-28):
  - Cobertura: 4 meses (ene-abr 2026), no 6 meses
  - 4 buckets TIPO DE RECAUDO: Contado / Contraentrega / Aliados / Crédito (+ Otros)
  - RIESGO=0 → "Sin clasificar" (3 categorías: Sin riesgo / En riesgo / Sin clasificar)
  - Efectividad G5 (proxy temporal): % Sin riesgo = SIN_RIESGO / total por región
  - Servicios fuera de las 6 macrozonas (Santander/Tolima/Nariño/Córdoba) → región "Otros"
  - Sin servicio_id ni cliente_id en la fuente → se generan por hash determinístico

Uso:
  python scripts/clean_db_real.py
"""
import json
import hashlib
import unicodedata
from pathlib import Path

import pandas as pd

# ── Rutas ───────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "db_real" / "RECAUDO_NACIONAL_LIMPIO.xlsx"
OUT_CSV = ROOT / "data" / "db_real_clean_v1.csv"
OUT_JSON = ROOT / "data" / "db_real_aggregations_v1.json"

# ── Mapeos ──────────────────────────────────────────────────────────────────
REGIONAL_OPERATIVA_TO_PAIS = {
    "FUNZA": "Bogotá-Sabana",
    "MEDELLIN": "Antioquia",
    "COSTA": "Costa Atlántica",
    "EJE CAFETERO": "Eje Cafetero",
    "CALI": "Valle del Cauca",
}

DEPTO_TO_PAIS = {
    "ANTIOQUIA": "Antioquia",
    "CUNDINAMARCA": "Bogotá-Sabana",
    "BOGOTA": "Bogotá-Sabana",
    "VALLE DEL CAUCA": "Valle del Cauca",
    "ATLANTICO": "Costa Atlántica",
    "BOLIVAR": "Costa Atlántica",
    "MAGDALENA": "Costa Atlántica",
    "CÓRDOBA": "Costa Atlántica",
    "CORDOBA": "Costa Atlántica",
    "CESAR": "Costa Atlántica",
    "SUCRE": "Costa Atlántica",
    "LA GUAJIRA": "Costa Atlántica",
    "RISARALDA": "Eje Cafetero",
    "CALDAS": "Eje Cafetero",
    "QUINDIO": "Eje Cafetero",
    "QUINDÍO": "Eje Cafetero",
    "SANTANDER": "Santanderes",
    "NORTE DE SANTANDER": "Santanderes",
}

TIPO_RECAUDO_BUCKET = {
    "CONTADO": "Contado",
    "PAGO CONTRAENTREGA": "Contraentrega",
    "Pago contraentrega": "Contraentrega",
    "ALIADOS": "Aliados",
    "Aliado": "Aliados",
    "Aliado Surtimax": "Aliados",
    "MISURTII": "Aliados",
    "MISURTII PACIFICO": "Aliados",
    "MISURTII EJE": "Aliados",
    "PACIFICO CALI": "Aliados",
    "PACIFICO CALI FORANEO": "Aliados",
    "PACIFICO CALI 2": "Aliados",
    "CREDITO": "Crédito",
    "credito": "Crédito",
    "Credito": "Crédito",
    "Recogida en Cedi": "Otros",
}

# Encoding fixes para mojibake (cp1252 → utf-8 mal convertido)
MOJIBAKE_FIX = {
    "�": "Ñ",  # caso por defecto (mayúsculas)
}
# Reemplazos específicos más comunes
SPECIFIC_FIXES = [
    ("NARI�O", "NARIÑO"),
    ("C�RDOBA", "CÓRDOBA"),
    ("QUIND�O", "QUINDÍO"),
    ("BELTR�N", "BELTRÁN"),
    ("JOS�", "JOSÉ"),
    ("MAR�A", "MARÍA"),
    ("ANDR�S", "ANDRÉS"),
    ("RAM�REZ", "RAMÍREZ"),
    ("MART�NEZ", "MARTÍNEZ"),
    ("L�PEZ", "LÓPEZ"),
    ("P�REZ", "PÉREZ"),
    ("GONZ�LEZ", "GONZÁLEZ"),
]


def fix_encoding(s):
    if not isinstance(s, str):
        return s
    for bad, good in SPECIFIC_FIXES:
        s = s.replace(bad, good)
    return s


def normalize_str(s):
    if not isinstance(s, str):
        return s
    s = fix_encoding(s)
    s = unicodedata.normalize("NFC", s)
    return s.strip()


def hash_id(*parts, length=10):
    s = "|".join(str(p) for p in parts)
    return hashlib.md5(s.encode("utf-8")).hexdigest()[:length]


# ── Pipeline ────────────────────────────────────────────────────────────────
def main():
    print(f"[1/6] Cargando {SRC.name} …")
    df = pd.read_excel(SRC, sheet_name="Data_Consolidada_Regional")
    print(f"      filas iniciales: {len(df):,}")

    print("[2/6] Limpieza básica …")
    # Normalizar strings
    str_cols = ["REGIONAL", "PLACA", "CLIENTE", "TIPO DE RECAUDO",
                "DIRECCION", "BARRIO", "MUNICIPIO", "DEPARTAMENTO", "RIESGO"]
    for c in str_cols:
        df[c] = df[c].map(normalize_str)

    # Fechas
    df["FECHA"] = pd.to_datetime(df["FECHA"], errors="coerce")
    n_invalid_dates = df["FECHA"].isna().sum()
    df = df[df["FECHA"].notna()].copy()
    print(f"      fechas inválidas descartadas: {n_invalid_dates}")

    # Dedupe
    n_before = len(df)
    df = df.drop_duplicates(
        subset=["FECHA", "PLACA", "CLIENTE", "VALOR LIMPIO", "MUNICIPIO"],
        keep="first",
    )
    print(f"      duplicados removidos: {n_before - len(df):,}")

    print("[3/6] Mapeos …")
    # region_pais: prioridad REGIONAL operativa → fallback DEPARTAMENTO
    df["region_pais"] = df["REGIONAL"].map(REGIONAL_OPERATIVA_TO_PAIS)
    fallback = df["region_pais"].isna()
    df.loc[fallback, "region_pais"] = (
        df.loc[fallback, "DEPARTAMENTO"].map(DEPTO_TO_PAIS)
    )
    df["region_pais"] = df["region_pais"].fillna("Otros")

    # tipo_recaudo bucket
    df["tipo_recaudo_bucket"] = (
        df["TIPO DE RECAUDO"].map(TIPO_RECAUDO_BUCKET).fillna("Otros")
    )

    # Riesgo normalizado
    df["riesgo_norm"] = df["RIESGO"].map({
        "SIN RIESGO": "Sin riesgo",
        "EN RIESGO": "En riesgo",
        "0": "Sin clasificar",
    }).fillna("Sin clasificar")

    # Mes
    df["mes"] = df["FECHA"].dt.strftime("%Y-%m")

    # IDs derivados
    df["servicio_id"] = df.apply(
        lambda r: hash_id(r["FECHA"], r["PLACA"], r["CLIENTE"], r["VALOR LIMPIO"]),
        axis=1,
    )
    df["cliente_id"] = df["CLIENTE"].apply(lambda x: hash_id(x, length=8))

    print("[4/6] Generando data/db_real_clean_v1.csv …")
    out = df[[
        "servicio_id", "cliente_id", "CLIENTE", "FECHA", "mes",
        "REGIONAL", "region_pais", "DEPARTAMENTO", "MUNICIPIO", "BARRIO",
        "PLACA", "VALOR LIMPIO", "TIPO DE RECAUDO", "tipo_recaudo_bucket",
        "RIESGO", "riesgo_norm",
    ]].rename(columns={
        "CLIENTE": "cliente_nombre",
        "FECHA": "fecha_servicio",
        "REGIONAL": "regional_operativa",
        "DEPARTAMENTO": "departamento",
        "MUNICIPIO": "municipio",
        "BARRIO": "barrio",
        "PLACA": "vh_id",
        "VALOR LIMPIO": "valor_recaudo",
        "TIPO DE RECAUDO": "tipo_recaudo_raw",
    })
    out.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"      escrito: {OUT_CSV.relative_to(ROOT)} ({len(out):,} filas)")

    print("[5/6] Calculando agregaciones para slides …")
    aggs = compute_aggregations(out)

    print("[6/6] Generando data/db_real_aggregations_v1.json …")
    OUT_JSON.write_text(json.dumps(aggs, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"      escrito: {OUT_JSON.relative_to(ROOT)}")
    print()
    print("=== RESUMEN ===")
    k = aggs["kpis_pais"]
    print(f"  Servicios totales : {k['servicios_totales']:,}")
    print(f"  Recaudo total     : ${k['recaudo_total']:,} COP  (${k['recaudo_total_M']:,.0f}M)")
    print(f"  Clientes activos  : {k['clientes_activos']:,}")
    print(f"  Vehículos activos : {k['vh_activos']:,}")
    print(f"  Cobertura         : {k['rango_temporal']}")
    print(f"  Regiones          : {len(aggs['por_region'])} (incluye 'Otros' si aplica)")


def compute_aggregations(df):
    """Compute all aggregations needed for slides G2..G7 + popups."""
    df = df.copy()
    df["valor_M"] = df["valor_recaudo"] / 1e6  # millones COP

    # ── KPIs país (G2) ──
    kpis_pais = {
        "servicios_totales": int(len(df)),
        "recaudo_total": int(df["valor_recaudo"].sum()),
        "recaudo_total_M": round(float(df["valor_M"].sum()), 1),
        "clientes_activos": int(df["cliente_id"].nunique()),
        "vh_activos": int(df["vh_id"].nunique()),
        "rango_temporal": f"{df['mes'].min()} a {df['mes'].max()}",
        "meses_unicos": sorted(df["mes"].unique().tolist()),
    }

    # ── Top 10 clientes (G3) ──
    top10 = (
        df.groupby(["cliente_id", "cliente_nombre"])
        .agg(
            servicios=("servicio_id", "count"),
            recaudo=("valor_recaudo", "sum"),
            vh_activos=("vh_id", "nunique"),
            region_principal=("region_pais", lambda x: x.value_counts().index[0]),
        )
        .reset_index()
        .sort_values("recaudo", ascending=False)
        .head(10)
    )
    top10["recaudo_M"] = (top10["recaudo"] / 1e6).round(1)
    top10["por_vh_M"] = (top10["recaudo"] / top10["vh_activos"] / 1e6).round(1)
    top10_records = top10[[
        "cliente_nombre", "region_principal", "servicios",
        "recaudo_M", "por_vh_M", "vh_activos",
    ]].to_dict(orient="records")

    # ── Tendencia mensual región × mes (G4) ──
    pivot = (
        df.groupby(["region_pais", "mes"])["valor_M"]
        .sum().round(0).astype(int).unstack("mes", fill_value=0)
    )
    region_order = ["Antioquia", "Bogotá-Sabana", "Valle del Cauca",
                    "Costa Atlántica", "Eje Cafetero", "Santanderes", "Otros"]
    pivot = pivot.reindex([r for r in region_order if r in pivot.index])
    pivot["TOTAL"] = pivot.sum(axis=1)
    tendencia_mensual = {
        "meses": pivot.columns.tolist()[:-1],  # sin TOTAL
        "regiones": [
            {
                "region": r,
                "valores_M": pivot.loc[r, pivot.columns[:-1]].tolist(),
                "total_M": int(pivot.loc[r, "TOTAL"]),
            }
            for r in pivot.index
        ],
        "total_pais_por_mes_M": pivot[pivot.columns[:-1]].sum(axis=0).astype(int).tolist(),
    }

    # ── Efectividad / % sin riesgo por región (G5 proxy) ──
    riesgo_pivot = (
        df.groupby(["region_pais", "riesgo_norm"]).size()
        .unstack("riesgo_norm", fill_value=0)
    )
    riesgo_pivot["total"] = riesgo_pivot.sum(axis=1)
    riesgo_pivot["pct_sin_riesgo"] = (
        riesgo_pivot.get("Sin riesgo", 0) / riesgo_pivot["total"] * 100
    ).round(1)
    efectividad = []
    for region in pivot.index:
        if region not in riesgo_pivot.index:
            continue
        row = riesgo_pivot.loc[region]
        efectividad.append({
            "region": region,
            "pct_sin_riesgo": float(row["pct_sin_riesgo"]),
            "sin_riesgo": int(row.get("Sin riesgo", 0)),
            "en_riesgo": int(row.get("En riesgo", 0)),
            "sin_clasificar": int(row.get("Sin clasificar", 0)),
            "total": int(row["total"]),
        })

    # ── Detalle top 5 clientes × mes × VH (G6) ──
    top5_ids = top10["cliente_id"].head(5).tolist()
    detalle_top5 = []
    for cid in top5_ids:
        sub = df[df["cliente_id"] == cid]
        nombre = sub["cliente_nombre"].iloc[0]
        meses = sorted(sub["mes"].unique().tolist())
        por_mes = []
        for m in kpis_pais["meses_unicos"]:
            ms = sub[sub["mes"] == m]
            n_vh = ms["vh_id"].nunique()
            total_M = round(float(ms["valor_recaudo"].sum() / 1e6), 1)
            por_vh_M = round(total_M / n_vh, 2) if n_vh > 0 else 0.0
            por_mes.append({
                "mes": m,
                "total_M": total_M,
                "por_vh_M": por_vh_M,
                "vh": int(n_vh),
            })
        detalle_top5.append({"cliente_nombre": nombre, "por_mes": por_mes})

    # ── Por región: KPIs + top 3 clientes (G7 popups) ──
    por_region = []
    for region in pivot.index:
        sub = df[df["region_pais"] == region]
        ef = next((e for e in efectividad if e["region"] == region), None)
        top3 = (
            sub.groupby(["cliente_id", "cliente_nombre"])["valor_recaudo"]
            .sum().nlargest(3).reset_index()
        )
        por_region.append({
            "region": region,
            "servicios": int(len(sub)),
            "recaudo_M": round(float(sub["valor_recaudo"].sum() / 1e6), 1),
            "clientes": int(sub["cliente_id"].nunique()),
            "vh": int(sub["vh_id"].nunique()),
            "pct_sin_riesgo": ef["pct_sin_riesgo"] if ef else None,
            "top3_clientes": [
                {"name": r["cliente_nombre"], "recaudo_M": round(r["valor_recaudo"] / 1e6, 1)}
                for _, r in top3.iterrows()
            ],
        })

    # ── Concentración por región (para G2) ──
    concentr = []
    total_M = kpis_pais["recaudo_total_M"]
    for r in por_region:
        concentr.append({
            "region": r["region"],
            "recaudo_M": r["recaudo_M"],
            "pct": round(r["recaudo_M"] / total_M * 100, 1) if total_M else 0,
        })
    concentr.sort(key=lambda x: x["recaudo_M"], reverse=True)

    # ── Mes max/min/promedio (para G2) ──
    by_month = df.groupby("mes")["valor_recaudo"].sum() / 1e6
    mes_max = by_month.idxmax()
    mes_min = by_month.idxmin()
    kpis_pais["mes_max"] = {"mes": mes_max, "valor_M": round(float(by_month.max()), 0)}
    kpis_pais["mes_min"] = {"mes": mes_min, "valor_M": round(float(by_month.min()), 0)}
    kpis_pais["promedio_mensual_M"] = round(float(by_month.mean()), 0)

    return {
        "kpis_pais": kpis_pais,
        "top10_clientes": top10_records,
        "tendencia_mensual": tendencia_mensual,
        "efectividad": efectividad,
        "detalle_top5": detalle_top5,
        "por_region": por_region,
        "concentracion": concentr,
    }


if __name__ == "__main__":
    main()
