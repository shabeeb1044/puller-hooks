# Stage B – Website hosting (Next.js on VPS)

**Goal:** Production Next.js behind Nginx + PM2 + TLS.  
**Database default:** **Reuse the existing MySQL/SQL on the VPS** (set as `DATABASE_URL`). Install a new MySQL only if Stage 0 found none.  
**Website hosting:** Unchanged — Nginx reverse proxy → PM2 → `next start` on `127.0.0.1:3000`.  
**Scope:** Website application only. **Do not edit or read mail** in this stage.  
**Same local data on VPS:** After app is up, run [STAGE-B-DATA-MIGRATE.md](./STAGE-B-DATA-MIGRATE.md) (import local MySQL + uploads).  
**Prerequisite:** Stage 0 audit complete; no conflicting Apache/cPanel web stack (or plan coexistence).  
**Approval:** Required before `apt install` and before first DNS cutover.

## B1. System packages & Node 22

```bash
sudo apt update
# Hosting stack (as-is). Add mysql-server only if Stage 0 found no SQL engine.
sudo apt install -y build-essential curl git nginx ufw
# sudo apt install -y mysql-server   # ← only if no existing DB
# Node 22 LTS (NodeSource or nvm — choose one after Stage 0)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # expect v22.x
sudo npm install -g pm2
```

Create deploy user:

```bash
sudo adduser --disabled-password --gecos "" puller
sudo mkdir -p /var/www/pullertackle
sudo chown puller:puller /var/www/pullertackle
```

## B2. Database — default = existing SQL

### Prefer existing (default path)

```bash
systemctl status mysql || systemctl status mariadb
ss -tlnp | grep 3306   # expect 127.0.0.1:3306 only
# Record DB name + app user from Stage 0; use them in DATABASE_URL.
# Do NOT drop/recreate databases that already hold site data.
```

Point production `.env` at that instance:

```bash
DATABASE_URL="mysql://EXISTING_USER:EXISTING_PASSWORD@127.0.0.1:3306/EXISTING_DB"
```

### Fallback — create MySQL only if missing

```bash
sudo mysql_secure_installation
# Ensure bind-address = 127.0.0.1 in mysqld.cnf, then:
sudo systemctl restart mysql
```

```sql
CREATE DATABASE puller_hooks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'puller_app'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON puller_hooks.* TO 'puller_app'@'localhost';
FLUSH PRIVILEGES;
```

Verify not public: `ss -tlnp | grep 3306` → `127.0.0.1:3306` only.

## B3. Deploy application

```bash
sudo -u puller -i
cd /var/www/pullertackle
git clone https://github.com/shabeeb1044/puller-hooks.git .
# or: git pull origin main
cp .env.example .env
chmod 600 .env
# edit .env: DATABASE_URL → existing MySQL (default), AUTH_SECRET
# ADMIN_SETUP_* only if AdminUser table is empty
npm ci
npx prisma migrate deploy
# npm run db:seed   # only if admin empty — then remove ADMIN_SETUP_PASSWORD
npm run build
```

### `ecosystem.config.cjs` (create on server)

```js
module.exports = {
  apps: [
    {
      name: 'puller-web',
      cwd: '/var/www/pullertackle',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '512M',
    },
  ],
};
```

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # follow printed systemd command
```

## B4. Nginx reverse proxy

Backup any existing site configs before editing:

```bash
sudo cp -a /etc/nginx /etc/nginx.bak.$(date +%F)
```

Site sketch (`/etc/nginx/sites-available/pullertackle.com`):

```nginx
server {
    listen 80;
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
sudo ln -sf /etc/nginx/sites-available/pullertackle.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## B5. SSL (Let's Encrypt)

After DNS A records point here (or using certbot DNS/HTTP once reachable):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pullertackle.com -d www.pullertackle.com
```

Force HTTPS redirects via certbot nginx plugin.

## B6. Smoke tests

```bash
curl -I http://127.0.0.1:3000/
curl -I https://pullertackle.com/
curl -I https://www.pullertackle.com/contact
curl -I https://pullertackle.com/dealers
curl -I https://pullertackle.com/management-portal
# POST contact/dealer APIs with valid JSON
# Login admin, upload one image, confirm /uploads/... persists after pm2 restart
```

## Rollback notes

- Keep previous git tag/commit known.  
- `pm2 restart puller-web` / `git checkout <sha> && npm ci && npm run build`.  
- Never delete `public/uploads` or MySQL data during rollback.
