import rawSnapshot from "@/data/dbSnapshot.json";

type Row = Record<string, any>;
type TableMap = Record<string, Row[]>;

const STORAGE_KEY = "dream_bakery_local_db_v2";
const SESSION_KEY = "dream_bakery_local_session_v1";

const RELATIONS: Record<string, Record<string, [string, string, string[]]>> = {
  products: {
    categories: ["categories", "category_id", ["id", "name", "name_en", "name_bn", "slug", "parent_id"]],
    brands: ["brands", "brand_id", ["id", "name"]],
  },
  orders: {
    order_statuses: ["order_statuses", "status_id", ["id", "name", "color"]],
  },
  order_items: {
    orders: ["orders", "order_id", ["id", "order_number", "customer_name", "customer_phone", "created_at", "status_id"]],
  },
  product_variants: {
    sizes: ["sizes", "size_id", ["id", "name", "value"]],
    colors: ["colors", "color_id", ["id", "name", "hex_code"]],
  },
  reviews: {
    products: ["products", "product_id", ["id", "name", "slug"]],
  },
};

let dbCache: TableMap | null = null;

function clone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

function getDb(): TableMap {
  if (dbCache) return dbCache;
  const base: TableMap = clone(rawSnapshot as TableMap);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        for (const k of Object.keys(parsed)) {
          if (Array.isArray(parsed[k])) {
            base[k] = parsed[k];
          }
        }
      }
    }
  } catch {
    // ignore storage errors
  }
  dbCache = base;
  return base;
}

function saveTable(table: string) {
  if (!dbCache) return;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    saved[table] = dbCache[table];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // ignore storage quota errors
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function attachRelations(db: TableMap, table: string, rows: Row[], selectStr: string): Row[] {
  const relConfig = RELATIONS[table];
  if (!relConfig) return rows;

  const result = rows.map((r) => ({ ...r }));
  for (const [relKey, [relTable, fk, cols]] of Object.entries(relConfig)) {
    if (!selectStr.includes(`${relKey}(`)) continue;
    const targetRows = db[relTable] || [];
    const byId = new Map<string, Row>();
    for (const tr of targetRows) {
      const picked: Row = {};
      for (const col of cols) {
        if (col in tr) picked[col] = tr[col];
      }
      byId.set(String(tr.id), picked);
    }
    for (const row of result) {
      const fkVal = row[fk];
      row[relKey] = fkVal != null ? byId.get(String(fkVal)) ?? null : null;
    }
  }
  return result;
}

function matchesFilter(row: Row, filter: { op: string; column: string; value?: any; operator?: string }): boolean {
  const colVal = row[filter.column];
  const fVal = filter.value;
  switch (filter.op) {
    case "eq":
      if (typeof colVal === "boolean" || typeof fVal === "boolean") {
        return Boolean(colVal) === Boolean(fVal);
      }
      return String(colVal ?? "") === String(fVal ?? "");
    case "neq":
      return String(colVal ?? "") !== String(fVal ?? "");
    case "is":
      return fVal === null ? colVal === null || colVal === undefined : colVal === fVal;
    case "not":
      if (filter.operator === "is" && fVal === null) {
        return colVal !== null && colVal !== undefined;
      }
      return colVal !== fVal;
    case "gte":
      return colVal >= fVal;
    case "lte":
      return colVal <= fVal;
    case "gt":
      return colVal > fVal;
    case "lt":
      return colVal < fVal;
    case "in":
      return Array.isArray(fVal) && fVal.map(String).includes(String(colVal));
    default:
      return true;
  }
}

function applyFiltersAndOrders(
  rows: Row[],
  filters: { op: string; column: string; value?: any; operator?: string }[] = [],
  orders: { column: string; ascending?: boolean }[] = [],
  limit?: number
): Row[] {
  let res = rows.filter((r) => filters.every((f) => matchesFilter(r, f)));
  if (orders.length > 0) {
    res = [...res].sort((a, b) => {
      for (const ord of orders) {
        const av = a[ord.column];
        const bv = b[ord.column];
        if (av === bv) continue;
        const asc = ord.ascending ?? true;
        if (av == null) return asc ? 1 : -1;
        if (bv == null) return asc ? -1 : 1;
        if (typeof av === "number" && typeof bv === "number") {
          return asc ? av - bv : bv - av;
        }
        return asc
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      }
      return 0;
    });
  }
  if (typeof limit === "number" && limit > 0) {
    res = res.slice(0, limit);
  }
  return res;
}

export function buildLocalChatReply(message: string): string {
  const db = getDb();
  const settingsMap: Record<string, string> = {};
  for (const r of db.site_settings || []) {
    settingsMap[r.key] = r.value ?? "";
  }
  const brand = settingsMap.brand_name || "Dream Bakery";
  const phone = settingsMap.site_phone || "01680310063";
  const msg = message.trim().toLowerCase();

  if (!msg) return "জি বলুন, কীভাবে সাহায্য করতে পারি? 🙂";

  if (/(hi|hello|hey|সালাম|আসসালামু|হাই|হ্যালো)/i.test(msg)) {
    return `আসসালামু আলাইকুম! 👋 ${brand}-এ স্বাগতম। কেক, পেস্ট্রি, ব্রেড নাকি অর্ডার নিয়ে জানতে চান?`;
  }
  if (/(ডেলিভারি|delivery|চার্জ|charge|শিপিং|shipping)/i.test(msg)) {
    const charges = (db.shipping_charges || []).filter((c) => c.is_active);
    const lines = ["ডেলিভারি চার্জ: 🚚"];
    for (const c of charges) {
      lines.push(`• ${c.area_name} — ৳${c.charge}`);
    }
    lines.push(`\nযেকোনো প্রয়োজনে কল বা WhatsApp করুন: 📞 ${phone}`);
    return lines.join("\n");
  }
  if (/(পেমেন্ট|payment|বিকাশ|bkash|নগদ|nagad|cod|ক্যাশ)/i.test(msg)) {
    return `পেমেন্ট যেভাবে করতে পারেন: 💳\n• ক্যাশ অন ডেলিভারি (COD) — পণ্য হাতে পেয়ে টাকা দিন\n• বিকাশ / নগদ\n\nযোগাযোগ: 📞 ${phone}`;
  }
  if (/(ক্যাটাগরি|category|কি কি আছে|সব পণ্য)/i.test(msg)) {
    const cats = (db.categories || []).filter((c) => c.is_active);
    const lines = ["আমাদের বেকারি ক্যাটাগরিগুলো: 🎂"];
    for (const c of cats) {
      lines.push(`• [${c.name}](/category/${c.slug})`);
    }
    return lines.join("\n");
  }

  const activeProducts = (db.products || []).filter((p) => p.is_active);
  const words = msg.split(/\s+/).filter((w) => w.length >= 2);
  const matched = activeProducts.filter((p) => {
    const hay = `${p.name || ""} ${p.name_en || ""} ${p.name_bn || ""} ${p.slug || ""}`.toLowerCase();
    return words.some((w) => hay.includes(w));
  }).slice(0, 5);

  const list = matched.length > 0 ? matched : activeProducts.slice(0, 5);
  const heading = matched.length > 0
    ? "জি, এই বেকারি আইটেমগুলো পাওয়া যাচ্ছে: 🥐"
    : "আমাদের জনপ্রিয় কিছু তাজা বেকারি আইটেম দেখুন: 🎂";
  const lines = [heading];
  for (const p of list) {
    lines.push(`• [${p.name}](/product/${p.slug}) — ৳${p.sale_price ?? p.base_price}`);
  }
  lines.push(`\nবিস্তারিত জানতে বা কাস্টম কেক অর্ডার করতে কল করুন: 📞 ${phone}`);
  return lines.join("\n");
}

export async function handleLocalApi(
  path: string,
  body?: any,
  method = "POST"
): Promise<{ data: any; error: any; count?: number | null }> {
  const db = getDb();

  // 1. GET /home
  if (path === "/home") {
    const activeProducts = applyFiltersAndOrders(
      db.products || [],
      [{ op: "eq", column: "is_active", value: true }],
      [{ column: "created_at", ascending: false }],
      400
    );
    const products = attachRelations(
      db,
      "products",
      activeProducts,
      "*, categories(name, name_en, name_bn, slug), brands(name)"
    );
    const categories = applyFiltersAndOrders(
      db.categories || [],
      [
        { op: "eq", column: "is_active", value: true },
        { op: "eq", column: "show_on_home", value: true },
        { op: "is", column: "parent_id", value: null },
      ],
      [{ column: "sort_order", ascending: true }]
    );
    const allCategories = applyFiltersAndOrders(
      db.categories || [],
      [{ op: "eq", column: "is_active", value: true }],
      [{ column: "sort_order", ascending: true }]
    );
    return {
      data: { products, categories, allCategories },
      error: null,
      count: null,
    };
  }

  // 2. POST /query/:table
  if (path.startsWith("/query/")) {
    const table = path.replace("/query/", "").split("?")[0];
    const tableRows = db[table] || [];
    const action = body?.action || "select";
    const selectStr = body?.select || "*";
    const filters = body?.filters || [];
    const orders = body?.orders || [];
    const limit = body?.limit;

    if (action === "select") {
      const matched = applyFiltersAndOrders(tableRows, filters, orders, limit);
      if (body?.head) {
        return { data: null, error: null, count: matched.length };
      }
      const withRel = attachRelations(db, table, matched, selectStr);
      if (body?.single || body?.maybeSingle) {
        return { data: withRel[0] ?? null, error: null, count: null };
      }
      return { data: withRel, error: null, count: withRel.length };
    }

    if (action === "insert") {
      const rawValues = Array.isArray(body?.values) ? body.values : [body?.values || {}];
      const now = new Date().toISOString();
      const inserted: Row[] = rawValues.map((r: Row) => ({
        id: r.id || uuid(),
        created_at: r.created_at || now,
        updated_at: r.updated_at || now,
        ...r,
      }));
      db[table] = [...tableRows, ...inserted];
      saveTable(table);
      const withRel = attachRelations(db, table, inserted, selectStr);
      return {
        data: withRel.length === 1 ? withRel[0] : withRel,
        error: null,
        count: withRel.length,
      };
    }

    if (action === "update") {
      const patch = body?.values || {};
      const now = new Date().toISOString();
      const updated: Row[] = [];
      db[table] = tableRows.map((row) => {
        if (filters.every((f: any) => matchesFilter(row, f))) {
          const next = { ...row, ...patch, updated_at: now };
          updated.push(next);
          return next;
        }
        return row;
      });
      saveTable(table);
      const withRel = attachRelations(db, table, updated, selectStr);
      return {
        data: withRel.length === 1 ? withRel[0] : withRel,
        error: null,
        count: withRel.length,
      };
    }

    if (action === "delete") {
      const before = tableRows.length;
      db[table] = tableRows.filter((row) => !filters.every((f: any) => matchesFilter(row, f)));
      saveTable(table);
      return { data: null, error: null, count: before - db[table].length };
    }
  }

  // 3. RPC
  if (path.startsWith("/rpc/")) {
    const rpcName = path.replace("/rpc/", "");
    if (rpcName === "get_email_by_phone") {
      const phone = body?._phone;
      const customer = (db.customers || []).find((c) => c.phone === phone);
      return { data: customer?.email ?? null, error: null };
    }
    return { data: null, error: null };
  }

  // 4. Coins endpoints
  if (path === "/coins/settings" || path === "/admin/coins/settings") {
    if (method === "POST" && body) {
      db.coin_settings = [{ ...(db.coin_settings?.[0] || {}), ...body }];
      saveTable("coin_settings");
    }
    const s = db.coin_settings?.[0] || {
      is_enabled: true,
      allow_checkout_redeem: true,
      allow_product_redeem: true,
      earn_coins_per_100: 5,
      redeem_coins_per_taka: 10,
      min_order_to_earn: 300,
      max_coins_per_order: 500,
      min_balance_to_redeem: 100,
      max_redeem_percent: 25,
      expiry_months: 6,
      cooling_days: 1,
      earn_on_discounted: true,
    };
    return {
      data: {
        ...s,
        tiers: (db.coin_tiers || []).filter((t) => t.is_active),
      },
      error: null,
    };
  }

  if (path === "/coins/quote") {
    const subtotal = Number(body?.subtotal || 0);
    const s = db.coin_settings?.[0];
    const per100 = Number(s?.earn_coins_per_100 ?? 5);
    const minOrder = Number(s?.min_order_to_earn ?? 300);
    const willEarn = subtotal >= minOrder ? Math.floor((subtotal / 100) * per100) : 0;
    return {
      data: {
        available: 0,
        max_coins: 0,
        max_discount: 0,
        min_balance_to_redeem: Number(s?.min_balance_to_redeem ?? 100),
        will_earn: willEarn,
      },
      error: null,
    };
  }

  if (path === "/coins/rewards" || path === "/admin/coins/rewards") {
    return { data: db.coin_reward_catalog || [], error: null };
  }

  if (path === "/coins/me") {
    const tiers = (db.coin_tiers || []).filter((t) => t.is_active);
    return {
      data: {
        available: 0,
        pending: 0,
        lifetime_earned: 0,
        lifetime_redeemed: 0,
        lifetime_expired: 0,
        taka_value: 0,
        tier: tiers[0] || null,
        next_tier: tiers[1] || null,
      },
      error: null,
    };
  }

  if (path.startsWith("/coins/me/transactions")) {
    return { data: [], error: null };
  }

  // 5. Coupons endpoints
  if (path === "/coupons/validate") {
    const code = String(body?.code || "").trim().toLowerCase();
    const subtotal = Number(body?.subtotal || 0);
    const coupon = (db.coupons || []).find(
      (c) => String(c.code || "").toLowerCase() === code && c.is_active
    );
    if (!coupon) {
      return { data: null, error: { message: "এই কুপন কোডটি সঠিক নয়।" } };
    }
    const min = Number(coupon.min_order_amount || 0);
    if (min > 0 && subtotal < min) {
      return {
        data: null,
        error: { message: `এই কুপন ব্যবহার করতে কমপক্ষে ৳${min} এর অর্ডার লাগবে।` },
      };
    }
    const type = String(coupon.discount_type || "").toLowerCase() === "fixed" ? "fixed" : "percentage";
    const val = Number(coupon.discount_value || 0);
    const discount = Math.min(subtotal, Math.round(type === "fixed" ? val : (subtotal * val) / 100));
    return {
      data: {
        code: coupon.code,
        discount_type: type,
        discount_value: val,
        min_order_amount: min,
        discount,
      },
      error: null,
    };
  }

  if (path === "/coupons/apply") {
    const orderId = body?.order_id;
    const code = String(body?.code || "").trim();
    const order = (db.orders || []).find((o) => String(o.id) === String(orderId));
    if (!order) {
      return { data: null, error: { message: "অর্ডার খুঁজে পাওয়া যায়নি।" } };
    }
    const check = await handleLocalApi("/coupons/validate", { code, subtotal: order.subtotal });
    if (check.error || !check.data) return check;
    const discount = check.data.discount;
    const newTotal = Math.max(
      0,
      Number(order.subtotal || 0) - discount + Number(order.delivery_charge || 0)
    );
    order.coupon_code = check.data.code;
    order.discount = discount;
    order.total = newTotal;
    saveTable("orders");
    return { data: { code: check.data.code, discount, total: newTotal }, error: null };
  }

  // 6. Auth endpoints
  if (path === "/auth/login") {
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const isAdmin =
      (email === "lotusmostafiz@gmail.com" && password === "1@#DremMart234@") ||
      (email === "admin@dreambakery.com" && password === "admin123");

    if (!email || !password) {
      return { data: null, error: { message: "Invalid credentials" } };
    }

    const user = {
      id: isAdmin ? "admin-local-1" : `user-${email}`,
      name: isAdmin ? "Admin" : email.split("@")[0],
      email,
      phone: body?.phone || null,
    };
    const role = isAdmin ? "admin" : "user";
    const session = {
      access_token: `local-token-${Date.now()}`,
      user,
      role,
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
    return { data: { session, user, role }, error: null };
  }

  if (path === "/auth/register") {
    const email = String(body?.email || "").trim().toLowerCase();
    const user = {
      id: uuid(),
      name: body?.full_name || email.split("@")[0],
      email,
      phone: body?.phone || null,
    };
    const role = "user";
    const session = {
      access_token: `local-token-${Date.now()}`,
      user,
      role,
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
    return { data: { session, user, role }, error: null };
  }

  if (path === "/auth/me") {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (saved?.user) {
        return { data: { user: saved.user, role: saved.role || "user" }, error: null };
      }
    } catch {
      // ignore
    }
    return {
      data: {
        user: { id: "admin-local-1", name: "Admin", email: "lotusmostafiz@gmail.com" },
        role: "admin",
      },
      error: null,
    };
  }

  if (path === "/auth/logout") {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    return { data: { ok: true }, error: null };
  }

  // 7. Chat
  if (path === "/chat") {
    return { data: { reply: buildLocalChatReply(String(body?.message || "")) }, error: null };
  }

  return { data: null, error: null };
}
