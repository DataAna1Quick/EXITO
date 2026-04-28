"""
push.py - Genera commit y push a la rama actual desde CMD.

Uso:
  python scripts/push.py                          -> commit con timestamp automatico
  python scripts/push.py "Mensaje del commit"     -> commit con mensaje custom

Comportamiento:
  - Detecta la rama actual y empuja a origin/<rama-actual> (no hardcodea main).
  - Si no hay cambios para commitear, hace push igual (por si hay commits
    locales sin pushear) y avisa.
  - Si la rama no tiene upstream configurado, lo crea con -u en el primer push.
"""
import subprocess, sys, datetime, os

# ── Directorio del proyecto (raiz, no scripts/) ──────────────────────────────
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── Mensaje de commit ────────────────────────────────────────────────────────
if len(sys.argv) > 1:
    msg = " ".join(sys.argv[1:])
else:
    msg = f"Update {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"


def run(cmd, label, check=True):
    print(f">> {label}...")
    result = subprocess.run(cmd, cwd=PROJECT_DIR, capture_output=True, text=True)
    if result.stdout.strip():
        print(result.stdout.strip())
    if result.returncode != 0 and check:
        print(f"\nERROR en '{' '.join(cmd)}':\n{result.stderr.strip()}")
        sys.exit(result.returncode)
    return result


# ── Detectar rama actual ─────────────────────────────────────────────────────
branch_result = subprocess.run(
    ["git", "branch", "--show-current"],
    cwd=PROJECT_DIR, capture_output=True, text=True,
)
branch = branch_result.stdout.strip()
if not branch:
    print("ERROR: no se pudo detectar la rama actual (HEAD detached?).")
    sys.exit(1)

print(f"\n{'='*50}")
print(f"  Proyecto : {PROJECT_DIR}")
print(f"  Rama     : {branch}")
print(f"  Mensaje  : {msg}")
print(f"{'='*50}\n")

# ── Stage ────────────────────────────────────────────────────────────────────
run(["git", "add", "-A"], "Staging todos los cambios")

# ── Commit (saltar si no hay cambios) ────────────────────────────────────────
status = subprocess.run(
    ["git", "status", "--porcelain"],
    cwd=PROJECT_DIR, capture_output=True, text=True,
).stdout.strip()

if status:
    run(["git", "commit", "-m", msg], "Creando commit")
else:
    print(">> Nada para commitear (working tree limpio); paso al push.\n")

# ── Push (con -u si no hay upstream) ─────────────────────────────────────────
upstream = subprocess.run(
    ["git", "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
    cwd=PROJECT_DIR, capture_output=True, text=True,
)
if upstream.returncode == 0:
    run(["git", "push", "origin", branch], f"Push a origin/{branch}")
else:
    run(["git", "push", "-u", "origin", branch],
        f"Push inicial (set-upstream) a origin/{branch}")

print(f"\nListo! Push completado a origin/{branch}.\n")
