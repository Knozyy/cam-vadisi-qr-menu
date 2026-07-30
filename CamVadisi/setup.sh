#!/usr/bin/env bash
# Initial Ubuntu/Debian deployment for Cam Vadisi.
# Usage: sudo DOMAIN=camvadisi.example bash setup.sh
set -Eeuo pipefail
umask 027

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null || dirname "$SCRIPT_DIR")"
PANEL_SOURCE="${PANEL_SOURCE:-$SOURCE_ROOT/CamVadisiAdmin}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/var/www/cam-vadisi}"
APP_USER="${APP_USER:-camvadisi}"
APP_GROUP="${APP_GROUP:-$APP_USER}"
DOMAIN="${DOMAIN:-}"

MENU_TARGET="$DEPLOY_ROOT/menu"
PANEL_TARGET="$DEPLOY_ROOT/panel"
DATA_DIR="$DEPLOY_ROOT/data"
UPLOAD_DIR="$DATA_DIR/uploads"
BACKUP_DIR="$DEPLOY_ROOT/backups"
ENV_FILE="$SCRIPT_DIR/.env.production"
SERVICE_FILE="/etc/systemd/system/cam-vadisi.service"
NGINX_FILE="/etc/nginx/sites-available/cam-vadisi"

fail() {
  printf 'HATA: %s\n' "$*" >&2
  exit 1
}

[[ "$EUID" -eq 0 ]] || fail "Bu betigi sudo ile calistirin."
[[ "$DEPLOY_ROOT" = /* && "$DEPLOY_ROOT" != "/" ]] || fail "DEPLOY_ROOT guvenli bir mutlak yol olmali."
[[ -n "$DOMAIN" && "$DOMAIN" != *"://"* && "$DOMAIN" != *"/"* && "$DOMAIN" != *" "* ]] ||
  fail "DOMAIN gerekli. Ornek: sudo DOMAIN=camvadisi.com bash setup.sh"
[[ -f "$SCRIPT_DIR/package.json" && -f "$SCRIPT_DIR/server/index.js" ]] ||
  fail "Betik CamVadisi proje kokunden calismali."

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates certbot curl gnupg nginx openssl python3-certbot-nginx rsync sqlite3

NODE_MAJOR=0
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
fi

if (( NODE_MAJOR < 20 )); then
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key |
    gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
  printf '%s\n' \
    "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update
  apt-get install -y nodejs
fi

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
(( NODE_MAJOR >= 20 )) || fail "Node.js 20 veya ustu kurulamadı."

if ! getent group "$APP_GROUP" >/dev/null; then
  groupadd --system "$APP_GROUP"
fi
if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd --system --gid "$APP_GROUP" --home-dir "$DEPLOY_ROOT" --shell /usr/sbin/nologin "$APP_USER"
fi

install -d -o "$APP_USER" -g "$APP_GROUP" -m 0750 \
  "$MENU_TARGET" "$PANEL_TARGET" "$DATA_DIR" "$UPLOAD_DIR" "$BACKUP_DIR"

GENERATED_PASSWORD=""
if [[ ! -f "$ENV_FILE" ]]; then
  ADMIN_PASSWORD_VALUE="${ADMIN_PASSWORD:-}"
  if [[ -z "$ADMIN_PASSWORD_VALUE" ]]; then
    ADMIN_PASSWORD_VALUE="$(node -e "console.log(require('crypto').randomBytes(18).toString('base64url'))")"
    GENERATED_PASSWORD="$ADMIN_PASSWORD_VALUE"
  fi
  JWT_SECRET_VALUE="${JWT_SECRET:-$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")}"

  {
    printf 'NODE_ENV=production\n'
    printf 'PORT=3001\n'
    printf 'ADMIN_PASSWORD=%s\n' "$ADMIN_PASSWORD_VALUE"
    printf 'JWT_SECRET=%s\n' "$JWT_SECRET_VALUE"
    printf 'DB_PATH=%s/data.db\n' "$DATA_DIR"
    printf 'UPLOAD_DIR=%s\n' "$UPLOAD_DIR"
    printf 'SNAPSHOT_PATH=%s/menu-snapshot.json\n' "$DATA_DIR"
    printf 'PANEL_DIR=%s\n' "$PANEL_TARGET"
  } > "$ENV_FILE"
fi
chown root:"$APP_GROUP" "$ENV_FILE"
chmod 0640 "$ENV_FILE"

if ! grep -q '^SNAPSHOT_PATH=' "$ENV_FILE"; then
  printf 'SNAPSHOT_PATH=%s/menu-snapshot.json\n' "$DATA_DIR" >> "$ENV_FILE"
fi

npm --prefix "$SCRIPT_DIR" ci
npm --prefix "$SCRIPT_DIR" test
npm --prefix "$SCRIPT_DIR" run build
rsync -a --delete "$SCRIPT_DIR/dist/" "$MENU_TARGET/"

if [[ -f "$PANEL_SOURCE/package.json" ]]; then
  npm --prefix "$PANEL_SOURCE" ci
  npm --prefix "$PANEL_SOURCE" run build
  rsync -a --delete "$PANEL_SOURCE/dist/" "$PANEL_TARGET/"
else
  printf 'UYARI: Panel kaynagi bulunamadi: %s\n' "$PANEL_SOURCE" >&2
fi

if [[ -d "$SCRIPT_DIR/server/uploads" ]]; then
  rsync -a --ignore-existing "$SCRIPT_DIR/server/uploads/" "$UPLOAD_DIR/"
fi
chown -R "$APP_USER":"$APP_GROUP" "$DATA_DIR" "$BACKUP_DIR"

DB_PATH_VALUE="$(sed -n 's/^DB_PATH=//p' "$ENV_FILE" | head -n 1 | tr -d '\r')"
DB_PATH_VALUE="${DB_PATH_VALUE:-$DATA_DIR/data.db}"
if [[ ! -s "$DB_PATH_VALUE" ]]; then
  (
    cd "$SCRIPT_DIR"
    runuser -u "$APP_USER" -- env \
      NODE_ENV=production \
      DB_PATH="$DB_PATH_VALUE" \
      UPLOAD_DIR="$UPLOAD_DIR" \
      SNAPSHOT_PATH="$DATA_DIR/menu-snapshot.json" \
      node server/seed.js
  )
fi

NODE_BIN="$(command -v node)"
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Cam Vadisi menu API
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_GROUP
WorkingDirectory=$SCRIPT_DIR
ExecStart=$NODE_BIN server/index.js
Restart=on-failure
RestartSec=3
Environment=NODE_ENV=production
EnvironmentFile=$ENV_FILE
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ReadWritePaths=$DATA_DIR

[Install]
WantedBy=multi-user.target
EOF

SERVER_NAMES="$DOMAIN"
if [[ "$DOMAIN" != "_" && ! "$DOMAIN" =~ ^[0-9.]+$ && ! "$DOMAIN" =~ ^\[.*\]$ ]]; then
  SERVER_NAMES="$DOMAIN www.$DOMAIN"
fi
sed \
  -e "s|DOMAIN_BURAYA www.DOMAIN_BURAYA|$SERVER_NAMES|g" \
  -e "s|/var/www/cam-vadisi|$DEPLOY_ROOT|g" \
  "$SCRIPT_DIR/deploy/nginx.conf.example" > "$NGINX_FILE"
ln -sfn "$NGINX_FILE" /etc/nginx/sites-enabled/cam-vadisi

systemctl daemon-reload
systemctl enable --now cam-vadisi
nginx -t
systemctl reload nginx

for _ in {1..15}; do
  if curl -fsS http://127.0.0.1:3001/api/menu >/dev/null; then
    break
  fi
  sleep 1
done
curl -fsS http://127.0.0.1:3001/api/menu >/dev/null ||
  fail "Servis basladi ancak saglik kontrolu basarisiz. journalctl -u cam-vadisi komutuna bakin."

printf '\nKurulum tamamlandi: http://%s\n' "$DOMAIN"
if [[ -n "$GENERATED_PASSWORD" ]]; then
  printf 'Yonetici sifresi (simdi kaydedin): %s\n' "$GENERATED_PASSWORD"
fi
if [[ "$DOMAIN" != "_" && ! "$DOMAIN" =~ ^[0-9.]+$ && ! "$DOMAIN" =~ ^\[.*\]$ ]]; then
  printf 'HTTPS icin: sudo certbot --nginx -d %s -d www.%s\n' "$DOMAIN" "$DOMAIN"
fi
