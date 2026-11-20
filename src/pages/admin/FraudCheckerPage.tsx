import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, ShieldAlert, ShieldCheck, ShieldQuestion, Phone,
  Package, XCircle, CheckCircle2, Clock, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_area: string;
  total: number;
  created_at: string;
  status_id: string;
  order_statuses?: { id: string; name: string; color: string } | null;
}

type Kind = "bad" | "good" | "pending";

const BAD_STATUSES = ["cancel", "return"];
const GOOD_STATUSES = ["complet", "deliver"];

function classify(name?: string): Kind {
  const n = (name || "").toLowerCase();
  if (BAD_STATUSES.some((s) => n.includes(s))) return "bad";
  if (GOOD_STATUSES.some((s) => n.includes(s))) return "good";
  return "pending";
}

function riskLevel(pct: number, total: number) {
  if (total === 0) {
    return { label: "কোনো তথ্য নেই", badge: "bg-gray-100 text-gray-600 border-gray-300", icon: ShieldQuestion, ring: "border-gray-200" };
  }
  if (pct >= 50) {
    return { label: "উচ্চ ঝুঁকি", badge: "bg-red-100 text-red-700 border-red-300", icon: ShieldAlert, ring: "border-red-300" };
  }
  if (pct >= 20) {
    return { label: "মাঝারি ঝুঁকি", badge: "bg-amber-100 text-amber-700 border-amber-300", icon: ShieldAlert, ring: "border-amber-300" };
  }
  return { label: "নিরাপদ কাস্টমার", badge: "bg-blue-100 text-blue-700 border-blue-300", icon: ShieldCheck, ring: "border-blue-300" };
}

export default function FraudCheckerPage() {
  const [searchParams] = useSearchParams();
  const phoneFromUrl = searchParams.get("phone") || "";
  const [allOrders, setAllOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState(phoneFromUrl);
  const [searchedPhone, setSearchedPhone] = useState(phoneFromUrl);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (phoneFromUrl) {
      setPhone(phoneFromUrl);
      setSearchedPhone(phoneFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneFromUrl]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, order_statuses(id, name, color)")
      .order("created_at", { ascending: false });
    setAllOrders((data as any[]) || []);
    setLoading(false);
  };

  // Aggregate every customer's order history to surface risky ones without needing a search
  const riskyCustomers = useMemo(() => {
    const map = new Map<
      string,
      { phone: string; name: string; total: number; bad: number; good: number; pending: number; lastOrder: string; totalSpent: number }
    >();
    for (const o of allOrders) {
      const key = (o.customer_phone || "").trim();
      if (!key) continue;
      const kind = classify(o.order_statuses?.name);
      const entry = map.get(key) || {
        phone: key, name: o.customer_name, total: 0, bad: 0, good: 0, pending: 0,
        lastOrder: o.created_at, totalSpent: 0,
      };
      entry.total += 1;
      entry[kind] += 1;
      entry.totalSpent += Number(o.total) || 0;
      if (new Date(o.created_at) > new Date(entry.lastOrder)) {
        entry.lastOrder = o.created_at;
        entry.name = o.customer_name;
      }
      map.set(key, entry);
    }
    return Array.from(map.values())
      .map((c) => ({ ...c, riskPct: c.total > 0 ? (c.bad / c.total) * 100 : 0 }))
      .filter((c) => c.total >= 2 && c.bad > 0)
      .sort((a, b) => b.riskPct - a.riskPct || b.bad - a.bad)
      .slice(0, 30);
  }, [allOrders]);

  const searchResult = useMemo(() => {
    if (!searchedPhone) return null;
    const digits = searchedPhone.replace(/\D/g, "");
    if (digits.length < 6) return { matched: [], total: 0, bad: 0, good: 0, pending: 0, totalSpent: 0, riskPct: 0, name: "" };
    const matched = allOrders.filter((o) => (o.customer_phone || "").replace(/\D/g, "").includes(digits));
    const total = matched.length;
    const bad = matched.filter((o) => classify(o.order_statuses?.name) === "bad").length;
    const good = matched.filter((o) => classify(o.order_statuses?.name) === "good").length;
    const pending = total - bad - good;
    const totalSpent = matched.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const riskPct = total > 0 ? (bad / total) * 100 : 0;
    return { matched, total, bad, good, pending, totalSpent, riskPct, name: matched[0]?.customer_name || "" };
  }, [searchedPhone, allOrders]);

  const risk = searchResult ? riskLevel(searchResult.riskPct, searchResult.total) : null;

  const handleSearch = () => {
    if (!phone.trim()) {
      toast({ title: "একটি ফোন নাম্বার লিখুন", variant: "destructive" });
      return;
    }
    setSearchedPhone(phone.trim());
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">ফ্রড চেকার</h1>
        <p className="text-sm text-muted-foreground mt-0.5">কাস্টমারের পুরনো অর্ডার হিস্ট্রি দেখে ফ্রড ঝুঁকি যাচাই করুন</p>
      </div>

      {/* Search */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="কাস্টমারের ফোন নাম্বার লিখুন (যেমন: 01721132995)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Search className="w-4 h-4 mr-1" />} চেক করুন
            </Button>
            {searchedPhone && (
              <Button variant="outline" onClick={() => { setSearchedPhone(""); setPhone(""); }}>
                ক্লিয়ার
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Result */}
      {searchResult && risk && (
        searchResult.total === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 flex flex-col items-center text-center gap-2">
              <ShieldQuestion className="w-10 h-10 text-muted-foreground" />
              <p className="font-medium">এই নাম্বারে কোনো অর্ডার হিস্ট্রি পাওয়া যায়নি</p>
              <p className="text-sm text-muted-foreground">এটি সম্ভবত একটি নতুন কাস্টমার — সতর্কতার সাথে অর্ডার কনফার্ম করুন</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className={cn("border-2 shadow-sm", risk.ring)}>
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", risk.badge)}>
                  <risk.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-lg">{searchResult.name || "অজানা"}</p>
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", risk.badge)}>
                      {risk.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{searchedPhone} • মোট {searchResult.total}টি অর্ডার • ঝুঁকি {searchResult.riskPct.toFixed(0)}%</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center shrink-0">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{searchResult.good}</p>
                    <p className="text-[11px] text-muted-foreground">ডেলিভারড</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-600">{searchResult.bad}</p>
                    <p className="text-[11px] text-muted-foreground">বাতিল/রিটার্ন</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-600">{searchResult.pending}</p>
                    <p className="text-[11px] text-muted-foreground">প্রসেসিং</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ইনভয়েস</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">তারিখ</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider min-w-[180px]">ঠিকানা</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">মূল্য</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResult.matched.map((o) => (
                        <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-4 font-mono text-xs font-semibold text-primary">#{o.order_number}</td>
                          <td className="py-2.5 px-4 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString("bn-BD")}</td>
                          <td className="py-2.5 px-4 text-xs text-muted-foreground max-w-[220px] truncate" title={o.customer_address}>
                            {o.customer_address} {o.delivery_area ? `(${o.delivery_area})` : ""}
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium">৳{Number(o.total).toLocaleString()}</td>
                          <td className="py-2.5 px-4">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                              style={{
                                backgroundColor: `${o.order_statuses?.color || "#6b7280"}1a`,
                                borderColor: `${o.order_statuses?.color || "#6b7280"}55`,
                                color: o.order_statuses?.color || "#6b7280",
                              }}
                            >
                              {o.order_statuses?.name || "Unknown"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )
      )}

      {/* Risky customers overview, pulled straight from order history */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <p className="font-semibold text-sm">ঝুঁকিপূর্ণ কাস্টমার তালিকা</p>
            <span className="text-xs text-muted-foreground">(কমপক্ষে ২টি অর্ডার ও ১টি বাতিল/রিটার্ন থাকা কাস্টমার, ঝুঁকির ক্রম অনুযায়ী)</span>
          </div>
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : riskyCustomers.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <p className="text-sm text-muted-foreground">এখনো কোনো ঝুঁকিপূর্ণ কাস্টমার পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">কাস্টমার</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ফোন</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">মোট অর্ডার</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ডেলিভারড</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">বাতিল/রিটার্ন</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider min-w-[140px]">ঝুঁকি</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">সর্বশেষ অর্ডার</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {riskyCustomers.map((c) => {
                    const r = riskLevel(c.riskPct, c.total);
                    return (
                      <tr key={c.phone} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-4 font-medium">{c.name || "অজানা"}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{c.phone}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1"><Package className="w-3.5 h-3.5 text-muted-foreground" />{c.total}</span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-green-600 font-medium">
                          <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{c.good}</span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-red-600 font-medium">
                          <span className="inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />{c.bad}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className={cn("h-full rounded-full", c.riskPct >= 50 ? "bg-red-500" : c.riskPct >= 20 ? "bg-amber-500" : "bg-green-500")} style={{ width: `${Math.min(100, c.riskPct)}%` }} />
                            </div>
                            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", r.badge)}>{c.riskPct.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(c.lastOrder).toLocaleDateString("bn-BD")}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <Button size="sm" variant="outline" onClick={() => { setPhone(c.phone); setSearchedPhone(c.phone); }}>
                            বিস্তারিত
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
