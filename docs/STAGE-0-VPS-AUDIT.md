# Stage 0 – VPS audit (read-only)

**Goal:** Inventory the Bluehost Ubuntu 26.04 host before any installs.  
**Risk:** None if commands stay read-only.  
**Approval:** Required before SSH.

## Access policy

1. Prefer SSH key auth for user `root` or a sudo user.
2. Do not paste root passwords into chat, tickets, or git.
3. Rotate any password already shared in plaintext.

## Checklist (run on server)

```bash
# Identity & resources
hostnamectl
uname -a
free -h
df -h
nproc
ip -br a

# Existing listeners / stacks
ss -tulpn
systemctl list-units --type=service --state=running
dpkg -l | grep -E 'nginx|apache|mysql|mariadb|postfix|dovecot|nodejs|php|rspamd|roundcube' || true

# Firewall / updates
ufw status verbose || true
apt list --upgradable 2>/dev/null | head

# Web roots / prior apps
ls -la /var/www 2>/dev/null || true
ls -la /etc/nginx/sites-enabled 2>/dev/null || true

# Existing SQL (default production DB — inventory first, do not drop)
systemctl status mysql --no-pager 2>/dev/null || systemctl status mariadb --no-pager 2>/dev/null || true
ss -tlnp | grep -E '3306|5432' || true
# If mysql CLI works (read-only):
# mysql -e "SHOW DATABASES; SELECT user,host FROM mysql.user;"
# Note: bind-address, DB name(s), app users — these become DATABASE_URL defaults in Stage B

# Mail-related DNS from this host (outbound check only)
dig +short pullertackle.com A
dig +short www.pullertackle.com A
dig +short mail.pullertackle.com A
dig +short pullertackle.com MX
dig +short pullertackle.com TXT
```

## Deliverable

A short audit report covering:

- OS version and free disk/RAM  
- Whether Nginx, MySQL/MariaDB, Postfix, Apache, cPanel, or other panels already exist  
- **Existing database details** (engine, bind address, DB names, app users) → Stage B default `DATABASE_URL`  
- Conflicting services to avoid installing twice  
- Whether the VPS looks greenfield or already hosts another site/mail  

## Stop conditions

Stop and ask before:

- Installing packages  
- Creating/dropping databases or changing MySQL users  
- Changing firewall rules  
- Editing DNS  
- Restarting production services  
