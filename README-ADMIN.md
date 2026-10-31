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

Passwords are stored only as bcrypt hashes in SQLite (`prisma/dev.db`).

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
