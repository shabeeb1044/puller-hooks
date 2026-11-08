# Stage E – Maintenance & troubleshooting

Operational runbooks for PullerTackle production. Paths assume `/var/www/pullertackle` and PM2 app `puller-web`.

---

## 1. Website deploy (update from GitHub)

```bash
sudo -u puller -i
cd /var/www/pullertackle
git fetch origin
git checkout main
git pull origin main
npm ci
npx prisma migrate deploy
npm run build
pm2 restart puller-web
pm2 status
curl -I http://127.0.0.1:3000/
```

**Do not** delete `public/uploads` or `.env` during deploy.  
**Do not** run `prisma migrate reset` on production.

---

## 2. Website restart

```bash
pm2 restart puller-web
pm2 logs puller-web --lines 50
sudo systemctl reload nginx   # only if nginx config changed
```

Full stop/start:

```bash
pm2 stop puller-web
pm2 start puller-web
```

---

## 3. Email service restart

```bash
sudo systemctl restart postfix
sudo systemctl restart dovecot
sudo systemctl restart rspamd
sudo systemctl reload nginx   # Roundcube vhost
sudo systemctl status postfix dovecot rspamd --no-pager
```

Queue check:

```bash
mailq
sudo tail -n 100 /var/log/mail.log
```

---

## 4. Database backup & restore

### Backup

```bash
STAMP=$(date +%F-%H%M)
mkdir -p /var/backups/pullertackle
mysqldump --single-transaction puller_hooks | gzip > /var/backups/pullertackle/db-$STAMP.sql.gz
tar -czf /var/backups/pullertackle/uploads-$STAMP.tar.gz -C /var/www/pullertackle/public uploads
```

### Restore (approval required — destructive)

```bash
gunzip < /var/backups/pullertackle/db-YYYY-MM-DD.sql.gz | mysql puller_hooks
# restore uploads tarball into public/uploads if needed
pm2 restart puller-web
```

---

## 5. Troubleshooting

| Symptom | Checks |
|---------|--------|
| 502 Bad Gateway | `pm2 status`; `curl -I 127.0.0.1:3000`; `pm2 logs puller-web` |
| Site down / Nginx error | `sudo nginx -t`; `journalctl -u nginx -n 50` |
| Admin login fails | `AUTH_SECRET` set; cookie over HTTPS; DB reachable |
| Upload fails | Disk space `df -h`; permissions on `public/uploads`; body size in Nginx |
| DB errors | `sudo systemctl status mysql`; test `mysql -u puller_app -p puller_hooks` |
| Mail not sending | `mailq`; SASL auth; port 587/465 firewall; DKIM/SPF |
| Mail in spam | SPF/DKIM/DMARC headers; PTR/rDNS with Bluehost; warm up sending |
| High CPU/RAM | `htop`; `pm2 monit`; check mail flood / fail2ban |

---

## 6. Resource monitoring

```bash
htop
df -h
free -h
uptime
pm2 monit
sudo du -sh /var/www/pullertackle /var/mail /var/backups/pullertackle
```

Alert thresholds (suggested): disk > 80%, RAM sustained > 90%, PM2 restarts looping.

---

## 7. Certificate renewal

Certbot timer usually auto-renews. Manual test:

```bash
sudo certbot renew --dry-run
```

---

## 8. Contacts / ownership

| Item | Owner |
|------|-------|
| GoDaddy DNS | Business admin |
| Bluehost VPS | DevOps |
| GitHub repo | `shabeeb1044/puller-hooks` |
| Mailbox `sales@` | Sales team |
| Admin CMS | `/management-portal` |
