# Stage C – Business email (Postfix / Dovecot / Rspamd / Roundcube)

**Goal:** `sales@pullertackle.com` with secure SMTP/IMAP, spam filtering, Roundcube, and deliverability records.  
**Prerequisite:** Stage B stable; `mail.pullertackle.com` A record ready.  
**Hard rules:** No open relay; backup configs before edits; isolate from Node app.

## C1. Packages

```bash
sudo apt install -y postfix postfix-pcre dovecot-core dovecot-imapd dovecot-lmtpd \
  rspamd redis-server certbot \
  roundcube roundcube-mysql php-fpm php-mysql php-xml php-mbstring php-intl php-zip
```

During Postfix install: choose **Internet Site**; system mail name `pullertackle.com`.

## C2. TLS for mail hostname

```bash
sudo certbot certonly --nginx -d mail.pullertackle.com
# or standalone if mail vhost not yet ready
```

Point Postfix/Dovecot `ssl_cert` / `ssl_key` at:

- `/etc/letsencrypt/live/mail.pullertackle.com/fullchain.pem`
- `/etc/letsencrypt/live/mail.pullertackle.com/privkey.pem`

## C3. Mailbox

Prefer virtual mailbox user (or system user) for `sales`:

```bash
# Example system mailbox approach (adjust to chosen design after Stage 0):
sudo adduser --disabled-login --gecos "Sales" sales
sudo passwd sales   # strong unique password — store in password manager only
```

Dovecot auth → Postfix SASL for submission.  
Submission: ports **587** (STARTTLS) and/or **465** (SMTPS).  
IMAP: **993** only (disable plain 143 publicly if unused).

## C4. Anti-open-relay checklist

- `mynetworks` = localhost only  
- Authenticated submission required for non-local senders  
- No `smtpd_recipient_restrictions` that permit arbitrary relay  
- Test from external host: unauthenticated relay attempt must fail  

## C5. DKIM / SPF / DMARC

1. Enable DKIM signing in Rspamd (or OpenDKIM if chosen instead — pick **one**).  
2. Publish TXT for selector (e.g. `default._domainkey`).  
3. SPF TXT on apex including `mx` and/or `a:mail.pullertackle.com`.  
4. DMARC `_dmarc` with `p=none` initially; raise to `quarantine` after clean reports.

## C6. Roundcube

- Nginx vhost `mail.pullertackle.com` → PHP-FPM Roundcube  
- IMAP host: `ssl://localhost` or `tls://mail.pullertackle.com`  
- SMTP host: submission with auth  
- Force HTTPS  

## C7. Client settings (share with staff — no passwords in docs)

| Setting | Value |
|---------|--------|
| Email | `sales@pullertackle.com` |
| IMAP | `mail.pullertackle.com` · 993 · SSL/TLS |
| SMTP | `mail.pullertackle.com` · 587 STARTTLS (or 465 SSL) |
| Auth | Normal password · same mailbox credentials |

## C8. Delivery tests

1. Roundcube send → Gmail inbox (check spam).  
2. Roundcube send → Outlook/Microsoft 365.  
3. External send → mailbox; confirm IMAP receive.  
4. Check headers: SPF/DKIM/DMARC pass.  
5. Confirm website Node process still healthy (`pm2 status`).

## Rollback

Restore `/etc/postfix` and `/etc/dovecot` from dated backups; revert MX only if it was changed in this stage.
