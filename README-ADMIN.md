# PULLER Admin CMS

**End-user how-to (login, products, categories, inquiries):**  
→ **[docs/ADMIN-USER-GUIDE.md](docs/ADMIN-USER-GUIDE.md)**

**Production hosting:** VPS (Nginx + PM2 + Next.js) — see [docs/DEPLOYMENT-ARCHITECTURE.md](docs/DEPLOYMENT-ARCHITECTURE.md).  
**Default database:** **MySQL** via `DATABASE_URL` (local XAMPP for dev; **existing SQL on the VPS** for production).

---

## Quick start (developers)

1. Copy `.env.example` to `.env`
2. Ensure MySQL is running and database `puller_hooks` exists (or match your `DATABASE_URL`)
3. Set `AUTH_SECRET`, and first-time `ADMIN_SETUP_*` if seeding

```bash
npm install
npm run db:setup   # prisma db push + seed (needs ADMIN_SETUP_PASSWORD the first time)
npm run dev
```

- Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)  
- Login: [http://localhost:3000/management-portal](http://localhost:3000/management-portal)

### First-time admin account

1. Copy `.env.example` to `.env`
2. Set a strong `AUTH_SECRET` (16+ characters)
3. Set `ADMIN_SETUP_EMAIL` and `ADMIN_SETUP_PASSWORD`
4. Run `npm run db:seed`
5. Remove `ADMIN_SETUP_PASSWORD` from `.env` after seeding
6. Sign in at `/management-portal` and change the password under **Settings** before production use

Passwords are stored only as bcrypt hashes in MySQL.

### Env (default)

```bash
DATABASE_URL="mysql://root@127.0.0.1:3306/puller_hooks"
AUTH_SECRET="generate-a-long-random-secret"
```

Production uses the **same** Prisma MySQL path — point `DATABASE_URL` at the VPS’s existing MySQL database. Do not use Turso/Cloudflare as the production default.

## Legacy (not production default)

OpenNext / Wrangler / Turso scripts remain in the repo for experiments only. **Do not** run `npm run deploy` / `cf:deploy` for pullertackle.com VPS hosting. Uploads need disk persistence on the Node host.

## Admin sections (summary)

1. **Dashboard** – counts  
2. **Products** – CRUD, publish/draft, horizontal/vertical layout, drag reorder  
3. **Categories** – nav categories, page sections, themes, menu link targets  
4. **Subcategories** – nested under categories  
5. **Dealers Inquiries** – form submissions  
6. **Contact Inquiries** – form submissions  
7. **Settings** – change password  

Full step-by-step instructions: [docs/ADMIN-USER-GUIDE.md](docs/ADMIN-USER-GUIDE.md).

## Public routes

- `/products/[category]` – category listing  
- `/products/[category]/[subcategory]` – subcategory listing  
- `/products/flash-striker` – Flash Striker (legacy URL kept)  
- `/products/hooks` – Hooks (legacy URL kept)  

Published products appear automatically on their category/subcategory pages and in the Products dropdown when the category/subcategory is visible.
