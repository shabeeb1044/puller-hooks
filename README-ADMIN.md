# PULLER Admin CMS

## Quick start

```bash
npm install
npm run db:setup   # migrate + seed (needs ADMIN_SETUP_PASSWORD in .env the first time)
npm run dev
```

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

### First-time admin account

1. Copy `.env.example` to `.env`
2. Set a strong `AUTH_SECRET` (16+ characters)
3. Set `ADMIN_SETUP_EMAIL` and `ADMIN_SETUP_PASSWORD`
4. Run `npm run db:seed`
5. Remove `ADMIN_SETUP_PASSWORD` from `.env` after seeding
6. Sign in at `/admin/login` and change the password under **Settings** before production use

Passwords are stored only as bcrypt hashes (local SQLite or Turso).

## Turso (free remote SQLite)

When both `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set, the app uses Turso at runtime. Local `DATABASE_URL=file:./dev.db` is still used for `prisma migrate`.

```bash
# 1) Create / migrate schema locally
npm run db:migrate

# 2) Push the same SQL to Turso
npm run db:push:turso

# 3) Seed Turso (uses Turso when env vars are set)
# Set ADMIN_SETUP_PASSWORD in .env first
npm run db:seed
```

## Cloudflare deploy (OpenNext Workers)

OpenNext/workerd often crashes on native Windows (`MiniflareCoreError` / access violation). Prefer WSL for local preview, or deploy with the Windows-safe script below (skips local workerd).

```bash
npx wrangler login
npx wrangler secret put TURSO_DATABASE_URL
npx wrangler secret put TURSO_AUTH_TOKEN
npx wrangler secret put AUTH_SECRET

# Build + upload (does not start local miniflare)
npm run deploy
```

Worker URL example: `https://fish-hook.<your-subdomain>.workers.dev`  
Admin login: `/management-portal` on that Worker URL (not the old static Pages preview).

Optional: update [VC++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist) if `wrangler`/`preview` still crashes locally.

**Note:** Admin image uploads write to `public/uploads` on disk. That does not persist on Cloudflare Workers — use Cloudflare R2 (or keep uploads on a Node host) for production media.

## Admin sections

1. **Dashboard** – counts
2. **Products** – CRUD, publish/draft, horizontal/vertical layout, drag reorder
3. **Categories** – nav categories, visibility, order
4. **Subcategories** – nested under categories
5. **Dealers Inquiries** – form submissions
6. **Contact Inquiries** – form submissions
7. **Settings** – change password

## Public routes

- `/products/[category]` – category listing
- `/products/[category]/[subcategory]` – subcategory listing
- `/products/flash-striker` – Flash Striker (legacy URL kept)
- `/products/hooks` – Hooks (legacy URL kept)

Published products appear automatically on their category/subcategory pages and in the Products dropdown when the category/subcategory is visible.
