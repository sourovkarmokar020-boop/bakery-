import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Printer, Download, X, TrendingUp, ShoppingBag, DollarSign, Package } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface OrderItemRow {
  id: string;
  order_id: string;
  product_name: string;
  price: number;
  quantity: number;
  product_id: string | null;
  orders: {
    order_number: string;
    customer_name: string;
    customer_phone: string;
    created_at: string;
    status_id: string;
  } | null;
}

export default function SalesReportPage() {
  const { settings } = useSiteSettings();
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [cancelledStatusIds, setCancelledStatusIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [itemsRes, productsRes, statusRes] = await Promise.all([
      supabase
        .from("order_items")
        .select("id, order_id, product_name, price, quantity, product_id, orders(order_number, customer_name, customer_phone, created_at, status_id)")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, purchase_price, base_price"),
      supabase.from("order_statuses").select("id, name"),
    ]);

    setItems((itemsRes.data as any[]) || []);
    // বাতিল অর্ডার লাভ/বিক্রয়ের হিসাবে ধরা হয় না
    setCancelledStatusIds(
      new Set(
        ((statusRes.data as any[]) || [])
          .filter((s) => /cancel/i.test(s.name || ""))
          .map((s) => s.id)
      )
    );

    const prodMap: Record<string, any> = {};
    (productsRes.data || []).forEach((p: any) => {
      prodMap[p.id] = p;
    });
    setProducts(prodMap);
    setLoading(false);
  };

  // Search + date filters only — used for the product-wise breakdown so it always shows every product in range
  const dateFiltered = useMemo(() => {
    return items.filter((item) => {
      if (item.orders?.status_id && cancelledStatusIds.has(item.orders.status_id)) return false;

      const matchSearch =
        !search ||
        item.product_name.toLowerCase().includes(search.toLowerCase()) ||
        (item.orders?.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.orders?.order_number || "").includes(search);

      const orderDate = item.orders?.created_at ? new Date(item.orders.created_at) : null;
      const matchStart = !startDate || (orderDate && orderDate >= new Date(startDate));
      const matchEnd = !endDate || (orderDate && orderDate <= new Date(endDate + "T23:59:59"));

      return matchSearch && matchStart && matchEnd;
    });
  }, [items, search, startDate, endDate, cancelledStatusIds]);

  // যেসব বিক্রি হওয়া প্রোডাক্টে ক্রয় মূল্য দেওয়া নেই — সেগুলোর লাভ ভুল (বেশি) দেখায়
  const missingPurchaseNames = useMemo(() => {
    const names = new Set<string>();
    for (const item of dateFiltered) {
      const prod = item.product_id ? products[item.product_id] : null;
      if (!prod || !Number(prod.purchase_price)) names.add(item.product_name);
    }
    return names;
  }, [dateFiltered, products]);

  // Adds the product filter on top, for the detail table below
  const filtered = useMemo(
    () => dateFiltered.filter((item) => productFilter === "all" || item.product_name === productFilter),
    [dateFiltered, productFilter]
  );

  const productOptions = useMemo(
    () => Array.from(new Set(items.map((i) => i.product_name))).sort((a, b) => a.localeCompare(b, "bn")),
    [items]
  );

  // Product-wise profit breakdown, ranked highest profit first
  const productSummary = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; purchase: number; sales: number }>();
    for (const item of dateFiltered) {
      const key = item.product_id || item.product_name;
      const prod = item.product_id ? products[item.product_id] : null;
      const purchasePrice = Number(prod?.purchase_price || 0);
      const entry = map.get(key) || { name: item.product_name, qty: 0, purchase: 0, sales: 0 };
      entry.qty += item.quantity;
      entry.purchase += purchasePrice * item.quantity;
      entry.sales += item.price * item.quantity;
      map.set(key, entry);
    }
    return Array.from(map.values())
      .map((e) => ({ ...e, profit: e.sales - e.purchase, margin: e.sales > 0 ? ((e.sales - e.purchase) / e.sales) * 100 : 0 }))
      .sort((a, b) => b.profit - a.profit);
  }, [dateFiltered, products]);

  const totalPurchase = filtered.reduce((sum, item) => {
    const prod = item.product_id ? products[item.product_id] : null;
    return sum + (prod?.purchase_price || 0) * item.quantity;
  }, 0);

  const totalSales = filtered.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalProfit = totalSales - totalPurchase;

  // সাইটের ব্র্যান্ড গ্রেডিয়েন্ট (ড্যাশবোর্ডের স্ট্যাট কার্ডের প্যালেট)
  const summaryCards = [
    { label: "মোট ক্রয়", value: totalPurchase, icon: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />, gradient: "from-orange-400 to-rose-500" },
    { label: "মোট বিক্রয়", value: totalSales, icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />, gradient: "from-emerald-500 to-teal-600" },
    {
      label: totalProfit >= 0 ? "মোট লাভ" : "মোট ক্ষতি",
      value: Math.abs(totalProfit),
      icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
      gradient: totalProfit >= 0 ? "from-blue-500 to-indigo-600" : "from-red-500 to-red-700",
    },
  ];

  // রিপোর্টের হেডারে দোকানের তথ্য — স্ক্রিন ও প্রিন্ট দুই জায়গাতেই এক
  const brandName = settings.brand_name || "Dream Mart";
  const storeInfo = [settings.site_phone, settings.site_email, settings.site_address].filter(Boolean);
  const rangeText =
    startDate || endDate
      ? `${startDate ? new Date(startDate).toLocaleDateString("bn-BD") : "শুরু"} থেকে ${endDate ? new Date(endDate).toLocaleDateString("bn-BD") : "আজ"} পর্যন্ত`
      : "সম্পূর্ণ সময়ের ক্রয়–বিক্রয় ও লাভের হিসাব";

  const handlePrint = () => window.print();

  const handleExport = () => {
    const headers = ["Invoice,Customer,Phone,Product,Purchase,Sale,Qty,Total"];
    const rows = filtered.map((item) => {
      const prod = item.product_id ? products[item.product_id] : null;
      const purchase = prod?.purchase_price || 0;
      return `${item.orders?.order_number || ""},${item.orders?.customer_name || ""},${item.orders?.customer_phone || ""},${item.product_name},${purchase},${item.price},${item.quantity},${item.price * item.quantity}`;
    });
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const resetFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setProductFilter("all");
  };

  return (
    <div className="sales-report space-y-5 print:space-y-3">
      {/* Print styles: browser এর date/URL header বাদ, admin sidebar/topbar লুকানো, সব লেখা কালো */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          aside, header { display: none !important; }
          main { padding: 12mm !important; overflow: visible !important; }
          body { background: #fff !important; }
          .sales-report, .sales-report * { color: #000 !important; }
          .sales-report .stat-card {
            background: #fff !important;
            border: 1.5px solid #333 !important;
            box-shadow: none !important;
            border-radius: 8px !important;
          }
          .sales-report table { font-size: 12px; }
          .sales-report th { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Print-only letterhead */}
      <div className="hidden print:block text-center border-b-2 border-black pb-3">
        <h2 className="text-2xl font-bold">{brandName}</h2>
        {storeInfo.length > 0 && <p className="text-xs mt-1">{storeInfo.join(" | ")}</p>}
        <p className="text-sm mt-1">{rangeText}</p>
      </div>

      {/* Colorful header — Dream Mart এর তথ্য */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-emerald-600 to-teal-600 text-white p-4 sm:p-6 shadow-lg print:hidden">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {settings.logo_url && (
              <img
                src={settings.logo_url}
                alt={brandName}
                className="w-11 h-11 rounded-xl bg-white/20 object-contain p-1 shrink-0"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold">{brandName}</h1>
              {storeInfo.length > 0 && (
                <p className="text-[11px] sm:text-xs opacity-90 mt-0.5">{storeInfo.join(" | ")}</p>
              )}
              <p className="text-xs sm:text-sm opacity-90 mt-0.5">{rangeText}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 rounded-full bg-white/15 text-white border-0 hover:bg-white/25"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 rounded-full bg-white/15 text-white border-0 hover:bg-white/25"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" /> Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs mb-1 block">🔍 কীওয়ার্ড</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input placeholder="সার্চ করুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9" />
              </div>
            </div>
            <div className="min-w-[200px]">
              <Label className="text-xs mb-1 block">📦 প্রোডাক্ট</Label>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব প্রোডাক্ট</SelectItem>
                  {productOptions.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[160px]">
              <Label className="text-xs mb-1 block">📅 শুরুর তারিখ</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9" />
            </div>
            <div className="min-w-[160px]">
              <Label className="text-xs mb-1 block">📅 শেষ তারিখ</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9" />
            </div>
            <Button size="sm" variant="outline" className="h-9" onClick={resetFilters}>
              <X className="w-4 h-4 mr-1" /> রিসেট
            </Button>
          </div>
        </CardContent>
      </Card>

      {missingPurchaseNames.size > 0 && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-xl px-4 py-3 text-sm shadow-sm print:hidden">
          ⚠️ <strong>{missingPurchaseNames.size}টি প্রোডাক্টের ক্রয় মূল্য দেওয়া নেই</strong> — সেগুলোর ক্রয় ৳0 ধরায় লাভ বেশি দেখাচ্ছে।
          প্রোডাক্ট এডিট পেজে "ক্রয় মূল্য (৳)" পূরণ করুন। ({Array.from(missingPurchaseNames).slice(0, 3).join(", ")}{missingPurchaseNames.size > 3 ? "…" : ""})
        </div>
      )}

      {/* Summary Cards — Dashboard এর স্ট্যাট কার্ডের মতো */}
      <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-3 sm:gap-4 print:gap-3">
        {summaryCards.map((c) => (
          <Card
            key={c.label}
            className={`stat-card border-none shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden text-white bg-gradient-to-br ${c.gradient}`}
          >
            <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/20 shrink-0">{c.icon}</div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">
                  ৳{c.value.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] sm:text-xs opacity-90">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product-wise Profit Breakdown */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <p className="font-semibold text-sm">প্রোডাক্ট ভিত্তিক লাভ</p>
            <span className="text-xs text-muted-foreground">(লাভের ক্রম অনুযায়ী, উপরের তারিখ/সার্চ ফিল্টার অনুযায়ী)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="text-left py-3 px-4">প্রোডাক্ট</th>
                  <th className="text-center py-3 px-3">পরিমাণ</th>
                  <th className="text-right py-3 px-4">ক্রয়</th>
                  <th className="text-right py-3 px-4">বিক্রয়</th>
                  <th className="text-right py-3 px-4">লাভ</th>
                  <th className="text-right py-3 px-4">মার্জিন</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">লোড হচ্ছে...</td></tr>
                ) : productSummary.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">কোনো ডেটা পাওয়া যায়নি</td></tr>
                ) : (
                  productSummary.map((p) => (
                    <tr
                      key={p.name}
                      className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                      onClick={() => setProductFilter(p.name)}
                    >
                      <td className="py-2.5 px-4 font-medium">
                        {p.name}
                        {missingPurchaseNames.has(p.name) && (
                          <span className="ml-1.5 text-xs text-amber-600" title="ক্রয় মূল্য দেওয়া নেই — লাভ সঠিক নয়">⚠️</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">{p.qty}</td>
                      <td className="py-2.5 px-4 text-right">৳{p.purchase.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right">৳{p.sales.toFixed(2)}</td>
                      <td className={`py-2.5 px-4 text-right font-semibold ${p.profit >= 0 ? "text-blue-600" : "text-red-600"}`}>৳{p.profit.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right text-muted-foreground">{p.margin.toFixed(0)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <p className="font-semibold text-sm">অর্ডার ভিত্তিক বিস্তারিত</p>
            <span className="text-xs text-muted-foreground">({filtered.length}টি আইটেম)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="text-left py-3 px-4">ইনভয়েস</th>
                  <th className="text-left py-3 px-4">কাস্টমার</th>
                  <th className="text-left py-3 px-4">ফোন</th>
                  <th className="text-left py-3 px-4">প্রোডাক্ট</th>
                  <th className="text-right py-3 px-4">ক্রয়</th>
                  <th className="text-right py-3 px-4">বিক্রয়</th>
                  <th className="text-center py-3 px-3">পরিমাণ</th>
                  <th className="text-right py-3 px-4">মোট</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">লোড হচ্ছে...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">কোনো ডেটা পাওয়া যায়নি</td></tr>
                ) : (
                  <>
                    {filtered.map((item) => {
                      const prod = item.product_id ? products[item.product_id] : null;
                      const purchasePrice = Number(prod?.purchase_price || 0);
                      const price = Number(item.price);
                      return (
                        <tr key={item.id} className="border-b hover:bg-muted/30">
                          <td className="py-2.5 px-4 font-medium text-primary">{item.orders?.order_number || "-"}</td>
                          <td className="py-2.5 px-4">{item.orders?.customer_name || "-"}</td>
                          <td className="py-2.5 px-4 text-muted-foreground">{item.orders?.customer_phone || "-"}</td>
                          <td className="py-2.5 px-4">{item.product_name}</td>
                          <td className="py-2.5 px-4 text-right">৳{purchasePrice.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right">৳{price.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                          <td className="py-2.5 px-4 text-right font-medium">৳{(price * item.quantity).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    {/* Totals Row */}
                    <tr className="bg-muted/50 font-bold border-t-2">
                      <td colSpan={4} className="py-3 px-4 text-right">TOTAL</td>
                      <td className="py-3 px-4 text-right">৳{totalPurchase.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">৳{totalSales.toFixed(2)}</td>
                      <td className="py-3 px-3 text-center">{filtered.reduce((s, i) => s + i.quantity, 0)}</td>
                      <td className="py-3 px-4 text-right">৳{totalSales.toFixed(2)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
