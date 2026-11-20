import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const trackingFields = [
  {
    category: "Facebook",
    items: [
      { key: "facebook_pixel", label: "Facebook Pixel ID" },
      { key: "facebook_access_token", label: "Facebook Access Token" },
      { key: "facebook_capi_token", label: "Facebook Conversion API (CAPI) Token" }
    ]
  },
  {
    category: "Google",
    items: [
      { key: "google_analytics", label: "Google Analytics ID (GA4)" },
      { key: "google_ads", label: "Google Ads Conversion ID" },
      { key: "google_ads_conversion_label", label: "Google Ads Conversion Label" },
      { key: "google_tag_manager", label: "Google Tag Manager ID" }
    ]
  },
  {
    category: "TikTok",
    items: [
      { key: "tiktok_pixel", label: "TikTok Pixel ID" },
      { key: "tiktok_access_token", label: "TikTok Access Token (Server-side)" }
    ]
  },
  {
    category: "Other",
    items: [
      { key: "google_search_console", label: "Google Search Console Verification Code" }
    ]
  }
];

const allTrackingKeys = trackingFields.flatMap((g) => g.items.map((i) => i.key));

export default function TrackingSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingKeys, setExistingKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { refreshSettings } = useSiteSettings();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    // group_name দিয়ে না খুঁজে key দিয়ে খোঁজা হয় — কিছু key অন্য group-এ (যেমন "pixels") সেভ থাকতে পারে,
    // তখন group filter-এ সেগুলো মিস হয়ে insert চেষ্টা হতো এবং unique key error-এ save ব্যর্থ হতো
    const { data } = await supabase.from("site_settings").select("*").in("key", allTrackingKeys);
    const map: Record<string, string> = {};
    const keys = new Set<string>();
    data?.forEach((s: any) => {
      map[s.key] = s.value || "";
      keys.add(s.key);
    });
    setSettings(map);
    setExistingKeys(keys);
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      for (const key of allTrackingKeys) {
        const value = settings[key] || "";
        const { error } = existingKeys.has(key)
          ? await supabase.from("site_settings").update({ value }).eq("key", key)
          : await supabase.from("site_settings").insert({ key, value, group_name: "tracking" });
        if (error) throw new Error((error as any)?.message || `"${key}" সেভ করা যায়নি`);
      }

      toast({ title: "সেটিংস সেভ হয়েছে ✅" });
      await loadSettings();
      await refreshSettings();
    } catch (error: any) {
      toast({ title: "সেভ করতে সমস্যা হয়েছে", description: error?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ট্র্যাকিং ও এনালাইটিক্স</h1>
        <p className="text-sm text-muted-foreground mt-0.5">সব ট্র্যাকিং পিক্সেল ও এনালাইটিক্স সেটআপ করুন</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6">
          {trackingFields.map((group) => (
            <Card key={group.category} className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{group.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.items.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label>{field.label}</Label>
                    <Input
                      value={settings[field.key] || ""}
                      onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                      placeholder={`${field.label} লিখুন...`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={save} disabled={saving} className="rounded-full">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
