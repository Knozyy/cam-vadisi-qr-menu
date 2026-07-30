#!/usr/bin/env bash
# Safe production update for Cam Vadisi.
# Usage: sudo bash update.sh
# Set SKIP_PULL=1 when the source was updated by another deployment tool.
set -Eeuo pipefail
umask 027

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null)" ||
  { printf 'HATA: Git deposu bulunamadi.\n' >&2; exit 1; }
PANEL_SOURCE="${PANEL_SOURCE:-$SOURCE_ROOT/CamVadisiAdmin}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/var/www/cam-vadisi}"
APP_USER="${APP_USER:-camvadisi}"
APP_GROUP="${APP_GROUP:-$APP_USER}"
BRANCH="${BRANCH:-$(git -C "$SOURCE_ROOT" branch --show-current)}"
SKIP_PULL="${SKIP_PULL:-0}"

MENU_TARGET="$DEPLOY_ROOT/menu"
PANEL_TARGET="$DEPLOY_ROOT/panel"
DATA_DIR="$DEPLOY_ROOT/data"
BACKUP_DIR="$DEPLOY_ROOT/backups"
ENV_FILE="$SCRIPT_DIR/.env.production"

fail() {
  printf 'HATA: %s\n' "$*" >&2
  exit 1
}

read_env() {
  local key="$1"
  local fallback="$2"
  local value=""
  if [[ -f "$ENV_FILE" ]]; then
    value="$(sed -n "s/^${key}=//p" "$ENV_FILE" | head -n 1 | tr -d '\r')"
  fi
  printf '%s' "${value:-$fallback}"
}

[[ "$EUID" -eq 0 ]] || fail "Bu betigi sudo ile calistirin."
[[ "$DEPLOY_ROOT" = /* && "$DEPLOY_ROOT" != "/" ]] || fail "DEPLOY_ROOT guvenli bir mutlak yol olmali."
[[ -f "$ENV_FILE" ]] || fail "Once setup.sh calistirilmali: $ENV_FILE bulunamadi."
[[ -n "$BRANCH" || "$SKIP_PULL" = "1" ]] ||
  fail "Detached HEAD durumunda BRANCH degiskenini belirtin."

install -d -m 0750 "$MENU_TARGET" "$PANEL_TARGET" "$BACKUP_DIR"
exec 9>"$DEPLOY_ROOT/.update.lock"
flock -n 9 || fail "Baska bir guncelleme halen calisiyor."

if [[ "$SKIP_PULL" != "1" ]]; then
  if [[ -n "$(git -C "$SOURCE_ROOT" status --porcelain --untracked-files=no)" ]]; then
    fail "Git calisma agaci degisik. Degisiklikleri commit edin veya SKIP_PULL=1 kullanin."
  fi
fi

STAMP="$(date +%Y-%m-%d-%H%M%S)"
DB_PATH_VALUE="$(read_env DB_PATH "$DATA_DIR/data.db")"
UPLOAD_DIR_VALUE="$(read_env UPLOAD_DIR "$DATA_DIR/uploads")"
PORT_VALUE="$(read_env PORT 3001)"

if [[ -s "$DB_PATH_VALUE" ]]; then
  sqlite3 "$DB_PATH_VALUE" ".backup '$BACKUP_DIR/data-$STAMP.db'"
fi
if [[ -d "$UPLOAD_DIR_VALUE" ]]; then
  tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$UPLOAD_DIR_VALUE" .
fi
find "$BACKUP_DIR" -type f -mtime +14 -delete

if [[ "$SKIP_PULL" != "1" ]]; then
  git -C "$SOURCE_ROOT" fetch origin "$BRANCH"
  git -C "$SOURCE_ROOT" merge --ff-only "origin/$BRANCH"
fi

npm --prefix "$SCRIPT_DIR" ci
npm --prefix "$SCRIPT_DIR" test
npm --prefix "$SCRIPT_DIR" run build

if [[ -f "$PANEL_SOURCE/package.json" ]]; then
  npm --prefix "$PANEL_SOURCE" ci
  npm --prefix "$PANEL_SOURCE" run build
fi

rsync -a --delete "$SCRIPT_DIR/dist/" "$MENU_TARGET/"
if [[ -d "$PANEL_SOURCE/dist" ]]; then
  rsync -a --delete "$PANEL_SOURCE/dist/" "$PANEL_TARGET/"
fi

chown -R "$APP_USER":"$APP_GROUP" "$DATA_DIR" "$BACKUP_DIR"
systemctl restart cam-vadisi

for _ in {1..15}; do
  if curl -fsS "http://127.0.0.1:$PORT_VALUE/api/menu" >/dev/null; then
    printf 'Guncelleme tamamlandi. Yedek etiketi: %s\n' "$STAMP"
    exit 0
  fi
  sleep 1
done

journalctl -u cam-vadisi -n 30 --no-pager >&2 || true
fail "Guncelleme yapildi ancak servis saglik kontrolunu gecemedi."
