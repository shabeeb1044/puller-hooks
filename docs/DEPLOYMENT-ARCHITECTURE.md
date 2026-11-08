# PullerTackle.com – Production Deployment Architecture

**Domain:** pullertackle.com  
**VPS:** Bluehost · Ubuntu 26.04 LTS · `129.121.168.106`  
**App:** Next.js 15 (App Router) · Node.js 22 · Prisma · MySQL  
**Default database:** **Existing SQL (MySQL) on the VPS** — wire `DATABASE_URL` to it; do not invent a second DB stack  
**Data cutover:** Copy **same local host data** (MySQL `puller_hooks` + `public/uploads`) onto VPS — see `docs/STAGE-B-DATA-MIGRATE.md`  
**Website hosting:** Unchanged — Nginx → PM2 → `next start` on `127.0.0.1:3000` (no Cloudflare Workers for production)  
**Active work scope:** **Website application only** (app + app DB + uploads). **Do not edit or read mail** (Postfix/Dovecot/Roundcube/mailboxes/DNS MX) unless a later stage is explicitly approved.  
**Mail (later / out of scope for website deploy):** Postfix · Dovecot · Rspamd · Roundcube  
**Repo:** https://github.com/shabeeb1044/puller-hooks.git  

> **Security:** Never store root/SSH passwords, DB passwords, or `AUTH_SECRET` in git. Rotate any credential shared in chat before go-live.

---

## 1. Application audit (current repo)

| Area | Finding | Production impact |
|------|---------|-------------------|
| Runtime | Next.js `^15.5.4`, React 19, scripts: `build` → `prisma generate && next build`, `start` → `next start` | VPS uses **Node + PM2**, not Cloudflare Workers |
| Alternate path | OpenNext + Wrangler + Turso/`@libsql` still in repo | Leave unused on VPS; do **not** run `cf:deploy` in production |
| Database | Prisma provider **`mysql`**, migrations under `prisma/migrations/` | **Default = existing MySQL/MariaDB on VPS.** Point `DATABASE_URL` at it (`127.0.0.1`). Create DB/user only if Stage 0 finds none. Never open `3306` publicly |
| Env | `DATABASE_URL` (required MySQL URL), `AUTH_SECRET`, optional seed `ADMIN_SETUP_*` | Production `.env` on server only (mode `600`). Turso/`TURSO_*` is **not** the production default |
| Auth | JWT cookie `puller_admin_session`; login `/management-portal` | HTTPS required (`secure` cookie in production) |
| Uploads | `lib/upload.js` writes `public/uploads/` | Disk persistence required → **Node host is correct** (Workers would lose files) |
| Forms | `/api/contact`, `/api/dealers` persist to MySQL | No outbound SMTP from the app today; business mail is separate |
| Static legacy | `*.html` + Next redirects for old URLs | Keep redirects; serve app as Next only |
| Node local | Dev machine may be Node 24; target **Node 22 LTS** on VPS | Install via NodeSource or nvm |

### Public routes (smoke-test list)

- `/`, `/contact`, `/dealers`, `/our-story`
- `/products/hooks`, `/products/flash-striker`, `/products/[category]`, `/products/[category]/[subcategory]`
- Admin: `/management-portal`, `/admin/*`
- APIs: `/api/contact`, `/api/dealers`, `/api/dealer-directory`, `/api/admin/*`

---

## 2. Target architecture

```
                    Internet
                        |
        +---------------+---------------+
        |                               |
   DNS (GoDaddy)                   Clients
        |                               |
        |              +----------------+----------------+
        |              |                                 |
        v              v                                 v
   A/AAAA @, www    HTTPS :443                          SMTP :25/465/587
   MX → mail        Nginx (TLS Let's Encrypt)           IMAP :993
   mail A           |                                   |
                    | reverse proxy                     |
                    v                                   v
              127.0.0.1:3000                      Postfix + Dovecot
              PM2: puller-web                     + Rspamd
              next start                          |
                    |                             +-- Roundcube (webmail)
                    v                             +-- mailbox sales@
              Existing MySQL 127.0.0.1:3306
              DB: puller_hooks (or current name)
              ← default DATABASE_URL target
              (not public)
```

### Process isolation

| Concern | User / unit | Notes |
|---------|-------------|--------|
| Website | `puller` (deploy user) + PM2 | App under `/var/www/pullertackle` |
| Database | Existing `mysql`/`mariadb` | **Default data store.** Listen `127.0.0.1` only; reuse credentials/DB name from Stage 0 |
| Mail | `postfix`, `dovecot`, `rspamd` | Separate from Node app |
| Webmail | PHP-FPM + Nginx `mail.` vhost | Optional path `/webmail` on mail host |
| TLS | Certbot | Separate certs or SAN for `@`, `www`, `mail` |

**Website hosting stays as documented above** (Nginx + PM2 + Next). Only the DB policy is “use what’s already there.”  
Website code **never** receives inbound SMTP. Mail stack **never** serves Next.js.

---

## 3. DNS plan (GoDaddy) — **approval required before changes**

Preserve existing email-related records (MX, SPF, DKIM, DMARC, any current `mail` host).

| Host | Type | Value | Purpose |
|------|------|-------|---------|
| `@` | A | `129.121.168.106` | Apex site |
| `www` | A or CNAME | `129.121.168.106` or `@` | WWW |
| `mail` | A | `129.121.168.106` | Mail + Roundcube |
| `@` | MX | `mail.pullertackle.com` (priority 10) | Inbound mail |
| `@` | TXT | `v=spf1 mx a:mail.pullertackle.com ~all` | SPF (finalize after mail live) |
| `default._domainkey` | TXT | *(DKIM public key)* | After OpenDKIM/Rspamd DKIM |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:sales@...` | Start `p=none`, tighten later |

**Do not** point MX away from working mail until Stage C is tested.  
**Do not** apply website A-record cutover until Stage B SSL + smoke tests pass on IP or hosts-file test.

---

## 4. Server layout

```
/var/www/pullertackle/          # git clone (owned by puller)
  .env                          # secrets, chmod 600
  public/uploads/               # persistent media
  ecosystem.config.cjs          # PM2
/var/backups/pullertackle/      # DB + uploads dumps
/etc/nginx/sites-available/
  pullertackle.com
  mail.pullertackle.com
/etc/postfix/ ...
/etc/dovecot/ ...
```

### Ports (UFW)

| Port | Source | Service |
|------|--------|---------|
| 22 | Admin IPs only (preferred) | SSH |
| 80, 443 | Anywhere | HTTP/HTTPS |
| 25, 465, 587 | Anywhere | SMTP |
| 993 | Anywhere | IMAPS |
| 3306 | **Deny public** | MySQL localhost only |
| 3000 | **Deny public** | Next.js via Nginx only |

---

## 5. Application production config

### Environment (server `.env` — never commit)

```bash
NODE_ENV=production
# Default: existing MySQL on this VPS (Stage 0 values). Fallback name shown below.
DATABASE_URL="mysql://EXISTING_USER:STRONG_PASSWORD@127.0.0.1:3306/EXISTING_OR_puller_hooks"
AUTH_SECRET="long-random-32+-chars"
# Seed once only if admin empty, then remove:
# ADMIN_SETUP_EMAIL="sales@pullertackle.com"
# ADMIN_SETUP_PASSWORD="..."
```

### PM2

- Name: `puller-web`
- Script: `npm start` (or `node_modules/next/dist/bin/next start`)
- `cwd`: `/var/www/pullertackle`
- Bind: `127.0.0.1:3000`
- Restart on boot: `pm2 startup` + `pm2 save`

### Nginx (website)

- `server_name pullertackle.com www.pullertackle.com`
- Proxy `/` → `http://127.0.0.1:3000`
- Optional: alias or try_files for `/uploads` if serving large files from disk (default Next public is fine)
- Certbot: `certbot --nginx -d pullertackle.com -d www.pullertackle.com`

### Database (default = existing SQL)

1. **Stage 0:** discover engine, bind address, DB name, app user (do not drop data).  
2. Set production `DATABASE_URL` to that instance, e.g.  
   `mysql://USER:PASSWORD@127.0.0.1:3306/EXISTING_OR_puller_hooks`  
3. Apply schema only: `npx prisma migrate deploy` (never `migrate reset` on prod).  
4. Seed admin **only if** the admin table is empty: `npm run db:seed`, then remove setup password from `.env`.  
5. **Create** `puller_hooks` / `puller_app` only when Stage 0 finds no usable MySQL DB.

---

## 6. Email architecture (Stage C)

| Component | Role |
|-----------|------|
| Postfix | MTA; submission on 587 (STARTTLS), SMTPS 465; **no open relay** |
| Dovecot | IMAPS 993; SASL for submission |
| Rspamd | Spam/virus scoring; DKIM signing |
| Roundcube | Web UI at `https://mail.pullertackle.com` |
| Mailbox | `sales@pullertackle.com` |

App forms store inquiries in MySQL; staff reply from Roundcube/Outlook/Gmail SMTP using the business mailbox.

---

## 7. Deployment stages (execution order)

| Stage | Name | Destructive? | Approval gate |
|-------|------|--------------|---------------|
| **0** | VPS audit (read-only SSH) | No | Approve SSH access |
| **A** | DNS plan + GoDaddy checklist | Yes if applied | Approve each DNS change |
| **B** | Website stack (Node, **reuse existing MySQL**, app, PM2, Nginx, SSL) | Low if greenfield; DB is reuse-first | Approve installs |
| **B+** | Import **local** MySQL + uploads → VPS (same CMS data) | Overwrites target app DB | Approve import; **mail off-limits** |
| **C** | Mail stack + mailbox + auth DNS | Medium | Approve after B stable — **skip while website-only** |
| **D** | Hardening (UFW, SSH keys, unattended-upgrades, backups, monitoring) | Medium | Approve firewall/SSH lock |
| **E** | Ops runbooks (deploy/restart/backup/troubleshoot) | Docs only | Review docs |

See sibling files:

- `docs/STAGE-0-VPS-AUDIT.md`
- `docs/STAGE-A-DNS.md`
- `docs/STAGE-B-WEBSITE.md`
- `docs/STAGE-B-DATA-MIGRATE.md` ← local same data → VPS (website only)
- `docs/STAGE-C-EMAIL.md` ← **do not run** during website-only work
- `docs/STAGE-D-SECURITY.md`
- `docs/STAGE-E-MAINTENANCE.md`

---

## 8. What we will **not** do without explicit approval

1. Change GoDaddy DNS records  
2. Disable password SSH / lock you out  
3. Overwrite existing Nginx/Postfix configs without backups  
4. Drop or recreate the **existing** MySQL databases with data (except approved Stage B+ import after a backup)
5. Open MySQL to the internet / replace existing DB with Turso for production
6. Enable open relay  
7. Commit secrets or paste passwords into the repository  
8. **While website-only:** edit, restart, or **read** mail stack / mailboxes / Roundcube

---

## 9. Full setup (end-to-end)

Execute in order. Generate secrets locally; **never** commit them. Replace every `CHANGE_ME_*` value.

### 9.0 Preflight (your laptop)

```bash
# Generate secrets (PowerShell or bash)
openssl rand -base64 48   # → AUTH_SECRET
openssl rand -base64 24   # → MySQL puller_app password
openssl rand -base64 18   # → sales@ mailbox password (password manager only)
```

Checklist before touching the VPS:

- [ ] Root password rotated (if ever shared in chat)
- [ ] SSH key ready (`ssh-copy-id` preferred)
- [ ] GoDaddy DNS export/screenshot saved
- [ ] GitHub repo access: `shabeeb1044/puller-hooks`
- [ ] Decide: keep existing MX until mail stage is ready (**recommended**)

---

### 9.1 Stage 0 — VPS audit (read-only)

```bash
ssh root@129.121.168.106
hostnamectl; uname -a; free -h; df -h; nproc
ss -tulpn
systemctl list-units --type=service --state=running
dpkg -l | grep -E 'nginx|apache|mysql|mariadb|postfix|dovecot|nodejs|php|rspamd|roundcube' || true
ufw status verbose || true
ls -la /var/www 2>/dev/null; ls -la /etc/nginx/sites-enabled 2>/dev/null
```

**Stop** if Apache/cPanel/Plesk already owns the stack — plan coexistence before installs.

---

### 9.2 Stage B — Website stack

#### B1. Base packages + Node 22 + PM2

```bash
apt update
# Website hosting packages (unchanged). Install mysql-server ONLY if Stage 0 found no MySQL/MariaDB.
apt install -y build-essential curl git nginx ufw ca-certificates
# apt install -y mysql-server   # ← only if no existing SQL engine
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v   # v22.x
npm install -g pm2

adduser --disabled-password --gecos "" puller
mkdir -p /var/www/pullertackle /var/backups/pullertackle
chown puller:puller /var/www/pullertackle
```

#### B2. Database — **default = existing MySQL**

**Preferred (existing DB):**

```bash
# From Stage 0 notes — confirm service + localhost bind
systemctl status mysql || systemctl status mariadb
ss -tlnp | grep 3306   # expect 127.0.0.1:3306 only
# List DBs / users (read-only first):
# mysql -e "SHOW DATABASES;"
```

Set `.env` `DATABASE_URL` to the **existing** DB name and user. Do **not** drop or recreate data.

**Fallback (no SQL engine found):** install MySQL, bind `127.0.0.1`, then:

```bash
# /etc/mysql/mysql.conf.d/mysqld.cnf  →  bind-address = 127.0.0.1
systemctl restart mysql
mysql_secure_installation
```

```sql
CREATE DATABASE puller_hooks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'puller_app'@'localhost' IDENTIFIED BY 'CHANGE_ME_DB_PASSWORD';
GRANT ALL PRIVILEGES ON puller_hooks.* TO 'puller_app'@'localhost';
FLUSH PRIVILEGES;
```

Verify: `ss -tlnp | grep 3306` shows `127.0.0.1:3306` only.

#### B3. App deploy

```bash
sudo -u puller -i
cd /var/www/pullertackle
git clone https://github.com/shabeeb1044/puller-hooks.git .
cp .env.example .env
chmod 600 .env
nano .env
```

Production `.env`:

```bash
NODE_ENV=production
# Default: existing MySQL (replace USER/PASSWORD/DB_NAME from Stage 0)
DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/DB_NAME"
AUTH_SECRET="CHANGE_ME_AUTH_SECRET"
# Only if AdminUser table empty:
# ADMIN_SETUP_EMAIL="sales@pullertackle.com"
# ADMIN_SETUP_PASSWORD="CHANGE_ME_ADMIN_ONCE"
```

```bash
npm ci
npx prisma migrate deploy
# npm run db:seed   # only if admin table empty — then remove ADMIN_SETUP_* from .env
npm run build
```

Create `/var/www/pullertackle/ecosystem.config.cjs`:

```js
module.exports = {
  apps: [{
    name: 'puller-web',
    cwd: '/var/www/pullertackle',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -H 127.0.0.1 -p 3000',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production' },
    max_memory_restart: '512M',
  }],
};
```

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup    # run the printed systemd command as root
curl -I http://127.0.0.1:3000/
```

#### B4. Nginx reverse proxy

Backup first: `cp -a /etc/nginx /etc/nginx.bak.$(date +%F)`

`/etc/nginx/sites-available/pullertackle.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name pullertackle.com www.pullertackle.com;
    client_max_body_size 8m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -sf /etc/nginx/sites-available/pullertackle.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

#### B5. Firewall (web ports; SSH kept)

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose
```

#### B6. DNS for website + TLS

**GoDaddy (approve before apply):**

| Type | Name | Value |
|------|------|-------|
| A | `@` | `129.121.168.106` |
| A | `www` | `129.121.168.106` |

Do **not** change MX yet.

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d pullertackle.com -d www.pullertackle.com
```

#### B7. Website smoke tests

```bash
curl -I https://pullertackle.com/
curl -I https://www.pullertackle.com/contact
curl -I https://pullertackle.com/dealers
curl -I https://pullertackle.com/our-story
curl -I https://pullertackle.com/management-portal
pm2 status
```

Manual: admin login → upload image → confirm `/uploads/...` survives `pm2 restart puller-web`.

---

### 9.3 Stage C — Business email

#### C1. Packages + mail hostname DNS

**GoDaddy:** A record `mail` → `129.121.168.106` (approve first).

```bash
apt install -y postfix postfix-pcre dovecot-core dovecot-imapd dovecot-lmtpd \
  rspamd redis-server \
  roundcube roundcube-mysql php-fpm php-mysql php-xml php-mbstring php-intl php-zip
# Postfix: Internet Site, mail name pullertackle.com
```

```bash
ufw allow 25/tcp
ufw allow 465/tcp
ufw allow 587/tcp
ufw allow 993/tcp
certbot --nginx -d mail.pullertackle.com
```

#### C2. Mailbox `sales@pullertackle.com`

```bash
adduser --disabled-login --gecos "Sales PullerTackle" sales
passwd sales    # CHANGE_ME_MAIL_PASSWORD — password manager only
```

Configure (backup configs first):

- Postfix: submission 587 + SMTPS 465, SASL via Dovecot, TLS certs for `mail.`
- Dovecot: IMAPS 993, auth for local users
- `mynetworks = 127.0.0.0/8` only — **no open relay**
- Rspamd: enable DKIM signing for `pullertackle.com`

#### C3. Email DNS (approve each TXT/MX)

| Type | Name | Value |
|------|------|-------|
| MX | `@` | `mail.pullertackle.com` (10) |
| TXT | `@` | `v=spf1 mx a:mail.pullertackle.com ~all` |
| TXT | `default._domainkey` | *(public key from Rspamd/OpenDKIM)* |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:sales@pullertackle.com` |

#### C4. Roundcube

Nginx vhost `mail.pullertackle.com` → PHP-FPM Roundcube; IMAP/SMTP to localhost with TLS.  
Staff clients: IMAP `mail.pullertackle.com:993`, SMTP `mail.pullertackle.com:587`.

#### C5. Mail tests

- Roundcube → Gmail and Outlook (inbox, not spam)
- External → `sales@` receive via IMAP
- Headers show SPF/DKIM/DMARC pass
- Unauthenticated relay from outside **fails**

---

### 9.4 Stage D — Hardening

```bash
# SSH keys first — verify new login BEFORE disabling passwords
apt install -y unattended-upgrades fail2ban
dpkg-reconfigure -plow unattended-upgrades

# Daily backup example
cat >/usr/local/bin/puller-backup.sh <<'EOF'
#!/bin/bash
set -euo pipefail
STAMP=$(date +%F)
DIR=/var/backups/pullertackle/$STAMP
mkdir -p "$DIR"
mysqldump --single-transaction puller_hooks | gzip > "$DIR/db.sql.gz"
tar -czf "$DIR/uploads.tar.gz" -C /var/www/pullertackle/public uploads
find /var/backups/pullertackle -mindepth 1 -maxdepth 1 -mtime +14 -exec rm -rf {} +
EOF
chmod +x /usr/local/bin/puller-backup.sh
echo '15 3 * * * root /usr/local/bin/puller-backup.sh' > /etc/cron.d/puller-backup
```

After SSH key works: `PasswordAuthentication no` in `sshd_config`, then `systemctl reload ssh`.  
Keep Bluehost console/VNC available before locking password login.

---

### 9.5 Stage E — Day-2 commands

**Deploy update**

```bash
sudo -u puller -i
cd /var/www/pullertackle
git pull origin main && npm ci && npx prisma migrate deploy && npm run build
pm2 restart puller-web
```

**Restarts**

```bash
pm2 restart puller-web
systemctl restart postfix dovecot rspamd
systemctl reload nginx
```

**Backup now / watch resources**

```bash
/usr/local/bin/puller-backup.sh
pm2 status; df -h; free -h; mailq
```

Full troubleshooting tables: `docs/STAGE-E-MAINTENANCE.md`.

---

### 9.6 Definition of done

- [ ] `https://pullertackle.com` and `www` load with valid TLS  
- [ ] Admin login + image upload persists  
- [ ] Contact/dealer APIs write to MySQL  
- [ ] MySQL not reachable publicly  
- [ ] `sales@pullertackle.com` send/receive; Roundcube works  
- [ ] SPF/DKIM/DMARC configured; no open relay  
- [ ] UFW active; PM2 + Nginx + MySQL + mail on boot  
- [ ] Daily DB/uploads backup cron installed  

---

## 10. Recommended next action

1. **Rotate the root password** if it was shared in chat.  
2. Approve **Stage 0** SSH audit (key preferred).  
3. Run **§9.2 Stage B** on the VPS.  
4. Apply website DNS (§9.2 B6) only after local `curl` smoke tests pass.  
5. Run **§9.3 Stage C** mail last; then harden (§9.4).  

Sibling stage files (detail): `docs/STAGE-0-VPS-AUDIT.md` … `docs/STAGE-E-MAINTENANCE.md`.
