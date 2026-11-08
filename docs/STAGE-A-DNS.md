# Stage A – Domain & DNS (GoDaddy)

**Goal:** Point website and mail hostnames at the VPS without breaking email.  
**Rule:** No DNS changes without explicit approval of each record set.

## Pre-cutover inventory (do first)

In GoDaddy DNS for `pullertackle.com`, export/screenshot:

- All A / AAAA / CNAME  
- All MX  
- All TXT (SPF, DKIM, DMARC, verification)  
- Any NS or forwarding rules  

## Proposed website records (apply only after Stage B SSL works)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `129.121.168.106` | 600 (low during cutover) |
| A or CNAME | `www` | `129.121.168.106` or `@` | 600 |

## Proposed mail host record

| Type | Name | Value | Notes |
|------|------|-------|-------|
| A | `mail` | `129.121.168.106` | Needed for mail + Roundcube TLS |

## Email records (preserve / update carefully)

| Type | Name | Value | When |
|------|------|-------|------|
| MX | `@` | `mail.pullertackle.com` (10) | Only when Stage C accepts mail |
| TXT | `@` | SPF including `mx` / `a:mail...` | Align with final MTA |
| TXT | `default._domainkey` (or selector) | DKIM public | After DKIM key generated |
| TXT | `_dmarc` | `v=DMARC1; p=none; ...` | Start monitor mode |

## Safe cutover sequence

1. Keep existing MX untouched while building website.  
2. Test site via `/etc/hosts` or temporary hostname before apex A change.  
3. Lower TTL on apex/`www` 24h before cutover.  
4. Switch A records for `@` and `www`.  
5. Issue/renew Let's Encrypt certs.  
6. Only then migrate MX to self-hosted mail (if not already).  

## Rollback

Revert A/`www` to previous values from the GoDaddy export. Leave MX alone unless mail migration was the change being rolled back.
