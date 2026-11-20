# Dream Bazar — Category System Analysis Report

> **Scope:** Read‑only analysis. No project file was modified, created, deleted, renamed, or reformatted while producing this report (this report file is the only new file). This is a pre‑implementation study of the existing system and a plan for migrating to the new requested category structure.
>
> **Requested change (summary):** Keep everything else intact, but **remove the current live categories** (Crockeries, Ladies Bag, Mans Bag, Babys Toy, Gift Item, Watch, Lamp, Water Bottle, Perfume) and **replace them with a new set of main categories + subcategories** (Clothing, Sports, Watches, Gadgets, Cosmetics, Food & Organic, Healthcare & Supplements, Shoes, Electronics & Home Appliances, Bags — with 2‑ and 3‑level children).

---

## 1. Current Project Stack

### Frontend
| Item | Detail |
|---|---|
| Framework | **React 18.3** + **TypeScript 5.8** |
| Build tool | **Vite 5.4** (`@vitejs/plugin-react-swc`) |
| Routing | **react-router-dom 6.30** |
| Data fetching / cache | **@tanstack/react-query 5.83** |
| UI kit | **shadcn/ui** on **Radix UI** primitives + **Tailwind CSS 3.4** |
| Forms / validation | react-hook-form 7.61 + zod 3.25 |
| Rich text | TipTap 3 + react-quill |
| Icons | lucide-react |
| Package manager | npm / bun (both `package-lock.json` and `bun.lock` present) |
| Tests | Vitest 3 + Testing Library |
| Origin | Scaffolded by **Lovable** (`lovable-tagger` dev dependency) |

### Backend
| Item | Detail |
|---|---|
| Framework | **Laravel** (PHP, `artisan`, `composer.json`) |
| Auth | **Laravel Sanctum** (token in `localStorage` as `organic_api_token`) |
| DB | **MySQL/MariaDB** (XAMPP; dump file `client2_shop (2).sql`) |
| API style | **Generic Supabase‑compatible query gateway** (single `QueryController`) |
| Dev server | `php artisan serve` on `127.0.0.1:8001`, API base `…/api` |

### Frontend ⇄ Backend bridge (critical architectural fact)
There is **no real Supabase**. `src/integrations/supabase/client.ts` is a **hand‑written shim** that mimics the Supabase JS SDK (`.from(table).select().eq().order()…`) and translates every call into a POST to Laravel:

- `POST /api/query/{table}` → `QueryController@handle` (generic `select`/`insert`/`update`/`delete`)
- `GET  /api/home` → `QueryController@home` (cached storefront bootstrap payload)
- `POST /api/storage/{bucket}` → file upload
- plus auth, rpc, bkash, steadfast, smtp endpoints

**Implication:** the entire frontend talks to the DB through a thin generic table gateway. There is **no dedicated Category model/controller/service** — categories are just rows in the `categories` table accessed through the generic gateway. This makes the backend surface for this change **very small**.

---

## 2. Current Category System

### Where categories live
| Layer | Location | Role |
|---|---|---|
| **Database table** | `categories` (see §3) | Source of truth |
| **Schema migration** | `backend/database/migrations/2026_07_01_000000_create_organic_shop_tables.php` | Creates the table |
| **Data / seed migrations** | `2026_07_19_17xxxx_*` and `2026_07_19_19xxxx_*` | Seed & enforce the current live taxonomy + product assignments |
| **API** | `backend/app/Http/Controllers/Api/QueryController.php` | Generic CRUD + `home()` bootstrap + `products→categories` relation join |
| **Frontend read** | `src/integrations/supabase/client.ts` (shim) | All reads/writes |
| **Admin CRUD UI** | `src/pages/admin/CategoriesPage.tsx` | Create/edit/delete categories |
| **Static fallback data** | `src/data/mockData.ts` | Legacy hardcoded categories (ghee-oil, honey…) — **only used as fallback / for a few slug lookups**, not the live nav |
| **Static image map** | `src/lib/categoryImages.ts` (`categoryImageMap`) | Hardcoded slug→image fallbacks |
| **Static i18n map** | `src/context/LanguageContext.tsx` (`categoryTranslations`, `tCategory`) | Hardcoded slug→bn/en names for breadcrumbs |
| **State management** | React Query caches (`["nav-categories"]`, `["home-top-categories"]`) + local component state | No Redux/Zustand |

### Current live taxonomy (from the enforcement migrations)
Main (top‑level, `parent_id = null`, `show_on_home = true`, `show_in_navbar = true`):
`crockeries, ladies-bag, mans-bag, babys-toy, gift-item, watch, lamp, water-bottle, perfume`

Children of `watch`: `hand-watch, alarm-clock, wall-clock`

Everything else in the table was set to `is_active = false, show_in_navbar = false, show_on_home = false`.

> **The current structure is only 2 levels deep** (parent → child). The requested new structure is **3 levels deep** (Clothing → Men → T‑Shirt). This is the single most important gap — see §6.

---

## 3. Existing Database Structure

### `categories` table
```php
$table->uuid('id')->primary();
$table->text('name');                       // legacy single name
$table->string('slug')->unique();
$table->text('image_url')->nullable();
$table->uuid('parent_id')->nullable();      // ✅ hierarchy supported
$table->integer('sort_order')->default(0);  // ✅ sort order supported
$table->boolean('is_active')->default(true);
$table->boolean('show_in_navbar')->default(false);
$table->boolean('show_on_home')->default(false);
$table->timestamps();
// + name_en, name_bn added by 2026_07_09_095037_add_bilingual_columns_to_tables.php
```

**Supported out of the box:** `slug` (unique), `image_url`, `is_active` (status), `sort_order`, `parent_id` (self‑referencing hierarchy), navbar/home visibility flags, and bilingual `name_en` / `name_bn`.

### `products` table (category‑relevant columns)
```php
$table->uuid('id')->primary();
$table->uuid('category_id')->nullable();    // ⚠️ SINGLE category only
$table->uuid('brand_id')->nullable();
// … name, name_en, name_bn, slug, base_price, sale_price, stock_quantity, images(json) …
```

- **No `product_category` pivot table exists.** A product belongs to **exactly one** category via `category_id` (nullable).
- No foreign‑key constraints are declared (`category_id` is a bare `uuid`); referential integrity is enforced only in application logic.

### Relation wiring in the API
`QueryController::$relations['products']['categories']` joins `products.category_id → categories.id` and returns `['id','name','name_en','name_bn','slug','parent_id']`. So a product row can expose its category (and the category's `parent_id`) in one call.

---

## 4. Existing Category‑Related Files

### Backend
| File | Purpose |
|---|---|
| `database/migrations/2026_07_01_000000_create_organic_shop_tables.php` | `categories` + `products` schema |
| `database/migrations/2026_07_09_095037_add_bilingual_columns_to_tables.php` | `name_en` / `name_bn` |
| `database/migrations/2026_07_19_170000_fix_storefront_product_categories.php` | product↔category cleanup |
| `database/migrations/2026_07_19_171000_set_storefront_category_images.php` | category images |
| `database/migrations/2026_07_19_172000_enforce_requested_category_structure.php` | **current live taxonomy enforcement** |
| `database/migrations/2026_07_19_173000_preserve_categories_and_product_assignments.php` | idempotent seed of current categories + product assignments |
| `database/migrations/2026_07_19_190000_add_products_to_empty_fashion_categories.php` | fills empty categories |
| `database/migrations/2026_07_19_191000_normalize_fashion_category_images.php` | image normalization |
| `app/Http/Controllers/Api/QueryController.php` | generic gateway + `home()` + relations |
| `routes/api.php` | route table |

> **Note:** There is **no `Category.php` Eloquent model** and **no `CategoryController`.** Only 3 models exist (`User`, `BkashSetting`, `SmtpSetting`). Everything else is table‑driven through `QueryController`.

### Frontend
| File | Role in category system |
|---|---|
| `src/components/Header.tsx` | **Desktop nav bar + hover dropdown + mobile accordion menu** (reads `["nav-categories"]`) |
| `src/components/TopCategories.tsx` | **Homepage "Top Categories" carousel/marquee** (`show_on_home`, top‑level only) |
| `src/pages/Index.tsx` | **Homepage category‑wise product sections** (`home()` payload) |
| `src/pages/CategoryPage.tsx` | **Shop / category listing page** (`/category/:slug`) + subcategory chips + product grid |
| `src/pages/CategoriesPage.tsx` | **Public "all categories" page** with product counts |
| `src/pages/ProductDetail.tsx` | **Breadcrumb** (category link) |
| `src/components/AnimatedSearch.tsx` | Product search (searches products, **not** categories) |
| `src/components/Footer.tsx` | Category links in footer |
| `src/components/MobileBottomNav.tsx` | Bottom nav (category entry) |
| `src/pages/admin/CategoriesPage.tsx` | **Admin category CRUD** |
| `src/components/admin/CategoryImageUpload.tsx` | Category image uploader |
| `src/pages/admin/ProductCreatePage.tsx` / `ProductEditPage.tsx` | **Product ↔ category/subcategory selector** |
| `src/lib/categoryImages.ts` | `getCategoryImage(slug, url)` + hardcoded `categoryImageMap` |
| `src/context/LanguageContext.tsx` | `tCategory(slug, fallback)` + hardcoded `categoryTranslations` |
| `src/data/mockData.ts` | Legacy static categories (fallback) |

### Routes (`src/App.tsx`)
- `/category/:slug` → `CategoryPage`
- `/categories` → public `CategoriesPage`
- `/product/:slug` (or id) → `ProductDetail`
- `/admin/categories` → admin `CategoriesPage`
- `/admin/products/*` → product create/edit
- Search is inline (no dedicated `/search` route)

---

## 5. Existing Product ↔ Category Relationship

| Question | Answer |
|---|---|
| One category per product? | **Yes** — single `products.category_id`. |
| Multiple categories per product? | **No** — no pivot table, no `products.categories[]`. |
| Can a product sit in a subcategory? | **Yes** — `category_id` can point at any category row, including a child. |
| Can a product sit in a 3rd‑level (grandchild) category? | **Data model: yes** (any uuid). **Admin UI: no** (see §6). |
| How child products roll up to parent listings | Frontend does it **manually**: `CategoryPage` and `Index` collect `[parentId, ...directChildIds]` and query `category_id IN (...)`. **Only one level of children is collected** — grandchildren are missed. |

**Product‑assignment logic (ProductCreate/Edit):**
```
category_id = form.sub_category_id || form.category_id || null
```
i.e. if a subcategory is picked, the product is stored against the **subcategory**; otherwise against the top‑level category. Editing resolves a stored subcategory back to its parent for display.

---

## 6. Problems & Limitations (for the requested change)

1. **3‑level depth is not fully supported by the current code (biggest issue).** The new structure needs `Clothing → Men → T‑Shirt`. Today:
   - **Admin `CategoriesPage.tsx`**: the Parent dropdown only lists **top‑level** categories (`categories.filter(c => !c.parent_id)`). You **cannot** set a category's parent to a subcategory, so **a 3rd level cannot be created from the UI.**
   - **`ProductCreatePage` / `ProductEditPage`**: only **2 selectors** (category + subcategory). A product **cannot be assigned to a grandchild** (e.g. can't pick `T‑Shirt` under `Men` under `Clothing`).
   - **`CategoryPage.tsx`**: fetches **direct children only**. Opening `Clothing` collects `Clothing + Men/Women/Baby` but **not** `T‑Shirt…`, so products stored on a grandchild **won't appear** on the top‑level page.
   - **`Index.tsx` homepage sections**: `subCatMap` rolls up **one level only** — same grandchild blind spot.
   - **`Header.tsx` dropdown**: renders parent → direct children only (flat dropdown, no nested/mega‑menu columns). Grandchildren won't show in the menu.
   - **Admin list nesting** (`sortedCategories`) only nests parent→child (one level) for display.

2. **Single‑category products.** If any product legitimately belongs to multiple new categories, the model can't express it without a pivot table (out of scope unless requested).

3. **Hardcoded slug maps.** `categoryImageMap` (`categoryImages.ts`) and `categoryTranslations` (`LanguageContext.tsx`) key off old slugs. New slugs simply fall through to DB `image_url` / `name_en`/`name_bn` — **not broken**, but new categories get no static fallback image and breadcrumb i18n relies on DB names.

4. **No FK / cascade.** Deleting a category does not null out or reassign `products.category_id`; orphaned products would keep a dangling `category_id` and disappear from listings.

5. **Slug uniqueness collisions.** New structure has repeated leaf names (`Shoes → Men/Women/Baby` **and** `Clothing → Men/…`, plus `Baby Shoes`, `Running Shoes` in Sports vs `Shoes`). Slugs are globally unique, so children need **scoped slugs** (e.g. `clothing-men`, `shoes-men`, `sports-running-shoes`) to avoid collisions.

6. **Caching lag.** `home()` is cached 30s (`storefront_home_data_v2`), nav categories 30s, top categories 5min. After migration, expect up to a few minutes before all surfaces reflect changes (cache clear recommended).

7. **Legacy `mockData.ts` fallback** still references old organic slugs; low risk but worth leaving intact (it's only a fallback).

---

## 7. Required Database Changes

**Schema:** essentially **none required** — `categories` already has `parent_id`, `slug`, `image_url`, `is_active`, `sort_order`, `show_in_navbar`, `show_on_home`, `name_en`, `name_bn`. The hierarchy column already supports arbitrary depth.

**Optional (recommended) schema hardening:**
- Add an index on `categories.parent_id` (faster tree queries) — optional.
- (Only if multi‑category is ever requested) add a `product_categories` pivot — **out of scope now.**

**Data changes (the real work) — one new idempotent migration** that:
1. Deactivates / removes the 9 current live categories + `watch` children (set `is_active=false`, or delete — see §11 for the safe choice).
2. Inserts the new 3‑level taxonomy with **collision‑safe slugs**, correct `parent_id`, `sort_order`, `name_en`/`name_bn`, and `show_in_navbar` / `show_on_home` flags.
3. Reassigns existing products' `category_id` to appropriate new categories (or a safe fallback) so no product is orphaned.

Proposed slug scheme (collision‑safe):
```
clothing, clothing-men, clothing-men-tshirt, clothing-men-lungi, clothing-men-shirt,
clothing-men-pants, clothing-men-jackets, clothing-women, clothing-women-salwar-kameez,
clothing-women-burqa, clothing-women-night-dress, clothing-women-three-piece,
clothing-baby, clothing-baby-newborn-set, clothing-baby-shoes, clothing-baby-feeding-bottle,
clothing-baby-toys, clothing-baby-dress,
sports, sports-jersey, sports-trousers, sports-sneakers, sports-running-shoes,
watches, gadgets, cosmetics, food-organic, healthcare-supplements,
shoes, shoes-men, shoes-women, shoes-baby,
electronics-home-appliances, bags
```

---

## 8. Required Backend Changes

The generic `QueryController` already supports everything the frontend needs for N‑level categories (it returns `parent_id` in the category relation). Concretely:

1. **New data migration** (as in §7) — the only mandatory backend change.
2. **`QueryController::home()`** — currently only rolls up one level of children for homepage sections. To support grandchildren on homepage, extend the roll‑up to walk the full subtree (or accept that homepage sections show only direct‑child products). **Low‑risk, optional.**
3. **Cache busting** — after migration, `php artisan cache:clear` (clears `storefront_home_data_v2`, nav/top caches) so surfaces refresh immediately.
4. No new model/controller/route strictly required (generic gateway covers CRUD). A dedicated `Category` model is **optional polish**, not needed.

---

## 9. Required Frontend Changes

To fully support **3 levels**, update these (in priority order):

1. **`src/pages/admin/CategoriesPage.tsx`** — allow selecting **any** category as a parent (not just top‑level), so a 3rd level can be created; update the list rendering (`sortedCategories`) to nest recursively (parent → child → grandchild).
2. **`src/pages/admin/ProductCreatePage.tsx` & `ProductEditPage.tsx`** — add a **third (grandchild) selector**, or replace the fixed 2‑select UI with a **recursive/cascading category picker**; keep the `category_id = deepest_selected || … || null` logic. Update the edit‑resolve logic to walk up the full ancestor chain.
3. **`src/pages/CategoryPage.tsx`** — collect the **entire descendant subtree** of the opened category (recursive, not just direct children) before the `category_id IN (...)` product query, and render nested subcategory chips.
4. **`src/pages/Index.tsx`** — make `subCatMap` roll‑up **recursive** so homepage category sections include grandchild products.
5. **`src/components/Header.tsx`** — decide desktop UX: keep the current flat dropdown (shows direct children only) or upgrade to a **nested/mega‑menu** that also lists grandchildren; update mobile accordion to expand a second level. (Functional minimum: current 2‑level dropdown still works; grandchildren reachable via the category page.)
6. **`src/components/TopCategories.tsx`** and **public `src/pages/CategoriesPage.tsx`** — no structural change needed (top‑level driven), but verify counts include the full subtree.
7. **`src/lib/categoryImages.ts`** — optionally add new slugs to `categoryImageMap` (otherwise DB `image_url` / placeholder is used).
8. **`src/context/LanguageContext.tsx`** — optionally add new slugs to `categoryTranslations` (otherwise DB `name_en`/`name_bn` is used, which is fine).

> **Categories without subcategories (Watches, Gadgets, Cosmetics, Food & Organic, Healthcare & Supplements, Electronics & Home Appliances, Bags) continue to work unchanged** — the existing code already handles a category with zero children (dropdown/chips simply don't render).

---

## 10. Admin Dashboard Changes

| Area | Current | Needed for new structure |
|---|---|---|
| Category CRUD (`admin/CategoriesPage.tsx`) | Create/edit/delete; toggle `is_active`, `show_in_navbar`, `show_on_home`; set `sort_order`, image, `name_en`/`name_bn`, parent (**top‑level parents only**) | Allow **any** category as parent (enable 3rd level); recursive nested list display |
| Product category assignment (`ProductCreate/Edit`) | 2 selects: category + subcategory | Add 3rd‑level select or cascading picker; resolve full ancestor chain on edit |
| Bulk reassignment | none | (Nice‑to‑have) a way to move products between categories in bulk during migration |

Existing CRUD is otherwise **complete**: image upload, slug auto‑generation, bilingual names, status/navbar/home toggles, sort order, and delete‑with‑confirm all work today.

---

## 11. Existing Product Migration Strategy

**Goal:** don't lose or hide any existing product.

1. **Prefer deactivate over delete** for old categories. Setting old categories `is_active=false` (as prior migrations already did) keeps their rows and any product still pointing at them recoverable. **Hard‑deleting** old categories would leave products with a dangling `category_id` (they vanish from listings). If deletion is required, **reassign products first**.
2. **Explicit remap table.** Before touching anything, snapshot `SELECT id, name, slug, category_id FROM products`. Build a mapping from each old category → a new category (best semantic fit), e.g. old `watch/hand-watch/alarm-clock/wall-clock → Watches`; bags → `Bags`; toys → `Clothing → Baby → Toys`; etc. Products with no clear home go to a safe fallback (e.g. a top‑level new category or an "Uncategorized"/`is_active` kept but flagged) — **never left dangling**.
3. **Idempotent migration** (follow the existing pattern in `2026_07_19_173000_*`): `updateOrInsert` by slug, wrap in `DB::transaction`, and only update `category_id` on products (leave price/stock/visibility untouched).
4. **Verify count parity:** number of active products before == after; zero products with a `category_id` that no longer exists.
5. **Clear caches** so the storefront reflects the new tree.

---

## 12. Exact Files That Need Modification

**Backend (create 1 new file):**
- `backend/database/migrations/2026_07_2x_xxxxxx_replace_category_structure.php` *(new — remove old, insert new 3‑level tree, remap products)*
- *(optional)* `backend/app/Http/Controllers/Api/QueryController.php` — recursive subtree roll‑up in `home()`

**Frontend (edit existing):**
- `src/pages/admin/CategoriesPage.tsx` — parent selection + recursive list
- `src/pages/admin/ProductCreatePage.tsx` — 3rd‑level / cascading selector
- `src/pages/admin/ProductEditPage.tsx` — 3rd‑level / cascading selector + ancestor resolve
- `src/pages/CategoryPage.tsx` — recursive descendant product query
- `src/pages/Index.tsx` — recursive `subCatMap` roll‑up
- `src/components/Header.tsx` — nested desktop dropdown + 2‑level mobile menu *(optional UX upgrade)*
- `src/lib/categoryImages.ts` — new slug images *(optional)*
- `src/context/LanguageContext.tsx` — new slug translations *(optional)*

**No change needed:** `TopCategories.tsx`, public `CategoriesPage.tsx`, `Footer.tsx`, `AnimatedSearch.tsx`, `ProductDetail.tsx` breadcrumb, `client.ts` shim, `categories` table schema.

---

## 13. Step‑by‑Step Implementation Plan

1. **Backup** the DB (`mysqldump` / copy `client2_shop (2).sql`) and note current product↔category counts.
2. **Finalize the remap table** (old category → new category for every existing product).
3. **Write the data migration** (`replace_category_structure`): insert the new 3‑level tree with collision‑safe slugs, set flags/sort/images/bilingual names, remap product `category_id`, deactivate old categories.
4. **Run** `php artisan migrate` then `php artisan cache:clear`.
5. **Verify data**: every new category exists with correct `parent_id`; no product has a dangling `category_id`; active‑product count unchanged.
6. **Admin frontend**: enable arbitrary parent selection + recursive list in `admin/CategoriesPage.tsx`; add 3rd‑level product selector in ProductCreate/Edit.
7. **Storefront frontend**: make `CategoryPage.tsx` and `Index.tsx` roll‑up recursive so grandchild products surface.
8. **Header UX**: upgrade dropdown/mobile menu to show the second child level (optional but expected for a clean menu).
9. **QA** using §15 checklist across desktop + mobile + admin.
10. **Optional polish**: add new slugs to `categoryImageMap` and `categoryTranslations`.
11. **Deploy**: rebuild frontend (`npm run build`), push backend, run migration + `cache:clear` on the server.

---

## 14. Risk & Rollback Plan

| Risk | Likelihood | Mitigation |
|---|---|---|
| Products orphaned by deleted categories | High if old cats deleted | Reassign product `category_id` **before** removing old categories; prefer deactivate over delete |
| Slug collisions (duplicate leaf names) | High | Use scoped slugs (`clothing-men`, `shoes-men`, `sports-running-shoes`…) |
| Grandchild products invisible in listings/menu | High (current code) | Make roll‑ups recursive (`CategoryPage`, `Index`, header) |
| Can't create 3rd level from admin | High (current code) | Fix parent selector in `admin/CategoriesPage.tsx` |
| Stale caches after migration | Medium | `php artisan cache:clear`; caches self‑expire in 30s–5min |
| Breaking existing product/order data | Low | Migration only touches `categories` rows + `products.category_id`; wrap in `DB::transaction`; leave price/stock/orders untouched |
| Old i18n/image maps missing new slugs | Low (cosmetic) | DB `name_en`/`name_bn` + `image_url` already used as fallback; add map entries optionally |

**Rollback:** migration `down()` (or a paired revert migration) restores old categories from the retained deactivated rows / DB backup and re‑applies the previous `category_id` values from the pre‑migration snapshot. Because old category rows are **deactivated, not destroyed** (recommended), rollback is a flag flip + product `category_id` restore. Frontend changes are reverted via git.

---

## 15. Testing Checklist

**Data / backend**
- [ ] All 10 main categories exist, `parent_id = null`, correct `sort_order`.
- [ ] All Clothing/Sports/Shoes children & grandchildren exist with correct `parent_id`.
- [ ] All slugs unique; no collisions.
- [ ] No product has a `category_id` pointing to a non‑existent/inactive category.
- [ ] Active‑product count == pre‑migration count (nothing lost/hidden).
- [ ] `php artisan cache:clear` run; `/api/home` returns new tree.

**Storefront**
- [ ] Desktop nav shows the 10 new main categories.
- [ ] Hover dropdown shows children (Clothing → Men/Women/Baby, Sports → …, Shoes → Men/Women/Baby).
- [ ] Second‑level children reachable (Clothing → Men → T‑Shirt) via menu and/or category page.
- [ ] Mobile menu expands categories & subcategories.
- [ ] `/category/clothing` shows products from Clothing **and all descendants**.
- [ ] `/category/watches` (a childless category) shows its products with no empty subcategory bar.
- [ ] Homepage "Top Categories" shows selected `show_on_home` categories.
- [ ] Homepage category‑wise sections populate (incl. grandchild products).
- [ ] Product detail breadcrumb links to the correct category.
- [ ] Public `/categories` page shows correct product counts (full subtree).
- [ ] Product search still returns products.

**Admin**
- [ ] Create a category and set its parent to a **subcategory** (3rd level) — succeeds.
- [ ] Category list shows correct nested indentation for all 3 levels.
- [ ] Toggle `is_active` / `show_in_navbar` / `show_on_home` / `sort_order` / image — persists and reflects on storefront.
- [ ] Product create: assign a product to a **grandchild** category — persists.
- [ ] Product edit: existing product's category/subcategory/grandchild resolves correctly in the selectors.
- [ ] Delete a category prompts confirmation and does not orphan products (or is blocked when products exist).

---

### Bottom line
The **data model already supports** unlimited category depth, slugs, images, status, sort order, navbar/home flags, and bilingual names — so **no schema change is required**. The work is: **(a) one idempotent data migration** to swap the taxonomy and safely remap products, and **(b) making the admin UI and a few storefront roll‑ups recursive** so the **3rd level (Clothing → Men → T‑Shirt)** is creatable and visible. Childless categories keep working with zero extra effort. Prefer **deactivate + remap over hard delete** to guarantee no existing product is lost.

*No implementation performed. Analysis only — stopping here as requested.*
