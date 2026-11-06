# PULLER Admin Panel — How to Use Guide

Complete guide for logging in and managing products, categories, inquiries, and settings in the PULLER CMS.

**Client Word handbook (branded A4):** [PULLER-Admin-Panel-Client-Handbook-A4.docx](./PULLER-Admin-Panel-Client-Handbook-A4.docx)  
Regenerate with: `node scripts/generate-admin-guide-docx.js`  
Note: login email/password are not included in the handbook (shared separately).

---

## 1. How to sign in

### Production (live site)

| Item | Value |
|------|--------|
| **Login URL** | https://fish-hook.mshahal350.workers.dev/management-portal |
| **Email** | `sales@pullertackle.com` |
| **Password** | `Pullertackle@#WDSS` (change under **Settings** after first login) |
| **Admin home** | https://fish-hook.mshahal350.workers.dev/admin |

### Local development

| Item | Value |
|------|--------|
| **Login URL** | http://localhost:3000/management-portal |
| **Email / password** | Same as production (if seeded with the same account) |
| **Admin home** | http://localhost:3000/admin |

### Important

- Use **`/management-portal`** only. The old path `/admin/login` redirects to the public homepage and will not show the login form.
- After a successful login you are redirected to **Dashboard** (`/admin`).
- Use **Logout** in the sidebar (or Settings) to end your session.

---

## 2. Admin layout overview

Left sidebar navigation:

| Menu item | What it does |
|-----------|----------------|
| **Dashboard** | Counts for products, categories, and new inquiries |
| **Products** | Create, edit, publish, delete, and drag-reorder products |
| **Categories** | Product menu categories and category page content |
| **Subcategories** | Nested groups under a category |
| **Dealers Inquiries** | Dealer application form submissions |
| **Contact Inquiries** | Contact form submissions |
| **Settings** | Change your admin password |

Also in the sidebar:

- **Dark / Light** toggle — preference is saved in the browser
- **Logout**

---

## 3. Dashboard

Shows live totals:

- Products (all) and Published products  
- Categories and Subcategories  
- New dealer inquiries and new contact inquiries  

Quick links open Categories, Subcategories, and inquiry lists. Use **Add product** to create a product immediately.

---

## 4. Products

**Path:** Admin → Products

### List page

- **Search** by name / terms  
- Filter by **category**, **subcategory**, and **status** (draft / published)  
- **Drag rows** to change display order on the public site  
- **Edit** or **Delete** each product  
- **Add product** opens the create form  

### Create or edit a product

1. Go to **Products** → **Add product** (or click Edit on a row).  
2. Fill in the fields below.  
3. Click **Create product** / **Update product**.  
4. Set **Status** to **Published** when the product should appear on the website. **Draft** stays hidden from public pages.

| Field | Purpose |
|-------|---------|
| **Product name** | Display name |
| **Slug** | URL-friendly id (auto-filled from name; keep unique per category) |
| **Description** | Short product copy |
| **Specifications** | One item per line |
| **Features** | One item per line |
| **Category** | Required parent category |
| **Subcategory** | Optional group under that category |
| **Status** | `draft` or `published` |
| **Display layout** | `horizontal` or `vertical` card layout |
| **Product image** | Path or upload (JPEG, PNG, WebP, GIF) |
| **Image alt text** | Accessibility text for the image |
| **Sort order** | Manual order number (drag-reorder on the list also updates this) |
| **CTA label** | Button text (default: Inquiry now) |
| **CTA link** | Button URL (default: `/dealers#apply`) |
| **Search terms** | Extra words to help search / matching |

### Tips

- Only **published** products show on category / subcategory pages and (when linked) in the Products menu.  
- Create the **category** (and subcategory if needed) before assigning a product.  
- Slug should stay stable once the product is live so public URLs do not break.

---

## 5. Categories

**Path:** Admin → Categories

Categories drive the **Products** dropdown in the site header and the category listing pages  
(`/products/[slug]`).

### Basics

| Field | Purpose |
|-------|---------|
| **Name** | Label in the menu and on the page |
| **Slug** | Used in the public URL |
| **Sort order** | Menu / list order |
| **Visible in navigation** | Uncheck to hide from the header menu |

### Products menu click (link target)

Choose where the menu item goes when clicked:

1. **Category page** — opens `/products/[slug]`  
2. **Choose existing product** — jumps to a product already in Products  
3. **Custom URL / section** — any path (`/contact`), full URL, `#section-id`, or bare home section id (e.g. `card-metal`)

### Category page sections

Each category page has three editable sections. For each, pick **Dark** or **Yellow** background.

#### Section 01 — Banner

- Subtitle, Heading, Description  
- Background image (used on Dark theme; Yellow uses solid brand yellow)

#### Section 02 — Intro

- Subtitle, Heading (blank heading uses the category name), Description  
- Right-side image

#### Section 03 — Products

- Subtitle, Heading, Description for the product list block  
- Products themselves are managed under **Products** (linked from this section after the category is saved)

### Workflow

1. Create the category and set visibility + menu link.  
2. Save.  
3. Add subcategories (if needed) and products under that category.  
4. Publish products so they appear on the public page.

---

## 6. Subcategories

**Path:** Admin → Subcategories

Use subcategories to group products under a parent category  
(public URL: `/products/[category]/[subcategory]`).

| Field | Purpose |
|-------|---------|
| **Name / Slug** | Label and URL segment |
| **Category** | Parent category (required) |
| **Description** | Page / intro copy |
| **Image / Banner image** | Optional media |
| **Visible** | Show or hide in navigation |
| **Sort order** | Order under the parent |
| **Menu link** | Same options as categories: own page, existing product, or custom URL/section |
| **Page title / lead** | Optional page headings |

---

## 7. Images

On product, category, and subcategory forms:

1. Paste an existing path (e.g. `/images/product-hooks.webp`), **or**  
2. Click **Upload image** and choose a file (JPEG, PNG, WebP, GIF).  
3. Preview appears under the field. Use **Clear** to remove.

**Production note:** Uploads go to disk (`public/uploads`). On Cloudflare Workers those files may not persist after redeploy. Prefer images already in `/images/` or a durable host (e.g. R2) for live media.

---

## 8. Dealers Inquiries

**Path:** Admin → Dealers Inquiries

Shows applications from the public **Dealers** form.

### What you can do

- **Search** by name, email, company, etc.  
- Filter by status: **New**, **In Progress**, **Completed**  
- **View** opens a detail modal with all submitted fields (company, contact, country, phone, address, postal code, city, website, interest, message, …)  
- Change status with the buttons in the modal  
- **Delete** removes the submission (asks for confirmation)

Suggested flow: New → In Progress while you reply → Completed when done.

---

## 9. Contact Inquiries

**Path:** Admin → Contact Inquiries

Same tools as dealers (search, status filter, view, status update, delete), for the public **Contact** form (name, email, company, topic, country, phone, message).

---

## 10. Settings (password)

**Path:** Admin → Settings

1. Enter **Current password**  
2. Enter **New password** (minimum 8 characters)  
3. Confirm the new password  
4. Click **Update password**

Use the new password the next time you sign in at `/management-portal`.

---

## 11. Recommended day-to-day workflow

```
1. Sign in at /management-portal
2. Check Dashboard for new dealer / contact inquiries
3. Open inquiries → View → update status → reply offline by email
4. To add a new product line:
   a. Categories → create / edit category (menu + page sections)
   b. Subcategories → add groups if needed
   c. Products → Add product → set Published
5. Open the public site and confirm the Products menu and pages look correct
6. Logout when finished
```

---

## 12. Public URLs affected by the CMS

| Public path | Driven by |
|-------------|-----------|
| Header **Products** dropdown | Visible categories / subcategories + their menu link settings |
| `/products/[category]` | Category + its published products |
| `/products/[category]/[subcategory]` | Subcategory + published products |
| Legacy `/products/flash-striker`, `/products/hooks` | Still supported for older links |
| `/dealers` form → Admin Dealers Inquiries | DealerInquiry records |
| `/contact` (and home contact form) → Admin Contact Inquiries | ContactInquiry records |

---

## 13. Troubleshooting

| Problem | What to try |
|---------|-------------|
| Login page blank / goes to homepage | Use `/management-portal`, not `/admin/login` |
| Login fails | Confirm email `sales@pullertackle.com` and current password; reset via seed only if you control the server env |
| “Server returned a web page instead of data” | Session expired — sign in again |
| Product missing on website | Status must be **Published**; category/subcategory should be **Visible** if you expect it in the menu |
| Menu goes to wrong place | Edit category/subcategory → **Products menu click goes to** |
| Image missing after deploy | Re-upload or use a path under `/images/` / durable storage |
| Cannot open `/admin` | You must be logged in; you will be redirected to `/management-portal` |

---

## 14. Security reminders

- Do not share the management-portal URL more widely than needed.  
- Change the setup password under **Settings** after first use.  
- Never commit real passwords into git or public docs in a shared repo long-term.  
- Logout on shared computers.

---

## Related developer docs

For install, database seed, Turso, and Cloudflare deploy, see [README-ADMIN.md](../README-ADMIN.md).
