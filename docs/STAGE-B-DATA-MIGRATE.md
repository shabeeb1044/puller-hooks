# Stage B+ – Local data → VPS (website only)

**Goal:** Copy the **same** MySQL data (and uploads) from the local/dev host onto the VPS so production matches local CMS content.  
**Scope:** **Website application only** — Next.js app, Prisma MySQL (`puller_hooks`), `public/uploads`.  
**Out of scope (do not edit, restart, or read):** Postfix, Dovecot, Roundcube, mailboxes, MX/SPF/DKIM, mail configs under `/etc/postfix` `/etc/dovecot`, `/var/mail`.

**Approval:** Required before SSH import onto the VPS.

---

## What moves

| Item | Source (local) | Target (VPS) |
|------|----------------|--------------|
| App DB | MySQL `puller_hooks` | VPS MySQL DB used by `DATABASE_URL` |
| Media | `public/uploads/` | `/var/www/pullertackle/public/uploads/` |
| App code | GitHub `main` | `/var/www/pullertackle` (normal Stage B deploy) |

Mail data and mail packages are **never** part of this step.

---

## 1. Export on local Windows (already supported)

From repo root (uses `.env` `DATABASE_URL`, XAMPP mysqldump):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/export-local-site-data.ps1
```

Creates (gitignored):

- `backups/puller_hooks-local-*.sql`
- `backups/uploads-local-*.zip` (if uploads exist)

Manual equivalent:

```powershell
# DB
& C:\xampp\mysql\bin\mysqldump.exe -h 127.0.0.1 -P 3306 -u root --single-transaction --routines --triggers puller_hooks -r backups\puller_hooks-local.sql

# Uploads
Compress-Archive -Path public\uploads\* -DestinationPath backups\uploads-local.zip -Force
```

---

## 2. Copy dump to VPS (website paths only)

```bash
# From your laptop (after SSH access approved)
scp backups/puller_hooks-local-*.sql puller@129.121.168.106:/tmp/puller_hooks-local.sql
scp backups/uploads-local-*.zip puller@129.121.168.106:/tmp/uploads-local.zip
```

Do **not** scp anything into mail directories.

---

## 3. Import on VPS (MySQL for the website app only)

**Done on production (2026-11-07):** local dump imported into `puller_hooks`; uploads extracted; `pm2 restart puller-web`. Mail/`roundcube` untouched.

### Gotchas (Windows XAMPP → Ubuntu MySQL 8.4)

1. **Table casing:** local dump uses lowercase (`product`); Linux Prisma tables are PascalCase (`Product`). Normalize before import.  
2. **TEXT defaults:** MariaDB allows `` `ctaHref` text DEFAULT '...' ``; MySQL 8.4 rejects it — map to `varchar(500)` (or strip TEXT defaults).  
3. **`unzip` may be missing** — use Python `zipfile` instead.  
4. Backup **`puller_hooks` only** — never dump/restore `roundcube`.

```bash
# Backup website DB only
mysqldump --single-transaction puller_hooks | gzip > /var/backups/pullertackle/pre-import-$(date +%F).sql.gz

# Use normalized import script (casing + MySQL 8 fixes), then:
# mysql puller_hooks < /tmp/puller-import/puller_hooks-normalized.sql

# Uploads (Python if unzip missing)
python3 -c "import zipfile; from pathlib import Path; d=Path('/var/www/pullertackle/public/uploads'); d.mkdir(parents=True, exist_ok=True); z=zipfile.ZipFile('/tmp/puller-import/uploads-local.zip');
[ (d/Path(i.filename).name).write_bytes(z.read(i)) for i in z.infolist() if not i.is_dir() and Path(i.filename).name not in ('','.gitkeep') ]"
chown -R puller:puller /var/www/pullertackle/public/uploads

pm2 restart puller-web
```

---

## 4. Verify (website only)

```bash
curl -I http://127.0.0.1:3000/
# Admin login, products/categories match local
# One uploaded image URL under /uploads/... loads
# Contact/dealer forms still write to MySQL
```

**Do not** open Roundcube, read mail logs, or change mail DNS as part of this migrate.

---

## Hard rules

1. Website stack only: Nginx site for the app, PM2 `puller-web`, MySQL app DB, uploads.  
2. No mail package install/upgrade, no mailbox edits, no reading mailbox contents.  
3. Never commit `.sql` dumps or passwords to git (`backups/` is gitignored).  
4. Take a VPS DB backup before overwrite import.  
