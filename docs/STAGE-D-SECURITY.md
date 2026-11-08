# Stage D – Server security

**Goal:** Harden SSH, firewall, DB, mail auth, updates, backups, and basic monitoring.  
**Approval:** Required before disabling password SSH or tightening UFW (risk of lockout).

## D1. UFW

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 25/tcp
sudo ufw allow 465/tcp
sudo ufw allow 587/tcp
sudo ufw allow 993/tcp
# Never: ufw allow 3306
# Never: ufw allow 3000
sudo ufw enable
sudo ufw status verbose
```

Optional: restrict SSH to office/home IP: `ufw allow from X.X.X.X to any port 22`.

## D2. SSH key authentication

1. Generate key locally (ed25519).  
2. Install public key in `/root/.ssh/authorized_keys` (or deploy user).  
3. Verify new session works **before** disabling passwords.  
4. Then set in `sshd_config`: `PasswordAuthentication no`, `PermitRootLogin prohibit-password`.  
5. `sshd -t && systemctl reload ssh`.

## D3. Database

- Bind `127.0.0.1` only  
- App user privileges limited to `puller_hooks.*`  
- No remote root  
- Strong passwords in password manager only  

## D4. Mail auth

- Disable unauthenticated relay  
- Prefer TLS-only submission  
- Fail2ban (optional) on dovecot/postfix/sshd  

```bash
sudo apt install -y fail2ban
```

## D5. Automatic security updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## D6. Backups

Daily cron (example paths):

```bash
# /usr/local/bin/puller-backup.sh
set -euo pipefail
STAMP=$(date +%F)
DIR=/var/backups/pullertackle/$STAMP
mkdir -p "$DIR"
mysqldump --single-transaction puller_hooks | gzip > "$DIR/db.sql.gz"
tar -czf "$DIR/uploads.tar.gz" -C /var/www/pullertackle/public uploads
# retain 14 days
find /var/backups/pullertackle -mindepth 1 -maxdepth 1 -mtime +14 -exec rm -rf {} +
```

Copy off-server weekly (S3, another VPS, or encrypted download). Test restore once.

## D7. Monitoring

```bash
pm2 status
pm2 logs puller-web --lines 100
systemctl status nginx mysql postfix dovecot rspamd --no-pager
df -h
free -h
# Optional: netdata or node_exporter later
```

Uptime: external HTTP(S) check on `/` and TCP check on `25`/`993` if desired.

## Lockout recovery

Keep Bluehost console/VNC access documented before disabling password SSH.
