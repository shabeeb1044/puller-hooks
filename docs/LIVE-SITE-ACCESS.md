# PullerTackle — Live site access & addresses

**Last updated:** 2026-11-09  
**Purpose:** One place for live URLs, admin login, server addresses, and related services.  
**Security:** Do **not** put real passwords, `AUTH_SECRET`, DB passwords, or SSH keys in git. Keep those in a password manager only.

---

## 1. Public website

| Item | Value |
|------|--------|
| Main site | https://pullertackle.com |
| WWW | https://www.pullertackle.com |
| Contact | https://pullertackle.com/contact |
| Dealers | https://pullertackle.com/dealers |
| Our story | https://pullertackle.com/our-story |
| Hooks | https://pullertackle.com/products/hooks |
| Flash Striker | https://pullertackle.com/products/flash-striker |

---

## 2. Admin CMS

| Item | Value |
|------|--------|
| **Admin login URL** | https://pullertackle.com/management-portal |
| After login | https://pullertackle.com/admin |
| **Username (email)** | `sales@pullertackle.com` |
| **Password** | *Store in password manager only* — same as local CMS admin after the 2026-11-09 DB sync. Change if shared. |
| Session cookie | `puller_admin_session` (HTTPS) |

### Admin sections

| Section | Path |
|---------|------|
| Dashboard | `/admin` |
| Products | `/admin/products` |
| Models | `/admin/models` |
| Categories | `/admin/categories` |
| Subcategories | `/admin/subcategories` |
| Dealer network | `/admin/dealer-network` |
| Dealer inquiries | `/admin/dealers` |
| Contact inquiries | `/admin/contact-inquiries` |
| Settings | `/admin/settings` |

---

## 3. Business email

| Item | Value |
|------|--------|
| Mailbox | `sales@pullertackle.com` |
| Webmail (Roundcube) | https://mail.pullertackle.com *(if Stage C enabled)* |
| Form notify To | `sales@pullertackle.com` |
| Form From | `noreply@pullertackle.com` |
| IMAP | `mail.pullertackle.com` · 993 · SSL/TLS |
| SMTP (clients) | `mail.pullertackle.com` · 587 STARTTLS (or 465) |

App SMTP (server → mailbox), from production `.env`:

| Key | Typical value |
|-----|----------------|
| `SALES_EMAIL` | `sales@pullertackle.com` |
| `MAIL_FROM` | `noreply@pullertackle.com` |
| `SMTP_HOST` | `127.0.0.1` |
| `SMTP_PORT` | `25` |

---

## 4. Google Sheet (form submissions)

| Item | Value |
|------|--------|
| Spreadsheet (admin link) | Set as `GOOGLE_SHEET_URL` in server `.env` |
| Webhook (Apps Script) | Set as `GOOGLE_SHEET_WEBHOOK` in server `.env` |
| Setup guide | `docs/GOOGLE-SHEET-APPS-SCRIPT.md` |

Contact form → **Contact** tab · Dealer form → **Dealer** tab.

---

## 5. Domain & hosting addresses

| Item | Value |
|------|--------|
| Domain | `pullertackle.com` |
| DNS registrar | GoDaddy |
| VPS provider | Bluehost |
| VPS public IP | `129.121.168.106` |
| OS | Ubuntu 26.04 LTS |
| App path | `/var/www/pullertackle` |
| Deploy user | `puller` |
| Process manager | PM2 app name `puller-web` |
| App listen | `127.0.0.1:3000` |
| Reverse proxy | Nginx → HTTPS 443 |
| TLS | Let’s Encrypt (Certbot) |
| DB | MySQL on `127.0.0.1:3306` · database `puller_hooks` |
| Uploads | `/var/www/pullertackle/public/uploads/` |
| DB backups | `/var/backups/pullertackle/` |
| Git repo | https://github.com/shabeeb1044/puller-hooks.git |
| Branch | `main` |

### DNS records (summary)

| Host | Type | Points to |
|------|------|-----------|
| `@` | A | `129.121.168.106` |
| `www` | A / CNAME | `129.121.168.106` or `@` |
| `mail` | A | `129.121.168.106` |
| `@` | MX | `mail.pullertackle.com` |

---

## 6. SSH (operators only)

| Item | Value |
|------|--------|
| Host | `129.121.168.106` |
| User | `root` or `puller` |
| Key (example local) | `~/.ssh/pullertackle_ed25519` |

```powershell
ssh -i $env:USERPROFILE\.ssh\pullertackle_ed25519 -o IdentitiesOnly=yes root@129.121.168.106
```

---

## 7. Quick checks

```bash
curl -I https://pullertackle.com/
curl -I https://pullertackle.com/management-portal
curl -I http://127.0.0.1:3000/
pm2 status   # as user puller
```

Deploy / restart runbooks: `docs/STAGE-E-MAINTENANCE.md`  
Full architecture: `docs/DEPLOYMENT-ARCHITECTURE.md`

---

## 8. Password manager checklist (private — not in git)

Copy these into 1Password / Bitwarden / similar:

- [ ] Website admin URL + `sales@pullertackle.com` + admin password  
- [ ] `sales@` mailbox password  
- [ ] VPS SSH key / root access note  
- [ ] MySQL `puller_app` password  
- [ ] `AUTH_SECRET`  
- [ ] Google Sheet edit link + Apps Script webhook URL  
