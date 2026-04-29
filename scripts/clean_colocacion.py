"""
clean_colocacion.py — Lee COLOCACION_NACIONAL.xlsx + RECAUDO_NACIONAL_LIMPIO.xlsx
y emite las agregaciones que alimentan los slides de Colocación (slide-2..6) y
el KPI nuevo "Promedio recaudo por placa" (sección Medellín).

Genera por consola (no escribe archivos a menos que se pase --dump-json):
  - Tabla efectividad por ZONA (regional)
  - Tabla efectividad por MES (nacional)
  - Totales nacionales: solicitudes, posicionamiento, efectividad %
  - Promedio recaudo por placa (nacional + por regional)
  - Foco MEDELLIN: servicios, placas únicas, recaudo total, $/placa, $/placa/mes

Decisiones (sesión 2026-04-28):
  - Cobertura 4 meses ene-abr 2026 (alineado con clean_db_real.py)
  - "Efectividad" = SOLICITUD bruto vs POSICIONAMIENTO; pueden existir
    valores >100% en regionales por overflow operativo (Funza 100,9%).
  - Para placas se usa la base ya limpia RECAUDO_NACIONAL_LIMPIO.xlsx,
    misma fuente y dedupe que en clean_db_real.py.

Uso:
  python scripts/clean_colocacion.py
  python scripts/clean_colocacion.py --dump-json data/colocacion_aggregations_v1.json
"""
import argparse
import json
from pathlib import Path

import pandas as pd

# ── Rutas ───────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
SRC_COLOC = ROOT / "data" / "db_real" / "COLOCACION_NACIONAL.xlsx"
SRC_RECAUDO = ROOT / "data" / "db_real" / "RECAUDO_NACIONAL_LIMPIO.xlsx"

REGIONAL_ORDER = ["FUNZA", "MEDELLIN", "COSTA", "EJE CAFETERO", "CALI"]
MES_ORDER = ["ENERO", "FEBRERO", "MARZO", "ABRIL"]


# ── Helpers ─────────────────────────────────────────────────────────────────
def fmt_pct(x):
    return f"{x:.1f}%" if pd.notna(x) else "—"


def fmt_money(x):
    return f"${x:,.0f}"


def fmt_money_M(x):
    return f"${x / 1e6:,.1f} MM"


# ── Pipeline colocación ─────────────────────────────────────────────────────
def load_colocacion():
    print(f"[1/4] Cargando {SRC_COLOC.name} …")
    df = pd.read_excel(
        SRC_COLOC,
        sheet_name="Hoja1",
        usecols="A:F",
    )
    df.columns = [c.strip().upper() for c in df.columns]
    # Filtrar filas con FECHA y ZONA no nulos
    df = df[df["FECHA"].notna() & df["ZONA"].notna()].copy()
    df["ZONA"] = df["ZONA"].astype(str).str.strip().str.upper()
    if "MES" in df.columns:
        df["MES"] = df["MES"].astype(str).str.strip().str.upper()
    df["SOLICITUD"] = pd.to_numeric(df["SOLICITUD"], errors="coerce").fillna(0)
    df["POSICIONAMIENTO"] = pd.to_numeric(
        df["POSICIONAMIENTO"], errors="coerce"
    ).fillna(0)
    print(f"      filas válidas: {len(df):,}")
    return df


def aggregate_colocacion(df):
    print("[2/4] Agregando colocación por ZONA y por MES …")

    # Por zona
    by_zona = (
        df.groupby("ZONA")
        .agg(solicitud=("SOLICITUD", "sum"),
             posicionamiento=("POSICIONAMIENTO", "sum"))
        .reset_index()
    )
    by_zona["efectividad_pct"] = (
        by_zona["posicionamiento"] / by_zona["solicitud"] * 100
    ).round(1)
    by_zona = by_zona.sort_values("solicitud", ascending=False)

    # Por mes (nacional)
    by_mes = (
        df.groupby("MES")
        .agg(solicitud=("SOLICITUD", "sum"),
             posicionamiento=("POSICIONAMIENTO", "sum"))
        .reset_index()
    )
    by_mes["efectividad_pct"] = (
        by_mes["posicionamiento"] / by_mes["solicitud"] * 100
    ).round(1)
    # Reordenar siguiendo MES_ORDER
    by_mes["__order"] = by_mes["MES"].map(
        {m: i for i, m in enumerate(MES_ORDER)}
    ).fillna(99)
    by_mes = by_mes.sort_values("__order").drop(columns="__order")

    # Totales nacionales
    total_sol = int(df["SOLICITUD"].sum())
    total_pos = int(df["POSICIONAMIENTO"].sum())
    total_ef = round(total_pos / total_sol * 100, 1) if total_sol else 0.0

    print()
    print("=== EFECTIVIDAD POR REGIONAL (ZONA) ===")
    print(f"{'Regional':<16}{'Sol':>8}{'Pos':>8}{'Efect':>10}")
    for _, r in by_zona.iterrows():
        print(
            f"{r['ZONA']:<16}{int(r['solicitud']):>8,}"
            f"{int(r['posicionamiento']):>8,}{fmt_pct(r['efectividad_pct']):>10}"
        )

    print()
    print("=== EFECTIVIDAD POR MES (NACIONAL) ===")
    print(f"{'Mes':<10}{'Sol':>8}{'Pos':>8}{'Efect':>10}")
    for _, r in by_mes.iterrows():
        print(
            f"{r['MES']:<10}{int(r['solicitud']):>8,}"
            f"{int(r['posicionamiento']):>8,}{fmt_pct(r['efectividad_pct']):>10}"
        )

    print()
    print("=== TOTAL NACIONAL ===")
    print(f"  Solicitudes      : {total_sol:,}")
    print(f"  Posicionamientos : {total_pos:,}")
    print(f"  Efectividad      : {fmt_pct(total_ef)}")
    print(f"  Brecha vs 95%    : {total_ef - 95:.1f} pp")

    return {
        "by_zona": by_zona.to_dict(orient="records"),
        "by_mes": by_mes.to_dict(orient="records"),
        "totales": {
            "solicitud": total_sol,
            "posicionamiento": total_pos,
            "efectividad_pct": total_ef,
        },
    }


# ── Pipeline placas / recaudo ───────────────────────────────────────────────
def load_recaudo():
    print()
    print(f"[3/4] Cargando {SRC_RECAUDO.name} …")
    # Aceptamos cualquier hoja con las columnas esperadas; usamos la misma que
    # clean_db_real.py
    df = pd.read_excel(SRC_RECAUDO, sheet_name="Data_Consolidada_Regional")
    df["REGIONAL"] = df["REGIONAL"].astype(str).str.strip().str.upper()
    df["PLACA"] = df["PLACA"].astype(str).str.strip().str.upper()
    df["FECHA"] = pd.to_datetime(df["FECHA"], errors="coerce")
    df = df[df["FECHA"].notna()].copy()
    print(f"      filas válidas: {len(df):,}")
    return df


def aggregate_recaudo(df):
    print("[4/4] Calculando promedio recaudo por placa (nacional + regional) …")

    # Nacional
    placas_nac = df["PLACA"].nunique()
    recaudo_nac = float(df["VALOR LIMPIO"].sum())
    prom_placa_nac = recaudo_nac / placas_nac if placas_nac else 0
    n_meses = df["FECHA"].dt.to_period("M").nunique() or 1

    # Por regional
    by_reg = (
        df.groupby("REGIONAL")
        .agg(
            servicios=("FECHA", "count"),
            placas=("PLACA", "nunique"),
            recaudo=("VALOR LIMPIO", "sum"),
        )
        .reset_index()
    )
    by_reg["recaudo_por_placa"] = (by_reg["recaudo"] / by_reg["placas"]).round(0)
    by_reg["recaudo_por_placa_mes"] = (
        by_reg["recaudo_por_placa"] / n_meses
    ).round(0)
    by_reg = by_reg.sort_values("recaudo", ascending=False)

    print()
    print("=== RECAUDO POR PLACA · POR REGIONAL ===")
    print(f"{'Regional':<16}{'Serv':>8}{'Placas':>8}{'Recaudo':>18}{'$/placa':>18}")
    for _, r in by_reg.iterrows():
        print(
            f"{r['REGIONAL']:<16}{int(r['servicios']):>8,}"
            f"{int(r['placas']):>8,}{fmt_money_M(r['recaudo']):>18}"
            f"{fmt_money_M(r['recaudo_por_placa']):>18}"
        )

    print()
    print("=== TOTAL NACIONAL ===")
    print(f"  Servicios                : {len(df):,}")
    print(f"  Placas únicas            : {placas_nac:,}")
    print(f"  Recaudo total            : {fmt_money(recaudo_nac)}")
    print(f"  Promedio recaudo/placa   : {fmt_money(prom_placa_nac)} ({fmt_money_M(prom_placa_nac)})")
    print(f"  Cobertura                : {n_meses} meses")

    # Foco Medellín
    sub = df[df["REGIONAL"] == "MEDELLIN"]
    if not sub.empty:
        placas_mde = sub["PLACA"].nunique()
        recaudo_mde = float(sub["VALOR LIMPIO"].sum())
        prom_placa_mde = recaudo_mde / placas_mde if placas_mde else 0
        prom_placa_mde_mes = prom_placa_mde / n_meses
        print()
        print("=== FOCO · MEDELLIN ===")
        print(f"  Servicios                : {len(sub):,}")
        print(f"  Placas únicas            : {placas_mde:,}")
        print(f"  Recaudo total            : {fmt_money(recaudo_mde)}")
        print(f"  Promedio recaudo/placa   : {fmt_money(prom_placa_mde)} ({fmt_money_M(prom_placa_mde)})")
        print(f"  Promedio recaudo/placa/mes: {fmt_money(prom_placa_mde_mes)}")

    return {
        "nacional": {
            "servicios": int(len(df)),
            "placas_unicas": int(placas_nac),
            "recaudo_total": int(recaudo_nac),
            "prom_recaudo_por_placa": int(prom_placa_nac),
            "meses_cobertura": int(n_meses),
        },
        "por_regional": by_reg.assign(
            recaudo=lambda d: d["recaudo"].astype(int),
            recaudo_por_placa=lambda d: d["recaudo_por_placa"].astype(int),
            recaudo_por_placa_mes=lambda d: d["recaudo_por_placa_mes"].astype(int),
        ).to_dict(orient="records"),
    }


# ── Entrypoint ──────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dump-json",
        type=Path,
        default=None,
        help="Si se especifica, escribe agregaciones a este path JSON.",
    )
    args = parser.parse_args()

    df_coloc = load_colocacion()
    coloc_agg = aggregate_colocacion(df_coloc)

    df_recaudo = load_recaudo()
    recaudo_agg = aggregate_recaudo(df_recaudo)

    if args.dump_json:
        out = {"colocacion": coloc_agg, "recaudo_por_placa": recaudo_agg}
        args.dump_json.parent.mkdir(parents=True, exist_ok=True)
        args.dump_json.write_text(
            json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print()
        print(f"[OK] JSON escrito en {args.dump_json}")


if __name__ == "__main__":
    main()
