"""
push.py - Genera commit y push a origin/main desde CMD.

Uso:
  python push.py                          -> commit con timestamp automatico
  python push.py "Mensaje del commit"     -> commit con mensaje custom
"""
import subprocess, sys, datetime, os

# ── Directorio del proyecto ──────────────────────────────────────────────────
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Mensaje de commit ────────────────────────────────────────────────────────
if len(sys.argv) > 1:
    msg = " ".join(sys.argv[1:])
else:
    msg = f"Update {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"

print(f"\n{'='*50}")
print(f"  Proyecto : {PROJECT_DIR}")
print(f"  Mensaje  : {msg}")
print(f"{'='*50}\n")

def run(cmd, label):
    print(f">> {label}...")
    result = subprocess.run(cmd, cwd=PROJECT_DIR, capture_output=True, text=True)
    if result.stdout.strip():
        print(result.stdout.strip())
    if result.returncode != 0:
        print(f"\nERROR en '{' '.join(cmd)}':\n{result.stderr.strip()}")
        sys.exit(result.returncode)
    return result

# ── Pasos ────────────────────────────────────────────────────────────────────
run(["git", "add", "-A"],                        "Staging todos los cambios")
run(["git", "commit", "-m", msg],               "Creando commit")
run(["git", "push", "origin", "main"],          "Push a origin/main")

print("\nListo! Push completado.\n")
