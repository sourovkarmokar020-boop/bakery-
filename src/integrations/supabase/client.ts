const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

type Filter = { op: string; column: string; value?: unknown; operator?: string };
type Order = { column: string; ascending?: boolean };

export type CoinSettings = {
  is_enabled: boolean;
  allow_checkout_redeem: boolean;
  allow_product_redeem: boolean;
  earn_coins_per_100: number;
  redeem_coins_per_taka: number;
  min_order_to_earn: number;
  max_coins_per_order: number | null;
  min_balance_to_redeem: number;
  max_redeem_percent: number;
  expiry_months: number | null;
  cooling_days: number;
  earn_on_discounted: boolean;
};

export type AppliedCoupon = {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  discount: number;
};

export type CoinTier = {
  id: string;
  name: string;
  name_bn: string | null;
  min_lifetime_coins: number;
  multiplier: number;
  color: string;
  benefits: string | null;
  is_active: boolean;
};

export type CoinBalance = {
  available: number;
  pending: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
  lifetime_expired: number;
  taka_value: number;
  tier: CoinTier | null;
  next_tier: CoinTier | null;
};

const tokenStore = {
  get: () => localStorage.getItem("organic_api_token"),
  set: (token?: string) => token ? localStorage.setItem("organic_api_token", token) : localStorage.removeItem("organic_api_token"),
};

async function api(path: string, body?: unknown, method = "POST", timeoutMs?: number) {
  const headers: HeadersInit = { Accept: "application/json" };
  if (!(body instanceof FormData)) headers["Content-Type"] = "application/json";
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = timeoutMs ? new AbortController() : undefined;
  const timeout = timeoutMs ? window.setTimeout(() => controller?.abort(), timeoutMs) : undefined;
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal: controller?.signal,
    });
  } finally {
    if (timeout !== undefined) window.clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { data: null, error: payload };
  }

  // "data" key থাকলে সেটাই ফেরত যায় — null হলেও। আগে `payload.data ?? payload` করায়
  // data:null হলে পুরো payload object (truthy!) ফিরত, ফলে maybeSingle() এ "পাওয়া যায়নি" ধরা পড়ত না
  const hasDataKey = payload && typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "data");
  return { data: hasDataKey ? payload.data : payload, error: null, count: payload.count ?? null };
}

class QueryBuilder {
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private selected = "*";
  private action: "select" | "insert" | "update" | "delete" | null = null;
  private values: unknown;
  private wantsSingle = false;
  private wantsMaybeSingle = false;
  private head = false;
  private limitValue?: number;

  constructor(private table: string) {}

  select(columns = "*", options?: { count?: string; head?: boolean }) {
    this.action ||= "select";
    this.selected = columns;
    this.head = !!options?.head;
    return this;
  }

  insert(values: unknown) {
    this.action = "insert";
    this.values = values;
    return this;
  }

  update(values: unknown) {
    this.action = "update";
    this.values = values;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ op: "eq", column, value });
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push({ op: "neq", column, value });
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push({ op: "is", column, value });
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    this.filters.push({ op: "not", column, operator, value });
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push({ op: "gte", column, value });
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push({ op: "lte", column, value });
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push({ op: "in", column, value: values });
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending ?? true });
    return this;
  }

  single() {
    this.wantsSingle = true;
    return this.execute();
  }

  maybeSingle() {
    this.wantsMaybeSingle = true;
    return this.execute();
  }

  then<TResult1 = Awaited<ReturnType<QueryBuilder["execute"]>>, TResult2 = never>(
    onfulfilled?: ((value: Awaited<ReturnType<QueryBuilder["execute"]>>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private execute() {
    return api(`/query/${this.table}`, {
      action: this.action || "select",
      select: this.selected,
      values: this.values,
      filters: this.filters,
      orders: this.orders,
      single: this.wantsSingle,
      maybeSingle: this.wantsMaybeSingle,
      head: this.head,
      limit: this.limitValue,
    });
  }
}

function authUser(session: any) {
  const user = session?.user;
  if (!user) return null;
  return { ...user, user_metadata: { full_name: user.name, phone: user.phone } };
}

export const supabase = {
  from: (table: string) => new QueryBuilder(table),
  home: {
    getData: () => api("/home", undefined, "GET", 8000),
  },
  rpc: (name: string, params: Record<string, unknown>) => api(`/rpc/${name}`, params),
  admin: {
    createUser: (payload: { name?: string; email: string; phone?: string; password: string; role?: string }) =>
      api("/admin/users", payload),
    setUserRole: (userId: string | number, role: string) => api(`/admin/users/${userId}/role`, { role }, "PUT"),
  },
  bkash: {
    getSettings: () => api("/admin/bkash", undefined, "GET"),
    saveSettings: (payload: { app_key?: string; app_secret?: string; username?: string; password?: string; mode: string; is_active: boolean }) =>
      api("/admin/bkash", payload),
    createPayment: (orderId: string, callbackUrl: string) =>
      api("/bkash/create", { order_id: orderId, callback_url: callbackUrl }),
    executePayment: (paymentId: string) => api("/bkash/execute", { payment_id: paymentId }),
  },
  courier: {
    getSteadfast: () => api("/admin/steadfast", undefined, "GET"),
    saveSteadfast: (payload: { enabled: boolean; api_key?: string; secret_key?: string; base_url?: string }) =>
      api("/admin/steadfast", payload),
    checkSteadfastBalance: () => api("/admin/steadfast/balance", {}),
    sendSteadfastOrder: (orderId: string) => api(`/admin/steadfast/orders/${orderId}/send`, {}),
  },
  // কুপন — ছাড়ের অঙ্ক সার্ভারে হিসাব হয়, এখান থেকে শুধু কোড যায়
  coupons: {
    validate: (code: string, subtotal: number) => api("/coupons/validate", { code, subtotal }),
    apply: (orderId: string, code: string) => api("/coupons/apply", { order_id: orderId, code }),
  },
  // কয়েন সিস্টেম — ইচ্ছাকৃতভাবে from() এর জেনেরিক টেবিল CRUD ব্যবহার করা হয়নি,
  // কারণ ওই এন্ডপয়েন্টে কোনো auth নেই। কয়েনের প্রতিটি লেখা সার্ভারে যাচাই হয়।
  coins: {
    getSettings: () => api("/coins/settings", undefined, "GET"),
    me: () => api("/coins/me", undefined, "GET"),
    myTransactions: (limit = 50) => api(`/coins/me/transactions?limit=${limit}`, undefined, "GET"),
    quote: (subtotal: number) => api("/coins/quote", { subtotal }),
    apply: (orderId: string, coins: number) => api("/coins/apply", { order_id: orderId, coins }),
    rewards: () => api("/coins/rewards", undefined, "GET"),
    redeemProduct: (orderId: string, catalogId: string) =>
      api("/coins/redeem-product", { order_id: orderId, catalog_id: catalogId }),
    admin: {
      getSettings: () => api("/admin/coins/settings", undefined, "GET"),
      saveSettings: (payload: CoinSettings) => api("/admin/coins/settings", payload),
      stats: () => api("/admin/coins/stats", undefined, "GET"),
      customers: (search = "") => api(`/admin/coins/customers?search=${encodeURIComponent(search)}`, undefined, "GET"),
      customerTransactions: (customerId: string) =>
        api(`/admin/coins/customers/${customerId}/transactions`, undefined, "GET"),
      adjust: (payload: { customer_id: string; amount: number; note: string }) =>
        api("/admin/coins/adjust", payload),
      tiers: () => api("/admin/coins/tiers", undefined, "GET"),
      saveTier: (payload: Record<string, unknown>, id?: string) =>
        id ? api(`/admin/coins/tiers/${id}`, payload, "PUT") : api("/admin/coins/tiers", payload),
      deleteTier: (id: string) => api(`/admin/coins/tiers/${id}`, undefined, "DELETE"),
      rewards: () => api("/admin/coins/rewards", undefined, "GET"),
      saveReward: (payload: Record<string, unknown>, id?: string) =>
        id ? api(`/admin/coins/rewards/${id}`, payload, "PUT") : api("/admin/coins/rewards", payload),
      deleteReward: (id: string) => api(`/admin/coins/rewards/${id}`, undefined, "DELETE"),
    },
  },
  auth: {
    async getSession() {
      const token = tokenStore.get();
      if (!token) return { data: { session: null }, error: null };
      const { data, error } = await api("/auth/me", undefined, "GET");
      const user = data?.user ? authUser({ user: data.user }) : null;
      return {
        data: { session: user ? { access_token: token, user, role: data.role ?? null } : null },
        error,
      };
    },
    onAuthStateChange(callback?: (event: string, session: any) => void) {
      return { data: { subscription: { unsubscribe: () => undefined } } };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const { data, error } = await api("/auth/login", { email, password });
      if (data?.session?.access_token) tokenStore.set(data.session.access_token);
      const user = data?.session ? authUser(data.session) : null;
      return { data: data ? { session: data.session ? { ...data.session, user } : null, user } : data, error };
    },
    async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, unknown> } }) {
      const { data, error } = await api("/auth/register", { email, password, ...(options?.data || {}) });
      if (data?.session?.access_token) tokenStore.set(data.session.access_token);
      const user = data?.session ? authUser(data.session) : null;
      return { data: data ? { session: data.session ? { ...data.session, user } : null, user } : data, error };
    },
    async signOut() {
      await api("/auth/logout", {});
      tokenStore.set();
      return { error: null };
    },
    async resetPasswordForEmail(email?: string, options?: any) {
      return { data: null, error: null };
    },
    async updateUser(payload?: any) {
      return { data: null, error: null };
    },
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File | Blob, options?: any) => {
        const form = new FormData();
        form.append("file", file, path);
        return api(`/storage/${bucket}`, form);
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: path.startsWith("http") ? path : `${API_URL.replace("/api", "")}/storage/${path}` },
      }),
    }),
  },
};
