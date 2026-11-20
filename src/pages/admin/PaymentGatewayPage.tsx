import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import SettingsImageUpload from "@/components/admin/SettingsImageUpload";

export default function PaymentGatewayPage() {
  const { settings: siteSettings, refreshSettings } = useSiteSettings();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [existingKeys, setExistingKeys] = useState<Set<string>>(new Set());
  const [bkashApi, setBkashApi] = useState<Record<string, any>>({ mode: "sandbox", is_active: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) {
      toast.error("সেটিংস লোড করতে ব্যর্থ!");
    } else {
      const settingsObj: Record<string, any> = {};
      data?.forEach((item) => (settingsObj[item.key] = item.value));
      setSettings(settingsObj);
      setExistingKeys(new Set((data || []).map((s: any) => s.key)));
    }
    const { data: bkashData } = await supabase.bkash.getSettings();
    if (bkashData?.data) setBkashApi(bkashData.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const val = (key: string, defaultValue = "") => settings[key] ?? defaultValue;
  const set = (key: string, value: any) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const keysToSave = [
      "payment_cod_enabled", "payment_bkash_enabled", "payment_bkash_number",
      "payment_bkash_type", "payment_bkash_logo", "payment_nagad_enabled",
      "payment_nagad_number", "payment_nagad_type", "payment_nagad_logo",
      "payment_bkash_live_enabled"
    ];

    const promises = keysToSave.map(async (key) => {
      if (existingKeys.has(key)) {
        return supabase.from("site_settings").update({ value: settings[key] ?? "" }).eq("key", key);
      } else {
        return supabase.from("site_settings").insert({ key, value: settings[key] ?? "", group_name: "payment" });
      }
    });

    try {
      await Promise.all(promises);

      // Merchant API credentials আলাদা admin-only টেবিলে যায় (public site_settings-এ secret রাখা নিরাপদ না)
      const { error: bkashError } = await supabase.bkash.saveSettings({
        app_key: bkashApi.app_key || "",
        app_secret: bkashApi.app_secret || "",
        username: bkashApi.username || "",
        password: bkashApi.password || "",
        mode: bkashApi.mode || "sandbox",
        is_active: settings["payment_bkash_live_enabled"] === "true",
      });
      if (bkashError) throw new Error((bkashError as any)?.message || "বিকাশ API সেটিংস সেভ হয়নি");

      toast.success("সেটিংস সংরক্ষিত হয়েছে!");
      await fetchSettings();
      await refreshSettings();
    } catch (err) {
      toast.error("সংরক্ষণ করতে ব্যর্থ!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">পেমেন্ট গেটওয়ে</h1>
          <p className="text-sm text-muted-foreground">ক্যাশ অন ডেলিভারি, বিকাশ, নগদ ইত্যাদি সেটিংস</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading && "animate-spin"}`} /> রিফ্রেশ
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </Button>
        </div>
      </div>

      {/* COD */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Cash On Delivery (COD)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="cod-enabled">COD সক্রিয় করুন</Label>
            <Switch
              id="cod-enabled"
              checked={val("payment_cod_enabled") !== "false"}
              onCheckedChange={(checked) => set("payment_cod_enabled", checked ? "true" : "false")}
            />
          </div>
        </CardContent>
      </Card>

      {/* bKash */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">বিকাশ</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="bkash-enabled">বিকাশ সক্রিয় করুন</Label>
            <Switch
              id="bkash-enabled"
              checked={val("payment_bkash_enabled") !== "false"}
              onCheckedChange={(checked) => set("payment_bkash_enabled", checked ? "true" : "false")}
            />
          </div>
          
          {val("payment_bkash_enabled") !== "false" && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="bkash-number">বিকাশ নম্বর (Send Money)</Label>
                  <Input
                    id="bkash-number"
                    placeholder="01XXXXXXXXX"
                    value={val("payment_bkash_number")}
                    onChange={(e) => set("payment_bkash_number", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bkash-type">অ্যাকাউন্ট টাইপ</Label>
                  <Input
                    id="bkash-type"
                    placeholder="Personal / Merchant"
                    value={val("payment_bkash_type")}
                    onChange={(e) => set("payment_bkash_type", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>বিকাশ লোগো</Label>
                <p className="text-xs text-muted-foreground">চেকআউট পেজে পেমেন্ট মেথডের পাশে ছোট করে দেখানো হবে (স্বচ্ছ PNG হলে সবচেয়ে ভালো)</p>
                <SettingsImageUpload
                  imageUrl={val("payment_bkash_logo")}
                  onChange={(url) => set("payment_bkash_logo", url)}
                  folder="payment-logos"
                  label="বিকাশ লোগো আপলোড করুন"
                />
              </div>

              <div className="border-t pt-4 mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bkash-live-enabled">লাইভ পেমেন্ট (Merchant API)</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      চালু করলে চেকআউটে বিকাশ সিলেক্ট করে অর্ডার করলেই কাস্টমার সরাসরি বিকাশ পেমেন্ট পেজে চলে যাবে
                    </p>
                  </div>
                  <Switch
                    id="bkash-live-enabled"
                    checked={val("payment_bkash_live_enabled") === "true"}
                    onCheckedChange={(checked) => set("payment_bkash_live_enabled", checked ? "true" : "false")}
                  />
                </div>

                {val("payment_bkash_live_enabled") === "true" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="bkash-mode">লাইভ মোড</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          বন্ধ থাকলে Sandbox (টেস্ট), চালু করলে আসল টাকার লেনদেন হবে
                        </p>
                      </div>
                      <Switch
                        id="bkash-mode"
                        checked={bkashApi.mode === "live"}
                        onCheckedChange={(checked) => setBkashApi((p) => ({ ...p, mode: checked ? "live" : "sandbox" }))}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="bkash-app-key">App Key</Label>
                        <Input
                          id="bkash-app-key"
                          placeholder="bKash App Key"
                          value={bkashApi.app_key || ""}
                          onChange={(e) => setBkashApi((p) => ({ ...p, app_key: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="bkash-app-secret">App Secret</Label>
                        <Input
                          id="bkash-app-secret"
                          type="password"
                          placeholder="bKash App Secret"
                          value={bkashApi.app_secret || ""}
                          onChange={(e) => setBkashApi((p) => ({ ...p, app_secret: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="bkash-username">Username</Label>
                        <Input
                          id="bkash-username"
                          placeholder="bKash Merchant Username"
                          value={bkashApi.username || ""}
                          onChange={(e) => setBkashApi((p) => ({ ...p, username: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="bkash-password">Password</Label>
                        <Input
                          id="bkash-password"
                          type="password"
                          placeholder="bKash Merchant Password"
                          value={bkashApi.password || ""}
                          onChange={(e) => setBkashApi((p) => ({ ...p, password: e.target.value }))}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      bKash Merchant পোর্টাল থেকে Tokenized Checkout-এর credentials নিন। সেভ করা secret গুলো ******** হিসেবে দেখায় — না বদলালে আগেরটাই থাকবে।
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Nagad */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">নগদ</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="nagad-enabled">নগদ সক্রিয় করুন</Label>
            <Switch
              id="nagad-enabled"
              checked={val("payment_nagad_enabled") !== "false"}
              onCheckedChange={(checked) => set("payment_nagad_enabled", checked ? "true" : "false")}
            />
          </div>
          
          {val("payment_nagad_enabled") !== "false" && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="nagad-number">নগদ নম্বর (Send Money)</Label>
                  <Input
                    id="nagad-number"
                    placeholder="01XXXXXXXXX"
                    value={val("payment_nagad_number")}
                    onChange={(e) => set("payment_nagad_number", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="nagad-type">অ্যাকাউন্ট টাইপ</Label>
                  <Input
                    id="nagad-type"
                    placeholder="Personal / Merchant"
                    value={val("payment_nagad_type")}
                    onChange={(e) => set("payment_nagad_type", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>নগদ লোগো</Label>
                <p className="text-xs text-muted-foreground">চেকআউট পেজে পেমেন্ট মেথডের পাশে ছোট করে দেখানো হবে (স্বচ্ছ PNG হলে সবচেয়ে ভালো)</p>
                <SettingsImageUpload
                  imageUrl={val("payment_nagad_logo")}
                  onChange={(url) => set("payment_nagad_logo", url)}
                  folder="payment-logos"
                  label="নগদ লোগো আপলোড করুন"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
