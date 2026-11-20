import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { waLink } from "@/lib/whatsapp";
import {
  Tag, ShoppingCart, Copy, Check, Plus, Phone, MessageCircle,
  TrendingUp, RotateCcw, ArrowRight, AlertTriangle,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  used_count: number;
  max_uses: number | null;
  is_active: boolean;
  expires_at: string | null;
}

interface AbandonedCart {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  total: number;
  items: any;
  created_at: string;
  recovered: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const expiryInfo = (expiresAt: string | null) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff < 0) return { label: "মেয়াদ শেষ", urgent: true };
  if (diff < 3 * DAY_MS) return { label: `${Math.max(1, Math.ceil(diff / DAY_MS))} দিন বাকি`, urgent: true };
  return { label: `মেয়াদ: ${new Date(expiresAt).toLocaleDateString("bn-BD")}`, urgent: false };
};

export default function MarketingSection() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    const [couponRes, cartRes] = await Promise.all([
      supabase.from("coupons").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("abandoned_carts").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setCoupons((couponRes.data as any[]) || []);
    setCarts((cartRes.data as any[]) || []);
  };

  useEffect(() => { fetchData(); }, []);

  const pendingCarts = carts.filter((c) => !c.recovered);
  const recoveredCarts = carts.filter((c) => c.recovered);
  const pendingValue = pendingCarts.reduce((sum, c) => sum + Number(c.total || 0), 0);
  const recoveredValue = recoveredCarts.reduce((sum, c) => sum + Number(c.total || 0), 0);
  const totalCouponUses = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
  const recoveryRate = carts.length ? Math.round((recoveredCarts.length / carts.length) * 100) : 0;

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const markRecovered = async (id: string) => {
    const { error } = await supabase.from("abandoned_carts").update({ recovered: true }).eq("id", id);
    if (error) {
      toast({ title: "আপডেট করা যায়নি", variant: "destructive" });
      return;
    }
    toast({ title: "রিকভার হিসেবে চিহ্নিত হয়েছে ✅" });
    fetchData();
  };

  const recoveryMessage = (c: AbandonedCart) =>
    `আসসালামু আলাইকুম${c.customer_name ? ` ${c.customer_name}` : ""}! আপনি আমাদের শপে ৳${Number(c.total).toLocaleString()} টাকার পণ্য কার্টে রেখে গিয়েছিলেন। অর্ডারটি সম্পন্ন করতে চাইলে আমরা সাহায্য করতে পারি। ধন্যবাদ!`;

  const stats = [
    { icon: Tag, label: "সক্রিয় কুপন", value: coupons.length, sub: `মোট ${totalCouponUses} বার ব্যবহৃত` },
    { icon: ShoppingCart, label: "পরিত্যক্ত কার্ট", value: pendingCarts.length, sub: `আটকে আছে ৳${pendingValue.toLocaleString()}` },
    { icon: RotateCcw, label: "রিকভার হয়েছে", value: recoveredCarts.length, sub: `ফিরে এসেছে ৳${recoveredValue.toLocaleString()}` },
    { icon: TrendingUp, label: "রিকভারি রেট", value: `${recoveryRate}%`, sub: `সর্বশেষ ${carts.length}টি কার্টের মধ্যে` },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <s.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <p className="text-2xl font-bold mt-1.5">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* Coupons */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="w-4 h-4" /> সক্রিয় কুপন
            </CardTitle>
            <Link to="/admin/coupons">
              <Button size="sm" className="rounded-full h-8"><Plus className="w-4 h-4 mr-1" /> নতুন কুপন</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {coupons.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-sm text-muted-foreground">কোনো সক্রিয় কুপন নেই</p>
                <p className="text-xs text-muted-foreground">কুপন দিলে কাস্টমার অর্ডারে উৎসাহ পায় — একটা বানিয়ে দেখুন</p>
              </div>
            ) : (
              <div className="space-y-3">
                {coupons.map((c) => {
                  const expiry = expiryInfo(c.expires_at);
                  return (
                    <div key={c.id} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-mono font-semibold text-sm">{c.code}</p>
                          <button
                            onClick={() => copyCode(c.code)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground"
                            title="কোড কপি করুন"
                          >
                            {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c.discount_type === "percentage" ? `${c.discount_value}% ছাড়` : `৳${c.discount_value} ছাড়`}
                          {expiry && (
                            <span className={expiry.urgent ? "text-destructive font-medium" : ""}>
                              {" • "}{expiry.urgent && <AlertTriangle className="w-3 h-3 inline mr-0.5" />}{expiry.label}
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""} বার
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
            <Link to="/admin/coupons" className="flex items-center justify-center gap-1 text-xs text-primary hover:underline mt-4">
              সব কুপন ম্যানেজ করুন <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Abandoned Carts */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> পরিত্যক্ত কার্ট ({pendingCarts.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              এই কাস্টমাররা কার্টে পণ্য রেখে অর্ডার শেষ করেননি — কল বা WhatsApp করলে অনেকেই অর্ডার সম্পন্ন করেন
            </p>
          </CardHeader>
          <CardContent>
            {pendingCarts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">কোনো পরিত্যক্ত কার্ট নেই 🎉</p>
            ) : (
              <div className="space-y-3">
                {pendingCarts.slice(0, 8).map((c) => (
                  <div key={c.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.customer_name || "অজানা কাস্টমার"}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.customer_phone || "ফোন নেই"} • {new Date(c.created_at).toLocaleDateString("bn-BD")}
                          {Array.isArray(c.items) && c.items.length > 0 && ` • ${c.items.length}টি পণ্য`}
                        </p>
                      </div>
                      <span className="font-semibold text-sm shrink-0">৳{Number(c.total).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                      {c.customer_phone && (
                        <>
                          <a href={`tel:${c.customer_phone}`}>
                            <Button variant="outline" size="sm" className="h-7 rounded-full text-xs">
                              <Phone className="w-3 h-3 mr-1" /> কল
                            </Button>
                          </a>
                          <a href={waLink(c.customer_phone, recoveryMessage(c))} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="h-7 rounded-full text-xs text-green-600 border-green-300 hover:bg-green-50">
                              <MessageCircle className="w-3 h-3 mr-1" /> WhatsApp
                            </Button>
                          </a>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 rounded-full text-xs ml-auto"
                        onClick={() => markRecovered(c.id)}
                      >
                        <Check className="w-3 h-3 mr-1" /> রিকভার হয়েছে
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/admin/abandoned-orders" className="flex items-center justify-center gap-1 text-xs text-primary hover:underline mt-4">
              সব পরিত্যক্ত কার্ট দেখুন <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
