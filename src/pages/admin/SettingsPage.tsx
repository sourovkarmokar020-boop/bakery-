import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import SettingsImageUpload from "@/components/admin/SettingsImageUpload";
import LinkListEditor, { type LinkItem } from "@/components/admin/LinkListEditor";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useHomeData, type HomeCategory } from "@/hooks/useHomeData";
import { DEFAULT_FOOTER_HIDDEN_CATEGORIES, parseSlugList } from "@/lib/footer";

const parseLinks = (value: string | undefined): LinkItem[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ফুটারের "ফলো আস" আইকনগুলো — প্রতিটির লিংক ও দেখানো/লুকানোর সুইচ একসাথে
const SOCIAL_FIELDS = [
  { key: "facebook", label: "Facebook", settingKey: "social_facebook", placeholder: "https://facebook.com/dreammart" },
  { key: "twitter", label: "Twitter", settingKey: "social_twitter", placeholder: "https://twitter.com/dreammart" },
  { key: "whatsapp", label: "WhatsApp", settingKey: "", placeholder: "" },
  { key: "youtube", label: "YouTube", settingKey: "social_youtube", placeholder: "https://youtube.com/@dreammart" },
  { key: "instagram", label: "Instagram", settingKey: "social_instagram", placeholder: "https://instagram.com/dreammart" },
  { key: "tiktok", label: "TikTok", settingKey: "social_tiktok", placeholder: "https://tiktok.com/@dreammart" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [savedSettings, setSavedSettings] = useState<Record<string, string>>({});
  const [existingKeys, setExistingKeys] = useState<Set<string>>(new Set());
  const [categoryLinks, setCategoryLinks] = useState<LinkItem[]>([]);
  const [importantLinks, setImportantLinks] = useState<LinkItem[]>([]);
  // ফুটারে যেসব ক্যাটাগরি দেখানো হবে না (slug তালিকা) — অটো মোডে কাজে লাগে
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  // OpenAI key আলাদা রাখা — কখনো ফ্রন্টএন্ডে আসল মান আসে না (সেট থাকলে "***")।
  // ফাঁকা মানে "বদলাবো না", নতুন key টাইপ করলেই আপডেট হয়।
  const [openaiKey, setOpenaiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { refreshSettings } = useSiteSettings();
  // ফুটারের ক্যাটাগরি কলাম ন্যাভবারের ক্যাটাগরি থেকেই আসে — তাই একই তালিকা দেখাই
  const { data: homeData } = useHomeData();
  const navCategories = ((homeData?.allCategories || []) as HomeCategory[]).filter(
    (c) => !c.parent_id && !!c.show_in_navbar
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = {};
    (data || []).forEach((s: any) => { map[s.key] = s.value || ""; });
    setSettings(map);
    setSavedSettings(map);
    setExistingKeys(new Set((data || []).map((s: any) => s.key)));
    setCategoryLinks(parseLinks(map.footer_category_links));
    setImportantLinks(parseLinks(map.footer_important_links));
    setHiddenCategories([
      ...parseSlugList(map.footer_hidden_categories ?? DEFAULT_FOOTER_HIDDEN_CATEGORIES),
    ]);
  };

  const toggleFooterCategory = (slug: string, show: boolean) =>
    setHiddenCategories((prev) => (show ? prev.filter((s) => s !== slug) : [...new Set([...prev, slug])]));

  const set = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));
  const val = (key: string) => settings[key] || "";

  const save = async () => {
    setLoading(true);
    const payload: Record<string, string> = {
      ...settings,
      footer_category_links: JSON.stringify(categoryLinks),
      footer_important_links: JSON.stringify(importantLinks),
      footer_hidden_categories: hiddenCategories.join(","),
    };

    try {
      // শুধু পরিবর্তিত key গুলোই পাঠানো হয়, নাহলে প্রতি save-এ ৫০+ request যায়
      const changed = Object.entries(payload).filter(
        ([key, value]) => !existingKeys.has(key) || savedSettings[key] !== value
      );
      const newRows = changed
        .filter(([key]) => !existingKeys.has(key))
        .map(([key, value]) => ({ key, value, group_name: "general" }));

      await Promise.all([
        ...(newRows.length > 0 ? [supabase.from("site_settings").insert(newRows)] : []),
        ...changed
          .filter(([key]) => existingKeys.has(key))
          .map(([key, value]) => supabase.from("site_settings").update({ value }).eq("key", key)),
      ]);

      // OpenAI key — শুধু নতুন মান দিলে আপডেট (row migration-এ seed করা আছে)
      if (openaiKey.trim() && openaiKey.trim() !== "***") {
        await supabase.from("site_settings").update({ value: openaiKey.trim() }).eq("key", "openai_api_key");
        setOpenaiKey("");
      }
      await refreshSettings();
      toast({ title: "সেটিংস সেভ হয়েছে ✅" });
    } catch (err: any) {
      toast({ title: "সেভ করতে সমস্যা হয়েছে", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      fetchSettings();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">সাধারণ সেটিংস</h1>
          <p className="text-sm text-muted-foreground mt-0.5">সাইটের ব্র্যান্ডিং, যোগাযোগ ও SEO তথ্য পরিচালনা করুন</p>
        </div>
        <Button className="rounded-full" onClick={save} disabled={loading}>{loading ? "সেভ হচ্ছে..." : "সেভ করুন"}</Button>
      </div>

      {/* ব্র্যান্ডিং */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">ব্র্যান্ডিং</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>ব্র্যান্ড নাম (ইংরেজি)</Label>
              <Input placeholder="Dream Mart" value={val("brand_name_en")} onChange={(e) => set("brand_name_en", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>ব্র্যান্ড নাম (বাংলা)</Label>
              <Input placeholder="ড্রিম মার্ট" value={val("brand_name_bn")} onChange={(e) => set("brand_name_bn", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>ব্র্যান্ড নাম (ডিফল্ট / ব্যাকআপ)</Label>
              <Input placeholder="Dream Mart" value={val("brand_name")} onChange={(e) => set("brand_name", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>ব্র্যান্ড কালার কোড</Label>
              <div className="flex gap-2">
                <input type="color" className="h-10 w-14 rounded border" value={val("brand_color") || "#FF8C00"} onChange={(e) => set("brand_color", e.target.value)} />
                <Input placeholder="#FF8C00" value={val("brand_color")} onChange={(e) => set("brand_color", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>বাটন কালার</Label>
              <div className="flex gap-2">
                <input type="color" className="h-10 w-14 rounded border" value={val("button_color") || "#036CC7"} onChange={(e) => set("button_color", e.target.value)} />
                <Input placeholder="#036CC7" value={val("button_color") || "#036CC7"} onChange={(e) => set("button_color", e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground">Primary button-এর background color</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ব্র্যান্ড নামের সাইজ: {val("brand_name_size") || 24}px</Label>
              <Slider min={14} max={48} step={1} value={[Number(val("brand_name_size")) || 24]} onValueChange={([v]) => set("brand_name_size", String(v))} />
            </div>
            <div className="space-y-2">
              <Label>লোগোর সাইজ: {val("logo_size") || 40}px</Label>
              <Slider min={20} max={100} step={1} value={[Number(val("logo_size")) || 40]} onValueChange={([v]) => set("logo_size", String(v))} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>ব্র্যান্ড লোগো</Label>
              <SettingsImageUpload imageUrl={val("brand_logo")} onChange={(url) => set("brand_logo", url)} folder="logo" label="লোগো আপলোড করুন" />
            </div>
            <div className="space-y-1">
              <Label>ফেভিকন (Favicon)</Label>
              <SettingsImageUpload imageUrl={val("favicon_url")} onChange={(url) => set("favicon_url", url)} folder="favicon" label="ফেভিকন আপলোড করুন" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>ব্র্যান্ড ডিসপ্লে মোড</Label>
            <RadioGroup value={val("brand_display_mode") === "logo_only" ? "logo_only" : "name_only"} onValueChange={(v) => set("brand_display_mode", v)} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="name_only" id="mode-name-only" />
                <Label htmlFor="mode-name-only" className="font-normal">শুধু নাম</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="logo_only" id="mode-logo-only" />
                <Label htmlFor="mode-logo-only" className="font-normal">শুধু লোগো</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1">
            <Label>অ্যাকসেন্ট কালার</Label>
            <div className="flex gap-2 max-w-xs">
              <input type="color" className="h-10 w-14 rounded border" value={val("accent_color") || "#FF8C00"} onChange={(e) => set("accent_color", e.target.value)} />
              <Input placeholder="#FF8C00" value={val("accent_color")} onChange={(e) => set("accent_color", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>গ্র্যাডিয়েন্ট মোড</Label>
            <RadioGroup value={val("gradient_mode") || "solid"} onValueChange={(v) => set("gradient_mode", v)} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="solid" id="mode-solid" />
                <Label htmlFor="mode-solid" className="font-normal">সলিড কালার</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="gradient" id="mode-gradient" />
                <Label htmlFor="mode-gradient" className="font-normal">গ্র্যাডিয়েন্ট</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* যোগাযোগ তথ্য */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">যোগাযোগ তথ্য</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>ফোন নম্বর</Label>
            <Input placeholder="01985403218" value={val("site_phone")} onChange={(e) => set("site_phone", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>চেকআউট হটলাইন নম্বর <span className="font-normal text-muted-foreground">(কার্ট পেজের উপরে) — খালি রাখলে ফোন নম্বরটাই বসবে</span></Label>
            <Input placeholder="01985403218" value={val("checkout_hotline")} onChange={(e) => set("checkout_hotline", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>WhatsApp নম্বর (কান্ট্রি কোড সহ)</Label>
            <Input placeholder="01985403218" value={val("whatsapp_number")} onChange={(e) => set("whatsapp_number", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>WhatsApp মেসেজ টেমপ্লেট</Label>
            <Input placeholder="আসসালামু আলাইকুম, Dream Mart-এর একটি পণ্য সম্পর্কে জানতে চাই।" value={val("whatsapp_template")} onChange={(e) => set("whatsapp_template", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>ইমেইল</Label>
            <Input placeholder="info@dreammart.com" value={val("site_email")} onChange={(e) => set("site_email", e.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-3 rounded-lg border bg-muted/30 p-4">
            <div>
              <p className="font-medium text-sm">ঠিকানা (Address)</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ইনভয়েস, রিপোর্ট ও পলিসি পেজে যে ঠিকানা বসবে। শুধু ডিফল্ট ঘরটি পূরণ করলে সেটিই দুই ভাষাতেই দেখাবে —
                আলাদা ইংরেজি/বাংলা ঠিকানা দিলে সেই ভাষায় সেটিই অগ্রাধিকার পাবে।
                <br />
                ফুটারে দেখানো ঠিকানা ও ফোন আলাদা — নিচের “ফুটার সেটিংস → ঠিকানা ও ফোন” থেকে বদলান।
              </p>
            </div>
            <div className="space-y-1">
              <Label>ঠিকানা (ডিফল্ট)</Label>
              <Input placeholder="ঢাকা, বাংলাদেশ" value={val("site_address")} onChange={(e) => set("site_address", e.target.value)} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>ঠিকানা (ইংরেজি) <span className="font-normal text-muted-foreground">— ঐচ্ছিক</span></Label>
                <Input placeholder="Dhaka, Bangladesh" value={val("site_address_en")} onChange={(e) => set("site_address_en", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>ঠিকানা (বাংলা) <span className="font-normal text-muted-foreground">— ঐচ্ছিক</span></Label>
                <Input placeholder="ঢাকা, বাংলাদেশ" value={val("site_address_bn")} onChange={(e) => set("site_address_bn", e.target.value)} />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Label>রেগুলার সময় (ইংরেজি)</Label>
            <Input placeholder="Everyday 9:00 AM - 10:00 PM" value={val("business_hours_en")} onChange={(e) => set("business_hours_en", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>রেগুলার সময় (বাংলা)</Label>
            <Input placeholder="প্রতিদিন সকাল ৯টা - রাত ১০টা" value={val("business_hours_bn")} onChange={(e) => set("business_hours_bn", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>রেগুলার সময় (ডিফল্ট)</Label>
            <Input placeholder="প্রতিদিন সকাল ৯টা - রাত ১০টা" value={val("business_hours")} onChange={(e) => set("business_hours", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* টপ ব্যানার (উপরের বার) */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">টপ ব্যানার (উপরের বার)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>ফোন নম্বর (বাঁ পাশে)</Label>
              <Input placeholder="01985403218" value={val("topbar_phone")} onChange={(e) => set("topbar_phone", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>ডান পাশের টেক্সট (ইংরেজি)</Label>
              <Input placeholder="Free Delivery" value={val("topbar_right_text_en")} onChange={(e) => set("topbar_right_text_en", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>ডান পাশের টেক্সট (বাংলা)</Label>
              <Input placeholder="ফ্রি ডেলিভারি" value={val("topbar_right_text_bn")} onChange={(e) => set("topbar_right_text_bn", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>ডান পাশের টেক্সট (ডিফল্ট)</Label>
              <Input placeholder="ফ্রি ডেলিভারি" value={val("topbar_right_text")} onChange={(e) => set("topbar_right_text", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>স্ক্রল করা টেক্সট (ইংরেজি) — <span className="font-normal text-muted-foreground">আলাদা করতে | চিহ্ন ব্যবহার করুন</span></Label>
            <Textarea
              rows={2}
              placeholder="Dream Mart  |  Nationwide Delivery in 2-3 Days  |  Cash on Delivery"
              value={val("topbar_marquee_en")}
              onChange={(e) => set("topbar_marquee_en", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>স্ক্রল করা টেক্সট (বাংলা) — <span className="font-normal text-muted-foreground">আলাদা করতে | চিহ্ন ব্যবহার করুন</span></Label>
            <Textarea
              rows={2}
              placeholder="Dream Mart  |  সারাদেশে ২-৩ দিনে ডেলিভারি  |  Cash on Delivery"
              value={val("topbar_marquee_bn")}
              onChange={(e) => set("topbar_marquee_bn", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>স্ক্রল করা টেক্সট (ডিফল্ট) — <span className="font-normal text-muted-foreground">আলাদা করতে | চিহ্ন ব্যবহার করুন</span></Label>
            <Textarea
              rows={2}
              placeholder="Dream Mart এবং সারাদেশে ২-৩ দিনের মধ্যে ডেলিভারি করা হয়"
              value={val("topbar_marquee")}
              onChange={(e) => set("topbar_marquee", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">খালি রাখলে স্ক্রল টেক্সট দেখাবে না।</p>
          </div>
        </CardContent>
      </Card>

      {/* ফুটার সেটিংস */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">ফুটার সেটিংস</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {/* ফুটারের কোন অংশ দেখাবে */}
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-semibold">ফুটারের অংশগুলো দেখাবে কিনা</p>
            {[
              { key: "footer_show_cta", label: "উপরের CTA ব্যানার", desc: "“যোগাযোগ করুন” বাটনসহ ধূসর অংশটি" },
              { key: "footer_show_logo", label: "ফুটার লোগো", desc: "বাঁ পাশের লোগো ছবিটি" },
              { key: "footer_show_categories", label: "ক্যাটাগরি কলাম", desc: "ফুটারের ক্যাটাগরি তালিকা" },
              { key: "footer_show_links", label: "লিংক কলাম", desc: "ফুটারের লিংক তালিকা" },
              { key: "footer_show_follow", label: "ফলো আস কলাম", desc: "সোশ্যাল আইকনগুলো" },
              { key: "footer_credit_show", label: "ডেভেলপার ক্রেডিট", desc: "নিচের ডান পাশের “Designed and Developed By…” লেখা" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={val(item.key) !== "false"}
                  onCheckedChange={(checked) => set(item.key, checked ? "true" : "false")}
                />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <Label>ফুটার লোগো <span className="font-normal text-muted-foreground">— × চাপলে লোগোটি ফুটার থেকে সরে যাবে</span></Label>
            <SettingsImageUpload
              imageUrl={val("footer_logo")}
              fallbackImageUrl={val("footer_show_logo") !== "false" ? "/assets/uploads/site-settings/dreammart-footer-logo.webp" : undefined}
              onChange={(url) => {
                set("footer_logo", url);
                set("footer_show_logo", "true");
              }}
              onRemove={() => {
                set("footer_logo", "");
                set("footer_show_logo", "false");
              }}
              folder="logo"
              label="ফুটার লোগো আপলোড করুন"
            />
          </div>

          {/* ফুটারের লোগোর নিচের ঠিকানা ও ফোন */}
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div>
              <p className="text-sm font-semibold">ঠিকানা ও ফোন <span className="font-normal text-muted-foreground">(ফুটারের লোগোর নিচে)</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ফুটারের বাঁ পাশে লেখার নিচে যে ঠিকানা ও ফোন নম্বর দেখাবে। খালি রাখলে
                ডিফল্ট ঠিকানা ও নম্বরটাই বসবে। শুধু ডিফল্ট ঘরটি পূরণ করলে সেটিই দুই ভাষাতেই
                দেখাবে — আলাদা ইংরেজি/বাংলা ঠিকানা দিলে সেই ভাষায় সেটিই অগ্রাধিকার পাবে।
              </p>
            </div>
            <div className="space-y-1">
              <Label>ঠিকানা (ডিফল্ট)</Label>
              <Input placeholder="Address-House-26,Road-2,Adabor,Dhaka-1207." value={val("footer_address")} onChange={(e) => set("footer_address", e.target.value)} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>ঠিকানা (ইংরেজি) <span className="font-normal text-muted-foreground">— ঐচ্ছিক</span></Label>
                <Input placeholder="Address-House-26,Road-2,Adabor,Dhaka-1207." value={val("footer_address_en")} onChange={(e) => set("footer_address_en", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>ঠিকানা (বাংলা) <span className="font-normal text-muted-foreground">— ঐচ্ছিক</span></Label>
                <Input placeholder="বাসা-২৬, রোড-২, আদাবর, ঢাকা-১২০৭" value={val("footer_address_bn")} onChange={(e) => set("footer_address_bn", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>ফোন নম্বর</Label>
              <Input placeholder="01680310063" value={val("footer_phone")} onChange={(e) => set("footer_phone", e.target.value)} />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">CTA সেকশন</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>CTA টাইটেল (ইংরেজি)</Label>
                <Input placeholder="Gifts, Crockery & Lifestyle — All in One Place" value={val("footer_cta_title_en")} onChange={(e) => set("footer_cta_title_en", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>CTA টাইটেল (বাংলা)</Label>
                <Input placeholder="গিফট, ক্রোকারিজ ও লাইফস্টাইল — সব এক জায়গায়" value={val("footer_cta_title_bn")} onChange={(e) => set("footer_cta_title_bn", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>CTA টাইটেল (ডিফল্ট)</Label>
                <Input placeholder="গিফট, ক্রোকারিজ ও লাইফস্টাইল — সব এক জায়গায়" value={val("footer_cta_title")} onChange={(e) => set("footer_cta_title", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>CTA সাবটাইটেল (ইংরেজি)</Label>
                <Input placeholder="Original products, nationwide delivery and Cash on Delivery" value={val("footer_cta_subtitle_en")} onChange={(e) => set("footer_cta_subtitle_en", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>CTA সাবটাইটেল (বাংলা)</Label>
                <Input placeholder="অরিজিনাল পণ্য, সারাদেশে ডেলিভারি ও ক্যাশ অন ডেলিভারি" value={val("footer_cta_subtitle_bn")} onChange={(e) => set("footer_cta_subtitle_bn", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>CTA সাবটাইটেল (ডিফল্ট)</Label>
                <Input placeholder="অরিজিনাল পণ্য, সারাদেশে ডেলিভারি ও ক্যাশ অন ডেলিভারি" value={val("footer_cta_subtitle")} onChange={(e) => set("footer_cta_subtitle", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>CTA ফোন নম্বর</Label>
                <Input placeholder="01985403218" value={val("footer_cta_phone")} onChange={(e) => set("footer_cta_phone", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>CTA বাটনের লেখা (ইংরেজি)</Label>
                <Input placeholder="Contact Us ☎" value={val("footer_cta_button_en")} onChange={(e) => set("footer_cta_button_en", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>CTA বাটনের লেখা (বাংলা)</Label>
                <Input placeholder="যোগাযোগ করুন ☎" value={val("footer_cta_button_bn")} onChange={(e) => set("footer_cta_button_bn", e.target.value)} />
              </div>
            </div>
          </div>

          {/* কলামের শিরোনাম */}
          <div>
            <p className="text-sm font-semibold mb-2">কলামের শিরোনাম</p>
            <p className="text-xs text-muted-foreground mb-3">খালি রাখলে ডিফল্ট শিরোনামই দেখাবে (ক্যাটাগরি / লিংক / আমাদের ফলো করুন)।</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>ক্যাটাগরি কলাম (ইংরেজি)</Label>
                <Input placeholder="Categories" value={val("footer_categories_title_en")} onChange={(e) => set("footer_categories_title_en", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>ক্যাটাগরি কলাম (বাংলা)</Label>
                <Input placeholder="ক্যাটাগরি" value={val("footer_categories_title_bn")} onChange={(e) => set("footer_categories_title_bn", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>লিংক কলাম (ইংরেজি)</Label>
                <Input placeholder="Useful Link" value={val("footer_links_title_en")} onChange={(e) => set("footer_links_title_en", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>লিংক কলাম (বাংলা)</Label>
                <Input placeholder="লিংক" value={val("footer_links_title_bn")} onChange={(e) => set("footer_links_title_bn", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>ফলো আস কলাম (ইংরেজি)</Label>
                <Input placeholder="Follow Us" value={val("footer_follow_title_en")} onChange={(e) => set("footer_follow_title_en", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>ফলো আস কলাম (বাংলা)</Label>
                <Input placeholder="আমাদের ফলো করুন" value={val("footer_follow_title_bn")} onChange={(e) => set("footer_follow_title_bn", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label>ফুটার কথা (ইংরেজি - লোগোর নিচে)</Label>
            <Textarea rows={3} placeholder="Dream Mart brings you crockery, bags, watches, lamps, toys and gift items — original products delivered to your doorstep across the country." value={val("footer_blurb_en")} onChange={(e) => set("footer_blurb_en", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>ফুটার কথা (বাংলা - লোগোর নিচে)</Label>
            <Textarea rows={3} placeholder="ড্রিম মার্ট নিয়ে এসেছে ক্রোকারিজ, ব্যাগ, ঘড়ি, ল্যাম্প, খেলনা ও গিফট আইটেম — অরিজিনাল পণ্য সারাদেশে আপনার দোরগোড়ায় পৌঁছে দিই।" value={val("footer_blurb_bn")} onChange={(e) => set("footer_blurb_bn", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>ফুটার কথা (ডিফল্ট - লোগোর নিচে)</Label>
            <Textarea rows={3} placeholder="ড্রিম মার্ট নিয়ে এসেছে ক্রোকারিজ, ব্যাগ, ঘড়ি, ল্যাম্প, খেলনা ও গিফট আইটেম — অরিজিনাল পণ্য সারাদেশে আপনার দোরগোড়ায় পৌঁছে দিই।" value={val("footer_blurb")} onChange={(e) => set("footer_blurb", e.target.value)} />
          </div>

          {/* সোশ্যাল লিংক — প্রতিটি আইকন আলাদা করে চালু/বন্ধ করা যায় */}
          <div>
            <p className="text-sm font-semibold mb-2">সোশ্যাল লিংক (ফলো আস)</p>
            <div className="space-y-3">
              {SOCIAL_FIELDS.map((item) => (
                <div key={item.key} className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label>{item.label} {item.settingKey ? "URL" : <span className="font-normal text-muted-foreground">— উপরের WhatsApp নম্বরটিই ব্যবহার হয়</span>}</Label>
                    {item.settingKey ? (
                      <Input placeholder={item.placeholder} value={val(item.settingKey)} onChange={(e) => set(item.settingKey, e.target.value)} />
                    ) : (
                      <Input disabled value={val("whatsapp_number") || "01985403218"} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 pb-2 shrink-0">
                    <Switch
                      checked={val(`footer_show_${item.key}`) !== "false"}
                      onCheckedChange={(checked) => set(`footer_show_${item.key}`, checked ? "true" : "false")}
                    />
                    <span className="text-xs text-muted-foreground w-10">
                      {val(`footer_show_${item.key}`) !== "false" ? "চালু" : "বন্ধ"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              সুইচ বন্ধ করলে সেই আইকনটি ফুটার থেকে সরে যাবে। URL খালি রাখলে ডিফল্ট প্রোফাইল লিংকে যাবে।
            </p>
          </div>

          {/* ক্যাটাগরি কলাম */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">ক্যাটাগরি কলাম</p>
            <RadioGroup
              value={val("footer_category_mode") === "manual" ? "manual" : "auto"}
              onValueChange={(v) => set("footer_category_mode", v)}
              className="flex flex-wrap gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="auto" id="footer-cat-auto" />
                <Label htmlFor="footer-cat-auto" className="font-normal">ন্যাভবারের ক্যাটাগরি থেকে (অটো)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="manual" id="footer-cat-manual" />
                <Label htmlFor="footer-cat-manual" className="font-normal">নিজে হাতে লিংক সাজাব</Label>
              </div>
            </RadioGroup>

            {val("footer_category_mode") === "manual" ? (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  বাংলা লেবেল, ইংরেজি লেবেল ও লিংক দিন। তীর চিহ্ন দিয়ে ক্রম বদলানো যায়।
                </p>
                <LinkListEditor value={categoryLinks} onChange={setCategoryLinks} bilingual />
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  ন্যাভবারে দেখানো ক্যাটাগরিগুলোর মধ্যে কোনগুলো ফুটারে দেখাবে তা বেছে নিন।
                  নতুন ক্যাটাগরি যোগ বা ক্রম বদলাতে ক্যাটাগরি পেজে যান।
                </p>
                {navCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">ন্যাভবারে দেখানোর মতো কোনো ক্যাটাগরি পাওয়া যায়নি।</p>
                ) : (
                  navCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{cat.name_bn || cat.name}</p>
                        <p className="text-xs text-muted-foreground truncate">/category/{cat.slug}</p>
                      </div>
                      <Switch
                        checked={!hiddenCategories.includes(cat.slug)}
                        onCheckedChange={(checked) => toggleFooterCategory(cat.slug, checked)}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* লিংক কলাম */}
          <div>
            <p className="text-sm font-semibold mb-2">লিংক কলাম</p>
            <p className="text-xs text-muted-foreground mb-2">
              বাংলা লেবেল, ইংরেজি লেবেল ও লিংক দিন। তীর চিহ্ন দিয়ে ক্রম বদলানো যায়।
            </p>
            <LinkListEditor value={importantLinks} onChange={setImportantLinks} bilingual labelPlaceholder="রিটার্ন পলিসি" labelEnPlaceholder="Return Policy" urlPlaceholder="/page/return-policy" />
          </div>

          <div className="space-y-1">
            <Label>কপিরাইট টেক্সট (ইংরেজি)</Label>
            <Input placeholder="© 2026 Dream Mart. All rights reserved." value={val("copyright_text_en")} onChange={(e) => set("copyright_text_en", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>কপিরাইট টেক্সট (বাংলা)</Label>
            <Input placeholder="© ২০২৬ ড্রিম মার্ট। সকল অধিকার সংরক্ষিত।" value={val("copyright_text_bn")} onChange={(e) => set("copyright_text_bn", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>কপিরাইট টেক্সট (ডিফল্ট)</Label>
            <Input placeholder="© ২০২৬ ড্রিম মার্ট। সকল অধিকার সংরক্ষিত।" value={val("copyright_text")} onChange={(e) => set("copyright_text", e.target.value)} />
          </div>

          {/* ডেভেলপার ক্রেডিট (নিচের ডান পাশে) */}
          <div>
            <p className="text-sm font-semibold mb-2">ডেভেলপার ক্রেডিট</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>আগের লেখা</Label>
                <Input placeholder="Designed and Developed By" value={val("footer_credit_text")} onChange={(e) => set("footer_credit_text", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>প্রতিষ্ঠানের নাম</Label>
                <Input placeholder="Digital Webars" value={val("footer_credit_name")} onChange={(e) => set("footer_credit_name", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>লিংক (URL)</Label>
                <Input placeholder="https://digitalwebars.com" value={val("footer_credit_url")} onChange={(e) => set("footer_credit_url", e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              পুরো লেখাটি লুকাতে উপরের “ফুটারের অংশগুলো দেখাবে কিনা” অংশ থেকে ডেভেলপার ক্রেডিট সুইচটি বন্ধ করুন।
            </p>
          </div>
        </CardContent>
      </Card>

      {/* হোমপেজ সেকশন দৃশ্যমানতা */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">হোমপেজ সেকশন দৃশ্যমানতা</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "show_category_section", label: "ক্যাটাগরি সেকশন", desc: "হোমপেজে 'আপনার ক্যাটাগরি খুঁজুন' অংশটি দেখাবে কিনা" },
            { key: "show_trending_section", label: "ট্রেন্ডিং প্রোডাক্ট সেকশন", desc: "হোমপেজে ক্যাটাগরি-ভিত্তিক প্রোডাক্ট অংশ দেখাবে কিনা" },
            { key: "show_offer_section", label: "বিশেষ অফার সেকশন", desc: "হোমপেজে 'অফারে কিনুন' অংশটি দেখাবে কিনা" },
            { key: "show_flashsale_section", label: "ফ্ল্যাশ সেল সেকশন", desc: "অফার সেকশনে কাউন্টডাউন টাইমার দেখাবে কিনা" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={val(item.key) !== "false"}
                onCheckedChange={(checked) => set(item.key, checked ? "true" : "false")}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* স্মার্ট ফিচার / ইন্টিগ্রেশন */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">স্মার্ট ফিচার</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">ছবি দিয়ে প্রোডাক্ট খোঁজা (Visual Search)</p>
              <p className="text-xs text-muted-foreground">হেডারের ক্যামেরা বাটন — বন্ধ করলে সাইট থেকে লুকিয়ে যাবে</p>
            </div>
            <Switch
              checked={val("visual_search_enabled") !== "false"}
              onCheckedChange={(checked) => set("visual_search_enabled", checked ? "true" : "false")}
            />
          </div>

          <div className="space-y-1.5 border-t pt-4">
            <Label>OpenAI API Key (ছবি দিয়ে খোঁজার জন্য প্রয়োজন)</Label>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder={val("openai_api_key") === "***" ? "•••••••• (সেভ করা আছে — বদলাতে চাইলে নতুন key দিন)" : "sk-... আপনার OpenAI API key"}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {val("openai_api_key") === "***"
                ? "✓ একটি key সেভ করা আছে। খালি রাখলে আগেরটাই থাকবে।"
                : "এখনো কোনো key দেওয়া হয়নি। platform.openai.com থেকে key নিয়ে এখানে বসান।"}
              {" "}নিরাপত্তার জন্য key কখনো সাইটে দেখানো হয় না।
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 border-t pt-4">
            <div>
              <p className="text-sm font-medium">লাইভ চ্যাট (Live Support)</p>
              <p className="text-xs text-muted-foreground">সাইটের নিচে ভাসমান চ্যাট বাটন — বন্ধ করলে দেখাবে না</p>
            </div>
            <Switch
              checked={val("live_chat_enabled") !== "false"}
              onCheckedChange={(checked) => set("live_chat_enabled", checked ? "true" : "false")}
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t pt-4">
            <div>
              <p className="text-sm font-medium">সেলস নোটিফিকেশন ("অমুক কিনেছেন")</p>
              <p className="text-xs text-muted-foreground">নিচে বাঁ দিকে ভেসে ওঠা ক্রয়ের পপআপ — আপনার আসল পণ্য দেখায়</p>
            </div>
            <Switch
              checked={val("sales_notification_enabled") !== "false"}
              onCheckedChange={(checked) => set("sales_notification_enabled", checked ? "true" : "false")}
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO / মেটা তথ্য */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">SEO / মেটা তথ্য</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>পেজ টাইটেল (ব্রাউজার ট্যাব)</Label>
            <Input placeholder="Dream Mart — Gift, Crockery, Bag & Watch Online Shop" value={val("seo_title")} onChange={(e) => set("seo_title", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>মেটা ডেসক্রিপশন</Label>
            <Textarea rows={3} placeholder="Buy crockery, ladies & mens bags, watches, wall clocks, lamps, baby toys and gift items online at Dream Mart. Original products, nationwide delivery, Cash on Delivery." value={val("seo_description")} onChange={(e) => set("seo_description", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>OG ইমেজ</Label>
            <SettingsImageUpload imageUrl={val("seo_og_image")} onChange={(url) => set("seo_og_image", url)} folder="og" label="OG ইমেজ আপলোড করুন" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
