import { useEffect, useMemo, useState } from "react";
import { supabase, type CoinSettings, type CoinTier } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Coins, Settings2, Trophy, Plus, Pencil, Trash2, AlertTriangle,
  TrendingUp, Users, Wallet, Search, Loader2, Info, Gift,
} from "lucide-react";

/** সংখ্যা বাংলা অঙ্কে — শুধু দেখানোর জন্য, ইনপুটে নয় */
const bn = (value: number | string) =>
  String(value).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

const money = (n: number) => `৳${bn(n.toLocaleString("en-US", { maximumFractionDigits: 2 }))}`;

type Stats = {
  available: number; pending: number; lifetime_earned: number;
  lifetime_redeemed: number; holders: number; active_holders: number;
  earned_30d: number; redeemed_30d: number;
  liability_taka: number; effective_rate_percent: number;
};

type RewardItem = {
  id: string; product_id: string; coin_cost: number;
  stock_limit: number | null; redeemed_count: number; max_per_customer: number | null;
  is_active: boolean; sort_order: number;
  name?: string; name_bn?: string; image_url?: string;
  base_price?: number; sale_price?: number; stock_quantity?: number;
};

type CoinCustomer = {
  customer_id: string; name: string; phone: string;
  available: number; pending: number; lifetime_earned: number; lifetime_redeemed: number;
  taka_value: number; tier: CoinTier | null;
};

const DEFAULTS: CoinSettings = {
  is_enabled: false,
  allow_checkout_redeem: false,
  allow_product_redeem: false,
  earn_coins_per_100: 100,
  redeem_coins_per_taka: 100,
  min_order_to_earn: 200,
  max_coins_per_order: 2000,
  min_balance_to_redeem: 200,
  max_redeem_percent: 20,
  expiry_months: 12,
  cooling_days: 7,
  earn_on_discounted: true,
};

export default function CoinsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CoinSettings>(DEFAULTS);
  const [saved, setSaved] = useState<CoinSettings>(DEFAULTS);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tiers, setTiers] = useState<CoinTier[]>([]);
  const [customers, setCustomers] = useState<CoinCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [rewardDialog, setRewardDialog] = useState(false);
  const [editReward, setEditReward] = useState<Partial<RewardItem> | null>(null);
  const [productPick, setProductPick] = useState("");

  const [tierDialog, setTierDialog] = useState(false);
  const [editTier, setEditTier] = useState<Partial<CoinTier> | null>(null);
  const [adjustFor, setAdjustFor] = useState<CoinCustomer | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [s, st, t, rw, pr] = await Promise.all([
      supabase.coins.admin.getSettings(),
      supabase.coins.admin.stats(),
      supabase.coins.admin.tiers(),
      supabase.coins.admin.rewards(),
      supabase.from("products").select("id, name, name_bn, base_price, sale_price, image_url, stock_quantity").eq("is_active", true),
    ]);
    if (rw.data) setRewards(rw.data);
    if (pr.data) setProducts(pr.data);
    if (s.data) {
      const next = { ...DEFAULTS, ...s.data } as CoinSettings;
      setSettings(next);
      setSaved(next);
    }
    if (st.data) setStats(st.data);
    if (t.data) setTiers(t.data);
    await loadCustomers("");
    setLoading(false);
  };

  const loadCustomers = async (term: string) => {
    const { data } = await supabase.coins.admin.customers(term);
    setCustomers(data || []);
  };

  /* ---------------------------------------------------------------- হিসাব */

  // দুটি ফিল্ডের গুণফলই আসল রিওয়ার্ড রেট — এটাই স্ক্রিনে দেখানো সবচেয়ে জরুরি সংখ্যা,
  // কারণ আলাদাভাবে দুটি সংখ্যা দেখে বোঝার উপায় নেই কাস্টমার আসলে কত ফেরত পাচ্ছে।
  const rate = useMemo(() => {
    const earn = Number(settings.earn_coins_per_100) || 0;
    const redeem = Number(settings.redeem_coins_per_taka) || 0;
    if (earn <= 0 || redeem <= 0) return { percent: 0, coins: 0, taka: 0 };
    const coins = (1000 / 100) * earn;
    return { percent: earn / redeem, coins, taka: coins / redeem };
  }, [settings.earn_coins_per_100, settings.redeem_coins_per_taka]);

  const rateLevel: "bad" | "warn" | "ok" =
    rate.percent < 0.1 || rate.percent > 10 ? "bad"
      : rate.percent < 0.25 || rate.percent > 5 ? "warn"
        : "ok";

  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);
  const accruingButUnusable = settings.is_enabled && !settings.allow_checkout_redeem && !settings.allow_product_redeem;

  /* ---------------------------------------------------------------- সেভ */

  const save = async () => {
    if (rateLevel === "bad") {
      toast({
        variant: "destructive",
        title: "রেট গ্রহণযোগ্য নয়",
        description: `বর্তমান সেটিংসে কাস্টমার ফেরত পাবে ${bn(rate.percent.toFixed(3))}% — এটি ০.১% থেকে ১০% এর মধ্যে হতে হবে।`,
      });
      return;
    }

    setSaving(true);
    const payload = {
      ...settings,
      max_coins_per_order: settings.max_coins_per_order || null,
      expiry_months: settings.expiry_months || null,
    };
    const { data, error } = await supabase.coins.admin.saveSettings(payload as CoinSettings);
    setSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "সেভ হয়নি", description: (error as any)?.message || "আবার চেষ্টা করুন।" });
      return;
    }

    const next = { ...DEFAULTS, ...data } as CoinSettings;
    setSettings(next);
    setSaved(next);
    toast({ title: "সেটিংস সেভ হয়েছে" });
    supabase.coins.admin.stats().then(({ data }) => data && setStats(data));
  };

  /* ---------------------------------------------------------------- লেভেল */

  const saveTier = async () => {
    if (!editTier?.name?.trim()) {
      toast({ variant: "destructive", title: "লেভেলের নাম দিন" });
      return;
    }
    const { error } = await supabase.coins.admin.saveTier({
      name: editTier.name,
      name_bn: editTier.name_bn || null,
      min_lifetime_coins: Number(editTier.min_lifetime_coins) || 0,
      multiplier: Number(editTier.multiplier) || 1,
      color: editTier.color || "#f59e0b",
      benefits: editTier.benefits || null,
      is_active: editTier.is_active ?? true,
    }, editTier.id);

    if (error) {
      toast({ variant: "destructive", title: "সেভ হয়নি", description: (error as any)?.message });
      return;
    }
    toast({ title: "লেভেল সেভ হয়েছে" });
    setTierDialog(false);
    supabase.coins.admin.tiers().then(({ data }) => data && setTiers(data));
  };

  const removeTier = async (id: string) => {
    await supabase.coins.admin.deleteTier(id);
    supabase.coins.admin.tiers().then(({ data }) => data && setTiers(data));
    toast({ title: "লেভেল ডিলিট হয়েছে" });
  };

  /* ---------------------------------------------------------------- ফ্রি প্রোডাক্ট */

  const reloadRewards = () => supabase.coins.admin.rewards().then(({ data }) => data && setRewards(data));

  const saveReward = async () => {
    if (!editReward?.product_id) {
      toast({ variant: "destructive", title: "প্রোডাক্ট বাছাই করুন" });
      return;
    }
    if (!Number(editReward.coin_cost)) {
      toast({ variant: "destructive", title: "কয়েনের দাম দিন" });
      return;
    }

    const { error } = await supabase.coins.admin.saveReward({
      product_id: editReward.product_id,
      coin_cost: Number(editReward.coin_cost),
      stock_limit: editReward.stock_limit === null || editReward.stock_limit === undefined || (editReward.stock_limit as any) === ""
        ? null : Number(editReward.stock_limit),
      max_per_customer: editReward.max_per_customer === null || editReward.max_per_customer === undefined || (editReward.max_per_customer as any) === ""
        ? null : Number(editReward.max_per_customer),
      is_active: editReward.is_active ?? true,
      sort_order: Number(editReward.sort_order) || 0,
    }, editReward.id);

    if (error) {
      toast({ variant: "destructive", title: "সেভ হয়নি", description: (error as any)?.message });
      return;
    }

    toast({ title: "রিওয়ার্ড সেভ হয়েছে" });
    setRewardDialog(false);
    reloadRewards();
  };

  const removeReward = async (id: string) => {
    await supabase.coins.admin.deleteReward(id);
    reloadRewards();
    toast({ title: "রিওয়ার্ড ডিলিট হয়েছে" });
  };

  /* ---------------------------------------------------------------- অ্যাডজাস্ট */

  const submitAdjust = async () => {
    const amount = Number(adjustAmount);
    if (!amount || Number.isNaN(amount)) {
      toast({ variant: "destructive", title: "কয়েনের পরিমাণ দিন", description: "কমাতে চাইলে মাইনাস দিন, যেমন -100" });
      return;
    }
    if (adjustNote.trim().length < 3) {
      toast({ variant: "destructive", title: "কারণ লিখুন", description: "প্রতিটি ম্যানুয়াল পরিবর্তনের কারণ রেকর্ড হয়।" });
      return;
    }

    const { error } = await supabase.coins.admin.adjust({
      customer_id: adjustFor!.customer_id,
      amount,
      note: adjustNote.trim(),
    });

    if (error) {
      toast({ variant: "destructive", title: "হয়নি", description: (error as any)?.message });
      return;
    }

    toast({ title: "কয়েন আপডেট হয়েছে" });
    setAdjustFor(null);
    setAdjustAmount("");
    setAdjustNote("");
    loadCustomers(search);
    supabase.coins.admin.stats().then(({ data }) => data && setStats(data));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Coins className="w-6 h-6 text-primary" /> কয়েন ম্যানেজমেন্ট</h1>
        <p className="text-sm text-muted-foreground mt-0.5">কাস্টমার রিওয়ার্ড সিস্টেম</p>
      </div>

      {/* ---------------- দায় ও পরিসংখ্যান ---------------- */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<Wallet className="w-4 h-4" />}
            label="বকেয়া কয়েনের দায়"
            value={money(stats.liability_taka)}
            hint={`${bn(stats.available.toLocaleString("en-US"))} কয়েন খরচ হয়নি`}
            accent
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="কয়েন আছে এমন কাস্টমার"
            value={bn(stats.active_holders.toLocaleString("en-US"))}
            hint={`মোট ${bn(stats.holders.toLocaleString("en-US"))} জন`}
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="৩০ দিনে জমা"
            value={bn(stats.earned_30d.toLocaleString("en-US"))}
            hint="কয়েন"
          />
          <StatCard
            icon={<Coins className="w-4 h-4" />}
            label="৩০ দিনে খরচ"
            value={bn(stats.redeemed_30d.toLocaleString("en-US"))}
            hint={`= ${money(stats.redeemed_30d / (Number(settings.redeem_coins_per_taka) || 1))}`}
          />
        </div>
      )}

      {/* ---------------- সতর্কতা ---------------- */}
      {accruingButUnusable && (
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900 dark:text-amber-200">কয়েন জমা হচ্ছে, কিন্তু খরচ করার উপায় নেই</p>
            <p className="text-amber-800 dark:text-amber-300 mt-0.5">
              কয়েন সিস্টেম চালু আছে অথচ চেকআউটে ব্যবহার ও ফ্রি প্রোডাক্ট — দুটোই বন্ধ। কাস্টমারের কয়েন জমতেই থাকবে
              কিন্তু কাজে লাগাতে পারবে না। নিচের যেকোনো একটি অপশন চালু করুন।
            </p>
          </div>
        </div>
      )}

      {/* ---------------- কয়েন সেটিংস ---------------- */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-5 space-y-5">
          <h2 className="font-semibold flex items-center gap-2"><Settings2 className="w-4 h-4 text-muted-foreground" /> কয়েন সেটিংস</h2>

          <div className="space-y-1">
            <ToggleRow
              title="কয়েন সিস্টেম"
              desc="কাস্টমাররা অর্ডার থেকে কয়েন আর্ন করবেন"
              checked={settings.is_enabled}
              onChange={(v) => setSettings({ ...settings, is_enabled: v })}
            />
            <ToggleRow
              title="চেকআউটে কয়েন ব্যবহার"
              desc="চেকআউট পেজে কয়েন দিয়ে ডিসকাউন্ট নেওয়ার অপশন"
              checked={settings.allow_checkout_redeem}
              disabled={!settings.is_enabled}
              onChange={(v) => setSettings({ ...settings, allow_checkout_redeem: v })}
            />
            <ToggleRow
              title="কয়েন দিয়ে ফ্রি প্রোডাক্ট রিডিম"
              desc="চেকআউট পেজে কয়েন দিয়ে ফ্রি প্রোডাক্ট নেওয়ার অপশন"
              checked={settings.allow_product_redeem}
              disabled={!settings.is_enabled}
              onChange={(v) => setSettings({ ...settings, allow_product_redeem: v })}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">প্রতি ১০০ টাকায় কত কয়েন পাবেন</Label>
                <Input
                  type="number" min={0} className="mt-1.5 max-w-xs"
                  value={settings.earn_coins_per_100}
                  onChange={(e) => setSettings({ ...settings, earn_coins_per_100: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {settings.earn_coins_per_100 > 0
                    ? `৫০০ টাকার অর্ডারে পাবেন ${bn(Math.floor(5 * settings.earn_coins_per_100))} কয়েন`
                    : "০ দিলে কেউ কোনো কয়েন পাবে না"}
                </p>
              </div>

              <div>
                <Label className="font-semibold">কত কয়েনে ১ টাকা ছাড় পাবেন</Label>
                <div className="flex items-center gap-2 mt-1.5 max-w-xs">
                  <Input
                    type="number" min={1}
                    value={settings.redeem_coins_per_taka}
                    onChange={(e) => setSettings({ ...settings, redeem_coins_per_taka: Number(e.target.value) })}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">কয়েন = ১ টাকা</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {settings.redeem_coins_per_taka > 0
                    ? `${bn(settings.redeem_coins_per_taka * 10)} কয়েন জমলে ১০ টাকা ছাড় পাওয়া যাবে`
                    : "কমপক্ষে ১ দিতে হবে"}
                </p>
              </div>
            </div>

            {/* লাইভ প্রিভিউ — দুটি ফিল্ড একসাথে কী দাঁড়াচ্ছে সেটাই আসল কথা */}
            <div className={`rounded-lg border p-4 ${
              rateLevel === "bad" ? "border-destructive/40 bg-destructive/5"
                : rateLevel === "warn" ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"
                  : "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800"
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Info className="w-3.5 h-3.5" /> লাইভ প্রিভিউ
              </div>

              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">১,০০০ টাকার অর্ডারে</span><span className="font-semibold">{bn(Math.floor(rate.coins))} কয়েন</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">সেই কয়েনের মূল্য</span><span className="font-semibold">{money(Math.floor(rate.taka * 100) / 100)}</span></div>
              </div>

              <div className="mt-3 pt-3 border-t flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">কাস্টমার ফেরত পাচ্ছে</span>
                <span className={`text-2xl font-bold ${
                  rateLevel === "bad" ? "text-destructive"
                    : rateLevel === "warn" ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                }`}>{bn(rate.percent.toFixed(rate.percent < 1 ? 3 : 2))}%</span>
              </div>

              <p className="text-xs mt-2 leading-relaxed">
                {rateLevel === "bad" && rate.percent < 0.1 && (
                  <span className="text-destructive font-medium">
                    এই রেট প্রায় শূন্য — ৫,০০০ টাকা খরচ করে কাস্টমার ফেরত পাবে মাত্র {money(Math.floor(50 * settings.earn_coins_per_100 / (settings.redeem_coins_per_taka || 1) * 100) / 100)}।
                    এটা রিওয়ার্ড হিসেবে দেখানো হলে বরং ক্ষতি হয়।
                  </span>
                )}
                {rateLevel === "bad" && rate.percent > 10 && (
                  <span className="text-destructive font-medium">এই রেট অনেক বেশি — লাভের চেয়ে রিওয়ার্ড বেশি হয়ে যাবে।</span>
                )}
                {rateLevel === "warn" && (
                  <span className="text-amber-700 dark:text-amber-400">সাধারণত ০.৫% – ২% রাখা হয়। এই রেট তার বাইরে।</span>
                )}
                {rateLevel === "ok" && (
                  <span className="text-emerald-700 dark:text-emerald-400">এই রেট স্বাভাবিক সীমার মধ্যে আছে (০.৫% – ২% সাধারণ)।</span>
                )}
              </p>
            </div>
          </div>

          {/* ---------------- সীমা ও মেয়াদ ---------------- */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">সীমা ও মেয়াদ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field
                label="কয়েন পেতে সর্বনিম্ন অর্ডার (৳)"
                hint="এর কম টাকার অর্ডারে কয়েন দেওয়া হবে না"
                value={settings.min_order_to_earn}
                onChange={(v) => setSettings({ ...settings, min_order_to_earn: v })}
              />
              <Field
                label="এক অর্ডারে সর্বোচ্চ কয়েন"
                hint="খালি রাখলে কোনো সীমা থাকবে না"
                value={settings.max_coins_per_order ?? ""}
                onChange={(v) => setSettings({ ...settings, max_coins_per_order: v || null })}
              />
              <Field
                label="ব্যবহার করতে সর্বনিম্ন কয়েন"
                hint="এর কম কয়েন জমলে খরচ করা যাবে না"
                value={settings.min_balance_to_redeem}
                onChange={(v) => setSettings({ ...settings, min_balance_to_redeem: v })}
              />
              <Field
                label="অর্ডারের সর্বোচ্চ কত % কয়েনে (%)"
                hint="পুরো অর্ডার যেন কয়েনে ফ্রি না হয়ে যায়"
                value={settings.max_redeem_percent}
                onChange={(v) => setSettings({ ...settings, max_redeem_percent: v })}
              />
              <Field
                label="কয়েনের মেয়াদ (মাস)"
                hint="খালি রাখলে কয়েন কখনো শেষ হবে না"
                value={settings.expiry_months ?? ""}
                onChange={(v) => setSettings({ ...settings, expiry_months: v || null })}
              />
              <Field
                label="ডেলিভারির কত দিন পর কয়েন খরচযোগ্য"
                hint="রিটার্নের সময়সীমার চেয়ে বেশি রাখুন"
                value={settings.cooling_days}
                onChange={(v) => setSettings({ ...settings, cooling_days: v })}
              />
            </div>

            <div className="mt-4">
              <ToggleRow
                title="ডিসকাউন্ট দেওয়া অর্ডারেও কয়েন"
                desc="কুপন বা ছাড় ব্যবহার করা অর্ডারেও কয়েন দেওয়া হবে কি না"
                checked={settings.earn_on_discounted}
                disabled={!settings.is_enabled}
                onChange={(v) => setSettings({ ...settings, earn_on_discounted: v })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------------- কয়েন লেভেল ---------------- */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold flex items-center gap-2"><Trophy className="w-4 h-4 text-muted-foreground" /> কয়েন লেভেল</h2>
            <Button size="sm" className="rounded-full" onClick={() => { setEditTier({ multiplier: 1, min_lifetime_coins: 0, is_active: true, color: "#f59e0b" }); setTierDialog(true); }}>
              <Plus className="w-4 h-4 mr-1" /> যোগ করুন
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            লেভেল ঠিক হয় <span className="font-medium text-foreground">সারা জীবনে মোট অর্জিত কয়েন</span> দিয়ে — বর্তমান ব্যালেন্স দিয়ে নয়।
            তাই কয়েন খরচ করলে কেউ নিচের লেভেলে নেমে যায় না।
          </p>

          <div className="space-y-2">
            {tiers.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">কোনো লেভেল যোগ করা হয়নি</p>}
            {tiers.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Trophy className="w-5 h-5 shrink-0" style={{ color: t.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{t.name_bn || t.name}</span>
                    <Badge variant="secondary" className="text-[11px]">{bn(t.min_lifetime_coins.toLocaleString("en-US"))}+ কয়েন</Badge>
                    {Number(t.multiplier) !== 1 && (
                      <Badge className="text-[11px] bg-primary/10 text-primary hover:bg-primary/10">{bn(t.multiplier)}× কয়েন</Badge>
                    )}
                    {!t.is_active && <Badge variant="outline" className="text-[11px]">বন্ধ</Badge>}
                  </div>
                  {t.benefits && <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.benefits}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditTier(t); setTierDialog(true); }} className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-colors" title="এডিট"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => removeTier(t.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="ডিলিট"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---------------- ফ্রি প্রোডাক্ট ---------------- */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
            <h2 className="font-semibold flex items-center gap-2"><Gift className="w-4 h-4 text-muted-foreground" /> কয়েন দিয়ে ফ্রি প্রোডাক্ট</h2>
            <Button
              size="sm" className="rounded-full"
              disabled={!settings.allow_product_redeem}
              onClick={() => { setEditReward({ coin_cost: 500, is_active: true, sort_order: 0 }); setProductPick(""); setRewardDialog(true); }}
            >
              <Plus className="w-4 h-4 mr-1" /> প্রোডাক্ট যোগ করুন
            </Button>
          </div>

          {!settings.allow_product_redeem ? (
            <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3.5 mt-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-200">"কয়েন দিয়ে ফ্রি প্রোডাক্ট রিডিম" টগলটি বন্ধ</p>
                <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                  উপরের সেটিংসে টগলটি চালু করে সেভ করুন, তারপর এখানে প্রোডাক্ট যোগ করতে পারবেন।
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4">
                কোন প্রোডাক্ট কত কয়েনে ফ্রি নেওয়া যাবে সেটা আপনি ঠিক করবেন। কাস্টমার চেকআউট পেজে এই তালিকা দেখতে পাবে।
                কম মার্জিনের জিনিস বেশি কয়েনে রাখুন।
              </p>

              <div className="space-y-2">
                {rewards.length === 0 && (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    কোনো ফ্রি প্রোডাক্ট যোগ করা হয়নি — কাস্টমার চেকআউটে কিছুই দেখবে না
                  </p>
                )}
                {rewards.map((r) => {
                  const remaining = r.stock_limit === null
                    ? (r.stock_quantity ?? 0)
                    : Math.max(0, Math.min(r.stock_quantity ?? 0, r.stock_limit - r.redeemed_count));

                  return (
                    <div key={r.id} className="flex items-center gap-3 rounded-lg border p-3">
                      {r.image_url
                        ? <img src={r.image_url} alt="" className="w-11 h-11 rounded object-cover border shrink-0" />
                        : <div className="w-11 h-11 rounded bg-muted shrink-0" />}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold truncate">{r.name_bn || r.name || "প্রোডাক্ট নেই"}</span>
                          <Badge className="text-[11px] bg-primary/10 text-primary hover:bg-primary/10">
                            {bn(r.coin_cost.toLocaleString("en-US"))} কয়েন
                          </Badge>
                          {!r.is_active && <Badge variant="outline" className="text-[11px]">বন্ধ</Badge>}
                          {remaining <= 0 && <Badge variant="destructive" className="text-[11px]">স্টক শেষ</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          দাম {money(Number(r.sale_price || r.base_price || 0))}
                          {" · "}বাকি {bn(remaining)}টি
                          {" · "}নেওয়া হয়েছে {bn(r.redeemed_count)}বার
                          {r.max_per_customer ? ` · জনপ্রতি সর্বোচ্চ ${bn(r.max_per_customer)}` : ""}
                        </p>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => { setEditReward(r); setProductPick(""); setRewardDialog(true); }} className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-colors" title="এডিট"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => removeReward(r.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="ডিলিট"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ---------------- কাস্টমার কয়েন ---------------- */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> কাস্টমারের কয়েন</h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8" placeholder="নাম বা ফোন দিয়ে খুঁজুন"
                value={search}
                onChange={(e) => { setSearch(e.target.value); loadCustomers(e.target.value); }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">কাস্টমার</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">লেভেল</th>
                  <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">খরচযোগ্য</th>
                  <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">পেন্ডিং</th>
                  <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">মূল্য</th>
                  <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">এখনো কারো কয়েন জমা হয়নি</td></tr>
                ) : customers.map((c) => (
                  <tr key={c.customer_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      {c.tier ? <Badge variant="secondary" className="text-[11px]">{c.tier.name_bn || c.tier.name}</Badge> : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold tabular-nums">{bn(c.available.toLocaleString("en-US"))}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground tabular-nums">{bn(c.pending.toLocaleString("en-US"))}</td>
                    <td className="py-2.5 px-3 text-right text-primary font-medium tabular-nums">{money(c.taka_value)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAdjustFor(c)}>কয়েন অ্যাডজাস্ট</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ---------------- স্টিকি সেভ বার ---------------- */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur px-4 py-3 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">সেভ করা হয়নি এমন পরিবর্তন আছে</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSettings(saved)}>বাতিল</Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />} সেটিংস সেভ করুন
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- লেভেল ডায়ালগ ---------------- */}
      <Dialog open={tierDialog} onOpenChange={setTierDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTier?.id ? "লেভেল এডিট" : "নতুন লেভেল"}</DialogTitle></DialogHeader>
          {editTier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>নাম (English)</Label><Input className="mt-1.5" value={editTier.name || ""} onChange={(e) => setEditTier({ ...editTier, name: e.target.value })} /></div>
                <div><Label>নাম (বাংলা)</Label><Input className="mt-1.5" value={editTier.name_bn || ""} onChange={(e) => setEditTier({ ...editTier, name_bn: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>সর্বনিম্ন মোট অর্জিত কয়েন</Label>
                  <Input type="number" min={0} className="mt-1.5" value={editTier.min_lifetime_coins ?? 0} onChange={(e) => setEditTier({ ...editTier, min_lifetime_coins: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>কয়েন মাল্টিপ্লায়ার</Label>
                  <Input type="number" min={1} step={0.05} className="mt-1.5" value={editTier.multiplier ?? 1} onChange={(e) => setEditTier({ ...editTier, multiplier: Number(e.target.value) })} />
                  <p className="text-xs text-muted-foreground mt-1">১.৫ দিলে এই লেভেলে ৫০% বেশি কয়েন</p>
                </div>
              </div>
              <div>
                <Label>রঙ</Label>
                <Input type="color" className="mt-1.5 h-10 w-24 p-1" value={editTier.color || "#f59e0b"} onChange={(e) => setEditTier({ ...editTier, color: e.target.value })} />
              </div>
              <div><Label>সুবিধা (ঐচ্ছিক)</Label><Textarea className="mt-1.5" rows={2} value={editTier.benefits || ""} onChange={(e) => setEditTier({ ...editTier, benefits: e.target.value })} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">লেভেল চালু</span>
                <Switch checked={editTier.is_active ?? true} onCheckedChange={(v) => setEditTier({ ...editTier, is_active: v })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setTierDialog(false)}>বাতিল</Button>
                <Button onClick={saveTier}>সেভ</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------------- ফ্রি প্রোডাক্ট ডায়ালগ ---------------- */}
      <Dialog open={rewardDialog} onOpenChange={setRewardDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editReward?.id ? "রিওয়ার্ড এডিট" : "নতুন ফ্রি প্রোডাক্ট"}</DialogTitle></DialogHeader>
          {editReward && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <Label>প্রোডাক্ট <span className="text-destructive">*</span></Label>
                {editReward.product_id ? (
                  <div className="flex items-center gap-2 mt-1.5 rounded-lg border p-2">
                    {(() => {
                      const p = products.find((x) => x.id === editReward.product_id);
                      return (
                        <>
                          {p?.image_url
                            ? <img src={p.image_url} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
                            : <div className="w-9 h-9 rounded bg-muted shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{p?.name_bn || p?.name || editReward.name_bn || editReward.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {money(Number(p?.sale_price || p?.base_price || editReward.sale_price || editReward.base_price || 0))}
                              {" · স্টক "}{bn(p?.stock_quantity ?? editReward.stock_quantity ?? 0)}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0"
                            onClick={() => setEditReward({ ...editReward, product_id: undefined })}>বদলান</Button>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <>
                    <div className="relative mt-1.5">
                      <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-8" placeholder="প্রোডাক্টের নাম লিখুন" value={productPick} onChange={(e) => setProductPick(e.target.value)} />
                    </div>
                    <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto divide-y">
                      {products
                        .filter((p) => {
                          const q = productPick.trim().toLowerCase();
                          if (!q) return true;
                          return `${p.name || ""} ${p.name_bn || ""}`.toLowerCase().includes(q);
                        })
                        .slice(0, 40)
                        .map((p) => (
                          <button
                            key={p.id} type="button"
                            className="w-full flex items-center gap-2 p-2 hover:bg-muted/50 text-left transition-colors"
                            onClick={() => setEditReward({ ...editReward, product_id: p.id })}
                          >
                            {p.image_url
                              ? <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                              : <div className="w-8 h-8 rounded bg-muted shrink-0" />}
                            <span className="text-sm truncate flex-1">{p.name_bn || p.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{money(Number(p.sale_price || p.base_price || 0))}</span>
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>কত কয়েনে <span className="text-destructive">*</span></Label>
                  <Input type="number" min={1} className="mt-1.5" value={editReward.coin_cost ?? ""} onChange={(e) => setEditReward({ ...editReward, coin_cost: Number(e.target.value) })} />
                  {!!editReward.coin_cost && settings.redeem_coins_per_taka > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ছাড় হিসেবে এই কয়েনের মূল্য {money(Number(editReward.coin_cost) / settings.redeem_coins_per_taka)}
                    </p>
                  )}
                </div>
                <div>
                  <Label>রিওয়ার্ডে সর্বোচ্চ কতটি</Label>
                  <Input type="number" min={0} className="mt-1.5" placeholder="খালি = প্রোডাক্টের স্টক"
                    value={editReward.stock_limit ?? ""} onChange={(e) => setEditReward({ ...editReward, stock_limit: e.target.value === "" ? null : Number(e.target.value) })} />
                  <p className="text-xs text-muted-foreground mt-1">আলাদা সীমা</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>একজন সর্বোচ্চ কতবার</Label>
                  <Input type="number" min={1} className="mt-1.5" placeholder="খালি = সীমা নেই"
                    value={editReward.max_per_customer ?? ""} onChange={(e) => setEditReward({ ...editReward, max_per_customer: e.target.value === "" ? null : Number(e.target.value) })} />
                </div>
                <div>
                  <Label>সাজানোর ক্রম</Label>
                  <Input type="number" className="mt-1.5" value={editReward.sort_order ?? 0} onChange={(e) => setEditReward({ ...editReward, sort_order: Number(e.target.value) })} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">চেকআউটে দেখাবে</span>
                <Switch checked={editReward.is_active ?? true} onCheckedChange={(v) => setEditReward({ ...editReward, is_active: v })} />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRewardDialog(false)}>বাতিল</Button>
                <Button onClick={saveReward}>সেভ</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------------- অ্যাডজাস্ট ডায়ালগ ---------------- */}
      <Dialog open={!!adjustFor} onOpenChange={(o) => !o && setAdjustFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>কয়েন অ্যাডজাস্ট — {adjustFor?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              বর্তমান ব্যালেন্স <span className="font-semibold">{bn(adjustFor?.available.toLocaleString("en-US") || "0")} কয়েন</span>
              <span className="text-muted-foreground"> ({money(adjustFor?.taka_value || 0)})</span>
            </div>
            <div>
              <Label>কত কয়েন</Label>
              <Input type="number" className="mt-1.5" placeholder="যোগ করতে 100, কমাতে -100" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} />
            </div>
            <div>
              <Label>কারণ <span className="text-destructive">*</span></Label>
              <Textarea className="mt-1.5" rows={2} placeholder="যেমন: কাস্টমার কেয়ারের ক্ষতিপূরণ" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">প্রতিটি ম্যানুয়াল পরিবর্তন কে করেছে ও কেন — দুটোই রেকর্ড হয়ে থাকে।</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAdjustFor(null)}>বাতিল</Button>
              <Button onClick={submitAdjust}>কনফার্ম</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ helpers */

function StatCard({ icon, label, value, hint, accent }: {
  icon: React.ReactNode; label: string; value: string; hint?: string; accent?: boolean;
}) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
        <div className={`text-xl font-bold mt-1.5 ${accent ? "text-primary" : ""}`}>{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function ToggleRow({ title, desc, checked, onChange, disabled }: {
  title: string; desc: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3 border-b last:border-0 ${disabled ? "opacity-50" : ""}`}>
      <div className="min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground w-8 text-right">{checked ? "চালু" : "বন্ধ"}</span>
        <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
}

function Field({ label, hint, value, onChange }: {
  label: string; hint: string; value: number | string; onChange: (v: number | null) => void;
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Input
        type="number" min={0} className="mt-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}
